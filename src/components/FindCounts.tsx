"use client";
import Link from "next/link";
import Icon from "@/components/Icon";
import { countFor } from "@/lib/find.mjs";
import { fieldChoices, loadFindCounts, profileChoices, useLoad } from "@/lib/store";

// LP の「いま Canaria にいる人」。立場・分野ごとの人数を、1人以上いるものだけ「さがす」へのリンクで並べる。
// 人数が届く前と、読み込みに失敗したときは数字を出さず、「さがすを見る」だけにする
export default function FindCounts() {
  const [rows] = useLoad(() => loadFindCounts(true), []);
  const chips = [
    ...profileChoices.role.map((c) => ({ label: c, href: `/find?role=${encodeURIComponent(c)}`, n: rows ? countFor(rows, { role: c, field: "" }) : 0 })),
    ...fieldChoices.map((c) => ({ label: c, href: `/find?field=${encodeURIComponent(c)}`, n: rows ? countFor(rows, { role: "", field: c }) : 0 })),
  ].filter((c) => c.n > 0);

  return (
    <div className="space-y-3 rounded-2xl border border-line p-4">
      {chips.length > 0 && (
        <>
          <p className="text-sm text-fg-3">いま Canaria にいる人</p>
          <ul className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <li key={c.href}>
                <Link href={c.href} className="chip">{c.label}<span className="text-fg-3">{c.n}<span className="sr-only">人</span></span></Link>
              </li>
            ))}
          </ul>
        </>
      )}
      <Link href="/find" className="-ml-1 inline-flex min-h-11 items-center gap-1 px-1 text-tertiary">さがすを見る<Icon name="chevron" className="h-4 w-4" /></Link>
    </div>
  );
}
