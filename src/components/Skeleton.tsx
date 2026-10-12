// 読み込み中は、届く画面と同じ形の灰色の箱を出す。真っ白のまま待たせると、壊れたのか待てばいいのか分からない（HIG: Loading）
const box = "animate-pulse rounded-lg bg-surface-2";

/** /me 以下（見出し＋白いまとまり）。地の灰色は data-grouped で、読み込み中から付けておく（読み込み後に背景が変わらないように） */
export function ListSkeleton() {
  return (
    <div data-grouped role="status" aria-label="読み込み中" className="mx-auto max-w-xl space-y-6">
      <div className={`h-9 w-48 ${box}`} />
      <div className="h-20 rounded-2xl bg-surface-raised" />
      <div className={`h-11 rounded-xl ${box}`} />
      <div className="h-40 rounded-2xl bg-surface-raised" />
    </div>
  );
}

/** 公開ページ（頭・数字の行・作品の一覧） */
export function PublicSkeleton() {
  const pulse = "animate-pulse bg-surface-2";
  return (
    <div role="status" aria-label="読み込み中" className="space-y-6">
      {/* ProfileHero と同じく、カバーの帯にアイコンを重ねた形（読み込み後に頭がずれないように） */}
      <div className={`aspect-3/1 w-full rounded-2xl ${pulse}`} />
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
        <div className={`relative -mt-17 ml-4 h-24 w-24 rounded-full ring-4 ring-surface sm:-mt-23 sm:ml-6 sm:h-36 sm:w-36 ${pulse}`} />
        <div className="space-y-3">
          <div className={`h-9 w-48 rounded-lg ${pulse}`} />
          <div className={`h-6 w-64 max-w-full rounded-lg ${pulse}`} />
          <div className={`h-6 w-72 max-w-full rounded-lg ${pulse}`} />
          <div className={`h-11 w-40 rounded-xl ${pulse}`} />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {[0, 1].map((i) => <div key={i} className={`aspect-[4/3] rounded-2xl ${pulse}`} />)}
      </div>
    </div>
  );
}
