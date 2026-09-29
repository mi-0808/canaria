// LP: PCとスマホで公開ページの見え方を並べるセクション（中身はすべてCSSのモック）

const works = [
  { title: "3秒家計簿アプリ", status: "運用中", live: true, techs: ["Next.js", "Supabase"], from: "from-yellow-300 to-amber-400" },
  { title: "チーム開発SNS", status: "ベータ公開", live: false, techs: ["React", "Firebase"], from: "from-zinc-800 to-zinc-600" },
];

function MiniPage({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className="h-full overflow-hidden bg-white text-[8px]">
      <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-1.5">
        <span className="font-bold">🐤 Canaria</span>
        {!mobile && <span className="font-mono text-[7px] text-zinc-400">canaria.app/@you</span>}
      </div>
      <div className="h-8 bg-gradient-to-r from-yellow-300 via-yellow-200 to-amber-300" />
      <div className="-mt-4 space-y-1 px-3">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 ring-2 ring-white" />
        <p className="text-[10px] font-bold">山田 カナ</p>
        <p className="text-zinc-500">フロントエンド · INTJ · Tokyo</p>
      </div>
      <div className="mt-2 flex gap-3 border-b border-zinc-100 px-3">
        <span className="border-b-2 border-yellow-400 pb-1 font-bold">ポートフォリオ</span>
        <span className="pb-1 text-zinc-400">開発環境</span>
        {!mobile && <span className="pb-1 text-zinc-400">タイムライン</span>}
      </div>
      <div className={`grid gap-2 p-3 ${mobile ? "grid-cols-1" : "grid-cols-2"}`}>
        {works.map((w) => (
          <div key={w.title} className="overflow-hidden rounded-md border border-zinc-200">
            <div className={`aspect-video bg-gradient-to-br ${w.from}`} />
            <div className="space-y-1 p-1.5">
              <span className={`inline-block rounded-full px-1.5 py-px text-[7px] font-bold ${w.live ? "bg-yellow-300" : "bg-zinc-100 text-zinc-600"}`}>{w.status}</span>
              <p className="text-[9px] font-bold">{w.title}</p>
              <div className="flex gap-1">
                {w.techs.map((t) => <span key={t} className="rounded-full border border-zinc-200 px-1 font-mono text-[6px] text-zinc-500">{t}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DeviceShowcase() {
  return (
    <section className="relative -mx-4 overflow-hidden px-4 py-16">
      <div className="absolute inset-x-0 top-1/2 h-72 -translate-y-1/2 bg-gradient-to-r from-yellow-100 via-yellow-200 to-amber-100 blur-3xl" />
      <div className="relative space-y-12">
        <div className="space-y-3 text-center">
          <p className="label">{"// responsive"}</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">PCでもスマホでも、そのまま名刺に。</h2>
          <p className="text-zinc-600">URLを送るだけ。どの画面で開かれても、あなたの作品がきれいに並ぶ。</p>
        </div>

        <div className="relative mx-auto max-w-3xl pb-6">
          {/* PC */}
          <div className="mx-auto w-[88%]">
            <div className="rounded-t-2xl border-[10px] border-b-0 border-zinc-900 bg-zinc-900 shadow-2xl">
              <div className="aspect-[16/10] overflow-hidden rounded-t-md">
                <MiniPage />
              </div>
            </div>
            <div className="relative h-4 rounded-b-xl bg-gradient-to-b from-zinc-300 to-zinc-400">
              <div className="absolute top-0 left-1/2 h-1.5 w-20 -translate-x-1/2 rounded-b-md bg-zinc-500/40" />
            </div>
            <div className="mx-auto h-1.5 w-[104%] -translate-x-[2%] rounded-b-full bg-zinc-300/60" />
          </div>

          {/* スマホ */}
          <div className="absolute right-0 bottom-0 w-[26%] min-w-28 rotate-3 rounded-[1.75rem] border-[6px] border-zinc-900 bg-zinc-900 shadow-2xl">
            <div className="relative aspect-[9/19] overflow-hidden rounded-[1.25rem]">
              <div className="absolute top-1 left-1/2 z-10 h-3 w-12 -translate-x-1/2 rounded-full bg-zinc-900" />
              <div className="h-full pt-3">
                <MiniPage mobile />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
