"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";
import Icon from "@/components/Icon";
import { Avatar, Empty } from "@/components/Portfolio";
import { countFor, parseSelection, toggleHref } from "@/lib/find.mjs";
import { fieldChoices, loadFindCounts, loadFindList, profileChoices, useLoad } from "@/lib/store";

// さがす。立場・分野を選んだ人を属性で絞って並べる。ログイン不要。
// 選択は URL（?role= / ?field=）に持たせる。共有でき、ブラウザの戻るで1つ前の絞り込みに戻れる。
// 名前で探す入力欄は置かない（2026-10-14 の決定）
const groups = [
  ["role", "立場", profileChoices.role],
  ["field", "分野", fieldChoices],
] as const;

export default function FindPage({ searchParams }: PageProps<"/find">) {
  const sel = parseSelection(use(searchParams), profileChoices.role, fieldChoices);
  const router = useRouter();
  // 人数と一覧は別々に読み、届いた順に埋める（チップは選択肢の定数で先に出せる）
  const [rows] = useLoad(() => loadFindCounts(), []);
  const [list] = useLoad(() => loadFindList(sel), [sel.role, sel.field]);

  return (
    <div data-grouped className="mx-auto max-w-xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">さがす</h1>
        <p className="text-sm text-fg-3">立場や分野を選んだ人が載っています。</p>
      </div>

      {groups.map(([key, label, choices]) => (
        <section key={key} className="space-y-2">
          <h2 className="text-sm font-bold text-fg-2">{label}</h2>
          <div className="flex flex-wrap gap-2">
            {choices.map((c) => {
              const on = sel[key] === c;
              return (
                // 一覧の位置を保ったまま絞り込みだけ変えたいので、ページの頭へ戻さない
                <button key={c} type="button" className="chip" aria-pressed={on} onClick={() => router.push(toggleHref(sel, key, c), { scroll: false })}>
                  {on && <Icon name="check" className="h-4 w-4" />}
                  {c}
                  {/* 押したら何人になるか（もう片方の選択も効かせる）。0人のチップも出す */}
                  {rows && <span className="text-fg-3 in-aria-pressed:text-on-tertiary">{countFor(rows, { ...sel, [key]: c })}<span className="sr-only">人</span></span>}
                </button>
              );
            })}
          </div>
        </section>
      ))}

      <section className="space-y-2">
        {rows && <p className="group-label" aria-live="polite">{[sel.role, sel.field].filter(Boolean).join(" · ") || "全員"} · {countFor(rows, sel)}人</p>}
        {list === undefined ? (
          <div role="status" aria-label="読み込み中" className="h-40 animate-pulse rounded-2xl bg-surface-raised" />
        ) : list.length === 0 ? (
          <Empty text={sel.role || sel.field ? "まだこの属性の人はいません" : "まだ載っている人はいません"} />
        ) : (
          <ul className="group-box">
            {list.map((p) => (
              <li key={p.id}>
                <Link href={`/@${p.username}`} className="group-row py-2.5">
                  <Avatar src={p.icon} className="h-11 w-11" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{p.name}</span>
                    {p.tagline && <span className="block truncate text-sm text-fg-2">{p.tagline}</span>}
                    <span className="block truncate text-sm text-fg-3">{[p.role, ...p.fields].filter(Boolean).join(" · ")}</span>
                  </span>
                  <Icon name="chevron" className="h-5 w-5 text-fg-3" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
