"use client";
// ponytail: localStorage only (single user, ~5MB incl. images). Swap this file for Supabase later.
import { useEffect, useState } from "react";

export type Profile = {
  name: string;
  icon: string;
  gender: string;
  age: string;
  location: string;
  company: string;
  years: string;
  mbti: string;
  tagline: string;
  bio: string;
};

export type Work = {
  id: string;
  image: string;
  title: string;
  period: string;
  role: string;
  status: WorkStatus;
  techs: string; // カンマ区切り
  summary: string;
  url: string;
};

export const workStatuses = ["企画中", "開発中", "ベータ公開", "リリース・運用中"] as const;
export type WorkStatus = (typeof workStatuses)[number];

export type Reply = { id: string; body: string; createdAt: number };
export type Post = {
  id: string;
  body: string;
  media?: { kind: "audio" | "video"; src: string };
  createdAt: number;
  reacted: boolean;
  saved: boolean;
  replies: Reply[];
};

// 開発環境（仕事場）のアイテム。url は将来アフィリエイトリンクに差し替え可能
export const gearCategories = { machine: "💻", keyboard: "⌨️", display: "🖥", mouse: "🖱", audio: "🎧", other: "🧰" } as const;
// comment は「これいいよ」のひとこと。購入のきっかけになる部分
export type Gear = { id: string; category: keyof typeof gearCategories; name: string; comment: string; url: string };

export type Data = { profile: Profile; works: Work[]; gear: Gear[]; posts: Post[] };

// タイムラインを見るのに必要なプロフィール項目
export const requiredProfile: [keyof Profile, string][] = [["name", "名前"], ["icon", "アイコン"], ["tagline", "ひとこと"]];
export const missingProfile = (p: Profile) => requiredProfile.filter(([k]) => !p[k]).map(([, label]) => label);

const KEY = "canaria";
const empty: Data = {
  profile: { name: "", icon: "", gender: "", age: "", location: "", company: "", years: "", mbti: "", tagline: "", bio: "" },
  works: [],
  gear: [],
  posts: [],
};

export const newId = () => crypto.randomUUID();

export function useData() {
  const [data, setData] = useState<Data>(empty);
  const [ready, setReady] = useState(false);

  // localStorageはクライアントでしか読めないため、マウント後に読み込む
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const raw = localStorage.getItem(KEY);
    if (raw) setData({ ...empty, ...JSON.parse(raw) });
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const save = (next: Data) => {
    setData(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      alert("保存容量の上限に達しました。画像を小さくしてください。");
    }
  };

  return { data, save, ready };
}

export const readFile = (file: File) =>
  new Promise<string>((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.readAsDataURL(file);
  });
