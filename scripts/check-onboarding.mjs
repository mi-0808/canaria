// src/lib/onboarding.mjs の自己チェック。登録直後の4問の進み方・保存の形が変わったら npm run check で止める
import assert from "node:assert/strict";
import { mergeAnswers, nameProblem, snsProblem } from "../src/lib/onboarding.mjs";

// 名前が要る。ユーザー名は最初の user_xxxx のままで進める
assert.ok(nameProblem({ name: " ", username: "user_ab12cd34" }));
assert.equal(nameProblem({ name: "松井湊", username: "user_ab12cd34" }), null);
assert.ok(nameProblem({ name: "松井湊", username: "Minato!" }));

// SNS は空なら通す、URL でなければ止める
assert.equal(snsProblem(""), null);
assert.equal(snsProblem("instagram.com/minato"), null);
assert.ok(snsProblem("インスタ"));

const p = { name: "", username: "user_ab12cd34", role: "社会人", doing_now: "前の近況", links: ["https://x.com/a"], tagline: "残す" };
// スキップした答え（空）は今の値を消さない。名前は前後の空白を取る
assert.deepEqual(mergeAnswers(p, { name: " 湊 ", username: "minato", role: "", doing_now: " ", sns: "" }),
  { ...p, name: "湊", username: "minato" });
// SNS は https にそろえて先頭へ。同じものは重ねない
assert.deepEqual(mergeAnswers(p, { name: "湊", username: "minato", role: "起業家", doing_now: "店をやってる", sns: "x.com/a" }).links, ["https://x.com/a"]);
assert.deepEqual(mergeAnswers(p, { name: "湊", username: "minato", role: "", doing_now: "", sns: "instagram.com/m" }).links,
  ["https://instagram.com/m", "https://x.com/a"]);
// 6件を超えたら古いほうを落とす
const full = { ...p, links: Array.from({ length: 6 }, (_, i) => `https://e${i}.com/`) };
assert.equal(mergeAnswers(full, { name: "湊", username: "minato", role: "", doing_now: "", sns: "new.com" }).links.length, 6);

console.log("check-onboarding: ok");
