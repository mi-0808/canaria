"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { use, useEffect } from "react";
import Icon from "@/components/Icon";
import { Empty, EntrySections, NowNext, ProfileHero, WorkList } from "@/components/Portfolio";
import ShareButton from "@/components/ShareButton";
import { PublicSkeleton } from "@/components/Skeleton";
import { pushHistory } from "@/lib/history.mjs";
import { isPreview } from "@/lib/nav.mjs";
import { loadPublicPortfolio, recordView, useLoad, useUser } from "@/lib/store";

// /@username から next.config の rewrites で来る。旧 URL の /u/ユーザーID は /@username に置き換える
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

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
  useEffect(() => {
    if (legacy && data) router.replace(`/@${data.profile.username}`);
  }, [legacy, data, router]);
  // 本人以外が開いたら表示回数を1回数え、ログイン中なら見たプロフィールの履歴にも足す。
  // ログイン確認（user が undefined）の間は待つ（本人の分を送らないように。DB でも弾く）
  const viewed = data?.id;
  const me = user === undefined ? undefined : (user?.id ?? null);
  useEffect(() => {
    if (!viewed || me === undefined || me === viewed) return;
    recordView(viewed);
    if (me) pushHistory(me, viewed);
  }, [viewed, me]);

  // 「公開ページを見る」から来たプレビュー。見る人と同じ見た目にするため、ヘッダー（design.css の data-preview）と
  // 「編集する」を出さず、左上に戻る・右上に共有だけを置く（共有しやすくするため。ユーザーの指示）。スクロールしても使えるよう sticky で残す。
  // 場所を取るとカバーの上に空きができるので、高さ 0 の入れ物に入れてカバーの角に重ねる（mb-0 で space-y の間隔も消す）
  const back = isPreview(preview, user, data) && (
    <div className="sticky top-[env(safe-area-inset-top)] z-20 mb-0 flex h-0 justify-between">
      <button type="button" aria-label="戻る" data-preview
        // ponytail: 履歴の有無は history.length で見るだけ。プレビューの URL を直接開いたときはプロフィールへ
        onClick={() => (window.history.length > 1 ? router.back() : router.push("/me"))}
        className="flex h-11 w-11 translate-3 items-center justify-center rounded-full border border-line bg-surface text-fg shadow-sm transition hover:bg-surface-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg">
        <Icon name="arrow" className="h-5 w-5 rotate-180" />
      </button>
      {data && <ShareButton variant="icon" username={data.profile.username} name={data.profile.name} className="-translate-x-3 translate-y-3" />}
    </div>
  );

  if (data === undefined) return <div className="space-y-12">{back}<PublicSkeleton /></div>;
  if (data === null) return <p className="text-sm text-fg-3">ユーザーが見つかりません。</p>;

  const { profile: p, works, entries } = data;
  const section = "text-2xl font-bold tracking-tight";

  return (
    <div className="space-y-12">
      {/* 共有ボタンは自分のページを見ているときだけ（ユーザーの指示） */}
      {back || (user?.id === data.id && (
        <div className="flex justify-end gap-2">
          <ShareButton variant="icon" username={p.username} name={p.name} />
          <Link href="/me" className="btn">編集する</Link>
        </div>
      ))}

      <div className="space-y-6">
        <ProfileHero p={p} works={works} />
        <NowNext p={p} />
      </div>

      <EntrySections entries={entries} heading={section} />

      <section className="space-y-4">
        <h2 className={section}>作品</h2>
        {works.length ? <WorkList works={works} /> : <Empty text="まだ作品がありません" />}
      </section>

      {p.bio && (
        <section className="space-y-4">
          <h2 className={section}>自己紹介</h2>
          <p className="leading-relaxed whitespace-pre-wrap text-fg-2">{p.bio}</p>
        </section>
      )}

      {/* 登録済みの人には出さない */}
      {user === null && (
        <div className="rounded-2xl bg-primary-container p-8 text-center">
          <p className="text-sm text-fg-2">あなたもプロフィールを作ろう</p>
          <Link href="/signup" className="btn-primary mt-3">無料ではじめる<Icon name="arrow" className="h-4 w-4" /></Link>
        </div>
      )}
    </div>
  );
}
