// リンクを貼ったときに出る OGP（タイトル・説明・画像）の文言の決め方。
// .mjs にしてあるのは、scripts/check-og.mjs から Node でそのまま読んで検査するため（history.mjs と同じ）

/** 画像に入る長さの上限（1200×630 の B 案で、名前は1行・ひとことは3行に収まる文字数） */
export const MAX_NAME = 16;
export const MAX_TAGLINE = 48;

/**
 * 文字数で切り、切ったら「…」。絵文字などの2単位の文字を途中で割らないよう、Array.from で数える
 * @param {string} text @param {number} max
 */
export function clip(text, max) {
  const chars = Array.from(text.trim());
  return chars.length > max ? `${chars.slice(0, max - 1).join("")}…` : chars.join("");
}

/**
 * 画像に描く文言。名前が空の人は @ユーザー名 を名前の場所に出し、下の行は出さない
 * @param {{ name: string, username: string, tagline: string }} p
 */
export function ogText(p) {
  const name = clip(p.name, MAX_NAME);
  return {
    name: name || `@${p.username}`,
    username: name ? `@${p.username}` : "",
    tagline: clip(p.tagline, MAX_TAGLINE),
    // アイコンが無い・描けないときに丸の中へ入れる1文字
    initial: Array.from(p.name.trim())[0] ?? "",
  };
}

/**
 * ページのタイトル（LINE・X のカードの見出し）。「名前（@ユーザー名）| Canaria」
 * @param {{ name: string, username: string }} p
 */
export function ogTitle(p) {
  const name = p.name.trim();
  return name ? `${name}（@${p.username}）| Canaria` : `@${p.username} | Canaria`;
}

/**
 * 画像に使えるアイコンか。画像の生成（next/og）が描けるのは PNG と JPEG だけなので、拡張子で見る（アップロード時の名前の拡張子が付いている）
 * @param {string} url
 */
export function drawableImage(url) {
  try {
    return url.startsWith("https://") && /\.(png|jpe?g)$/i.test(new URL(url).pathname);
  } catch {
    return false;
  }
}

/**
 * Google Fonts から取る文字。画像に出る文字だけに絞ると、日本語のフォントでも数十KBで済む
 * @param {string[]} texts
 */
export const fontText = (texts) => [...new Set(Array.from(texts.join("")))].join("");
