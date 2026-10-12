import DeviceShowcase from "@/components/DeviceShowcase";
import BlockPuzzle from "@/components/BlockPuzzle";
import Link from "next/link";
import Icon from "@/components/Icon";
import Phrases from "@/components/Phrases";

// 初心者の「まだいいや」をつぶす: よくある不安 → 答え
const worries = [
  ["まだ人に見せられる作品じゃない", "完成していなくても大丈夫。ステータスを「開発中」にして公開できます。見る人が知りたいのは完成度より、あなたが何をどう作ろうとしているか。"],
  ["作るのに時間がかかりそう", "デザインもコードもいりません。決まった項目を埋めるだけ。自分でサイトを一から作る時間を、次の作品づくりに使えます。"],
  ["作っても、誰にも見られない", "URLを応募文やSNSに貼れば、それが名刺になります。"],
  ["無料って、なにか裏がありそう", "まだ結果が出ていない人こそ、コストをかけずに始められるように作りました。制作や運営は最小コストで抑えることで提供しています。"],
];

// 機能紹介。投稿（発信）と開発環境（仕事場）は外したので、今は作品の1つだけ。LP 全体は作り直す予定
const features = [
  {
    panel: "bg-primary-container",
    title: "つくった作品を、|決まった型に|打ち込むだけ",
    desc: "簡単に、作品を並べる。WixやSTUDIOでデザインに悩む時間はもういらない。見る側にとっても、同じフォーマットだから比べやすい。",
    visual: (
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {[["Todoアプリ", "運用中"], ["家計簿SaaS", "ベータ公開"], ["個人ブログ", "開発中"]].map(([t, st]) => (
          <div key={t} className="overflow-hidden rounded-xl bg-surface">
            {/* パネルと同じ黄色だと溶け込むので、画像の場所は中立のグレー */}
            <div className="aspect-video bg-surface-2" />
            <div className="space-y-2 p-2 sm:p-3">
              <p className="truncate text-xs font-bold">{t}</p>
              <span className={`inline-block rounded-full px-1.5 py-0.5 text-xs font-bold sm:px-2 ${st === "運用中" ? "bg-success-container text-on-success-container" : "bg-surface-2 text-fg-2"}`}>{st}</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
];

export default function Home() {
  return (
    // LP は常にライトで見せる（design.css の :root:has([data-light-only])）
    <div data-light-only className="space-y-24">
      {/* Hero */}
      <section className="relative -mx-4 -mt-10 overflow-hidden px-4 pt-16 pb-8 md:pt-24">
        <div className="relative grid items-center gap-12 md:grid-cols-[1fr_auto]">
          <div className="space-y-7">
            <h1 className="text-3xl leading-[1.15] font-bold tracking-tight sm:text-5xl md:text-4xl lg:text-5xl">
              つくった作品で、
              <br />
              <span className="bg-[linear-gradient(transparent_62%,var(--color-marker)_62%)] whitespace-nowrap text-marker-text">次の仕事をとりにいく</span>
              <br />
              ポートフォリオ
            </h1>
            <p className="max-w-md text-fg-2">
              作品はある。でも、まだ仕事にはつながっていない。そんなエンジニアのための、打ち込むだけで完成するポートフォリオ＋α。
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/signup" className="btn-primary px-6 py-3 text-base">無料ではじめる<Icon name="arrow" className="h-4 w-4" /></Link>
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
      <section id="features" className="scroll-mt-20 space-y-12">
        {/* 読み方が分かるよう Canaria にルビ。スマホでは文の切れ目で改行する */}
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          <span className="inline-block"><ruby>Canaria<rt className="text-sm font-normal tracking-normal text-fg-3">カナリア</rt></ruby>で</span>
          <span className="inline-block">できること</span>
        </h2>
        <div className="space-y-16">
          {features.map((f, i) => (
            <div key={f.title} className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
              {/* 見本は絵。伝えたいことは横の見出しと説明文にあるので、読み上げでは飛ばす */}
              <div aria-hidden className={`rounded-3xl ${f.panel} p-6 sm:p-8 ${i % 2 ? "md:order-2" : ""}`}>{f.visual}</div>
              <div className="max-w-md space-y-4">
                <h3 className="text-2xl leading-snug font-bold tracking-tight sm:text-3xl"><Phrases text={f.title} /></h3>
                <p className="leading-relaxed text-fg-2">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 不安をつぶす。直前の機能紹介（ブロック間 64px）と切れ目が分かるよう、PC では上を広めに空ける */}
      <section className="space-y-10 md:pt-8">
        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <Phrases text="スマートに、|あなたの実績を|ポートフォリオで|共有しよう。" />
          </h2>
          <p className="text-fg-2">自作ホームページ以上の価値を、Canariaのテンプレートを使って作成しよう。</p>
        </div>

        {/* ある/なしの比較: 同じ応募でも、相手の返事が変わるところまで見せる。箱で囲むのは Canaria 側だけ。
            PC では左右の高さをそろえ、結論の1行（mt-auto）を同じ高さに並べて比べられるようにする */}
        <div className="grid gap-10 md:grid-cols-2 md:gap-8">
          <div className="flex flex-col gap-3 md:p-6">
            <p className="text-sm font-bold text-fg-2">ポートフォリオがない場合</p>
            <p className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-secondary-container px-4 py-3 text-sm leading-relaxed text-on-secondary-container">
              未経験ですが、やる気はあります。GitHubを見てください。
            </p>
            <p className="-mt-1 self-end text-xs text-fg-3">既読</p>
            <p className="mt-auto pt-2 text-sm text-fg-2">返事は来ない。何ができる人なのか、相手が探すことになる</p>
          </div>
          <div className="flex flex-col gap-3 rounded-3xl bg-primary-container p-6 text-on-primary-container">
            <p className="text-sm font-bold">Canariaがある場合</p>
            <div className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-secondary-container px-4 py-3 text-sm text-on-secondary-container">
              作ったものをまとめています。
              {/* 公開ページのリンクカード */}
              <div className="mt-2 flex items-center gap-3 rounded-xl bg-surface p-3">
                <span className="h-8 w-8 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0">
                  <p className="font-bold text-fg">山田 カナ</p>
                  <p className="text-xs text-tertiary">canaria.app/@kana</p>
                </div>
              </div>
            </div>
            <p className="max-w-[85%] self-start rounded-2xl rounded-bl-md bg-secondary px-4 py-3 text-sm leading-relaxed text-on-secondary">
              家計簿アプリ、触ってみました。一度お話ししませんか？
            </p>
            <p className="mt-auto pt-2 text-sm font-bold">作品・役割・使った技術が、1ページで伝わる</p>
          </div>
        </div>

        {/* よくある不安: カードで囲まず、線で区切った一覧にする */}
        <dl className="mx-auto max-w-4xl divide-y divide-line border-y border-line">
          {worries.map(([q, a]) => (
            <div key={q} className="grid gap-2 py-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-8">
              <dt className="text-lg leading-snug font-bold">{q}</dt>
              <dd className="leading-relaxed text-fg-2">{a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Closing */}
      <section className="rounded-3xl bg-secondary px-8 py-14 text-center text-on-secondary">
        <h2 className="text-3xl font-bold tracking-tight"><Phrases text="まだ結果が|出ていない|今こそ、|見せよう。" /></h2>
        {/* 濃い黄色のボタンは「同時に見える範囲で1つ」。ヒーローの CTA とは同じ画面に入らない */}
        <Link href="/signup" className="btn-primary mt-6 px-6 py-3 text-base">無料ではじめる<Icon name="arrow" className="h-4 w-4" /></Link>
      </section>
    </div>
  );
}
