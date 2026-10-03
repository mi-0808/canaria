"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { type IconName } from "@/components/Icon";
import { useUser } from "@/lib/store";

export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path d="M4 20 L14 8 L22 10 L30 6 L24 14 L20 26 L12 22 Z" fill="var(--color-primary)" stroke="var(--color-fg)" strokeWidth="2" strokeLinejoin="miter" />
      <circle cx="18" cy="12" r="1.5" fill="var(--color-fg)" />
    </svg>
  );
}

// ログイン中の行き先。PC はヘッダーに文字で、スマホは画面下のタブバーに並べる（HIG: 最上位の行き先は隠さない）
const nav: [href: string, label: string, icon: IconName][] = [
  ["/", "トップ", "home"],
  ["/me", "ポートフォリオ", "briefcase"],
  ["/settings", "設定", "settings"],
];
// `/` は前方一致だと全部に当たるので完全一致
const isCurrent = (path: string, href: string) => (href === "/" ? path === "/" : path.startsWith(href));

// 押せる高さを 44px 確保する（design.css のアクセシビリティ規約）
const item = "inline-flex min-h-11 items-center px-2 transition";

export default function Header() {
  const path = usePathname();
  const user = useUser();

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-1.5">
        {/* ロゴはトップへ。ログイン中ならホーム、未ログインなら LP が出る */}
        <Link href="/" className={`${item} -ml-2 gap-2 text-lg font-bold tracking-tight`}>
          <Logo /> Canaria
          <span className="rounded-md bg-primary-container px-1.5 py-0.5 text-xs font-medium text-on-primary-container">β版</span>
        </Link>

        {/* ログイン中: PC だけヘッダーに並べる。スマホは下のタブバーに任せる */}
        {user && (
          <nav aria-label="メインメニュー" className="-mr-2 hidden gap-4 text-sm whitespace-nowrap sm:flex">
            {nav.map(([href, label]) => (
              <Link key={href} href={href} aria-current={isCurrent(path, href) ? "page" : undefined}
                className={`${item} text-fg-2 hover:text-fg aria-[current=page]:font-bold aria-[current=page]:text-fg`}>
                {label}
              </Link>
            ))}
          </nav>
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

/** スマホの画面下に浮かぶタブバー（HIG の Tab bars）。ログイン中だけ出す */
export function TabBar() {
  const path = usePathname();
  const user = useUser();
  if (!user) return null;
  return (
    <>
      {/* 固定したバーが最後のコンテンツに被らないよう、同じ高さの余白を流れの中に置く */}
      <div aria-hidden className="h-24 sm:hidden" />
      <nav aria-label="メインメニュー"
        className="fixed inset-x-4 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-20 flex rounded-full border border-line bg-surface-1 p-1.5 shadow-lg sm:hidden">
        {nav.map(([href, label, icon]) => (
          <Link key={href} href={href} aria-current={isCurrent(path, href) ? "page" : undefined}
            className="flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-full text-xs text-fg-2 transition aria-[current=page]:bg-surface-raised aria-[current=page]:font-bold aria-[current=page]:text-tertiary aria-[current=page]:shadow-sm">
            <Icon name={icon} className="h-6 w-6" />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
