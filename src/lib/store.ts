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
  cover: string; // 公開ページの頭に出す横長（3:1）の画像。空なら出さない
  gender: string;
  age: string;
  location: string;
  mbti: string;
  tagline: string;
  doing_now: string; // いまやっていること（100文字まで）
  want_next: string; // これからやりたいこと（100文字まで）
  bio: string;
  links: string[]; // SNS・ブログなどの https の URL（src/lib/links.mjs の normalizeLink を通したもの）
  contact_email: string; // 仕事の相談を受けるメールアドレス。公開ページに出る。ログイン用とは別。空なら出さない
};

export type Work = {
  id: string;
  image: string; // トップ画像（カードに出す1枚）
  shots: string[]; // 2枚目以降の画像（9枚まで）。詳細シートでトップ画像に続けて並べる
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

// プロフィールの選択肢。DB は text のまま（自由入力だった頃の値も残るので、画面側で選択肢に足して見せる）。
// 年齢は年代にする: 細かい年齢を出さずに済み、毎年直さなくていい
export const profileChoices = {
  gender: ["男性", "女性", "その他"],
  age: ["10代", "20代前半", "20代後半", "30代前半", "30代後半", "40代", "50代", "60代以上"],
  location: [
    "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県", "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
    "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
    "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県", "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
    "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県", "海外",
  ],
  mbti: [
    "INTJ", "INTP", "ENTJ", "ENTP", "INFJ", "INFP", "ENFJ", "ENFP", "ISTJ", "ISFJ", "ESTJ", "ESFJ", "ISTP", "ISFP", "ESTP", "ESFP",
  ],
} as const;

// 経歴（勤務先・学校など）。started / ended は DB の date（"2024-04-01"）。ended が null なら「現在」
export type Career = { id: string; company: string; role: string; started: string; ended: string | null; summary: string };

export type Portfolio = { profile: Profile; works: Work[]; careers: Career[] };

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

/** 書き込み中かどうかと、書き込みを包む関数。終わるまで同じ操作を受け付けない（二度押しで二重に保存されるのを防ぐ）。
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

export const loadProfile = async (uid: string) =>
  must(await db().from("profiles").select("*").eq("id", uid).maybeSingle()) as Profile | null;

/** 公開ページ・/me（プロフィールを作る）用。プロフィールが無ければ null */
export async function loadPortfolio(uid: string): Promise<Portfolio | null> {
  const [profile, works, careers] = await Promise.all([
    loadProfile(uid),
    db().from("works").select("*").eq("user_id", uid).order("created_at", { ascending: false }).then(must),
    // 経歴は始まりの新しい順。1人で 50 件を超えることはまず無いが、青天井にしない
    db().from("careers").select("*").eq("user_id", uid).order("started", { ascending: false }).limit(50).then(must),
  ]);
  if (!profile) return null;
  return { profile, works: works as Work[], careers: careers as Career[] };
}

/** 公開ページ用。/@username（旧 URL の /u/ユーザーID なら id）から引く。見つからなければ null */
export async function loadPublicPortfolio(key: "id" | "username", value: string) {
  const p = must(await db().from("profiles").select("id").eq(key, value).maybeSingle()) as { id: string } | null;
  const portfolio = p && (await loadPortfolio(p.id));
  return portfolio && { id: p!.id, ...portfolio };
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
export const saveCareer = async (c: Career) => must(await db().from("careers").upsert(c));
export const remove = async (table: "works" | "careers", id: string) => must(await db().from(table).delete().eq("id", id));

/** media バケットの自分のフォルダに上げて公開URLを返す */
export async function upload(file: File) {
  const s = db();
  const { data } = await s.auth.getSession();
  const path = `${data.session!.user.id}/${newId()}.${file.name.split(".").pop()}`;
  must(await s.storage.from("media").upload(path, file, { contentType: file.type }));
  return s.storage.from("media").getPublicUrl(path).data.publicUrl;
}
