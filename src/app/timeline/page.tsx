"use client";
import Link from "next/link";
import { useState } from "react";
import FilePicker from "@/components/FilePicker";
import { Avatar } from "@/components/Portfolio";
import PostItem from "@/components/PostItem";
import { createPost, loadProfile, loadTimeline, missingProfile, requiredProfile, useAuthedUser, useLoad, type Post } from "@/lib/store";

const MAX_MB = 50; // media バケットの file_size_limit と揃える
const kinds = [["text", "✎ テキスト"], ["audio", "♪ 音声"], ["video", "▶ 動画"]] as const;

export default function Timeline() {
  const user = useAuthedUser();
  const [profile] = useLoad(() => user && loadProfile(user.id), [user]);
  const [posts, setPosts] = useLoad(() => user && loadTimeline(user.id), [user]);
  const [body, setBody] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);
  const [kind, setKind] = useState<(typeof kinds)[number][0]>("text");
  const [media, setMedia] = useState("");
  if (!user || profile === undefined || !posts) return null;

  const missing = profile ? missingProfile(profile) : requiredProfile.map(([, label]) => label);
  if (missing.length)
    return (
      <div className="mx-auto max-w-md space-y-5 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-200 to-amber-300 text-3xl">🔒</div>
        <h1 className="text-2xl font-bold tracking-tight">プロフィールを完成させよう</h1>
        <p className="text-sm text-zinc-600">タイムラインは、プロフィールを完成させたユーザーだけが見られます。</p>
        <div className="flex flex-wrap justify-center gap-2">
          {missing.map((m) => <span key={m} className="rounded-lg bg-zinc-100 px-2.5 py-1 font-mono text-xs text-zinc-600">未入力: {m}</span>)}
        </div>
        <Link href="/me" className="btn-primary">プロフィールを編集する →</Link>
      </div>
    );

  const post = async () => {
    await createPost(body.trim(), kind !== "text" && media ? { kind, src: media } : undefined);
    setPosts(await loadTimeline(user.id));
    setBody("");
    setMedia("");
    setKind("text");
  };
  const canPost = kind === "text" ? body.trim() : media;
  const update = (p: Post) => setPosts(posts.map((x) => (x.id === p.id ? p : x)));
  const shown = savedOnly ? posts.filter((p) => p.saved) : posts;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="card space-y-4 p-5">
        <div className="flex gap-3">
          <Avatar src={profile!.icon} />
          <textarea className="input min-h-24 resize-none border-0 px-0 focus:ring-0" placeholder={kind === "text" ? "制作の裏側を発信しよう" : "ひとこと（任意）"}
            value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        {kind !== "text" && <FilePicker key={kind} accept={`${kind}/*`} maxMB={MAX_MB} value={media} onChange={setMedia} />}
        <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
          <div className="flex gap-1 rounded-xl bg-zinc-100 p-1 text-xs">
            {kinds.map(([k, label]) => (
              <button key={k} onClick={() => { setKind(k); setMedia(""); }}
                className={`rounded-lg px-3 py-1.5 transition ${kind === k ? "bg-white font-medium shadow-sm" : "text-zinc-500 hover:text-black"}`}>
                {label}
              </button>
            ))}
          </div>
          <button className="btn-primary" disabled={!canPost} onClick={post}>投稿する</button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="label">{"// timeline"}</p>
        <button className="font-mono text-xs text-zinc-500 hover:text-black" onClick={() => setSavedOnly(!savedOnly)}>
          {savedOnly ? "← すべて表示" : "☆ 保存した投稿"}
        </button>
      </div>
      {shown.length === 0 && <p className="py-10 text-center font-mono text-sm text-zinc-400">no posts yet.</p>}
      <div className="space-y-4">
        {shown.map((p) => <PostItem key={p.id} post={p} uid={user.id} onChange={update} />)}
      </div>
    </div>
  );
}
