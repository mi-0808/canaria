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
  // 「さがす」（/find）に載せる属性。どちらかを選ぶと載る（選ぶこと＝載せていいの同意）
  role: string; // 立場。profileChoices.role のどれかか空
  fields: string[]; // 分野。fieldChoices から3つまで（src/lib/find.mjs の MAX_FIELDS）
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
  // 立場と下の分野は DB の check と同じ並び・同じ文字。変えるときは supabase/schema.sql も変える
  role: ["高校生", "大学生・専門学生", "社会人", "経営者", "起業家", "フリーランス", "その他"],
} as const;
export const fieldChoices = ["エンジニア", "デザイナー", "クリエイター", "音楽", "スポーツ", "接客", "ビジネス", "その他"] as const;

// やってきたこと。3つの欄を1つの表に持つ（項目がほぼ同じで、読み込みも1回で済むため）
export const sections = ["work", "learn", "like"] as const;
export type Section = (typeof sections)[number];
export type Entry = {
  id: string;
  section: Section;
  kind: string; // はたらいたこと: バイト・インターンなど（自由入力も可）／まなんだこと: school か skill／すきなこと: 空
  title: string; // どこで／なにを／学校名／なにが
  place: string; // まなんだこと（身につけたこと）の「どこで・だれに」
  note: string; // やったこと・ひとこと
  started: number | null; // 年
  started_month: number | null; // 月（任意。年があるときだけ）
  ended: number | null;
  ended_month: number | null;
  current: boolean; // いまも続けている（ended と同時には持たない）
  image: string; // すきなことの写真
  created_at?: string;
};

export type Portfolio = { profile: Profile; works: Work[]; entries: Entry[] };

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

const loadProfile = async (uid: string) =>
  must(await db().from("profiles").select("*").eq("id", uid).maybeSingle()) as Profile | null;

/** 公開ページ・/me（プロフィールを作る）用。プロフィールが無ければ null */
export async function loadPortfolio(uid: string): Promise<Portfolio | null> {
  const [profile, works, entries] = await Promise.all([
    loadProfile(uid),
    db().from("works").select("*").eq("user_id", uid).order("created_at", { ascending: false }).then(must),
    // 始めた年月の新しい順（年や月の無いものは下。entries.mjs の byNewest と同じ）。1つの欄は50件までなので、3つ合わせて150件
    db().from("entries").select("*").eq("user_id", uid)
      .order("started", { ascending: false, nullsFirst: false }).order("started_month", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false }).limit(150).then(must),
  ]);
  if (!profile) return null;
  return { profile, works: works as Work[], entries: entries as Entry[] };
}

/** 公開ページ用。/@username（旧 URL の /u/ユーザーID なら id）から引く。見つからなければ null */
export async function loadPublicPortfolio(key: "id" | "username", value: string) {
  const p = must(await db().from("profiles").select("id").eq(key, value).maybeSingle()) as { id: string } | null;
  const portfolio = p && (await loadPortfolio(p.id));
  return portfolio && { id: p!.id, ...portfolio };
}

/** 見たプロフィールの一覧の1行ぶん。ids の順は保たない（並べ直しは呼ぶ側で） */
export const loadProfileCards = async (ids: string[]) =>
  ids.length
    ? (must(await db().from("profiles").select("id, username, name, icon, tagline").in("id", ids).limit(ids.length)) as
        (Pick<Profile, "username" | "name" | "icon" | "tagline"> & { id: string })[])
    : [];

/** 「さがす」の一覧の1行ぶん。拠点・年齢は取らない（18歳未満も載るため） */
export type FindCard = Pick<Profile, "username" | "name" | "icon" | "tagline" | "role" | "fields"> & { id: string };

// 「さがす」に載る人: 名前があり、立場か分野を選んだ人。新しい順
const listed = (columns: string) =>
  db().from("profiles").select(columns).neq("name", "").or('role.neq."",fields.neq.{}').order("created_at", { ascending: false });

/** 立場・分野ごとの人数を数えるための行。
 *  ponytail: 載る人の role と fields を1000人まで取って画面で数える。人数が増えたら DB の集計関数（role と unnest(fields) で group by）を rpc にする */
export async function loadFindCounts(quiet = false) {
  const res = await listed("role, fields").limit(1000);
  // LP の人数は飾りなので、失敗しても警告を出さず数字を出さないだけにする（初めて来た人にエラーを見せない）
  return (quiet ? (res.data ?? []) : must(res)) as unknown as Pick<Profile, "role" | "fields">[];
}

/** 「さがす」の一覧。立場と分野は同時に1つずつ（AND）。空ならその条件では絞らない。
 *  ponytail: 新しい順に50人まで。超える人数になったら続きを読む仕組みを足す */
export async function loadFindList({ role, field }: { role: string; field: string }) {
  let q = listed("id, username, name, icon, tagline, role, fields");
  if (role) q = q.eq("role", role);
  if (field) q = q.contains("fields", [field]);
  return must(await q.limit(50)) as unknown as FindCard[];
}

/** 公開ページの表示回数（本人以外が見た回数）。RLS で本人しか読めない。まだ1回も見られていなければ 0 */
export const loadViewCount = async (uid: string) =>
  ((must(await db().from("profile_views").select("count").eq("profile_id", uid).maybeSingle()) as { count: number } | null)?.count ?? 0);

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
/** 保存した行（created_at など DB が決めた値も入る）を返す */
export const saveEntry = async (e: Entry) => must(await db().from("entries").upsert(e).select().single()) as Entry;
/** 公開ページを1回見たと数える。同じブラウザからは1日1回だけ（再読み込みで増えないように）。本人かどうかは DB の record_view が見る。
 *  数え損ねても画面には関係ないので、失敗は捨てる */
export function recordView(uid: string) {
  const key = `viewed:${uid}`;
  const today = new Date().toLocaleDateString("sv"); // 2026-10-13 の形（その人の日付で区切る）
  try {
    if (localStorage.getItem(key) === today) return;
    localStorage.setItem(key, today);
  } catch {} // プライベートブラウズなどで localStorage が使えなくても数える
  db().rpc("record_view", { target: uid }).then(({ error }) => error && console.error(error));
}
export const remove = async (table: "works" | "entries", id: string) => must(await db().from(table).delete().eq("id", id));

/** media バケットの自分のフォルダに上げて公開URLを返す */
export async function upload(file: File) {
  const s = db();
  const { data } = await s.auth.getSession();
  const path = `${data.session!.user.id}/${newId()}.${file.name.split(".").pop()}`;
  must(await s.storage.from("media").upload(path, file, { contentType: file.type }));
  return s.storage.from("media").getPublicUrl(path).data.publicUrl;
}
