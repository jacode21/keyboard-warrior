#!/bin/bash
# prod deploy: build, merge polish->main, push, wrangler --branch main, verify. Token comes from env; never echoed.
set -e
cd /workspace/keyboard-warrior && ./build.sh >/dev/null
git checkout -q main && git merge -q --no-ff polish -m "${1:-Merge polish}" && git push -q origin main && git checkout -q polish
cd /workspace/kw-deploy && rm -rf functions && cp -r /workspace/keyboard-warrior/functions functions
CLOUDFLARE_ACCOUNT_ID=23d415421b079dc880d035682413f993 timeout 150 ./node_modules/.bin/wrangler pages deploy /workspace/keyboard-warrior/dist --project-name keyboard-warrior --branch main --commit-dirty=true 2>&1 | grep -iE "complete|error"
sleep 8; MARK="${MARK:-window.KWX=KWX}" /workspace/keyboard-warrior/tools/verify.sh
