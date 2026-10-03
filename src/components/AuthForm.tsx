"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Header";
import { sendPasswordReset, signIn, signUp, useUser } from "@/lib/store";

const copy = {
  signup: {
    title: "アカウントを作成",
    submit: "登録する",
    switchText: "アカウントをお持ちの方は",
    switchLink: "こちらからログイン",
    switchHref: "/login",
    sent: "に確認メールを送りました。メールのリンクを開くと登録が完了します。",
  },
  login: {
    title: "ログイン",
    submit: "ログインする",
    switchText: "アカウントをお持ちでない方は",
    switchLink: "こちらから新規登録",
    switchHref: "/signup",
    sent: "",
  },
  forgot: {
    title: "パスワードの再設定",
    submit: "再設定メールを送る",
    switchText: "パスワードを思い出した方は",
    switchLink: "ログインに戻る",
    switchHref: "/login",
    sent: "に再設定用のメールを送りました。メールのリンクを開いて、新しいパスワードを設定してください。",
  },
};

export default function AuthForm({ mode }: { mode: keyof typeof copy }) {
  const t = copy[mode];
  const router = useRouter();
  const user = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  // ログイン済みならマイページへ
  useEffect(() => {
    if (user) router.replace("/me");
  }, [user, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "signup") {
        const r = await signUp(email.trim(), password);
        if (r.error) setError(r.error);
        else if (r.confirm) setSent(true);
      } else if (mode === "forgot") {
        const err = await sendPasswordReset(email.trim());
        if (err) setError(err);
        else setSent(true);
      } else {
        const err = await signIn(email.trim(), password);
        if (err) setError(err);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm space-y-6 py-16">
      <div className="space-y-4 text-center">
        <Logo className="mx-auto h-12 w-12" />
        <h1 className="text-2xl font-bold tracking-tight">{sent ? "メールを確認してください" : t.title}</h1>
      </div>
      {sent ? (
        <p className="text-center text-sm leading-relaxed text-zinc-600">
          <span className="font-mono">{email}</span> {t.sent}
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <label className="block space-y-1.5">
            <span className="label">メールアドレス</span>
            <input type="email" required autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          {mode !== "forgot" && (
            <div className="space-y-1.5">
              <label className="block space-y-1.5">
                <span className="flex justify-between">
                  <span className="label">パスワード</span>
                  {mode === "signup" && <span className="font-mono text-[11px] text-zinc-400">8文字以上</span>}
                </span>
                <input type="password" required minLength={mode === "signup" ? 8 : undefined} className="input"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} />
              </label>
              {mode === "login" && (
                <Link href="/forgot" className="block text-right text-xs text-zinc-500 underline-offset-4 hover:text-black hover:underline">パスワードを忘れた方</Link>
              )}
            </div>
          )}
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <button className="btn-primary w-full" disabled={busy}>{busy ? "送信中…" : t.submit}</button>
        </form>
      )}
      <p className="border-t border-zinc-100 pt-6 text-center text-sm text-zinc-600">
        {t.switchText}
        <Link href={t.switchHref} className="ml-1 font-semibold text-black underline underline-offset-4 hover:no-underline">{t.switchLink}</Link>
      </p>
    </div>
  );
}
