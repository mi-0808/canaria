"use client";
import Link from "next/link";
import { useState } from "react";
import CareersEditor from "@/components/CareersEditor";
import Field from "@/components/Field";
import FilePicker from "@/components/FilePicker";
import GearEditor from "@/components/GearEditor";
import Icon from "@/components/Icon";
import LinksEditor from "@/components/LinksEditor";
import { Avatar, Empty, GearThumb, StatusBadge } from "@/components/Portfolio";
import PostItem from "@/components/PostItem";
import Sheet from "@/components/Sheet";
import { ProfileSkeleton } from "@/components/Skeleton";
import Tabs from "@/components/Tabs";
import { contactEmailPattern, normalizeLink } from "@/lib/links.mjs";
import { careerProblem, fromMonth, toMonth } from "@/lib/stats.mjs";
import {
  ensureProfile, loadPortfolio, missingProfile, newId, profileChoices, remove, saveCareer as putCareer, saveGear as putGear, saveProfile as putProfile,
  saveWork as putWork, useAuthedUser, useBusy, useLoad, usernamePattern, workStatuses, type Career, type Gear, type Post, type Profile, type Work,
} from "@/lib/store";

// ポートフォリオを作る画面。一覧は行で並べ、押すと下からシートが出て編集する（HIG: 一覧 → シートで編集）。
// 一覧の位置がずれず、キャンセル・保存がいつも同じ場所にある

const profileSelects: [keyof typeof profileChoices, string][] = [
  ["gender", "性別"],
  ["age", "年齢"],
  ["location", "居住地"],
  ["mbti", "MBTI"],
];

const blankWork = (): Work => ({ id: newId(), image: "", title: "", period: "", role: "", status: "開発中", techs: "", summary: "", url: "" });
const blankGear = (): Gear => ({ id: newId(), name: "", comment: "", url: "", image: "" });
const byStartedDesc = (a: Career, b: Career) => b.started.localeCompare(a.started);

/** シートの下に固定する「キャンセル・保存」 */
function SaveBar({ onCancel, onSave, disabled, saving }: { onCancel: () => void; onSave: () => void; disabled?: boolean; saving: boolean }) {
  return (
    <div className="flex gap-2">
      <button className="btn flex-1" onClick={onCancel}>キャンセル</button>
      <button className="btn-primary flex-1" disabled={disabled || saving} onClick={onSave}>{saving ? "保存中…" : "保存"}</button>
    </div>
  );
}

const upsert = <T extends { id: string }>(list: T[], item: T) =>
  list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [item, ...list];

// 一覧の行。行全体が押せる（高さ 64px）
const rows = "divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface";
const row = "flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-surface-1 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-fg";

