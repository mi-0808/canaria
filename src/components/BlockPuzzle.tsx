"use client";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Icon from "@/components/Icon";

// LPのヒーロー: ブロックをはめると、公開ページと同じ作品カードが完成するミニパズル。
// 枠とはめた後の中身は同じ高さ(h)にして、ぴったりはまるように見せる
const blocks = [
  {
    id: "image", label: "スクショ", icon: <Icon name="image" className="h-4 w-4" />, h: "h-32", piece: "bg-primary text-on-primary",
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
    id: "summary", label: "概要", icon: <Icon name="lines" className="h-4 w-4" />, h: "h-10", piece: "bg-surface",
    value: <p className="flex h-full items-center text-xs leading-relaxed text-fg-2">レシートを撮るだけで記録が終わる家計簿。企画から運用まで一人で担当。</p>,
  },
  {
    id: "techs", label: "使用技術", icon: "</>", h: "h-7", piece: "bg-secondary text-on-secondary",
    value: (
      <div className="flex h-full items-center gap-1.5">
        {["Next.js", "TypeScript", "Supabase"].map((t) => <span key={t} className="rounded-full bg-tertiary-container px-2 py-0.5 font-mono text-[10px] text-on-tertiary-container">{t}</span>)}
      </div>
    ),
  },
  {
    id: "url", label: "リンク", icon: <Icon name="external" className="h-4 w-4" />, h: "h-9", piece: "bg-tertiary text-on-tertiary",
    value: (
      <div className="flex h-full items-center">
        <span className="rounded-lg bg-tertiary-container px-3 py-1.5 text-xs font-bold text-on-tertiary-container">実際に触ってみる</span>
      </div>
    ),
  },
];
const trayOrder = ["techs", "image", "url", "title", "status", "summary"];

// 動きを減らす設定の人には、組み立てる動きを見せず、最初から完成形を出す（design.css の一括対応は CSS の動きだけで、
// ここの自動で組み立てる処理は JS のタイマーなので止まらない）
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  const tray = useRef<HTMLDivElement>(null);
  // キーボードではめたとき、押したボタンが消えてフォーカスが迷子にならないよう、次のブロック（完成なら「もう一回」）へ移す
  // flushSync で描き終えてから移す（requestAnimationFrame だと、裏のタブでは動かず移らないことがある）
  const placeByKey = (id: string) => {
    flushSync(() => {
      setTouched(true);
      setPlaced((p) => [...p, id]);
    });
    tray.current?.querySelector("button")?.focus();
  };

  // 放置していると、最初2.5秒後から0.6秒ごとに自動ではめていく。動きを減らす設定なら、すぐ全部はめる
  useEffect(() => {
    if (touched || done) return;
    const next = trayOrder.find((id) => !placed.includes(id))!;
    const t = reducedMotion() ? setTimeout(() => setPlaced(trayOrder)) : setTimeout(() => setPlaced((p) => [...p, next]), placed.length ? 600 : 2500);
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
      {/* 進み具合は読み上げで伝える。盤面そのものは作品カードの「絵」なので読み上げない */}
      <p className="sr-only" aria-live="polite">{done ? "作品カードが完成しました" : `${placed.length}/${blocks.length} 個はめました`}</p>
      {/* 盤面 = 完成後の作品カード */}
      <div data-board aria-hidden className={`card overflow-hidden transition duration-500 ${hover ? "ring-4 ring-primary-container" : ""} ${done ? "ring-2 ring-primary" : ""}`}>
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <span className="font-mono text-[11px] text-fg-3">canaria.app/@you</span>
          <span className={`font-mono text-[11px] font-bold ${done ? "text-success" : "text-fg-3"}`}>
            {done ? "公開中" : `${placed.length}/${blocks.length}`}
          </span>
        </div>
        <div className="space-y-2 p-3">
          {blocks.map((b) => {
            const filled = placed.includes(b.id);
            const target = drag?.id === b.id; // ドラッグ中は行き先の枠を光らせる
            return (
              <div key={b.id}
                className={`${b.h} rounded-lg transition ${filled ? "animate-drop" : `flex items-center justify-center border-2 border-dashed ${target ? "scale-[1.02] animate-pulse border-primary bg-primary-container" : "border-line bg-surface-1"}`}`}>
                {filled ? b.value : <span className="flex items-center gap-1.5 text-xs text-fg-3"><span className="font-mono">{b.icon}</span>{b.label}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* 手持ちのブロック */}
      <div ref={tray}>
      {done ? (
        <div className="flex justify-center">
          {/* 動きを減らす設定の人は自動で完成させたので、もう一回は自分の手で組み立てられるよう自動再生を止めたまま */}
          <button className="btn-sm animate-drop"
            onClick={() => {
              setPlaced([]);
              setTouched(reducedMotion());
            }}>
            もう一回あそぶ
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-center text-sm text-fg-2">ブロックをカードに放りこんで、作品ページを完成させよう</p>
          <div className="flex min-h-12 flex-wrap justify-center gap-2">
            {trayOrder.filter((id) => !placed.includes(id)).map((id) => {
              const b = blocks.find((x) => x.id === id)!;
              const active = drag?.id === id;
              return (
                // ボタンなのでキーボード（Enter / Space）でもはめられる。e.detail === 0 はキーボードで押されたとき。
                // ポインターは下の pointerup ではめるので、クリックでもう一度はめないようにする
                <button key={id} type="button" onClick={(e) => e.detail === 0 && placeByKey(id)}
                  onPointerDown={(e) => {
                    setTouched(true);
                    setDrag({ id, sx: e.clientX, sy: e.clientY, x: e.clientX, y: e.clientY, moved: false });
                  }}
                  style={active ? { transform: `translate(${drag.x - drag.sx}px, ${drag.y - drag.sy}px) rotate(-6deg) scale(1.1)` } : undefined}
                  className={`flex min-h-11 cursor-grab touch-none items-center gap-1.5 rounded-xl border-2 border-edge px-3 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fg shadow-[0_4px_0_0_var(--color-edge)] active:cursor-grabbing ${b.piece} ${active ? "pointer-events-none relative z-50 shadow-[0_12px_0_0_var(--color-edge)]" : "transition hover:-translate-y-1 hover:shadow-[0_6px_0_0_var(--color-edge)]"} ${miss === id ? "animate-shake" : ""}`}>
                  <span className="font-mono">{b.icon}</span>
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
