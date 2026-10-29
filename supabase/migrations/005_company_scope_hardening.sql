-- Harden multi-tenant isolation: immutable company_id, same-company FKs,
-- invite email bind, NOT NULL domain company_id where safe.

-- 1) Profiles: cannot hop companies or self-escalate role
create or replace function public.protect_profile_tenant()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' then
    if new.company_id is distinct from old.company_id
       and old.company_id is not null then
      raise exception 'profile company_id cannot be changed';
    end if;

    if new.role is distinct from old.role then
      if public.current_role() is distinct from 'admin'
         or old.company_id is distinct from public.current_company_id() then
        raise exception 'Only company admins can change member roles';
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_profile_tenant on public.profiles;
create trigger trg_protect_profile_tenant
  before update on public.profiles
  for each row execute function public.protect_profile_tenant();

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (
    id = auth.uid()
    or (company_id = public.current_company_id() and public.current_role() = 'admin')
  )
  with check (
    (
      id = auth.uid()
      and company_id is not distinct from public.current_company_id()
      and role = public.current_role()
    )
    or (
      company_id = public.current_company_id()
      and public.current_role() = 'admin'
    )
  );

-- Self insert cannot claim another company
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert to authenticated
  with check (
    id = auth.uid()
    and (
      company_id is null
      or company_id = public.current_company_id()
    )
  );

-- 2) Campaigns: project must belong to same company
create or replace function public.enforce_same_company_project()
returns trigger
language plpgsql
as $$
declare
  project_company uuid;
begin
  if new.project_id is null then
    return new;
  end if;

  select company_id into project_company
  from public.projects
  where id = new.project_id;

  if project_company is null then
    raise exception 'Campaign project not found';
  end if;

  if new.company_id is null then
    new.company_id := project_company;
  elsif new.company_id is distinct from project_company then
    raise exception 'Campaign project must belong to the same company';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_campaign_project_company on public.campaigns;
create trigger trg_campaign_project_company
  before insert or update of project_id, company_id on public.campaigns
  for each row execute function public.enforce_same_company_project();

-- Child rows: inherit / match parent campaign company
create or replace function public.enforce_child_campaign_company()
returns trigger
language plpgsql
as $$
declare
  parent_company uuid;
begin
  if new.campaign_id is null then
    return new;
  end if;

  select company_id into parent_company
  from public.campaigns
  where id = new.campaign_id;

  if parent_company is null then
    raise exception 'Parent campaign not found';
  end if;

  if new.company_id is null then
    new.company_id := parent_company;
  elsif new.company_id is distinct from parent_company then
    raise exception 'Row company must match campaign company';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_content_campaign_company on public.content_items;
create trigger trg_content_campaign_company
  before insert or update of campaign_id, company_id on public.content_items
  for each row execute function public.enforce_child_campaign_company();

drop trigger if exists trg_tasks_campaign_company on public.tasks;
create trigger trg_tasks_campaign_company
  before insert or update of campaign_id, company_id on public.tasks
  for each row execute function public.enforce_child_campaign_company();

drop trigger if exists trg_library_campaign_company on public.library;
create trigger trg_library_campaign_company
  before insert or update of campaign_id, company_id on public.library
  for each row execute function public.enforce_child_campaign_company();

create or replace function public.enforce_review_company()
returns trigger
language plpgsql
as $$
declare
  parent_company uuid;
begin
  select ci.company_id into parent_company
  from public.content_items ci
  where ci.id = new.content_item_id;

  if parent_company is null then
    raise exception 'Content item not found';
  end if;

  if new.company_id is null then
    new.company_id := parent_company;
  elsif new.company_id is distinct from parent_company then
    raise exception 'Review company must match content company';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_reviews_company on public.reviews;
create trigger trg_reviews_company
  before insert or update of content_item_id, company_id on public.reviews
  for each row execute function public.enforce_review_company();

create or replace function public.enforce_test_send_company()
returns trigger
language plpgsql
as $$
declare
  parent_company uuid;
begin
  select company_id into parent_company
  from public.library
  where id = new.library_item_id;

  if parent_company is null then
    raise exception 'Library item not found';
  end if;

  if new.company_id is null then
    new.company_id := parent_company;
  elsif new.company_id is distinct from parent_company then
    raise exception 'Test send company must match library company';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_test_sends_company on public.test_sends;
create trigger trg_test_sends_company
  before insert or update of library_item_id, company_id on public.test_sends
  for each row execute function public.enforce_test_send_company();

-- 3) Invite acceptance: email must match invite
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

    if lower(new.email) is distinct from lower(invite_row.email) then
      raise exception 'Invite email does not match signup email';
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

-- 4) Require company_id on domain tables (drop orphan nulls first)
delete from public.test_sends where company_id is null;
delete from public.reviews where company_id is null;
delete from public.library where company_id is null;
delete from public.tasks where company_id is null;
delete from public.content_items where company_id is null;
delete from public.campaigns where company_id is null;

alter table public.campaigns alter column company_id set not null;
alter table public.tasks alter column company_id set not null;
alter table public.content_items alter column company_id set not null;
alter table public.library alter column company_id set not null;
alter table public.reviews alter column company_id set not null;
alter table public.test_sends alter column company_id set not null;
