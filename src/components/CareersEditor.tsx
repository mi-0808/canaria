"use client";
import Field from "@/components/Field";
import Icon from "@/components/Icon";
import { careerProblem } from "@/lib/stats.mjs";
import { newId, type Career } from "@/lib/store";

const MAX_CAREERS = 20;

// プロフィール編集の中の「経歴」。別のタブや画面にせず、その場で何件でも足し引きして、プロフィールの「保存」で一緒に保存する。
// 「キャンセル」で全部元に戻るので、削除の確認は出さない（HIG の連絡先の編集と同じ）。
// started / ended は入力欄の値（"2024-04"）。ended が null なら「いまも続けている」、"" ならおわりが未入力
export default function CareersEditor({ careers, onChange }: { careers: Career[]; onChange: (careers: Career[]) => void }) {
  const set = (i: number, patch: Partial<Career>) => onChange(careers.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  return (
    <fieldset className="space-y-3">
      <legend className="label">経歴</legend>
      <p className="text-sm text-fg-3">勤務先や学校など。公開ページに、はじめの新しい順の年表で出ます（{MAX_CAREERS}件まで）</p>
      {careers.map((c, i) => {
        const problem = careerProblem(c);
        return (
          <div key={c.id} className="space-y-4 rounded-2xl border border-line bg-surface-1 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-sm font-bold">{c.company.trim() || "新しい経歴"}</span>
              <button type="button" className="btn-sm shrink-0 text-error" aria-label={`${c.company.trim() || "新しい経歴"} を削除`}
                onClick={() => onChange(careers.filter((_, j) => j !== i))}>
                <Icon name="trash" className="h-4 w-4" />削除
              </button>
            </div>
            <Field label="勤務先・所属 *">
              <input className="input" maxLength={100} placeholder="株式会社カナリア、〇〇大学 など" value={c.company} onChange={(e) => set(i, { company: e.target.value })} />
            </Field>
            <Field label="役職・ポジション">
              <input className="input" maxLength={100} placeholder="フロントエンドエンジニア" value={c.role} onChange={(e) => set(i, { role: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              {/* type="month" に対応していない PC の Safari・Firefox では文字の入力欄になるので、placeholder で形を示す */}
              <Field label="はじめ *">
                <input type="month" className="input" placeholder="2024-04" value={c.started} onChange={(e) => set(i, { started: e.target.value })} />
              </Field>
              <Field label="おわり">
                <input type="month" className="input" placeholder="2025-03" value={c.ended ?? ""} disabled={c.ended === null}
                  onChange={(e) => set(i, { ended: e.target.value })} />
              </Field>
            </div>
            <label className="flex min-h-11 items-center gap-3">
              <input type="checkbox" className="h-5 w-5 accent-tertiary" checked={c.ended === null} onChange={(e) => set(i, { ended: e.target.checked ? null : "" })} />
              いまも続けている
            </label>
            <Field label="実績・やったこと" hint={`${c.summary.length}/300`}>
              <textarea className="input" rows={3} maxLength={300} placeholder="予約システムの画面を React で作り直し、表示を2倍速くした"
                value={c.summary} onChange={(e) => set(i, { summary: e.target.value })} />
            </Field>
            {/* 形や前後がおかしいときは赤字で。未入力は書いている途中かもしれないので控えめに */}
            {problem && (
              <p role={problem.level === "invalid" ? "alert" : undefined} className={`text-sm ${problem.level === "invalid" ? "text-error" : "text-fg-3"}`}>
                {problem.text}
              </p>
            )}
          </div>
        );
      })}
      {careers.length < MAX_CAREERS && (
        <button type="button" className="btn" onClick={() => onChange([...careers, { id: newId(), company: "", role: "", started: "", ended: null, summary: "" }])}>
          <Icon name="plus" />経歴を追加
        </button>
      )}
    </fieldset>
  );
}
