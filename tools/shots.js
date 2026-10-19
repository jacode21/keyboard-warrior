// usage: node shots.js before|after
const {chromium}=require('playwright');const tag=process.argv[2]||'before';const OUT='/workspace/keyboard-warrior/screenshots/polish/';
const BASE=process.env.BASE||'file:///workspace/keyboard-warrior/';const SITE=process.env.SITE??'site/';
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome'});const errs=[];
for(const [dev,vp,mob] of [['desktop',{width:1366,height:860},false],['mobile',{width:390,height:844},true]]){
 const ctx=await b.newContext({viewport:vp,deviceScaleFactor:mob?2:1,hasTouch:mob,isMobile:mob});
 const shot=async(p,name)=>{await p.waitForTimeout(350);await p.screenshot({path:`${OUT}${tag}-${dev}-${name}.png`})};
 const page=async(url,setup)=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(dev+' '+url+': '+e.message));await p.goto(BASE+url);await p.waitForTimeout(400);if(setup)await setup(p);return p};
 let p=await page('index.html',async p=>{await p.evaluate(()=>{localStorage.clear();localStorage.kwName='Jacob'})});await p.reload();await p.waitForTimeout(500);await shot(p,'1-start');
 await p.evaluate(()=>{document.querySelector('#bStart').click()});await p.waitForTimeout(2600);
 await p.evaluate(()=>{const tg=st.pieces[0];if(tg){const e=new KeyboardEvent('keydown',{code:tg.combo.split('+').pop(),ctrlKey:tg.combo.includes('Ctrl'),altKey:tg.combo.startsWith('Alt+'),shiftKey:tg.combo.includes('Shift'),metaKey:tg.combo.includes('Meta'),bubbles:true,cancelable:true});dispatchEvent(e)}});
 await p.waitForTimeout(1800);await shot(p,'2-arcade-play');
 await p.evaluate(()=>{st.score=2350;st.bestCombo=7;st.jackpots=1;st.hits=14;st.wrong=2;end('TIME!')});await p.waitForTimeout(900);await shot(p,'3-arcade-end');
 await p.evaluate(()=>{$('ovEnd').classList.add('hidden');WF.enter()});await shot(p,'4-workflow-menu');
 await p.evaluate(()=>{WF.load(0);['Ctrl+Home','Shift+ArrowRight','Shift+ArrowRight','Shift+ArrowRight','Ctrl+KeyB','ArrowDown','ArrowRight'].forEach(c=>WF.run(c))});await shot(p,'5-workflow-task');
 await p.evaluate(()=>{['Ctrl+Shift+ArrowRight','Ctrl+Shift+ArrowDown','Shift+ArrowDown','Alt+Equal','Shift+ArrowUp','Ctrl+Shift+Digit4','Ctrl+KeyA','Alt>KeyH>KeyB>KeyA','Ctrl+Home','ArrowDown','Alt>KeyW>KeyF>KeyF','Alt>KeyH>KeyO>KeyI'].forEach(c=>WF.run(c))});await p.waitForTimeout(900);await shot(p,'6-workflow-end');
 await p.evaluate(()=>{WF.exit();HERO.enter()});await shot(p,'7-hero-menu');
 await p.evaluate(()=>{HERO.noFail=true;HERO.start(0,1,{noAudio:true,lead:0})});await p.waitForTimeout(7000);await shot(p,'8-hero-play');
 await p.evaluate(()=>{const H=HERO.H;H.c.notes.slice(0,40).forEach(n=>{n.j='perfect';H.cnt.perfect++});H.score=18450;H.maxStreak=40;HERO.setClock(()=>H.t0+H.c.len+1);HERO.update(HERO.now())});await p.waitForTimeout(800);await shot(p,'9-hero-results');
 await p.close();
 for(const pg of ['about','privacy','terms']){const q=await page(SITE+pg+'.html');await shot(q,'10-'+pg);await q.close()}
 await ctx.close()}
console.log('errors',JSON.stringify(errs));await b.close()})();
