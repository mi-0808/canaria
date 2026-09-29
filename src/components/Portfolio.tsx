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
  return (
    <article className="card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-yellow-100 to-amber-200">
        {w.image && <img src={w.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
        <span className="absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-1 font-mono text-xs font-medium backdrop-blur">
          {w.progress === 100 ? "✓ done" : `${w.progress}%`}
        </span>
      </div>
      <div className="space-y-3 p-5">
        <div>
          <h3 className="text-lg font-bold tracking-tight">{w.title}</h3>
          <p className="font-mono text-xs text-zinc-500">{[w.period, w.role].filter(Boolean).join(" · ")}</p>
        </div>
        <div className="h-1.5 rounded-full bg-zinc-100">
          <div className="h-1.5 rounded-full bg-gradient-to-r from-yellow-300 to-amber-400" style={{ width: `${w.progress}%` }} />
        </div>
        {w.summary && <p className="text-sm leading-relaxed whitespace-pre-wrap text-zinc-600">{w.summary}</p>}
        {w.url && (
          <a href={w.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-mono text-xs font-medium text-amber-600 hover:underline">
            ↗ 成果物を見る
          </a>
        )}
        {children}
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
