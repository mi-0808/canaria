"use client";
import Link from "next/link";
import { useState } from "react";
import FilePicker from "@/components/FilePicker";
import { Empty, GearRow, ProfileView, WorkCard } from "@/components/Portfolio";
import PostItem from "@/components/PostItem";
import Tabs from "@/components/Tabs";
import { gearCategories, missingProfile, newId, useData, type Gear, type Post, type Profile, type Work } from "@/lib/store";

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

const blankWork = (): Work => ({ id: newId(), image: "", title: "", period: "", role: "", progress: 0, summary: "", url: "" });
const blankGear = (): Gear => ({ id: newId(), category: "machine", name: "", comment: "", url: "" });

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="flex justify-between">
        <span className="label">{label}</span>
        {hint && <span className="font-mono text-[11px] text-zinc-400">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

const upsert = <T extends { id: string }>(list: T[], item: T) =>
  list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [item, ...list];

export default function MyPage() {
  const { data, save, ready } = useData();
  // 編集中のものだけ非null
  const [profile, setProfile] = useState<Profile | null>(null);
  const [work, setWork] = useState<Work | null>(null);
  const [gear, setGear] = useState<Gear | null>(null);

  if (!ready) return null;

  const missing = missingProfile(data.profile);
  // 色付きボタンは1つだけ: 編集中は「保存」、それ以外は表示中タブの「追加」
  const editing = profile || work || gear;

  const saveProfile = () => {
    save({ ...data, profile: profile! });
    setProfile(null);
  };
  const saveWork = () => {
    save({ ...data, works: upsert(data.works, work!) });
    setWork(null);
  };
  const saveGear = () => {
    save({ ...data, gear: upsert(data.gear, gear!) });
    setGear(null);
  };
  const removeWork = (id: string) => confirm("この作品を削除しますか？") && save({ ...data, works: data.works.filter((w) => w.id !== id) });
  const removeGear = (id: string) => save({ ...data, gear: data.gear.filter((g) => g.id !== id) });
  const updatePost = (p: Post) => save({ ...data, posts: data.posts.map((x) => (x.id === p.id ? p : x)) });

  const worksTab = (
    <div className="space-y-5">
      {!editing && (
        <div className="flex justify-end"><button className="btn-primary" onClick={() => setWork(blankWork())}>＋ 作品を追加</button></div>
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
            <Field label="進捗率" hint={`${work.progress}%`}>
              <input type="range" min={0} max={100} step={5} className="w-full accent-yellow-400" value={work.progress}
                onChange={(e) => setWork({ ...work, progress: Number(e.target.value) })} />
            </Field>
          </div>
          <div className="space-y-4 md:col-span-2">
            <Field label="概要" hint={`${work.summary.length}/200`}>
              <textarea className="input" rows={3} maxLength={200} value={work.summary} onChange={(e) => setWork({ ...work, summary: e.target.value })} />
            </Field>
            <Field label="成果物URL">
              <input type="url" className="input font-mono" placeholder="https://" value={work.url} onChange={(e) => setWork({ ...work, url: e.target.value })} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 border-t border-zinc-100 pt-5 md:col-span-2">
            <button className="btn" onClick={() => setWork(null)}>キャンセル</button>
            <button className="btn-primary" disabled={!work.title.trim()} onClick={saveWork}>保存</button>
          </div>
        </div>
      )}
      {data.works.length === 0 && !work && <Empty text="最初の作品を追加してみよう" />}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data.works.map((w) => (
          <WorkCard key={w.id} w={w}>
            {!editing && (
              <div className="flex gap-2 pt-1">
                <button className="btn px-3 py-1.5 text-xs" onClick={() => setWork(w)}>編集</button>
                <button className="btn px-3 py-1.5 text-xs" onClick={() => removeWork(w.id)}>削除</button>
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
        <div className="flex justify-end"><button className="btn-primary" onClick={() => setGear(blankGear())}>＋ アイテムを追加</button></div>
      )}
      {gear && (
        <div className="card space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
            <Field label="カテゴリ">
              <select className="input" value={gear.category} onChange={(e) => setGear({ ...gear, category: e.target.value as Gear["category"] })}>
                {Object.entries(gearCategories).map(([k, icon]) => <option key={k} value={k}>{icon} {k}</option>)}
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
          <div className="flex justify-end gap-2 border-t border-zinc-100 pt-5">
            <button className="btn" onClick={() => setGear(null)}>キャンセル</button>
            <button className="btn-primary" disabled={!gear.name.trim()} onClick={saveGear}>保存</button>
          </div>
        </div>
      )}
      {data.gear.length === 0 && !gear && <Empty text="使っているマシンやガジェットを登録しよう" />}
      <div className="grid gap-3 sm:grid-cols-2">
        {data.gear.map((g) => (
          <GearRow key={g.id} g={g}>
            {!editing && (
              <div className="flex gap-1">
                <button className="btn px-2.5 py-1 text-xs" onClick={() => setGear(g)}>編集</button>
                <button className="btn px-2.5 py-1 text-xs" onClick={() => removeGear(g.id)}>削除</button>
              </div>
            )}
          </GearRow>
        ))}
      </div>
    </div>
  );

  const postsTab = (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex justify-end"><Link href="/timeline" className="btn">タイムラインで投稿する →</Link></div>
      {data.posts.length === 0 && <Empty text="制作の過程を発信してみよう" />}
      {data.posts.map((p) => <PostItem key={p.id} post={p} author={data.profile} onChange={updatePost} />)}
    </div>
  );

  return (
    <div className="space-y-10">
      {missing.length > 0 && !profile && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50 px-5 py-4 text-sm">
          <span className="text-lg">🐤</span>
          <span>
            プロフィールを完成させると、タイムラインが見られるようになります。
            <span className="ml-1 font-mono text-xs text-amber-700">未入力: {missing.join(" / ")}</span>
          </span>
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="label">{"// profile"}</p>
            <h2 className="text-2xl font-bold tracking-tight">プロフィール</h2>
          </div>
          <div className="flex gap-2">
            <Link href="/u" className="btn">公開ページを見る ↗</Link>
            {!editing && <button className="btn" onClick={() => setProfile(data.profile)}>編集</button>}
          </div>
        </div>
        {profile ? (
          <div className="card space-y-6 p-6">
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
            <div className="flex justify-end gap-2 border-t border-zinc-100 pt-5">
              <button className="btn" onClick={() => setProfile(null)}>キャンセル</button>
              <button className="btn-primary" onClick={saveProfile}>保存</button>
            </div>
          </div>
        ) : (
          <ProfileView p={data.profile} />
        )}
      </section>

      <Tabs
        tabs={[
          { label: "ポートフォリオ", count: data.works.length, content: worksTab },
          { label: "開発環境", count: data.gear.length, content: gearTab },
          { label: "タイムライン", count: data.posts.length, content: postsTab },
        ]}
      />
    </div>
  );
}
