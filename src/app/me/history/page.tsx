"use client";
import Link from "next/link";
import Icon from "@/components/Icon";
import { Avatar, Empty } from "@/components/Portfolio";
import { ListSkeleton } from "@/components/Skeleton";
import { MAX_HISTORY, readHistory } from "@/lib/history.mjs";
import { loadProfileCards, useAuthedUser, useLoad } from "@/lib/store";
import { ListHeader } from "../parts";

// 見たプロフィールの履歴。履歴はこのブラウザにだけ残っている（history.mjs）ので、名前・アイコンはここで DB から引く
export default function HistoryPage() {
  const user = useAuthedUser();
  const [list] = useLoad(() => {
    if (!user) return;
    const history = readHistory(user.id);
    return loadProfileCards(history.map((h) => h.id)).then((cards) =>
      // 履歴の順（見た新しい順）に並べ直す。消えたアカウントは出さない
      history.flatMap((h) => cards.find((c) => c.id === h.id) ?? []),
    );
  }, [user?.id]);

  return (
    <div data-grouped className="mx-auto max-w-xl space-y-6">
      <ListHeader title="見たプロフィール" hint={`このブラウザで見た公開ページ。新しい順に${MAX_HISTORY}件まで`} addLabel="" />
      {!list ? <ListSkeleton /> : list.length === 0 ? <Empty text="まだ見たプロフィールはありません" /> : (
        <ul className="group-box">
          {list.map((p) => (
            <li key={p.id}>
              <Link href={`/@${p.username}`} className="group-row py-2.5">
                <Avatar src={p.icon} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{p.name || "名前未設定"}</span>
                  <span className="block truncate text-sm text-fg-3">{p.tagline || `@${p.username}`}</span>
                </span>
                <Icon name="chevron" className="h-5 w-5 text-fg-3" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
