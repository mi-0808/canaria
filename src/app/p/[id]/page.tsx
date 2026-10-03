"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import PostItem from "@/components/PostItem";
import { loadPost, useLoad } from "@/lib/store";

// 共有された投稿（閲覧のみ）
export default function SharedPost() {
  const { id } = useParams<{ id: string }>();
  const [post] = useLoad(() => loadPost(id), [id]);
  if (post === undefined) return null;
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {post ? <PostItem post={post} /> : <p className="text-sm text-zinc-500">投稿が見つかりません。</p>}
      <div className="rounded-2xl bg-gradient-to-r from-yellow-50 via-yellow-100 to-amber-50 p-8 text-center">
        <Link href="/" className="btn-primary">Canariaに登録する</Link>
      </div>
    </div>
  );
}
