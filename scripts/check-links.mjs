// src/lib/links.mjs の自己チェック。URL の正規化は「危ないリンクを描画させない」守りなので、壊れたら npm run check で止める
import assert from "node:assert/strict";
import { AMAZON_TAG, amazonSearchUrl, contactEmailPattern, gearLink, linkName, normalizeLink } from "../src/lib/links.mjs";

// スキームが無ければ https を補う。http は https に上げる
assert.equal(normalizeLink("github.com/you"), "https://github.com/you");
assert.equal(normalizeLink("  https://zenn.dev/you  "), "https://zenn.dev/you");
assert.equal(normalizeLink("http://qiita.com/you"), "https://qiita.com/you");
assert.equal(normalizeLink("github.com:443/you"), "https://github.com/you");

// リンクにしてはいけないもの・URL でないもの
assert.equal(normalizeLink("javascript:alert(1)"), null);
assert.equal(normalizeLink("JavaScript://example.com/%0Aalert(1)"), null);
assert.equal(normalizeLink("data:text/html,<script>alert(1)</script>"), null);
assert.equal(normalizeLink("mailto:me@example.com"), null);
assert.equal(normalizeLink("ftp://example.com"), null);
assert.equal(normalizeLink("localhost:3000"), null);
assert.equal(normalizeLink("not a url"), null);
assert.equal(normalizeLink(""), null);
assert.equal(normalizeLink(`https://example.com/${"a".repeat(300)}`), null);

// サービス名。サブドメインは同じサービス、似た名前の別ドメインは別物
assert.equal(linkName("https://github.com/you"), "GitHub");
assert.equal(linkName("https://gist.github.com/you"), "GitHub");
assert.equal(linkName("https://twitter.com/you"), "X");
assert.equal(linkName("https://www.youtube.com/@you"), "YouTube");
assert.equal(linkName("https://evilgithub.com/you"), "evilgithub.com");
assert.equal(linkName("https://www.example.com/"), "example.com");

// 連絡用メールアドレス。mailto: に件名や宛先を足せる文字（? & 空白 改行）は通さない
assert.ok(contactEmailPattern.test("kana@example.com"));
assert.ok(contactEmailPattern.test("kana.work+canaria@mail.example.co.jp"));
assert.ok(!contactEmailPattern.test("kana@example"));
assert.ok(!contactEmailPattern.test("kana@example.com?subject=hi"));
assert.ok(!contactEmailPattern.test("kana@example.com&cc=x@y.z"));
assert.ok(!contactEmailPattern.test("kana @example.com"));
assert.ok(!contactEmailPattern.test("kana@example.com\nbcc:x@y.z"));

// Amazon の商品 URL は /dp/ASIN にそろえる。他人の tag や追跡用パラメータは残さない
const tag = AMAZON_TAG ? `?tag=${AMAZON_TAG}` : "";
assert.equal(gearLink("https://www.amazon.co.jp/Apple-MacBook/dp/B0DLHBM5C9/ref=sr_1_1?crid=X&tag=other-22"), `https://www.amazon.co.jp/dp/B0DLHBM5C9${tag}`);
assert.equal(gearLink("amazon.co.jp/gp/product/b0dlhbm5c9"), `https://www.amazon.co.jp/dp/B0DLHBM5C9${tag}`);
assert.equal(gearLink("https://amazon.co.jp/dp/B0DLHBM5C9?th=1"), `https://www.amazon.co.jp/dp/B0DLHBM5C9${tag}`);
// ASIN が読めない・Amazon でない・似た名前の別ドメインは触らない
assert.equal(gearLink("https://www.amazon.co.jp/s?k=keyboard"), "https://www.amazon.co.jp/s?k=keyboard");
assert.equal(gearLink("https://amzn.to/3abcdef"), "https://amzn.to/3abcdef");
assert.equal(gearLink("https://evilamazon.co.jp/dp/B0DLHBM5C9"), "https://evilamazon.co.jp/dp/B0DLHBM5C9");
assert.equal(gearLink("javascript:alert(1)"), null);
assert.ok(amazonSearchUrl(" HHKB 静音 ").startsWith("https://www.amazon.co.jp/s?k=HHKB%20%E9%9D%99%E9%9F%B3"));
