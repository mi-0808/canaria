# Canaria

やってきたことを、見せたくなる形で並べるプロフィール帳。作品だけでなく「人」を見せる。

本番: https://canaria-seven.vercel.app

main にマージすると Vercel が本番に自動でデプロイする。PR を出すとプレビュー URL が PR に付く。

## 画面
| パス | 内容 |
|---|---|
| `/` | 未ログイン: ランディングページ ／ ログイン中: `/me` へ転送 |
| `/me` | プロフィール（編集のトップ）。名前・ひとこと・連絡先・ユーザー名の編集と、下の画面への入口 |
| `/me/work` `/me/learn` `/me/like` | はたらいたこと・まなんだこと・すきなこと の一覧と編集 |
| `/me/works` | 作品の一覧と編集 |
| `/settings` | 設定（テーマ: 自動／ライト／ダーク、ログアウト）。ヘッダーの右の歯車から開く |
| `/@name` | 公開ページ（name はユーザー名） |
| `/find` | さがす。立場・分野を選んだ人を属性で絞って並べる（ログイン不要）。ヘッダーの「さがす」から開く |
| `/signup` `/login` `/forgot` `/reset` | 新規登録・ログイン・パスワード再設定 |

- ログイン中の行き先は `/me` と `/find` だけなので、タブバーやメニューは置かない
- `/@name` は `next.config.ts` の rewrites で `src/app/u/[name]` に読み替えている（Next はフォルダ名を `@` で始められないため）
- 旧 URL の `/u/ユーザーID` は `/@name` に置き換える

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
