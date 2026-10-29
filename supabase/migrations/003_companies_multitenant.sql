-- Multi-tenant companies: registering user becomes admin and owns a company.

create extension if not exists pgcrypto;

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists companies_slug_idx on public.companies (slug);

-- Widen roles to include admin; add company_id
alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add column if not exists company_id uuid references public.companies (id) on delete set null;

alter table public.profiles
  alter column role set default 'marketer';

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('admin', 'marketer', 'reviewer'));

create index if not exists profiles_company_id_idx on public.profiles (company_id);

-- Pending invites (admin-only creation)
create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  email text not null,
  role text not null check (role in ('marketer', 'reviewer')),
  invited_by uuid references public.profiles (id) on delete set null,
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'revoked')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

create unique index if not exists invitations_pending_email_company_idx
  on public.invitations (company_id, lower(email))
  where status = 'pending';

-- Tenant column on domain tables (nullable for legacy seed rows)
alter table public.campaigns
  add column if not exists company_id uuid references public.companies (id) on delete cascade;

alter table public.tasks
  add column if not exists company_id uuid references public.companies (id) on delete cascade;

alter table public.content_items
  add column if not exists company_id uuid references public.companies (id) on delete cascade;

alter table public.library
  add column if not exists company_id uuid references public.companies (id) on delete cascade;

alter table public.reviews
  add column if not exists company_id uuid references public.companies (id) on delete cascade;

alter table public.test_sends
  add column if not exists company_id uuid references public.companies (id) on delete cascade;

create or replace function public.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id from public.profiles where id = auth.uid()
$$;

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.slugify(input text)
returns text
language plpgsql
immutable
as $$
declare
  s text;
begin
  s := lower(trim(input));
  s := regexp_replace(s, '[^a-z0-9]+', '-', 'g');
  s := trim(both '-' from s);
  if s = '' then
    s := 'company';
  end if;
  return left(s, 48);
end;
$$;

-- Replace signup trigger: admin creates company; invite token joins company
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_name text;
  meta_role text;
  meta_company text;
  invite_token text;
  invite_row public.invitations%rowtype;
  new_company_id uuid;
  base_slug text;
  final_slug text;
  i int := 0;
begin
  meta_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    split_part(new.email, '@', 1)
  );
  meta_role := coalesce(nullif(trim(new.raw_user_meta_data ->> 'role'), ''), 'admin');
  meta_company := nullif(trim(new.raw_user_meta_data ->> 'company_name'), '');
  invite_token := nullif(trim(new.raw_user_meta_data ->> 'invite_token'), '');

  if invite_token is not null then
    select * into invite_row
    from public.invitations
    where token = invite_token and status = 'pending'
    limit 1;

    if invite_row.id is null then
      raise exception 'Invalid or expired invite';
    end if;

    insert into public.profiles (id, name, email, role, status, company_id)
    values (
      new.id,
      meta_name,
      lower(new.email),
      invite_row.role,
      'active',
      invite_row.company_id
    )
    on conflict (id) do update
      set
        name = excluded.name,
        email = excluded.email,
        role = excluded.role,
        company_id = excluded.company_id,
        status = 'active',
        updated_at = now();

    update public.invitations
      set status = 'accepted', accepted_at = now()
      where id = invite_row.id;

    return new;
  end if;

  -- Self-serve registration: always company admin
  if meta_role not in ('admin', 'marketer', 'reviewer') then
    meta_role := 'admin';
  end if;
  meta_role := 'admin';
  meta_company := coalesce(meta_company, meta_name || '''s company');

  base_slug := public.slugify(meta_company);
  final_slug := base_slug;
  while exists (select 1 from public.companies where slug = final_slug) loop
    i := i + 1;
    final_slug := base_slug || '-' || i::text;
  end loop;

  insert into public.companies (name, slug, created_by)
  values (meta_company, final_slug, new.id)
  returning id into new_company_id;

  insert into public.profiles (id, name, email, role, status, company_id)
  values (new.id, meta_name, lower(new.email), 'admin', 'active', new_company_id)
  on conflict (id) do update
    set
      name = excluded.name,
      email = excluded.email,
      role = 'admin',
      company_id = excluded.company_id,
      status = 'active',
      updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS: companies
alter table public.companies enable row level security;

drop policy if exists "companies_select_member" on public.companies;
create policy "companies_select_member"
  on public.companies for select to authenticated
  using (id = public.current_company_id());

drop policy if exists "companies_update_admin" on public.companies;
create policy "companies_update_admin"
  on public.companies for update to authenticated
  using (id = public.current_company_id() and public.current_role() = 'admin')
  with check (id = public.current_company_id() and public.current_role() = 'admin');

-- RLS: profiles — same company only
drop policy if exists "profiles_select_authenticated" on public.profiles;
drop policy if exists "profiles_select_company" on public.profiles;
create policy "profiles_select_company"
  on public.profiles for select to authenticated
  using (
    company_id = public.current_company_id()
    or id = auth.uid()
  );

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (
    id = auth.uid()
    or (company_id = public.current_company_id() and public.current_role() = 'admin')
  )
  with check (
    id = auth.uid()
    or (company_id = public.current_company_id() and public.current_role() = 'admin')
  );

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());

-- RLS: invitations — company scoped; admin write
alter table public.invitations enable row level security;

drop policy if exists "invitations_select_company" on public.invitations;
create policy "invitations_select_company"
  on public.invitations for select to authenticated
  using (company_id = public.current_company_id());

drop policy if exists "invitations_insert_admin" on public.invitations;
create policy "invitations_insert_admin"
  on public.invitations for insert to authenticated
  with check (
    company_id = public.current_company_id()
    and public.current_role() = 'admin'
  );

drop policy if exists "invitations_update_admin" on public.invitations;
create policy "invitations_update_admin"
  on public.invitations for update to authenticated
  using (
    company_id = public.current_company_id()
    and public.current_role() = 'admin'
  )
  with check (
    company_id = public.current_company_id()
    and public.current_role() = 'admin'
  );

-- Domain tables: company isolation (legacy null company_id visible only to no one except service role)
do $$
declare
  t text;
begin
  foreach t in array array[
    'campaigns',
    'content_items',
    'reviews',
    'tasks',
    'library',
    'test_sends'
  ]
  loop
    if to_regclass('public.' || t) is not null then
      execute format('drop policy if exists %I on public.%I', t || '_select_auth', t);
      execute format('drop policy if exists %I on public.%I', t || '_insert_auth', t);
      execute format('drop policy if exists %I on public.%I', t || '_update_auth', t);
      execute format('drop policy if exists %I on public.%I', t || '_delete_auth', t);
      execute format('drop policy if exists %I on public.%I', t || '_select_company', t);
      execute format('drop policy if exists %I on public.%I', t || '_insert_company', t);
      execute format('drop policy if exists %I on public.%I', t || '_update_company', t);
      execute format('drop policy if exists %I on public.%I', t || '_delete_company', t);

      execute format(
        'create policy %I on public.%I for select to authenticated using (company_id = public.current_company_id())',
        t || '_select_company', t
      );
      execute format(
        'create policy %I on public.%I for insert to authenticated with check (company_id = public.current_company_id())',
        t || '_insert_company', t
      );
      execute format(
        'create policy %I on public.%I for update to authenticated using (company_id = public.current_company_id()) with check (company_id = public.current_company_id())',
        t || '_update_company', t
      );
      execute format(
        'create policy %I on public.%I for delete to authenticated using (company_id = public.current_company_id())',
        t || '_delete_company', t
      );
    end if;
  end loop;
end $$;
