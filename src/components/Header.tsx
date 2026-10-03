"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useUser } from "@/lib/store";

export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path d="M4 20 L14 8 L22 10 L30 6 L24 14 L20 26 L12 22 Z" fill="var(--color-primary)" stroke="var(--color-fg)" strokeWidth="2" strokeLinejoin="miter" />
      <circle cx="18" cy="12" r="1.5" fill="var(--color-fg)" />
    </svg>
  );
}

const nav = [
  ["/timeline", "タイムライン"],
  ["/me", "マイページ"],
];

export default function Header() {
  const path = usePathname();
  const router = useRouter();
  const user = useUser();
  const logout = async () => {
    await signOut();
    router.push("/");
  };
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <Logo /> Canaria
          <span className="rounded-md bg-primary-container px-1.5 py-0.5 font-mono text-[10px] font-medium text-on-primary-container">beta</span>
        </Link>
        <nav className="flex gap-4 text-sm whitespace-nowrap sm:gap-6">
          {/* 未ログインだとどちらもログイン画面に飛ぶだけなので出さない */}
          {user && nav.map(([href, label]) => (
            <Link key={href} href={href}
              className={`transition ${path.startsWith(href) ? "font-bold text-fg" : "text-fg-3 hover:text-fg"}`}>
              {label}
            </Link>
          ))}
          {user && <button className="text-fg-3 transition hover:text-fg" onClick={logout}>ログアウト</button>}
          {user === null && (
            <>
              <Link href="/login" className="text-fg-3 transition hover:text-fg">ログイン</Link>
              <Link href="/signup" className="font-semibold text-fg underline-offset-4 hover:underline">新規会員登録</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
