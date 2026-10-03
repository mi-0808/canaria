// 見出しを単語（文節）の途中で折り返さないための部品。"|" で区切ったまとまりごとに inline-block にする。
// Chrome / Edge は design.css の word-break: auto-phrase で自動でも区切られるが、Safari は未対応なので見出しはこれで指定する
export default function Phrases({ text }: { text: string }) {
  return text.split("|").map((p, i) => <span key={i} className="inline-block">{p}</span>);
}
