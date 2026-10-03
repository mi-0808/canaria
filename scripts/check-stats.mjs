// src/lib/stats.mjs の自己チェック。公開ページの「数字の行」の数え方が変わったら npm run check で止める
import assert from "node:assert/strict";
import { statItems, topTech } from "../src/lib/stats.mjs";

const w = (techs, status = "開発中") => ({ techs, status });

// よく使う技術: 作品の数で数える。大文字・小文字は同じ扱いで、表示は最初の書き方。1作品の中の重なりは1回
assert.deepEqual(topTech([w("Next.js, Supabase"), w("next.js"), w("Supabase, Supabase")]), { name: "Next.js", count: 2 });
assert.deepEqual(topTech([w("Next.js, NEXT.JS")]), { name: "Next.js", count: 1 });
// 同じ数なら先に出てきた方
assert.deepEqual(topTech([w("React"), w("Vue")]), { name: "React", count: 1 });
assert.equal(topTech([w(""), w(" , ")]), null);
assert.equal(topTech([]), null);

const blank = { company: "", years: "", location: "", mbti: "", age: "" };
const labels = (items) => items.map((i) => i.label);

// 値が無い項目は出さない。作品の数だけは 0 でも出す
assert.deepEqual(statItems(blank, []), [{ label: "作品", value: "0", sub: "件" }]);
assert.deepEqual(statItems(blank, [w("Go", "リリース・運用中"), w("")])[0], { label: "作品", value: "2", sub: "うち運用中 1" });

// 勤続年数: 数字は大きく、単位は補足へ。「半年」はそのまま。勤務先があれば1つにまとめる
assert.deepEqual(statItems({ ...blank, years: "2年" }, [])[1], { label: "勤続年数", value: "2", sub: "年" });
assert.deepEqual(statItems({ ...blank, years: "2.5 年" }, [])[1], { label: "勤続年数", value: "2.5", sub: "年" });
assert.deepEqual(statItems({ ...blank, years: "半年" }, [])[1], { label: "勤続年数", value: "半年", sub: "" });
assert.deepEqual(statItems({ ...blank, company: "カナリア株式会社", years: "3" }, [])[1], { label: "勤務先", value: "カナリア株式会社", sub: "勤続 3年" });

// 年齢・MBTI・拠点
assert.deepEqual(statItems({ ...blank, age: "24歳" }, [])[1], { label: "年齢", value: "24", sub: "歳" });
assert.deepEqual(statItems({ ...blank, mbti: "intj" }, [])[1], { label: "MBTI", value: "INTJ", sub: "" });
assert.deepEqual(labels(statItems({ company: "A", years: "1", location: "東京", mbti: "INFP", age: "20" }, [w("Go")])),
  ["作品", "よく使う技術", "勤務先", "拠点", "MBTI", "年齢"]);
