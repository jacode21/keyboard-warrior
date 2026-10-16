#!/usr/bin/env bash
# Build and deploy to Cloudflare Pages (project keyboard-warrior). Needs CLOUDFLARE_API_TOKEN in env.
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
"$DIR/build.sh"
cd /tmp/kwproj && CLOUDFLARE_ACCOUNT_ID=23d415421b079dc880d035682413f993 ./node_modules/.bin/wrangler pages deploy "$DIR/dist" --project-name keyboard-warrior --branch main --commit-dirty=true
