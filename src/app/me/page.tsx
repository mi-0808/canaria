"use client";
import Link from "next/link";
import { useState } from "react";
import Field from "@/components/Field";
import FilePicker from "@/components/FilePicker";
import Icon, { type IconName } from "@/components/Icon";
import LinksEditor from "@/components/LinksEditor";
import { Avatar } from "@/components/Portfolio";
import ShareButton from "@/components/ShareButton";
import Sheet from "@/components/Sheet";
import { ListSkeleton } from "@/components/Skeleton";
import { sectionInfo } from "@/lib/entries.mjs";
import { contactEmailPattern, normalizeLink } from "@/lib/links.mjs";
import { loadViewCount, profileChoices, saveProfile as putProfile, sections, useBusy, useLoad, usernamePattern, type Profile, type Section } from "@/lib/store";
import { SaveBar, useMyPortfolio } from "./parts";

// プロフィール（編集のトップ）。iOS の設定アプリのように、まとまりごとに行を並べ、押すとその項目だけの画面へ進む。
// 前は1つのシートに経歴まで詰めていて、長くてどこを直しているか分からなくなっていた

const profileSelects: [keyof typeof profileChoices, string][] = [
  ["gender", "性別"],
  ["age", "年齢"],
  ["location", "居住地"],
  ["mbti", "MBTI"],
];

// 行の左の小さいアイコン。色は欄の見分けだけ（面と文字はトークンのペア）
const sectionIcons: Record<Section, [IconName, string]> = {
  work: ["briefcase", "bg-tertiary-container text-on-tertiary-container"],
  learn: ["book", "bg-primary-container text-on-primary-container"],
  like: ["heart", "bg-secondary-container text-on-secondary-container"],
};

