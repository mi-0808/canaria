"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import PostItem from "@/components/PostItem";
import { useData } from "@/lib/store";

// 共有された投稿（閲覧のみ）。ponytail: localStorageなので同じブラウザでしか見えない。Supabase導入で解消
export default function SharedPost() {
  const { id } = useParams<{ id: string }>();
  const { data, ready } = useData();
  if (!ready) return null;
  const post = data.posts.find((p) => p.id === id);
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {post ? <PostItem post={post} author={data.profile} /> : <p className="text-sm text-zinc-500">投稿が見つかりません。</p>}
      <div className="rounded-2xl bg-gradient-to-r from-yellow-50 via-yellow-100 to-amber-50 p-8 text-center">
        <Link href="/" className="btn-primary">Canariaに登録する</Link>
      </div>
    </div>
  );
}
