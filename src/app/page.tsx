import Link from "next/link";
import FindCounts from "@/components/FindCounts";
import Icon, { type IconName } from "@/components/Icon";
import { Collage, type ArtName } from "@/components/LpArt";
import Phrases from "@/components/Phrases";
import { Avatar, Timeline } from "@/components/Portfolio";
import { sectionInfo } from "@/lib/entries.mjs";
import { demoEntries, demoProfile, entry } from "@/lib/demo";
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

// ③の1。「特にないです」と言っていた人が書き出したもの。公開ページの年表と同じ部品で見せる
const written = [
  entry({ id: "s1", section: "work", kind: "バイト", title: "カフェのバイト", started: 2024, started_month: 4, current: true, note: "いまは新人に教える係" }),
  entry({ id: "s2", section: "learn", kind: "skill", title: "吹奏楽部", place: "高校", started: 2021, ended: 2024, note: "定期演奏会でソロ" }),
  entry({ id: "s3", section: "learn", kind: "skill", title: "火おこし", place: "キャンプで", started: 2023 }),
];

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
      <section className="mx-auto max-w-4xl space-y-16">
        <div className="space-y-2 text-center">
          <p className="text-sm text-fg-3">カナリアは、小さな鳥。</p>
          <h2 className={sectionHeading}>
            <Phrases text="小さな声でも、" />
            <br />
            <span className="bg-[linear-gradient(transparent_62%,var(--color-marker)_62%)] text-marker-text">届けられる。</span>
          </h2>
        </div>

        {/* 1 と 2 は②と同じことを言わない。②は「書けることがある」、ここは「なぜ小さな声でも届くのか」 */}
        {/* ほかの画面と同じ部品で見せる（番号のラベル・吹き出し・番号つきの手順は「AI っぽい」とユーザーの指摘で外した）。
            絵は灰色の面に入れ、下に見出しと1文。PC では左右に並べ、2つ目は左右を入れ替える */}
        <div className="grid items-center gap-6 md:grid-cols-2 md:gap-12">
          <div aria-hidden className="rounded-3xl bg-surface-2 p-6">
            <Timeline entries={written} />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl leading-snug font-bold tracking-tight"><Phrases text="「特にないです」の中にも、|書けることはある。" /></h3>
            <p className="leading-relaxed text-fg-2">バイトの2年、部活の3年間、キャンプで覚えた火おこし。書き出すと、ちゃんと自己紹介になります。</p>
          </div>
        </div>

        <div className="grid items-center gap-6 md:grid-cols-2 md:gap-12">
          {/* インスタを交換した相手が見るもの: プロフィール画面 → リンクを開いた先の Canaria */}
          <div aria-hidden className="rounded-3xl bg-surface-2 p-6 md:order-2">
            <div className="space-y-2 rounded-2xl bg-surface p-4">
              <div className="flex items-center gap-3">
                <Avatar src="" className="h-10 w-10" />
                <div>
                  <p className="font-bold">kana_film</p>
                  <p className="text-sm text-fg-2">大学2年 / 写真 / カフェ</p>
                </div>
              </div>
              <p className="inline-flex items-center gap-1.5 rounded-md bg-tertiary-container px-2 py-0.5 text-sm font-bold text-on-tertiary-container">
                <Icon name="link" className="h-4 w-4" />Canaria のプロフィール
              </p>
            </div>
            <div className="flex justify-center py-2 text-fg-3"><Icon name="arrow" className="h-5 w-5 rotate-90" /></div>
            <div className="rounded-2xl bg-surface px-4 py-2">
              <p className="pt-2 font-bold">{demoProfile.name}</p>
              <ul className="divide-y divide-line">{sectionOrder.map((s) => <SectionRow key={s} s={s} />)}</ul>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl leading-snug font-bold tracking-tight"><Phrases text="インスタを交換するだけで、|あなたのことが伝わる。" /></h3>
            <p className="leading-relaxed text-fg-2">新しいバイト先やサークルで。プロフィール欄のリンクを開けば、やってきたこと・すきなことが1ページで見えます。</p>
            <p className="leading-relaxed text-fg-2">立場や分野を選んでおけば、インスタを交換していない人にも「さがす」から見つけてもらえます。</p>
            <FindCounts />
          </div>
        </div>
      </section>

      {/* ④ よくある不安。カードで囲まず、線で区切った一覧にする */}
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

      {/* ⑤ 締め */}
      <section className="rounded-3xl bg-secondary px-8 py-14 text-center text-on-secondary">
        <h2 className="text-3xl font-bold tracking-tight"><Phrases text="インスタを交換する前に、|作っておこう。" /></h2>
        {/* 濃い黄色のボタンは「同時に見える範囲で1つ」。ヒーローの CTA とは同じ画面に入らない */}
        <Link href="/signup" className="btn-primary mt-6 px-6 py-3 text-base">無料ではじめる<Icon name="arrow" className="h-4 w-4" /></Link>
      </section>
    </div>
  );
}
