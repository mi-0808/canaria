"use client";
import { useEffect, useState } from "react";
import Icon, { type IconName } from "@/components/Icon";
import { signOut, useUser } from "@/lib/store";

type Theme = "auto" | "light" | "dark";
// HIG の「外観」と同じ3択。「自動」は端末の設定に合わせる（design.css の color-scheme: light dark）
const themes: [Theme, string, IconName][] = [
  ["auto", "自動", "monitor"],
  ["light", "ライト", "sun"],
  ["dark", "ダーク", "moon"],
];

// 選んだテーマは、この端末のこのブラウザにだけ保存する（アカウントには保存しない。端末ごとに明るさの好みは違うため）。
// 読み出しは layout.tsx の head のスクリプトが、最初の描画より前にやる
function applyTheme(t: Theme) {
  const html = document.documentElement;
  if (t === "auto") delete html.dataset.theme;
  else html.dataset.theme = t;
  try {
    if (t === "auto") localStorage.removeItem("theme");
    else localStorage.setItem("theme", t);
  } catch {
    // プライベートブラウズなどで保存できなくても、今の画面の切り替えは効いている
  }
}

export default function Settings() {
  const user = useUser();
  const [theme, setTheme] = useState<Theme>("auto");
  // サーバーでは保存先が読めないので、描画後に html の状態（head のスクリプトが付けたもの）に合わせる
  // eslint-disable-next-line react-hooks/set-state-in-effect -- 上の理由で、初回だけブラウザの状態を読み直す
  useEffect(() => setTheme((document.documentElement.dataset.theme as Theme) ?? "auto"), []);

  // `/` の中身（LP かホームか）はログイン状態で変わる。画面ごと読み直して proxy に判定し直させる。
  // router.push だと、Next のクライアントキャッシュに残ったホームが出ることがある（router.refresh は今のページ分しか消さない）
  const logout = async () => {
    await signOut();
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- 上の理由で意図的に再読み込みする
    location.assign("/");
  };

  return (
    <div className="mx-auto max-w-xl space-y-10">
      <h1 className="text-3xl font-bold tracking-tight">設定</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">表示</h2>
        <div role="radiogroup" aria-label="テーマ" className="segmented">
          {themes.map(([t, label, icon]) => (
            <label key={t} className="segment">
              <input type="radio" name="theme" className="sr-only" checked={theme === t} onChange={() => { setTheme(t); applyTheme(t); }} />
              <Icon name={icon} className="h-4 w-4" />{label}
            </label>
          ))}
        </div>
        <p className="text-sm text-fg-2">「自動」は端末の設定に合わせて切り替わります。選んだテーマはこのブラウザにだけ保存されます。</p>
      </section>

      {user && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold">アカウント</h2>
          <p className="text-sm text-fg-2">{user.email} でログインしています</p>
          <button className="btn text-error" onClick={logout}><Icon name="logout" />ログアウト</button>
        </section>
      )}
    </div>
  );
}
