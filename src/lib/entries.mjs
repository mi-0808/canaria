// やってきたこと（はたらいたこと・まなんだこと・すきなこと）の期間の表示と、入力の検査。
// .mjs にしてあるのは、scripts/check-entries.mjs から Node でそのまま読んで検査するため（stats.mjs と同じ）

/**
 * 期間は年と月（月は任意）。月が無いときは、はじめは1月・おわりは12月とみなして前後を比べる（DB の entries_period_order と同じ）
 * @typedef {{ section: string, kind: string, title: string, started: number | null, started_month: number | null,
 *   ended: number | null, ended_month: number | null, current: boolean, created_at?: string }} EntryLike
 */

/** @param {number} year @param {number | null} month */
const yearMonth = (year, month) => `${year}年${month ? `${month}月` : ""}`;

/**
 * 公開ページ・一覧に出す期間。「2024年4月 – いま」「2023年10月 – 2024年3月」。月が無ければ「2024年」。
 * すきなことは「おわり」を聞かないので「2020年4月から」
 * @param {EntryLike} e
 */
export function entryPeriod(e) {
  const start = e.started ? yearMonth(e.started, e.started_month) : "";
  if (e.section === "like") return start && `${start}から`;
  if (e.current) return start ? `${start} – いま` : "いま";
  const end = e.ended ? yearMonth(e.ended, e.ended_month) : "";
  return start && end && start !== end ? `${start} – ${end}` : start || end;
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
 * （すきなことと身につけたことは「いつ（から）」だけ聞く。学校から切り替えたときなどに、見えない値が残らないように）。
 * 年の無い月も消す（DB は「月だけ」を通さない）
 * @template {EntryLike} T
 * @param {T} e
 * @returns {T}
 */
export function cleanEntry(e) {
  const onlyStart = e.section === "like" || (e.section === "learn" && e.kind !== "school");
  const ended = onlyStart || e.current ? null : e.ended;
  return {
    ...e,
    title: e.title.trim(),
    kind: e.kind.trim(),
    current: onlyStart ? false : e.current,
    started_month: e.started ? e.started_month : null,
    ended,
    ended_month: ended ? e.ended_month : null,
  };
}

/** 1つの欄に足せる数。読み込みは3つの欄の合計 150 件までなので、それを超えて見えなくならないように */
export const MAX_PER_SECTION = 50;

/**
 * 保存できない理由。無ければ null。DB の check 制約と同じ条件を、保存する前に画面で知らせる
 * @param {EntryLike} e
 */
export function entryProblem(e) {
  if (!e.title.trim()) return "名前を入れると足せます";
  if (e.started && e.ended && e.ended * 100 + (e.ended_month ?? 12) < e.started * 100 + (e.started_month ?? 1))
    return "おわりは、はじめより後にしてください";
  return null;
}

/** @param {EntryLike} e 始めた年月の大きさ。月の無いものは同じ年の中で下、年の無いものは一番下（DB の並び順と同じ） */
const startRank = (e) => (e.started ? e.started * 100 + (e.started_month ?? 0) : -1);

/**
 * 並び順: 新しく始めたものが上。同じ年月なら足した新しい順
 * @param {EntryLike} a
 * @param {EntryLike} b
 */
export function byNewest(a, b) {
  return startRank(b) - startRank(a) || (b.created_at ?? "").localeCompare(a.created_at ?? "");
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
