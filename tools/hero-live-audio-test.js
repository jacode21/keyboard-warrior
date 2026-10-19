const {chromium,webkit}=require('playwright');
(async()=>{for(const [nm,bt] of [['chrome',()=>chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--autoplay-policy=no-user-gesture-required']})],['webkit',()=>webkit.launch()]]){
const b=await bt();const p=await b.newPage({viewport:{width:1300,height:850}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text())});
await p.goto('file:///workspace/keyboard-warrior/index.html');await p.click('#bHero');await p.waitForTimeout(300);
for(let ti=0;ti<3;ti++){
 await p.evaluate(ti=>{HERO.noFail=true;document.querySelectorAll('#hTracks button')[ti].click();document.querySelectorAll('#hDiff button')[2].click()},ti);
 await p.click('#hPlay');
 // hit every note, alternating 60ms early / 50ms late; record the scheduled audio time vs the note's beat time
 await p.evaluate(()=>{const H=HERO.H,K=HERO.LANEKEYS[H.c.lanes];window.__q=[];let i=0;const done=new Set();window.__kt=setInterval(()=>{const t=HERO.now();for(const n of H.c.notes){if(n.j||done.has(n.id))continue;const d=(i%2?.05:-.06);if(t<n.t+d)break;done.add(n.id);i++;
   const ct=HERO.ac.currentTime,th=HERO.now();dispatchEvent(new KeyboardEvent('keydown',{code:K[n.lane],bubbles:true}));if(n.j&&n.j!=='miss')window.__q.push({early:th<n.t-.005,dA:HERO.H.lastA-(H.t0+n.t),ahead:HERO.H.lastA-ct});if(!n.len)dispatchEvent(new KeyboardEvent('keyup',{code:K[n.lane],bubbles:true}))}
  for(const q of H.c.phrases){if(!q.j&&Math.abs(q.t-t)<.03)dispatchEvent(new KeyboardEvent('keydown',{code:'Space',bubbles:true}))}},5)});
 await p.waitForTimeout(16000);
 const r=await p.evaluate(()=>{clearInterval(window.__kt);const H=HERO.H,q=window.__q,E=q.filter(x=>x.early),L=q.filter(x=>!x.early);
  return{track:HERO.TRACKS[H.ti].id,ac:HERO.ac.state,hits:q.length,parts:[...new Set(H.c.notes.filter(n=>n.j&&n.j!=='miss').map(n=>n.part))].join(''),muted:H.R.mute.size,
   earlyOnBeat:E.every(x=>Math.abs(x.dA)<.004),earlyScheduledAheadMs:Math.round(1000*Math.min(...E.map(x=>x.ahead))),lateImmediate:L.every(x=>x.ahead<.01),cnt:H.cnt,phr:H.phr,ghosts:Object.keys(H.R.gh).length,handoffs:H.handoff||0}});
 console.log(nm,JSON.stringify(r));
 if(nm==='chrome'&&ti===0)await p.screenshot({path:'/workspace/keyboard-warrior/screenshot-hero-desktop.png'});
 const pr=await p.evaluate(async()=>{const R=HERO.H.R;HERO.pause();await new Promise(r=>setTimeout(r,300));const a=HERO.ac.state;HERO.resume();await new Promise(r=>setTimeout(r,2200));const b=HERO.ac.state;HERO.menu();return{paused:a,resumed:b,oldRunStopped:R.stopped}});console.log('  ',JSON.stringify(pr));
}
console.log(nm,'errors',JSON.stringify(errs));await b.close()}})();
