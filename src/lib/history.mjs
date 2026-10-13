// 見たプロフィールの履歴。このブラウザの localStorage にだけ残す（「誰が誰を見たか」をサーバーに置かないため。ユーザーが選んだ）。
// ログイン中のユーザーごとに分ける（同じブラウザで別の人がログインしても、前の人の履歴が見えないように）。
// .mjs にしてあるのは、scripts/check-history.mjs から Node でそのまま読んで検査するため（nav.mjs と同じ）

export const MAX_HISTORY = 50;

/**
 * 履歴に1人足す。同じ人はいちばん上へ移す（2行にしない）。自分のページは足さない。新しい順で MAX_HISTORY 件まで
 * @param {{ id: string, at: number }[]} list
 * @param {string} id 見たプロフィール
 * @param {string} me 見た人
 * @param {number} at
 */
export function addHistory(list, id, me, at) {
  if (id === me) return list;
  return [{ id, at }, ...list.filter((x) => x.id !== id)].slice(0, MAX_HISTORY);
}

const key = (me) => `history:${me}`;

/**
 * このブラウザに残っている履歴（新しい順）。読めない・壊れているときは空
 * @param {string} me
 * @returns {{ id: string, at: number }[]}
 */
export function readHistory(me) {
  try {
    const list = JSON.parse(localStorage.getItem(key(me)) ?? "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/**
 * @param {string} me
 * @param {string} id
 */
export function pushHistory(me, id) {
  try {
    localStorage.setItem(key(me), JSON.stringify(addHistory(readHistory(me), id, me, Date.now())));
  } catch {} // プライベートブラウズなどで書けなくても、ページは開ける
}
