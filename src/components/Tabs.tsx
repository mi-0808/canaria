"use client";
import { useState } from "react";

// プロフィール下の「ポートフォリオ / 開発環境 / タイムライン」切り替え
export default function Tabs({ tabs }: { tabs: { label: string; count: number; content: React.ReactNode }[] }) {
  const [active, setActive] = useState(0);
  return (
    <section className="space-y-6">
      <div className="flex gap-1 border-b border-line">
        {tabs.map((t, i) => (
          <button key={t.label} onClick={() => setActive(i)}
            className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm transition ${i === active ? "border-primary font-bold" : "border-transparent text-fg-3 hover:text-fg"}`}>
            {t.label}
            <span className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] ${i === active ? "bg-primary-container text-on-primary-container" : "bg-surface-2"}`}>{t.count}</span>
          </button>
        ))}
      </div>
      {tabs[active].content}
    </section>
  );
}
