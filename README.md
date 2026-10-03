# Canaria

エンジニアのための、無料で使えるポートフォリオ＋α。作品だけでなく「人」を見せる。

本番: https://canaria-seven.vercel.app

## 画面
| パス | 内容 |
|---|---|
| `/` | 未ログイン: ランディングページ ／ ログイン中: ホーム（投稿・みんなの新着） |
| `/me` | ポートフォリオを作る（プロフィール・作品・開発環境の編集。ユーザー名もここで変える） |
| `/settings` | 設定（テーマ: 自動／ライト／ダーク、ログアウト） |
| `/@name` | 公開ページ（name はユーザー名） |
| `/@name/posts/[id]` | 共有された投稿（閲覧のみ） |
| `/signup` `/login` `/forgot` `/reset` | 新規登録・ログイン・パスワード再設定 |

- ログイン中は、スマホでは画面下のタブバー（トップ・ポートフォリオ・設定）、PC ではヘッダーから移動する
- `/@name` は `next.config.ts` の rewrites で `src/app/u/[name]`、`/@name/posts/[id]` は `src/app/p/[id]` に読み替えている（Next はフォルダ名を `@` で始められないため）
- 旧 URL の `/u/ユーザーID` は `/@name` に置き換え、`/timeline` は `/` に転送する

## ルール
- 作業の進め方: [CLAUDE.md](CLAUDE.md)
- 見た目（色・共通部品・文字・アクセシビリティ）: [src/app/design.css](src/app/design.css)

## 開発
```bash
npm install
npm run dev
npm run check   # 型チェック + ESLint + デザイントークン検査 + コントラスト比検査（ライト・ダーク）
```

## 技術
Next.js / TypeScript / Tailwind CSS / Supabase（認証・DB・Storage）/ Vercel