function RowIcon({ name, tone }: { name: IconName; tone: string }) {
  return <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone}`}><Icon name={name} className="h-4.5 w-4.5" /></span>;
}

export default function MyPage() {
  const { user, data, setData } = useMyPortfolio();
  const [profile, setProfile] = useState<Profile | null>(null); // 編集中だけ非null。シートの開閉もこれで決まる
  const [usernameError, setUsernameError] = useState(""); // 他の人と重なったときなど、保存で弾かれた理由
  const [saving, run] = useBusy();
  // 表示回数はプロフィールとは別に読む（届くのを待たずに画面を出す）
  const [views] = useLoad(() => user && loadViewCount(user.id), [user?.id]);

  if (!user || !data) return <ListSkeleton />;

  const p = data.profile;
  const editProfile = () => {
    setUsernameError("");
    setProfile(p);
  };
  const usernameInvalid = !!profile && !usernamePattern.test(profile.username);
  const linksInvalid = !!profile?.links.some((l) => l.trim() && !normalizeLink(l));
  const emailInvalid = !!profile?.contact_email.trim() && !contactEmailPattern.test(profile.contact_email.trim());
  const saveProfile = () =>
    run(async () => {
      // 空の行は捨て、https にそろえた形で保存する（DB の valid_links と同じ条件）
      const saved = { ...profile!, links: profile!.links.map(normalizeLink).filter((l): l is string => !!l), contact_email: profile!.contact_email.trim() };
      const err = await putProfile(user.id, saved);
      if (err) return setUsernameError(err);
      setData({ ...data, profile: saved });
      setProfile(null);
    });
  const count = (s: Section) => data.entries.filter((e) => e.section === s).length;

  return (
    <div data-grouped className="mx-auto max-w-xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">プロフィール</h1>

      <div className="group-box">
        <button className="group-row py-3" onClick={editProfile}>
          <Avatar src={p.icon} className="h-14 w-14" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-lg font-bold">{p.name || "名前未設定"}</span>
            <span className="block truncate text-sm text-fg-3">名前・ひとこと・連絡先・SNS</span>
          </span>
          <span className="sr-only">を編集</span>
          <Icon name="chevron" className="h-5 w-5 text-fg-3" />
        </button>
      </div>
      {/* 本人以外が公開ページを開いた回数（同じブラウザからは1日1回）。本人にしか見えない。押せる行と見分けるため hover は付けない */}
      <div className="group-box">
        <p className="flex min-h-13 items-center gap-3 px-4">
          <span className="flex-1">公開ページの表示回数</span>
          <span className="text-fg-3">{views === undefined ? "…" : `${views.toLocaleString()}回`}</span>
        </p>
      </div>
      {/* 共有はこの画面で一番してほしい行動なので濃いカナリア（この画面ではこれだけ）。見る方は薄い藍で並べる。
          ?preview で開くと、見る人と同じ見た目（ヘッダーなし、左上に戻るボタン）になる */}
      <div className="grid grid-cols-2 gap-3">
        <Link href={`/@${p.username}?preview`} className="btn-tonal">公開ページを見る</Link>
        <ShareButton variant="label" username={p.username} name={p.name} />
      </div>

      <section className="space-y-2">
        <h2 className="group-label">やってきたこと</h2>
        <nav aria-label="やってきたこと" className="group-box">
          {sections.map((s) => (
            <Link key={s} href={`/me/${s}`} className="group-row">
              <RowIcon name={sectionIcons[s][0]} tone={sectionIcons[s][1]} />
              <span className="flex-1">{sectionInfo[s].label}</span>
              <span className="text-fg-3">{count(s) || "まだない"}</span>
              <Icon name="chevron" className="h-5 w-5 text-fg-3" />
            </Link>
          ))}
        </nav>
      </section>

      <section className="space-y-2">
        <h2 className="group-label">つくったもの</h2>
        <nav aria-label="つくったもの" className="group-box">
          <Link href="/me/works" className="group-row">
            <RowIcon name="image" tone="bg-surface-2 text-fg-2" />
            <span className="flex-1">作品</span>
            <span className="text-fg-3">{data.works.length || "まだない"}</span>
            <Icon name="chevron" className="h-5 w-5 text-fg-3" />
          </Link>
        </nav>
      </section>

      <Sheet open={!!profile} onClose={() => setProfile(null)} dismissible={false} title="プロフィールを編集"
        footer={<SaveBar onCancel={() => setProfile(null)} onSave={saveProfile} disabled={usernameInvalid || linksInvalid || emailInvalid} saving={saving} />}>
        {profile && (
          <>
            <div className="space-y-1.5">
              <span className="label">アイコン</span>
              <FilePicker shape="round" value={profile.icon} onChange={(icon) => setProfile((p) => p && { ...p, icon })} />
            </div>
            <div className="space-y-1.5">
              <span className="label">カバー画像</span>
              <FilePicker shape="cover" value={profile.cover} onChange={(cover) => setProfile((p) => p && { ...p, cover })} />
              {/* 任意の項目なので、入れたあとで外せるようにする */}
              {profile.cover && <button className="btn" onClick={() => setProfile({ ...profile, cover: "" })}>カバー画像を外す</button>}
            </div>
            <Field label="ユーザー名 *">
              <span className="flex items-center gap-2">
                <span className="font-mono text-fg-3">/@</span>
                <input className="input font-mono" maxLength={20} value={profile.username} aria-invalid={!!usernameError || usernameInvalid}
                  onChange={(e) => { setProfile({ ...profile, username: e.target.value.toLowerCase() }); setUsernameError(""); }} />
              </span>
              {usernameError || usernameInvalid ? (
                <span role="alert" className="block text-sm text-error">{usernameError || "英小文字・数字・_ の3〜20文字で入力してください"}</span>
              ) : profile.username !== p.username ? (
                <span className="block text-sm text-warning">変えると、前の URL（/@{p.username}）は開けなくなります</span>
              ) : (
                <span className="block text-sm text-fg-3">公開ページの URL になります。英小文字・数字・_ の3〜20文字</span>
              )}
            </Field>
            {/* 名前とひとことを横に並べると「姓・名」に見えるので縦に積み、幅も変える */}
            <Field label="名前">
              <input className="input max-w-60" autoComplete="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </Field>
            <Field label="ひとこと">
              <input className="input" value={profile.tagline} onChange={(e) => setProfile({ ...profile, tagline: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              {profileSelects.map(([k, label]) => {
                const choices: readonly string[] = profileChoices[k];
                return (
                  <Field key={k} label={label}>
                    <select className="input" value={profile[k]} onChange={(e) => setProfile({ ...profile, [k]: e.target.value })}>
                      <option value="">未選択</option>
                      {/* 自由入力だった頃の値は消さずに残す */}
                      {profile[k] && !choices.includes(profile[k]) && <option>{profile[k]}</option>}
                      {choices.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                );
              })}
            </div>
            {/* MyHood の一言のような短い近況。公開ページで2枚のカードになる */}
            <Field label="いまやっていること" hint={`${profile.doing_now.length}/100`}>
              <textarea className="input" rows={2} maxLength={100} placeholder="家計簿アプリを運用しながら、決済まわりを勉強中"
                value={profile.doing_now} onChange={(e) => setProfile({ ...profile, doing_now: e.target.value })} />
            </Field>
            <Field label="これからやりたいこと" hint={`${profile.want_next.length}/100`}>
              <textarea className="input" rows={2} maxLength={100} placeholder="受託でフロントエンドの仕事を取りたい"
                value={profile.want_next} onChange={(e) => setProfile({ ...profile, want_next: e.target.value })} />
            </Field>
            <Field label="自己紹介" hint={`${profile.bio.length}/200`}>
              <textarea className="input" rows={4} maxLength={200} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
            </Field>
            <Field label="連絡用メールアドレス">
              <input type="email" inputMode="email" autoComplete="email" className="input" placeholder="you@example.com" value={profile.contact_email}
                aria-invalid={emailInvalid} onChange={(e) => setProfile({ ...profile, contact_email: e.target.value })} />
              {emailInvalid ? (
                <span role="alert" className="block text-sm text-error">メールアドレスの形で入力してください</span>
              ) : (
                <span className="block text-sm text-fg-3">公開ページに「メールで連絡」ボタンが出ます。誰でも見られるので、ログイン用と別のアドレスでも大丈夫です</span>
              )}
            </Field>
            <LinksEditor links={profile.links} onChange={(links) => setProfile({ ...profile, links })} />
          </>
        )}
      </Sheet>
    </div>
  );
}
