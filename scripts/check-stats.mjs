// src/lib/stats.mjs の自己チェック。公開ページの「数字の行」の数え方が変わったら npm run check で止める
import assert from "node:assert/strict";
import { careerPeriod, careerProblem, fromMonth, isMonth, statItems, toMonth, topTech } from "../src/lib/stats.mjs";

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

// 経歴の期間: 入力欄（"2024-04"）と DB（"2024-04-01"）の行き来と、表示
assert.ok(isMonth("2024-04") && isMonth("1999-12"));
assert.ok(!isMonth("2024-4") && !isMonth("2024/04") && !isMonth("2024-13") && !isMonth("2024-00") && !isMonth(""));
assert.equal(fromMonth("2024-04"), "2024-04-01");
assert.equal(toMonth("2024-04-01"), "2024-04");
assert.equal(careerPeriod("2024-04-01", null), "2024年4月 – 現在");
assert.equal(careerPeriod("2020-04-01", "2024-03-01"), "2020年4月 – 2024年3月");

// 編集中の経歴の問題: 形や前後がおかしいものは invalid、未入力は missing、問題なしは null
const career = (patch) => ({ company: "株式会社カナリア", started: "2024-04", ended: null, ...patch });
assert.equal(careerProblem(career({})), null);
assert.equal(careerProblem(career({ ended: "2025-03" })), null);
assert.equal(careerProblem(career({ company: " " }))?.level, "missing");
assert.equal(careerProblem(career({ started: "" }))?.level, "missing");
assert.equal(careerProblem(career({ ended: "" }))?.level, "missing"); // 「いまも続けている」を外して、おわりが空
assert.equal(careerProblem(career({ started: "2024/04" }))?.level, "invalid");
assert.equal(careerProblem(career({ ended: "2025-3" }))?.level, "invalid");
assert.equal(careerProblem(career({ ended: "2023-01" }))?.text, "おわりは、はじめより後にしてください");
// 未入力より、形のおかしさを先に知らせる（勤務先が空でも、はじめの形が違えばそちらを出す）
assert.equal(careerProblem(career({ company: "", started: "2024/04" }))?.level, "invalid");
