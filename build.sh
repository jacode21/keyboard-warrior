#!/usr/bin/env bash
# Build the deployable site into ./dist (game + static pages + SEO assets).
# ads.txt: only shipped when ADS.publisherId is set in index.html. Never publish a fake ID.
# The line Google expects (filled in by set-adsense.sh):
#   google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
set -euo pipefail
cd "$(dirname "$0")"
rm -rf dist && mkdir -p dist
cp index.html dist/
cp site/*.html site/*.png site/*.svg site/*.ico site/robots.txt site/sitemap.xml dist/
mkdir -p dist/fonts && cp site/fonts/*.woff2 dist/fonts/
PUB=$(grep -oP "publisherId:\s*'\Kca-pub-\d+(?=')" index.html || true)
if [[ -n "$PUB" ]]; then echo "google.com, ${PUB#ca-}, DIRECT, f08c47fec0942fa0" > dist/ads.txt; echo "ads.txt -> ${PUB#ca-}"
else echo "ads.txt omitted (ADS.publisherId empty)"; fi
echo "Built $(ls dist | wc -l) files in dist/"
