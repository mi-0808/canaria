"use client";
import Link from "next/link";
import { useState } from "react";
import FilePicker from "@/components/FilePicker";
import LinksEditor from "@/components/LinksEditor";
import Icon from "@/components/Icon";
import { Empty, GearRow, ProfileView, WorkCard } from "@/components/Portfolio";
import PostItem from "@/components/PostItem";
import Sheet from "@/components/Sheet";
import { ProfileSkeleton } from "@/components/Skeleton";
import Tabs from "@/components/Tabs";
import { normalizeLink } from "@/lib/links.mjs";
import {
  ensureProfile, gearCategories, loadPortfolio, missingProfile, newId, remove, saveGear as putGear, saveProfile as putProfile, saveWork as putWork,
  useAuthedUser, useBusy, useLoad, usernamePattern, workStatuses, type Gear, type Post, type Profile, type Work,
} from "@/lib/store";

const profileFields: [keyof Profile, string][] = [
  ["name", "名前 *"],
  ["gender", "性別"],
  ["age", "年齢"],
  ["location", "居住地"],
  ["company", "勤務先"],
  ["years", "勤続年数"],
  ["mbti", "MBTI"],
  ["tagline", "ひとこと *"],
];

const blankWork = (): Work => ({ id: newId(), image: "", title: "", period: "", role: "", status: "開発中", techs: "", summary: "", url: "" });
const blankGear = (): Gear => ({ id: newId(), category: "machine", name: "", comment: "", url: "" });

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="flex justify-between">
        <span className="label">{label}</span>
        {hint && <span className="text-sm text-fg-3">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

const upsert = <T extends { id: string }>(list: T[], item: T) =>
  list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [item, ...list];

export default function MyPage() {
  const user = useAuthedUser();
  const [data, setData] = useLoad(() => user && ensureProfile(user.id).then(() => loadPortfolio(user.id, user.id)), [user]);
  // 編集中のものだけ非null
  const [profile, setProfile] = useState<Profile | null>(null);
  const [work, setWork] = useState<Work | null>(null);
  const [gear, setGear] = useState<Gear | null>(null);
  const [usernameError, setUsernameError] = useState(""); // 他の人と重なったときなど、保存で弾かれた理由
  // 削除の確認シートに出す対象。閉じたあとも名前が一瞬「undefined」にならないよう、最後の値を残す
  const [deleting, setDeleting] = useState<{ table: "works" | "gear"; id: string; name: string } | null>(null);
  const [lastDeleting, setLastDeleting] = useState(deleting);
  if (deleting && deleting !== lastDeleting) setLastDeleting(deleting);
  const [saving, run] = useBusy();

  if (!user || !data) return <ProfileSkeleton />;

  const missing = missingProfile(data.profile);
  // 色付きボタンは1つだけ: 編集中は「保存」、それ以外は表示中タブの「追加」
  const editing = profile || work || gear;

  const usernameInvalid = profile && !usernamePattern.test(profile.username);
  const linksInvalid = profile?.links.some((l) => l.trim() && !normalizeLink(l));
  const saveProfile = () =>
    run(async () => {
      // 空の行は捨て、https にそろえた形で保存する（DB の valid_links と同じ条件）
      const saved = { ...profile!, links: profile!.links.map(normalizeLink).filter((l): l is string => !!l) };
      const err = await putProfile(user.id, saved);
      if (err) return setUsernameError(err);
      setData({ ...data, profile: saved });
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
  // 作品もアイテムも、消す前に必ず確かめる（取り消せないので）
  const confirmRemove = () =>
    run(async () => {
      const { table, id } = deleting!;
      await remove(table, id);
      if (table === "works") setData({ ...data, works: data.works.filter((w) => w.id !== id) });
      else setData({ ...data, gear: data.gear.filter((g) => g.id !== id) });
      setDeleting(null);
    });
  const saveLabel = saving ? "保存中…" : "保存";
  const updatePost = (p: Post) => setData({ ...data, posts: data.posts.map((x) => (x.id === p.id ? p : x)) });

  const worksTab = (
    <div className="space-y-5">
      {!editing && (
        <div className="flex justify-end"><button className="btn-primary" onClick={() => setWork(blankWork())}><Icon name="plus" />作品を追加</button></div>
      )}
      {work && (
        <div className="card grid gap-6 p-6 md:grid-cols-[1fr_1.2fr]">
          <Field label="トップ画像">
            <FilePicker value={work.image} onChange={(image) => setWork({ ...work, image })} />
          </Field>
          <div className="space-y-4">
            <Field label="タイトル *">
              <input className="input" value={work.title} onChange={(e) => setWork({ ...work, title: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="期間">
                <input className="input" placeholder="2026/04 – 2026/09" value={work.period} onChange={(e) => setWork({ ...work, period: e.target.value })} />
              </Field>
              <Field label="役割">
                <input className="input" placeholder="フロントエンド" value={work.role} onChange={(e) => setWork({ ...work, role: e.target.value })} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="ステータス">
                <select className="input" value={work.status ?? "開発中"} onChange={(e) => setWork({ ...work, status: e.target.value as Work["status"] })}>
                  {workStatuses.map((st) => <option key={st}>{st}</option>)}
                </select>
              </Field>
              <Field label="使用技術" hint="カンマ区切り">
                <input className="input font-mono" placeholder="Next.js, TypeScript, Supabase" value={work.techs ?? ""} onChange={(e) => setWork({ ...work, techs: e.target.value })} />
              </Field>
            </div>
          </div>
          <div className="space-y-4 md:col-span-2">
            <Field label="概要" hint={`${work.summary.length}/200`}>
              <textarea className="input" rows={3} maxLength={200} value={work.summary} onChange={(e) => setWork({ ...work, summary: e.target.value })} />
            </Field>
            <Field label="成果物URL">
              <input type="url" className="input font-mono" placeholder="https://" value={work.url} onChange={(e) => setWork({ ...work, url: e.target.value })} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 border-t border-line pt-5 md:col-span-2">
            <button className="btn" onClick={() => setWork(null)}>キャンセル</button>
            <button className="btn-primary" disabled={!work.title.trim() || saving} onClick={saveWork}>{saveLabel}</button>
          </div>
        </div>
      )}
      {data.works.length === 0 && !work && <Empty text="最初の作品を追加してみよう" />}
      <div className="grid gap-6 md:grid-cols-2">
        {data.works.map((w) => (
          <WorkCard key={w.id} w={w}>
            {!editing && (
              <div className="ml-auto flex gap-2">
                <button className="btn-sm" onClick={() => setWork(w)}>編集</button>
                <button className="btn-sm text-error" onClick={() => setDeleting({ table: "works", id: w.id, name: w.title })}>削除</button>
              </div>
            )}
          </WorkCard>
        ))}
      </div>
    </div>
  );

  const gearTab = (
    <div className="space-y-5">
      {!editing && (
        <div className="flex justify-end"><button className="btn-primary" onClick={() => setGear(blankGear())}><Icon name="plus" />アイテムを追加</button></div>
      )}
      {gear && (
        <div className="card space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
            <Field label="カテゴリ">
              <select className="input" value={gear.category} onChange={(e) => setGear({ ...gear, category: e.target.value as Gear["category"] })}>
                {Object.entries(gearCategories).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
              </select>
            </Field>
            <Field label="アイテム名 *">
              <input className="input" placeholder="MacBook Pro M4" value={gear.name} onChange={(e) => setGear({ ...gear, name: e.target.value })} />
            </Field>
          </div>
          <Field label="おすすめポイント" hint={`${gear.comment.length}/80`}>
            <input className="input" maxLength={80} placeholder="例: 作業領域が倍になって、もう戻れない" value={gear.comment} onChange={(e) => setGear({ ...gear, comment: e.target.value })} />
          </Field>
          <Field label="商品URL">
            <input type="url" className="input font-mono" placeholder="https://" value={gear.url} onChange={(e) => setGear({ ...gear, url: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2 border-t border-line pt-5">
            <button className="btn" onClick={() => setGear(null)}>キャンセル</button>
            <button className="btn-primary" disabled={!gear.name.trim() || saving} onClick={saveGear}>{saveLabel}</button>
          </div>
        </div>
      )}
      {data.gear.length === 0 && !gear && <Empty text="使っているマシンやガジェットを登録しよう" />}
      <div className="grid gap-3 sm:grid-cols-2">
        {data.gear.map((g) => (
          <GearRow key={g.id} g={g}>
            {!editing && (
              <div className="flex gap-2">
                <button className="btn-sm" onClick={() => setGear(g)}>編集</button>
                <button className="btn-sm text-error" onClick={() => setDeleting({ table: "gear", id: g.id, name: g.name })}>削除</button>
              </div>
            )}
          </GearRow>
        ))}
      </div>
    </div>
  );

  const postsTab = (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex justify-end"><Link href="/" className="btn">ホームで投稿する →</Link></div>
      {data.posts.length === 0 && <Empty text="制作の過程を発信してみよう" />}
      {data.posts.map((p) => <PostItem key={p.id} post={p} uid={user.id} onChange={updatePost} />)}
    </div>
  );

  return (
    <div className="space-y-10">
      {missing.length > 0 && !profile && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-warning-container px-5 text-on-warning-container py-4 text-sm">
          <Icon name="info" />
          <span>
            プロフィールを完成させると、タイムラインが見られるようになります。
            <span className="ml-1">未入力: {missing.join(" / ")}</span>
          </span>
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">プロフィール</h2>
          </div>
          <div className="flex gap-2">
            <Link href={`/@${data.profile.username}`} className="btn">公開ページを見る ↗</Link>
            {!editing && <button className="btn" onClick={() => setProfile(data.profile)}>編集</button>}
          </div>
        </div>
        {profile ? (
          <div className="card space-y-6 p-6">
            <Field label="ユーザー名（公開ページの URL） *" hint="英小文字・数字・_ の3〜20文字">
              <span className="flex items-center gap-2">
                <span className="font-mono text-fg-3">/@</span>
                <input className="input font-mono" maxLength={20} value={profile.username} aria-invalid={!!(usernameError || usernameInvalid)}
                  onChange={(e) => { setProfile({ ...profile, username: e.target.value.toLowerCase() }); setUsernameError(""); }} />
              </span>
              {usernameError || usernameInvalid ? (
                <span role="alert" className="block text-sm text-error">{usernameError || "英小文字・数字・_ の3〜20文字で入力してください"}</span>
              ) : profile.username !== data.profile.username && (
                <span className="block text-sm text-warning">変えると、前の URL（/@{data.profile.username}）は開けなくなります</span>
              )}
            </Field>
            <Field label="アイコン *">
              <FilePicker shape="round" value={profile.icon} onChange={(icon) => setProfile({ ...profile, icon })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              {profileFields.map(([k, label]) => (
                <Field key={k} label={label}>
                  <input className="input" value={profile[k]} onChange={(e) => setProfile({ ...profile, [k]: e.target.value })} />
                </Field>
              ))}
            </div>
            <Field label="自己紹介" hint={`${profile.bio.length}/200`}>
              <textarea className="input" rows={4} maxLength={200} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
            </Field>
            <LinksEditor links={profile.links} onChange={(links) => setProfile({ ...profile, links })} />
            <div className="flex justify-end gap-2 border-t border-line pt-5">
              <button className="btn" onClick={() => { setProfile(null); setUsernameError(""); }}>キャンセル</button>
              <button className="btn-primary" disabled={!!usernameInvalid || linksInvalid || saving} onClick={saveProfile}>{saveLabel}</button>
            </div>
          </div>
        ) : (
          <ProfileView p={data.profile} />
        )}
      </section>

      <Tabs
        tabs={[
          { label: "作品", count: data.works.length, content: worksTab },
          { label: "開発環境", count: data.gear.length, content: gearTab },
          { label: "投稿", count: data.posts.length, content: postsTab },
        ]}
      />

      <Sheet open={!!deleting} onClose={() => setDeleting(null)} title={`「${lastDeleting?.name || "名前なし"}」を削除しますか？`}>
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
