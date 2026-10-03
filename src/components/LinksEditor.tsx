import Icon from "@/components/Icon";
import { MAX_LINKS, linkName, normalizeLink } from "@/lib/links.mjs";

// SNS・リンクの入力。URL を貼るとサービス名が下に出る。読めない URL はその場で赤く出し、保存させない
export default function LinksEditor({ links, onChange }: { links: string[]; onChange: (links: string[]) => void }) {
  return (
    <fieldset className="space-y-2">
      <legend className="label">SNS・リンク</legend>
      <p className="text-sm text-fg-3">GitHub・X・Zenn などの URL を貼ってください（{MAX_LINKS}件まで）</p>
      {links.map((l, i) => {
        const url = normalizeLink(l);
        return (
          <div key={i} className="space-y-1">
            <div className="flex gap-2">
              <input className="input" inputMode="url" autoComplete="off" placeholder="https://github.com/yourname" value={l}
                aria-label={`リンク ${i + 1}`} aria-invalid={!!l.trim() && !url}
                onChange={(e) => onChange(links.map((x, j) => (j === i ? e.target.value : x)))} />
              <button type="button" className="btn shrink-0 px-3" aria-label={`リンク ${i + 1} を削除`} onClick={() => onChange(links.filter((_, j) => j !== i))}>
                <Icon name="trash" />
              </button>
            </div>
            {l.trim() && (url ? <p className="text-sm text-fg-3">{linkName(url)}</p> : <p role="alert" className="text-sm text-error">URL として読めません</p>)}
          </div>
        );
      })}
      {links.length < MAX_LINKS && (
        <button type="button" className="btn" onClick={() => onChange([...links, ""])}><Icon name="plus" />リンクを追加</button>
      )}
    </fieldset>
  );
}
