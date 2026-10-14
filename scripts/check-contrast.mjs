// design.css の色の組み合わせを、ライトとダークの両方でコントラスト比検査する。
// ダークの値は人の目で全部は見きれない。トークンを1つ変えたときに、どこかの組み合わせが基準を割るのを機械で止める。
// ponytail: 組み合わせは下に手で並べる。コンポーネントで新しい組み合わせを使ったら、ここにも足す
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/app/design.css", import.meta.url), "utf8");

// 色は @theme の中に --color-名前: light-dark(#ライト, #ダーク); で並んでいる
const theme = css.slice(css.indexOf("@theme {"), css.indexOf("}", css.indexOf("@theme {")));
const entries = [...theme.matchAll(/--color-([\w-]+):\s*light-dark\((#[0-9a-f]{6}),\s*(#[0-9a-f]{6})\)/gi)];
if (!entries.length) throw new Error("design.css の @theme に light-dark() の色が見つかりません");
const light = Object.fromEntries(entries.map((m) => [m[1], m[2]]));
const dark = Object.fromEntries(entries.map((m) => [m[1], m[3]]));

const luminance = (hex) =>
  [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// [文字・線の色, 面の色, 必要な比]。文字は 4.5、入力欄の枠のような「部品の輪郭」は 3（WCAG 1.4.11）
const TEXT = 4.5;
const EDGE = 3;
const pairs = [
  ...["fg", "fg-2", "fg-3"].flatMap((f) => ["surface", "surface-1", "surface-2"].map((s) => [f, s, TEXT])),
  ["fg", "surface-3", TEXT],
  ["fg-2", "surface-3", TEXT],
  ["fg", "surface-raised", TEXT], // セグメントの選択中の文字と件数
  ["fg-3", "surface-raised", TEXT],
  ["fg-2", "surface-raised", TEXT], // まとまりの中の行（design.css の group-box）
  ["tertiary", "surface-raised", TEXT], // まとまりの中の「＋ やったことを書く」
  ["tertiary", "surface-2", TEXT], // /me 以下の「‹ プロフィール」、シートの「キャンセル」（地が surface-2）
  ...["primary", "secondary", "tertiary", "success", "warning", "error"].flatMap((r) => [
    [`on-${r}`, r, TEXT],
    [`on-${r}-container`, `${r}-container`, TEXT],
  ]),
  // 状態色・藍を白地の文字に使う（リンク・エラー文・注意文）
  ...["tertiary", "success", "warning", "error"].map((r) => [r, "surface", TEXT]),
  ["primary", "secondary", TEXT], // グレーの面の上のカナリア文字（LP の吹き出し）
  ["fg-2", "primary-container", TEXT], // 公開ページ下の登録の呼びかけ
  ["marker-text", "surface", TEXT], // 見出しのマーカーの文字（ダークは帯なしで黄色の文字）
  ["outline", "surface", EDGE], // 入力欄の枠
  ["outline", "surface-1", EDGE],
  ["tertiary", "surface", EDGE], // 入力欄のフォーカス枠
];

// 自己チェック: 白と黒は 21:1、同じ色は 1:1
console.assert(Math.round(ratio("#ffffff", "#000000")) === 21 && ratio("#777777", "#777777") === 1, "ratio の計算が壊れています");

const failures = [];
for (const [mode, t] of [["ライト", light], ["ダーク", dark]]) {
  for (const [fg, bg, min] of pairs) {
    if (!t[fg] || !t[bg]) failures.push(`${mode}: トークン ${t[fg] ? bg : fg} がありません`);
    else if (ratio(t[fg], t[bg]) < min) failures.push(`${mode}: ${fg} on ${bg} = ${ratio(t[fg], t[bg]).toFixed(2)}（${min} 以上が必要）`);
  }
}
if (failures.length) {
  console.error(failures.join("\n") + "\n↑ コントラスト比が足りません。src/app/design.css の値を直してください");
  process.exit(1);
}
