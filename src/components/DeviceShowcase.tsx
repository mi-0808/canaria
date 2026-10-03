// LP: PCとスマホで公開ページの見え方を並べるセクション（中身はすべてCSSのモック）

const works = [
  { title: "3秒家計簿アプリ", status: "運用中", live: true, techs: ["Next.js", "Supabase"], cover: "bg-primary-container" },
  { title: "チーム開発SNS", status: "ベータ公開", live: false, techs: ["React", "Firebase"], cover: "bg-secondary" },
];

function MiniPage({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className="h-full overflow-hidden bg-surface text-[8px]">
      <div className="flex items-center justify-between border-b border-line px-3 py-1.5">
        <span className="font-bold">🐤 Canaria</span>
        {!mobile && <span className="font-mono text-[7px] text-fg-3">canaria.app/@you</span>}
      </div>
      <div className="h-8 bg-primary-container" />
      <div className="-mt-4 space-y-1 px-3">
        <div className="h-8 w-8 rounded-full bg-primary ring-2 ring-surface" />
        <p className="text-[10px] font-bold">山田 カナ</p>
        <p className="text-fg-3">フロントエンド · INTJ · 東京</p>
      </div>
      <div className="mt-2 flex gap-3 border-b border-line px-3">
        <span className="border-b-2 border-primary pb-1 font-bold">ポートフォリオ</span>
        <span className="pb-1 text-fg-3">開発環境</span>
        {!mobile && <span className="pb-1 text-fg-3">タイムライン</span>}
      </div>
      <div className={`grid gap-2 p-3 ${mobile ? "grid-cols-1" : "grid-cols-2"}`}>
        {works.map((w) => (
          <div key={w.title} className="overflow-hidden rounded-md border border-line">
            <div className={`aspect-video ${w.cover}`} />
            <div className="space-y-1 p-1.5">
              <span className={`inline-block rounded-full px-1.5 py-px text-[7px] font-bold ${w.live ? "bg-success-container text-on-success-container" : "bg-surface-2 text-fg-2"}`}>{w.status}</span>
              <p className="text-[9px] font-bold">{w.title}</p>
              <div className="flex gap-1">
                {w.techs.map((t) => <span key={t} className="rounded-full bg-tertiary-container px-1 font-mono text-[6px] text-on-tertiary-container">{t}</span>)}
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
    <section className="relative -mx-4 overflow-hidden px-4">
      <div className="relative space-y-12">
        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">PCでもスマホでも、そのまま名刺に。</h2>
          <p className="text-fg-2">URLを送るだけ。どの画面で開かれても、あなたの作品がきれいに並ぶ。</p>
        </div>

        <div className="relative mx-auto max-w-3xl pb-6">
          {/* PC */}
          <div className="mx-auto w-[88%]">
            <div className="rounded-t-2xl border-[10px] border-b-0 border-secondary bg-secondary shadow-2xl">
              <div className="aspect-[16/10] overflow-hidden rounded-t-md">
                <MiniPage />
              </div>
            </div>
            <div className="relative h-4 rounded-b-xl bg-surface-3">
              <div className="absolute top-0 left-1/2 h-1.5 w-20 -translate-x-1/2 rounded-b-md bg-outline/40" />
            </div>
            <div className="mx-auto h-1.5 w-[104%] -translate-x-[2%] rounded-b-full bg-line" />
          </div>

          {/* スマホ */}
          <div className="absolute right-0 bottom-0 w-[26%] min-w-28 rotate-3 rounded-[1.75rem] border-[6px] border-secondary bg-secondary shadow-2xl">
            <div className="relative aspect-[9/19] overflow-hidden rounded-[1.25rem]">
              <div className="absolute top-1 left-1/2 z-10 h-3 w-12 -translate-x-1/2 rounded-full bg-secondary" />
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
