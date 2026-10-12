"use client";
import { useState } from "react";
import FilePicker from "@/components/FilePicker";
import Icon from "@/components/Icon";
import Sheet from "@/components/Sheet";
import { entryProblem, sectionInfo, workKinds, yearChoices } from "@/lib/entries.mjs";
import type { Entry } from "@/lib/store";

const years = yearChoices(new Date().getFullYear());
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const select = "min-h-11 rounded-lg bg-surface-2 px-3 text-base disabled:opacity-40";

/**
 * 期間の1行。年と月を別々に選ぶ（どちらも任意。月は年を選んでから）。iOS では押すとホイールが出る。
 * end: おわりの側。still: 学校の「出た」だけ、年の選択肢に「まだ（在学中）」を足し、「いまも」と1つの欄にまとめる
 */
function YearMonthRow({ label, e, set, end = false, still }: {
  label: string; e: Entry; set: (patch: Partial<Entry>) => void; end?: boolean; still?: string;
}) {
  const year = end ? e.ended : e.started;
  const month = end ? e.ended_month : e.started_month;
  const isStill = !!still && e.current;
  // 年を外したら月も外す（DB は「月だけ」を通さない）
  const setYear = (v: string) => {
    if (v === "now") return set({ current: true, ended: null, ended_month: null });
    const y = v ? Number(v) : null;
    set(end ? { current: false, ended: y, ended_month: y ? e.ended_month : null } : { started: y, started_month: y ? e.started_month : null });
  };
  const setMonth = (v: string) => {
    const m = v ? Number(v) : null;
    set(end ? { ended_month: m } : { started_month: m });
  };
  return (
    <div className="group-row row-field">
      <span className="flex-1">{label}</span>
      <select aria-label={`${label}の年`} className={select} value={isStill ? "now" : year ?? ""} onChange={(ev) => setYear(ev.target.value)}>
        <option value="">なし</option>
        {still && <option value="now">{still}</option>}
        {years.map((y) => <option key={y} value={y}>{y}年</option>)}
      </select>
      <select aria-label={`${label}の月`} className={select} disabled={!year || isStill} value={month ?? ""} onChange={(ev) => setMonth(ev.target.value)}>
        <option value="">月</option>
        {months.map((m) => <option key={m} value={m}>{m}月</option>)}
      </select>
    </div>
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
  const [uploading, setUploading] = useState(false); // すきなことの写真。届く前に保存すると写真が捨てられるので、その間は保存を止める
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
          <button className="btn-primary rounded-full px-4" disabled={!!problem || saving || uploading} onClick={save}>
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
                <input type="radio" name="learn-kind" className="sr-only" checked={(e.kind || "skill") === k}
                  // 学校の「出た・在学中」は身につけたことでは聞かないので、切り替えたら消す（見えない値を残さない）
                  onChange={() => set(k === "skill" ? { kind: k, ended: null, ended_month: null, current: false } : { kind: k })} />
                {label}
              </label>
            ))}
          </div>
          {e.kind === "school" ? (
            <div className="group-box">
              {titleRow("学校名", "〇〇高校 吹奏楽部")}
              <YearMonthRow label="入った" e={e} set={set} />
              {/* 在学中は「まだ」。おわりと「いまも」を1つの欄にまとめる（学校はどちらか一方なので） */}
              <YearMonthRow label="出た" e={e} set={set} end still="まだ（在学中）" />
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
              <YearMonthRow label="いつ" e={e} set={set} />
            </div>
          )}
        </>
      )}

      {e?.section === "like" && (
        <>
          <div className="space-y-2">
            <span className="group-label">写真（任意・1枚）</span>
            <FilePicker value={e.image} onChange={(image) => set({ image })} onBusy={setUploading} />
            {e.image && <button className="btn w-full" onClick={() => set({ image: "" })}>写真を外す</button>}
          </div>
          <div className="group-box">
            {titleRow("なにが", "バンド、写真、料理")}
            <label className="group-row row-field">
              <span className="w-24 shrink-0">ひとこと</span>
              <input className="row-input" maxLength={300} placeholder="文化祭でギターを弾いた（任意）" value={e.note} onChange={(ev) => set({ note: ev.target.value })} />
            </label>
            {/* すきなことは「おわり」を聞かない。続いているかどうかは問わない */}
            <YearMonthRow label="いつから" e={e} set={set} />
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
      <h3 className="group-label">いつ（任意。月は年を選んでから）</h3>
      <div className="group-box">
        <YearMonthRow label="はじめ" e={e} set={set} />
        <div className="group-row">
          <span id="entry-current" className="flex-1">いまも続けている</span>
          <Switch on={e.current} labelledBy="entry-current" onChange={(on) => set(on ? { current: true, ended: null, ended_month: null } : { current: false })} />
        </div>
        {!e.current && <YearMonthRow label="おわり" e={e} set={set} end />}
      </div>
    </section>
  );
}

/** 説明。最初は「＋ 書く」の1行だけにして、押したときに開く（必須でない欄で画面を長くしない） */
function Note({ e, set, open, setOpen, label, addLabel, placeholder }: {
  e: Entry; set: (patch: Partial<Entry>) => void; open: boolean; setOpen: (o: boolean) => void; label: string; addLabel: string; placeholder: string;
}) {
  // 一度でも開いたら（書いてあった文を全部消しても）閉じない。消した途端に入力欄が消えると、書き直せない
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
          value={e.note} onChange={(ev) => { setOpen(true); set({ note: ev.target.value }); }} />
      </span>
    </label>
  );
}
