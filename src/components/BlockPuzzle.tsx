"use client";
import { useEffect, useState } from "react";

// LPのヒーロー: 作品情報のブロックを枠にはめると公開される、ミニパズル
const blocks = [
  { id: "image", label: "トップ画像", mini: "🖼", span: "col-span-3", color: "border-yellow-300 bg-gradient-to-br from-yellow-200 to-amber-300", value: <div className="flex h-20 items-center justify-center text-3xl">🖼</div> },
  { id: "title", label: "タイトル", mini: "家計簿アプリ", span: "col-span-2", color: "border-zinc-300 bg-white", value: <p className="text-sm font-bold">家計簿アプリ</p> },
  { id: "progress", label: "進捗率", mini: "80%", span: "", color: "border-amber-300 bg-amber-50", value: <p className="font-mono text-sm font-bold">80%</p> },
  { id: "period", label: "期間", mini: "2026/04–09", span: "", color: "border-zinc-300 bg-white", value: <p className="text-xs font-medium">2026/04–09</p> },
  { id: "role", label: "役割", mini: "フロント", span: "", color: "border-zinc-300 bg-white", value: <p className="text-xs font-medium">フロント</p> },
  { id: "url", label: "成果物URL", mini: "↗ demo", span: "", color: "border-yellow-300 bg-yellow-50", value: <p className="font-mono text-xs font-medium">↗ demo</p> },
];
const trayOrder = ["role", "image", "url", "title", "period", "progress"];

type Drag = { id: string; sx: number; sy: number; x: number; y: number; moved: boolean };
const slotAt = (x: number, y: number) => (document.elementFromPoint(x, y)?.closest("[data-slot]") as HTMLElement | null)?.dataset.slot;

export default function BlockPuzzle() {
  const [placed, setPlaced] = useState<string[]>([]);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [hover, setHover] = useState<string>();
  const [miss, setMiss] = useState<string>();
  const done = placed.length === blocks.length;

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      setDrag((d) => d && { ...d, x: e.clientX, y: e.clientY, moved: d.moved || Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 5 });
      setHover(slotAt(e.clientX, e.clientY));
    };
    const up = (e: PointerEvent) => {
      // クリックだけなら自動ではめる。ドラッグなら正しい枠に落とした時だけはまる
      if (!drag.moved || slotAt(e.clientX, e.clientY) === drag.id) setPlaced((p) => [...p, drag.id]);
      else {
        setMiss(drag.id);
        setTimeout(() => setMiss(undefined), 400);
      }
      setDrag(null);
      setHover(undefined);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [drag]);

  return (
    <div className="card relative space-y-4 p-4 select-none">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold">作品を追加</span>
        <span className="font-mono text-[11px] text-zinc-400">{placed.length}/{blocks.length} blocks</span>
      </div>

      {/* 盤面 */}
      <div className="grid grid-cols-3 gap-2">
        {blocks.map((b) =>
          placed.includes(b.id) ? (
            <div key={b.id} className={`animate-drop rounded-xl border-2 p-2.5 ${b.span} ${b.color}`}>
              <p className="font-mono text-[10px] opacity-60">{b.label}</p>
              {b.value}
            </div>
          ) : (
            <div key={b.id} data-slot={b.id}
              className={`flex items-center justify-center rounded-xl border-2 border-dashed p-2.5 transition ${b.span} ${b.id === "image" ? "h-[6.9rem]" : "h-[3.7rem]"} ${hover === b.id ? (drag?.id === b.id ? "scale-[1.03] border-yellow-400 bg-yellow-50" : "border-red-300 bg-red-50") : "border-zinc-200 bg-zinc-50/50"}`}>
              <span className="font-mono text-[10px] text-zinc-300">{b.label}</span>
            </div>
          ),
        )}
      </div>

      {/* 手持ちのブロック / 公開完了 */}
      {done ? (
        <div className="animate-drop space-y-2">
          <div className="flex items-center justify-between rounded-xl bg-black px-4 py-3 text-white">
            <span className="font-mono text-xs text-yellow-300">✓ 公開しました</span>
            <span className="font-mono text-[11px] text-zinc-400">canaria.app/@you</span>
          </div>
          <button className="w-full font-mono text-[11px] text-zinc-400 hover:text-black" onClick={() => setPlaced([])}>↻ もう一回</button>
        </div>
      ) : (
        <div className="space-y-2 rounded-xl bg-zinc-100 p-3">
          <p className="text-center font-mono text-[10px] text-zinc-500">ブロックをドラッグして枠にはめよう（タップでもOK）</p>
          <div className="flex min-h-10 flex-wrap justify-center gap-2">
            {trayOrder.filter((id) => !placed.includes(id)).map((id) => {
              const b = blocks.find((x) => x.id === id)!;
              const active = drag?.id === id;
              return (
                <div key={id}
                  onPointerDown={(e) => setDrag({ id, sx: e.clientX, sy: e.clientY, x: e.clientX, y: e.clientY, moved: false })}
                  style={active ? { transform: `translate(${drag.x - drag.sx}px, ${drag.y - drag.sy}px) rotate(-4deg) scale(1.08)` } : undefined}
                  className={`cursor-grab touch-none rounded-lg border-2 px-3 py-2 shadow-md active:cursor-grabbing ${b.color} ${active ? "pointer-events-none relative z-50 shadow-xl" : "transition hover:-translate-y-1 hover:shadow-lg"} ${miss === id ? "animate-shake" : ""}`}>
                  <p className="font-mono text-[9px] opacity-60">{b.label}</p>
                  <p className="text-xs font-bold whitespace-nowrap">{b.mini}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
