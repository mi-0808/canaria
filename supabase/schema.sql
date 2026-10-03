-- Canaria schema. 公開ポートフォリオなので読み取りは誰でも、書き込みは本人だけ（saves だけ本人のみ閲覧）。
-- ponytail: 単一ファイルを手で流す運用。Supabase CLI を入れたら migrations に移す。

-- プロフィールの SNS リンクの検査。https の URL だけ・6件まで・1件300文字まで。
-- javascript: などをリンクとして描画させないための最後の砦（画面側は src/lib/links.mjs の normalizeLink で同じ条件）
create function public.valid_links(links text[]) returns boolean language sql immutable as $$
  select cardinality(links) <= 6
    and coalesce(bool_and(l ~ '^https://[^[:space:]]+$' and char_length(l) <= 300), true)
  from unnest(links) as l
$$;

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  -- 公開ページの URL（/@username）。本人があとから変えられる（変えると古い /@URL は開けなくなる）
  username text not null unique default ('user_' || substr(md5(random()::text), 1, 8)) check (username ~ '^[a-z0-9_]{3,20}$'),
  name text not null default '',
  icon text not null default '',
  cover text not null default '', -- 公開ページの頭に出す横長（3:1）の画像。任意
  gender text not null default '',
  age text not null default '',
  location text not null default '',
  mbti text not null default '',
  tagline text not null default '',
  -- 「いまやっていること」「これからやりたいこと」。MyHood の一言のような短い近況（公開ページで2枚のカードになる）
  doing_now text not null default '' check (char_length(doing_now) <= 100),
  want_next text not null default '' check (char_length(want_next) <= 100),
  bio text not null default '' check (char_length(bio) <= 200),
  links text[] not null default '{}' check (public.valid_links(links)), -- SNS・ブログなどの URL
  -- 仕事の相談を受けるメールアドレス（公開ページに出る）。mailto: に件名などを足せる文字は通さない（画面側は links.mjs の contactEmailPattern）
  contact_email text not null default '' check (contact_email = '' or (char_length(contact_email) <= 254 and contact_email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')),
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

-- 経歴（勤務先・学校などと、そこでの実績）。公開ページでは始まりの新しい順に年表で並べる。
-- 期間は年月で持つ（その月の1日）。ended が null なら「現在」
create table public.careers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles on delete cascade,
  company text not null check (char_length(company) between 1 and 100),
  role text not null default '' check (char_length(role) <= 100),
  started date not null,
  ended date check (ended is null or ended >= started),
  summary text not null default '' check (char_length(summary) <= 300),
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
alter table public.careers enable row level security;
alter table public.posts enable row level security;
alter table public.replies enable row level security;
alter table public.reactions enable row level security;
alter table public.saves enable row level security;

grant select on public.profiles, public.works, public.gear, public.careers, public.posts, public.replies, public.reactions to anon, authenticated;
grant select, insert, update, delete on public.profiles, public.works, public.gear, public.careers, public.posts, public.replies, public.reactions, public.saves to authenticated;

create policy "profiles: public read" on public.profiles for select to anon, authenticated using (true);
create policy "profiles: own insert" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "profiles: own update" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- works / gear / posts / replies / reactions: 誰でも読める、本人だけ書ける
do $$
declare t text;
begin
  foreach t in array array['works', 'gear', 'careers', 'posts', 'replies', 'reactions'] loop
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

-- 既存 DB への変更履歴（上の定義には反映済み。既存の環境でだけ、一度流す）
-- 2026-10-03 ユーザー名。既存ユーザーには user_xxxxxxxx が1人ずつ別の値で入る（random() は行ごとに評価される）
-- alter table public.profiles add column username text not null unique
--   default ('user_' || substr(md5(random()::text), 1, 8)) check (username ~ '^[a-z0-9_]{3,20}$');
-- 2026-10-03 SNS リンク。先頭の valid_links 関数を作ってから流す
-- create function public.valid_links(links text[]) returns boolean language sql immutable as $$
--   select cardinality(links) <= 6
--     and coalesce(bool_and(l ~ '^https://[^[:space:]]+$' and char_length(l) <= 300), true)
--   from unnest(links) as l
-- $$;
-- alter table public.profiles add column links text[] not null default '{}' check (public.valid_links(links));
-- 2026-10-03 連絡用メールアドレス
-- alter table public.profiles add column contact_email text not null default ''
--   check (contact_email = '' or (char_length(contact_email) <= 254 and contact_email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'));
-- 2026-10-03 「いま・これから」と経歴。勤務先・勤続年数は経歴にまとめる（入っていたデータは無かった）
-- ① マージ前に流す（足すだけなので、本番で動いている古いコードは壊れない）
-- alter table public.profiles
--   add column doing_now text not null default '' check (char_length(doing_now) <= 100),
--   add column want_next text not null default '' check (char_length(want_next) <= 100);
-- create table public.careers (
--   id uuid primary key default gen_random_uuid(),
--   user_id uuid not null default auth.uid() references public.profiles on delete cascade,
--   company text not null check (char_length(company) between 1 and 100),
--   role text not null default '' check (char_length(role) <= 100),
--   started date not null,
--   ended date check (ended is null or ended >= started),
--   summary text not null default '' check (char_length(summary) <= 300),
--   created_at timestamptz not null default now()
-- );
-- alter table public.careers enable row level security;
-- grant select on public.careers to anon, authenticated;
-- grant select, insert, update, delete on public.careers to authenticated;
-- create policy "careers: public read" on public.careers for select to anon, authenticated using (true);
-- create policy "careers: own insert" on public.careers for insert to authenticated with check ((select auth.uid()) = user_id);
-- create policy "careers: own update" on public.careers for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
-- create policy "careers: own delete" on public.careers for delete to authenticated using ((select auth.uid()) = user_id);
-- ② マージして本番が新しいコードになってから流す（古いコードはまだ company / years を保存しようとするため）
-- alter table public.profiles drop column company, drop column years;
-- 2026-10-03 カバー画像（マージ前に流す）
-- alter table public.profiles add column cover text not null default '';
