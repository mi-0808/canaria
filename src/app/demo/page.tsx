import Link from "next/link";
import Icon from "@/components/Icon";
import { EntrySections, NowNext, ProfileHero } from "@/components/Portfolio";
import { demoEntries, demoProfile } from "@/lib/demo";

// LP の「見本のページを見る」の行き先。公開ページ（/u/[name]）と同じ部品を、架空の人の固定データで並べる
export default function DemoPage() {
  return (
    <div className="space-y-12">
      {/* 実在の人と思われないよう、頭で見本だと断る */}
      <p className="rounded-xl bg-surface-2 px-4 py-3 text-sm text-fg-2">これは見本のページです（架空の人物）。</p>

      <div className="space-y-6">
        <ProfileHero p={demoProfile} />
        <NowNext p={demoProfile} />
      </div>

      <EntrySections entries={demoEntries} heading="text-2xl font-bold tracking-tight" />

      <div className="rounded-2xl bg-primary-container p-8 text-center">
        <p className="text-sm text-fg-2">あなたもプロフィールを作ろう</p>
        <Link href="/signup" className="btn-primary mt-3">無料ではじめる<Icon name="arrow" className="h-4 w-4" /></Link>
      </div>
    </div>
  );
}
