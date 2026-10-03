"use client";
import { useState } from "react";
import Icon, { type IconName } from "@/components/Icon";
import Sheet from "@/components/Sheet";
import { contactEmailPattern, linkName, normalizeLink } from "@/lib/links.mjs";
import { splitTechs, statItems } from "@/lib/stats.mjs";
import { gearCategories, type Gear, type Profile, type Work } from "@/lib/store";

// 公開ページの部品。並びは App Store の作品ページにならう:
// アイコン・名前・入手ボタン → 数字の行 → スクリーンショットの棚 → 説明と関連リンク → 情報

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
  return (
    <section className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
      <Avatar src={p.icon} className="h-24 w-24 sm:h-36 sm:w-36" />
      <div className="min-w-0 space-y-4">
        <div className="space-y-1">
          <h1 className="text-3xl leading-tight font-bold tracking-tight sm:text-4xl">{p.name || "名前未設定"}</h1>
          {p.tagline && <p className="text-lg text-fg-2">{p.tagline}</p>}
          <p className="text-sm text-fg-3">@{p.username}</p>
        </div>
        {/* 仕事の相談の入口。公開ページを見た人がいちばん取りたい行動なので、主役の黄色のボタン。
            DB でも形を絞っているが、mailto: に入れる直前にも確かめる */}
        {contactEmailPattern.test(p.contact_email) && (
          <a href={`mailto:${p.contact_email}`} className="btn-primary w-full sm:w-auto">
            <Icon name="mail" />メールで連絡
          </a>
        )}
      </div>
    </section>
  );
}

/** 数字の行（App Store の評価・ランキングの行にあたる）。入りきらないスマホでは横にスクロールする */
export function StatsRow({ p, works }: { p: Profile; works: Work[] }) {
  return (
    <dl className="-mx-4 flex snap-x overflow-x-auto border-y border-line py-4 sm:mx-0">
      {statItems(p, works).map((it) => (
        <div key={it.label} className="flex min-w-32 flex-1 snap-start flex-col items-center gap-1 border-l border-line px-4 text-center first:border-l-0">
          <dt className="text-sm text-fg-3">{it.label}</dt>
          {/* 数字は大きく、文字（技術名・会社名など）は2行までに収まる大きさで */}
          <dd className={`line-clamp-2 font-bold text-fg-2 ${/^\d/.test(it.value) ? "text-2xl" : "text-lg leading-snug"}`}>{it.value}</dd>
          <dd className="min-h-5 text-sm text-fg-3">{it.sub}</dd>
        </div>
      ))}
    </dl>
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

/** SNS・リンクの一覧（App Store の「Web サイト」「サポート」の並びにあたる）。渡す前に https だけに絞っておくこと */
export function LinkList({ links }: { links: string[] }) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {links.map((u) => (
        <li key={u}>
          {/* rel="me": このページの持ち主のアカウントだと、相手のサービスに伝える */}
          <a href={u} target="_blank" rel="noopener noreferrer me"
            className="flex min-h-12 items-center justify-between gap-3 text-tertiary transition hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg">
            {linkName(u)}
            <Icon name="external" className="h-4 w-4" />
          </a>
        </li>
      ))}
    </ul>
  );
}

export function GearRow({ g }: { g: Gear }) {
  // 商品 URL も https に絞ってから href に入れる（javascript: などを踏ませない）
  const url = g.url ? normalizeLink(g.url) : null;
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
