"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path d="M4 20 L14 8 L22 10 L30 6 L24 14 L20 26 L12 22 Z" fill="#FACC15" stroke="#0a0a0a" strokeWidth="2" strokeLinejoin="miter" />
      <circle cx="18" cy="12" r="1.5" fill="#0a0a0a" />
    </svg>
  );
}

const nav = [
  ["/timeline", "タイムライン"],
  ["/me", "マイページ"],
];

export default function Header() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200/60 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <Logo /> Canaria
          <span className="rounded-md bg-yellow-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-yellow-800">beta</span>
        </Link>
        <nav className="flex gap-1 rounded-xl bg-zinc-100/80 p-1 text-sm">
          {nav.map(([href, label]) => (
            <Link key={href} href={href}
              className={`rounded-lg px-3 py-1.5 transition ${path.startsWith(href) ? "bg-white font-medium shadow-sm" : "text-zinc-500 hover:text-black"}`}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
