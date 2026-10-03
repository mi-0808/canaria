import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 公開ページの URL は /@username。Next はフォルダ名を @ で始められない（並列ルートの記法）ので読み替える
  rewrites: async () => [
    { source: "/@:username", destination: "/u/:username" },
    { source: "/@:username/posts/:id", destination: "/p/:id" },
  ],
  // タイムラインはホーム（ログイン中の `/`）に移した。共有済みのリンクを切らないために転送する
  redirects: async () => [{ source: "/timeline", destination: "/", permanent: false }],
};

export default nextConfig;
