"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, useUser } from "@/lib/store";

export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path d="M4 20 L14 8 L22 10 L30 6 L24 14 L20 26 L12 22 Z" fill="var(--color-primary)" stroke="var(--color-fg)" strokeWidth="2" strokeLinejoin="miter" />
      <circle cx="18" cy="12" r="1.5" fill="var(--color-fg)" />
    </svg>
  );
}

// 押せる高さを 44px 確保する（design.css のアクセシビリティ規約）
const item = "inline-flex min-h-11 items-center px-2 transition";
// スマホのメニューの1行。指で押しやすいよう 48px・16px にする
const row = "flex min-h-12 w-full items-center text-base text-fg";

export default function Header() {
  const path = usePathname();
  const user = useUser();
  // スマホのメニューを開いたページ。ページを移れば open は自動で false になる
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === path;
  const close = () => setOpenAt(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenAt(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // `/` の中身（LP かホームか）はログイン状態で変わる。画面ごと読み直して proxy に判定し直させる。
  // router.push だと、Next のクライアントキャッシュに残ったホームが出ることがある（router.refresh は今のページ分しか消さない）
  const logout = async () => {
    await signOut();
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- 上の理由で意図的に再読み込みする
    location.assign("/");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-1.5">
        {/* ロゴはトップへ。ログイン中ならホーム、未ログインなら LP が出る */}
        <Link href="/" className={`${item} -ml-2 gap-2 text-lg font-bold tracking-tight`}>
          <Logo /> Canaria
          <span className="rounded-md bg-primary-container px-1.5 py-0.5 text-xs font-medium text-on-primary-container">β版</span>
        </Link>

        {/* PC: 横に並べる */}
        <nav className="-mr-2 hidden gap-4 text-sm whitespace-nowrap sm:flex">
          {user && (
            <>
              <Link href="/me" className={`${item} ${path.startsWith("/me") ? "font-bold text-fg" : "text-fg-3 hover:text-fg"}`}>ポートフォリオを作る</Link>
              <button className={`${item} text-fg-3 hover:text-fg`} onClick={logout}>ログアウト</button>
            </>
          )}
          {user === null && (
            <>
              <Link href="/login" className={`${item} text-fg-3 hover:text-fg`}>ログイン</Link>
              <Link href="/signup" className={`${item} font-semibold text-fg underline-offset-4 hover:underline`}>新規会員登録</Link>
            </>
          )}
        </nav>

        {/* スマホ: 三本線のボタンから開く。ログイン状態が分かるまでは出さない */}
        {user !== undefined && (
          <button type="button" className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-xl text-fg sm:hidden"
            aria-label={open ? "メニューを閉じる" : "メニューを開く"} aria-expanded={open} aria-controls="mobile-menu"
            onClick={() => setOpenAt(open ? null : path)}>
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        )}
      </div>

      {open && (
        <nav id="mobile-menu" className="absolute inset-x-0 top-full border-b border-line bg-surface sm:hidden">
          <div className="mx-auto flex max-w-5xl flex-col divide-y divide-line px-4">
            {user ? (
              <>
                <Link href="/me" className={`${row} ${path.startsWith("/me") ? "font-bold" : ""}`} onClick={close}>ポートフォリオを作る</Link>
                <button className={row} onClick={logout}>ログアウト</button>
              </>
            ) : (
              <>
                <Link href="/login" className={row} onClick={close}>ログイン</Link>
                <Link href="/signup" className={`${row} font-semibold`} onClick={close}>新規会員登録</Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
