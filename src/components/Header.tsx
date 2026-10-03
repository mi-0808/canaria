"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

export default function Header() {
  const path = usePathname();
  const user = useUser();
  // `/` の中身（LP かホームか）はログイン状態で変わる。画面ごと読み直して proxy に判定し直させる。
  // router.push だと、Next のクライアントキャッシュに残ったホームが出ることがある（router.refresh は今のページ分しか消さない）
  const logout = async () => {
    await signOut();
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- 上の理由で意図的に再読み込みする
    location.assign("/");
  };
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-1.5">
        {/* ロゴはトップへ。ログイン中ならホーム、未ログインなら LP が出る */}
        <Link href="/" className={`${item} -ml-2 gap-2 text-lg font-bold tracking-tight`}>
          <Logo /> Canaria
          <span className="rounded-md bg-primary-container px-1.5 py-0.5 text-xs font-medium text-on-primary-container">β版</span>
        </Link>
        <nav className="-mr-2 flex gap-2 text-sm whitespace-nowrap sm:gap-4">
          {user && (
            <>
              <Link href="/me" className={`${item} ${path.startsWith("/me") ? "font-bold text-fg" : "text-fg-3 hover:text-fg"}`}>マイページ</Link>
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
      </div>
    </header>
  );
}