export default function MyPage() {
  const user = useAuthedUser();
  const [data, setData] = useLoad(() => user && ensureProfile(user.id).then(() => loadPortfolio(user.id, user.id)), [user]);
  // 編集中のものだけ非null。シートの開閉もこれで決まる
  const [profile, setProfile] = useState<Profile | null>(null);
  const [work, setWork] = useState<Work | null>(null);
  const [gear, setGear] = useState<Gear | null>(null);
  // 経歴はプロフィールの編集の中で一緒に直す。編集中は started / ended を入力欄の値（"2024-04"）で持ち、保存するときに DB の date に直す
  const [careerDrafts, setCareerDrafts] = useState<Career[]>([]);
  const [usernameError, setUsernameError] = useState(""); // 他の人と重なったときなど、保存で弾かれた理由
  const [deleting, setDeleting] = useState<{ table: "works" | "gear"; id: string; name: string } | null>(null);
  const [saving, run] = useBusy();
  const [uploading, runUpload] = useBusy(); // アイテムの写真

  if (!user || !data) return <ProfileSkeleton />;

  const p = data.profile;
  const missing = missingProfile(p);
  const isNewWork = !!work && !data.works.some((w) => w.id === work.id);
  const isNewGear = !!gear && !data.gear.some((g) => g.id === gear.id);

  const editProfile = () => {
    setUsernameError("");
    setCareerDrafts(data.careers.map((c) => ({ ...c, started: toMonth(c.started), ended: c.ended && toMonth(c.ended) })));
    setProfile(p);
  };
  const usernameInvalid = !!profile && !usernamePattern.test(profile.username);
  const linksInvalid = !!profile?.links.some((l) => l.trim() && !normalizeLink(l));
  const emailInvalid = !!profile?.contact_email.trim() && !contactEmailPattern.test(profile.contact_email.trim());
  const careersInvalid = careerDrafts.some((c) => careerProblem(c));
  const saveProfile = () =>
    run(async () => {
      // 空の行は捨て、https にそろえた形で保存する（DB の valid_links と同じ条件）
      const saved = { ...profile!, links: profile!.links.map(normalizeLink).filter((l): l is string => !!l), contact_email: profile!.contact_email.trim() };
      // ユーザー名が他の人と重なったら、経歴には触らずにそこで止める
      const err = await putProfile(user.id, saved);
      if (err) return setUsernameError(err);
      // 経歴: 残っているものは書き直し（足したもの・直したもの）、編集の中で消したものは DB からも消す。どちらも並べて送る
      const careers = careerDrafts.map((c) => ({ ...c, company: c.company.trim(), role: c.role.trim(), started: fromMonth(c.started), ended: c.ended && fromMonth(c.ended) }));
      const removed = data.careers.filter((c) => !careers.some((d) => d.id === c.id));
      await Promise.all([...careers.map(putCareer), ...removed.map((c) => remove("careers", c.id))]);
      setData({ ...data, profile: saved, careers: careers.toSorted(byStartedDesc) });
      setProfile(null);
    });
  const saveWork = () =>
    run(async () => {
      await putWork(work!);
      setData({ ...data, works: upsert(data.works, work!) });
      setWork(null);
    });
  const saveGear = () =>
    run(async () => {
      await putGear(gear!);
      setData({ ...data, gear: upsert(data.gear, gear!) });
      setGear(null);
    });
  // 削除は編集シートの一番下から。消す前に必ず確かめる（取り消せないので）
  const confirmRemove = () =>
    run(async () => {
      const { table, id } = deleting!;
      await remove(table, id);
      if (table === "works") setData({ ...data, works: data.works.filter((w) => w.id !== id) });
      else setData({ ...data, gear: data.gear.filter((g) => g.id !== id) });
      setDeleting(null);
      setWork(null);
      setGear(null);
    });
  const updatePost = (post: Post) => setData({ ...data, posts: data.posts.map((x) => (x.id === post.id ? post : x)) });

  const worksTab = (
    <div className="space-y-4">
      <button className="btn-primary w-full sm:w-auto" onClick={() => setWork(blankWork())}><Icon name="plus" />作品を追加</button>
      {data.works.length === 0 ? <Empty text="最初の作品を追加してみよう" /> : (
        <ul className={rows}>
          {data.works.map((w) => (
            <li key={w.id}>
              <button className={row} onClick={() => setWork(w)}>
                <span className="aspect-video w-20 shrink-0 overflow-hidden rounded-md border border-line bg-primary-container">
                  {w.image && <img src={w.image} alt="" className="h-full w-full object-cover object-top" />}
                </span>
                <span className="min-w-0 flex-1 space-y-1">
                  <span className="block truncate font-bold">{w.title}</span>
                  <StatusBadge status={w.status} />
                </span>
                <span className="sr-only">を編集</span>
                <Icon name="chevron" className="h-5 w-5 text-fg-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const gearTab = (
    <div className="space-y-4">
      <button className="btn-primary w-full sm:w-auto" onClick={() => setGear(blankGear())}><Icon name="plus" />アイテムを追加</button>
      {data.gear.length === 0 ? <Empty text="使っているマシンやガジェットを登録しよう" /> : (
        <ul className={rows}>
          {data.gear.map((g) => (
            <li key={g.id}>
              <button className={row} onClick={() => setGear(g)}>
                <GearThumb g={g} className="h-10 w-10" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{g.name}</span>
                  {g.comment && <span className="block truncate text-sm text-fg-2">{g.comment}</span>}
                </span>
                <span className="sr-only">を編集</span>
                <Icon name="chevron" className="h-5 w-5 text-fg-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const postsTab = (
    <div className="space-y-4">
      <Link href="/" className="btn w-full sm:w-auto">トップで投稿する</Link>
      {data.posts.length === 0 && <Empty text="制作の過程を発信してみよう" />}
      {data.posts.map((post) => <PostItem key={post.id} post={post} uid={user.id} onChange={updatePost} />)}
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {missing.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl bg-warning-container p-4 text-sm text-on-warning-container">
          <Icon name="info" />
          <div className="flex-1">
            <p>プロフィールを完成させると、タイムラインが見られるようになります。未入力: {missing.join(" / ")}</p>
            <button className="-ml-1 inline-flex min-h-11 items-center px-1 font-bold underline underline-offset-4" onClick={editProfile}>入力する</button>
          </div>
        </div>
      )}

      {/* プロフィールは要約だけ。全部の項目は公開ページで見る */}
      <section className="card space-y-4 p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <Avatar src={p.icon} className="h-14 w-14" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold tracking-tight">{p.name || "名前未設定"}</h1>
            <p className="truncate text-sm text-fg-3">@{p.username}</p>
          </div>
          <button className="btn" onClick={editProfile}><Icon name="pen" className="h-4 w-4" />編集</button>
        </div>
        {p.tagline && <p className="text-fg-2">{p.tagline}</p>}
        {/* ?preview で開くと、見る人と同じ見た目（ヘッダー・タブバーなし、左上に戻るボタン）になる */}
        <Link href={`/@${p.username}?preview`} className="btn-tonal w-full">公開ページを見る<Icon name="chevron" className="h-4 w-4" /></Link>
      </section>

      <Tabs
        tabs={[
          { label: "作品", content: worksTab },
          { label: "開発環境", content: gearTab },
          { label: "投稿", content: postsTab },
        ]}
      />

      <Sheet open={!!profile} onClose={() => setProfile(null)} dismissible={false} title="プロフィールを編集"
        footer={<SaveBar onCancel={() => setProfile(null)} onSave={saveProfile} disabled={usernameInvalid || linksInvalid || emailInvalid || careersInvalid} saving={saving} />}>
        {profile && (
          <>
            <div className="space-y-1.5">
              <span className="label">アイコン *</span>
              <FilePicker shape="round" value={profile.icon} onChange={(icon) => setProfile({ ...profile, icon })} />
            </div>
            <div className="space-y-1.5">
              <span className="label">カバー画像</span>
              <FilePicker shape="cover" value={profile.cover} onChange={(cover) => setProfile({ ...profile, cover })} />
              {/* 任意の項目なので、入れたあとで外せるようにする */}
              {profile.cover && <button className="btn" onClick={() => setProfile({ ...profile, cover: "" })}>カバー画像を外す</button>}
            </div>
            <Field label="ユーザー名 *">
              <span className="flex items-center gap-2">
                <span className="font-mono text-fg-3">/@</span>
                <input className="input font-mono" maxLength={20} value={profile.username} aria-invalid={!!usernameError || usernameInvalid}
                  onChange={(e) => { setProfile({ ...profile, username: e.target.value.toLowerCase() }); setUsernameError(""); }} />
              </span>
              {usernameError || usernameInvalid ? (
                <span role="alert" className="block text-sm text-error">{usernameError || "英小文字・数字・_ の3〜20文字で入力してください"}</span>
              ) : profile.username !== p.username ? (
                <span className="block text-sm text-warning">変えると、前の URL（/@{p.username}）は開けなくなります</span>
              ) : (
                <span className="block text-sm text-fg-3">公開ページの URL になります。英小文字・数字・_ の3〜20文字</span>
              )}
            </Field>
            {/* 名前とひとことを横に並べると「姓・名」に見えるので縦に積み、幅も変える */}
            <Field label="名前 *">
              <input className="input max-w-60" autoComplete="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </Field>
            <Field label="ひとこと *">
              <input className="input" value={profile.tagline} onChange={(e) => setProfile({ ...profile, tagline: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              {profileSelects.map(([k, label]) => {
                const choices: readonly string[] = profileChoices[k];
                return (
                  <Field key={k} label={label}>
                    <select className="input" value={profile[k]} onChange={(e) => setProfile({ ...profile, [k]: e.target.value })}>
                      <option value="">未選択</option>
                      {/* 自由入力だった頃の値は消さずに残す */}
                      {profile[k] && !choices.includes(profile[k]) && <option>{profile[k]}</option>}
                      {choices.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                );
              })}
            </div>
            {/* MyHood の一言のような短い近況。公開ページで2枚のカードになる */}
            <Field label="いまやっていること" hint={`${profile.doing_now.length}/100`}>
              <textarea className="input" rows={2} maxLength={100} placeholder="家計簿アプリを運用しながら、決済まわりを勉強中"
                value={profile.doing_now} onChange={(e) => setProfile({ ...profile, doing_now: e.target.value })} />
            </Field>
            <Field label="これからやりたいこと" hint={`${profile.want_next.length}/100`}>
              <textarea className="input" rows={2} maxLength={100} placeholder="受託でフロントエンドの仕事を取りたい"
                value={profile.want_next} onChange={(e) => setProfile({ ...profile, want_next: e.target.value })} />
            </Field>
            <Field label="自己紹介" hint={`${profile.bio.length}/200`}>
              <textarea className="input" rows={4} maxLength={200} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
            </Field>
            <CareersEditor careers={careerDrafts} onChange={setCareerDrafts} />
            <Field label="連絡用メールアドレス">
              <input type="email" inputMode="email" autoComplete="email" className="input" placeholder="you@example.com" value={profile.contact_email}
                aria-invalid={emailInvalid} onChange={(e) => setProfile({ ...profile, contact_email: e.target.value })} />
              {emailInvalid ? (
                <span role="alert" className="block text-sm text-error">メールアドレスの形で入力してください</span>
              ) : (
                <span className="block text-sm text-fg-3">公開ページに「メールで連絡」ボタンが出ます。誰でも見られるので、ログイン用と別のアドレスでも大丈夫です</span>
              )}
            </Field>
            <LinksEditor links={profile.links} onChange={(links) => setProfile({ ...profile, links })} />
          </>
        )}
      </Sheet>

      <Sheet open={!!work} onClose={() => setWork(null)} dismissible={false} title={isNewWork ? "作品を追加" : "作品を編集"}
        footer={<SaveBar onCancel={() => setWork(null)} onSave={saveWork} disabled={!work?.title.trim()} saving={saving} />}>
        {work && (
          <>
            <div className="space-y-1.5">
              <span className="label">トップ画像</span>
              <FilePicker value={work.image} onChange={(image) => setWork({ ...work, image })} />
            </div>
            <Field label="タイトル *">
              <input className="input" value={work.title} onChange={(e) => setWork({ ...work, title: e.target.value })} />
            </Field>
            <Field label="ステータス">
              <select className="input" value={work.status} onChange={(e) => setWork({ ...work, status: e.target.value as Work["status"] })}>
                {workStatuses.map((st) => <option key={st}>{st}</option>)}
              </select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="期間">
                <input className="input" placeholder="2026/04 – 2026/09" value={work.period} onChange={(e) => setWork({ ...work, period: e.target.value })} />
              </Field>
              <Field label="役割">
                <input className="input" placeholder="フロントエンド" value={work.role} onChange={(e) => setWork({ ...work, role: e.target.value })} />
              </Field>
            </div>
            <Field label="使用技術" hint="カンマ区切り">
              <input className="input font-mono" placeholder="Next.js, TypeScript, Supabase" value={work.techs} onChange={(e) => setWork({ ...work, techs: e.target.value })} />
            </Field>
            <Field label="概要" hint={`${work.summary.length}/200`}>
              <textarea className="input" rows={3} maxLength={200} value={work.summary} onChange={(e) => setWork({ ...work, summary: e.target.value })} />
            </Field>
            <Field label="成果物URL">
              <input type="url" className="input font-mono" placeholder="https://" value={work.url} onChange={(e) => setWork({ ...work, url: e.target.value })} />
            </Field>
            {!isNewWork && (
              <button className="btn w-full text-error" onClick={() => setDeleting({ table: "works", id: work.id, name: work.title })}>
                <Icon name="trash" />この作品を削除
              </button>
            )}
          </>
        )}
      </Sheet>

      <Sheet open={!!gear} onClose={() => setGear(null)} dismissible={false} title={isNewGear ? "アイテムを追加" : "アイテムを編集"}
        footer={<SaveBar onCancel={() => setGear(null)} onSave={saveGear} disabled={!gear?.name.trim() || !gear.url || uploading} saving={saving} />}>
        {gear && (
          <>
            <GearEditor gear={gear} setGear={setGear} uploading={uploading} runUpload={runUpload} />
            {!isNewGear && (
              <button className="btn w-full text-error" onClick={() => setDeleting({ table: "gear", id: gear.id, name: gear.name })}>
                <Icon name="trash" />このアイテムを削除
              </button>
            )}
          </>
        )}
      </Sheet>

      {/* 編集シートの上に重ねて開く（あとから開いた dialog が上に来る） */}
      <Sheet open={!!deleting} onClose={() => setDeleting(null)} title={`「${deleting?.name || "名前なし"}」を削除しますか？`}>
        <p className="text-fg-2">削除すると元に戻せません。</p>
        {/* キャンセルを DOM の先に置く。シートを開いたとき最初にフォーカスが当たるので、Enter の押し間違いで消えない。
            見た目はスマホで削除が上・キャンセルが指の届く下（HIG のアクションシート）、PC でキャンセルが左 */}
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <button className="btn sm:flex-1" onClick={() => setDeleting(null)}>キャンセル</button>
          <button className="btn-danger sm:flex-1" disabled={saving} onClick={confirmRemove}><Icon name="trash" />{saving ? "削除中…" : "削除する"}</button>
        </div>
      </Sheet>
    </div>
  );
}
