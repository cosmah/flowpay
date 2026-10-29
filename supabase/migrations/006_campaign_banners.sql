-- Manual campaign posts: banner image URLs + storage for uploads.

alter table public.campaigns
  add column if not exists banner_urls text[] not null default '{}';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'campaign-banners',
  'campaign-banners',
  true,
  10485760,
  array[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/avif',
    'image/heic',
    'image/heif'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "campaign_banners_select" on storage.objects;
create policy "campaign_banners_select"
  on storage.objects for select to authenticated, anon
  using (bucket_id = 'campaign-banners');

drop policy if exists "campaign_banners_insert" on storage.objects;
create policy "campaign_banners_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'campaign-banners');

drop policy if exists "campaign_banners_update" on storage.objects;
create policy "campaign_banners_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'campaign-banners')
  with check (bucket_id = 'campaign-banners');

drop policy if exists "campaign_banners_delete" on storage.objects;
create policy "campaign_banners_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'campaign-banners');
