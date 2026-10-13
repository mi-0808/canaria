// 公開ページの「数字の行」（拠点・MBTI・年齢を「ラベル 値」で横に並べる）。値が無い項目は出さない。
// .mjs にしてあるのは、scripts/check-stats.mjs から Node でそのまま読んで検査するため（Node 20 は TS を直接読めない）

/**
 * 使用技術（カンマ区切り）を配列に
 * @param {string} techs
 */
export const splitTechs = (techs) => techs.split(",").map((t) => t.trim()).filter(Boolean);

/**
 * 「24」「24 歳」のような入力は「24歳」にそろえる。「20代」のような書き方はそのまま
 * @param {string} input
 * @param {string} unit
 */
function withUnit(input, unit) {
  const m = input.trim().match(new RegExp(`^(\\d+(?:\\.\\d+)?)\\s*${unit}?$`));
  return m ? `${m[1]}${unit}` : input.trim();
}

/**
 * 数字の行の項目。value は単位まで含めた表示（「24歳」）。
 * 作品の数・よく使う技術は出さない（エンジニア向けの見せ方だったため。作品は下の一覧で見える）。
 * 性別は出さない（数字の行に並べるものではないため。編集画面では入力できる）。
 * 勤務先は数字の行ではなく「はたらいたこと」に並べる
 * @param {{ location: string, mbti: string, age: string }} p
 * @returns {{ label: string, value: string }[]}
 */
export function statItems(p) {
  /** @type {({ label: string, value: string } | false)[]} */
  const items = [
    !!p.location.trim() && { label: "拠点", value: p.location.trim() },
    !!p.mbti.trim() && { label: "MBTI", value: p.mbti.trim().toUpperCase() },
    !!p.age.trim() && { label: "年齢", value: withUnit(p.age, "歳") },
  ];
  return items.filter((x) => !!x);
}
