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
