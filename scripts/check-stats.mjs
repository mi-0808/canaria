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

const blank = { location: "", mbti: "", age: "" };
const labels = (items) => items.map((i) => i.label);

// 値が無い項目は出さない。作品の数だけは 0 でも出す
assert.deepEqual(statItems(blank, []), [{ label: "作品", value: "0件", sub: "" }]);
assert.deepEqual(statItems(blank, [w("Go", "リリース・運用中"), w("")])[0], { label: "作品", value: "2件", sub: "うち運用中 1" });

// 年齢: 数字だけ・空白入りなら「歳」を付けてそろえる。「20代」のような書き方はそのまま
assert.deepEqual(statItems({ ...blank, age: "24" }, [])[1], { label: "年齢", value: "24歳", sub: "" });
assert.deepEqual(statItems({ ...blank, age: "24 歳" }, [])[1], { label: "年齢", value: "24歳", sub: "" });
assert.deepEqual(statItems({ ...blank, age: "20代" }, [])[1], { label: "年齢", value: "20代", sub: "" });
assert.deepEqual(statItems({ ...blank, mbti: "intj" }, [])[1], { label: "MBTI", value: "INTJ", sub: "" });
assert.deepEqual(labels(statItems({ location: "東京", mbti: "INFP", age: "20" }, [w("Go")])), ["作品", "よく使う技術", "拠点", "MBTI", "年齢"]);
