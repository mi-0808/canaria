"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Empty, GearRow, ProfileView, WorkCard } from "@/components/Portfolio";
import PostItem from "@/components/PostItem";
import Tabs from "@/components/Tabs";
import { loadPortfolio, useLoad } from "@/lib/store";

// ponytail: URL は uid。見せたい URL にするなら profiles に username を足して /u/[username] へ
export default function PublicPage() {
  const { id } = useParams<{ id: string }>();
  const [data] = useLoad(() => loadPortfolio(id), [id]);
  if (data === undefined) return null;
  if (data === null) return <p className="text-sm text-zinc-500">ユーザーが見つかりません。</p>;
  return (
    <div className="space-y-10">
      <ProfileView p={data.profile} />
      <Tabs
        tabs={[
          {
            label: "ポートフォリオ",
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
            label: "タイムライン",
            count: data.posts.length,
            content: data.posts.length ? (
              <div className="mx-auto max-w-2xl space-y-4">{data.posts.map((p) => <PostItem key={p.id} post={p} />)}</div>
            ) : <Empty text="まだ投稿がありません" />,
          },
        ]}
      />
      <div className="rounded-2xl bg-gradient-to-r from-yellow-50 via-yellow-100 to-amber-50 p-8 text-center">
        <p className="text-sm text-zinc-600">あなたもポートフォリオを持とう</p>
        <Link href="/signup" className="btn-primary mt-3">Canariaに登録する →</Link>
      </div>
    </div>
  );
}
