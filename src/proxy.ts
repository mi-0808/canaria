import { NextResponse, type NextRequest } from "next/server";

// ログイン中は `/` でホームを出す（URL は `/` のまま）。未ログインなら LP。
// Supabase のセッション cookie（sb-<ref>-auth-token、長いと .0 .1 に分割）があるかだけを見る。
// DB に問い合わせない楽観的な判定なので、期限切れの cookie ならホーム側でログイン画面へ送る
const authCookie = /^sb-.+-auth-token(\.\d+)?$/;

export function proxy(req: NextRequest) {
  const loggedIn = req.cookies.getAll().some((c) => authCookie.test(c.name));
  return loggedIn ? NextResponse.rewrite(new URL("/home", req.url)) : NextResponse.next();
}

export const config = { matcher: "/" };
