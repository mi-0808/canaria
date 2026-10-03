"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Header";
import { updatePassword, useUser } from "@/lib/store";

// 再設定メールのリンク先。URL の code を Supabase クライアントが自動でセッションに交換する
export default function Reset() {
  const router = useRouter();
  const user = useUser();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const err = await updatePassword(password);
      if (err) setError(err);
      else router.replace("/me");
    } finally {
      setBusy(false);
    }
  };

  if (user === undefined) return null;

  return (
    <div className="mx-auto max-w-sm space-y-6 py-16">
      <div className="space-y-4 text-center">
        <Logo className="mx-auto h-12 w-12" />
        <h1 className="text-2xl font-bold tracking-tight">新しいパスワードを設定</h1>
      </div>
      {user ? (
        <form onSubmit={submit} className="space-y-4">
          <label className="block space-y-1.5">
            <span className="flex justify-between">
              <span className="label">新しいパスワード</span>
              <span className="text-sm text-fg-3">8文字以上</span>
            </span>
            <input type="password" required minLength={8} autoComplete="new-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && <p role="alert" className="text-sm text-error">{error}</p>}
          <button className="btn-primary w-full" disabled={busy}>{busy ? "保存中…" : "パスワードを変更する"}</button>
        </form>
      ) : (
        // 期限切れ、または再設定を申し込んだのと別のブラウザで開いた場合
        <div className="space-y-4 text-center text-sm text-fg-2">
          <p>リンクの有効期限が切れているか、申し込みをしたのとは別のブラウザで開かれています。<br />お手数ですが、もう一度お試しください。</p>
          <Link href="/forgot" className="btn">再設定メールを送り直す</Link>
        </div>
      )}
    </div>
  );
}
