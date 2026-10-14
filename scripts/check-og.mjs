// src/lib/og.mjs の自己チェック。リンクのカードに出る文言の決め方が変わったら npm run check で止める
import assert from "node:assert/strict";
import { MAX_NAME, clip, drawableImage, fontText, ogText, ogTitle } from "../src/lib/og.mjs";

// 長い文は上限ちょうどの長さで「…」
assert.equal(clip("あいうえお", 3), "あい…");
assert.equal(clip(" あいう ", 3), "あいう");
// 絵文字を途中で割らない
assert.equal(clip("😀😀😀😀", 3), "😀😀…");
assert.equal(Array.from(clip("あ".repeat(40), MAX_NAME)).length, MAX_NAME);

// 名前が空なら @ユーザー名 を名前の場所に出し、ユーザー名の行は出さない
assert.deepEqual(ogText({ name: "", username: "kana", tagline: "" }), { name: "@kana", username: "", tagline: "", initial: "" });
assert.deepEqual(ogText({ name: "松井湊", username: "minato", tagline: "高校生" }), { name: "松井湊", username: "@minato", tagline: "高校生", initial: "松" });

assert.equal(ogTitle({ name: "松井湊", username: "minato" }), "松井湊（@minato）| Canaria");
assert.equal(ogTitle({ name: " ", username: "minato" }), "@minato | Canaria");

// 描けるのは https の PNG・JPEG だけ（クエリが付いていても拡張子で見る）
assert.ok(drawableImage("https://x.supabase.co/storage/v1/object/public/media/u/a.JPG"));
assert.ok(drawableImage("https://x.supabase.co/a.png?v=1"));
assert.ok(!drawableImage("https://x.supabase.co/a.webp"));
assert.ok(!drawableImage("http://x.supabase.co/a.png"));
assert.ok(!drawableImage(""));

// フォントに頼む文字は重ねない
assert.equal(fontText(["ああい", "いう"]), "あいう");

console.log("check-og: ok");
