set search_path = public, extensions;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at)
values
  ('11111111-1111-4111-8111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'maya@commonplace.demo', crypt('password123', gen_salt('bf')), now(), '{"username":"maya","display_name":"Maya Ibarra","headline":"Printmaker and installation artist","practice":"Visual art"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb, now(), now()),
  ('22222222-2222-4222-8222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'theo@commonplace.demo', crypt('password123', gen_salt('bf')), now(), '{"username":"theo","display_name":"Theo Ansah","headline":"PhD candidate, environmental history","practice":"Academic research"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb, now(), now()),
  ('33333333-3333-4333-8333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'nadia@commonplace.demo', crypt('password123', gen_salt('bf')), now(), '{"username":"nadia","display_name":"Nadia Okafor","headline":"Independent product designer","practice":"Design"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb, now(), now()),
  ('44444444-4444-4444-8444-444444444444', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'jules@commonplace.demo', crypt('password123', gen_salt('bf')), now(), '{"username":"jules","display_name":"Jules Moreau","headline":"Essayist and newsletter writer","practice":"Writing"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb, now(), now()),
  ('55555555-5555-4555-8555-555555555555', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sam@commonplace.demo', crypt('password123', gen_salt('bf')), now(), '{"username":"sam","display_name":"Sam Vale","headline":"Community archivist","practice":"Archives"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb, now(), now()),
  ('66666666-6666-4666-8666-666666666666', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ren@commonplace.demo', crypt('password123', gen_salt('bf')), now(), '{"username":"ren","display_name":"Ren Aoki","headline":"Sound artist and field recordist","practice":"Sound"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb, now(), now())
on conflict (id) do nothing;

update auth.users
set
  confirmation_token = coalesce(confirmation_token, ''),
  recovery_token = coalesce(recovery_token, ''),
  email_change = coalesce(email_change, ''),
  email_change_token_new = coalesce(email_change_token_new, ''),
  email_change_token_current = coalesce(email_change_token_current, ''),
  phone_change = coalesce(phone_change, ''),
  phone_change_token = coalesce(phone_change_token, ''),
  reauthentication_token = coalesce(reauthentication_token, '')
where email like '%@commonplace.demo';

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select
  gen_random_uuid(),
  u.id,
  u.id::text,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email',
  now(),
  now(),
  now()
from auth.users u
where u.email like '%@commonplace.demo'
  and not exists (
    select 1 from auth.identities i
    where i.user_id = u.id and i.provider = 'email'
  );

insert into public.profiles (id, username, display_name, headline, practice, bio, location, links, created_at)
values
  ('11111111-1111-4111-8111-111111111111', 'maya', 'Maya Ibarra', 'Printmaker and installation artist', 'Visual art', 'I make large relief prints about weather, labor, and the small things that survive in the margins of a city. Currently printing at a shared studio in Oaxaca.', 'Oaxaca, MX', '[{"label":"Studio","url":"https://example.com/maya"}]'::jsonb, now() - interval '240 days'),
  ('22222222-2222-4222-8222-222222222222', 'theo', 'Theo Ansah', 'PhD candidate, environmental history', 'Academic research', 'Studying how coastal communities kept records before the paperwork became official. Field notes, scans, and arguments in progress.', 'Accra, GH', '[{"label":"Research","url":"https://example.com/theo"}]'::jsonb, now() - interval '210 days'),
  ('33333333-3333-4333-8333-333333333333', 'nadia', 'Nadia Okafor', 'Independent product designer', 'Design', 'Designing quiet tools for complicated work. Interested in paper interfaces, repair culture, and software that ages well.', 'Lagos, NG', '[{"label":"Portfolio","url":"https://example.com/nadia"}]'::jsonb, now() - interval '190 days'),
  ('44444444-4444-4444-8444-444444444444', 'jules', 'Jules Moreau', 'Essayist and newsletter writer', 'Writing', 'Weekly notes on attention, cities, and the strange afterlife of things people throw away.', 'Marseille, FR', '[{"label":"Newsletter","url":"https://example.com/jules"}]'::jsonb, now() - interval '170 days'),
  ('55555555-5555-4555-8555-555555555555', 'sam', 'Sam Vale', 'Community archivist', 'Archives', 'Helping neighbourhood groups keep their own records. Photographs, oral histories, and finding aids.', 'Bristol, UK', '[{"label":"Archive","url":"https://example.com/sam"}]'::jsonb, now() - interval '150 days'),
  ('66666666-6666-4666-8666-666666666666', 'ren', 'Ren Aoki', 'Sound artist and field recordist', 'Sound', 'Recording the small mechanical voices of places: pumps, shutters, trains, rooms before they empty.', 'Kyoto, JP', '[{"label":"Sound","url":"https://example.com/ren"}]'::jsonb, now() - interval '130 days')
on conflict (id) do update set
  username = excluded.username,
  display_name = excluded.display_name,
  headline = excluded.headline,
  practice = excluded.practice,
  bio = excluded.bio,
  location = excluded.location,
  links = excluded.links,
  created_at = excluded.created_at;

insert into public.posts (id, author_id, kind, title, body, media, tags, created_at)
values
  ('a0000000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'art', 'Rain ledger, plate III', 'Three weeks of rain pressed into one sheet. The blue was mixed by hand from pigment saved from an earlier failed print. I like when the mistake becomes the record.', '[{"path":"/seed-art/riso-blue.svg","alt":"Abstract blue risograph shapes on warm paper"}]'::jsonb, '{printmaking,weather,process}', now() - interval '2 hours'),
  ('a0000000-0000-4000-8000-000000000002', '22222222-2222-4222-8222-222222222222', 'research', 'A margin note from the harbour ledger, 1912', 'The clerk recorded rainfall in the same column as boat arrivals. Not an error — for him, weather and work were one event. Writing this up slowly.', '[]'::jsonb, '{archives,research,history}', now() - interval '7 hours'),
  ('a0000000-0000-4000-8000-000000000003', '33333333-3333-4333-8333-333333333333', 'work', 'A tool that refuses to disappear', 'Spent the week testing a paper task board for a studio with no reliable internet. The best feature was that nobody could accidentally delete a note.', '[{"path":"/seed-art/riso-orange.svg","alt":"Warm orange geometric risograph composition"}]'::jsonb, '{design,tools,offline}', now() - interval '1 day'),
  ('a0000000-0000-4000-8000-000000000004', '44444444-4444-4444-8444-444444444444', 'note', 'On keeping a commonplace book', 'A commonplace book is not a diary. It is a room where other people’s sentences wait until you need them. Mine is mostly weather, overheard speech, and recipes.', '[]'::jsonb, '{writing,reading,notes}', now() - interval '1 day 6 hours'),
  ('a0000000-0000-4000-8000-000000000005', '55555555-5555-4555-8555-555555555555', 'milestone', 'The corner shop archive is open', 'After fourteen months of scanning, the first collection is public: 1,240 photographs, 86 oral histories, and a stubborn index made by three volunteers.', '[{"path":"/seed-art/riso-green.svg","alt":"Green risograph collage of archive boxes"}]'::jsonb, '{archives,community,milestone}', now() - interval '2 days'),
  ('a0000000-0000-4000-8000-000000000006', '66666666-6666-4666-8666-666666666666', 'art', 'Pump room, 06:12', 'Field recording from a municipal water station. The pump has a limp in its rhythm that the engineers can hear but the meter cannot. Edited down to four minutes.', '[{"path":"/seed-art/riso-violet.svg","alt":"Violet risograph waveform illustration"}]'::jsonb, '{sound,field-recording,listening}', now() - interval '3 days'),
  ('a0000000-0000-4000-8000-000000000007', '11111111-1111-4111-8111-111111111111', 'note', 'Studio note: the paper was too dry', 'Humidity below 40% made the ink sit on the surface instead of sinking in. I hung damp sheets in the bathroom and pretended this was a planned experiment.', '[]'::jsonb, '{printmaking,process,notes}', now() - interval '4 days'),
  ('a0000000-0000-4000-8000-000000000008', '22222222-2222-4222-8222-222222222222', 'milestone', 'Chapter two is finally legible', 'The argument went from eleven pages to four. The remaining four are the only ones that were ever needed. Grateful to everyone who read the long version.', '[]'::jsonb, '{research,writing,milestone}', now() - interval '5 days')
on conflict (id) do nothing;

insert into public.follows (follower_id, following_id, created_at)
values
  ('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', now() - interval '30 days'),
  ('11111111-1111-4111-8111-111111111111', '33333333-3333-4333-8333-333333333333', now() - interval '20 days'),
  ('22222222-2222-4222-8222-222222222222', '55555555-5555-4555-8555-555555555555', now() - interval '18 days'),
  ('33333333-3333-4333-8333-333333333333', '11111111-1111-4111-8111-111111111111', now() - interval '12 days'),
  ('44444444-4444-4444-8444-444444444444', '11111111-1111-4111-8111-111111111111', now() - interval '8 days'),
  ('55555555-5555-4555-8555-555555555555', '22222222-2222-4222-8222-222222222222', now() - interval '6 days'),
  ('66666666-6666-4666-8666-666666666666', '11111111-1111-4111-8111-111111111111', now() - interval '4 days')
on conflict do nothing;

insert into public.post_likes (user_id, post_id, created_at)
values
  ('22222222-2222-4222-8222-222222222222', 'a0000000-0000-4000-8000-000000000001', now() - interval '1 hour'),
  ('33333333-3333-4333-8333-333333333333', 'a0000000-0000-4000-8000-000000000001', now() - interval '40 minutes'),
  ('44444444-4444-4444-8444-444444444444', 'a0000000-0000-4000-8000-000000000001', now() - interval '20 minutes'),
  ('11111111-1111-4111-8111-111111111111', 'a0000000-0000-4000-8000-000000000002', now() - interval '5 hours'),
  ('55555555-5555-4555-8555-555555555555', 'a0000000-0000-4000-8000-000000000003', now() - interval '20 hours'),
  ('11111111-1111-4111-8111-111111111111', 'a0000000-0000-4000-8000-000000000006', now() - interval '2 days')
on conflict do nothing;

insert into public.post_bookmarks (user_id, post_id, created_at)
values
  ('11111111-1111-4111-8111-111111111111', 'a0000000-0000-4000-8000-000000000002', now() - interval '6 hours'),
  ('11111111-1111-4111-8111-111111111111', 'a0000000-0000-4000-8000-000000000005', now() - interval '1 day')
on conflict do nothing;

insert into public.comments (id, post_id, author_id, body, created_at)
values
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333', 'The blue is extraordinary. Is that a separate pass or mixed into the same ink?', now() - interval '90 minutes'),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Same ink. The paper drank unevenly and made the variation for me.', now() - interval '70 minutes'),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000002', '55555555-5555-4555-8555-555555555555', 'This is the kind of marginal note that changes a whole chapter.', now() - interval '4 hours'),
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000005', '22222222-2222-4222-8222-222222222222', 'Congratulations to everyone who worked on this. The index is the hero.', now() - interval '1 day 2 hours')
on conflict (id) do nothing;
