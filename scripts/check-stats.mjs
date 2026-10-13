// src/lib/stats.mjs の自己チェック。公開ページの「数字の行」の数え方が変わったら npm run check で止める
import assert from "node:assert/strict";
import { statItems } from "../src/lib/stats.mjs";

const blank = { location: "", mbti: "", age: "" };

// 値が無い項目は出さない
assert.deepEqual(statItems(blank), []);

// 年齢: 数字だけ・空白入りなら「歳」を付けてそろえる。「20代」のような書き方はそのまま
assert.deepEqual(statItems({ ...blank, age: "24" }), [{ label: "年齢", value: "24歳" }]);
assert.deepEqual(statItems({ ...blank, age: "24 歳" }), [{ label: "年齢", value: "24歳" }]);
assert.deepEqual(statItems({ ...blank, age: "20代" }), [{ label: "年齢", value: "20代" }]);
assert.deepEqual(statItems({ ...blank, mbti: "intj" }), [{ label: "MBTI", value: "INTJ" }]);
assert.deepEqual(statItems({ location: "東京", mbti: "INFP", age: "20" }).map((i) => i.label), ["拠点", "MBTI", "年齢"]);
