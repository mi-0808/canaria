// 「さがす」（/find）の絞り込みと数え方、プロフィールの分野の選び方。
// .mjs にしてあるのは、scripts/check-find.mjs から Node でそのまま読んで検査するため（history.mjs と同じ）

/** 分野はいくつまで選べるか。DB の check（cardinality(fields) <= 3）と同じ */
export const MAX_FIELDS = 3;

/**
 * 分野のチップを押したとき。選んであれば外し、まだなら足す（上限なら増やさない）。並びは選択肢の順にそろえる
 * @param {readonly string[]} fields 今選んでいる分野
 * @param {string} value 押したチップ
 * @param {readonly string[]} choices
 */
export function toggleField(fields, value, choices) {
  if (fields.includes(value)) return fields.filter((f) => f !== value);
  if (fields.length >= MAX_FIELDS) return [...fields];
  return choices.filter((c) => c === value || fields.includes(c));
}

/**
 * URL の ?role= / ?field= を読む。選択肢に無い値（手で書き換えた URL や、2つ付いた ?field=a&field=b）は無視する
 * @param {Record<string, string | string[] | undefined>} params
 * @param {readonly string[]} roles
 * @param {readonly string[]} fields
 * @returns {{ role: string, field: string }}
 */
export function parseSelection(params, roles, fields) {
  const pick = (/** @type {unknown} */ v, /** @type {readonly string[]} */ choices) => (typeof v === "string" && choices.includes(v) ? v : "");
  return { role: pick(params.role, roles), field: pick(params.field, fields) };
}

/**
 * チップを押したときに行く URL。同じチップをもう一度押すと外す。もう片方の選択は残す（立場と分野は AND）
 * @param {{ role: string, field: string }} sel
 * @param {"role" | "field"} key
 * @param {string} value
 */
export function toggleHref(sel, key, value) {
  return findHref({ ...sel, [key]: sel[key] === value ? "" : value });
}

/**
 * その絞り込みの「さがす」の URL。空の条件は付けない
 * @param {{ role: string, field: string }} sel
 */
export function findHref(sel) {
  const q = new URLSearchParams(Object.entries(sel).filter(([, v]) => v)).toString();
  return q ? `/find?${q}` : "/find";
}

/**
 * 条件に合う人数。空の条件は絞らない。チップの数字は「押したら何人になるか」なので、もう片方の選択も効かせて数える
 * @param {{ role: string, fields: string[] }[]} rows
 * @param {{ role: string, field: string }} sel
 */
export function countFor(rows, sel) {
  return rows.filter((r) => (!sel.role || r.role === sel.role) && (!sel.field || r.fields.includes(sel.field))).length;
}
