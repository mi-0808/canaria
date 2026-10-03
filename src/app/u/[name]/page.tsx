"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Empty, GearRow, ProfileView, WorkCard } from "@/components/Portfolio";
import Icon from "@/components/Icon";
import PostItem from "@/components/PostItem";
import { ProfileSkeleton } from "@/components/Skeleton";
import Tabs from "@/components/Tabs";
import { loadPublicPortfolio, useLoad, useUser } from "@/lib/store";

// /@username から next.config の rewrites で来る。旧 URL の /u/ユーザーID は /@username に置き換える
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export default function PublicPage() {
  const { name } = useParams<{ name: string }>();
  const router = useRouter();
  const user = useUser();
  const legacy = uuid.test(name);
  // ユーザー名は小文字だけなので、/@Yamada と打たれても開けるようにする
  const [data] = useLoad(() => loadPublicPortfolio(legacy ? "id" : "username", name.toLowerCase()), [name]);
  useEffect(() => {
    if (legacy && data) router.replace(`/@${data.profile.username}`);
  }, [legacy, data, router]);

  if (data === undefined) return <ProfileSkeleton />;
  if (data === null) return <p className="text-sm text-fg-3">ユーザーが見つかりません。</p>;
  return (
    <div className="space-y-10">
      {user?.id === data.id && (
        <div className="flex justify-end"><Link href="/me" className="btn">編集する</Link></div>
      )}
      <ProfileView p={data.profile} />
      <Tabs
        tabs={[
          {
            label: "作品",
            count: data.works.length,
            content: data.works.length ? (
              <div className="grid gap-6 md:grid-cols-2">{data.works.map((w) => <WorkCard key={w.id} w={w} />)}</div>
            ) : <Empty text="まだ作品がありません" />,
          },
          {
            label: "開発環境",
            count: data.gear.length,
            content: data.gear.length ? (
              <div className="grid gap-3 sm:grid-cols-2">{data.gear.map((g) => <GearRow key={g.id} g={g} />)}</div>
            ) : <Empty text="まだ登録がありません" />,
          },
          {
            label: "投稿",
            count: data.posts.length,
            content: data.posts.length ? (
              <div className="mx-auto max-w-2xl space-y-4">{data.posts.map((p) => <PostItem key={p.id} post={p} />)}</div>
            ) : <Empty text="まだ投稿がありません" />,
          },
        ]}
      />
      {/* 登録済みの人には出さない */}
      {user === null && (
        <div className="rounded-2xl bg-primary-container p-8 text-center">
          <p className="text-sm text-fg-2">あなたもポートフォリオを持とう</p>
          <Link href="/signup" className="btn-primary mt-3">無料ではじめる<Icon name="arrow" className="h-4 w-4" /></Link>
        </div>
      )}
    </div>
  );
}
