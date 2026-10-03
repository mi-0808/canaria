#!/bin/sh
# design.css で Tailwind 標準色を無効にしてあるため、bg-zinc-100 のような指定はビルドが通るのに
# 無音で色が付かない。気付けない失敗なので、人の注意に頼らずここで落とす。
# ponytail: 標準色の名前だけを見る。bg-primery のようなトークン名の打ち間違いは拾えない
palette='slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'
if grep -rnE "\b[a-z-]+-($palette)-[0-9]{2,3}\b|\b(bg|text|border|ring|from|to|via|fill|stroke|outline|decoration|divide|placeholder)-(black|white)\b" src; then
  echo "↑ Tailwind 標準色が使われています。src/app/design.css のトークン（bg-surface, text-fg-2 など）に置き換えてください" >&2
  exit 1
fi
