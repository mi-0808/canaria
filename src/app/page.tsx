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

// ③の1「並べると、伝わる」。ばらばらの言葉が、期間とやったことつきで並ぶと人柄になる、を見せる
const scattered = ["カフェのバイト", "吹奏楽部", "火おこし", "古着"];
const lined: [string, string][] = [
  ["カフェのバイト", "2年 · 新人に教える係"],
  ["吹奏楽部", "3年間 · 定期演奏会でソロ"],
  ["火おこし", "キャンプで覚えた"],
  ["古着", "下北沢で探すのが好き"],
];
// ③の2「その先まで届く」。プロフィール欄の1行の先に見えるもの（見本の人に合わせる）
const beyond: [Section, string][] = [["work", "カフェのバイト · いま"], ["learn", "吹奏楽部 · 3年間"], ["like", "フィルムカメラ · 古着"]];

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
          <p className="inline-block rounded-full bg-primary-container px-3 py-0.5 text-sm font-bold text-on-primary-container">1　並べると、伝わる</p>
          <h3 className="text-2xl leading-snug font-bold tracking-tight"><Phrases text="ひとつずつは小さくても、|並べると「あなた」になる。" /></h3>
          <p className="text-sm text-fg-3">ばらばらだと</p>
          <ul className="flex flex-wrap gap-2">
            {scattered.map((t) => <li key={t} className="rounded-lg bg-surface-2 px-3 py-1 text-sm text-fg-2">{t}</li>)}
          </ul>
          <p className="flex items-center justify-center gap-1 text-sm text-fg-3"><Icon name="arrow" className="h-4 w-4 rotate-90" />Canaria で並べると</p>
          <ul className="divide-y divide-line rounded-2xl border border-line px-4">
            {lined.map(([t, m]) => (
              <li key={t} className="flex flex-wrap items-baseline gap-x-3 py-2.5"><span className="font-bold">{t}</span><span className="text-sm text-fg-3">{m}</span></li>
            ))}
          </ul>
          <p className="leading-relaxed text-fg-2">続けてきた時間と、そこでやったこと。小さなことほど、並べたときに「どんな人か」が見えてきます。</p>
        </div>

        <div className="space-y-4 border-t border-line pt-12">
          <p className="inline-block rounded-full bg-primary-container px-3 py-0.5 text-sm font-bold text-on-primary-container">2　その先まで届く</p>
          <h3 className="text-2xl leading-snug font-bold tracking-tight"><Phrases text="プロフィール欄の1行の、|その先まで。" /></h3>
          <div className="rounded-2xl border border-line p-4">
            <p className="text-sm text-fg-3">インスタのプロフィール欄</p>
            <p>大学2年 / 写真 / カフェ</p>
            <p className="flex items-center gap-1.5 text-sm text-tertiary"><Icon name="link" className="h-4 w-4" />Canaria のプロフィール</p>
          </div>
          <p className="flex items-center justify-center gap-1 text-sm text-fg-3"><Icon name="arrow" className="h-4 w-4 rotate-90" />タップした人に見えるのは</p>
          <div className="rounded-2xl bg-primary-container px-4 pt-3 pb-1 text-on-primary-container">
            <p className="text-sm">{demoProfile.name} のプロフィール</p>
            <ul className="divide-y divide-line">
              {beyond.map(([sec, m]) => (
                <li key={sec} className="flex flex-wrap items-baseline gap-x-3 py-2.5"><span className="font-bold">{sectionInfo[sec].label}</span><span className="text-sm">{m}</span></li>
              ))}
            </ul>
          </div>
          <p className="leading-relaxed text-fg-2">プロフィール欄に入りきらなかったことを、リンク1本で。立場や分野を選んでおけば、「さがす」からも見つけてもらえます。</p>
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
