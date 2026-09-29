"use client";
import { useState } from "react";

// プロフィール下の「ポートフォリオ / 開発環境 / タイムライン」切り替え
export default function Tabs({ tabs }: { tabs: { label: string; count: number; content: React.ReactNode }[] }) {
  const [active, setActive] = useState(0);
  return (
    <section className="space-y-6">
      <div className="flex gap-1 border-b border-zinc-200">
        {tabs.map((t, i) => (
          <button key={t.label} onClick={() => setActive(i)}
            className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm transition ${i === active ? "border-yellow-400 font-bold" : "border-transparent text-zinc-500 hover:text-black"}`}>
            {t.label}
            <span className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] ${i === active ? "bg-yellow-100 text-yellow-800" : "bg-zinc-100"}`}>{t.count}</span>
          </button>
        ))}
      </div>
      {tabs[active].content}
    </section>
  );
}
