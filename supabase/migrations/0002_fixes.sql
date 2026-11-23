create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  desired_username text;
  candidate text;
  suffix text;
begin
  desired_username := lower(coalesce(new.raw_user_meta_data->>'username', 'maker_' || substr(new.id::text, 1, 8)));
  if desired_username !~ '^[a-z0-9_]{3,30}$' then
    desired_username := 'maker_' || substr(new.id::text, 1, 8);
  end if;

  candidate := desired_username;
  while exists (select 1 from public.profiles where username = candidate) loop
    suffix := substr(replace(gen_random_uuid()::text, '-', ''), 1, 5);
    candidate := left(desired_username, 24) || '_' || suffix;
  end loop;

  insert into public.profiles (id, username, display_name, headline, practice)
  values (
    new.id,
    candidate,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(coalesce(new.email, 'maker'), '@', 1)),
    coalesce(new.raw_user_meta_data->>'headline', ''),
    coalesce(new.raw_user_meta_data->>'practice', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop view if exists public.post_stats;
create view public.post_stats as
select
  p.id as post_id,
  (select count(*) from public.post_likes l where l.post_id = p.id)::int as likes,
  (select count(*) from public.comments c where c.post_id = p.id)::int as comments,
  (select count(*) from public.post_bookmarks b where b.post_id = p.id)::int as bookmarks
from public.posts p;
grant select on public.post_stats to anon, authenticated;

update storage.buckets
set file_size_limit = 8388608,
    allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
where id = 'post-media';

update storage.buckets
set file_size_limit = 4194304,
    allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
where id = 'avatars';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'posts_title_length') then
    alter table public.posts add constraint posts_title_length check (title is null or char_length(title) <= 160);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_display_name_length') then
    alter table public.profiles add constraint profiles_display_name_length check (char_length(display_name) between 1 and 80);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_headline_length') then
    alter table public.profiles add constraint profiles_headline_length check (char_length(headline) <= 160);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_practice_length') then
    alter table public.profiles add constraint profiles_practice_length check (char_length(practice) <= 80);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_location_length') then
    alter table public.profiles add constraint profiles_location_length check (char_length(location) <= 80);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_bio_length') then
    alter table public.profiles add constraint profiles_bio_length check (char_length(bio) <= 500);
  end if;
end $$;

create or replace function public.check_comment_parent()
returns trigger
language plpgsql
as $$
begin
  if new.parent_id is not null and not exists (
    select 1 from public.comments where id = new.parent_id and post_id = new.post_id
  ) then
    raise exception 'Parent comment must belong to the same post';
  end if;
  return new;
end;
$$;

drop trigger if exists comments_same_post on public.comments;
create trigger comments_same_post
before insert or update of post_id, parent_id on public.comments
for each row execute function public.check_comment_parent();

revoke delete on public.profiles from authenticated;
