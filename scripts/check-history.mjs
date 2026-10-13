// src/lib/history.mjs の自己チェック。見たプロフィールの履歴の足し方が変わったら npm run check で止める
import assert from "node:assert/strict";
import { MAX_HISTORY, addHistory } from "../src/lib/history.mjs";

// 新しい順に上へ
assert.deepEqual(addHistory([{ id: "a", at: 1 }], "b", "me", 2), [{ id: "b", at: 2 }, { id: "a", at: 1 }]);
// 同じ人はいちばん上へ移す（2行にしない）
assert.deepEqual(addHistory([{ id: "a", at: 1 }, { id: "b", at: 2 }], "b", "me", 3), [{ id: "b", at: 3 }, { id: "a", at: 1 }]);
// 自分のページは足さない
assert.deepEqual(addHistory([{ id: "a", at: 1 }], "me", "me", 2), [{ id: "a", at: 1 }]);
// 上限を超えたら古いものから落とす
const full = Array.from({ length: MAX_HISTORY }, (_, i) => ({ id: `p${i}`, at: i }));
const added = addHistory(full, "new", "me", 99);
assert.equal(added.length, MAX_HISTORY);
assert.equal(added[0].id, "new");
assert.equal(added.at(-1).id, `p${MAX_HISTORY - 2}`);
