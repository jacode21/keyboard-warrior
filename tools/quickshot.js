const {chromium}=require('playwright');
(async()=>{const url=process.argv[2],out=process.argv[3];const b=await chromium.launch({executablePath:'/usr/bin/google-chrome'});
for(const [n,v,m] of [['desktop',{width:1280,height:800},false],['mobile',{width:390,height:844},true]]){
 const c=await b.newContext({viewport:v,deviceScaleFactor:m?2:1,isMobile:m,hasTouch:m});const p=await c.newPage();
 await p.goto(url,{waitUntil:'networkidle'});await p.waitForTimeout(800);await p.screenshot({path:out+'-'+n+'-start.png'});
 if(n==='desktop'){const r=await p.evaluate(()=>{const e=document.getElementById('bHero').getBoundingClientRect(),d=document.getElementById('goals').getBoundingClientRect();return {hero:e.bottom,goals:d.bottom,vh:innerHeight}});console.log(n,JSON.stringify(r))}
 await c.close()}
await b.close()})();
