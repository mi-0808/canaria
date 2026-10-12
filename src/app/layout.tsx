import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./design.css";

const sans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Canaria",
  description: "やってきたことを、見せたくなる形で並べるプロフィール帳",
  // ヘッダーの Logo を PNG に書き出したもの。Logo の形を変えたら書き出し直す
  icons: { icon: "/canaria_icons.png", apple: "/canaria_icons.png" },
};

// 設定画面で選んだテーマ（ライト／ダーク）を、最初の描画より前に html に付ける。React を待つと一瞬だけ逆の色が見える。
// Next のガイド「Preventing Flash」の方法。中身は固定の文字列で、利用者の入力は入らない
const themeScript = `try{var t=localStorage.getItem("theme");if(t)document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-theme を上のスクリプトが書き換えるので、サーバーの HTML と食い違っても React に警告させない
    <html lang="ja" className={`${sans.variable} ${mono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
