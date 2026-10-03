// 公開ページの「数字の行」（App Store の評価・ランキングの行にあたる）。値が無い項目は出さない。
// .mjs にしてあるのは、scripts/check-stats.mjs から Node でそのまま読んで検査するため（Node 20 は TS を直接読めない）

/**
 * 使用技術（カンマ区切り）を配列に
 * @param {string} techs
 */
export const splitTechs = (techs) => techs.split(",").map((t) => t.trim()).filter(Boolean);

/**
 * いちばん多くの作品で使われている技術。大文字・小文字の違いは同じ技術とみなし、表示は最初に出てきた書き方。
 * 1つの作品の中で重なっていても1回と数える。同じ数なら先に出てきた方
 * @param {{ techs: string }[]} works
 * @returns {{ name: string, count: number } | null}
 */
export function topTech(works) {
  /** @type {Map<string, { name: string, count: number }>} */
  const counts = new Map();
  for (const w of works) {
    // new Map(配列) だと同じキーは後の書き方で上書きされるので、最初の書き方だけを残す
    /** @type {Map<string, string>} */
    const inWork = new Map();
    for (const name of splitTechs(w.techs)) if (!inWork.has(name.toLowerCase())) inWork.set(name.toLowerCase(), name);
    for (const [key, name] of inWork) {
      const hit = counts.get(key) ?? { name, count: 0 };
      hit.count += 1;
      counts.set(key, hit);
    }
  }
  let best = null;
  for (const t of counts.values()) if (!best || t.count > best.count) best = t;
  return best;
}

/**
 * 「24」「24歳」のような入力は、数字を大きく出して単位を補足に回す。「20代」のような書き方はそのまま
 * @param {string} input
 * @param {string} unit
 */
function withUnit(input, unit) {
  const m = input.trim().match(new RegExp(`^(\\d+(?:\\.\\d+)?)\\s*${unit}?$`));
  return m ? { value: m[1], sub: unit } : { value: input.trim(), sub: "" };
}

/**
 * 数字の行の項目。性別は出さない（数字の行に並べるものではないため。編集画面では入力できる）。
 * 勤務先は数字の行ではなく「経歴」に並べる
 * @param {{ location: string, mbti: string, age: string }} p
 * @param {{ status: string, techs: string }[]} works
 * @returns {{ label: string, value: string, sub: string }[]}
 */
export function statItems(p, works) {
  const live = works.filter((w) => w.status === "リリース・運用中").length;
  const tech = topTech(works);
  /** @type {({ label: string, value: string, sub: string } | false)[]} */
  const items = [
    { label: "作品", value: String(works.length), sub: live ? `うち運用中 ${live}` : "件" },
    !!tech && { label: "よく使う技術", value: tech.name, sub: `${tech.count}作品で使用` },
    !!p.location.trim() && { label: "拠点", value: p.location.trim(), sub: "" },
    !!p.mbti.trim() && { label: "MBTI", value: p.mbti.trim().toUpperCase(), sub: "" },
    !!p.age.trim() && { label: "年齢", ...withUnit(p.age, "歳") },
  ];
  return items.filter((x) => !!x);
}

// ---- 経歴の期間 ----
// DB は date（その月の1日 "2024-04-01"）、入力欄は <input type="month"> の値（"2024-04"）。
// month に対応していないブラウザ（PC の Safari・Firefox）では文字の入力欄になるので、手で打った文字もここで確かめる

/**
 * 入力欄の値が「2024-04」の形か
 * @param {string} value
 */
export const isMonth = (value) => /^\d{4}-(0[1-9]|1[0-2])$/.test(value);

/**
 * DB の date を入力欄の値に（"2024-04-01" → "2024-04"）
 * @param {string} date
 */
export const toMonth = (date) => date.slice(0, 7);

/**
 * 入力欄の値を DB の date に（"2024-04" → "2024-04-01"）。isMonth で確かめてから使う
 * @param {string} month
 */
export const fromMonth = (month) => `${month}-01`;

/**
 * 編集中の経歴の問題（started / ended は入力欄の値 "2024-04"、ended が null なら「いまも続けている」）。問題が無ければ null。
 * invalid は形や前後がおかしいもの（赤字で知らせる）、missing はまだ書いている途中かもしれない未入力（控えめに知らせる）
 * @param {{ company: string, started: string, ended: string | null }} c
 * @returns {{ level: "missing" | "invalid", text: string } | null}
 */
export function careerProblem(c) {
  if (c.started && !isMonth(c.started)) return { level: "invalid", text: "はじめは「2024-04」の形で入力してください" };
  if (c.ended && !isMonth(c.ended)) return { level: "invalid", text: "おわりは「2024-04」の形で入力してください" };
  if (c.ended && c.started && c.ended < c.started) return { level: "invalid", text: "おわりは、はじめより後にしてください" };
  if (!c.company.trim() || !c.started) return { level: "missing", text: "勤務先・所属と、はじめの年月を入れると保存できます" };
  if (c.ended === "") return { level: "missing", text: "おわりの年月を入れるか、「いまも続けている」にチェックしてください" };
  return null;
}

/**
 * 公開ページに出す期間（"2024年4月 – 現在"）
 * @param {string} started DB の date
 * @param {string | null} ended DB の date。null なら現在
 */
export function careerPeriod(started, ended) {
  const label = (/** @type {string} */ d) => `${Number(d.slice(0, 4))}年${Number(d.slice(5, 7))}月`;
  return `${label(started)} – ${ended ? label(ended) : "現在"}`;
}
