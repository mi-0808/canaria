import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // タイムラインはホーム（ログイン中の `/`）に移した。共有済みのリンクを切らないために転送する
  redirects: async () => [{ source: "/timeline", destination: "/", permanent: false }],
};

export default nextConfig;
