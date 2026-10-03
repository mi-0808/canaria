"use client";
import Link from "next/link";
import { useState } from "react";
import FilePicker from "@/components/FilePicker";
import Icon from "@/components/Icon";
import { Avatar } from "@/components/Portfolio";
import PostItem from "@/components/PostItem";
import { FeedSkeleton } from "@/components/Skeleton";
import { createPost, loadProfile, loadTimeline, missingProfile, requiredProfile, useAuthedUser, useBusy, useLoad, type Post } from "@/lib/store";

const MAX_MB = 50; // media バケットの file_size_limit と揃える
const kinds = [["text", "テキスト", "pen"], ["audio", "音声", "mic"], ["video", "動画", "video"]] as const;

export default function Home() {
  const user = useAuthedUser();
  const [profile] = useLoad(() => user && loadProfile(user.id), [user]);
  const [posts, setPosts] = useLoad(() => user && loadTimeline(user.id), [user]);
  const [body, setBody] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);
  const [kind, setKind] = useState<(typeof kinds)[number][0]>("text");
  const [media, setMedia] = useState("");
  const [posting, run] = useBusy();
  if (!user || profile === undefined || !posts) return <FeedSkeleton />;

  const missing = profile ? missingProfile(profile) : requiredProfile.map(([, label]) => label);
  if (missing.length)
    return (
      <div className="mx-auto max-w-md space-y-5 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-container text-on-primary-container"><Icon name="lock" className="h-8 w-8" /></div>
        <h1 className="text-2xl font-bold tracking-tight">プロフィールを完成させよう</h1>
        <p className="text-sm text-fg-2">タイムラインは、プロフィールを完成させたユーザーだけが見られます。</p>
        <div className="flex flex-wrap justify-center gap-2">
          {missing.map((m) => <span key={m} className="rounded-lg bg-surface-2 px-2.5 py-1 text-sm text-fg-2">未入力: {m}</span>)}
        </div>
        <Link href="/me" className="btn-primary">プロフィールを編集する<Icon name="arrow" className="h-4 w-4" /></Link>
      </div>
    );

  const post = () =>
    run(async () => {
      await createPost(body.trim(), kind !== "text" && media ? { kind, src: media } : undefined);
      setPosts(await loadTimeline(user.id));
      setBody("");
      setMedia("");
      setKind("text");
    });
  const canPost = kind === "text" ? body.trim() : media;
  const update = (p: Post) => setPosts(posts.map((x) => (x.id === p.id ? p : x)));
  const shown = savedOnly ? posts.filter((p) => p.saved) : posts;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="card space-y-4 p-5">
        <div className="flex gap-3">
          <Avatar src={profile!.icon} />
          <textarea aria-label="投稿の本文" className="input min-h-24 resize-none border-0 px-0 focus:ring-0" placeholder={kind === "text" ? "制作の裏側を発信しよう" : "ひとこと（任意）"}
            value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        {kind !== "text" && <FilePicker key={kind} accept={`${kind}/*`} maxMB={MAX_MB} value={media} onChange={setMedia} />}
        {/* 種類の切り替えは中身がラジオボタン。矢印キーでの移動はブラウザ標準のまま使う */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <div role="radiogroup" aria-label="投稿の種類" className="segmented w-full sm:w-auto">
            {kinds.map(([k, label, icon]) => (
              <label key={k} className="segment">
                <input type="radio" name="kind" className="sr-only" checked={kind === k} onChange={() => { setKind(k); setMedia(""); }} />
                <Icon name={icon} className="h-4 w-4" />{label}
              </label>
            ))}
          </div>
          <button className="btn-primary ml-auto" disabled={!canPost || posting} onClick={post}>{posting ? "投稿中…" : "投稿する"}</button>
        </div>
      </div>

      <div role="radiogroup" aria-label="表示する投稿" className="segmented">
        {([[false, "すべて"], [true, "保存した投稿"]] as const).map(([saved, label]) => (
          <label key={label} className="segment">
            <input type="radio" name="filter" className="sr-only" checked={savedOnly === saved} onChange={() => setSavedOnly(saved)} />
            {label}
          </label>
        ))}
      </div>
      {shown.length === 0 && (
        <p className="py-10 text-center text-sm text-fg-2">{savedOnly ? "保存した投稿はまだありません" : "まだ投稿がありません。制作の裏側を最初に発信してみよう"}</p>
      )}
      <div className="space-y-4">
        {shown.map((p) => <PostItem key={p.id} post={p} uid={user.id} onChange={update} />)}
      </div>
    </div>
  );
}
