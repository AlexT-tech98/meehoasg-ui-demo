#!/usr/bin/env bash
set -euo pipefail
export CHROME_PATH="$(node -p "require('playwright').chromium.executablePath()")"
for version in baseline after; do
  if [ "$version" = baseline ]; then url='https://alext-tech98.github.io/meehoasg-ui-demo/baseline/'; else url='https://alext-tech98.github.io/meehoasg-ui-demo/'; fi
  for device in mobile desktop; do
    args=()
    if [ "$device" = desktop ]; then args+=(--preset=desktop); fi
    npx lighthouse "$url" --only-categories=performance --chrome-flags='--headless --no-sandbox' --output=json --output-path="evidence/lighthouse-${version}-${device}.json" --quiet "${args[@]}"
  done
done
node scripts/summarize-performance.mjs
