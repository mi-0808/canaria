"use client";
import { useEffect, useId, useRef } from "react";

// 下からせり上がるシート（PC では中央）。<dialog> の showModal に任せると、フォーカスの閉じ込め・Esc で閉じる・
// 背景を押せなくする、がブラウザ標準で付いてくる。自前で作ると漏れる所なので書かない
export default function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const d = ref.current!;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    // Esc でも onClose が呼ばれる。背景（::backdrop）を押したときも閉じる
    <dialog ref={ref} onClose={onClose} onClick={(e) => e.target === ref.current && onClose()} aria-labelledby={titleId}
      className="m-0 mt-auto w-full max-w-none rounded-t-3xl bg-surface text-fg backdrop:bg-secondary/50 sm:m-auto sm:max-w-md sm:rounded-3xl">
      {/* 余白はパネル内の目安（スマホ 24px / PC 32px）。下はホームバーを避ける */}
      <div className="space-y-6 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:p-8">
        <h2 id={titleId} className="text-lg font-bold leading-snug">{title}</h2>
        {children}
      </div>
    </dialog>
  );
}
