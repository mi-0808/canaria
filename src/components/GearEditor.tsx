"use client";
import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import { AttachButtons, RemoveAttachment } from "@/components/FilePicker";
import Icon from "@/components/Icon";
import { amazonProductUrl, amazonSearchUrl, amazonShortLink } from "@/lib/links.mjs";
import { upload, type Gear } from "@/lib/store";

const MAX_COMMENT = 80; // DB の check と揃える

/**
 * 開発環境のアイテムの編集（シートの中身）。トップの投稿欄と同じ形: 検索 → キャプション（おすすめポイント）→ 写真。
 * 登録できるのは Amazon の商品だけ。貼ったリンクは ASIN だけ残して保存し、表示のときに運営のタグを付ける（他人のタグは残らない）。
 * 写真のアップロードは親の useBusy で回す（アップロード中は保存を止めるため）
 */
export default function GearEditor({ gear, setGear, uploading, runUpload }: {
  gear: Gear;
  setGear: Dispatch<SetStateAction<Gear | null>>;
  uploading: boolean;
  runUpload: (fn: () => Promise<unknown>) => Promise<void>;
}) {
  const [link, setLink] = useState(""); // 貼り付け欄の中身
  const [error, setError] = useState("");
  const [resolving, setResolving] = useState(false);
  const latest = useRef(""); // 短縮リンクを展開している間に書き換えられたら、古い結果を捨てる
  // シートを閉じたあとに結果が届いても開き直さない（g が null なら何もしない）
  const patch = (p: Partial<Gear>) => setGear((g) => g && { ...g, ...p });

  const paste = async (text: string) => {
    latest.current = text;
    setLink(text);
    setError("");
    setResolving(false);
    if (!text.trim()) return;
    const url = amazonProductUrl(text);
    if (url) return patch({ url });
    if (!amazonShortLink(text)) return setError("Amazon の商品ページのリンクを貼ってください");
    setResolving(true);
    const res = await fetch(`/api/amazon?u=${encodeURIComponent(text)}`).catch(() => null);
    const found: string | undefined = res?.ok ? (await res.json()).url : undefined;
    if (latest.current !== text) return;
    setResolving(false);
    if (found) patch({ url: found });
    else setError("リンクから商品を読めませんでした。商品ページの URL を貼ってください");
  };
  const unlink = () => {
    patch({ url: "" });
    paste("");
  };
  // ponytail: 選んだ時点でアップロード。外した・差し替えた写真は Storage に残る。失敗は upload の中（must）で知らせる
  const pick = (file?: File) => file && runUpload(() => upload(file).then((image) => patch({ image }), () => {}));

  return (
    <>
      {/* 検索: 名前で Amazon を開き、見つけた商品のリンクを貼ってもらう（アプリ内検索は API の条件待ち。src/lib/links.mjs） */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input type="search" aria-label="アイテム名" className="input min-w-0 flex-1" placeholder="商品名で検索" value={gear.name} onChange={(e) => patch({ name: e.target.value })} />
          {gear.name.trim() ? (
            <a href={amazonSearchUrl(gear.name)} target="_blank" rel="noopener noreferrer sponsored" className="btn shrink-0">
              Amazonで探す<Icon name="external" className="h-4 w-4" />
            </a>
          ) : (
            <button className="btn shrink-0" disabled>Amazonで探す</button>
          )}
        </div>
        {gear.url ? (
          <div className="flex items-center gap-3 rounded-xl border border-line py-1 pl-3">
            <Icon name="check" className="h-5 w-5 shrink-0 text-success" />
            <a href={gear.url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate font-mono text-sm text-tertiary hover:underline">
              {gear.url.replace("https://www.", "")}
            </a>
            <button aria-label="商品のリンクを外す" onClick={unlink}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-fg-2 transition hover:bg-surface-1 focus-visible:outline-2 focus-visible:outline-fg">
              <Icon name="x" className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <>
            <input type="url" inputMode="url" aria-label="見つけた商品のリンク" className="input" placeholder="見つけた商品のリンクを貼る"
              value={link} aria-invalid={!!error} onChange={(e) => paste(e.target.value)} />
            {resolving ? <p className="text-sm text-fg-3">商品を確かめています…</p>
              : error ? <p role="alert" className="text-sm text-error">{error}</p>
              : <p className="text-sm text-fg-3">Amazon で商品を開き、共有からリンクをコピーして貼ってください</p>}
          </>
        )}
      </div>

      <textarea aria-label="おすすめポイント" className="input min-h-24 resize-none border-0 px-0 focus:ring-0" maxLength={MAX_COMMENT}
        placeholder="おすすめポイント（任意）" value={gear.comment} onChange={(e) => patch({ comment: e.target.value })} />

      {uploading && <p className="text-sm text-fg-3">送信中…</p>}
      {gear.image && !uploading && (
        <div className="relative w-fit">
          <img src={gear.image} alt="添付した写真" className="max-h-60 rounded-xl" />
          <RemoveAttachment onClick={() => patch({ image: "" })} />
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
        <AttachButtons accept="image/*" label="写真を選ぶ" disabled={uploading} onPick={pick} />
        <span className="text-sm text-fg-3">{gear.comment.length}/{MAX_COMMENT}</span>
      </div>
    </>
  );
}
