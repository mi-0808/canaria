// src/lib/find.mjs の自己チェック。「さがす」の絞り込み・数え方と、分野の選び方が変わったら npm run check で止める
import assert from "node:assert/strict";
import { MAX_FIELDS, countFor, parseSelection, toggleField, toggleHref } from "../src/lib/find.mjs";

const roles = ["高校生", "社会人"];
const fields = ["エンジニア", "デザイナー", "音楽", "接客"];

// 分野: 足すと選択肢の順に並ぶ／もう一度押すと外れる／上限からは増えない
assert.deepEqual(toggleField(["音楽"], "エンジニア", fields), ["エンジニア", "音楽"]);
assert.deepEqual(toggleField(["エンジニア", "音楽"], "エンジニア", fields), ["音楽"]);
assert.equal(MAX_FIELDS, 3);
assert.deepEqual(toggleField(["エンジニア", "デザイナー", "音楽"], "接客", fields), ["エンジニア", "デザイナー", "音楽"]);

// URL: 選択肢に無い値・2つ付いた値は無視する
assert.deepEqual(parseSelection({ role: "社会人", field: "音楽" }, roles, fields), { role: "社会人", field: "音楽" });
assert.deepEqual(parseSelection({ role: "社長", field: ["音楽", "接客"] }, roles, fields), { role: "", field: "" });

// チップの行き先: 選ぶ・同じものを押すと外す・もう片方は残す
assert.equal(toggleHref({ role: "", field: "" }, "role", "社会人"), `/find?role=${encodeURIComponent("社会人")}`);
assert.equal(toggleHref({ role: "社会人", field: "" }, "role", "社会人"), "/find");
assert.equal(toggleHref({ role: "社会人", field: "音楽" }, "field", "音楽"), `/find?role=${encodeURIComponent("社会人")}`);
assert.equal(toggleHref({ role: "社会人", field: "音楽" }, "field", "接客"), `/find?role=${encodeURIComponent("社会人")}&field=${encodeURIComponent("接客")}`);

// 人数: 空の条件は絞らない／立場と分野は AND
const rows = [
  { role: "社会人", fields: ["エンジニア", "音楽"] },
  { role: "社会人", fields: [] },
  { role: "", fields: ["音楽"] },
];
assert.equal(countFor(rows, { role: "", field: "" }), 3);
assert.equal(countFor(rows, { role: "社会人", field: "" }), 2);
assert.equal(countFor(rows, { role: "", field: "音楽" }), 2);
assert.equal(countFor(rows, { role: "社会人", field: "音楽" }), 1);
