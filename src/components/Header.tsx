"use client";
import Link from "next/link";
import Icon from "@/components/Icon";
import { useUser } from "@/lib/store";

export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path d="M4 20 L14 8 L22 10 L30 6 L24 14 L20 26 L12 22 Z" fill="var(--color-primary)" stroke="var(--color-fg)" strokeWidth="2" strokeLinejoin="miter" />
      {/* 目は黄色い体の上にあるので on-primary（ライト・ダークとも暗い色）。fg だとダークで白く飛ぶ */}
      <circle cx="18" cy="12" r="1.5" fill="var(--color-on-primary)" />
    </svg>
  );
}

// 押せる高さを 44px 確保する（design.css のアクセシビリティ規約）
const item = "inline-flex min-h-11 items-center px-2 transition";

export default function Header() {
  const user = useUser();

  return (
    // 目立たせない（2026-10-12 ユーザーの指示）: 区切りの線と「Canaria」の文字は出さず、地と同じ色に溶かす。
    // 地の色は design.css の body に合わせる（/me 以下は data-grouped で surface-2）
    <header className="sticky top-0 z-20 bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-1.5">
        {/* ロゴはトップへ。ログイン中ならプロフィール（proxy.ts が /me に送る）、未ログインなら LP が出る。
            文字を出さないので、読み上げ用の名前を付ける */}
        <Link href="/" aria-label="Canaria トップへ" className={`${item} -ml-2 gap-2`}>
          <Logo className="h-6 w-6" />
          <span className="text-xs text-fg-3">β版</span>
        </Link>

        {/* ログイン中は行き先がプロフィールだけなので、メニューは出さない。設定だけは、どの画面からでも行けるよう右に歯車を置く */}
        {user && (
          <Link href="/settings" aria-label="設定" className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-fg-2 transition hover:bg-surface-1 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg">
            <Icon name="settings" className="h-5.5 w-5.5" />
          </Link>
        )}
        {user === null && (
          <nav className="-mr-2 flex gap-2 text-sm whitespace-nowrap sm:gap-4">
            <Link href="/login" className={`${item} text-fg-2 hover:text-fg`}>ログイン</Link>
            <Link href="/signup" className={`${item} font-semibold text-fg underline-offset-4 hover:underline`}>新規登録</Link>
          </nav>
        )}
      </div>
    </header>
  );
}
