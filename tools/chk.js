const {chromium}=require('playwright');(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome'});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///workspace/keyboard-warrior/index.html');
console.log(await p.evaluate(()=>JSON.stringify([0,1,2].map(ti=>[0,1,2,3].map(di=>{const c=HERO.genChart(ti,di);return [c.notes.length,c.notes.filter(n=>n.len>0).length,c.notes.filter(n=>n.chord).length,c.notes.filter(n=>n.part==='l').length,c.phrases.length]})))));console.log(errs);await b.close()})();
