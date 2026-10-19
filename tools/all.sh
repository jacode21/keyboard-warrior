#!/bin/bash
# full suite: KH (t9) + Arcade/Workflow (aw) + extra + mobile + live API (preview)
cd /workspace/kw-tools
python3 -c "
s=open('/workspace/keyboard-warrior/index.html').read();f=open('/workspace/keyboard-warrior/tools/hero-tests.html.fragment').read()
i=s.rindex('</body>');open('test.html','w').write(s[:i]+f+s[i:])"
(curl -s -o /dev/null localhost:8787/ || (cd /workspace/keyboard-warrior/dist && nohup python3 -m http.server 8787 >/dev/null 2>&1 &)); sleep 1
echo "== t9"; timeout 400 node t9run.js 2>&1 | tail -4
echo "== aw"; timeout 400 node aw-tests.js 2>&1 | grep -E "FAIL|passed"
echo "== extra"; timeout 300 node extra-tests.js > /tmp/x 2>&1; echo "ok $(grep -cE "^  ok" /tmp/x) fail $(grep -cE "^ *FAIL" /tmp/x)"
echo "== mobile"; timeout 400 node mobile-tests.js > /tmp/m 2>&1; grep -E "FAIL|PASS|Error" /tmp/m | head -8
[ -n "$API" ] && { echo "== api"; timeout 250 node api-tests.js 2>&1 | grep -E "FAIL|PASS"; }
echo SUITE_DONE
