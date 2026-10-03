"use client";
import Link from "next/link";
import { useState } from "react";
import Icon from "@/components/Icon";
import { Avatar } from "@/components/Portfolio";
import PostItem from "@/components/PostItem";
import { FeedSkeleton } from "@/components/Skeleton";
import { createPost, loadProfile, loadTimeline, missingProfile, requiredProfile, upload, useAuthedUser, useBusy, useLoad, type Post } from "@/lib/store";

const MAX_MB = 50; // media バケットの file_size_limit と揃える

export default function Home() {
  const user = useAuthedUser();
  const [profile] = useLoad(() => user && loadProfile(user.id), [user]);
  const [posts, setPosts] = useLoad(() => user && loadTimeline(user.id), [user]);
  const [body, setBody] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);
  const [media, setMedia] = useState<Post["media"]>();
  const [mediaError, setMediaError] = useState("");
  const [uploading, runUpload] = useBusy();
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
      await createPost(body.trim(), media);
      setPosts(await loadTimeline(user.id));
      setBody("");
      setMedia(undefined);
    });
  // ponytail: 選んだ時点でアップロード。外した・差し替えたファイルは Storage に残る
  const pick = (file?: File) => {
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) return setMediaError(`${MAX_MB}MB以下のファイルを選んでください`);
    setMediaError("");
    // 大きい動画をモバイル回線で上げると失敗しやすい。黙って消えると押し直していいか分からないので文言で知らせる
    runUpload(() => upload(file).then(
      (src) => setMedia({ kind: file.type.startsWith("video") ? "video" : "image", src }),
      () => setMediaError("アップロードできませんでした。通信を確かめて、もう一度選んでください"),
    ));
  };
  const canPost = (body.trim() || media) && !uploading;
  const update = (p: Post) => setPosts(posts.map((x) => (x.id === p.id ? p : x)));
  const shown = savedOnly ? posts.filter((p) => p.saved) : posts;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="card space-y-4 p-5">
        <div className="flex gap-3">
          <Avatar src={profile!.icon} />
          <div className="min-w-0 flex-1 space-y-3">
            <textarea aria-label="投稿の本文" className="input min-h-24 resize-none border-0 px-0 focus:ring-0" placeholder="制作の裏側を発信しよう"
              value={body} onChange={(e) => setBody(e.target.value)} />
            {uploading && <p className="text-sm text-fg-3">送信中…</p>}
            {media && !uploading && (
              <div className="relative w-fit">
                {media.kind === "video"
                  ? <video controls src={media.src} className="max-h-80 rounded-xl bg-secondary" />
                  : <img src={media.src} alt="添付した画像" className="max-h-80 rounded-xl" />}
                {/* 見た目 32px、当たり判定は ::before で 44px */}
                <button aria-label="添付を外す" onClick={() => setMedia(undefined)}
                  className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-on-secondary before:absolute before:-inset-1.5 before:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg">
                  <Icon name="x" className="h-4 w-4" />
                </button>
              </div>
            )}
            {mediaError && <p role="alert" className="text-sm text-error">{mediaError}</p>}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
          {/* capture なし = カメラロール（写真ライブラリ）から選ぶ。capture あり = OS 標準のカメラを直接立ち上げる。
              PC の capture はファイル選択と同じになるので、カメラは指で操作する端末（pointer: coarse）にだけ出す。
              キーボードで来たら枠に focus を出す */}
          <div className="-ml-2.5 flex gap-2">
            {([["image", "写真・動画を選ぶ", undefined, "inline-flex"], ["camera", "カメラで撮る", "environment", "hidden pointer-coarse:inline-flex"]] as const).map(([icon, label, capture, display]) => (
              <label key={icon} className={`${display} min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg text-tertiary transition hover:bg-tertiary-container has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-fg ${uploading ? "pointer-events-none opacity-40" : ""}`}>
                <input type="file" accept="image/*,video/*" capture={capture} className="sr-only" disabled={uploading}
                  onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
                <Icon name={icon} className="h-6 w-6" /><span className="sr-only">{label}</span>
              </label>
            ))}
          </div>
          <button className="btn-primary" disabled={!canPost || posting} onClick={post}>{posting ? "投稿中…" : "投稿する"}</button>
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
