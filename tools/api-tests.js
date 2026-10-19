const {chromium,webkit}=require('playwright');const BASE=process.env.BASE||'https://preview.keyboard-warrior-4cw.pages.dev/';
const out=[];const ok=(n,c,x)=>out.push((c?'ok ':'FAIL ')+n+(c?'':' '+JSON.stringify(x||'')));
(async()=>{await Promise.all([['chrome',()=>chromium.launch({executablePath:'/usr/bin/google-chrome'})],['webkit',()=>webkit.launch()]].map(async([nm,bt])=>{const b=await bt();const p=await (await b.newContext()).newPage();const errs=[];p.on('pageerror',e=>{if(!/cloudflareinsights/.test(e.message))errs.push(e.message)});
 await p.goto(BASE,{waitUntil:'networkidle'});
 // DUEL (client side): play seeded session, build link, open it, compare prompts + ghost + verdict
 const d=await p.evaluate(()=>{localStorage.kwName='Jacob';start();const names=[st.queue.map(q=>q[0]).join('|')];st.score=1500;for(let i=0;i<=60;i++)st.trace[i]=i*25;const seed=st.seed;end('');return{link:KWX.duelLink(),seed,names}});
 const p2=await (await b.newContext()).newPage();await p2.goto(d.link.replace('https://www.playkeyboardwarrior.com/',BASE),{waitUntil:'networkidle'});
 const d2=await p2.evaluate(()=>({banner:document.getElementById('chBanner').textContent,du:!!KWX.DU}));ok(nm+' duel link opens with banner',d2.du&&/Jacob/.test(d2.banner),d2);
 const d3=await p2.evaluate(async()=>{document.getElementById('bTakeDuel').click();const q=st.queue.map(q=>q[0]).join('|');st.time=30;st.score=200;hud();const g=document.getElementById('ghost');const gt=g.textContent,vis=!g.classList.contains('hidden');st.score=2000;end('');await new Promise(r=>setTimeout(r,100));return{q,seed:st.seed,gt,vis,stamp:document.getElementById('eStamp').textContent,title:document.getElementById('endTitle').textContent,back:!!document.getElementById('bBack')}});
 ok(nm+' duel uses the same tape (seed + first prompts)',d3.seed===d.seed&&d3.q===d.names[0],{d3,d});ok(nm+' ghost ticker shows vs. JACOB',d3.vis&&/VS\. JACOB/i.test(d3.gt)&&/750/.test(d3.gt),d3.gt);
 ok(nm+' duel verdict: WIN stamp + margin + Send it back',/win/i.test(d3.stamp)&&/beat Jacob/i.test(d3.title)&&d3.back,d3);
 // BIG BOARD: signed run, real 56s wait, submit, rank shown
 await p.evaluate(()=>{showMenu();localStorage.kwName='QA Bot '+Math.floor(Math.random()*99);start()});await p.waitForFunction(()=>st.run&&st.run.sig,null,{timeout:8000}).catch(()=>{});
 const hasRun=await p.evaluate(()=>!!(st.run&&st.run.sig));ok(nm+' signed run token issued',hasRun);
 await p.evaluate(()=>{pause(true)});await p.waitForTimeout(56500);
 const r=await p.evaluate(async()=>{pause(false);st.score=1234;st.hits=14;st.bestCombo=6;end('');await new Promise(r=>setTimeout(r,50));document.getElementById('bPost').click();for(let i=0;i<60;i++){await new Promise(r=>setTimeout(r,150));if(/#\d+|Filed|offline|rejected|Too many/i.test(document.getElementById('eRank').textContent))break}return document.getElementById('eRank').textContent});
 ok(nm+' submit → rank on ticket ("#N on the Street today")',/#\d+ on the Street today/.test(r),r);
 const bb=await p.evaluate(async()=>{KWX.board('arcade');for(let i=0;i<40;i++){await new Promise(r=>setTimeout(r,150));if(document.querySelectorAll('#bbT tr').length&&!/Loading/.test(document.getElementById('bbT').textContent))break}return{rows:document.querySelectorAll('#bbT tr').length,txt:document.getElementById('bbT').textContent.slice(0,120)}});
 ok(nm+' Big Board lists the filed run',bb.rows>=1&&/QA Bot/.test(bb.txt),bb);
 const replay=await p.evaluate(async()=>{const j=await KWX.post({run:st.run,score:1234,input:'kbd',hits:14,bestCombo:6},'arcade','',{hits:14,acc:90,combo:6});return j});
 ok(nm+' replayed run id rejected',replay&&!replay.ok&&/already|Too many/i.test(replay.error),replay);
 ok(nm+' no page errors',!errs.length,errs);await b.close()}));
 out.forEach(x=>console.log(x));console.log(out.some(x=>x.startsWith('FAIL'))?'API FAIL':'API PASS')})();
