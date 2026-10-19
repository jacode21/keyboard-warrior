#!/bin/bash
# post-deploy production check (no secrets)
for u in https://playkeyboardwarrior.com/ https://www.playkeyboardwarrior.com/; do code=$(curl -sL -o /tmp/v.html -w "%{http_code}" "$u?v=$RANDOM"); echo "$u $code build:$(grep -c "${MARK:-window.KWX=KWX}" /tmp/v.html) adsense:$(grep -c 'adsbygoogle.js?client=ca-pub-8691277458084963' /tmp/v.html) api:$(curl -s ${u}api/health)"; done
echo "ads.txt: $(curl -sL https://playkeyboardwarrior.com/ads.txt)"
echo "stats page noindex: $(curl -sL https://playkeyboardwarrior.com/stats.html | grep -c noindex)  sitemap mentions stats: $(curl -s https://playkeyboardwarrior.com/sitemap.xml | grep -c stats)"
