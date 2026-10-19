const pw=require('playwright');const U='file:///workspace/keyboard-warrior/index.html';let fails=0;const ok=(c,m)=>{if(!c){fails++;console.log('  FAIL',m)}else console.log('  ok',m)};
const key=(p,code)=>p.evaluate(c=>dispatchEvent(new KeyboardEvent('keydown',{code:c,key:c,bubbles:true,cancelable:true})),code);
(async()=>{for(const bt of ['chromium','webkit']){console.log(bt);const b=await pw[bt].launch(bt==='chromium'?{executablePath:'/usr/bin/google-chrome'}:{});
 let ctx=await b.newContext({viewport:{width:1300,height:850},reducedMotion:'reduce'});let p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(U);
 // KH: results -> R retries
 await p.evaluate(()=>{HERO.enter();HERO.noFail=true;HERO.start(0,1,{noAudio:true,lead:0})});await p.waitForTimeout(400);
 await p.evaluate(()=>{const H=HERO.H;HERO.setClock(()=>H.t0+H.c.len+1);HERO.update(HERO.now())});await p.waitForTimeout(1300);
 ok(await p.evaluate(()=>!$('hRes').classList.contains('hidden')&&/XP/.test($('hRes').textContent)),'KH results show XP block');
 await p.evaluate(()=>HERO.setClock(()=>performance.now()/1000));await key(p,'KeyR');await p.waitForTimeout(200);
 ok(await p.evaluate(()=>$('hRes').classList.contains('hidden')&&HERO.H&&!HERO.H.done),'KH R on results = instant retry');
 await p.evaluate(()=>HERO.exit());
 // WF: Enter on end screen = next task, R = retry
 await p.evaluate(()=>{setPlat('win');WF.enter();WF.load(1);['Alt>KeyA>KeyS>KeyA','Ctrl+Shift+KeyL','ArrowRight','ArrowRight','ArrowRight','ArrowRight','ArrowDown','Ctrl+Shift+ArrowDown','Ctrl+Shift+Digit5','ArrowRight','Ctrl+Digit0'].forEach(c=>WF.run(c))});
 await p.waitForTimeout(900);ok(await p.evaluate(()=>!$('wfEnd').classList.contains('hidden')&&/XP/.test($('wfEnd').textContent)),'WF end shows XP block');
 await key(p,'Enter');await p.waitForTimeout(100);ok(await p.evaluate(()=>$('wfEnd').classList.contains('hidden')&&/Comp|Sales|Blotter|.+/.test($('wfTitle').textContent)&&!WF.done),'WF Enter = next task');
 await p.evaluate(()=>WF.exit());
 // reduced motion: jackpot path w/o errors, no coin rain
 await p.evaluate(()=>{start();for(let i=0;i<5;i++){if(!st.pieces.length)spawn();submit(target().combo)}});ok(await p.evaluate(()=>document.querySelectorAll('.coin').length<=10),'reduced motion trims particles');
 ok(errs.length===0,'no page errors '+errs.join('|'));await ctx.close();
 if(bt==='webkit'){ // iPad emulation
  const dev=pw.devices['iPad Pro 11'];ctx=await b.newContext({...dev});p=await ctx.newPage();const e2=[];p.on('pageerror',e=>e2.push(e.message));await p.goto(U);await p.waitForTimeout(300);
  ok(await p.evaluate(()=>PLAT==='mac'),'iPad detected as Mac platform');
  await p.tap('#bStart');await p.waitForTimeout(300);ok(await p.evaluate(()=>st&&st.running&&getComputedStyle($('touch')).display!=='none'),'iPad: tap Play starts arcade + touch keys visible');
  const r=await p.evaluate(()=>{const tg=target();tg.combo='Meta+KeyB';const T=$('touch');[...T.querySelectorAll('button')].find(b=>b.title==='Meta').click();[...T.querySelectorAll('button')].find(b=>b.textContent==='B').click();return st.hits});ok(r===1,'iPad: ⌘+B via touch keys');
  ok(e2.length===0,'iPad no page errors '+e2.join('|'));await ctx.close()}
 await b.close()}process.exit(fails?1:0)})();
