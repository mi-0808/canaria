import { gearCategories, type Gear, type Profile, type Work } from "@/lib/store";

export function Avatar({ src, className = "h-10 w-10" }: { src: string; className?: string }) {
  return src ? (
    <img src={src} alt="" className={`${className} shrink-0 rounded-full object-cover`} />
  ) : (
    <div className={`${className} shrink-0 rounded-full bg-gradient-to-br from-yellow-200 to-amber-300`} />
  );
}

export function ProfileView({ p }: { p: Profile }) {
  const chips = [p.gender, p.age && `${p.age}歳`, p.location, p.company && `${p.company}${p.years ? ` · ${p.years}年` : ""}`, p.mbti].filter(Boolean);
  return (
    <div className="card overflow-hidden">
      <div className="relative h-32 bg-gradient-to-r from-yellow-300 via-yellow-200 to-amber-300">
        <div className="bg-grid absolute inset-0 opacity-50" />
      </div>
      <div className="-mt-12 space-y-4 px-6 pb-6">
        <Avatar src={p.icon} className="relative h-24 w-24 ring-4 ring-white" />
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{p.name || "名前未設定"}</h1>
          {p.tagline && <p className="text-zinc-700">{p.tagline}</p>}
        </div>
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <span key={c} className="rounded-lg bg-zinc-100 px-2.5 py-1 font-mono text-xs text-zinc-600">{c}</span>
            ))}
          </div>
        )}
        {p.bio && <p className="border-l-2 border-yellow-400 pl-4 text-sm leading-relaxed whitespace-pre-wrap text-zinc-600">{p.bio}</p>}
      </div>
    </div>
  );
}

export function WorkCard({ w, children }: { w: Work; children?: React.ReactNode }) {
  const status = w.status ?? "開発中"; // 旧データ互換
  const live = status === "リリース・運用中";
  const techs = (w.techs ?? "").split(",").map((t) => t.trim()).filter(Boolean);
  return (
    <article className="card group flex flex-col overflow-hidden transition hover:shadow-xl">
      <div className="relative aspect-[16/9] overflow-hidden border-b border-zinc-100 bg-gradient-to-br from-yellow-100 to-amber-200">
        {w.image && <img src={w.image} alt="" className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-[1.03]" />}
      </div>
      <div className="flex flex-1 flex-col gap-5 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${live ? "bg-yellow-300 text-black" : "bg-zinc-100 text-zinc-700"}`}>
            {live ? "● " : ""}{status}
          </span>
          {w.period && <span className="font-mono text-xs text-zinc-500">{w.period}</span>}
        </div>
        <h3 className="text-2xl leading-snug font-bold tracking-tight">{w.title}</h3>
        {w.summary && <p className="leading-relaxed whitespace-pre-wrap text-zinc-600">{w.summary}</p>}
        {w.role && <p className="text-sm font-bold">役割：{w.role}</p>}
        {techs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {techs.map((t) => <span key={t} className="rounded-full border border-zinc-200 px-3 py-1 font-mono text-xs text-zinc-600">{t}</span>)}
          </div>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-4 pt-2">
          {/* 色付きボタンは1画面1つのルールのため、黒の枠線ボタン */}
          {w.url && (
            <a href={w.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-black px-5 py-2.5 text-sm font-bold transition hover:bg-black hover:text-yellow-300">
              実際に触ってみる ↗
            </a>
          )}
          {children}
        </div>
      </div>
    </article>
  );
}

export function GearRow({ g, children }: { g: Gear; children?: React.ReactNode }) {
  const body = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-100 to-amber-200 text-lg">{gearCategories[g.category]}</span>
      <div className="min-w-0">
        <p className="truncate font-medium">{g.name}</p>
        {g.comment ? <p className="text-xs text-zinc-600">“{g.comment}”</p> : <p className="font-mono text-[11px] text-zinc-400">{g.category}</p>}
      </div>
    </>
  );
  return (
    <div className="card flex items-center gap-3 p-3 transition hover:shadow-md">
      {g.url ? (
        <a href={g.url} target="_blank" rel="noopener noreferrer sponsored" className="flex min-w-0 flex-1 items-center gap-3">
          {body}
          <span className="ml-auto text-amber-500">↗</span>
        </a>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3">{body}</div>
      )}
      {children}
    </div>
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-zinc-200 py-14 text-center">
      <p className="font-mono text-sm text-zinc-400">empty.</p>
      <p className="mt-1 text-sm text-zinc-500">{text}</p>
    </div>
  );
}
