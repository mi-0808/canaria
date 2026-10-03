import DeviceShowcase from "@/components/DeviceShowcase";
import BlockPuzzle from "@/components/BlockPuzzle";
import Link from "next/link";

// 初心者の「まだいいや」をつぶす: よくある不安 → 答え
const worries = [
  ["まだ人に見せられる作品じゃない", "完成していなくても大丈夫。ステータスを「開発中」にして公開できます。見る人が知りたいのは完成度より、あなたが何をどう作ろうとしているか。"],
  ["作るのに時間がかかりそう", "デザインもコードもいりません。決まった項目を埋めるだけ。自分でサイトを一から作る時間を、次の作品づくりに使えます。"],
  ["作っても、誰にも見られない", "URLを応募文やSNSに貼れば、それが名刺になります。制作過程をタイムラインで発信すれば、プロの目にも留まります。"],
  ["無料って、なにか裏がありそう", "初期費用は0円。まだ結果が出ていない人こそ、コストをかけずに始められるように作りました。"],
];

// 機能ごとに色の役割を分ける: 作品=カナリア（主役）、発信=藍（つながり）、仕事場=グレー
const tones = {
  primary: { panel: "bg-primary-container", num: "text-primary/50", dot: "bg-primary-container text-on-primary-container" },
  tertiary: { panel: "bg-tertiary-container", num: "text-tertiary/15", dot: "bg-tertiary-container text-on-tertiary-container" },
  secondary: { panel: "bg-secondary-container", num: "text-secondary/10", dot: "bg-secondary-container text-on-secondary-container" },
};

