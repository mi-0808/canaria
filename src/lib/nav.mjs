// ヘッダー・タブバーの出し分け。
// .mjs にしてあるのは、scripts/check-nav.mjs から Node でそのまま読んで検査するため（links.mjs と同じ）

/** 公開ページ（/@名前。旧 URL の /u/ユーザーID も）。投稿1件のページ（/@名前/posts/ID）は含めない */
export const isPublicPage = (/** @type {string} */ path) => /^\/(@|u\/)[^/]+$/.test(path);

/**
 * 「公開ページを見る」から開いたプレビューか（URL に ?preview）。
 * 持ち主にだけ出す: プレビュー中の URL を共有されても、ほかの人にはふつうの公開ページを出す。
 * 読み込み中（user / page が undefined）は持ち主とみなす。持ち主の画面でヘッダーが一瞬出てから消えないようにするため
 * @param {boolean} preview
 * @param {{ id: string } | null | undefined} user ログイン中の人。null は未ログイン
 * @param {{ id: string } | null | undefined} page 公開ページの持ち主。null は見つからない
 */
export function isPreview(preview, user, page) {
  if (!preview) return false;
  if (user === undefined || page === undefined) return true;
  return !!user && !!page && user.id === page.id;
}
