"use client";
import { useState } from "react";
import FilePicker from "@/components/FilePicker";
import Icon from "@/components/Icon";
import Sheet from "@/components/Sheet";
import { entryProblem, sectionInfo, workKinds, yearChoices } from "@/lib/entries.mjs";
import type { Entry } from "@/lib/store";

const years = yearChoices(new Date().getFullYear());

/** 年だけを選ぶ。iOS では押すとホイールが出る。「なし」も選べる（期間は任意） */
function YearSelect({ value, onChange, extra }: { value: string; onChange: (v: string) => void; extra?: [value: string, label: string] }) {
  return (
    <select className="min-h-11 rounded-lg bg-surface-2 px-3 text-base" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">なし</option>
      {extra && <option value={extra[0]}>{extra[1]}</option>}
      {years.map((y) => <option key={y} value={y}>{y}年</option>)}
    </select>
  );
}

/** オン・オフのスイッチ（iOS の Switch）。見た目 32px、当たり判定は ::before で 48px */
function Switch({ on, onChange, labelledBy }: { on: boolean; onChange: (on: boolean) => void; labelledBy: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-labelledby={labelledBy} onClick={() => onChange(!on)}
      className="group relative h-8 w-13 shrink-0 rounded-full bg-fg-3 transition before:absolute before:-inset-2 before:content-[''] aria-checked:bg-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg">
      <span className="absolute top-0.5 left-0.5 h-7 w-7 rounded-full bg-surface-raised shadow-sm transition group-aria-checked:translate-x-5" />
    </button>
  );
}

const year = (n: number | null) => (n ? String(n) : "");
const toYear = (v: string) => (v ? Number(v) : null);

/**
 * やってきたこと1件を足す・直すシート。必須は名前だけで、ほかは後からでいい（入力の手間を最初にかけない）。
 * 欄ごとに聞くことを変える: はたらいたこと＝どこで・なにを・いつ、まなんだこと＝学校か身につけたこと、すきなこと＝写真・なにが・いつから
 */
export default function EntrySheet({ entry, setEntry, isNew, saving, onSave, onClose, onDelete }: {
  entry: Entry | null;
  setEntry: (f: (e: Entry) => Entry) => void;
  isNew: boolean;
  saving: boolean;
  onSave: () => void;
  onClose: () => void;
  onDelete: () => void;
}) {
  // 「なにを」をチップに無い言葉で書くか。直すときは、保存済みの言葉がチップに無ければ最初から開いておく
  const [writing, setWriting] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const e = entry;
  const problem = e && entryProblem(e);
  const set = (patch: Partial<Entry>) => setEntry((x) => ({ ...x, ...patch }));
  const info = e ? sectionInfo[e.section] : null;
  const close = () => { setWriting(false); setNoteOpen(false); onClose(); };
  const save = () => { setWriting(false); setNoteOpen(false); onSave(); };

  const titleRow = (label: string, placeholder: string) => (
    <label className="group-row row-field">
      <span className="w-24 shrink-0">{label}</span>
      <input className="row-input" maxLength={100} placeholder={placeholder} value={e!.title} onChange={(ev) => set({ title: ev.target.value })} />
    </label>
  );

  return (
    <Sheet open={!!e} onClose={close} dismissible={false} title={info?.label ?? ""}
      bar={{
        left: <button className="-ml-1 min-h-11 px-1 text-tertiary" onClick={close}>キャンセル</button>,
        right: (
          <button className="btn-primary min-h-9 rounded-full px-4 py-1.5" disabled={!!problem || saving} onClick={save}>
            {saving ? "保存中…" : isNew ? "足す" : "保存"}
          </button>
        ),
      }}>
      {e?.section === "work" && (
        <>
          <div className="group-box">{titleRow("どこで", "駅前のカフェ、〇〇株式会社")}</div>
          <section className="space-y-2">
            <h3 className="group-label">なにを（任意）</h3>
            <div className="group-box space-y-3 p-3">
              <div className="flex flex-wrap gap-2">
                {workKinds.map((k) => (
                  <button key={k} type="button" aria-pressed={e.kind === k} onClick={() => { setWriting(false); set({ kind: e.kind === k ? "" : k }); }}
                    className="btn rounded-full aria-pressed:border-tertiary aria-pressed:bg-tertiary-container aria-pressed:font-bold aria-pressed:text-on-tertiary-container">
                    {k}
                  </button>
                ))}
                <button type="button" aria-pressed={writing || (!!e.kind && !workKinds.includes(e.kind))}
                  onClick={() => { setWriting(true); if (workKinds.includes(e.kind)) set({ kind: "" }); }}
                  className="btn rounded-full aria-pressed:border-tertiary aria-pressed:bg-tertiary-container aria-pressed:font-bold aria-pressed:text-on-tertiary-container">
                  <Icon name="pen" className="h-4 w-4" />自分で書く
                </button>
              </div>
              {(writing || (!!e.kind && !workKinds.includes(e.kind))) && (
                <input className="input" maxLength={100} placeholder="アルバイトリーダー、運営スタッフ など" aria-label="なにを"
                  value={e.kind} onChange={(ev) => set({ kind: ev.target.value })} />
              )}
            </div>
          </section>
          <Period e={e} set={set} />
          <Note e={e} set={set} open={noteOpen} setOpen={setNoteOpen} label="やったこと" addLabel="やったことを書く"
            placeholder="レジと仕込みを担当。新人の教え方をまとめた" />
        </>
      )}

      {e?.section === "learn" && (
        <>
          {/* 学校は「名前と年」だけ、身につけたことは「何を」だけで足せる。聞くことが違うので切り替える */}
          <div role="radiogroup" aria-label="種類" className="segmented">
            {([["skill", "身につけたこと"], ["school", "学校"]] as const).map(([k, label]) => (
              <label key={k} className="segment">
                <input type="radio" name="learn-kind" className="sr-only" checked={(e.kind || "skill") === k} onChange={() => set({ kind: k })} />
                {label}
              </label>
            ))}
          </div>
          {e.kind === "school" ? (
            <div className="group-box">
              {titleRow("学校名", "〇〇高校 吹奏楽部")}
              <label className="group-row row-field">
                <span className="flex-1">入った年</span>
                <YearSelect value={year(e.started)} onChange={(v) => set({ started: toYear(v) })} />
              </label>
              {/* 在学中は「まだ」。おわりの年と「いまも」を1つの欄にまとめる（学校はどちらか一方なので） */}
              <label className="group-row row-field">
                <span className="flex-1">出た年</span>
                <YearSelect value={e.current ? "now" : year(e.ended)} extra={["now", "まだ（在学中）"]}
                  onChange={(v) => set(v === "now" ? { current: true, ended: null } : { current: false, ended: toYear(v) })} />
              </label>
            </div>
          ) : (
            <div className="group-box">
              {titleRow("なにを", "火おこし、英会話")}
              <label className="group-row row-field">
                <span className="w-24 shrink-0">どこで</span>
                <input className="row-input" maxLength={100} placeholder="キャンプの講習（任意）" value={e.place} onChange={(ev) => set({ place: ev.target.value })} />
              </label>
              <label className="group-row row-field">
                <span className="w-24 shrink-0">ひとこと</span>
                <input className="row-input" maxLength={300} placeholder="マッチなしで火がつく（任意）" value={e.note} onChange={(ev) => set({ note: ev.target.value })} />
              </label>
            </div>
          )}
        </>
      )}

      {e?.section === "like" && (
        <>
          <div className="space-y-2">
            <span className="group-label">写真（任意・1枚）</span>
            <FilePicker value={e.image} onChange={(image) => set({ image })} />
            {e.image && <button className="btn w-full" onClick={() => set({ image: "" })}>写真を外す</button>}
          </div>
          <div className="group-box">
            {titleRow("なにが", "バンド、写真、料理")}
            <label className="group-row row-field">
              <span className="w-24 shrink-0">ひとこと</span>
              <input className="row-input" maxLength={300} placeholder="文化祭でギターを弾いた（任意）" value={e.note} onChange={(ev) => set({ note: ev.target.value })} />
            </label>
            {/* すきなことは「おわり」を聞かない。続いているかどうかは問わない */}
            <label className="group-row row-field">
              <span className="flex-1">いつから</span>
              <YearSelect value={year(e.started)} onChange={(v) => set({ started: toYear(v) })} />
            </label>
          </div>
        </>
      )}

      {/* 名前が空のときは「足す」が押せないだけで十分伝わるので、形がおかしいときだけ文で知らせる */}
      {e && problem && e.title.trim() && <p role="alert" className="px-4 text-sm text-error">{problem}</p>}

      {e && !isNew && (
        <button className="btn w-full text-error" onClick={onDelete}><Icon name="trash" />削除</button>
      )}
    </Sheet>
  );
}