const features = [
  {
    n: "01",
    tone: tones.primary,
    title: "簡単に、作品を並べる",
    desc: "つくった作品を、決まった型に打ち込むだけ。WixやSTUDIOでデザインに悩む時間はもういらない。見る側にとっても、同じフォーマットだから比べやすい。",
    points: ["トップ画像・ステータス・期間・役割・使用技術・成果物URL", "開発中の作品も、ステータスつきで公開できる", "公開ページのURLが、そのまま名刺がわりに"],
    visual: (
      <div className="grid grid-cols-3 gap-3">
        {[["Todoアプリ", "運用中"], ["家計簿SaaS", "ベータ公開"], ["個人ブログ", "開発中"]].map(([t, st]) => (
          <div key={t} className="overflow-hidden rounded-xl bg-surface shadow-md">
            <div className="aspect-video bg-primary-container" />
            <div className="space-y-1.5 p-2.5">
              <p className="truncate text-xs font-bold">{t}</p>
              <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${st === "運用中" ? "bg-success-container text-on-success-container" : "bg-surface-2 text-fg-2"}`}>{st}</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    n: "02",
    tone: tones.tertiary,
    title: "つくりながら発信して、プロに教わる",
    desc: "まだ世に出ていない作品の裏側を、テキスト・音声・動画で発信。詰まったところにはプロから助言が届き、積み重ねた過程そのものが、あなたの信頼になる。",
    points: ["テキスト・音声・動画から選んで投稿", "リアクション・返信で、プロとつながる", "投稿は作品と紐づけて、ポートフォリオの厚みに"],
    visual: (
      <div className="space-y-3 text-sm">
        <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-surface p-3.5 shadow-md">
          <span className="font-mono text-[11px] text-fg-3">@you · 2時間前</span>
          <br />認証まわりで詰まってます…どこでガードするのが正解？
        </div>
        <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-secondary p-3.5 text-on-secondary shadow-md">
          <span className="font-mono text-[11px] text-primary">@senior_dev · 1時間前</span>
          <br />middlewareでまとめて守るのがおすすめ！
        </div>
        <p className="text-right text-xs text-on-tertiary-container">★ リアクション 12</p>
      </div>
    ),
  },
  {
    n: "03",
    tone: tones.secondary,
    title: "できる人の仕事場から、次の相棒を見つける",
    desc: "先輩エンジニアに「このモニター、いいよ」と勧められて、つい買ってしまった。そんな体験をCanariaの中で。上級エンジニアの仕事場をのぞけば「こんなの使ってるんだ」という発見があり、気になったアイテムはそのままチェックできる。",
    points: ["上級エンジニアの環境を、おすすめコメントつきでのぞける", "「これいいよ」の一言が、あなたの次の一台を決める", "気になったアイテムは、そのまま商品ページへ"],
    soon: true,
    visual: (
      <div className="space-y-2 font-mono text-sm">
        <p className="text-[11px] text-fg-3">@senior_dev の仕事場</p>
        {[["🖥", "27inch 4K Monitor", "作業領域が倍。もう戻れない"], ["⌨️", "HHKB Studio", "手首がラクになった"], ["💻", "MacBook Pro M4", "ビルドが一瞬"]].map(([i, t, c]) => (
          <div key={t} className="flex items-center gap-3 rounded-xl bg-surface px-3.5 py-2.5 shadow-md">
            <span>{i}</span>
            <div className="min-w-0">
              <p className="font-medium">{t}</p>
              <p className="font-sans text-[11px] text-fg-3">“{c}”</p>
            </div>
            <span className="ml-auto text-tertiary">↗</span>
          </div>
        ))}
      </div>
    ),
  },
];

export default function Home() {
  return (
    <div className="space-y-24">
      {/* Hero */}
      <section className="relative -mx-4 -mt-10 overflow-hidden px-4 pt-16 pb-8">
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
        <div className="relative grid items-center gap-12 md:grid-cols-[1fr_auto]">
          <div className="space-y-7">
            <h1 className="text-3xl leading-[1.15] font-bold tracking-tight sm:text-5xl md:text-4xl lg:text-5xl">
              つくった作品で、
              <br />
              <span className="bg-[linear-gradient(transparent_62%,var(--color-primary)_62%)] whitespace-nowrap">次の仕事をとりにいく</span>
              <br />
              ポートフォリオ
            </h1>
            <p className="max-w-md text-fg-2">
              作品はある。でも、まだ仕事にはつながっていない。そんなエンジニアのための、打ち込むだけで完成するポートフォリオ＋α。
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/signup" className="btn-primary px-6 py-3 text-base">無料ではじめる →</Link>
              <Link href="#features" className="btn-tonal px-6 py-3 text-base">できることを見る</Link>
              <span className="font-mono text-xs text-fg-3">初期費用 ¥0</span>
            </div>
          </div>

          {/* ブロックを積むと作品ページになる、というモック */}
          <div className="relative mx-auto w-full max-w-sm md:w-80 lg:w-[26rem] lg:max-w-none">
            <div className="absolute -inset-3 rotate-1 rounded-3xl bg-tertiary-container" />
            <BlockPuzzle />
          </div>
        </div>
      </section>

      <DeviceShowcase />

      {/* Features */}
      <section id="features" className="scroll-mt-20 space-y-10">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Canariaでできる、3つのこと</h2>
        </div>
        <div className="space-y-20">
          {features.map((f, i) => (
            <div key={f.n} className="grid items-center gap-10 md:grid-cols-2">
              <div className={`relative overflow-hidden rounded-3xl ${f.tone.panel} p-8 sm:p-10 ${i % 2 ? "md:order-2" : ""}`}>
                <div className="bg-grid absolute inset-0 opacity-50" />
                <span className={`absolute -top-6 -right-2 font-mono text-[10rem] leading-none font-bold ${f.tone.num}`}>{f.n}</span>
                <div className="relative">{f.visual}</div>
              </div>
              <div className="space-y-5">
                <h3 className="text-2xl leading-snug font-bold tracking-tight sm:text-3xl">
                  {f.title}
                  {f.soon && <span className="ml-2 inline-block rounded-md bg-surface-2 px-2 py-0.5 align-middle text-xs font-medium text-fg-2">近日公開</span>}
                </h3>
                <p className="leading-relaxed text-fg-2">{f.desc}</p>
                <ul className="space-y-2.5">
                  {f.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-3 text-sm">
                      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${f.tone.dot} text-[11px] font-bold`}>✓</span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 不安をつぶす */}
      <section className="space-y-10">
        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">「ポートフォリオは、あとでいいや」<br className="sm:hidden" />と思っていませんか？</h2>
          <p className="text-fg-2">仕事を頼む側は、あなたのことを何も知りません。判断材料は、見せたものだけです。</p>
        </div>

        {/* ある/なしの比較 */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-line bg-surface-1 p-6">
            <p className="text-sm font-bold text-fg-2">ポートフォリオがない場合</p>
            <p className="mt-3 text-sm text-fg-3">応募メッセージ</p>
            <p className="mt-1 rounded-xl bg-surface p-4 text-sm text-fg-3">「未経験ですが、やる気はあります。GitHubを見てください。」</p>
            <p className="mt-3 text-sm text-fg-3">→ 何ができる人なのか、相手に探してもらうことになる</p>
          </div>
          <div className="rounded-2xl border border-primary bg-primary-container p-6 text-on-primary-container">
            <p className="text-sm font-bold">Canariaがある場合</p>
            <p className="mt-3 text-sm font-medium">応募メッセージ</p>
            <p className="mt-1 rounded-xl bg-surface p-4 text-sm font-medium">「作ったものをまとめています。canaria.app/@you」</p>
            <p className="mt-3 text-sm font-bold">→ 作品・役割・使った技術が、1ページで伝わる</p>
          </div>
        </div>

        {/* よくある不安 */}
        <div className="grid gap-4 sm:grid-cols-2">
          {worries.map(([q, a]) => (
            <div key={q} className="card space-y-3 p-6">
              <p className="flex items-start gap-2 font-bold">
                <span className="shrink-0 rounded-md bg-surface-2 px-1.5 font-mono text-xs leading-6 text-fg-3">Q</span>
                {q}
              </p>
              <p className="flex items-start gap-2 text-sm leading-relaxed text-fg-2">
                <span className="shrink-0 rounded-md bg-primary-container px-1.5 font-mono text-xs leading-6 font-bold text-on-primary-container">A</span>
                {a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Closing */}
      <section className="rounded-3xl bg-secondary px-8 py-14 text-center text-on-secondary">
        <h2 className="text-3xl font-bold tracking-tight">まだ結果が出ていない今こそ、見せよう。</h2>
        {/* 濃い黄色のボタンは「同時に見える範囲で1つ」。ヒーローの CTA とは同じ画面に入らない */}
        <Link href="/signup" className="btn-primary mt-6 px-6 py-3 text-base">マイページをつくる →</Link>
      </section>
    </div>
  );
}
