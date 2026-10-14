"use client";
import Link from "next/link";
import { useState } from "react";
import Icon from "@/components/Icon";
import PasteGuide from "@/components/PasteGuide";
import Phrases from "@/components/Phrases";
import { Avatar } from "@/components/Portfolio";
import ShareButton, { CopyLinkButton } from "@/components/ShareButton";
import { ListSkeleton } from "@/components/Skeleton";
import { likeExamples, mergeAnswers, nameProblem, snsProblem, steps } from "@/lib/onboarding.mjs";
import { newId, profileChoices, saveEntry, saveProfile, useBusy, type Entry } from "@/lib/store";
import { useMyPortfolio } from "../parts";

// 登録した直後の4問。空のページを前に手が止まらないよう、1問ずつ答えるだけで公開ページの形にする（2026-10-14 決定）。
// 1問目（名前）だけ必須で、その場で保存する（ユーザー名の重なりをここで知らせるため）。残りは最後にまとめて保存する。
// 何問目かは画面の中だけで持つ。途中でやめた人は、/me の頭の帯からここへ戻ってこられる
type Draft = { name: string; username: string; role: string; doing_now: string; like: string; sns: string };

const done = steps.length; // 4問のあとの完成画面

export default function StartPage() {
  const { user, data, setData } = useMyPortfolio();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft | null>(null); // 触るまでは今のプロフィールから作る
  const [error, setError] = useState("");
  const [saving, run] = useBusy();

  if (!user || !data) return <ListSkeleton />;

  const p = data.profile;
  const d = draft ?? { name: p.name, username: p.username, role: p.role, doing_now: "", like: "", sns: "" };
  const set = (patch: Partial<Draft>) => {
    setDraft({ ...d, ...patch });
    setError("");
  };
  const problem = step === 0 ? nameProblem(d) : step === 3 ? snsProblem(d.sns) : null;

  const saveName = () =>
    run(async () => {
      const saved = { ...p, name: d.name.trim(), username: d.username };
      const err = await saveProfile(user.id, saved);
      if (err) return setError(err);
      setData({ ...data, profile: saved });
      setStep(1);
    });
  const finish = (answers: Draft) =>
    run(async () => {
      const profile = mergeAnswers(p, answers);
      const err = await saveProfile(user.id, profile);
      if (err) return setError(err);
      let entries = data.entries;
      if (answers.like.trim()) {
        const like: Entry = {
          id: newId(), section: "like", kind: "", title: answers.like.trim().slice(0, 100), place: "", note: "",
          started: null, started_month: null, ended: null, ended_month: null, current: false, image: "",
        };
        entries = [await saveEntry(like), ...entries];
      }
      setData({ ...data, profile, entries });
      setStep(done);
    });
  const next = () => (step === 0 ? saveName() : step === 3 ? finish(d) : setStep(step + 1));
  // スキップはその問いの答えを空に戻して進む（空の答えは今の値を消さない。onboarding.mjs の mergeAnswers）
  const skip = () => {
    const cleared = { ...d, ...({ 1: { role: p.role, doing_now: "" }, 2: { like: "" }, 3: { sns: "" } } as Record<number, Partial<Draft>>)[step] };
    setDraft(cleared);
    setError("");
    if (step === 3) finish(cleared);
    else setStep(step + 1);
  };

  if (step === done) return <Done username={p.username} name={p.name} icon={p.icon} />;

  const message = error || (problem && (step !== 0 || d.name.trim()) ? problem : "");
  return (
    <div data-grouped className="mx-auto max-w-xl space-y-6">
      <div className="space-y-3">
        <div className="flex min-h-11 items-center justify-between">
          {step > 0 ? (
            <button className="-ml-1 inline-flex min-h-11 items-center gap-1 px-1 text-tertiary" onClick={() => setStep(step - 1)}>
              <Icon name="arrow" className="h-4 w-4 rotate-180" />戻る
            </button>
          ) : <span />}
          <span className="text-sm text-fg-3">{step + 1} / {steps.length}</span>
          {step > 0 ? <button className="-mr-1 inline-flex min-h-11 items-center px-1 text-tertiary" onClick={skip}>スキップ</button> : <span />}
        </div>
        {/* 進み具合。濃いカナリアは「次へ」が使うので、押せるもの・進むの藍にする */}
        <div aria-hidden className="flex gap-1.5">
          {steps.map((s, i) => <span key={s} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-tertiary" : "bg-line"}`} />)}
        </div>
      </div>

      {step === 0 && (
        <Question title="まずは、名前を|教えてください" hint="リンクはそのままでも大丈夫。好きな名前（英小文字・数字・_）に変えると覚えてもらいやすくなります。あとからも変えられます">
          <div className="group-box">
            <label className="group-row row-field">
              <span className="w-16 shrink-0">名前</span>
              <input className="row-input" autoComplete="name" autoFocus value={d.name} onChange={(e) => set({ name: e.target.value })} placeholder="山田 カナ" />
            </label>
            <label className="group-row row-field">
              <span className="w-16 shrink-0">リンク</span>
              <span className="font-mono text-fg-3">/@</span>
              <input className="row-input font-mono" maxLength={20} autoCapitalize="none" autoCorrect="off" value={d.username}
                onChange={(e) => set({ username: e.target.value.toLowerCase() })} />
            </label>
          </div>
        </Question>
      )}

      {step === 1 && (
        <Question title="いま、なにしてる？" hint="立場を選ぶと「さがす」に載ります">
          <div role="group" aria-label="立場" className="flex flex-wrap gap-2">
            {profileChoices.role.map((r) => (
              <button key={r} type="button" className="chip" aria-pressed={d.role === r} onClick={() => set({ role: d.role === r ? "" : r })}>
                {d.role === r && <Icon name="check" className="h-4 w-4" />}{r}
              </button>
            ))}
          </div>
          <div className="group-box row-field px-4">
            <textarea className="row-input py-3" rows={2} maxLength={100} aria-label="いまやっていること" placeholder="カフェでバイトしながら、写真サークル"
              value={d.doing_now} onChange={(e) => set({ doing_now: e.target.value })} />
          </div>
        </Question>
      )}

      {step === 2 && (
        <Question title="すきなことは？" hint="あとから写真やひとことも足せます">
          <div className="group-box row-field px-4">
            <input className="row-input" maxLength={100} aria-label="すきなこと" placeholder="フィルムカメラ" value={d.like} onChange={(e) => set({ like: e.target.value })} />
          </div>
          <p className="text-sm text-fg-3">たとえば</p>
          <div className="flex flex-wrap gap-2">
            {likeExamples.map((x) => <button key={x} type="button" className="chip" onClick={() => set({ like: x })}>{x}</button>)}
          </div>
        </Question>
      )}

      {step === 3 && (
        <Question title="SNS をつなげよう" hint="インスタ・Facebook・MyHood など。プロフィールの頭にボタンで並びます">
          <div className="group-box row-field px-4">
            <input className="row-input" type="url" inputMode="url" autoCapitalize="none" autoCorrect="off" aria-label="SNS の URL"
              placeholder="https://instagram.com/…" value={d.sns} onChange={(e) => set({ sns: e.target.value })} />
          </div>
        </Question>
      )}

      {message && <p role="alert" className="text-sm text-error">{message}</p>}
      <button className="btn-primary w-full" disabled={!!problem || saving} onClick={next}>
        {saving ? "保存中…" : step === 3 ? "できあがり" : "次へ"}
      </button>
    </div>
  );
}

function Question({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl leading-snug font-bold tracking-tight">
        <Phrases text={title} />
      </h1>
      {children}
      <p className="text-sm text-fg-3">{hint}</p>
    </section>
  );
}

/** 完成。リンクを共有（OS の共有メニュー）かコピーして、SNS のプロフィール欄に貼ってもらう */
function Done({ username, name, icon }: { username: string; name: string; icon: string }) {
  return (
    <div data-grouped className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl leading-snug font-bold tracking-tight">
        <Phrases text="できました！|プロフィール欄に貼ろう" />
      </h1>
      <div className="flex items-center gap-3 rounded-2xl bg-primary-container p-4 text-on-primary-container">
        <Avatar src={icon} className="h-12 w-12" />
        <span className="min-w-0">
          <span className="block truncate font-bold">{name}</span>
          <span className="block truncate text-sm">{location.host}/@{username}</span>
        </span>
      </div>
      {/* 濃いカナリアは共有（この画面ではこれだけ）。コピーも選べるよう薄い藍で並べる */}
      <div className="grid grid-cols-2 gap-3">
        <ShareButton variant="label" username={username} name={name} />
        <CopyLinkButton username={username} />
      </div>
      <div className="rounded-2xl bg-surface-raised p-4">
        <PasteGuide />
      </div>
      <div className="flex flex-col items-center">
        <Link href={`/@${username}?preview`} className="inline-flex min-h-11 items-center px-2 text-tertiary">プロフィールを見る</Link>
        <Link href="/me" className="inline-flex min-h-11 items-center px-2 text-tertiary">もっと書く（プロフィールへ）</Link>
      </div>
    </div>
  );
}
