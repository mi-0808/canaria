"use client";
import { useId, useLayoutEffect, useRef } from "react";

// 下からせり上がるシート（PC では中央）。<dialog> の showModal に任せると、フォーカスの閉じ込め・Esc で閉じる・
// 背景を押せなくする、がブラウザ標準で付いてくる。自前で作ると漏れる所なので書かない
export default function Sheet({ open, onClose, title, children, footer, dismissible = true }: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** 下に固定するボタン（キャンセル・保存）。中身が長くても常に見える */
  footer?: React.ReactNode;
  /** false: 背景のタップと Esc では閉じない。入力の途中で誤って閉じ、書いたものが消えるのを防ぐ（フォーム用） */
  dismissible?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  // 描画より前に開閉する。useEffect だと「中身が空になったシート」が一瞬見えてから閉じる
  useLayoutEffect(() => {
    const d = ref.current!;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog ref={ref} onClose={onClose} aria-labelledby={titleId}
      onCancel={(e) => !dismissible && e.preventDefault()}
      onClick={(e) => dismissible && e.target === ref.current && onClose()}
      className="m-0 mt-auto max-h-[92dvh] w-full max-w-none flex-col overflow-hidden rounded-t-3xl bg-surface text-fg backdrop:bg-secondary/50 open:flex sm:m-auto sm:max-w-lg sm:rounded-3xl">
      {/* 余白はパネル内の目安（スマホ 24px / PC 32px）。下に固定のボタンが無いときは、ホームバーを避ける */}
      <div className={`space-y-6 overflow-y-auto p-6 sm:p-8 ${footer ? "" : "pb-[max(1.5rem,env(safe-area-inset-bottom))]"}`}>
        <h2 id={titleId} className="text-lg font-bold leading-snug">{title}</h2>
        {children}
      </div>
      {footer && <div className="border-t border-line px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-8">{footer}</div>}
    </dialog>
  );
}
