// OGP（リンクを貼ったときのカード）をサーバーで作るための部品。公開ページの本体はブラウザで描いているので、
// LINE・X が読む <head> と画像だけをここでサーバーから作る。
// ponytail: 本体までサーバーで描くのは、Google の検索結果が問題になってから

// 画像（next/og）は CSS の変数を読めないので、design.css のライトの値を写す。トークンを変えたらここも変える
export const ogColors = {
  primary: "#ffc72c",
  primaryContainer: "#fff4cc",
  onPrimaryContainer: "#5c4300",
  surface: "#ffffff",
  surface3: "#ece9e3",
  fg: "#1d1b17",
  fg3: "#736e66",
  onPrimary: "#2b2100",
};
export const ogSize = { width: 1200, height: 630 };

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export type OgProfile = { name: string; username: string; tagline: string; icon: string };

/** /@名前（旧 URL の /u/ユーザーID も）の人を、Supabase の REST から公開の読み取りだけで取る。依存を足さないよう fetch で直接読む。
 *  変更は最大1時間遅れて反映する（LINE・X も自分で写しを持つので、ここを短くしても速くはならない） */
export async function fetchOgProfile(name: string): Promise<OgProfile | null> {
  const key = uuid.test(name) ? "id" : "username";
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?select=name,username,tagline,icon&${key}=eq.${encodeURIComponent(name.toLowerCase())}&limit=1`;
  const res = await fetch(url, { headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! }, next: { revalidate: 3600 } });
  if (!res.ok) return null;
  const [p] = (await res.json()) as OgProfile[];
  return p ?? null;
}

/** 画像に出す文字だけを含む Noto Sans JP（400・700）を Google Fonts から取る。next/og には日本語のフォントが入っていないため。
 *  User-Agent を付けないと truetype で返る（next/og は woff2 を読めない） */
export async function loadJapaneseFonts(text: string) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&text=${encodeURIComponent(text)}`)).text();
  const faces = [...css.matchAll(/font-weight: (\d+);[\s\S]*?src: url\((.+?)\) format\('(?:opentype|truetype)'\)/g)];
  if (!faces.length) throw new Error("Google Fonts から日本語のフォントを取れませんでした");
  return Promise.all(
    faces.map(async ([, weight, src]) => ({
      name: "Noto Sans JP",
      data: await (await fetch(src)).arrayBuffer(),
      weight: Number(weight) as 400 | 700,
      style: "normal" as const,
    })),
  );
}

/** アイコンを data URL にして返す。取れなければ null（丸に名前の1文字を出す）。
 *  next/og に URL のまま渡すと、取れなかったときに画像ごと失敗するため、先に自分で取る */
export async function loadAvatar(url: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    // ponytail: 大きすぎる写真は描かない。アップロード時に縮めるようにしたら外す
    if (buf.length > 4_000_000) return null;
    return `data:${res.headers.get("content-type") ?? "image/jpeg"};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

/** ヘッダーの Logo と同じ鳥（src/components/Header.tsx）。形を変えたらここも変える */
export function OgLogo({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size}>
      <path d="M4 20 L14 8 L22 10 L30 6 L24 14 L20 26 L12 22 Z" fill={ogColors.primary} stroke={ogColors.fg} strokeWidth="2" strokeLinejoin="miter" />
      <circle cx="18" cy="12" r="1.5" fill={ogColors.onPrimary} />
    </svg>
  );
}

/** 右下の「鳥＋Canaria」。どの画像にも同じ位置で出す */
export function OgBrand() {
  return (
    <div style={{ position: "absolute", right: 56, bottom: 44, display: "flex", alignItems: "center", gap: 12, fontSize: 34, fontWeight: 700, color: ogColors.fg }}>
      <OgLogo size={44} />
      Canaria
    </div>
  );
}
