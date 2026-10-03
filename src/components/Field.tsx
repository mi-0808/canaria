/** ラベル付きの入力欄。label で包むので、ラベルを押しても入力欄にフォーカスが移る。hint は右上の小さな補足（文字数など） */
export default function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="flex justify-between">
        <span className="label">{label}</span>
        {hint && <span className="text-sm text-fg-3">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
