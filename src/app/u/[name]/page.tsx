"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import Icon from "@/components/Icon";
import { CareerTimeline, Empty, GearRow, LinkList, NowNext, ProfileHero, StatsRow, WorkShelf } from "@/components/Portfolio";
import PostItem from "@/components/PostItem";
import { PublicSkeleton } from "@/components/Skeleton";
import { isPreview } from "@/lib/nav.mjs";
import { loadPublicPortfolio, useLoad, useUser } from "@/lib/store";

// /@username から next.config の rewrites で来る。旧 URL の /u/ユーザーID は /@username に置き換える
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const FIRST_POSTS = 3; // 投稿は最初は新しい3件だけ。ページの下が投稿で埋まらないように

// 公開ページ。App Store の作品ページのように、タブで隠さず1枚に並べる（仕事を頼む側が切り替えずに全部見られる）
export default function PublicPage({ searchParams }: PageProps<"/u/[name]">) {
  const { name } = useParams<{ name: string }>();
  // searchParams で読むとサーバーの HTML の時点で分かるので、プレビューでヘッダーが一瞬出てから消えることがない
  const preview = use(searchParams).preview !== undefined;
  const router = useRouter();
  const user = useUser();
  const legacy = uuid.test(name);
  // ユーザー名は小文字だけなので、/@Yamada と打たれても開けるようにする
  const [data] = useLoad(() => loadPublicPortfolio(legacy ? "id" : "username", name.toLowerCase()), [name]);
  const [allPosts, setAllPosts] = useState(false);
  useEffect(() => {
    if (legacy && data) router.replace(`/@${data.profile.username}`);
  }, [legacy, data, router]);

  // 「公開ページを見る」から来たプレビュー。見る人と同じ見た目にするため、ヘッダー（design.css の data-preview）と
  // 「編集する」を出さず、戻るだけを置く。スクロールしても戻れるよう sticky で左上に残す。
  // 場所を取るとカバーの上に空きができるので、高さ 0 の入れ物に入れてカバーの左上に重ねる（mb-0 で space-y の間隔も消す）
  const back = isPreview(preview, user, data) && (
    <div className="sticky top-[env(safe-area-inset-top)] z-20 mb-0 h-0">
      <button type="button" aria-label="戻る" data-preview
        // ponytail: 履歴の有無は history.length で見るだけ。プレビューの URL を直接開いたときはポートフォリオへ
        onClick={() => (window.history.length > 1 ? router.back() : router.push("/me"))}
        className="flex h-11 w-11 translate-3 items-center justify-center rounded-full border border-line bg-surface text-fg shadow-sm transition hover:bg-surface-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg">
        <Icon name="arrow" className="h-5 w-5 rotate-180" />
      </button>
    </div>
  );

  if (data === undefined) return <div className="space-y-12">{back}<PublicSkeleton /></div>;
  if (data === null) return <p className="text-sm text-fg-3">ユーザーが見つかりません。</p>;

  const { profile: p, works, gear, careers, posts } = data;
  // SNS・リンクは DB で https だけに絞っているが、href に入れる前にもう一度確かめる
  const links = p.links.filter((u) => u.startsWith("https://"));
  const section = "text-2xl font-bold tracking-tight";

  return (
    <div className="space-y-12">
      {back || (user?.id === data.id && (
        <div className="flex justify-end"><Link href="/me" className="btn">編集する</Link></div>
      ))}

      <div className="space-y-6">
        <ProfileHero p={p} />
        <StatsRow p={p} works={works} />
        <NowNext p={p} />
      </div>

      <section className="space-y-4">
        <h2 className={section}>作品</h2>
        {works.length ? <WorkShelf works={works} /> : <Empty text="まだ作品がありません" />}
      </section>

      {careers.length > 0 && (
        <section className="space-y-4">
          <h2 className={section}>経歴</h2>
          <CareerTimeline careers={careers} />
        </section>
      )}

      {(p.bio || links.length > 0) && (
        <section className="grid gap-12 md:grid-cols-[minmax(0,1fr)_18rem] md:gap-8">
          {p.bio && (
            <div className="space-y-4">
              <h2 className={section}>自己紹介</h2>
              <p className="leading-relaxed whitespace-pre-wrap text-fg-2">{p.bio}</p>
            </div>
          )}
          {links.length > 0 && (
            <div className="space-y-4">
              <h2 className={section}>リンク</h2>
              <LinkList links={links} />
            </div>
          )}
        </section>
      )}

      {gear.length > 0 && (
        <section className="space-y-4">
          <h2 className={section}>開発環境</h2>
          <div className="grid gap-3 sm:grid-cols-2">{gear.map((g) => <GearRow key={g.id} g={g} />)}</div>
        </section>
      )}

      {posts.length > 0 && (
        <section className="space-y-4">
          <h2 className={section}>投稿</h2>
          <div className="max-w-2xl space-y-4">
            {(allPosts ? posts : posts.slice(0, FIRST_POSTS)).map((post) => <PostItem key={post.id} post={post} />)}
            {!allPosts && posts.length > FIRST_POSTS && (
              <button className="btn w-full" onClick={() => setAllPosts(true)}>すべての投稿を見る（{posts.length}件）</button>
            )}
          </div>
        </section>
      )}

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
