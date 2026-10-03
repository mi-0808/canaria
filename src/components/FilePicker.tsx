"use client";
import { useState } from "react";
import { upload } from "@/lib/store";

// ネイティブのファイル入力を隠し、プレビュー付きのドロップゾーン風UIにする
export default function FilePicker({
  value, onChange, accept = "image/*", shape = "wide", maxMB,
}: {
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  shape?: "wide" | "round";
  maxMB?: number;
}) {
  const [uploading, setUploading] = useState(false);
  // ponytail: 選んだ時点でアップロード。キャンセルされたファイルは Storage に残る
  const pick = async (file?: File) => {
    if (!file) return;
    if (maxMB && file.size > maxMB * 1024 * 1024) return alert(`${maxMB}MB以下のファイルを選んでください`);
    setUploading(true);
    try {
      onChange(await upload(file));
    } finally {
      setUploading(false);
    }
  };
  const input = <input type="file" accept={accept} className="sr-only" disabled={uploading} onChange={(e) => pick(e.target.files?.[0])} />;
  const isImage = accept.startsWith("image");

  if (shape === "round")
    return (
      <div className="flex items-center gap-4">
        <label className="group relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-zinc-300 bg-zinc-50 transition hover:border-yellow-400">
          {input}
          {uploading ? <span className="flex h-full items-center justify-center font-mono text-[10px] text-zinc-500">uploading…</span>
            : value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-2xl text-zinc-400">＋</span>}
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs text-white opacity-0 transition group-hover:opacity-100">変更</span>
        </label>
        <p className="text-xs text-zinc-500">クリックして画像を選択<br />正方形がおすすめ</p>
      </div>
    );

  return (
    <label className={`group relative flex ${isImage ? "aspect-video" : "h-28"} w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 transition hover:border-yellow-400 hover:bg-yellow-50/50`}>
      {input}
      {uploading ? (
        <span className="font-mono text-sm text-zinc-500">アップロード中…</span>
      ) : value && isImage ? (
        <>
          <img src={value} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm text-white opacity-0 transition group-hover:opacity-100">画像を変更</span>
        </>
      ) : value ? (
        <span className="font-mono text-sm text-zinc-700">✓ ファイルを選択済み（クリックで変更）</span>
      ) : (
        <>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl text-zinc-400 shadow-sm">↑</span>
          <span className="text-sm text-zinc-600">クリックしてファイルを選択</span>
          {maxMB && <span className="font-mono text-xs text-zinc-400">max {maxMB}MB</span>}
        </>
      )}
    </label>
  );
}
