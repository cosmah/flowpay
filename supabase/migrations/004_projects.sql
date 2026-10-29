-- Projects belong to a company; campaigns belong to a project.

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  description text not null default '',
  status text not null default 'active'
    check (status in ('active', 'paused', 'archived')),
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_company_id_idx on public.projects (company_id);

alter table public.campaigns
  add column if not exists project_id uuid references public.projects (id) on delete set null;

create index if not exists campaigns_project_id_idx on public.campaigns (project_id);

alter table public.projects enable row level security;

drop policy if exists "projects_select_company" on public.projects;
create policy "projects_select_company"
  on public.projects for select to authenticated
  using (company_id = public.current_company_id());

drop policy if exists "projects_insert_company" on public.projects;
create policy "projects_insert_company"
  on public.projects for insert to authenticated
  with check (company_id = public.current_company_id());

drop policy if exists "projects_update_company" on public.projects;
create policy "projects_update_company"
  on public.projects for update to authenticated
  using (company_id = public.current_company_id())
  with check (company_id = public.current_company_id());

drop policy if exists "projects_delete_company" on public.projects;
create policy "projects_delete_company"
  on public.projects for delete to authenticated
  using (company_id = public.current_company_id());
