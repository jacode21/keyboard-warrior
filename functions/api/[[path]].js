// Keyboard Warrior API (Cloudflare Pages Functions + KV binding KW_LB, secret LB_SECRET).
// Leaderboards (all-time / week / day, per mode + board, optional desk code), signed runs, rate limits,
// and anonymous aggregated event counts. No accounts; IPs are only ever stored as a salted hash prefix.
const J=(o,s=200,h={})=>new Response(JSON.stringify(o),{status:s,headers:{'content-type':'application/json','cache-control':'no-store',...h}});
const enc=new TextEncoder();
async function hmac(key,msg){const k=await crypto.subtle.importKey('raw',enc.encode(key),{name:'HMAC',hash:'SHA-256'},false,['sign']);const s=await crypto.subtle.sign('HMAC',k,enc.encode(msg));return [...new Uint8Array(s)].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function sha(s){const d=await crypto.subtle.digest('SHA-256',enc.encode(s));return [...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,'0')).join('').slice(0,16)}
const etDate=(t=Date.now())=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York'}).format(new Date(t));
const isoWeek=(t=Date.now())=>{const d=new Date(etDate(t)+'T12:00:00Z');const day=(d.getUTCDay()+6)%7;d.setUTCDate(d.getUTCDate()-day+3);const y=d.getUTCFullYear(),w1=new Date(Date.UTC(y,0,4));return y+'-W'+String(1+Math.round(((d-w1)/864e5-3+((w1.getUTCDay()+6)%7))/7)).padStart(2,'0')};
// modes: arcade (60s), daily (60s, board = daily number), hero (board = track id, duration from chart), wf (board = task id; lower time is better -> we rank by score = efficiency points)
const MODES={arcade:{min:55,max:400},daily:{min:55,max:400},hero:{min:40,max:600},wf:{min:4,max:3600},duel:{min:55,max:400}};
const BAD=['fuck','shit','cunt','nigg','fag','bitch','dick','cock','pussy','whore','slut','rape','nazi','hitler','retard','kike','spic','chink','twat','wank'];
function cleanName(n){n=String(n||'').normalize('NFKC').replace(/[^\p{L}\p{N} ._\-']/gu,'').replace(/\s+/g,' ').trim().slice(0,16);const flat=n.toLowerCase().replace(/[^a-z]/g,'').replace(/0/g,'o');if(!n||BAD.some(b=>flat.includes(b)))return 'Anon Trader';return n}
const cleanDesk=d=>String(d||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,12);
const cleanBoard=b=>String(b||'').toLowerCase().replace(/[^a-z0-9\-]/g,'').slice(0,24);
// generous but real ceilings: points per fill are capped by the game rules (base 100 x speed 2 x streak bonus + 500/5-fill jackpot)
function maxScore(mode,s){const hits=Math.max(0,Math.min(400,s.hits|0));
 if(mode==='hero')return (s.notes|0)*100*8+(s.drops|0)*500*8+20000;
 if(mode==='wf')return 100000;
 return hits*(100*2*3+200)+Math.floor(hits/5)*500*2+2000}
async function ev(env,e,m){if(!env.KW_LB)return;const day=etDate(),k='st:'+day;try{const o=await env.KW_LB.get(k,'json')||{};const key=e+(m?':'+m:'');o[key]=(o[key]||0)+1;await env.KW_LB.put(k,JSON.stringify(o),{expirationTtl:86400*400})}catch(_){}}
async function rate(env,ipH,bucket,limit){const k='rl:'+bucket+':'+ipH+':'+Math.floor(Date.now()/60000);const n=+(await env.KW_LB.get(k)||0);if(n>=limit)return false;await env.KW_LB.put(k,String(n+1),{expirationTtl:120});return true}
const boardKeys=(mode,board,desk,daily)=>{const base=`lb:${mode}:${board||'-'}:${desk||'-'}`;const k=[base+':all',base+':w:'+isoWeek()];k.push(base+':d:'+(mode==='daily'&&daily?daily:etDate()));return k};
export async function onRequest(ctx){const {request:req,env}=ctx;const url=new URL(req.url);const path=url.pathname.replace(/^\/api\/?/,'');
 if(!env.KW_LB)return J({ok:false,offline:true,error:'leaderboard storage not bound'},503);
 const secret=env.LB_SECRET||'';const ip=req.headers.get('cf-connecting-ip')||'0';const ipH=await sha(ip+'|'+secret.slice(0,8));
 try{
 if(path==='health')return J({ok:true,signed:!!secret});
 if(path==='ev'&&req.method==='POST'){if(!await rate(env,ipH,'ev',60))return J({ok:false},429);const b=await req.json().catch(()=>({}));const E=['mode_start','round_end','share','lb_submit','duel_start','duel_end','lb_view','touch_round'];if(!E.includes(b.e))return J({ok:false},400);await ev(env,b.e,String(b.m||'').replace(/[^a-z0-9]/g,'').slice(0,12));return J({ok:true})}
 if(path==='stats'){const days=Math.min(60,+url.searchParams.get('days')||14),out={};for(let i=0;i<days;i++){const d=etDate(Date.now()-i*864e5);out[d]=await env.KW_LB.get('st:'+d,'json')||{}}return J({ok:true,days:out})}
 if(path==='run'&&req.method==='POST'){if(!secret)return J({ok:false,error:'unsigned'},503);if(!await rate(env,ipH,'run',30))return J({ok:false,error:'slow down'},429);const b=await req.json().catch(()=>({}));const mode=MODES[b.mode]?b.mode:'arcade';const rid=crypto.randomUUID().slice(0,18),ts=Date.now();const sig=await hmac(secret,`${rid}.${ts}.${mode}`);return J({ok:true,rid,ts,sig})}
 if(path==='score'&&req.method==='POST'){if(!secret)return J({ok:false,error:'unsigned'},503);const b=await req.json().catch(()=>({}));const mode=MODES[b.mode]?b.mode:null;if(!mode)return J({ok:false,error:'mode'},400);
  if(!await rate(env,ipH,'score',8))return J({ok:false,error:'Too many submissions. Take a breather.'},429);
  const want=await hmac(secret,`${b.rid}.${b.ts}.${mode}`);if(want!==b.sig)return J({ok:false,error:'Unsigned run'},403);
  const el=(Date.now()-(+b.ts))/1000;if(el<MODES[mode].min||el>MODES[mode].max+120)return J({ok:false,error:'Run timing rejected'},422);
  if(await env.KW_LB.get('used:'+b.rid))return J({ok:false,error:'Run already filed'},409);
  const s=b.stats||{},score=Math.floor(+b.score||0);if(!(score>=0)||score>maxScore(mode,s))return J({ok:false,error:'Score fails sanity check'},422);
  // input timing sanity: no more than 12 fills per second on average, and a reported duration that matches the clock
  if(mode!=='hero'&&mode!=='wf'&&((s.hits|0)/Math.max(1,el)>12))return J({ok:false,error:'Inhuman fill rate'},422);
  await env.KW_LB.put('used:'+b.rid,'1',{expirationTtl:86400*3});
  const name=cleanName(b.name),desk=cleanDesk(b.desk),board=cleanBoard(b.board),input=b.input==='touch'?'touch':'kbd';
  const row={n:name,s:score,a:Math.max(0,Math.min(100,s.acc|0)),c:s.combo|0,i:input,t:Date.now(),h:ipH.slice(0,6)};
  const res={};for(const scope of ['','i:'+input]){for(const k of boardKeys(mode+(scope?'@'+input:''),board,desk,b.daily|0)){const L=await env.KW_LB.get(k,'json')||[];
   const prev=L.findIndex(r=>r.h===row.h&&r.n===row.n);if(prev>=0){if(L[prev].s>=row.s){res[k]=L.findIndex(r=>r===L[prev])+1;continue}L.splice(prev,1)}
   L.push(row);L.sort((x,y)=>y.s-x.s||x.t-y.t);const rank=L.indexOf(row)+1;L.length=Math.min(L.length,100);res[k]=rank<=100?rank:null;await env.KW_LB.put(k,JSON.stringify(L))}}
  await ev(env,'lb_submit',mode);
  const day=boardKeys(mode,board,desk,b.daily|0)[2],dayTouch=boardKeys(mode+'@'+input,board,desk,b.daily|0)[2];
  return J({ok:true,rank:{day:res[day]||null,dayInput:res[dayTouch]||null,all:res[boardKeys(mode,board,desk,b.daily|0)[0]]||null},name})}
 if(path==='board'){const mode=MODES[url.searchParams.get('mode')]?url.searchParams.get('mode'):'arcade',input=url.searchParams.get('input'),m=mode+(input==='touch'||input==='kbd'?'@'+input:'');
  const ks=boardKeys(m,cleanBoard(url.searchParams.get('board')),cleanDesk(url.searchParams.get('desk')),+url.searchParams.get('daily')||0),per=url.searchParams.get('period')||'day';
  const k=per==='all'?ks[0]:per==='week'?ks[1]:ks[2];const L=(await env.KW_LB.get(k,'json')||[]).slice(0,50).map(r=>({n:r.n,s:r.s,a:r.a,c:r.c,i:r.i,t:r.t}));return J({ok:true,period:per,rows:L},200,{'cache-control':'public, max-age=15'})}
 return J({ok:false,error:'not found'},404)}catch(e){return J({ok:false,error:'server'},500)}}
