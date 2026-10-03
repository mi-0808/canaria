#!/usr/bin/env bash
# Claude が応答を終えたタイミングで npm run check を走らせる。
# 「作業完了前に npm run check」と規約に書いても忘れるときは忘れる。人を縛るより構造で止める。
# 失敗したら decision:block で Claude に差し戻す。stop_hook_active のとき（差し戻し直後）は無限ループ防止で抜ける。

set -uo pipefail

INPUT=$(cat)
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if [ "$(printf '%s' "$INPUT" | jq -r '.stop_hook_active // false')" = "true" ]; then
  exit 0
fi

# node_modules が無い状態（clone 直後など）では黙って抜ける
[ -d "$ROOT/node_modules" ] || exit 0

if OUTPUT=$(cd "$ROOT" && npm run check 2>&1); then
  exit 0
fi

# 末尾40行だけ返す。全部返すとコンテキストを食う
jq -n --arg out "$(printf '%s' "$OUTPUT" | tail -40)" \
  '{decision:"block", reason:("npm run check が失敗しました。修正してから終了してください。\n\n" + $out)}'
