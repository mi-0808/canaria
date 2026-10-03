"use client";
import { useEffect, useState } from "react";

// LPのヒーロー: ブロックをはめると、公開ページと同じ作品カードが完成するミニパズル。
// 枠とはめた後の中身は同じ高さ(h)にして、ぴったりはまるように見せる
const blocks = [
  {
    id: "image", label: "スクショ", icon: "🖼", h: "h-32", piece: "bg-primary text-on-primary",
    value: (
      <div className="flex h-full flex-col overflow-hidden rounded-lg border border-line">
        <div className="flex items-center gap-1 border-b border-line px-2 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-line" /><span className="h-1.5 w-1.5 rounded-full bg-line" /><span className="h-1.5 w-1.5 rounded-full bg-line" />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-1 bg-primary text-on-primary">
          <span className="text-[11px] font-bold">家計簿、3秒でつけよう。</span>
          <span className="h-2 w-28 rounded-full bg-surface/80" />
        </div>
        <div className="grid grid-cols-4 gap-1.5 p-2">
          {[0, 1, 2, 3].map((i) => <span key={i} className="h-6 rounded bg-surface-2" />)}
        </div>
      </div>
    ),
  },
  {
    id: "status", label: "ステータス", icon: "●", h: "h-8", piece: "bg-primary-container text-on-primary-container",
    value: (
      <div className="flex h-full items-center gap-2">
        <span className="rounded-full bg-success-container px-2.5 py-1 text-[11px] font-bold text-on-success-container">● リリース・運用中</span>
        <span className="font-mono text-[11px] text-fg-3">2026 – 現在</span>
      </div>
    ),
  },
  { id: "title", label: "タイトル", icon: "T", h: "h-9", piece: "bg-surface", value: <p className="flex h-full items-center text-xl font-bold tracking-tight">3秒家計簿アプリ</p> },
  {
    id: "summary", label: "概要", icon: "≡", h: "h-10", piece: "bg-surface",
    value: <p className="flex h-full items-center text-xs leading-relaxed text-fg-2">レシートを撮るだけで記録が終わる家計簿。企画から運用まで一人で担当。</p>,
  },
  {
    id: "techs", label: "使用技術", icon: "</>", h: "h-7", piece: "bg-ink text-on-ink",
    value: (
      <div className="flex h-full items-center gap-1.5">
        {["Next.js", "TypeScript", "Supabase"].map((t) => <span key={t} className="rounded-full border border-line px-2 py-0.5 font-mono text-[10px] text-fg-2">{t}</span>)}
      </div>
    ),
  },
  {
    id: "url", label: "リンク", icon: "↗", h: "h-9", piece: "bg-primary text-on-primary",
    value: (
      <div className="flex h-full items-center">
        <span className="rounded-lg border-2 border-fg px-3 py-1.5 text-xs font-bold">実際に触ってみる ↗</span>
      </div>
    ),
  },
];
const trayOrder = ["techs", "image", "url", "title", "status", "summary"];

type Drag = { id: string; sx: number; sy: number; x: number; y: number; moved: boolean };
// カードのどこに落としても、そのピースの枠へ自動ではまる（小さな枠を狙わせない）
const onBoard = (x: number, y: number) => !!document.elementFromPoint(x, y)?.closest("[data-board]");

export default function BlockPuzzle() {
  const [placed, setPlaced] = useState<string[]>([]);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [hover, setHover] = useState(false);
  const [miss, setMiss] = useState<string>();
  const [touched, setTouched] = useState(false); // 一度でも触ったら自動再生をやめる
  const done = placed.length === blocks.length;

  // 放置していると、最初2.5秒後から0.6秒ごとに自動ではめていく
  useEffect(() => {
    if (touched || done) return;
    const next = trayOrder.find((id) => !placed.includes(id))!;
    const t = setTimeout(() => setPlaced((p) => [...p, next]), placed.length ? 600 : 2500);
    return () => clearTimeout(t);
  }, [touched, done, placed]);

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      setDrag((d) => d && { ...d, x: e.clientX, y: e.clientY, moved: d.moved || Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 5 });
      setHover(onBoard(e.clientX, e.clientY));
    };
    const up = (e: PointerEvent) => {
      // タップ、またはカードの上で離したらはまる
      if (!drag.moved || onBoard(e.clientX, e.clientY)) setPlaced((p) => [...p, drag.id]);
      else {
        setMiss(drag.id);
        setTimeout(() => setMiss(undefined), 400);
      }
      setDrag(null);
      setHover(false);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [drag]);

  return (
    <div className="relative space-y-4 select-none">
      {/* 盤面 = 完成後の作品カード */}
      <div data-board className={`card overflow-hidden transition duration-500 ${hover ? "ring-4 ring-primary-container" : ""} ${done ? "ring-2 ring-primary" : ""}`}>
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <span className="font-mono text-[11px] text-fg-3">canaria.app/@you</span>
          <span className={`font-mono text-[11px] font-bold ${done ? "text-success" : "text-fg-3"}`}>
            {done ? "✓ 公開中" : `${placed.length}/${blocks.length}`}
          </span>
        </div>
        <div className="space-y-2 p-3">
          {blocks.map((b) => {
            const filled = placed.includes(b.id);
            const target = drag?.id === b.id; // ドラッグ中は行き先の枠を光らせる
            return (
              <div key={b.id}
                className={`${b.h} rounded-lg transition ${filled ? "animate-drop" : `flex items-center justify-center border-2 border-dashed ${target ? "scale-[1.02] animate-pulse border-primary bg-primary-container" : "border-line bg-surface-1"}`}`}>
                {filled ? b.value : <span className="font-mono text-[10px] text-fg-3">{b.icon} {b.label}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* 手持ちのブロック */}
      {done ? (
        <button className="animate-drop w-full font-mono text-xs text-fg-3 hover:text-fg"
          onClick={() => {
            setPlaced([]);
            setTouched(false);
          }}>
          ↻ もう一回あそぶ
        </button>
      ) : (
        <div className="space-y-2">
          <p className="text-center font-mono text-[11px] text-fg-3">▲ ブロックをカードに放りこんで、作品ページを完成させよう</p>
          <div className="flex min-h-12 flex-wrap justify-center gap-2">
            {trayOrder.filter((id) => !placed.includes(id)).map((id) => {
              const b = blocks.find((x) => x.id === id)!;
              const active = drag?.id === id;
              return (
                <div key={id}
                  onPointerDown={(e) => {
                    setTouched(true);
                    setDrag({ id, sx: e.clientX, sy: e.clientY, x: e.clientX, y: e.clientY, moved: false });
                  }}
                  style={active ? { transform: `translate(${drag.x - drag.sx}px, ${drag.y - drag.sy}px) rotate(-6deg) scale(1.1)` } : undefined}
                  className={`flex cursor-grab touch-none items-center gap-1.5 rounded-xl border-2 border-fg px-3 py-2 text-xs font-bold shadow-[0_4px_0_0_var(--color-fg)] active:cursor-grabbing ${b.piece} ${active ? "pointer-events-none relative z-50 shadow-[0_12px_0_0_var(--color-fg)]" : "transition hover:-translate-y-1 hover:shadow-[0_6px_0_0_var(--color-fg)]"} ${miss === id ? "animate-shake" : ""}`}>
                  <span className="font-mono">{b.icon}</span>
                  {b.label}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
