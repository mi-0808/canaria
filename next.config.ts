import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 公開ページの URL は /@username。Next はフォルダ名を @ で始められない（並列ルートの記法）ので読み替える
  rewrites: async () => [
    { source: "/@:username", destination: "/u/:username" },
  ],
};

export default nextConfig;
