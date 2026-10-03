-- Canaria schema. 公開ポートフォリオなので読み取りは誰でも、書き込みは本人だけ（saves だけ本人のみ閲覧）。
-- ponytail: 単一ファイルを手で流す運用。Supabase CLI を入れたら migrations に移す。

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null default '',
  icon text not null default '',
  gender text not null default '',
  age text not null default '',
  location text not null default '',
  company text not null default '',
  years text not null default '',
  mbti text not null default '',
  tagline text not null default '',
  bio text not null default '' check (char_length(bio) <= 200),
  created_at timestamptz not null default now()
);

create table public.works (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles on delete cascade,
  image text not null default '',
  title text not null check (char_length(title) > 0),
  period text not null default '',
  role text not null default '',
  status text not null default '開発中' check (status in ('企画中', '開発中', 'ベータ公開', 'リリース・運用中')),
  techs text not null default '',
  summary text not null default '' check (char_length(summary) <= 200),
  url text not null default '',
  created_at timestamptz not null default now()
);

create table public.gear (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles on delete cascade,
  category text not null check (category in ('machine', 'keyboard', 'display', 'mouse', 'audio', 'other')),
  name text not null check (char_length(name) > 0),
  comment text not null default '' check (char_length(comment) <= 80),
  url text not null default '',
  created_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles on delete cascade,
  body text not null default '',
  media_kind text check (media_kind in ('audio', 'video')),
  media_src text,
  created_at timestamptz not null default now()
);

create table public.replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles on delete cascade,
  body text not null check (char_length(body) > 0),
  created_at timestamptz not null default now()
);

create table public.reactions (
  post_id uuid not null references public.posts on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles on delete cascade,
  primary key (post_id, user_id)
);

create table public.saves (
  post_id uuid not null references public.posts on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles on delete cascade,
  primary key (post_id, user_id)
);

create index on public.works (user_id);
create index on public.gear (user_id);
create index on public.posts (user_id, created_at desc);
create index on public.replies (post_id);
create index on public.replies (user_id);
create index on public.reactions (user_id);
create index on public.saves (user_id);

-- RLS
alter table public.profiles enable row level security;
alter table public.works enable row level security;
alter table public.gear enable row level security;
alter table public.posts enable row level security;
alter table public.replies enable row level security;
alter table public.reactions enable row level security;
alter table public.saves enable row level security;

grant select on public.profiles, public.works, public.gear, public.posts, public.replies, public.reactions to anon, authenticated;
grant select, insert, update, delete on public.profiles, public.works, public.gear, public.posts, public.replies, public.reactions, public.saves to authenticated;

create policy "profiles: public read" on public.profiles for select to anon, authenticated using (true);
create policy "profiles: own insert" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "profiles: own update" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- works / gear / posts / replies / reactions: 誰でも読める、本人だけ書ける
do $$
declare t text;
begin
  foreach t in array array['works', 'gear', 'posts', 'replies', 'reactions'] loop
    execute format('create policy "%1$s: public read" on public.%1$I for select to anon, authenticated using (true)', t);
    execute format('create policy "%1$s: own insert" on public.%1$I for insert to authenticated with check ((select auth.uid()) = user_id)', t);
    execute format('create policy "%1$s: own update" on public.%1$I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
    execute format('create policy "%1$s: own delete" on public.%1$I for delete to authenticated using ((select auth.uid()) = user_id)', t);
  end loop;
end $$;

create policy "saves: own read" on public.saves for select to authenticated using ((select auth.uid()) = user_id);
create policy "saves: own insert" on public.saves for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "saves: own delete" on public.saves for delete to authenticated using ((select auth.uid()) = user_id);

-- Storage: 公開バケット。各ユーザーは自分の uid フォルダにだけアップロードできる
-- ponytail: 差し替え前の古いファイルは消さない。容量が気になったら select+delete ポリシーと掃除処理を足す
insert into storage.buckets (id, name, public, file_size_limit)
values ('media', 'media', true, 50 * 1024 * 1024);

create policy "media: own upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = (select auth.uid())::text);