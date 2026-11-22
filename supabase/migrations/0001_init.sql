create extension if not exists pgcrypto;

create type public.post_kind as enum ('art', 'work', 'research', 'note', 'milestone');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,30}$'),
  display_name text not null,
  headline text not null default '',
  practice text not null default '',
  bio text not null default '',
  location text not null default '',
  links jsonb not null default '[]'::jsonb,
  avatar_path text,
  cover_path text,
  created_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  kind public.post_kind not null,
  title text,
  body text not null check (char_length(body) <= 5000),
  media jsonb not null default '[]'::jsonb,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_created_at_idx on public.posts (created_at desc);
create index posts_author_idx on public.posts (author_id, created_at desc);
create index posts_tags_idx on public.posts using gin (tags);

create table public.post_likes (
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table public.post_bookmarks (
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index comments_post_idx on public.comments (post_id, created_at);

create table public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger posts_set_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  desired_username text;
begin
  desired_username := lower(coalesce(new.raw_user_meta_data->>'username', 'maker_' || substr(new.id::text, 1, 8)));
  if not (desired_username ~ '^[a-z0-9_]{3,30}$') then
    desired_username := 'maker_' || substr(new.id::text, 1, 8);
  end if;

  insert into public.profiles (id, username, display_name, headline, practice)
  values (
    new.id,
    desired_username,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(coalesce(new.email, 'maker'), '@', 1)),
    coalesce(new.raw_user_meta_data->>'headline', ''),
    coalesce(new.raw_user_meta_data->>'practice', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_bookmarks enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;

create policy "profiles are public" on public.profiles for select using (true);
create policy "owners insert profiles" on public.profiles for insert with check (id = auth.uid());
create policy "owners update profiles" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy "posts are public" on public.posts for select using (true);
create policy "authors insert posts" on public.posts for insert with check (author_id = auth.uid());
create policy "authors update posts" on public.posts for update using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "authors delete posts" on public.posts for delete using (author_id = auth.uid());

create policy "likes are public" on public.post_likes for select using (true);
create policy "users insert own likes" on public.post_likes for insert with check (user_id = auth.uid());
create policy "users delete own likes" on public.post_likes for delete using (user_id = auth.uid());

create policy "bookmarks are private" on public.post_bookmarks for select using (user_id = auth.uid());
create policy "users insert own bookmarks" on public.post_bookmarks for insert with check (user_id = auth.uid());
create policy "users delete own bookmarks" on public.post_bookmarks for delete using (user_id = auth.uid());

create policy "comments are public" on public.comments for select using (true);
create policy "authors insert comments" on public.comments for insert with check (author_id = auth.uid());
create policy "authors update comments" on public.comments for update using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "authors delete comments" on public.comments for delete using (author_id = auth.uid());

create policy "follows are public" on public.follows for select using (true);
create policy "users insert own follows" on public.follows for insert with check (follower_id = auth.uid());
create policy "users delete own follows" on public.follows for delete using (follower_id = auth.uid());

grant usage on schema public to anon, authenticated;
grant select on public.profiles, public.posts, public.post_likes, public.post_bookmarks, public.comments, public.follows to anon, authenticated;
grant insert, update, delete on public.profiles to authenticated;
grant insert, update, delete on public.posts to authenticated;
grant insert, delete on public.post_likes to authenticated;
grant insert, delete on public.post_bookmarks to authenticated;
grant insert, update, delete on public.comments to authenticated;
grant insert, delete on public.follows to authenticated;

create view public.post_stats with (security_invoker = true) as
select
  p.id as post_id,
  (select count(*) from public.post_likes l where l.post_id = p.id)::int as likes,
  (select count(*) from public.comments c where c.post_id = p.id)::int as comments,
  (select count(*) from public.post_bookmarks b where b.post_id = p.id)::int as bookmarks
from public.posts p;

grant select on public.post_stats to anon, authenticated;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true), ('post-media', 'post-media', true)
on conflict (id) do nothing;

create policy "avatar images are public" on storage.objects for select using (bucket_id = 'avatars');
create policy "users upload own avatar" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "users update own avatar" on storage.objects for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "users delete own avatar" on storage.objects for delete using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "post images are public" on storage.objects for select using (bucket_id = 'post-media');
create policy "users upload own post images" on storage.objects for insert with check (bucket_id = 'post-media' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "users update own post images" on storage.objects for update using (bucket_id = 'post-media' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "users delete own post images" on storage.objects for delete using (bucket_id = 'post-media' and auth.uid()::text = (storage.foldername(name))[1]);
