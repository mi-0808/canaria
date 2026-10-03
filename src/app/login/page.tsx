"use client";
import { useState } from "react";
import { Logo } from "@/components/Header";
import { signIn } from "@/lib/store";

// メールのリンクを踏むと /me に戻ってきてログイン完了（初回はそのまま登録）
export default function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await signIn(email.trim());
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm space-y-6 py-16 text-center">
      <Logo className="mx-auto h-12 w-12" />
      <h1 className="text-2xl font-bold tracking-tight">Canariaにログイン</h1>
      {sent ? (
        <p className="text-sm text-zinc-600">
          <span className="font-mono">{email}</span> にログインリンクを送りました。<br />メールを開いてリンクをクリックしてください。
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-3 text-left">
          <label className="block space-y-1.5">
            <span className="label">メールアドレス</span>
            <input type="email" required autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <button className="btn-primary w-full" disabled={sending}>{sending ? "送信中…" : "ログインリンクを送る"}</button>
          <p className="text-center text-xs text-zinc-500">はじめての方もこのまま登録できます</p>
        </form>
      )}
    </div>
  );
}
