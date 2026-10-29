-- Allow authenticated workspace users to use existing Relworx tables.
-- (Anon seed data was readable; JWT sessions need matching policies.)

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
      execute format('alter table public.%I enable row level security', t);

      execute format('drop policy if exists %I on public.%I', t || '_select_auth', t);
      execute format(
        'create policy %I on public.%I for select to authenticated using (true)',
        t || '_select_auth',
        t
      );

      execute format('drop policy if exists %I on public.%I', t || '_insert_auth', t);
      execute format(
        'create policy %I on public.%I for insert to authenticated with check (true)',
        t || '_insert_auth',
        t
      );

      execute format('drop policy if exists %I on public.%I', t || '_update_auth', t);
      execute format(
        'create policy %I on public.%I for update to authenticated using (true) with check (true)',
        t || '_update_auth',
        t
      );

      execute format('drop policy if exists %I on public.%I', t || '_delete_auth', t);
      execute format(
        'create policy %I on public.%I for delete to authenticated using (true)',
        t || '_delete_auth',
        t
      );
    end if;
  end loop;
end $$;
