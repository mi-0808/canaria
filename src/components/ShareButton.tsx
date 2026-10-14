"use client";
import { useState } from "react";
import Icon from "@/components/Icon";

type Result = "" | "copied" | "failed";
const done: Record<Result, string> = { "": "", copied: "リンクをコピーしました", failed: "コピーできませんでした" };

/**
 * 自分の公開ページを共有する。スマホ（と Mac の Safari）は OS の共有メニュー（LINE・AirDrop・コピーなど）を開く。
 * 共有メニューが無いブラウザ（PC の Chrome など）は、リンクをコピーして少しの間だけ結果を出す（alert は出さない）。
 * label: 文字つきの濃いカナリア（/me の主な行動）。icon: 白い丸（公開ページ。濃いカナリアは「メールで連絡」が使うので重ねない）
 */
export default function ShareButton({ username, name, variant, className = "" }: {
  username: string;
  name: string;
  variant: "label" | "icon";
  className?: string;
}) {
  const [result, setResult] = useState<Result>("");
  const share = async () => {
    // プレビュー用の ?preview は付けない。見る人に渡すのは素の公開ページ
    const url = `${location.origin}/@${username}`;
    if ("share" in navigator) {
      try {
        await navigator.share({ title: `${name || username}のプロフィール`, url });
        return;
      } catch (e) {
        // 共有メニューを閉じただけなら何もしない。それ以外（使えない場面など）はコピーに切り替える
        if (e instanceof DOMException && e.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setResult("copied");
    } catch {
      setResult("failed");
    }
    setTimeout(() => setResult(""), 2000);
  };

  return (
    <>
      {variant === "label" ? (
        <button type="button" onClick={share} className={`btn-primary ${className}`}>
          <Icon name={result === "copied" ? "check" : "share"} className="h-4 w-4" />
          {result === "copied" ? "コピーしました" : result === "failed" ? "コピーできません" : "共有する"}
        </button>
      ) : (
        <button type="button" onClick={share} aria-label="プロフィールを共有"
          className={`flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-fg shadow-sm transition hover:bg-surface-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg ${className}`}>
          <Icon name={result === "copied" ? "check" : "share"} className="h-5 w-5" />
        </button>
      )}
      {/* 結果は読み上げでも伝える。丸いボタンは見た目がアイコンの切り替えだけなので、とくに要る */}
      <span role="status" className="sr-only">{done[result]}</span>
    </>
  );
}

/**
 * リンクをコピーするだけのボタン（共有メニューを開かない）。SNS のプロフィール欄に貼る人は、コピーが一番早い。
 * 共有メニューと並べて、どちらも選べるようにする（2026-10-14 ユーザーの指示）
 */
export function CopyLinkButton({ username, label = "リンクをコピー", className = "btn-tonal" }: { username: string; label?: string; className?: string }) {
  const [result, setResult] = useState<Result>("");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${location.origin}/@${username}`);
      setResult("copied");
    } catch {
      setResult("failed");
    }
    setTimeout(() => setResult(""), 2000);
  };
  return (
    <>
      <button type="button" onClick={copy} className={className}>
        {result === "copied" ? <><Icon name="check" className="h-4 w-4" />コピーしました</> : result === "failed" ? "コピーできません" : label}
      </button>
      <span role="status" className="sr-only">{done[result]}</span>
    </>
  );
}
