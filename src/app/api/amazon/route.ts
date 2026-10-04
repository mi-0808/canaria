import { amazonProductUrl, amazonShortLink } from "@/lib/links.mjs";

// Amazon アプリの「共有」が出す短縮リンク（amzn.asia/d/…）を、商品の URL（/dp/ASIN）に直す。
// 転送先はブラウザから読めない（CORS）のでサーバーで見る。amzn.asia は1回の転送で /dp/ASIN に飛ぶ（2026-10 に確認）。
// 取りに行くのは amazonShortLink が通した Amazon の短縮ドメインだけ（任意の URL を叩く踏み台にさせない）
export async function GET(req: Request) {
  const link = amazonShortLink(new URL(req.url).searchParams.get("u") ?? "");
  if (!link) return Response.json({ error: "not an Amazon short link" }, { status: 400 });
  const res = await fetch(link, { redirect: "manual" }).catch(() => null);
  const url = amazonProductUrl(res?.headers.get("location") ?? "");
  return url ? Response.json({ url }) : Response.json({ error: "no product" }, { status: 404 });
}
