-- Per-channel library versions for approved posts.

alter table public.library
  add column if not exists channel text;

create index if not exists library_channel_idx on public.library (channel);
