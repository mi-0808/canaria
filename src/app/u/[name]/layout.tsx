import type { Metadata } from "next";
import { ogTitle } from "@/lib/og.mjs";
import { fetchOgProfile } from "@/lib/og-server";

// 公開ページ（/@名前）の <head>。ページ本体はブラウザで描くが、LINE・X のカードは JavaScript を動かさずに
// <head> だけを読むので、タイトルと説明はここでサーバーから入れる。画像は同じ場所の opengraph-image.tsx
export async function generateMetadata({ params }: LayoutProps<"/u/[name]">): Promise<Metadata> {
  const { name } = await params;
  const p = await fetchOgProfile(decodeURIComponent(name));
  if (!p) return {};
  const title = ogTitle(p);
  const description = p.tagline.trim() || "やってきたことを、見せたくなる形で並べるプロフィール帳";
  // openGraph は親（src/app/layout.tsx）と浅くしか混ざらない（同じ鍵は置き換わる）ので、サイト名もここで書く
  return {
    title,
    description,
    openGraph: { title, description, siteName: "Canaria", type: "profile", locale: "ja_JP", url: `/@${p.username}` },
  };
}

export default function PublicLayout({ children }: LayoutProps<"/u/[name]">) {
  return children;
}
