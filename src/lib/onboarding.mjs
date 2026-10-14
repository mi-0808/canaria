// 登録直後の4問（/me/start）で、次へ進めるかと、保存する形の組み立て。
// .mjs にしてあるのは、scripts/check-onboarding.mjs から Node でそのまま読んで検査するため（history.mjs と同じ）
import { normalizeLink } from "./links.mjs";

/** 4問の順。1問目（名前）だけ必須で、残りはスキップできる */
export const steps = ["name", "now", "like", "sns"];

/** ユーザー名の形。DB の check と store.ts の usernamePattern と同じ */
const usernamePattern = /^[a-z0-9_]{3,20}$/;

/**
 * 1問目で「次へ」を押せない理由。押せるなら null。ユーザー名は変えなくてよい（最初の user_xxxx のままで進める。ユーザーの指示）
 * @param {{ name: string, username: string }} d
 */
export function nameProblem(d) {
  if (!d.name.trim()) return "名前を入れると次へ進めます";
  if (!usernamePattern.test(d.username)) return "リンクは英小文字・数字・_ の3〜20文字にしてください";
  return null;
}

/**
 * 4問目で「できあがり」を押せない理由。空（スキップ）は通す
 * @param {string} sns
 */
export const snsProblem = (sns) => (sns.trim() && !normalizeLink(sns) ? "https:// から始まる URL を貼ってください" : null);

/**
 * 4問の答えをプロフィールに重ねる。空の答え（スキップ）は今の値を消さない。
 * SNS は https にそろえて先頭に足し、同じものは重ねない。上限（6件）を超えたら古いほうを落とす
 * @template {{ name: string, username: string, role: string, doing_now: string, links: string[] }} P
 * @param {P} p 今のプロフィール
 * @param {{ name: string, username: string, role: string, doing_now: string, sns: string }} d 答え
 * @returns {P}
 */
export function mergeAnswers(p, d) {
  const sns = normalizeLink(d.sns);
  return {
    ...p,
    name: d.name.trim(),
    username: d.username,
    role: d.role || p.role,
    doing_now: d.doing_now.trim().slice(0, 100) || p.doing_now,
    links: sns ? [sns, ...p.links.filter((l) => l !== sns)].slice(0, 6) : p.links,
  };
}

/** すきなことの例。押すと入力欄に入る */
export const likeExamples = ["写真", "料理", "ゲーム", "音楽", "スポーツ", "読書"];
