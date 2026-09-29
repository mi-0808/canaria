"use client";
import { useState } from "react";
import { Avatar } from "@/components/Portfolio";
import { newId, type Post, type Profile } from "@/lib/store";

const fmt = (t: number) => new Date(t).toLocaleString("ja-JP", { dateStyle: "short", timeStyle: "short" });

// onChange が無ければ閲覧のみ（共有された投稿ページ）
export default function PostItem({ post, author, onChange }: { post: Post; author: Profile; onChange?: (p: Post) => void }) {
  const [replying, setReplying] = useState(false);
  const [reply, setReply] = useState("");

  const share = async () => {
    await navigator.clipboard.writeText(`${location.origin}/p/${post.id}`);
    alert("リンクをコピーしました");
  };
  const sendReply = () => {
    onChange!({ ...post, replies: [...post.replies, { id: newId(), body: reply.trim(), createdAt: Date.now() }] });
    setReply("");
    setReplying(false);
  };
  const action = "rounded-lg px-2.5 py-1.5 transition hover:bg-zinc-100";

  return (
    <article className="card space-y-3 p-5">
      <div className="flex items-center gap-3">
        <Avatar src={author.icon} />
        <div>
          <p className="text-sm font-bold">{author.name || "名前未設定"}</p>
          <p className="font-mono text-[11px] text-zinc-400">{fmt(post.createdAt)}</p>
        </div>
        {post.media && (
          <span className="ml-auto rounded-md bg-yellow-100 px-2 py-0.5 font-mono text-[10px] text-yellow-800">{post.media.kind}</span>
        )}
      </div>
      {post.body && <p className="leading-relaxed whitespace-pre-wrap">{post.body}</p>}
      {post.media?.kind === "audio" && (
        <div className="rounded-xl bg-gradient-to-r from-yellow-100 to-amber-100 p-3"><audio controls src={post.media.src} className="w-full" /></div>
      )}
      {post.media?.kind === "video" && <video controls src={post.media.src} className="w-full rounded-xl bg-black" />}

      {post.replies.length > 0 && (
        <ul className="space-y-2 rounded-xl bg-zinc-50 p-3 text-sm">
          {post.replies.map((r) => (
            <li key={r.id} className="border-l-2 border-yellow-400 pl-3">
              {r.body} <span className="font-mono text-[11px] text-zinc-400">{fmt(r.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}

      {onChange && (
        <>
          <div className="-mx-2.5 flex gap-1 text-sm text-zinc-500">
            <button className={`${action} ${post.reacted ? "text-amber-500" : ""}`} onClick={() => onChange({ ...post, reacted: !post.reacted })}>
              {post.reacted ? "★" : "☆"} リアクション
            </button>
            <button className={action} onClick={() => setReplying(!replying)}>↩ 返信 {post.replies.length || ""}</button>
            <button className={action} onClick={share}>⇪ 共有</button>
            <button className={`${action} ml-auto ${post.saved ? "text-black" : ""}`} onClick={() => onChange({ ...post, saved: !post.saved })}>
              {post.saved ? "■ 保存済み" : "□ 保存"}
            </button>
          </div>
          {replying && (
            <div className="flex gap-2">
              <input className="input" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="返信を書く" />
              <button className="btn shrink-0" disabled={!reply.trim()} onClick={sendReply}>返信</button>
            </div>
          )}
        </>
      )}
    </article>
  );
}
