// src/lib/entries.mjs の自己チェック。期間の表示や並び順が崩れたら npm run check で止める
import assert from "node:assert/strict";
import { byNewest, cleanEntry, entryMeta, entryPeriod, entryProblem, yearChoices } from "../src/lib/entries.mjs";

const e = (patch) => ({ section: "work", kind: "", title: "駅前のカフェ", place: "", note: "", started: null, ended: null, current: false, ...patch });

// 期間
assert.equal(entryPeriod(e({ started: 2023, ended: 2024 })), "2023 – 2024");
assert.equal(entryPeriod(e({ started: 2024, current: true })), "2024 – いま");
assert.equal(entryPeriod(e({ current: true })), "いま");
assert.equal(entryPeriod(e({ started: 2024, ended: 2024 })), "2024"); // 同じ年に始めて終わった
assert.equal(entryPeriod(e({ started: 2024 })), "2024");
assert.equal(entryPeriod(e({ ended: 2024 })), "2024");
assert.equal(entryPeriod(e({})), "");
// すきなことは「おわり」を出さない
assert.equal(entryPeriod(e({ section: "like", started: 2020, current: true })), "2020 から");
assert.equal(entryPeriod(e({ section: "like" })), "");

// 1行の補足
assert.equal(entryMeta(e({ kind: "バイト", started: 2023, ended: 2024 })), "バイト · 2023 – 2024");
assert.equal(entryMeta(e({ started: 2024, current: true })), "2024 – いま");
assert.equal(entryMeta(e({ section: "learn", kind: "school", started: 2024, current: true, note: "x" })), "2024 – いま");
assert.equal(entryMeta(e({ section: "learn", kind: "skill", note: "マッチなしで火がつく", started: 2024 })), "マッチなしで火がつく");
assert.equal(entryMeta(e({ section: "learn", kind: "skill", started: 2024 })), "2024");
assert.equal(entryMeta(e({ section: "like", started: 2020 })), "2020 から");

// 保存する形: 聞いていない「おわり」「いまも」は消す。学校とはたらいたことは残す
assert.deepEqual(cleanEntry(e({ title: " a ", kind: " バイト " })), e({ title: "a", kind: "バイト" }));
assert.equal(cleanEntry(e({ section: "learn", kind: "skill", started: 2024, ended: 2024 })).ended, null);
assert.equal(cleanEntry(e({ section: "learn", kind: "skill", current: true })).current, false);
assert.equal(cleanEntry(e({ section: "like", started: 2020, current: true })).current, false);
assert.equal(cleanEntry(e({ section: "learn", kind: "school", started: 2022, ended: 2024 })).ended, 2024);
assert.equal(cleanEntry(e({ started: 2024, current: true })).current, true);

// 保存できない理由
assert.equal(entryProblem(e({})), null);
assert.ok(entryProblem(e({ title: "  " })));
assert.ok(entryProblem(e({ started: 2024, ended: 2023 })));
assert.equal(entryProblem(e({ started: 2024, ended: 2024 })), null);

// 並び順: 新しく始めたものが上、年の無いものは下（その中は足した新しい順）
const list = [
  e({ title: "a", started: 2020 }),
  e({ title: "b", started: null, created_at: "2026-01-02" }),
  e({ title: "c", started: 2024 }),
  e({ title: "d", started: null, created_at: "2026-01-03" }),
].toSorted(byNewest);
assert.deepEqual(list.map((x) => x.title), ["c", "a", "d", "b"]);

// 年の選択肢
assert.deepEqual(yearChoices(2026).slice(0, 2), [2026, 2025]);
assert.equal(yearChoices(2026).at(-1), 1966);
