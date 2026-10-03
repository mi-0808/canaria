"use client";
// ponytail: 全部クライアントから Supabase を直接叩く（守りは RLS）。公開ページの SEO/OGP が要るときにサーバー取得へ
import type { AuthError, User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type DependencyList, type Dispatch, type SetStateAction } from "react";
import { createClient as db } from "./supabase";

export type Profile = {
  username: string; // 公開ページの URL（/@username）
  name: string;
  icon: string;
  gender: string;
  age: string;
  location: string;
  company: string;
  years: string;
  mbti: string;
  tagline: string;
  bio: string;
  links: string[]; // SNS・ブログなどの https の URL（src/lib/links.mjs の normalizeLink を通したもの）
};

export type Work = {
  id: string;
  image: string;
  title: string;
  period: string;
  role: string;
  status: WorkStatus;
  techs: string; // カンマ区切り
  summary: string;
  url: string;
};

export const workStatuses = ["企画中", "開発中", "ベータ公開", "リリース・運用中"] as const;
export type WorkStatus = (typeof workStatuses)[number];

type Author = Profile & { id: string };
export type Reply = { id: string; body: string; created_at: string; author: Pick<Profile, "name" | "icon"> };
export type Post = {
  id: string;
  body: string;
  media?: { kind: "audio" | "video"; src: string };
  created_at: string;
  author: Author;
  reacted: boolean; // 閲覧中のユーザーが
  saved: boolean; // 閲覧中のユーザーが
  replies: Reply[];
};

// 開発環境（仕事場）のアイテム。url は将来アフィリエイトリンクに差し替え可能
export const gearCategories = { machine: "パソコン", keyboard: "キーボード", display: "ディスプレイ", mouse: "マウス", audio: "オーディオ", other: "その他" } as const;
// comment は「これいいよ」のひとこと。購入のきっかけになる部分
export type Gear = { id: string; category: keyof typeof gearCategories; name: string; comment: string; url: string };

export type Portfolio = { profile: Profile; works: Work[]; gear: Gear[]; posts: Post[] };

// タイムラインを見るのに必要なプロフィール項目
export const requiredProfile: [keyof Profile, string][] = [["name", "名前"], ["icon", "アイコン"], ["tagline", "ひとこと"]];
export const missingProfile = (p: Profile) => requiredProfile.filter(([k]) => !p[k]).map(([, label]) => label);

export const newId = () => crypto.randomUUID();

/** 公開ページの URL に使えるユーザー名。DB の check 制約と同じ */
export const usernamePattern = /^[a-z0-9_]{3,20}$/;

// 失敗を黙って捨てない（入力が消えたように見えるのを防ぐ）
function must<T>({ data, error }: { data: T; error: unknown }) {
  if (error) {
    alert("保存・読み込みに失敗しました。通信状況を確認してもう一度お試しください。");
    throw error;
  }
  return data;
}

// --- auth ---

