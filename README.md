# Canaria

エンジニアのための、無料で使えるポートフォリオ＋α。作品だけでなく「人」を見せる。

本番: https://canaria-seven.vercel.app

## 画面
| パス | 内容 |
|---|---|
| `/` | 未ログイン: ランディングページ ／ ログイン中: ホーム（投稿・みんなの新着） |
| `/me` | マイページ（プロフィール・ポートフォリオの編集） |
| `/u/[id]` | 公開ページ |
| `/p/[id]` | 共有された投稿（閲覧のみ） |
| `/signup` `/login` `/forgot` `/reset` | 新規登録・ログイン・パスワード再設定 |

`/timeline` は `/` に転送する（タイムラインはホームに移した）。

## ルール
- 作業の進め方: [CLAUDE.md](CLAUDE.md)
- 見た目（色・共通部品・文字・アクセシビリティ）: [src/app/design.css](src/app/design.css)

## 開発
```bash
npm install
npm run dev
npm run check   # 型チェック + ESLint + デザイントークン検査
```

## 技術
Next.js / TypeScript / Tailwind CSS / Supabase（認証・DB・Storage）/ Vercel
