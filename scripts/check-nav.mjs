// src/lib/nav.mjs の自己チェック。プレビューの出し分けが変わったら npm run check で止める
import assert from "node:assert/strict";
import { isPreview } from "../src/lib/nav.mjs";

const me = { id: "a" };
const other = { id: "b" };
// ?preview が無ければ、持ち主でもプレビューにしない（リンクから自分のページを開いたとき）
assert.equal(isPreview(false, me, me), false);
// 持ち主だけプレビュー
assert.equal(isPreview(true, me, me), true);
assert.equal(isPreview(true, other, me), false);
assert.equal(isPreview(true, null, me), false);
// 読み込み中は持ち主とみなす（ヘッダーが一瞬出てから消えないように）
assert.equal(isPreview(true, undefined, me), true);
assert.equal(isPreview(true, me, undefined), true);
// 見つからないページは、未ログインでもプレビューにしない（null 同士を持ち主とみなさない）
assert.equal(isPreview(true, null, null), false);
assert.equal(isPreview(true, me, null), false);
