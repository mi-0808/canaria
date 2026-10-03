"use client";
import Link from "next/link";
import { useState } from "react";
import Icon from "@/components/Icon";
import { Avatar } from "@/components/Portfolio";
import { addReply, loadPost, toggle, useBusy, type Post } from "@/lib/store";

const fmt = (t: string) => new Date(t).toLocaleString("ja-JP", { dateStyle: "short", timeStyle: "short" });
// 押せる高さ 44px。スマホでは文字を隠してアイコンだけにする（4つ並べると 375px に入らない）。文字は読み上げには残る
const action = "inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-lg px-2.5 transition hover:bg-surface-2 hover:text-fg disabled:opacity-40";
const label = "sr-only sm:not-sr-only";

// uid（閲覧中のユーザー）と onChange が無ければ閲覧のみ
export default function PostItem({ post, uid, onChange }: { post: Post; uid?: string; onChange?: (p: Post) => void }) {
  const [replying, setReplying] = useState(false);
  const [reply, setReply] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, run] = useBusy();

  // スマホは OS の共有シートを出す（HIG の Share）。無いブラウザではリンクをコピーし、ボタンの文字で知らせる（alert で操作を止めない）
  const share = async () => {
    const url = `${location.origin}/@${post.author.username}/posts/${post.id}`;
    if (navigator.share) return navigator.share({ url }).catch(() => {}); // 閉じられたときも何もしない
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  // 書き込み後はその投稿だけ取り直す
  const write = (fn: () => Promise<unknown>) =>
    run(async () => {
      await fn();
      const fresh = await loadPost(post.id, uid);
      if (fresh) onChange!(fresh);
    });
  const sendReply = () =>
    write(async () => {
      await addReply(post.id, reply.trim());
      setReply("");
      setReplying(false);
    });

  return (
    <article className="card space-y-3 p-5">
      <div className="flex items-center gap-3">
        <Link href={`/@${post.author.username}`}><Avatar src={post.author.icon} /></Link>
        <div>
          <Link href={`/@${post.author.username}`} className="text-sm font-bold hover:underline">{post.author.name || "名前未設定"}</Link>
          <p><time dateTime={post.created_at} className="text-xs text-fg-3">{fmt(post.created_at)}</time></p>
        </div>
      </div>
      {post.body && <p className="leading-relaxed whitespace-pre-wrap">{post.body}</p>}
      {post.media?.kind === "audio" && (
        <div className="rounded-xl bg-primary-container p-3"><audio controls src={post.media.src} className="w-full" /></div>
      )}
      {post.media?.kind === "video" && <video controls src={post.media.src} className="w-full rounded-xl bg-secondary" />}

      {post.replies.length > 0 && (
        <ul className="space-y-2 rounded-xl bg-surface-1 p-3 text-sm">
          {post.replies.map((r) => (
            <li key={r.id} className="border-l-2 border-primary pl-3">
              <span className="font-bold">{r.author.name}</span> {r.body}{" "}
              <time dateTime={r.created_at} className="text-xs text-fg-3">{fmt(r.created_at)}</time>
            </li>
          ))}
        </ul>
      )}

      {uid && onChange && (
        <>
          {/* 押してある状態は色だけでなく、アイコンの塗りと aria-pressed でも伝える */}
          <div className="-mx-2.5 flex gap-1 text-sm text-fg-2">
            <button className={`${action} ${post.reacted ? "text-fg" : ""}`} aria-pressed={post.reacted} disabled={busy}
              onClick={() => write(() => toggle("reactions", post, !post.reacted))}>
              <Icon name="star" filled={post.reacted} /><span className={label}>リアクション</span>
            </button>
            <button className={action} aria-expanded={replying} onClick={() => setReplying(!replying)}>
              <Icon name="reply" /><span className={label}>返信</span>
              {post.replies.length > 0 && <span className="tabular-nums">{post.replies.length}</span>}
            </button>
            <button className={action} onClick={share}>
              <Icon name={copied ? "check" : "share"} />
              {/* コピーしたことは読み上げにも伝える */}
              <span className={label} aria-live="polite">{copied ? "コピーしました" : "共有"}</span>
            </button>
            <button className={`${action} ml-auto ${post.saved ? "text-fg" : ""}`} aria-pressed={post.saved} disabled={busy}
              onClick={() => write(() => toggle("saves", post, !post.saved))}>
              <Icon name="bookmark" filled={post.saved} /><span className={label}>{post.saved ? "保存済み" : "保存"}</span>
            </button>
          </div>
          {replying && (
            <div className="flex gap-2">
              <input className="input" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="返信を書く" aria-label="返信" />
              <button className="btn shrink-0" disabled={!reply.trim() || busy} onClick={sendReply}>{busy ? "送信中…" : "返信"}</button>
            </div>
          )}
        </>
      )}
    </article>
  );
}
