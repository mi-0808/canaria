"use client";
import { useState } from "react";
import Field from "@/components/Field";
import FilePicker, { ShotsPicker } from "@/components/FilePicker";
import Icon from "@/components/Icon";
import { Empty, StatusBadge } from "@/components/Portfolio";
import Sheet from "@/components/Sheet";
import { ListSkeleton } from "@/components/Skeleton";
import { newId, remove, saveWork as putWork, useBusy, workStatuses, type Work } from "@/lib/store";
import { ConfirmDelete, ListHeader, SaveBar, upsert, useMyPortfolio } from "../parts";

const blankWork = (): Work => ({ id: newId(), image: "", shots: [], title: "", period: "", role: "", status: "開発中", techs: "", summary: "", url: "" });

// 作品の一覧と編集。今回は /me から画面を移しただけで、項目と見せ方は前のまま（作り直しは別の機会に）
export default function WorksPage() {
  const { data, setData } = useMyPortfolio();
  const [work, setWork] = useState<Work | null>(null); // 編集中のものだけ非null。シートの開閉もこれで決まる
  const [deleting, setDeleting] = useState(false);
  const [saving, run] = useBusy();
  if (!data) return <ListSkeleton />;

  const isNew = !!work && !data.works.some((w) => w.id === work.id);
  const save = () =>
    run(async () => {
      await putWork(work!);
      setData({ ...data, works: upsert(data.works, work!) });
      setWork(null);
    });
  const confirmRemove = () =>
    run(async () => {
      await remove("works", work!.id);
      setData({ ...data, works: data.works.filter((w) => w.id !== work!.id) });
      setDeleting(false);
      setWork(null);
    });

  return (
    <div data-grouped className="mx-auto max-w-xl space-y-6">
      <ListHeader title="作品" hint="つくったアプリ・サイトなど" addLabel="作品を追加" onAdd={() => setWork(blankWork())} />
      {data.works.length === 0 ? <Empty text="右上の ＋ から追加できます" /> : (
        <ul className="group-box">
          {data.works.map((w) => (
            <li key={w.id}>
              <button className="group-row py-3" onClick={() => setWork(w)}>
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

      <Sheet open={!!work} onClose={() => setWork(null)} dismissible={false} title={isNew ? "作品を追加" : "作品を編集"}
        footer={<SaveBar onCancel={() => setWork(null)} onSave={save} disabled={!work?.title.trim()} saving={saving} />}>
        {work && (
          <>
            <div className="space-y-1.5">
              <span className="label">トップ画像</span>
              <FilePicker value={work.image} onChange={(image) => setWork((w) => w && { ...w, image })} />
              <span className="block text-sm text-fg-3">スマホのアプリは、スクリーンショットを縦長のまま選ぶと、スマホの形で表示されます</span>
            </div>
            <div className="space-y-1.5">
              <span className="label">ほかの画像（9枚まで）</span>
              <ShotsPicker value={work.shots} max={9} onChange={(f) => setWork((w) => w && { ...w, shots: f(w.shots) })} />
              <span className="block text-sm text-fg-3">「詳細を見る」で、トップ画像に続けて横に並びます</span>
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
            {!isNew && (
              <button className="btn w-full text-error" onClick={() => setDeleting(true)}><Icon name="trash" />この作品を削除</button>
            )}
          </>
        )}
      </Sheet>
      <ConfirmDelete name={deleting ? work?.title ?? "" : null} onCancel={() => setDeleting(false)} onConfirm={confirmRemove} saving={saving} />
    </div>
  );
}
