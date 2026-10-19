const {chromium,webkit,devices}=require('playwright');
const BASE=process.env.BASE||'http://localhost:8787/';const SHOT=process.env.SHOT||'';
const res=[];const ok=(n,c,x)=>{res.push((c?'ok ':'FAIL ')+n+(c?'':' '+JSON.stringify(x||'')));};
(async()=>{for(const [nm,bt,dev] of [['iphone13-webkit',()=>webkit.launch(),devices['iPhone 13']],['pixel7-chrome',()=>chromium.launch({executablePath:'/usr/bin/google-chrome'}),devices['Pixel 7']]]){
 const b=await bt();const ctx=await b.newContext({...dev});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(BASE,{waitUntil:'networkidle'});await p.waitForTimeout(400);
 const ov=async(tag)=>{const r=await p.evaluate(()=>{const vw=innerWidth,bad=[];document.querySelectorAll('body *').forEach(e=>{const s=getComputedStyle(e);if(s.display==='none'||s.visibility==='hidden'||s.position==='fixed'||e.closest('#toasts'))return;let a=e.parentElement,clip=false;while(a&&a!==document.body){const o=getComputedStyle(a).overflowX;if(o==='auto'||o==='scroll'||o==='hidden'){const ar=a.getBoundingClientRect();if(ar.right<=vw+1){clip=true;break}}a=a.parentElement}if(clip)return;const r=e.getBoundingClientRect();if(r.width&&r.right>vw+1&&!e.closest('#marquee,.tape,#ticker'))bad.push((e.id||e.className||e.tagName)+':'+Math.round(r.right))});return{sw:document.documentElement.scrollWidth,vw,bad:bad.slice(0,5)}});ok(nm+' '+tag+' no horizontal overflow',r.sw<=r.vw+1&&!r.bad.length,r)};
 await ov('start');if(SHOT)await p.screenshot({path:SHOT+'mobile-'+nm+'-1-start.png'});
 // ARCADE via Quick Pick taps
 await p.tap('#bStart');await p.waitForTimeout(300);
 const vis=await p.evaluate(()=>{const q=document.getElementById('qp'),f=document.getElementById('field');const qr=q.getBoundingClientRect(),fr=f.getBoundingClientRect();return{qp:getComputedStyle(q).display,qb:qr.bottom,ih:innerHeight,fh:fr.height,ft:fr.top,btn:q.children.length}});
 ok(nm+' arcade quick pick visible, field above it, fits viewport',vis.qp==='grid'&&vis.btn===4&&vis.qb<=vis.ih+1&&vis.fh>=180,vis);
 let hits=0;const tEnd=Date.now()+30000;for(let i=0;i<200&&hits<12&&Date.now()<tEnd;i++){const c=await p.evaluate(()=>{const tg=target();if(!tg)return null;const b=[...document.querySelectorAll('#qp button')].find(x=>x.dataset.c===tg.combo);if(!b)return 'nobtn';const r=b.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]});
  if(!c){await p.waitForTimeout(150);continue}if(c==='nobtn'){ok(nm+' correct answer offered',false);break}const h0=await p.evaluate(()=>st.hits);await p.touchscreen.tap(c[0],c[1]);await p.waitForTimeout(120);if(await p.evaluate(()=>st.hits)>h0)hits++}
 ok(nm+' arcade: 10+ fills by tapping Quick Pick',hits>=10,hits);
 if(SHOT)await p.screenshot({path:SHOT+'mobile-'+nm+'-2-arcade-pick.png'});
 // keypad mode: build combo
 await p.evaluate(()=>{document.querySelector('#touch .tmode').click()});await p.waitForTimeout(150);
 let kh=0,kt=0;const kEnd=Date.now()+30000;for(let i=0;i<200&&kt<4&&Date.now()<kEnd;i++){const plan=await p.evaluate(()=>{const tg=target();if(!tg)return null;const parts=String(tg.combo).split(/[+>]/);return{combo:tg.combo,parts,seq:tg.combo.includes('>')}});if(!plan){await p.waitForTimeout(150);continue}kt++;
  const h0=await p.evaluate(()=>st.hits);
  for(const t of plan.parts){if(/^(Ctrl|Alt|Shift|Meta)$/.test(t)&&!plan.seq){await p.evaluate(m=>{[...document.querySelectorAll('#touch .mod')].find(x=>x.title===m).click()},t)}else if(t==='Alt'&&plan.seq){await p.evaluate(()=>seqStart())}else{const r=await p.evaluate(c=>{const b=[...document.querySelectorAll('#touch .row.ctx button')].find(x=>x.dataset.c===c);if(!b)return null;const q=b.getBoundingClientRect();return[q.left+q.width/2,q.top+q.height/2]},t);if(!r){ok(nm+' ctx key offered '+t,false,plan);break}await p.touchscreen.tap(r[0],r[1]);await p.waitForTimeout(60)}}
  await p.waitForTimeout(100);if(await p.evaluate(()=>st.hits)>h0)kh++;else console.log('kp miss',JSON.stringify(plan))}
 ok(nm+' arcade: keypad builds combos (3+/4)',kh>=3,kh);if(SHOT)await p.screenshot({path:SHOT+'mobile-'+nm+'-3-arcade-keypad.png'});
 await p.evaluate(()=>{document.querySelector('#touch .tmode').click();st.time=.01});await p.waitForTimeout(1200);
 ok(nm+' arcade round ends on ticket',await p.evaluate(()=>!document.getElementById('ovEnd').classList.contains('hidden')));await ov('results');if(SHOT)await p.screenshot({path:SHOT+'mobile-'+nm+'-4-results.png'});
 // KEYBOARD HERO tap lanes
 await p.evaluate(()=>{showMenu&&showMenu();document.getElementById('bHero').click()});await p.waitForTimeout(300);await ov('kh menu');
 await p.evaluate(()=>{HERO.noFail=true});await p.tap('#hPlay');await p.waitForTimeout(500);
 const kres=await p.evaluate(async()=>{const H=HERO.H,cv=document.getElementById('hCv'),r=cv.getBoundingClientRect();let tapped=0;const end=performance.now()+9000;
  while(performance.now()<end){const t=HERO.now();const n=H.c.notes.find(n=>!n.j&&Math.abs(n.t-t)<.03);if(n){const g={n:H.c.lanes};const lw=Math.min(r.width*.92/g.n,120),x0=(r.width-lw*g.n)/2;const x=r.left+x0+(n.lane+.5)*lw,y=r.top+r.height*.6;
    const o={pointerId:1+tapped,clientX:x,clientY:y,bubbles:true,cancelable:true,pointerType:'touch',isPrimary:true};cv.dispatchEvent(new PointerEvent('pointerdown',o));await new Promise(z=>setTimeout(z,n.len?n.len*1000:40));cv.dispatchEvent(new PointerEvent('pointerup',o));tapped++}
   const ph=H.c.phrases.find(p=>!p.j&&Math.abs(p.t-t)<.03);if(ph)document.getElementById('hDollarB').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true,pointerType:'touch'}));
   await new Promise(z=>setTimeout(z,8))}
  const c=H.cnt;return{tapped,hit:c.perfect+c.great+c.good,miss:c.miss,dollarVis:getComputedStyle(document.getElementById('hDollarB')).display,cvH:r.height,ih:innerHeight}});
 ok(nm+' KH: tapped lanes land notes (80%+ of taps)',kres.tapped>5&&kres.hit>=kres.tapped*.8&&kres.dollarVis!=='none',kres);
 if(SHOT)await p.screenshot({path:SHOT+'mobile-'+nm+'-5-kh-play.png'});
 await p.evaluate(()=>{HERO.exit()});
 // WORKFLOW with keypad
 await p.evaluate(()=>{document.getElementById('bWorkflow').click()});await p.waitForTimeout(300);await ov('workflow menu');
 await p.evaluate(()=>WF.load(0));await p.waitForTimeout(200);
 const wf=await p.evaluate(()=>{const t=document.getElementById('touch');const r=t.getBoundingClientRect();const keys=[...t.querySelectorAll('.full button')].filter(b=>getComputedStyle(b).display!=='none').length;return{disp:getComputedStyle(t).display,bottom:r.bottom,ih:innerHeight,keys}});
 ok(nm+' workflow keypad visible + fits',wf.disp!=='none'&&wf.keys>10&&wf.bottom<=wf.ih+2,wf);
 const nx=await p.evaluate(()=>{const g=document.getElementById('wfGridWrap').getBoundingClientRect(),l=document.querySelector('#wfChecks li:not(.done)').getBoundingClientRect(),t=document.getElementById('touch').getBoundingClientRect();return{gridH:g.height,nextBottom:l.bottom,keypadTop:t.top}});
 ok(nm+' workflow: sheet + next job step both visible above the keypad',nx.gridH>=150&&nx.nextBottom<=nx.keypadTop+1,nx);
 // tap Shift + → via keypad
 const moved=await p.evaluate(async()=>{const t=document.getElementById('touch');const k0=document.getElementById('wfKeys').textContent;t.classList.add('more');const r=[...t.querySelectorAll('.full button')].find(b=>b.dataset.c==='ArrowRight');r.click();await new Promise(z=>setTimeout(z,50));return{k0,k1:document.getElementById('wfKeys').textContent,name:document.getElementById('wfName').textContent}});
 ok(nm+' workflow: keypad drives the sheet',moved.k1!==moved.k0,moved);await ov('workflow task');
 if(SHOT)await p.screenshot({path:SHOT+'mobile-'+nm+'-6-workflow.png'});
 ok(nm+' no page errors',!errs.length,errs);await b.close()}
 res.forEach(r=>console.log(r));console.log(res.filter(r=>r.startsWith('FAIL')).length?'MOBILE FAIL':'MOBILE PASS')})();
