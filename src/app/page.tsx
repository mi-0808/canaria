import Link from "next/link";
import FindCounts from "@/components/FindCounts";
import Icon, { type IconName } from "@/components/Icon";
import { Collage, type ArtName } from "@/components/LpArt";
import Phrases from "@/components/Phrases";
import { Avatar } from "@/components/Portfolio";
import { sectionInfo } from "@/lib/entries.mjs";
import { demoEntries, demoProfile } from "@/lib/demo";
import type { Section } from "@/lib/store";

// LP。相手は「SNS のプロフィール欄にリンクを1本貼る人」（2026-10-14 決定）。エンジニア向けの作品の訴求はやめ、
// はたらいたこと・まなんだこと・すきなこと の3つと、「小さな声（実績）でも届けられる」を前に出す

// 3つの欄の見分け。/me の行のアイコンと同じ形・同じ色にして、LP で見たものが編集画面でもそのまま見つかるようにする
const sectionLook: Record<Section, { icon: IconName; tone: string; lead: string; examples: string; art: ArtName[] }> = {
  work: { icon: "briefcase", tone: "bg-tertiary-container text-on-tertiary-container", lead: "バイトも、立ち上げも、ボランティアも。", examples: "カフェのバイト 2年 · 文化祭の実行委員", art: ["cafe", "flag"] },
  learn: { icon: "book", tone: "bg-primary-container text-on-primary-container", lead: "学校だけじゃなく、身につけたことも。", examples: "吹奏楽部 · 火おこし · 独学のプログラミング", art: ["horn", "fire", "laptop"] },
  like: { icon: "heart", tone: "bg-secondary-container text-on-secondary-container", lead: "写真つきで、好きなものを並べる。", examples: "フィルムカメラ · 古着 · バンドのドラム", art: ["camera", "shirt", "drum"] },
};
const sectionOrder: Section[] = ["work", "learn", "like"];

// ③の1「『特にない』は、ない」。自己紹介で言葉に詰まる場面から、書き出すと自己紹介になる、を見せる
const written: [string, string][] = [
  ["カフェのバイト 2年", "いまは新人に教える係"],
  ["吹奏楽部 3年間", "定期演奏会でソロ"],
  ["火おこし", "キャンプで覚えた"],
];
// ③の2「インスタ交換だけで伝わる」。交換した相手が見る順
const swapSteps = ["相手があなたのプロフィールを開く", "プロフィール欄の Canaria のリンクをタップ", "やってきたこと・すきなことが1ページで伝わる"];

// よくある不安 → 答え
const worries = [
  ["書くことがない", "バイト・部活・すきなことで十分です。履歴書じゃありません。"],
  ["知らない人に見られる？", "「さがす」に載るのは、立場や分野を選んだときだけです。名前で探す機能はありません。"],
  ["お金はかかる？", "無料です。"],
];

const sectionHeading = "text-3xl leading-snug font-bold tracking-tight sm:text-4xl";

/** 見本の人の「やってきたこと」を欄ごとに1件ずつ（ヒーローと見本の段で使う） */
const firstOf = (s: Section) => demoEntries.find((e) => e.section === s)!;