/** はたらいたことの「いつ」。「いまも続けている」は最初はオフ。オンにすると「おわり」の行が消える */
function Period({ e, set }: { e: Entry; set: (patch: Partial<Entry>) => void }) {
  return (
    <section className="space-y-2">
      <h3 className="group-label">いつ（任意・年だけ）</h3>
      <div className="group-box">
        <label className="group-row row-field">
          <span className="flex-1">はじめ</span>
          <YearSelect value={year(e.started)} onChange={(v) => set({ started: toYear(v) })} />
        </label>
        <div className="group-row">
          <span id="entry-current" className="flex-1">いまも続けている</span>
          <Switch on={e.current} labelledBy="entry-current" onChange={(on) => set(on ? { current: true, ended: null } : { current: false })} />
        </div>
        {!e.current && (
          <label className="group-row row-field">
            <span className="flex-1">おわり</span>
            <YearSelect value={year(e.ended)} onChange={(v) => set({ ended: toYear(v) })} />
          </label>
        )}
      </div>
    </section>
  );
}

/** 説明。最初は「＋ 書く」の1行だけにして、押したときに開く（必須でない欄で画面を長くしない） */
function Note({ e, set, open, setOpen, label, addLabel, placeholder }: {
  e: Entry; set: (patch: Partial<Entry>) => void; open: boolean; setOpen: (o: boolean) => void; label: string; addLabel: string; placeholder: string;
}) {
  if (!open && !e.note) {
    return (
      <div className="group-box">
        <button className="group-row text-tertiary" onClick={() => setOpen(true)}><Icon name="plus" className="h-4 w-4" />{addLabel}</button>
      </div>
    );
  }
  return (
    <label className="block space-y-2">
      <span className="group-label flex justify-between"><span>{label}</span><span>{e.note.length}/300</span></span>
      <span className="group-box row-field block p-4">
        <textarea className="row-input block resize-none" rows={3} maxLength={300} autoFocus={open && !e.note} placeholder={placeholder}
          value={e.note} onChange={(ev) => set({ note: ev.target.value })} />
      </span>
    </label>
  );
}
