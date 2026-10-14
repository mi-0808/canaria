import { ImageResponse } from "next/og";
import { fontText } from "@/lib/og.mjs";
import { OgBrand, loadJapaneseFonts, ogColors, ogSize } from "@/lib/og-server";

// LP・さがす・見本など、人のページ以外のリンクの画像。LP のヒーローと同じ言葉とマーカー
export const alt = "Canaria — やってきたことが、ちゃんと届く。";
export const size = ogSize;
export const contentType = "image/png";
export const revalidate = 86400;

const lines = ["やってきたことが、", "ちゃんと届く。"];
const sub = "はたらいたこと・まなんだこと・すきなこと";

export default async function Image() {
  const fonts = await loadJapaneseFonts(fontText([...lines, sub, "Canaria"])).catch(() => null);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 96px", background: ogColors.surface, fontFamily: "Noto Sans JP", position: "relative", color: ogColors.fg }}>
        {/* next/og は子が2つ以上の要素に display: flex が要る。フラグメントだと横に並んでしまうので、縦の入れ物に入れる */}
        {fonts ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 1.25, whiteSpace: "nowrap" }}>{lines[0]}</div>
            {/* LP の見出しと同じ、文字の下半分に引くカナリアの線 */}
            <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 1.25, whiteSpace: "nowrap", backgroundImage: `linear-gradient(transparent 62%, ${ogColors.primary} 62%)` }}>{lines[1]}</div>
            <div style={{ fontSize: 36, color: ogColors.fg3, marginTop: 36 }}>{sub}</div>
          </div>
        ) : (
          <div style={{ fontSize: 120, fontWeight: 700 }}>Canaria</div>
        )}
        <OgBrand />
      </div>
    ),
    { ...size, fonts: fonts ?? undefined },
  );
}
