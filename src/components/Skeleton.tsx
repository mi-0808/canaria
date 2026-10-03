// 読み込み中は、届く画面と同じ形の灰色の箱を出す。真っ白のまま待たせると、壊れたのか待てばいいのか分からない（HIG: Loading）
const box = "animate-pulse rounded-lg bg-surface-2";

/** プロフィール＋タブ＋作品カード（/me・公開ページ） */
export function ProfileSkeleton() {
  return (
    <div role="status" aria-label="読み込み中" className="space-y-10">
      <div className="card overflow-hidden">
        <div className={`h-32 rounded-none ${box}`} />
        <div className="-mt-12 space-y-4 px-6 pb-6">
          <div className="h-24 w-24 rounded-full bg-surface-2 ring-4 ring-surface" />
          <div className={`h-7 w-40 ${box}`} />
          <div className={`h-5 w-64 max-w-full ${box}`} />
        </div>
      </div>
      <div className={`h-13 ${box}`} />
      <div className="grid gap-6 md:grid-cols-2">
        <div className={`aspect-video ${box}`} />
        <div className={`aspect-video ${box}`} />
      </div>
    </div>
  );
}

/** 投稿の一覧（ホーム・共有された投稿） */
export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div role="status" aria-label="読み込み中" className="mx-auto max-w-2xl space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card space-y-3 p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-surface-2" />
            <div className={`h-4 w-32 ${box}`} />
          </div>
          <div className={`h-4 w-full ${box}`} />
          <div className={`h-4 w-2/3 ${box}`} />
        </div>
      ))}
    </div>
  );
}
