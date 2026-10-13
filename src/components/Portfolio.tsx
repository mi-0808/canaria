"use client";
import { useState } from "react";
import { brandIcon } from "@/components/BrandIcon";
import Icon from "@/components/Icon";
import Sheet from "@/components/Sheet";
import { contactEmailPattern, linkName, normalizeLink } from "@/lib/links.mjs";
import { entryMeta, entryPeriod, sectionInfo } from "@/lib/entries.mjs";
import { splitTechs, statItems } from "@/lib/stats.mjs";
import { type Entry, type Profile, type Work } from "@/lib/store";

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
export function ProfileHero({ p }: { p: Profile }) {
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
          <StatsRow p={p} />
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

/** 数字の行。帯や区切り線で囲まず「ラベル 値」を詰めて並べ、入りきらなければ折り返す。
 *  横幅を等分した升目に値を1つずつ浮かべると、余白ばかりで作り物っぽく見えたため（ユーザーの指摘）。
 *  置き場所は頭の名前の列（ひとことの下・ボタンの上）。離して右に寄せると、名前・ボタンとの間で視線が行き来して読みにくかった */
function StatsRow({ p }: { p: Profile }) {
  const items = statItems(p);
  if (!items.length) return null;
  return (
    <dl className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
      {items.map((it) => (
        <div key={it.label} className="flex items-baseline gap-1.5">
          <dt className="text-sm text-fg-3">{it.label}</dt>
          <dd className="font-bold wrap-anywhere">{it.value}</dd>
        </div>
      ))}
    </dl>
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

const FIRST_WORKS = 3; // はたらいたことは最初は新しい3件だけ。長い人のページがここで埋まらないように

/** はたらいたこと・まなんだことの年表（始めた年の新しい順）。左に縦線と点を引き、名前・補足・やったことを並べる。
 *  区切り線だけの一覧にしたら、つながりが見えず素っ気なかった（ユーザーの指摘）ので、前の経歴の年表の形に戻した */
function Timeline({ entries }: { entries: Entry[] }) {
  return (
    <ol className="space-y-6 border-l-2 border-line pl-6">
      {entries.map((e) => {
        // 身につけたことは entryMeta だとひとことが補足に入るので、ここでは「どこで · 期間」にして、ひとことは本文に出す
        const meta = e.section === "work" ? entryMeta(e) : [e.place, entryPeriod(e)].filter(Boolean).join(" · ");
        return (
          <li key={e.id} className="relative space-y-1">
            {/* 縦線（2px）の真ん中に 12px の点: -(左の余白 24px + 線 2px) + 線の半分 1px - 点の半分 6px = -31px。
                いまも続いているものだけカナリア。色だけで伝えないよう、期間にも「いま」と出る */}
            <span aria-hidden className={`absolute top-1.5 -left-[31px] h-3 w-3 rounded-full ring-4 ring-surface ${e.current ? "bg-primary" : "bg-outline"}`} />
            <h3 className="text-lg font-bold">{e.title}</h3>
            {meta && <p className="text-sm text-fg-3">{meta}</p>}
            {e.note && <p className="pt-1 leading-relaxed whitespace-pre-wrap text-fg-2">{e.note}</p>}
          </li>
        );
      })}
    </ol>
  );
}

/** やってきたこと（はたらいたこと・まなんだこと・すきなこと）。空の欄は出さない。entries は始めた年の新しい順 */
export function EntrySections({ entries, heading }: { entries: Entry[]; heading: string }) {
  const [allWork, setAllWork] = useState(false);
  const work = entries.filter((e) => e.section === "work");
  const learn = entries.filter((e) => e.section === "learn");
  const like = entries.filter((e) => e.section === "like");
  return (
    <>
      {work.length > 0 && (
        <section className="space-y-2">
          <h2 className={heading}>{sectionInfo.work.label}</h2>
          <Timeline entries={allWork ? work : work.slice(0, FIRST_WORKS)} />
          {!allWork && work.length > FIRST_WORKS && (
            <button className="-ml-1 inline-flex min-h-11 items-center px-1 text-tertiary" onClick={() => setAllWork(true)}>
              ほか{work.length - FIRST_WORKS}件を見る
            </button>
          )}
        </section>
      )}
      {learn.length > 0 && (
        <section className="space-y-2">
          <h2 className={heading}>{sectionInfo.learn.label}</h2>
          <Timeline entries={learn} />
        </section>
      )}
      {like.length > 0 && (
        <section className="space-y-4">
          <h2 className={heading}>{sectionInfo.like.label}</h2>
          {/* 人柄が伝わる場所なので、写真つきのカードで。写真が無ければ灰色の面（カードの形をそろえる） */}
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {like.map((e) => (
              <li key={e.id} className="card overflow-hidden">
                {e.image ? <img src={e.image} alt="" className="aspect-4/3 w-full object-cover" /> : <div className="aspect-4/3 bg-surface-2" />}
                <div className="p-3">
                  <p className="font-bold">{e.title}</p>
                  {entryMeta(e) && <p className="text-sm text-fg-3">{entryMeta(e)}</p>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

// ステータスの色（ユーザーの指定）。公開前（企画中・開発中）は灰、ベータ公開は藍、運用中は緑。
// 開発中とベータ公開が同じ灰色で見分けにくかったため分けた。カナリアはボタンが使うので使わない（1枚のカードに
// 同じ色を2回出さない）。橙は「注意」の意味に取っておく。値は DB の check 制約でこの4つに絞ってある
const statusTones: Record<Work["status"], string> = {
  企画中: "bg-surface-2 text-fg-2",
  開発中: "bg-surface-2 text-fg-2",
  ベータ公開: "bg-tertiary-container text-on-tertiary-container",
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
          const top = workImages(w)[0];
          return (
            <li key={w.id} className="group card flex flex-col overflow-hidden">
              {/* 画像が無い作品は、空の枠を出さずに文字から始める */}
              {top && <WorkImage src={top} className="aspect-video border-b border-line" />}
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
                    ボタンは薄いカナリア。ステータス（灰・藍・緑）とも技術タグ（色なし）とも色を重ねない。
                    濃いカナリアは1画面に1つ（「メールで連絡」）なので、カードごとに並ぶここは薄いほう */}
                <div className="mt-auto flex flex-wrap items-center gap-4 pt-6">
                  {url && (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="btn-primary-tonal">
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
            {openUrl && (
              <a href={openUrl} target="_blank" rel="noopener noreferrer" className="btn-primary flex-1">
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

/** 作品の画像。縦が横より長ければスマホの画面とみなし、薄い灰色の台の真ん中にスマホの形で立てる。
 *  横長（PC の画面）は枠いっぱいに敷く。向きは DB に持たず、読み込んだ画像の縦横で決める（入力で選ぶ手間を増やさないため）。
 *  ponytail: PC のページ全体を縦長に撮った画像もスマホ扱いになる。入力欄のプレビューで気づける前提で、向きの指定はしない */
export function WorkImage({ src, className }: { src: string; className: string }) {
  const [phone, setPhone] = useState(false);
  return (
    <div className={`overflow-hidden ${phone ? "flex justify-center bg-surface-2 py-4 sm:py-6" : ""} ${className}`}>
      {/* スマホのスクショは機種で縦横比が少しずつ違うので、iPhone の 9:19.5 にそろえて上から見せる */}
      <img src={src} alt="" onLoad={(e) => setPhone(e.currentTarget.naturalHeight > e.currentTarget.naturalWidth)}
        className={`object-cover object-top transition duration-500 group-hover:scale-[1.02] ${phone ? "aspect-[9/19.5] h-full rounded-xl border border-line shadow-md" : "h-full w-full"}`} />
    </div>
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

/** トップ画像と2枚目以降。トップ画像が空でも、2枚目以降があればそれを先頭にする */
const workImages = (w: Work) => [w.image, ...w.shots].filter(Boolean);

function WorkDetail({ w }: { w: Work }) {
  const images = workImages(w);
  return (
    <>
      {/* 2枚以上は横に並べてスワイプで送る（App Store のスクリーンショットの並び）。次の1枚の端を覗かせて続きがあると分かるようにし、
          シートの余白の外まで広げる。キーボードでも送れるよう、並びにフォーカスを当てられるようにする */}
      {images.length > 0 && (
        <ul tabIndex={images.length > 1 ? 0 : undefined} aria-label="作品の画像"
          className="-mx-6 flex snap-x snap-mandatory scroll-px-6 gap-3 overflow-x-auto px-6 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-fg sm:-mx-8 sm:scroll-px-8 sm:px-8">
          {images.map((src) => (
            <li key={src} className={`shrink-0 snap-start ${images.length > 1 ? "w-[85%]" : "w-full"}`}>
              <WorkImage src={src} className="aspect-[16/10] rounded-xl border border-line" />
            </li>
          ))}
        </ul>
      )}
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

export function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-line py-14 text-center">
      <p className="text-sm text-fg-2">{text}</p>
    </div>
  );
}
