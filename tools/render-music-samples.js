const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--autoplay-policy=no-user-gesture-required']});const p=await b.newPage();const errs=[];
p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.type()+': '+m.text())});
await p.goto('file:///workspace/keyboard-warrior/index.html');
const prep=await p.evaluate(async()=>{const t=performance.now();await HERO.prepare();return{ms:Math.round(performance.now()-t),keys:Object.keys(HERO.SMP)}});console.log('prepare',JSON.stringify(prep));
const secs=+(process.argv[2]||28);
for(let ti=0;ti<3;ti++){const r=await p.evaluate(async([ti,secs])=>{const t=performance.now();const buf=await HERO.renderDemo(ti,secs,[0,4,4][ti]);const ms=performance.now()-t;
  const L=buf.getChannelData(0),R=buf.getChannelData(1),n=L.length;let pk=0,ss=0;const i16=new Int16Array(n*2);
  for(let i=0;i<n;i++){const a=L[i],b=R[i];pk=Math.max(pk,Math.abs(a),Math.abs(b));ss+=a*a+b*b;i16[2*i]=Math.max(-1,Math.min(1,a))*32767;i16[2*i+1]=Math.max(-1,Math.min(1,b))*32767}
  // per-second rms
  const sec=[];for(let s=0;s<Math.floor(n/44100);s++){let q=0;for(let i=s*44100;i<(s+1)*44100;i++)q+=L[i]*L[i];sec.push(Math.round(10*Math.log10(q/44100+1e-12)))}
  const u8=new Uint8Array(i16.buffer);let bin='';for(let i=0;i<u8.length;i+=0x8000)bin+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));
  return{name:HERO.TRACKS[ti].id,ms:Math.round(ms),peakDb:+(20*Math.log10(pk)).toFixed(2),rmsDb:+(10*Math.log10(ss/(2*n))).toFixed(2),sec:sec.join(','),b64:btoa(bin)}},[ti,secs]);
 const pcm=Buffer.from(r.b64,'base64');const hdr=Buffer.alloc(44);hdr.write('RIFF',0);hdr.writeUInt32LE(36+pcm.length,4);hdr.write('WAVE',8);hdr.write('fmt ',12);hdr.writeUInt32LE(16,16);hdr.writeUInt16LE(1,20);hdr.writeUInt16LE(2,22);hdr.writeUInt32LE(44100,24);hdr.writeUInt32LE(44100*4,28);hdr.writeUInt16LE(4,32);hdr.writeUInt16LE(16,34);hdr.write('data',36);hdr.writeUInt32LE(pcm.length,40);
 const T=['margin-call-trap-140bpm','opening-bell-boombap-90bpm','after-hours-lofi-78bpm'][ti];fs.writeFileSync(`/workspace/keyboard-warrior/music-samples/${T}.wav`,Buffer.concat([hdr,pcm]));
 delete r.b64;console.log(JSON.stringify(r))}
console.log('ERRS',JSON.stringify(errs));await b.close()})();
