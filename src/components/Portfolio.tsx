"use client";
import { useState } from "react";
import { brandIcon } from "@/components/BrandIcon";
import Icon, { type IconName } from "@/components/Icon";
import Sheet from "@/components/Sheet";
import { contactEmailPattern, gearLink, linkName, normalizeLink } from "@/lib/links.mjs";
import { careerPeriod, splitTechs, statItems } from "@/lib/stats.mjs";
import { type Career, type Gear, type Profile, type Work } from "@/lib/store";

// 公開ページの部品。並びは App Store の作品ページにならう:
// アイコン・名前・数字の行・入手ボタン（メールと SNS）→ 作品の一覧 → 説明 → 情報

export function Avatar({ src, className = "h-10 w-10" }: { src: string; className?: string }) {
  return src ? (
    <img src={src} alt="" className={`${className} shrink-0 rounded-full object-cover`} />
  ) : (
    <div className={`${className} shrink-0 rounded-full bg-primary-container`} />
  );
}

/** ページの頭（App Store のアイコン・アプリ名・カテゴリ・入手ボタンにあたる） */
export function ProfileHero({ p, works }: { p: Profile; works: Work[] }) {
  // SNS・リンクは DB で https だけに絞っているが、href に入れる前にもう一度確かめる
  const links = p.links.filter((u) => u.startsWith("https://"));
  // DB でも形を絞っているが、mailto: に入れる直前にも確かめる
  const email = contactEmailPattern.test(p.contact_email);
  return (
    <section className="space-y-5">
      {/* カバーが無い人にはうすいカナリアの無地の帯を出す（人によってページの頭の形が変わらないように）。
          濃いカナリアは「メールで連絡」ボタンが使うので、帯は primary-container */}
      {p.cover ? <img src={p.cover} alt="" className="aspect-3/1 w-full rounded-2xl object-cover" /> : <div className="aspect-3/1 w-full rounded-2xl bg-primary-container" />}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
        {/* アイコンをカバーの下端に重ねる（X・LinkedIn と同じ形）。縁取りで背景から切り離す */}
        <Avatar src={p.icon} className="relative -mt-17 ml-4 h-24 w-24 ring-4 ring-surface sm:-mt-23 sm:ml-6 sm:h-36 sm:w-36" />
        <div className="min-w-0 space-y-4">
          <div className="space-y-1">
            {/* ユーザー名は名前の右に（X のプロフィールと同じ）。名前が長くて入らなければ次の行に回る */}
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 className="text-3xl leading-tight font-bold tracking-tight sm:text-4xl">{p.name || "名前未設定"}</h1>
              <p className="text-sm text-fg-3">@{p.username}</p>
            </div>
            {p.tagline && <p className="text-lg text-fg-2">{p.tagline}</p>}
          </div>
          <StatsRow p={p} works={works} />
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

// 作品の数字。人の情報（拠点・MBTI・年齢）とは別のまとまりにする
const workStats = new Set(["作品", "よく使う技術"]);

/** 数字の行。帯や区切り線で囲まず「ラベル 値」を詰めて並べ、入りきらなければ折り返す。
 *  横幅を等分した升目に値を1つずつ浮かべると、余白ばかりで作り物っぽく見えたため（ユーザーの指摘）。
 *  置き場所は頭の名前の列（ひとことの下・ボタンの上）。離して右に寄せると、名前・ボタンとの間で視線が行き来して読みにくかった。
 *  作品の数字と人の情報は別の dl にし、入らなければまとまりごと次の行へ送る。全部を1列に詰めて折り返すと、
 *  スマホで「作品」だけが1行目に残り「拠点」が技術の行に付くなど、区切りが幅しだいでばらばらだった（ユーザーの指摘） */
function StatsRow({ p, works }: { p: Profile; works: Work[] }) {
  const items = statItems(p, works);
  const groups = [items.filter((it) => workStats.has(it.label)), items.filter((it) => !workStats.has(it.label))];
  return (
    <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
      {groups.map((g, i) => g.length > 0 && (
        <dl key={i} className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
          {g.map((it) => (
            <div key={it.label} className="flex items-baseline gap-1.5">
              <dt className="text-sm text-fg-3">{it.label}</dt>
              <dd className="font-bold wrap-anywhere">
                {it.value}
                {it.sub && <span className="text-sm font-normal text-fg-3">（{it.sub}）</span>}
              </dd>
            </div>
          ))}
        </dl>
      ))}
    </div>
  );
}

/** 「いまやっていること」「これからやりたいこと」（MyHood の一言のような短い近況）。ページの頭の下に2枚のカードで */
export function NowNext({ p }: { p: Profile }) {
  const cards: [label: string, text: string, tone: string][] = [
    ["いまやっていること", p.doing_now, "bg-primary-container text-on-primary-container"],
    ["これからやりたいこと", p.want_next, "bg-tertiary-container text-on-tertiary-container"],
  ];
  const filled = cards.filter(([, text]) => text.trim());
  if (!filled.length) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {filled.map(([label, text, tone]) => (
        <section key={label} className={`space-y-2 rounded-2xl p-5 ${tone}`}>
          {/* 見出しにアイコンは付けない（時計・矢印、スパナ・芽と試したが野暮ったかった）。2枚の違いはカードの色と見出しの文字で伝わる */}
          <h2 className="text-sm font-bold">{label}</h2>
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

// ステータスの色。公開前（企画中・開発中）は灰、ベータ公開はカナリア（一部に先に出す canary リリースから）、運用中は緑。
// 開発中とベータ公開が同じ灰色で見分けにくかったため分けた。藍はボタンが使うので使わない（1枚のカードに同じ色を
// 2回出さない。開発中をカナリア・ベータ公開を藍にしたら、技術タグやボタンと同じ色になると指摘された）。
// 橙は「注意」の意味に取っておく。値は DB の check 制約でこの4つに絞ってある
const statusTones: Record<Work["status"], string> = {
  企画中: "bg-surface-2 text-fg-2",
  開発中: "bg-surface-2 text-fg-2",
  ベータ公開: "bg-primary-container text-on-primary-container",
  "リリース・運用中": "bg-success-container text-on-success-container",
};

/** 作品のステータス。運用中だけ「●」も付ける（色だけで伝えない） */
export function StatusBadge({ status = "開発中" }: { status?: Work["status"] }) {
  const live = status === "リリース・運用中";
  return (
    <span className={`inline-block shrink-0 rounded-full px-3 py-1 text-xs font-bold ${statusTones[status]}`}>
      {live ? "● " : ""}{status}
    </span>
  );
}

/** 作品の一覧。スマホは1列、PC は2列で下へ並べる（参考: neowritehp.vercel.app の Works）。
 *  横スクロールの棚だと1作品ずつしか見えず、2つ目以降に気づかれにくかったため。
 *  情報はカードに全部出し、「詳細を見る」で同じ内容をシートでも開ける */
export function WorkList({ works }: { works: Work[] }) {
  const [open, setOpen] = useState<Work | null>(null);
  const openUrl = open?.url ? normalizeLink(open.url) : null;
  return (
    <>
      <ul className="grid gap-6 md:grid-cols-2">
        {works.map((w) => {
          // 成果物 URL は https に絞ってから href に入れる（javascript: などを踏ませない）
          const url = w.url ? normalizeLink(w.url) : null;
          return (
            <li key={w.id} className="group card flex flex-col overflow-hidden">
              {/* 画像が無い作品は、空の枠を出さずに文字から始める */}
              {w.image && (
                <div className="aspect-video overflow-hidden border-b border-line">
                  <img src={w.image} alt="" className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.02]" />
                </div>
              )}
              <div className="flex flex-1 flex-col p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={w.status} />
                  {w.period && <span className="text-sm text-fg-3">{w.period}</span>}
                </div>
                <h3 className="mt-4 text-2xl leading-tight font-bold">{w.title}</h3>
                {w.summary && <p className="mt-3 leading-relaxed whitespace-pre-wrap text-fg-2">{w.summary}</p>}
                {w.role && <p className="mt-4 text-sm font-bold">役割：{w.role}</p>}
                <TechTags techs={w.techs} className="mt-4" />
                {/* mt-auto で下端に寄せ、隣のカードと高さが違ってもボタンの位置をそろえる。
                    ボタンは藍。ステータス（灰・カナリア・緑）とも技術タグ（色なし）とも色を重ねない */}
                <div className="mt-auto flex flex-wrap items-center gap-4 pt-6">
                  {url && (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="btn-tonal">
                      実際に触ってみる<Icon name="external" className="h-4 w-4" />
                    </a>
                  )}
                  <button onClick={() => setOpen(w)}
                    className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-fg-2 transition hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg">
                    詳細を見る<Icon name="arrow" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* 見るだけのシートなので、背景のタップや Esc でも閉じる */}
      <Sheet open={!!open} onClose={() => setOpen(null)} title={open?.title ?? ""}
        footer={
          <div className="flex gap-2">
            <button className="btn flex-1" onClick={() => setOpen(null)}>閉じる</button>
            {/* カードと同じ藍。濃いカナリアにすると、ベータ公開のバッジ（カナリア）と同じ色が並ぶ */}
            {openUrl && (
              <a href={openUrl} target="_blank" rel="noopener noreferrer" className="btn-tonal flex-1">
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

/** 技術タグ。色は付けず枠線だけ（参考サイトと同じ形）。ステータスやボタンと同じ色がカードに並ばないように。
 *  等幅の 12px は読みにくかったので、普通の書体の text-sm にする */
function TechTags({ techs, className = "" }: { techs: string; className?: string }) {
  const list = [...new Set(splitTechs(techs))];
  if (!list.length) return null;
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`} aria-label="使用技術">
      {list.map((t) => <li key={t} className="rounded-full border border-line px-3 py-1 text-sm font-medium text-fg-2">{t}</li>)}
    </ul>
  );
}

function WorkDetail({ w }: { w: Work }) {
  return (
    <>
      {w.image && <img src={w.image} alt="" className="aspect-[16/10] w-full rounded-xl border border-line object-cover object-top" />}
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={w.status} />
        {w.period && <span className="text-sm text-fg-3">{w.period}</span>}
      </div>
      {w.summary && <p className="leading-relaxed whitespace-pre-wrap text-fg-2">{w.summary}</p>}
      {w.role && <p className="text-sm font-bold">役割：{w.role}</p>}
      <TechTags techs={w.techs} />
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

/** アイテムの写真。無ければ箱のアイコン */
export function GearThumb({ g, className }: { g: Gear; className: string }) {
  return g.image ? (
    <img src={g.image} alt="" className={`${className} shrink-0 rounded-xl object-cover`} />
  ) : (
    <span className={`${className} flex shrink-0 items-center justify-center rounded-xl bg-primary-container text-on-primary-container`}><Icon name="box" /></span>
  );
}

export function GearRow({ g }: { g: Gear }) {
  // 表示のたびに /dp/ASIN に作り直して運営のタグを付ける（他人のタグは残らない）。Amazon の商品でなければ href にしない
  const url = gearLink(g.url);
  const body = (
    <>
      <GearThumb g={g} className="h-14 w-14" />
      <div className="min-w-0">
        <p className="truncate font-medium">{g.name}</p>
        {g.comment && <p className="text-sm text-fg-2">“{g.comment}”</p>}
      </div>
    </>
  );
  return (
    <div className="card flex min-w-0 items-center gap-3 p-3 transition hover:shadow-md">
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
