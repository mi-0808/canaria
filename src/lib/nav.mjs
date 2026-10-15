// 公開ページのプレビューの出し分け。
// .mjs にしてあるのは、scripts/check-nav.mjs から Node でそのまま読んで検査するため（links.mjs と同じ）

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

/**
 * ログインのあとに行く先。「さがす」の案内から来た人（?next=/find…）は元の絞り込みへ戻し、それ以外はトップ（proxy.ts が /me へ送る）。
 * よそのサイトへ飛ばす URL を仕込まれないよう、/find で始まるものだけ受け付ける
 * @param {string | null} next
 */
export function afterLogin(next) {
  return next?.startsWith("/find") ? next : "/";
}