/** undefined: 確認中 / null: 未ログイン */
export function useUser() {
  const [user, setUser] = useState<User | null>();
  useEffect(() => {
    const { data } = db().auth.onAuthStateChange((_, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);
  return user;
}

/** 未ログインなら /login へ */
export function useAuthedUser() {
  const user = useUser();
  const router = useRouter();
  useEffect(() => {
    if (user === null) router.replace("/login");
  }, [user, router]);
  return user ?? undefined;
}

const authErrors: Record<string, string> = {
  invalid_credentials: "メールアドレスかパスワードが違います",
  email_not_confirmed: "メールアドレスの確認がまだ済んでいません。届いたメールのリンクを開いてください",
  user_already_exists: "このメールアドレスは登録済みです。ログインしてください",
  weak_password: "パスワードが弱すぎます。もっと長くしてください",
  same_password: "今と同じパスワードです。別のパスワードにしてください",
  over_email_send_rate_limit: "メールの送信回数が上限に達しました。しばらくしてからお試しください",
  over_request_rate_limit: "試行回数が多すぎます。しばらくしてからお試しください",
};
// 未知のエラーも原因が分かるようにコードを添える（status 0 は通信失敗）
function authError(e: AuthError) {
  console.error(e);
  if (e.status === 0) return "通信に失敗しました。ネット接続を確認してもう一度お試しください";
  return authErrors[e.code ?? ""] ?? `うまくいきませんでした。もう一度お試しください（${e.code ?? e.message}）`;
}

/** 確認メールを送った場合は confirm: true（リンクを開くと /me に戻ってログイン済みになる） */
export async function signUp(email: string, password: string): Promise<{ error?: string; confirm?: boolean }> {
  const { data, error } = await db().auth.signUp({ email, password, options: { emailRedirectTo: `${location.origin}/me` } });
  if (error) return { error: authError(error) };
  // 確認メールが有効だと、登録済みアドレスでもエラーにならず identities が空で返る
  if (data.user?.identities?.length === 0) return { error: authErrors.user_already_exists };
  return { confirm: !data.session };
}

export async function signIn(email: string, password: string) {
  const { error } = await db().auth.signInWithPassword({ email, password });
  return error ? authError(error) : undefined;
}

/** 未登録のアドレスでも成功扱いになる（登録の有無を外に漏らさない） */
export async function sendPasswordReset(email: string) {
  const { error } = await db().auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/reset` });
  return error ? authError(error) : undefined;
}

export async function updatePassword(password: string) {
  const { error } = await db().auth.updateUser({ password });
  return error ? authError(error) : undefined;
}
export const signOut = () => db().auth.signOut();

// --- read ---

/** fn が undefined を返す間（ログイン確認中など）は読み込まない */
export function useLoad<T>(fn: () => Promise<T> | undefined, deps: DependencyList): [T | undefined, Dispatch<SetStateAction<T | undefined>>] {
  const [data, setData] = useState<T>();
  useEffect(() => {
    let alive = true;
    fn()?.then((d) => alive && setData(d));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return [data, setData];
}

/** 書き込み中かどうかと、書き込みを包む関数。終わるまで同じ操作を受け付けない（二度押しで二重に保存・投稿されるのを防ぐ）。
 *  state だけだと連打が再描画より速いと両方通るので、ref で止める */
export function useBusy(): [boolean, (fn: () => Promise<unknown>) => Promise<void>] {
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const run = async (fn: () => Promise<unknown>) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      await fn();
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  return [busy, run];
}

const postSelect = "*, author:profiles!posts_user_id_fkey(*), replies(*, author:profiles!replies_user_id_fkey(name, icon)), reactions(user_id), saves(user_id)";

type PostRow = {
  id: string; body: string; media_kind: "audio" | "video" | null; media_src: string | null; created_at: string;
  author: Author; replies: Reply[]; reactions: { user_id: string }[]; saves: { user_id: string }[];
};
const toPost = (r: PostRow, viewer?: string): Post => ({
  id: r.id,
  body: r.body,
  media: r.media_kind && r.media_src ? { kind: r.media_kind, src: r.media_src } : undefined,
  created_at: r.created_at,
  author: r.author,
  reacted: r.reactions.some((x) => x.user_id === viewer),
  saved: r.saves.some((x) => x.user_id === viewer), // RLS で自分の分しか返らない
  replies: r.replies.toSorted((a, b) => a.created_at.localeCompare(b.created_at)),
});

const posts = () => db().from("posts").select(postSelect).order("created_at", { ascending: false });

export const loadProfile = async (uid: string) =>
  must(await db().from("profiles").select("*").eq("id", uid).maybeSingle()) as Profile | null;

/** 公開ページ・/me（ポートフォリオを作る）用。プロフィールが無ければ null */
export async function loadPortfolio(uid: string, viewer?: string): Promise<Portfolio | null> {
  const [profile, works, gear, ps] = await Promise.all([
    loadProfile(uid),
    db().from("works").select("*").eq("user_id", uid).order("created_at", { ascending: false }).then(must),
    db().from("gear").select("*").eq("user_id", uid).order("created_at", { ascending: false }).then(must),
    posts().eq("user_id", uid).then(must),
  ]);
  if (!profile) return null;
  return { profile, works: works as Work[], gear: gear as Gear[], posts: (ps as unknown as PostRow[]).map((r) => toPost(r, viewer)) };
}

/** 公開ページ用。/@username（旧 URL の /u/ユーザーID なら id）から引く。見つからなければ null */
export async function loadPublicPortfolio(key: "id" | "username", value: string) {
  const p = must(await db().from("profiles").select("id").eq(key, value).maybeSingle()) as { id: string } | null;
  const portfolio = p && (await loadPortfolio(p.id));
  return portfolio && { id: p!.id, ...portfolio };
}

// ponytail: 全件取得。投稿が増えたら range() でページング
export const loadTimeline = async (viewer: string) => (must(await posts()) as unknown as PostRow[]).map((r) => toPost(r, viewer));

export async function loadPost(id: string, viewer?: string) {
  const r = must(await db().from("posts").select(postSelect).eq("id", id).maybeSingle()) as unknown as PostRow | null;
  return r && toPost(r, viewer);
}

// --- write ---

/** /me を初めて開いたときにプロフィール行を用意する（作品などの外部キー先） */
export const ensureProfile = async (uid: string) =>
  must(await db().from("profiles").upsert({ id: uid }, { onConflict: "id", ignoreDuplicates: true }));

/** ユーザー名が他の人と重なったときだけ、画面に出すエラー文を返す */
export async function saveProfile(uid: string, p: Profile) {
  const { error } = await db().from("profiles").update(p).eq("id", uid);
  if (error?.code === "23505") return "そのユーザー名は使われています。別の名前にしてください";
  must({ data: null, error });
}
export const saveWork = async (w: Work) => must(await db().from("works").upsert(w));
export const saveGear = async (g: Gear) => must(await db().from("gear").upsert(g));
export const remove = async (table: "works" | "gear", id: string) => must(await db().from(table).delete().eq("id", id));

export const createPost = async (body: string, media?: Post["media"]) =>
  must(await db().from("posts").insert({ body, media_kind: media?.kind ?? null, media_src: media?.src ?? null }));
export const addReply = async (postId: string, body: string) => must(await db().from("replies").insert({ post_id: postId, body }));

export async function toggle(table: "reactions" | "saves", post: Post, on: boolean) {
  const q = db().from(table);
  // 削除は RLS で自分の行だけに絞られる
  must(await (on ? q.insert({ post_id: post.id }) : q.delete().eq("post_id", post.id)));
}

/** media バケットの自分のフォルダに上げて公開URLを返す */
export async function upload(file: File) {
  const s = db();
  const { data } = await s.auth.getSession();
  const path = `${data.session!.user.id}/${newId()}.${file.name.split(".").pop()}`;
  must(await s.storage.from("media").upload(path, file, { contentType: file.type }));
  return s.storage.from("media").getPublicUrl(path).data.publicUrl;
}
