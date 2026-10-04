// プロフィールの SNS・リンク。URL を貼るだけで、ドメインからサービス名を出す（サービスごとの入力欄は並べない）。
// .mjs にしてあるのは、scripts/check-links.mjs から Node でそのまま読んで検査するため（Node 20 は TS を直接読めない）

export const MAX_LINKS = 6;

/**
 * 連絡用メールアドレス。DB の check と同じ条件。公開ページで mailto: のリンクにするので、
 * 「?」「&」のような、件名や宛先を足せてしまう文字は通さない
 */
export const contactEmailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

/** @type {[string[], string][]} [ドメイン, 表示名]。サブドメイン（gist.github.com など）も同じサービスとみなす */
const services = [
  [["github.com"], "GitHub"],
  [["x.com", "twitter.com"], "X"],
  [["zenn.dev"], "Zenn"],
  [["qiita.com"], "Qiita"],
  [["note.com"], "note"],
  [["instagram.com"], "Instagram"],
  [["youtube.com", "youtu.be"], "YouTube"],
  [["linkedin.com"], "LinkedIn"],
  [["threads.net", "threads.com"], "Threads"],
  [["bsky.app"], "Bluesky"],
  [["speakerdeck.com"], "Speaker Deck"],
  [["connpass.com"], "connpass"],
];

/**
 * 入力を https の URL にそろえる。読めなければ null（保存させない）。
 * 「github.com/you」のようにスキームが無ければ https を補い、http は https に上げる。
 * javascript: などは null。リンクとして描画させないため（DB の valid_links でも同じ条件で止める）
 * @param {string} input
 * @returns {string | null}
 */
export function normalizeLink(input) {
  const s = input.trim();
  if (!s || /\s/.test(s)) return null;
  // 「://」がある、または「javascript:」のように最初のコロンより前にドットが無ければ、スキーム付きとして読む。
  // 「github.com:443/you」はドメインのあとのコロンなので、スキーム無しとして https を補う
  const hasScheme = s.includes("://") || (/^[a-z][a-z0-9+.-]*:/i.test(s) && !s.split(":")[0].includes("."));
  let url;
  try {
    url = new URL(hasScheme ? s : `https://${s}`);
  } catch {
    return null;
  }
  if (url.protocol === "http:") url.protocol = "https:";
  if (url.protocol !== "https:" || !url.hostname.includes(".") || url.href.length > 300) return null;
  return url.href;
}

/**
 * 表示名。知っているサービスならその名前、知らなければドメイン
 * @param {string} url normalizeLink を通した URL
 */
export function linkName(url) {
  const host = new URL(url).hostname.replace(/^www\./, "");
  return services.find(([domains]) => domains.some((d) => host === d || host.endsWith(`.${d}`)))?.[1] ?? host;
}

// --- Amazon アソシエイト ---
// 開発環境のアイテムは Amazon の商品だけ。誰が登録したものでも運営のトラッキングID を付ける（公開ページに開示文を出す）。
// ponytail: アプリ内の商品検索（Creators API）は直近30日で適格販売10件が条件なので、今は Amazon の検索ページを開いてリンクを貼ってもらう。
// 条件を満たしたらアプリ内検索に切り替える（保存する形 /dp/ASIN は変わらない）
export const AMAZON_TAG = "genki0315-22";
const tagParam = AMAZON_TAG ? `tag=${AMAZON_TAG}` : "";

/** @param {string} query アイテム名 */
export const amazonSearchUrl = (query) => `https://www.amazon.co.jp/s?k=${encodeURIComponent(query.trim())}${tagParam && `&${tagParam}`}`;

// スマホの Amazon アプリの「共有」が出す短縮リンク。行き先はブラウザから読めない（CORS）ので /api/amazon で展開する
const shortHosts = ["amzn.asia", "amzn.to"];

/**
 * 貼った文章の中の URL。共有で商品名が前後に付いていても URL の部分だけ取り出す（[!-~] は ASCII なので日本語で切れる）
 * @param {string} text
 */
const pastedLink = (text) => normalizeLink(text.match(/https?:\/\/[!-~]+/)?.[0] ?? text);

/**
 * 貼った文章から amazon.co.jp の商品を読み、ASIN だけ残した https://www.amazon.co.jp/dp/ASIN にする。
 * 他人のタグや追跡用パラメータはここで捨てる。DB の check もこの形しか通さない。商品でなければ null
 * @param {string} text
 * @returns {string | null}
 */
export function amazonProductUrl(text) {
  const href = pastedLink(text);
  if (!href) return null;
  const url = new URL(href);
  if (!/(^|\.)amazon\.co\.jp$/.test(url.hostname)) return null;
  const asin = url.pathname.match(/\/(?:dp|gp\/product|gp\/aw\/d|o|exec\/obidos\/ASIN)\/([A-Z0-9]{10})(?![A-Z0-9])/i)?.[1];
  return asin ? `https://www.amazon.co.jp/dp/${asin.toUpperCase()}` : null;
}

/**
 * 貼った文章が Amazon の短縮リンクなら、その URL。/api/amazon が取りに行ってよい先をここで絞る（任意の URL を叩かせない）
 * @param {string} text
 * @returns {string | null}
 */
export function amazonShortLink(text) {
  const href = pastedLink(text);
  return href && shortHosts.includes(new URL(href).hostname) ? href : null;
}

/**
 * 表示するリンク。保存済みの URL を毎回 /dp/ASIN に作り直してタグを付けるので、あとから ID を変えても全部に効く。
 * Amazon の商品でなければ null（href にしない）
 * @param {string} url
 */
export function gearLink(url) {
  const href = amazonProductUrl(url);
  return href && `${href}${tagParam && `?${tagParam}`}`;
}
