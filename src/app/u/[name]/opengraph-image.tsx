import { ImageResponse } from "next/og";
import { drawableImage, fontText, ogText } from "@/lib/og.mjs";
import { OgBrand, fetchOgProfile, loadAvatar, loadJapaneseFonts, ogColors, ogSize } from "@/lib/og-server";

// 公開ページのリンクを貼ったときの画像（B 案: アイコン・名前・ひとことを大きく。2026-10-14 ユーザーが選択）。
// 拠点・年齢は出さない（18歳未満も使うため。公開ページにはあっても、画像は転載されやすい）
export const alt = "Canaria のプロフィール";
export const size = ogSize;
export const contentType = "image/png";
export const revalidate = 3600;

export default async function Image({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const p = await fetchOgProfile(decodeURIComponent(name));
  const t = p ? ogText(p) : { name: "Canaria", username: "", tagline: "やってきたことを、見せたくなる形で並べるプロフィール帳", initial: "" };
  const avatar = p && drawableImage(p.icon) ? await loadAvatar(p.icon) : null;
  // フォントが取れないと日本語が豆腐になるので、そのときは日本語の文字を出さず、アイコンとユーザー名だけにする
  const fonts = await loadJapaneseFonts(fontText([t.name, t.username, t.tagline, t.initial, "Canaria"])).catch(() => null);
  const name_ = fonts ? t.name : p ? `@${p.username}` : "Canaria";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", gap: 56, padding: "0 96px", background: ogColors.primaryContainer, fontFamily: "Noto Sans JP", position: "relative" }}>
        <div style={{ width: 312, height: 312, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 9999, border: `12px solid ${ogColors.surface}`, background: ogColors.surface3, overflow: "hidden", fontSize: 128, fontWeight: 700, color: ogColors.onPrimaryContainer }}>
          {avatar ? <img src={avatar} alt="" width={288} height={288} style={{ objectFit: "cover" }} /> : fonts && t.initial}
        </div>
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.2, color: ogColors.fg }}>{name_}</div>
          {t.username && fonts && <div style={{ fontSize: 34, color: ogColors.fg3, marginTop: 8 }}>{t.username}</div>}
          {t.tagline && fonts && <div style={{ fontSize: 40, lineHeight: 1.5, color: ogColors.onPrimaryContainer, marginTop: 28 }}>{t.tagline}</div>}
        </div>
        <OgBrand />
      </div>
    ),
    { ...size, fonts: fonts ?? undefined },
  );
}
