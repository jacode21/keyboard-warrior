#!/usr/bin/env bash
# Usage: ./set-adsense.sh ca-pub-1234567890123456 [bannerSlot] [interstitialSlot]
# Sets ADS config in index.html, adds the AdSense verification <script> to every page's <head>,
# writes ads.txt (via build.sh), commits + pushes source, and redeploys to Cloudflare Pages.
set -euo pipefail
cd "$(dirname "$0")"
PUB="${1:-}"; BANNER="${2:-}"; INTER="${3:-}"
[[ "$PUB" =~ ^ca-pub-[0-9]{16}$ ]] || { echo "Usage: $0 ca-pub-<16 digits> [bannerSlot] [interstitialSlot]"; exit 1; }
[[ -z "$BANNER" || "$BANNER" =~ ^[0-9]+$ ]] || { echo "bannerSlot must be numeric"; exit 1; }
[[ -z "$INTER"  || "$INTER"  =~ ^[0-9]+$ ]] || { echo "interstitialSlot must be numeric"; exit 1; }
sed -i -E "s|const ADS = \{[^}]*\};|const ADS = { publisherId: '$PUB', bannerSlot: '$BANNER', interstitialSlot: '$INTER' };|" index.html
SNIP="<script async src=\"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=$PUB\" crossorigin=\"anonymous\"></script>"
for f in index.html site/privacy.html site/terms.html site/about.html; do
  # replace marker or any previous AdSense head snippet
  perl -0pi -e "s#<script async src=\"https://pagead2\.googlesyndication\.com/pagead/js/adsbygoogle\.js\?client=[^\"]*\" crossorigin=\"anonymous\"></script>|<!--ADSENSE-HEAD-->#$SNIP#" "$f"
  grep -q "client=$PUB" "$f" || { echo "failed to add snippet to $f"; exit 1; }
done
echo "google.com, ${PUB#ca-}, DIRECT, f08c47fec0942fa0" > site/ads.txt.ref   # reference copy; build.sh generates dist/ads.txt
./build.sh
git add -A && git commit -m "Configure AdSense $PUB" && git push || echo "(git commit/push skipped or failed)"
./deploy.sh
echo "Done. Verify: curl -s https://www.playkeyboardwarrior.com/ads.txt"
