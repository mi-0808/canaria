"use client";
import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/Portfolio";
import { addReply, loadPost, toggle, type Post } from "@/lib/store";

const fmt = (t: string) => new Date(t).toLocaleString("ja-JP", { dateStyle: "short", timeStyle: "short" });

// uid（閲覧中のユーザー）と onChange が無ければ閲覧のみ
export default function PostItem({ post, uid, onChange }: { post: Post; uid?: string; onChange?: (p: Post) => void }) {
  const [replying, setReplying] = useState(false);
  const [reply, setReply] = useState("");

  const share = async () => {
    await navigator.clipboard.writeText(`${location.origin}/p/${post.id}`);
    alert("リンクをコピーしました");
  };
  // 書き込み後はその投稿だけ取り直す
  const run = async (write: Promise<unknown>) => {
    await write;
    const fresh = await loadPost(post.id, uid);
    if (fresh) onChange!(fresh);
  };
  const sendReply = async () => {
    await run(addReply(post.id, reply.trim()));
    setReply("");
    setReplying(false);
  };
  const action = "rounded-lg px-2.5 py-1.5 transition hover:bg-zinc-100";

  return (
    <article className="card space-y-3 p-5">
      <div className="flex items-center gap-3">
        <Link href={`/u/${post.author.id}`}><Avatar src={post.author.icon} /></Link>
        <div>
          <Link href={`/u/${post.author.id}`} className="text-sm font-bold hover:underline">{post.author.name || "名前未設定"}</Link>
          <p className="font-mono text-[11px] text-zinc-400">{fmt(post.created_at)}</p>
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
              <span className="font-bold">{r.author.name}</span> {r.body} <span className="font-mono text-[11px] text-zinc-400">{fmt(r.created_at)}</span>
            </li>
          ))}
        </ul>
      )}

      {uid && onChange && (
        <>
          <div className="-mx-2.5 flex gap-1 text-sm text-zinc-500">
            <button className={`${action} ${post.reacted ? "text-amber-500" : ""}`} onClick={() => run(toggle("reactions", post, !post.reacted))}>
              {post.reacted ? "★" : "☆"} リアクション
            </button>
            <button className={action} onClick={() => setReplying(!replying)}>↩ 返信 {post.replies.length || ""}</button>
            <button className={action} onClick={share}>⇪ 共有</button>
            <button className={`${action} ml-auto ${post.saved ? "text-black" : ""}`} onClick={() => run(toggle("saves", post, !post.saved))}>
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
