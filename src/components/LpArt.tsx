import type { Section } from "@/lib/store";

// LP の②（3つの欄）のカードの頭に並べる、小さな写真風の挿絵。例の数だけ白い枠の「写真」を少し傾けて並べる
// （2026-10-14、見本の3案からユーザーがコラージュを選択）。
// 実在の写真や素材は使わず、design.css の色トークンで描く（LP は常にライトなので、ダークの色は考えない）。
// 飾りなので読み上げでは飛ばす（伝えたいことはカードの文にある）

// 線と塗りの色。写真の地はカードと同じ面の色、線はその上の文字の色（面と文字のペア）、差し色はカナリア
const tones: Record<Section, { ink: string; bg: string }> = {
  work: { ink: "var(--color-on-tertiary-container)", bg: "var(--color-tertiary-container)" },
  learn: { ink: "var(--color-on-primary-container)", bg: "var(--color-primary-container)" },
  like: { ink: "var(--color-on-secondary-container)", bg: "var(--color-secondary-container)" },
};
const accent = "var(--color-primary)";
const paper = "var(--color-surface)";

// 160×120 の中に描く。足すときは線4px・角は丸める
const art = {
  cafe: (c: string) => (
    <>
      <path d="M52 58h48v28a18 18 0 0 1-18 18h-12a18 18 0 0 1-18-18z" fill={paper} stroke={c} strokeWidth="4" />
      <path d="M100 66h8a10 10 0 0 1 0 20h-8" fill="none" stroke={c} strokeWidth="4" />
      <path d="M40 104h76" stroke={c} strokeWidth="4" strokeLinecap="round" />
      <path d="M66 30c-6 8 6 12 0 20M80 26c-6 8 6 12 0 20" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" opacity=".6" />
      <path d="M68 72c4 6 12 6 16 0" fill="none" stroke={accent} strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  flag: (c: string) => (
    <>
      <path d="M44 108V28" stroke={c} strokeWidth="4" strokeLinecap="round" />
      <path d="M46 30h64l-12 16 12 16H46z" fill={accent} stroke={c} strokeWidth="4" strokeLinejoin="round" />
      <path d="M30 108h100" stroke={c} strokeWidth="4" strokeLinecap="round" />
      <circle cx="100" cy="94" r="10" fill={paper} stroke={c} strokeWidth="4" />
      <circle cx="122" cy="94" r="10" fill={paper} stroke={c} strokeWidth="4" />
    </>
  ),
  horn: (c: string) => (
    <>
      <path d="M30 74h60" stroke={c} strokeWidth="6" strokeLinecap="round" />
      <path d="M90 74l34-20v40z" fill={accent} stroke={c} strokeWidth="4" strokeLinejoin="round" />
      <path d="M50 62v-12M62 62v-12M74 62v-12" stroke={c} strokeWidth="5" strokeLinecap="round" />
      <path d="M40 74v14h40V74" fill="none" stroke={c} strokeWidth="4" />
    </>
  ),
  fire: (c: string) => (
    <>
      <path d="M80 30c14 18 30 28 30 50a30 30 0 0 1-60 0c0-12 8-20 12-26 2 10 6 14 10 14-4-14 0-26 8-38z" fill={accent} stroke={c} strokeWidth="4" strokeLinejoin="round" />
      <path d="M80 66c8 8 12 12 12 20a12 12 0 0 1-24 0c0-6 6-12 12-20z" fill={paper} />
      <path d="M40 104l80-14M40 90l80 14" stroke={c} strokeWidth="7" strokeLinecap="round" />
    </>
  ),
  laptop: (c: string) => (
    <>
      <rect x="42" y="36" width="76" height="50" rx="4" fill={paper} stroke={c} strokeWidth="4" />
      <path d="M30 96h100l-8 10H38z" fill={c} />
      <path d="M56 54l-8 7 8 7M104 54l8 7-8 7M84 50l-8 22" fill="none" stroke={accent} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  camera: (c: string) => (
    <>
      <rect x="30" y="44" width="100" height="60" rx="8" fill={paper} stroke={c} strokeWidth="4" />
      <path d="M48 44v-8h22v8" fill={c} />
      <rect x="104" y="36" width="16" height="8" rx="2" fill={c} />
      <circle cx="80" cy="74" r="20" fill={c} />
      <circle cx="80" cy="74" r="11" fill={accent} />
      <circle cx="76" cy="70" r="3" fill={paper} />
      <path d="M30 60h12M118 60h12" stroke={c} strokeWidth="4" />
    </>
  ),
  shirt: (c: string) => (
    <>
      <path d="M56 30l-26 16 10 18 12-6v48h56V58l12 6 10-18-26-16c-4 8-12 12-24 12s-20-4-24-12z" fill={paper} stroke={c} strokeWidth="4" strokeLinejoin="round" />
      <path d="M52 76h56M52 90h56" stroke={accent} strokeWidth="5" />
    </>
  ),
  drum: (c: string) => (
    <>
      <ellipse cx="80" cy="56" rx="40" ry="12" fill={paper} stroke={c} strokeWidth="4" />
      <path d="M40 56v34c0 7 18 12 40 12s40-5 40-12V56" fill={accent} stroke={c} strokeWidth="4" />
      <path d="M48 60l64 34M112 60l-64 34" stroke={c} strokeWidth="2" opacity=".5" />
      <path d="M96 24l-26 30M118 30l-34 24" stroke={c} strokeWidth="4" strokeLinecap="round" />
    </>
  ),
};
export type ArtName = keyof typeof art;

// 写真ごとに傾きを変えて、手で置いたように見せる
const tilts = ["-rotate-3", "rotate-2", "-rotate-2"];

/** 例の数だけの小さな写真。3列の升目に置くので、2枚の欄も1枚の大きさはそろう */
export function Collage({ section, items }: { section: Section; items: ArtName[] }) {
  const { ink, bg } = tones[section];
  return (
    <div aria-hidden className="grid grid-cols-3 gap-2">
      {items.map((k, i) => (
        <div key={k} className={`rounded-sm bg-surface p-1 pb-3 shadow-sm ${tilts[i % tilts.length]}`}>
          <svg viewBox="0 0 160 120" className="block h-auto w-full">
            <rect width="160" height="120" fill={bg} />
            {art[k](ink)}
          </svg>
        </div>
      ))}
    </div>
  );
}
