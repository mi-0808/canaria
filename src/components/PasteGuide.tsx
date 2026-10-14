"use client";
import { useState } from "react";

// SNS のプロフィール欄にリンクを貼る手順。登録直後の完成画面（/me/start）と、/me の「貼り方」のシートで使う。
// 載せるのはインスタ・Facebook・MyHood（2026-10-14 ユーザーの指定）。画面の名前は各サービスの表示に合わせる。
// サービス側の画面が変わったら、ここを直す
const guides = [
  ["instagram", "インスタ", ["プロフィールを編集", "リンク → 外部リンクを追加", "コピーしたリンクを貼って完了"]],
  ["facebook", "Facebook", ["プロフィールを編集", "自己紹介 → ウェブサイトとリンク", "コピーしたリンクを貼って保存"]],
  // MyHood の手順は ~/MyhoodBeta の ProfileHero（編集の「SNS・リンク」）で確かめた
  ["myhood", "MyHood", ["名前の横の編集ボタン", "SNS・リンクで「リンク」を選ぶ", "コピーしたリンクを貼って追加 → 保存"]],
] as const;

export default function PasteGuide() {
  const [open, setOpen] = useState<(typeof guides)[number][0]>("instagram");
  const steps = guides.find(([k]) => k === open)![2];
  return (
    <div className="space-y-3">
      <div role="radiogroup" aria-label="貼る先" className="segmented">
        {guides.map(([k, label]) => (
          <label key={k} className="segment">
            <input type="radio" name="paste-guide" className="sr-only" checked={open === k} onChange={() => setOpen(k)} />
            {label}
          </label>
        ))}
      </div>
      <ol className="list-decimal space-y-1 pl-6 text-fg-2">
        {steps.map((s) => <li key={s}>{s}</li>)}
      </ol>
    </div>
  );
}
