"use client";
import Link from "next/link";
import Icon from "@/components/Icon";
import Sheet from "@/components/Sheet";
import { ensureProfile, loadPortfolio, useAuthedUser, useLoad } from "@/lib/store";

// /me 以下の画面（プロフィール・やってきたこと・作品）で使い回す部品

/** 自分のプロフィールを読む。プロフィールの行が無いとき（登録した直後）だけ作ってから読み直す（作品などの外部キー先）。
 *  毎回先に作りに行くと、画面を移るたびに書き込みが1回増えるため */
const loadMine = async (uid: string) => (await loadPortfolio(uid)) ?? ensureProfile(uid).then(() => loadPortfolio(uid));

export function useMyPortfolio() {
  const user = useAuthedUser();
  const [data, setData] = useLoad(() => user && loadMine(user.id), [user]);
  return { user, data, setData };
}

export const upsert = <T extends { id: string }>(list: T[], item: T) =>
  list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [item, ...list];

/** シートの下に固定する「キャンセル・保存」 */
export function SaveBar({ onCancel, onSave, disabled, saving }: { onCancel: () => void; onSave: () => void; disabled?: boolean; saving: boolean }) {
  return (
    <div className="flex gap-2">
      <button className="btn flex-1" onClick={onCancel}>キャンセル</button>
      <button className="btn-primary flex-1" disabled={disabled || saving} onClick={onSave}>{saving ? "保存中…" : "保存"}</button>
    </div>
  );
}

/** 一覧の画面の頭。上に「‹ プロフィール」、見出しの行の右端に丸い「＋」。
 *  「＋」を戻るの行（見出しの右上）に置くと、何を足すボタンなのかが見出しから離れて見えたので、見出しと同じ行にする（ユーザーの指示） */
export function ListHeader({ title, hint, addLabel, onAdd }: { title: string; hint: string; addLabel: string; onAdd?: () => void }) {
  return (
    <div className="space-y-2">
      <Link href="/me" className="-ml-1 inline-flex min-h-11 items-center gap-1 px-1 text-tertiary">
        <Icon name="arrow" className="h-4 w-4 rotate-180" />プロフィール
      </Link>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {/* この画面の主な行動なので濃いカナリア（1画面に1つ）。上限まで足したら出さない（理由は hint に出す） */}
        {onAdd && (
          <button aria-label={addLabel} onClick={onAdd} className="btn-primary w-11 shrink-0 rounded-full px-0">
            <Icon name="plus" className="h-6 w-6" />
          </button>
        )}
      </div>
      <p className="text-sm text-fg-3">{hint}</p>
    </div>
  );
}

/** 消す前の確認。編集シートの上に重ねて開く（あとから開いた dialog が上に来る） */
export function ConfirmDelete({ name, onCancel, onConfirm, saving }: { name: string | null; onCancel: () => void; onConfirm: () => void; saving: boolean }) {
  return (
    <Sheet open={name !== null} onClose={onCancel} title={`「${name || "名前なし"}」を削除しますか？`}>
      <p className="text-fg-2">削除すると元に戻せません。</p>
      {/* キャンセルを DOM の先に置く。シートを開いたとき最初にフォーカスが当たるので、Enter の押し間違いで消えない。
          見た目はスマホで削除が上・キャンセルが指の届く下（HIG のアクションシート）、PC でキャンセルが左 */}
      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        <button className="btn sm:flex-1" onClick={onCancel}>キャンセル</button>
        <button className="btn-danger sm:flex-1" disabled={saving} onClick={onConfirm}><Icon name="trash" />{saving ? "削除中…" : "削除する"}</button>
      </div>
    </Sheet>
  );
}
