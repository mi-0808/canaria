"use client";
import { useId, useRef, useState } from "react";

// プロフィール下の「作品 / 開発環境 / 投稿」切り替え。見た目は下線のタブ、中身は WAI-ARIA のタブ
// （読み上げで「タブ 1/3 選択中」と伝わる。矢印キーで移り、Tab キーではパネルへ進む）
export default function Tabs({ tabs }: { tabs: { label: string; content: React.ReactNode }[] }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const move = (i: number) => {
    const n = (i + tabs.length) % tabs.length;
    setActive(n);
    refs.current[n]?.focus();
  };
  return (
    <section className="space-y-6">
      <div role="tablist" className="tabs"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") move(active + 1);
          if (e.key === "ArrowLeft") move(active - 1);
        }}>
        {tabs.map((t, i) => (
          <button key={t.label} ref={(el) => { refs.current[i] = el; }} role="tab" id={`${id}-${i}`} aria-selected={i === active}
            aria-controls={`${id}-panel`} tabIndex={i === active ? 0 : -1} className="tab" onClick={() => setActive(i)}>
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-${active}`}>{tabs[active].content}</div>
    </section>
  );
}
