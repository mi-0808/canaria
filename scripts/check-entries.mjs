// src/lib/entries.mjs の自己チェック。期間の表示や並び順が崩れたら npm run check で止める
import assert from "node:assert/strict";
import { byNewest, cleanEntry, entryMeta, entryPeriod, entryProblem, yearChoices } from "../src/lib/entries.mjs";

const e = (patch) => ({
  section: "work", kind: "", title: "駅前のカフェ", place: "", note: "",
  started: null, started_month: null, ended: null, ended_month: null, current: false, ...patch,
});

// 期間: 年と月。月が無ければ年だけ
assert.equal(entryPeriod(e({ started: 2023, started_month: 10, ended: 2024, ended_month: 3 })), "2023年10月 – 2024年3月");
assert.equal(entryPeriod(e({ started: 2024, started_month: 4, current: true })), "2024年4月 – いま");
assert.equal(entryPeriod(e({ started: 2023, ended: 2024 })), "2023年 – 2024年");
assert.equal(entryPeriod(e({ started: 2024, current: true })), "2024年 – いま");
assert.equal(entryPeriod(e({ current: true })), "いま");
assert.equal(entryPeriod(e({ started: 2024, ended: 2024 })), "2024年"); // 同じ年に始めて終わった
assert.equal(entryPeriod(e({ started: 2024, started_month: 4, ended: 2024, ended_month: 4 })), "2024年4月");
assert.equal(entryPeriod(e({ started: 2024, started_month: 4, ended: 2024, ended_month: 9 })), "2024年4月 – 2024年9月");
assert.equal(entryPeriod(e({ started: 2024 })), "2024年");
assert.equal(entryPeriod(e({ ended: 2024, ended_month: 3 })), "2024年3月");
assert.equal(entryPeriod(e({})), "");
// すきなことは「おわり」を出さない
assert.equal(entryPeriod(e({ section: "like", started: 2020, started_month: 4, current: true })), "2020年4月から");
assert.equal(entryPeriod(e({ section: "like" })), "");

// 1行の補足
assert.equal(entryMeta(e({ kind: "バイト", started: 2023, ended: 2024 })), "バイト · 2023年 – 2024年");
assert.equal(entryMeta(e({ started: 2024, started_month: 6, current: true })), "2024年6月 – いま");
assert.equal(entryMeta(e({ section: "learn", kind: "school", started: 2024, started_month: 4, current: true, note: "x" })), "2024年4月 – いま");
assert.equal(entryMeta(e({ section: "learn", kind: "skill", note: "マッチなしで火がつく", started: 2024 })), "マッチなしで火がつく");
assert.equal(entryMeta(e({ section: "learn", kind: "skill", started: 2024 })), "2024年");
assert.equal(entryMeta(e({ section: "like", started: 2020 })), "2020年から");

// 保存する形: 聞いていない「おわり」「いまも」と、年の無い月は消す。学校とはたらいたことの期間は残す
assert.deepEqual(cleanEntry(e({ title: " a ", kind: " バイト " })), e({ title: "a", kind: "バイト" }));
assert.deepEqual(
  cleanEntry(e({ section: "learn", kind: "skill", started: 2024, started_month: 1, ended: 2024, ended_month: 5 })),
  e({ section: "learn", kind: "skill", started: 2024, started_month: 1 }),
);
assert.equal(cleanEntry(e({ section: "learn", kind: "skill", current: true })).current, false);
assert.equal(cleanEntry(e({ section: "like", started: 2020, current: true })).current, false);
assert.equal(cleanEntry(e({ section: "learn", kind: "school", started: 2022, ended: 2024, ended_month: 3 })).ended_month, 3);
assert.equal(cleanEntry(e({ started: 2024, current: true })).current, true);
assert.equal(cleanEntry(e({ started_month: 4 })).started_month, null); // 年の無い月
assert.equal(cleanEntry(e({ current: true, ended: 2025, ended_month: 1 })).ended_month, null); // いまも続けている

// 保存できない理由。月が無いときは、はじめ1月・おわり12月とみなす
assert.equal(entryProblem(e({})), null);
assert.ok(entryProblem(e({ title: "  " })));
assert.ok(entryProblem(e({ started: 2024, ended: 2023 })));
assert.ok(entryProblem(e({ started: 2024, started_month: 5, ended: 2024, ended_month: 3 })));
assert.equal(entryProblem(e({ started: 2024, ended: 2024 })), null);
assert.equal(entryProblem(e({ started: 2024, started_month: 3, ended: 2024 })), null);
assert.equal(entryProblem(e({ started: 2024, ended: 2024, ended_month: 1 })), null);

// 並び順: 新しく始めた年月が上。同じ年なら月の無いものは下、年の無いものは一番下（その中は足した新しい順）
const list = [
  e({ title: "a", started: 2024 }),
  e({ title: "b", started: null, created_at: "2026-01-02" }),
  e({ title: "c", started: 2024, started_month: 4 }),
  e({ title: "d", started: null, created_at: "2026-01-03" }),
  e({ title: "e", started: 2024, started_month: 10 }),
  e({ title: "f", started: 2023, started_month: 12 }),
].toSorted(byNewest);
assert.deepEqual(list.map((x) => x.title), ["e", "c", "a", "f", "d", "b"]);

// 年の選択肢
assert.deepEqual(yearChoices(2026).slice(0, 2), [2026, 2025]);
assert.equal(yearChoices(2026).at(-1), 1966);
