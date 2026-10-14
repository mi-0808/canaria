import { byNewest } from "./entries.mjs";
import type { Entry, Profile } from "./store";

// LP と /demo で見せる見本の人。架空の人物で、DB には入れない。
// 本番に見本のアカウントを作ると「さがす」の人数に混ざり、実在の人と見分けがつかなくなるため、固定のデータで描く

export const demoProfile: Profile = {
  username: "kana",
  name: "山田 カナ",
  icon: "",
  cover: "",
  gender: "",
  age: "20代前半",
  location: "東京都",
  mbti: "ENFP",
  tagline: "カフェで働きながら、フィルムで街を撮っている大学生",
  doing_now: "大学2年。カフェのバイトと、写真サークル",
  want_next: "撮りためた写真で、小さな展示をひらく",
  bio: "",
  links: [],
  contact_email: "",
  role: "大学生・専門学生",
  fields: ["接客", "クリエイター"],
};

/** 見本の1件。書かなかった項目は空にする（LP の③でも使う） */
export const entry = (e: Partial<Entry> & Pick<Entry, "id" | "section" | "title">): Entry => ({
  kind: "", place: "", note: "", started: null, started_month: null, ended: null, ended_month: null, current: false, image: "", ...e,
});

export const demoEntries: Entry[] = [
  entry({ id: "w1", section: "work", kind: "バイト", title: "駅前のカフェ", started: 2025, started_month: 5, current: true, note: "朝のシフトリーダー。新しく入った人にラテアートを教えています" }),
  entry({ id: "w2", section: "work", kind: "ボランティア", title: "高校の文化祭実行委員", started: 2023, started_month: 6, ended: 2023, ended_month: 9, note: "模擬店40店の取りまとめ" }),
  entry({ id: "l1", section: "learn", kind: "school", title: "東京の大学（文学部）", started: 2025, started_month: 4, current: true }),
  entry({ id: "l2", section: "learn", kind: "skill", title: "ラテアート", place: "バイト先の先輩に", started: 2025, note: "ハートとリーフまで描けます" }),
  entry({ id: "l3", section: "learn", kind: "skill", title: "トランペット", place: "高校の吹奏楽部", started: 2021, note: "3年間、定期演奏会でソロも" }),
  entry({ id: "k1", section: "like", title: "フィルムカメラ", started: 2022, note: "休みの日は街を撮り歩く" }),
  entry({ id: "k2", section: "like", title: "古着", note: "下北沢で探すのが好き" }),
  entry({ id: "k3", section: "like", title: "喫茶店めぐり", note: "固めのプリンがあるお店" }),
].sort(byNewest);
