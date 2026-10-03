"use client";
import { useState } from "react";
import { brandIcon } from "@/components/BrandIcon";
import Icon, { type IconName } from "@/components/Icon";
import Sheet from "@/components/Sheet";
import { contactEmailPattern, gearLink, linkName, normalizeLink } from "@/lib/links.mjs";
import { careerPeriod, splitTechs, statItems } from "@/lib/stats.mjs";
import { gearCategories, type Career, type Gear, type Profile, type Work } from "@/lib/store";

// 公開ページの部品。並びは App Store の作品ページにならう:
// アイコン・名前・入手ボタン（メールと SNS）→ 数字の行 → スクリーンショットの棚 → 説明 → 情報

export const gearIcons: Record<Gear["category"], IconName> = { machine: "laptop", keyboard: "keyboard", display: "monitor", mouse: "mouse", audio: "headphones", other: "box" };

export function Avatar({ src, className = "h-10 w-10" }: { src: string; className?: string }) {
  return src ? (
    <img src={src} alt="" className={`${className} shrink-0 rounded-full object-cover`} />
  ) : (
    <div className={`${className} shrink-0 rounded-full bg-primary-container`} />
  );
}

/** ページの頭（App Store のアイコン・アプリ名・カテゴリ・入手ボタンにあたる） */
export function ProfileHero({ p }: { p: Profile }) {
  // SNS・リンクは DB で https だけに絞っているが、href に入れる前にもう一度確かめる
  const links = p.links.filter((u) => u.startsWith("https://"));
  // DB でも形を絞っているが、mailto: に入れる直前にも確かめる
  const email = contactEmailPattern.test(p.contact_email);
  return (
    <section className="space-y-5">
      {p.cover && <img src={p.cover} alt="" className="aspect-3/1 w-full rounded-2xl object-cover" />}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
        {/* カバーがあるときは、アイコンをカバーの下端に重ねる（X・LinkedIn と同じ形）。縁取りで背景から切り離す */}
        <Avatar src={p.icon} className={`h-24 w-24 sm:h-36 sm:w-36 ${p.cover ? "relative -mt-17 ml-4 ring-4 ring-surface sm:-mt-23 sm:ml-6" : ""}`} />
        <div className="min-w-0 space-y-4">
          <div className="space-y-1">
            {/* ユーザー名は名前の右に（X のプロフィールと同じ）。名前が長くて入らなければ次の行に回る */}
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 className="text-3xl leading-tight font-bold tracking-tight sm:text-4xl">{p.name || "名前未設定"}</h1>
              <p className="text-sm text-fg-3">@{p.username}</p>
            </div>
            {p.tagline && <p className="text-lg text-fg-2">{p.tagline}</p>}
          </div>
          {/* 仕事の相談の入口。公開ページを見た人がいちばん取りたい行動なので、メールは主役の黄色のボタン。
              SNS はそのすぐ横（スマホではメールが横幅いっぱいなので下の行）に並べ、「こちらからでも連絡できる」と見せる */}
          {(email || links.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {email && (
                <a href={`mailto:${p.contact_email}`} className="btn-primary w-full sm:w-auto">
                  <Icon name="mail" />メールで連絡
                </a>
              )}
              {links.map((u) => <SocialLink key={u} url={u} />)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/** 数字の行（App Store の評価・ランキングの行にあたる）。
 *  スマホで横スクロールにすると端の項目が見切れて気付かれないので、2行に折り返して1画面に収める（5件なら 3+2、4件なら 2+2）。
 *  区切り線は各項目の左に引き、行頭の線だけ -ml-px と overflow-hidden で隠す（折り返し位置が変わっても崩れない） */
export function StatsRow({ p, works }: { p: Profile; works: Work[] }) {
  const items = statItems(p, works);
  const basis = items.length === 4 ? "basis-1/2" : "basis-1/3";
  return (
    <div className="-mx-4 overflow-hidden border-y border-line py-4 sm:mx-0">
      <dl className="-ml-px flex flex-wrap gap-y-5">
        {items.map((it) => (
          <div key={it.label} className={`flex ${basis} grow flex-col items-center gap-1 border-l border-line px-2 text-center sm:basis-0 sm:px-4`}>
            <dt className="text-sm text-fg-3">{it.label}</dt>
            {/* 数字は大きく、文字（技術名・会社名など）は2行までに収まる大きさで */}
            <dd className={`line-clamp-2 font-bold wrap-anywhere text-fg-2 ${/^\d/.test(it.value) ? "text-2xl" : "text-lg leading-snug"}`}>{it.value}</dd>
            <dd className="min-h-5 text-sm text-fg-3">{it.sub}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** 「いまやっていること」「これからやりたいこと」（MyHood の一言のような短い近況）。数字の行の下に2枚のカードで */
export function NowNext({ p }: { p: Profile }) {
  const cards: [label: string, text: string, icon: IconName, tone: string][] = [
    ["いまやっていること", p.doing_now, "clock", "bg-primary-container text-on-primary-container"],
    ["これからやりたいこと", p.want_next, "arrow", "bg-tertiary-container text-on-tertiary-container"],
  ];
  const filled = cards.filter(([, text]) => text.trim());
  if (!filled.length) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {filled.map(([label, text, icon, tone]) => (
        <section key={label} className={`space-y-2 rounded-2xl p-5 ${tone}`}>
          <h2 className="flex items-center gap-2 text-sm font-bold"><Icon name={icon} className="h-4 w-4" />{label}</h2>
          <p className="leading-relaxed whitespace-pre-wrap">{text}</p>
        </section>
      ))}
    </div>
  );
}

/** 経歴の年表（始まりの新しい順）。左に縦線と点を引き、勤務先・役職・期間・実績を並べる */
export function CareerTimeline({ careers }: { careers: Career[] }) {
  return (
    <ol className="space-y-6 border-l-2 border-line pl-6">
      {careers.map((c) => (
        <li key={c.id} className="relative space-y-1">
          {/* 年表の点。縦線（2px）の真ん中に 12px の点を置く: -(左の余白 24px + 線 2px) + 線の半分 1px - 点の半分 6px = -31px。
              今も続いているものだけカナリア。色だけで伝えないよう、期間にも「現在」と出る */}
          <span aria-hidden className={`absolute top-1.5 -left-[31px] h-3 w-3 rounded-full ring-4 ring-surface ${c.ended ? "bg-outline" : "bg-primary"}`} />
          <h3 className="text-lg font-bold">{c.company}</h3>
          {c.role && <p className="text-fg-2">{c.role}</p>}
          <p className="text-sm text-fg-3">{careerPeriod(c.started, c.ended)}</p>
          {c.summary && <p className="pt-1 leading-relaxed whitespace-pre-wrap text-fg-2">{c.summary}</p>}
        </li>
      ))}
    </ol>
  );
}

/** 作品のステータス。運用中だけ緑＋「●」（色だけで伝えない） */
export function StatusBadge({ status = "開発中" }: { status?: Work["status"] }) {
  const live = status === "リリース・運用中";
  return (
    <span className={`inline-block shrink-0 rounded-full px-3 py-1 text-xs font-bold ${live ? "bg-success-container text-on-success-container" : "bg-surface-2 text-fg-2"}`}>
      {live ? "● " : ""}{status}
    </span>
  );
}

// 棚の作品は、カナリアと藍の面を交互に敷く（App Store のスクリーンショットの色付きの台紙）
const tones = ["bg-primary-container text-on-primary-container", "bg-tertiary-container text-on-tertiary-container"];

/** 作品の棚（App Store のスクリーンショットの列にあたる）。横にスクロールし、押すと詳しい情報がシートで出る */
export function WorkShelf({ works }: { works: Work[] }) {
  const [open, setOpen] = useState<Work | null>(null);
  // 成果物 URL は https に絞ってから href に入れる（javascript: などを踏ませない）
  const url = open?.url ? normalizeLink(open.url) : null;
  return (
    <>
      <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:scroll-px-0 sm:px-0">
        {works.map((w, i) => (
          <li key={w.id} className="group relative w-[85%] shrink-0 snap-start sm:w-96">
            <div className={`space-y-4 rounded-3xl p-5 ${tones[i % 2]}`}>
              {w.summary && <p className="line-clamp-2 text-center text-sm leading-relaxed font-medium">{w.summary}</p>}
              <div className="aspect-[16/10] overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
                {w.image ? (
                  <img src={w.image} alt="" className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.02]" />
                ) : (
                  <span className="flex h-full items-center justify-center text-fg-3"><Icon name="image" className="h-8 w-8" /></span>
                )}
              </div>
            </div>
            <div className="mt-3 flex items-start justify-between gap-3 px-1">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-bold">
                  {/* カード全体を押せるよう、ボタンの当たり判定（::after）をカードいっぱいに広げる。
                      ボタンの中には見出しや段落を入れられないので、ボタンは作品名だけを包む */}
                  <button className="text-left after:absolute after:inset-0 after:rounded-3xl after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-fg"
                    onClick={() => setOpen(w)}>
                    {w.title}
                  </button>
                </h3>
                {(w.period || w.role) && <p className="truncate text-sm text-fg-3">{[w.period, w.role].filter(Boolean).join(" · ")}</p>}
              </div>
              <StatusBadge status={w.status} />
            </div>
          </li>
        ))}
      </ul>

      {/* 見るだけのシートなので、背景のタップや Esc でも閉じる */}
      <Sheet open={!!open} onClose={() => setOpen(null)} title={open?.title ?? ""}
        footer={
          <div className="flex gap-2">
            <button className="btn flex-1" onClick={() => setOpen(null)}>閉じる</button>
            {url && (
              <a href={url} target="_blank" rel="noopener noreferrer" className="btn-primary flex-1">
                実際に触ってみる<Icon name="external" className="h-4 w-4" />
              </a>
            )}
          </div>
        }>
        {open && <WorkDetail w={open} />}
      </Sheet>
    </>
  );
}

function WorkDetail({ w }: { w: Work }) {
  const techs = [...new Set(splitTechs(w.techs))];
  return (
    <>
      {w.image && <img src={w.image} alt="" className="aspect-[16/10] w-full rounded-xl border border-line object-cover object-top" />}
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={w.status} />
        {w.period && <span className="text-sm text-fg-3">{w.period}</span>}
      </div>
      {w.summary && <p className="leading-relaxed whitespace-pre-wrap text-fg-2">{w.summary}</p>}
      {w.role && <p className="text-sm font-bold">役割：{w.role}</p>}
      {techs.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="使用技術">
          {techs.map((t) => <li key={t} className="rounded-full bg-tertiary-container px-3 py-1 font-mono text-xs text-on-tertiary-container">{t}</li>)}
        </ul>
      )}
    </>
  );
}

/** SNS・リンク1件。ロゴを持っているサービスは丸いアイコンだけのボタン、それ以外は名前（知らないサイトはドメイン）を書いたボタン。
 *  アイコンだけだと、知らないサイトはどこへ飛ぶのか分からないため。渡す前に https だけに絞っておくこと */
function SocialLink({ url }: { url: string }) {
  const name = linkName(url);
  const logo = brandIcon(name);
  return (
    // rel="me": このページの持ち主のアカウントだと、相手のサービスに伝える
    <a href={url} target="_blank" rel="noopener noreferrer me" aria-label={logo ? name : undefined}
      className={`btn rounded-full ${logo ? "w-11 px-0" : ""}`}>
      {logo ?? <><Icon name="link" className="h-4 w-4" />{name}</>}
    </a>
  );
}

export function GearRow({ g }: { g: Gear }) {
  // 商品 URL も https に絞ってから href に入れる（javascript: などを踏ませない）。Amazon ならアソシエイトリンクにする
  const url = g.url ? gearLink(g.url) : null;
  const body = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-container text-on-primary-container"><Icon name={gearIcons[g.category]} /></span>
      <div className="min-w-0">
        <p className="truncate font-medium">{g.name}</p>
        {g.comment ? <p className="text-sm text-fg-2">“{g.comment}”</p> : <p className="text-sm text-fg-3">{gearCategories[g.category]}</p>}
      </div>
    </>
  );
  return (
    <div className="card flex items-center gap-3 p-3 transition hover:shadow-md">
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer sponsored" className="flex min-w-0 flex-1 items-center gap-3">
          {body}
          <Icon name="external" className="ml-auto h-4 w-4 text-tertiary" />
        </a>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3">{body}</div>
      )}
    </div>
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-line py-14 text-center">
      <p className="text-sm text-fg-2">{text}</p>
    </div>
  );
}
