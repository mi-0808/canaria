"use client";
import { notFound, useParams } from "next/navigation";
import { useState } from "react";
import EntrySheet from "@/components/EntrySheet";
import Icon from "@/components/Icon";
import { Empty } from "@/components/Portfolio";
import { ListSkeleton } from "@/components/Skeleton";
import { MAX_PER_SECTION, byNewest, cleanEntry, entryMeta, sectionInfo } from "@/lib/entries.mjs";
import { newId, remove, saveEntry, sections, useBusy, type Entry, type Section } from "@/lib/store";
import { ConfirmDelete, ListHeader, upsert, useMyPortfolio } from "../parts";

const isSection = (s: string): s is Section => (sections as readonly string[]).includes(s);

// まなんだことは「身につけたこと」から聞く（学校より当てはまる人が多い）
const blank = (section: Section): Entry => ({
  id: newId(), section, kind: section === "learn" ? "skill" : "", title: "", place: "", note: "",
  started: null, started_month: null, ended: null, ended_month: null, current: false, image: "",
});

// /me/work・/me/learn・/me/like。3つの欄は同じ形の一覧なので、1つの画面を使い回す
export default function SectionPage() {
  const { section } = useParams<{ section: string }>();
  const { data, setData } = useMyPortfolio();
  const [entry, setEntry] = useState<Entry | null>(null); // 編集中のものだけ非null。シートの開閉もこれで決まる
  const [deleting, setDeleting] = useState(false);
  const [saving, run] = useBusy();
  if (!isSection(section)) notFound();
  if (!data) return <ListSkeleton />;

  const info = sectionInfo[section];
  const list = data.entries.filter((e) => e.section === section);
  const isNew = !!entry && !data.entries.some((e) => e.id === entry.id);

  const save = () =>
    run(async () => {
      const saved = await saveEntry(cleanEntry(entry!));
      setData({ ...data, entries: upsert(data.entries, saved).toSorted(byNewest) });
      setEntry(null);
    });
  const confirmRemove = () =>
    run(async () => {
      await remove("entries", entry!.id);
      setData({ ...data, entries: data.entries.filter((e) => e.id !== entry!.id) });
      setDeleting(false);
      setEntry(null);
    });

  return (
    <div data-grouped className="mx-auto max-w-xl space-y-6">
      <ListHeader title={info.label} hint={list.length < MAX_PER_SECTION ? info.hint : `${MAX_PER_SECTION}件まで足せます。足すときは、どれかを消してください`}
        addLabel={`${info.label}を足す`} onAdd={list.length < MAX_PER_SECTION ? () => setEntry(blank(section)) : undefined} />
      {list.length === 0 ? <Empty text="右上の ＋ から足せます" /> : (
        <ul className="group-box">
          {list.map((e) => {
            const meta = entryMeta(e);
            return (
              <li key={e.id}>
                <button className="group-row py-2.5" onClick={() => setEntry(e)}>
                  {e.section === "like" && e.image && <img src={e.image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{e.title}</span>
                    {meta && <span className="block truncate text-sm text-fg-3">{meta}</span>}
                  </span>
                  <span className="sr-only">を編集</span>
                  <Icon name="chevron" className="h-5 w-5 text-fg-3" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <EntrySheet entry={entry} setEntry={(f) => setEntry((e) => e && f(e))} isNew={isNew} saving={saving}
        onSave={save} onClose={() => setEntry(null)} onDelete={() => setDeleting(true)} />
      <ConfirmDelete name={deleting ? entry?.title ?? "" : null} onCancel={() => setDeleting(false)} onConfirm={confirmRemove} saving={saving} />
    </div>
  );
}
