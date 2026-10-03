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
 * 「2」「2年」「2.5 年」のような入力は、数字を大きく出して単位を補足に回す。「半年」のような書き方はそのまま
 * @param {string} input
 * @param {string} unit
 */
function withUnit(input, unit) {
  const m = input.trim().match(new RegExp(`^(\\d+(?:\\.\\d+)?)\\s*${unit}?$`));
  return m ? { value: m[1], sub: unit } : { value: input.trim(), sub: "" };
}

/**
 * 数字の行の項目。性別は出さない（数字の行に並べるものではないため。編集画面では入力できる）
 * @param {{ company: string, years: string, location: string, mbti: string, age: string }} p
 * @param {{ status: string, techs: string }[]} works
 * @returns {{ label: string, value: string, sub: string }[]}
 */
export function statItems(p, works) {
  const live = works.filter((w) => w.status === "リリース・運用中").length;
  const tech = topTech(works);
  const years = p.years.trim() && withUnit(p.years, "年");
  /** @type {({ label: string, value: string, sub: string } | false | "")[]} */
  const items = [
    { label: "作品", value: String(works.length), sub: live ? `うち運用中 ${live}` : "件" },
    !!tech && { label: "よく使う技術", value: tech.name, sub: `${tech.count}作品で使用` },
    // 勤務先があれば「勤務先・勤続年数」を1つにまとめ、勤続年数だけなら数字で出す
    p.company.trim()
      ? { label: "勤務先", value: p.company.trim(), sub: years ? `勤続 ${years.value}${years.sub}` : "" }
      : !!years && { label: "勤続年数", ...years },
    !!p.location.trim() && { label: "拠点", value: p.location.trim(), sub: "" },
    !!p.mbti.trim() && { label: "MBTI", value: p.mbti.trim().toUpperCase(), sub: "" },
    !!p.age.trim() && { label: "年齢", ...withUnit(p.age, "歳") },
  ];
  return items.filter((x) => !!x);
}
