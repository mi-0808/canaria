// やってきたこと（はたらいたこと・まなんだこと・すきなこと）の期間の表示と、入力の検査。
// .mjs にしてあるのは、scripts/check-entries.mjs から Node でそのまま読んで検査するため（stats.mjs と同じ）

/** @typedef {{ section: string, kind: string, title: string, started: number | null, ended: number | null, current: boolean, created_at?: string }} EntryLike */

/**
 * 公開ページ・一覧に出す期間。年だけ。
 * すきなことは「おわり」を聞かないので「2020 から」。それ以外は「2023 – 2024」「2024 – いま」「2024」
 * @param {EntryLike} e
 */
export function entryPeriod(e) {
  if (e.section === "like") return e.started ? `${e.started} から` : "";
  if (e.current) return e.started ? `${e.started} – いま` : "いま";
  if (e.started && e.ended && e.started !== e.ended) return `${e.started} – ${e.ended}`;
  return String(e.started ?? e.ended ?? "");
}

/**
 * 一覧・公開ページの1行の下に出す補足。はたらいたこと＝「種類 · 期間」、学校＝期間、
 * 身につけたこと・すきなこと＝ひとこと（無ければ「どこで」か期間）
 * @param {EntryLike & { note: string, place: string }} e
 */
export function entryMeta(e) {
  const period = entryPeriod(e);
  if (e.section === "work") return [e.kind, period].filter(Boolean).join(" · ");
  if (e.kind === "school") return period;
  return e.note || e.place || period;
}

/**
 * 保存する形にそろえる。名前と種類の前後の空白を取り、その欄で聞いていない「おわり」「いまも」を消す
 * （すきなことと身につけたことは「いつから」だけ聞く。学校から切り替えたときなどに、見えない値が残らないように）
 * @template {EntryLike} T
 * @param {T} e
 * @returns {T}
 */
export function cleanEntry(e) {
  const onlyStart = e.section === "like" || (e.section === "learn" && e.kind !== "school");
  return { ...e, title: e.title.trim(), kind: e.kind.trim(), ...(onlyStart && { ended: null, current: false }) };
}

/** 1つの欄に足せる数。読み込みは3つの欄の合計 150 件までなので、それを超えて見えなくならないように */
export const MAX_PER_SECTION = 50;

/**
 * 保存できない理由。無ければ null。DB の check 制約と同じ条件を、保存する前に画面で知らせる
 * @param {EntryLike} e
 */
export function entryProblem(e) {
  if (!e.title.trim()) return "名前を入れると足せます";
  if (e.started && e.ended && e.ended < e.started) return "おわりは、はじめより後の年にしてください";
  return null;
}

/**
 * 並び順: 新しく始めたものが上。年の無いものは下に、その中では足した新しい順
 * @param {EntryLike} a
 * @param {EntryLike} b
 */
export function byNewest(a, b) {
  if (a.started !== b.started) return (b.started ?? -Infinity) - (a.started ?? -Infinity);
  return (b.created_at ?? "").localeCompare(a.created_at ?? "");
}

/**
 * 年を選ぶ欄の選択肢。今年から60年前まで（新しい順）
 * @param {number} thisYear
 */
export const yearChoices = (thisYear) => Array.from({ length: 61 }, (_, i) => thisYear - i);

// 欄の名前と、一覧の見出しの下に出す説明。編集の画面と公開ページで同じ言葉を使う
export const sectionInfo = {
  work: { label: "はたらいたこと", hint: "バイト・インターン・立ち上げ・ボランティアも" },
  learn: { label: "まなんだこと", hint: "学校・部活・習い事・身につけたこと" },
  like: { label: "すきなこと", hint: "趣味。写真も1枚のせられます" },
};

// はたらいたことの「なにを」のチップ。ここに無いものは「自分で書く」で入れる
export const workKinds = ["バイト", "インターン", "業務委託", "立ち上げ", "ボランティア"];
