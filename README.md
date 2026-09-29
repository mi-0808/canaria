# Canaria

駆け出しエンジニアのための、無料で使えるポートフォリオ＋α。

## MVPの状態
- データはブラウザの localStorage に保存（`src/lib/store.ts`）
- 今後 Supabase（認証・DB・Storage）に差し替え、Vercel でデプロイ予定

## 画面
| パス | 内容 |
|---|---|
| `/` | ランディングページ |
| `/me` | マイページ（プロフィール・ポートフォリオ編集） |
| `/u` | 公開ページのプレビュー |
| `/timeline` | タイムライン（投稿・リアクション・返信・共有・保存） |
| `/p/[id]` | 共有された投稿（閲覧のみ） |

## ルール
- 色付きボタン（`btn-primary`）は1画面に1つまで

## 開発
```bash
npm install
npm run dev
```

## 技術
Next.js / TypeScript / Tailwind CSS
