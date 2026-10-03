"use client";
import Link from "next/link";
import { Logo } from "@/components/Header";
import { useUser } from "@/lib/store";

export default function Footer() {
  const user = useUser();
  return (
    <footer className="overflow-hidden border-t border-line bg-surface-1">
      <div className="mx-auto max-w-5xl px-4 pt-10">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <p className="text-sm text-fg-2">駆け出しエンジニアのための、無料で使えるポートフォリオ</p>
          {/* ログイン中はヘッダーとタブバーに行き先があるので、ここは未ログインの入口だけ */}
          {user === null && (
            <nav aria-label="はじめる" className="-mx-2 flex gap-2 text-sm">
              <Link href="/signup" className="inline-flex min-h-11 items-center px-2 font-semibold text-fg underline-offset-4 hover:underline">新規登録</Link>
              <Link href="/login" className="inline-flex min-h-11 items-center px-2 text-fg-2 hover:text-fg">ログイン</Link>
            </nav>
          )}
        </div>

        {/* 足元に敷く大きいロゴ。飾りなので読み上げない（名前は下の © で読まれる） */}
        <div aria-hidden className="mt-8 flex items-center gap-3 sm:gap-5">
          <Logo className="h-14 w-14 shrink-0 sm:h-24 sm:w-24 lg:h-28 lg:w-28" />
          <span className="text-6xl leading-none font-bold tracking-tighter text-fg sm:text-8xl lg:text-9xl">Canaria</span>
        </div>

        <div className="mt-8 flex flex-col gap-1 border-t border-line py-6 text-sm text-fg-3 sm:flex-row sm:justify-between">
          <p>© 2026 Canaria</p>
          {/* アソシエイト・プログラムの規約で必須の開示。リンクはプロフィールのあちこちに出るので全ページに置く */}
          <p>Amazonのアソシエイトとして、Canariaは適格販売により収入を得ています。</p>
        </div>
      </div>
    </footer>
  );
}