function SectionRow({ s }: { s: Section }) {
  const look = sectionLook[s];
  return (
    <li className="flex items-center gap-3 py-2">
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${look.tone}`}><Icon name={look.icon} className="h-4.5 w-4.5" /></span>
      <span className="min-w-0">
        <span className="block truncate font-bold">{firstOf(s).title}</span>
        <span className="block text-sm text-fg-3">{sectionInfo[s].label}</span>
      </span>
    </li>
  );
}

export default function Home() {
  return (
    // LP は常にライトで見せる（design.css の :root:has([data-light-only])）
    <div data-light-only className="space-y-24">
      {/* ① ヒーロー */}
      <section className="grid items-center gap-12 pt-6 md:grid-cols-[1fr_auto] md:pt-16">
        <div className="space-y-7">
          <h1 className="text-4xl leading-[1.2] font-bold tracking-tight sm:text-5xl">
            <Phrases text="やってきたことが、" />
            <br />
            <span className="bg-[linear-gradient(transparent_62%,var(--color-marker)_62%)] whitespace-nowrap text-marker-text">ちゃんと届く。</span>
          </h1>
          <p className="max-w-md leading-relaxed text-fg-2">
            はたらいたこと・まなんだこと・すきなこと。
            <br />
            プロフィール欄のリンク1本で、あなたのことが伝わる。
          </p>
          <Link href="/signup" className="btn-primary px-6 py-3 text-base">無料ではじめる<Icon name="arrow" className="h-4 w-4" /></Link>
        </div>

        {/* SNS のプロフィール欄 → リンクの先が Canaria、という使われ方の絵。読み上げでは飛ばす（伝えたいことは見出しにある） */}
        <div aria-hidden className="mx-auto w-full max-w-sm rounded-3xl bg-surface-2 p-5 md:w-80 lg:w-96">
          <div className="space-y-3 rounded-2xl bg-surface p-4">
            <div className="flex items-center gap-3">
              <Avatar src="" className="h-12 w-12" />
              <div>
                <p className="font-bold">kana_film</p>
                <p className="text-sm text-fg-3">大学2年 · 写真 · カフェ</p>
              </div>
            </div>
            <p className="flex items-center gap-1.5 text-sm text-tertiary"><Icon name="link" className="h-4 w-4" />Canaria のプロフィール</p>
          </div>
          <div className="flex justify-center py-2 text-fg-3"><Icon name="arrow" className="h-5 w-5 rotate-90" /></div>
          <div className="rounded-2xl bg-surface px-4 py-2">
            <p className="pt-2 font-bold">{demoProfile.name}</p>
            <ul>{sectionOrder.map((s) => <SectionRow key={s} s={s} />)}</ul>
          </div>
        </div>
      </section>

      {/* ② 3つの欄 */}
      <section className="space-y-10">
        <h2 className={`text-center ${sectionHeading}`}><Phrases text="履歴書に|書けないことも、|あなたの一部。" /></h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {sectionOrder.map((s) => {
            const look = sectionLook[s];
            return (
              <li key={s} className={`space-y-3 rounded-3xl p-6 ${look.tone}`}>
                {/* 例（下の小さい文字）の数だけ、写真風の挿絵を並べる */}
                <div className="pb-2"><Collage section={s} items={look.art} /></div>
                <h3 className="flex items-center gap-2.5 text-xl font-bold"><Icon name={look.icon} className="h-6 w-6" />{sectionInfo[s].label}</h3>
                <p className="leading-relaxed">{look.lead}</p>
                <p className="text-sm">{look.examples}</p>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ③ 小さな声でも、届けられる。カナリア（小さな鳥）の名前と、実績が小さくても見せられる、をつなげる */}
      <section className="mx-auto max-w-2xl space-y-12">
        <div className="space-y-2 text-center">
          <p className="text-sm text-fg-3">カナリアは、小さな鳥。</p>
          <h2 className={sectionHeading}>
            <Phrases text="小さな声でも、" />
            <br />
            <span className="bg-[linear-gradient(transparent_62%,var(--color-marker)_62%)] text-marker-text">届けられる。</span>
          </h2>
        </div>

        {/* 1 と 2 は②と同じことを言わない。②は「書けることがある」、ここは「なぜ小さな声でも届くのか」 */}
        <div className="space-y-4">
          <p className="inline-block rounded-full bg-primary-container px-3 py-0.5 text-sm font-bold text-on-primary-container">1　「特にない」は、ない</p>
          <h3 className="text-2xl leading-snug font-bold tracking-tight"><Phrases text="自己紹介で|「特にないです」って|言ったこと、|ありませんか？" /></h3>
          {/* 自分の一言は右・濃いグレー、相手の一言（下の2）は左・薄いグレー。LP で吹き出しを使うのはこの段だけ */}
          <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-secondary px-4 py-2.5 text-sm text-on-secondary">えっと…バイトしてます。特にないです</p>
          <p className="pt-2 text-sm text-fg-3">でも、書き出してみると</p>
          <ul className="divide-y divide-line rounded-2xl border border-line px-4">
            {written.map(([t, m]) => (
              <li key={t} className="flex flex-wrap items-baseline gap-x-3 py-2.5"><span className="font-bold">{t}</span><span className="text-sm text-fg-3">{m}</span></li>
            ))}
          </ul>
          <p className="leading-relaxed text-fg-2">「すごいこと」じゃなくていい。続けてきたことを書き出すだけで、ちゃんとあなたの自己紹介になります。</p>
        </div>

        <div className="space-y-4 border-t border-line pt-12">
          <p className="inline-block rounded-full bg-primary-container px-3 py-0.5 text-sm font-bold text-on-primary-container">2　インスタ交換だけで伝わる</p>
          <h3 className="text-2xl leading-snug font-bold tracking-tight"><Phrases text="新しいバイト先や|サークルで、|インスタを交換したら。" /></h3>
          <ol className="space-y-3">
            {swapSteps.map((t, i) => (
              <li key={t} className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-tertiary-container text-sm font-bold text-on-tertiary-container">{i + 1}</span>
                <span className="pt-0.5">{t}</span>
              </li>
            ))}
          </ol>
          <p className="w-fit max-w-[85%] rounded-2xl rounded-bl-md bg-secondary-container px-4 py-2.5 text-sm text-on-secondary-container">え、フィルムカメラやってるの？今度見せて！</p>
          <p className="leading-relaxed text-fg-2">話すきっかけが、会う前からできている。自分で説明しなくても、小さな声がちゃんと届きます。</p>
          <p className="leading-relaxed text-fg-2">立場や分野を選んでおけば、インスタを交換していない人にも「さがす」から見つけてもらえます。</p>
          <FindCounts />
        </div>
      </section>

      {/* ④ 見本。架空の人（src/lib/demo.ts）。実在の人のページを LP に載せると、その人が消したり直したりしたときに LP が崩れる */}
      <section className="mx-auto max-w-2xl space-y-6">
        <h2 className={sectionHeading}>たとえば、こんなページ</h2>
        <div className="overflow-hidden rounded-3xl border border-line bg-surface">
          <div className="h-16 bg-primary-container" />
          <div className="px-5 pb-5">
            <Avatar src="" className="-mt-8 h-16 w-16 ring-4 ring-surface" />
            <p className="mt-2 text-lg font-bold">{demoProfile.name} <span className="text-sm font-normal text-fg-3">@{demoProfile.username}</span></p>
            <p className="text-fg-2">{demoProfile.tagline}</p>
            <ul className="mt-3 divide-y divide-line border-t border-line">{sectionOrder.map((s) => <SectionRow key={s} s={s} />)}</ul>
          </div>
        </div>
        <Link href="/demo" className="-ml-1 inline-flex min-h-11 items-center gap-1 px-1 text-tertiary">見本のページを見る<Icon name="chevron" className="h-4 w-4" /></Link>
      </section>

      {/* ⑤ はじめかた。登録直後の3問（次の PR）ができたら「3つ答えるだけ」に書き換える */}
      <section className="mx-auto max-w-2xl space-y-6">
        <h2 className={sectionHeading}><Phrases text="名前だけで、|はじめられる" /></h2>
        <ol className="list-decimal space-y-2 pl-6 text-lg">
          <li>メールで登録する</li>
          <li>名前と、書けるところから1つ</li>
          <li>リンクをプロフィール欄に貼る</li>
        </ol>
        <p className="text-sm text-fg-3">あとから少しずつ足せます。</p>
      </section>

      {/* ⑥ よくある不安。カードで囲まず、線で区切った一覧にする */}
      <section className="mx-auto max-w-2xl space-y-6">
        <h2 className={sectionHeading}>よくある不安</h2>
        <dl className="divide-y divide-line border-y border-line">
          {worries.map(([q, a]) => (
            <div key={q} className="space-y-1 py-5">
              <dt className="text-lg font-bold">{q}</dt>
              <dd className="leading-relaxed text-fg-2">{a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ⑦ 締め */}
      <section className="rounded-3xl bg-secondary px-8 py-14 text-center text-on-secondary">
        <h2 className="text-3xl font-bold tracking-tight"><Phrases text="あなたの声を、|届けにいこう。" /></h2>
        {/* 濃い黄色のボタンは「同時に見える範囲で1つ」。ヒーローの CTA とは同じ画面に入らない */}
        <Link href="/signup" className="btn-primary mt-6 px-6 py-3 text-base">無料ではじめる<Icon name="arrow" className="h-4 w-4" /></Link>
      </section>
    </div>
  );
}
