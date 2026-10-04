// src/lib/links.mjs の自己チェック。URL の正規化は「危ないリンクを描画させない」守りなので、壊れたら npm run check で止める
import assert from "node:assert/strict";
import { AMAZON_TAG, amazonProductUrl, amazonSearchUrl, amazonShortLink, contactEmailPattern, gearLink, linkName, normalizeLink } from "../src/lib/links.mjs";

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

// Amazon の商品は /dp/ASIN にそろえて保存する。他人の tag や追跡用パラメータは残さない
const dp = "https://www.amazon.co.jp/dp/B0DLHBM5C9";
assert.equal(amazonProductUrl("https://www.amazon.co.jp/Apple-MacBook/dp/B0DLHBM5C9/ref=sr_1_1?crid=X&tag=other-22"), dp);
assert.equal(amazonProductUrl("amazon.co.jp/gp/product/b0dlhbm5c9"), dp);
assert.equal(amazonProductUrl("https://amazon.co.jp/dp/B0DLHBM5C9?th=1"), dp);
// 短縮リンクの転送先（amzn.asia の Location の実例）
assert.equal(amazonProductUrl("https://www.amazon.co.jp/dp/B0DLHBM5C9?ref=cm_sw_r_cso_cp_mwn_dp_X&social_share=cm_sw_r_cso_cp_mwn_dp_X"), dp);
// 共有で商品名が前後に付いた文章からも読む
assert.equal(amazonProductUrl("Apple MacBook Prohttps://www.amazon.co.jp/dp/B0DLHBM5C9 をチェック"), dp);
// 商品ページでない・Amazon でない・似た名前の別ドメインは保存させない
assert.equal(amazonProductUrl("https://www.amazon.co.jp/s?k=keyboard"), null);
assert.equal(amazonProductUrl("https://www.amazon.com/dp/B0DLHBM5C9"), null);
assert.equal(amazonProductUrl("https://evilamazon.co.jp/dp/B0DLHBM5C9"), null);
assert.equal(amazonProductUrl("https://amazon.co.jp.evil.com/dp/B0DLHBM5C9"), null);
assert.equal(amazonProductUrl("https://rakuten.co.jp/dp/B0DLHBM5C9"), null);
assert.equal(amazonProductUrl("https://amzn.asia/d/025IYpMN"), null);
assert.equal(amazonProductUrl("javascript:alert(1)"), null);

// 短縮リンクだけを /api/amazon に渡す。ホスト名で絞るので、@ や似た名前で別のサーバーを叩かせない
assert.equal(amazonShortLink("https://amzn.asia/d/025IYpMN"), "https://amzn.asia/d/025IYpMN");
assert.equal(amazonShortLink("HHKB Professional https://amzn.asia/d/025IYpMN"), "https://amzn.asia/d/025IYpMN");
assert.equal(amazonShortLink("https://amzn.to/3abcdef"), "https://amzn.to/3abcdef");
assert.equal(amazonShortLink("https://amzn.asia@evil.com/d/025IYpMN"), null);
assert.equal(amazonShortLink("https://evil.com/?u=amzn.asia"), null);
assert.equal(amazonShortLink("https://notamzn.asia/d/025IYpMN"), null);
assert.equal(amazonShortLink(dp), null);

// 表示するときは必ず運営のタグを付ける。商品でなければリンクにしない
const tag = AMAZON_TAG ? `?tag=${AMAZON_TAG}` : "";
assert.equal(gearLink(dp), `${dp}${tag}`);
assert.equal(gearLink(`${dp}?tag=other-22`), `${dp}${tag}`);
assert.equal(gearLink("https://example.com/"), null);
assert.ok(amazonSearchUrl(" HHKB 静音 ").startsWith("https://www.amazon.co.jp/s?k=HHKB%20%E9%9D%99%E9%9F%B3"));
