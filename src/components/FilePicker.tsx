"use client";
import { useState } from "react";
import Icon from "@/components/Icon";
import { WorkImage } from "@/components/Portfolio";
import { upload } from "@/lib/store";

// ネイティブのファイル入力を隠し、プレビュー付きのドロップゾーン風UIにする。
// 「変更」はホバーで出さず常に見せる（スマホにはホバーが無い）。キーボードで入力欄に来たら枠に focus を出す
const focus = "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-fg";

export default function FilePicker({
  value, onChange, accept = "image/*", shape = "wide", maxMB,
}: {
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  shape?: "wide" | "cover" | "round"; // cover: プロフィールのカバー画像（3:1）
  maxMB?: number;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  // ponytail: 選んだ時点でアップロード。キャンセルされたファイルは Storage に残る
  const pick = async (file?: File) => {
    if (!file) return;
    if (maxMB && file.size > maxMB * 1024 * 1024) return setError(`${maxMB}MB以下のファイルを選んでください`);
    setError("");
    setUploading(true);
    try {
      onChange(await upload(file));
    } finally {
      setUploading(false);
    }
  };
  const input = <input type="file" accept={accept} className="sr-only" disabled={uploading} onChange={(e) => pick(e.target.files?.[0])} />;
  const isImage = accept.startsWith("image");
  const errorText = error && <p role="alert" className="text-sm text-error">{error}</p>;

  if (shape === "round")
    return (
      <div className="flex items-center gap-4">
        <label className={`relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-outline bg-surface-1 transition hover:border-primary ${focus}`}>
          {input}
          {uploading ? <span className="flex h-full items-center justify-center text-xs text-fg-3">送信中…</span>
            : value ? <img src={value} alt="" className="h-full w-full object-cover" />
            : <span className="flex h-full items-center justify-center text-fg-3"><Icon name="plus" className="h-6 w-6" /></span>}
        </label>
        <div className="space-y-1 text-sm text-fg-2">
          <p>{value ? "画像を押すと変更できます" : "画像を選ぶ"}</p>
          <p className="text-fg-3">正方形がおすすめ</p>
          {errorText}
        </div>
      </div>
    );

  return (
    <div className="space-y-2">
      <label className={`relative flex ${shape === "cover" ? "aspect-3/1" : isImage ? "aspect-video" : "h-28"} w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed border-outline bg-surface-1 transition hover:border-primary hover:bg-primary-container/50 ${focus}`}>
        {input}
        {uploading ? (
          <span className="text-sm text-fg-3">送信中…</span>
        ) : value && isImage ? (
          <>
            {/* 横長の画像の入力欄は作品のトップ画像だけなので、公開ページと同じ見せ方（縦長ならスマホの形）にする */}
            <WorkImage src={value} className="absolute inset-0" />
            <span className="absolute right-2 bottom-2 inline-flex items-center gap-1.5 rounded-lg bg-surface px-2.5 py-1 text-sm text-fg shadow-sm">
              <Icon name="upload" className="h-4 w-4" />変更
            </span>
          </>
        ) : value ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-fg-2"><Icon name="check" className="h-4 w-4 text-success" />選択済み（押すと変更）</span>
        ) : (
          <>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-fg-3 shadow-sm"><Icon name="upload" /></span>
            <span className="text-sm text-fg-2">{isImage ? "画像を選ぶ" : "ファイルを選ぶ"}</span>
            {maxMB && <span className="text-xs text-fg-3">{maxMB}MBまで</span>}
          </>
        )}
      </label>
      {errorText}
    </div>
  );
}

/**
 * 投稿欄の「カメラロール・カメラ」のアイコンボタン（トップの投稿と開発環境のアイテムで使う）。
 * capture なし = カメラロール（写真ライブラリ）から選ぶ。capture あり = OS 標準のカメラを直接立ち上げる。
 * PC の capture はファイル選択と同じになるので、カメラは指で操作する端末（pointer: coarse）にだけ出す。
 * キーボードで来たら枠に focus を出す
 */
export function AttachButtons({ accept, label, disabled, onPick }: { accept: string; label: string; disabled: boolean; onPick: (file?: File) => void }) {
  return (
    <div className="-ml-2.5 flex gap-2">
      {([["image", label, undefined, "inline-flex"], ["camera", "カメラで撮る", "environment", "hidden pointer-coarse:inline-flex"]] as const).map(([icon, text, capture, display]) => (
        <label key={icon} className={`${display} min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg text-tertiary transition hover:bg-tertiary-container ${focus} ${disabled ? "pointer-events-none opacity-40" : ""}`}>
          <input type="file" accept={accept} capture={capture} className="sr-only" disabled={disabled}
            onChange={(e) => { onPick(e.target.files?.[0]); e.target.value = ""; }} />
          <Icon name={icon} className="h-6 w-6" /><span className="sr-only">{text}</span>
        </label>
      ))}
    </div>
  );
}

/** 添付した画像・動画の右上の「外す」。見た目 32px、当たり判定は ::before で 44px */
export function RemoveAttachment({ onClick }: { onClick: () => void }) {
  return (
    <button aria-label="添付を外す" onClick={onClick}
      className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-on-secondary before:absolute before:-inset-1.5 before:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg">
      <Icon name="x" className="h-4 w-4" />
    </button>
  );
}
