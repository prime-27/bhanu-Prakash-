/* Particle universe: WebGL engine and the thirteen formations of the journey. */
window.Universe=(()=>{
"use strict";
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const TAU=Math.PI*2, lerp=(a,b,t)=>a+(b-a)*t, clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const N = (innerWidth<700||(navigator.hardwareConcurrency||8)<4) ? 24000 : 48000;

/* ---------- seeded random ---------- */
let seed=20261113;
const R=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
const gauss=()=>{let u=0;while(!u)u=R();return Math.sqrt(-2*Math.log(u))*Math.cos(TAU*R());};
const starCol=b=>{const t=R();const c=t<.22?[.66,.78,1]:t<.62?[1,1,1]:t<.86?[1,.9,.72]:[1,.72,.52];return c.map(x=>x*b);};
const mk=()=>({p:new Float32Array(N*4),c:new Float32Array(N*4),bodies:[]});
function set(f,i,x,y,z,k,r,g,b,s){const o=i*4;f.p[o]=x;f.p[o+1]=y;f.p[o+2]=z;f.p[o+3]=k;f.c[o]=r;f.c[o+1]=g;f.c[o+2]=b;f.c[o+3]=s;}
const horizon=x=>-.95+.12*Math.sin(x*1.7)+.06*Math.sin(x*4.3+1);
function bgStars(f,i,n){for(let j=0;j<n;j++){const m=Math.pow(R(),3),z=-1.2-R()*2.5,half=(4+(-z))/1.6;set(f,i++,(R()*2-1)*half*2,(R()*2-1)*half*1.15,z,1,...starCol(.18+m*.7),1+m*2.2);}return i;}

/* ---------- formations ----------
   kind: 0 animated · 1 static · 2 lit sphere · 3 rings · 4 young stars · 5 dark matter · 9 pulsar · 10 lensed light · 11 Hawking radiation
         13 Kepler wedge · 14 pulsar beam · 15 fusion flash · 16/17 entangled pair · 18/19 vacuum pair · 20 cosmic microwave background
         8 + r/10 orbiting body (r = orbit radius, so clusters orbit rigidly) */
function fSky(){
  const f=mk();let i=0;
  const dip=[[0,0],[.55,.1],[1,.12],[1.4,.05],[1.45,-.35],[2.05,-.4],[2.05,.05]].map(([x,y])=>[x*.55-1.55,y*.55+.92]);
  for(const [x,y] of dip)set(f,i++,x,y,0,0,1,.96,.88,6);
  set(f,i++,-.35,1.5,0,0,1,1,.95,6.5);
  const E=[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,3]];
  for(let j=0,n=N*.012|0;j<n;j++){const [a,b]=E[j%7],t=R();set(f,i++,lerp(dip[a][0],dip[b][0],t),lerp(dip[a][1],dip[b][1],t),0,0,.18,.26,.45,.9);}
  for(let j=0,n=N*.1|0;j<n;j++){const x=-3.6+R()*7.2,edge=R()<.5;const y=edge?horizon(x)+gauss()*.005:horizon(x)-.02-Math.pow(R(),.6)*1.3;
    const b=edge?.34:.035;set(f,i++,x,y,0,1,b*.55,b*.65,b,edge?1.3:1.8);}
  const dx=1.35,dy=horizon(1.35)-.01;
  for(let j=0,n=N*.012|0;j<n;j++){const t=R();let x,y;
    if(t<.5){const a=R()*Math.PI;x=dx+Math.cos(a)*.16;y=dy+.15+Math.sin(a)*.16;}
    else if(t<.88){const s=R()<.5?-1:1;if(R()<.5){x=dx+s*.16;y=dy+R()*.15;}else{x=dx+(R()*2-1)*.16;y=dy+.15;}}
    else{set(f,i++,dx+.03+gauss()*.01,dy+.18+R()*.1,0,1,1,.62,.28,2.2);continue;}
    set(f,i++,x,y,0,1,.4,.45,.6,1.4);}
  for(let j=0,n=N*.3|0;j<n;j++){const t=-7+R()*14,off=gauss()*.2*(1+.5*Math.sin(t*2.1));const b=.15+R()*.3;
    const c=R()<.55?[.72,.8,1]:[1,.86,.72];set(f,i++,t-off*.35,.2+t*.36+off,0,0,c[0]*b,c[1]*b,c[2]*b,1+R()*1.4);}
  while(i<N){const m=Math.pow(R(),4),a=R()*TAU,r=5.4*Math.sqrt(R());set(f,i++,-.35+Math.cos(a)*r,1.5+Math.sin(a)*r,0,0,...starCol(.16+m*1.05),1+m*4.2);}
  return f;
}
/* Kepler orbits: eccentricity by orbit radius (Mercury and Mars stretched to show it), perihelion direction w */
const ecc=r=>r<.25?.25:Math.abs(r-.5)<.02?.32:.07, peri=r=>r*11;
function kep(a,e,M){let E=M;for(let k=0;k<6;k++)E-=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E));return[a*(Math.cos(E)-e),a*Math.sqrt(1-e*e)*Math.sin(E)];}
const rot2=([x,z],w)=>[Math.cos(w)*x-Math.sin(w)*z,Math.sin(w)*x+Math.cos(w)*z];
const onSphere=()=>{const u=R()*2-1,a=R()*TAU,s=Math.sqrt(1-u*u);return[s*Math.cos(a),u,s*Math.sin(a),a];};
function blob(f,i,n,cx,cy,cz,rad,kind,c,size){for(let j=0;j<n;j++){const s=onSphere(),r=rad*Math.cbrt(R());set(f,i++,cx+s[0]*r,cy+s[1]*r,cz+s[2]*r,kind,c[0],c[1],c[2],size);}return i;}
function fMoon(){
  const f=mk();let i=bgStars(f,0,N*.08|0);
  const maria=[...Array(7)].map(()=>{const s=onSphere();return[s[0],s[1]*.7,Math.abs(s[2])*.9+.1,.22+R()*.3];});
  const craters=[...Array(70)].map(()=>{const s=onSphere();return[s[0],s[1],s[2],.03+Math.pow(R(),2)*.14];});
  while(i<N){const n=onSphere();let b=.5+R()*.12;
    for(const m of maria)if(Math.hypot(n[0]-m[0],n[1]-m[1],n[2]-m[2])<m[3])b*=.6;
    for(const c of craters){const d=Math.hypot(n[0]-c[0],n[1]-c[1],n[2]-c[2]);if(Math.abs(d-c[3])<c[3]*.2)b*=1.4;else if(d<c[3])b*=.82;}
    set(f,i++,n[0]*.8,n[1]*.8,n[2]*.8,2,b*.95,b*.93,b*.9,1.4+R()*.8);}
  return f;
}
function fJupiter(){
  const f=mk();let i=bgStars(f,0,N*.06|0);
  [[1.05,.03,[.95,.85,.45]],[1.3,.026,[.85,.82,.78]],[1.62,.04,[.72,.7,.66]],[1.98,.036,[.55,.53,.5]]].forEach(([r,s,c],k)=>{
    const a=k*1.9+.4;f.bodies.push([r,a,.07,.07]);i=blob(f,i,N*.008|0,Math.cos(a)*r,0,Math.sin(a)*r,s,8+r/10,c.map(v=>v*.7),1.5);});
  while(i<N){const n=onSphere(),lat=Math.asin(n[1]),a=n[3]<0?n[3]+TAU:n[3];
    const w=Math.sin(lat*11+Math.sin(a*2+lat*6)*.35+gauss()*.05);
    let c=w>0?[1,.92,.78]:[.8,.56,.38],b=.42+R()*.1;
    const dl=(lat+.384)/.09,da=(((a-1+Math.PI)%TAU)-Math.PI)/.24;if(dl*dl+da*da<1){c=[1,.42,.28];b=.55;}
    set(f,i++,n[0]*.72,n[1]*.68,n[2]*.72,2,c[0]*b,c[1]*b,c[2]*b,1.4+R()*.8);}
  return f;
}
function fPlanet(){
  const f=mk();let i=bgStars(f,0,N*.1|0);
  for(let j=0,n=N*.55|0;j<n;j++){const u=R()*2-1,a=R()*TAU,s=Math.sqrt(1-u*u);
    const band=.5+.5*Math.sin(u*17+Math.sin(a*3)*.25+gauss()*.12);
    const c=[lerp(.78,1,band),lerp(.55,.84,band),lerp(.33,.56,band)];
    set(f,i++,s*Math.cos(a)*.6,u*.6,s*Math.sin(a)*.6,2,c[0]*.5,c[1]*.5,c[2]*.5,1.5+R());}
  while(i<N){let r;do{r=.8+R()*.56;}while(r>1.1&&r<1.15);const a=R()*TAU,band=.5+.5*Math.sin(r*55);
    const b=(.2+.3*band)*(r>1.15?.75:1);set(f,i++,Math.cos(a)*r,gauss()*.004,Math.sin(a)*r,3,b,b*.9,b*.74,1.1+R()*.6);}
  return f;
}
function fSolar(){
  const f=mk();let i=bgStars(f,0,N*.06|0);
  for(let j=0,n=N*.07|0;j<n;j++){const s=onSphere(),r=Math.abs(gauss())*.05,b=.45+R()*.4;set(f,i++,s[0]*r,s[1]*r,s[2]*r,0,b,b*.72,b*.35,2+R()*3);}
  const PL=[[.22,.012,[.7,.65,.6]],[.3,.018,[1,.85,.6]],[.4,.02,[.45,.65,1]],[.5,.015,[1,.5,.3]],[.86,.05,[1,.85,.65]],[1.1,.044,[1,.9,.65]],[1.34,.03,[.6,.9,1]],[1.56,.03,[.4,.55,1]]];
  for(let j=0,n=N*.004|0;j<n;j++){const s=onSphere(),r=Math.abs(gauss())*.02;set(f,i++,s[0]*r,s[1]*r,s[2]*r,15,1,.95,.75,1.6);}
  PL.forEach(([r])=>{const e=ecc(r),w=peri(r);for(let j=0,n=N*.02|0;j<n;j++){const E=R()*TAU,[x,z]=rot2([r*(Math.cos(E)-e),r*Math.sqrt(1-e*e)*Math.sin(E)],w);set(f,i++,x,0,z,0,.045,.055,.1,1);}});
  let marsA=0;
  PL.forEach(([r,s,c],k)=>{const a=R()*TAU;if(k===3)marsA=a;if(k===2||k>3)f.bodies.push([r,a,s*1.6,.07]);i=blob(f,i,N*.007|0,Math.cos(a)*r,0,Math.sin(a)*r,s,8+r/10,c.map(v=>v*.75),1.4);});
  for(let j=0,n=N*.025|0;j<n;j++){const b=.12+R()*.1;set(f,i++,R(),R(),marsA,13,b,b*.55,b*.3,1.4);}
  for(let j=0,n=N*.07|0;j<n;j++){const r=.63+R()*.13,a=R()*TAU,b=.07+R()*.1;set(f,i++,Math.cos(a)*r,gauss()*.01,Math.sin(a)*r,8+r/10,b,b*.9,b*.8,1);}
  while(i<N){const r=1.72+R()*.38,a=R()*TAU,b=.05+R()*.08;set(f,i++,Math.cos(a)*r,gauss()*.03,Math.sin(a)*r,8+r/10,b*.8,b*.85,b,1);}
  return f;
}
function fNebula(){
  const f=mk();let i=bgStars(f,0,N*.08|0);
  const PAL=[[.95,.28,.55],[1,.32,.25],[.25,.72,.85],[1,.6,.28],[.55,.38,1]];
  const blobs=[...Array(9)].map((_,k)=>({c:[gauss()*.5,gauss()*.3,gauss()*.3],s:[.14+R()*.34,.1+R()*.24,.1+R()*.22],col:PAL[k%PAL.length]}));
  for(let j=0,n=N*.89|0;j<n;j++){const bl=blobs[j%blobs.length];let x=bl.c[0]+gauss()*bl.s[0],y=bl.c[1]+gauss()*bl.s[1],z=bl.c[2]+gauss()*bl.s[2];
    x+=Math.sin(y*5)*.09;y+=Math.sin(z*5+x*3)*.09;const b=.035+R()*.08;set(f,i++,x,y,z,0,bl.col[0]*b,bl.col[1]*b,bl.col[2]*b,2.6+R()*3.6);}
  while(i<N){const m=Math.pow(R(),3);set(f,i++,gauss()*.15,gauss()*.11,gauss()*.11,4,.3,.35,.45,1.1+m*3.5);}
  return f;
}
function fCrab(){
  const f=mk();let i=bgStars(f,0,N*.06|0);
  for(let j=0,n=N*.004|0;j<n;j++)set(f,i++,gauss()*.008,gauss()*.008,gauss()*.008,9,.8,.85,1,2.5);
  for(let j=0,n=N*.045|0;j<n;j++){const b=.7+R()*.5;set(f,i++,.03+Math.pow(R(),1.4)*1.5,R()<.5?-1:1,R()*TAU,14,b*.6,b*.8,b,1.5+R()*1.2);}
  for(let j=0,n=N*.28|0;j<n;j++){const b=.045+R()*.07;set(f,i++,gauss()*.28,gauss()*.2,gauss()*.2,0,b*.55,b*.7,b*1.2,2.5+R()*2.5);}
  while(i<N){const n=onSphere();
    const fil=Math.sin(n[0]*9+Math.sin(n[1]*7)*2)*Math.sin(n[1]*8+n[2]*6)*Math.sin(n[2]*10+n[0]*3);
    if(Math.abs(fil)>.15&&R()<.85)continue;
    const r=(.55+gauss()*.06)*(1+fil*.3),b=.12+R()*.18,c=R()<.7?[1,.35,.22]:[1,.75,.4];
    set(f,i++,n[0]*r*1.25,n[1]*r*.9,n[2]*r,0,c[0]*b,c[1]*b,c[2]*b,1.3+R()*1.2);}
  return f;
}
function fBlackHole(){
  const f=mk();let i=bgStars(f,0,N*.12|0);
  for(let j=0,n=N*.62|0;j<n;j++){const r=.36+Math.pow(R(),1.6)*1.1,a=R()*TAU,t=(r-.36)/1.1,b=(.5-.38*t)*(.6+R()*.4);
    set(f,i++,Math.cos(a)*r,gauss()*.006*(1+t*3),Math.sin(a)*r,0,b,b*lerp(.95,.45,t),b*lerp(.85,.18,t),1.1+R()*.9);}
  for(let j=0,n=N*.05|0;j<n;j++){const a=R()*TAU,r=.29+Math.abs(gauss())*.012;set(f,i++,Math.cos(a)*r,Math.sin(a)*r,0,10,.5,.43,.3,1.2);}
  for(let j=0,n=N*.025|0;j<n;j++){const b=.5+R()*.5;set(f,i++,R()*TAU,0,0,11,b*.75,b*.88,b,1.4+R()*1.1);}
  while(i<N){const a=R()*TAU,r=.36+Math.pow(R(),1.8)*.5,t=(r-.36)/.5,b=(.35-.25*t)*(.5+R()*.5);
    set(f,i++,Math.cos(a)*r*1.05,Math.sin(a)*r*.92,-.01,10,b,b*.75,b*.45,1.1);}
  return f;
}
function fGalaxy(o={}){
  const wind=o.wind||2.3,f=mk();let i=bgStars(f,0,N*.05|0);
  if(o.sats){i=blob(f,i,N*.012|0,.42,.2,.3,.04,1,[.5,.42,.3],1.4);for(let j=0,n=N*.02|0;j<n;j++)set(f,i++,-.6+gauss()*.07,-.42+gauss()*.05,.3,1,.2,.18,.15,1.6);}
  if(o.halo)for(let j=0,n=N*.14|0;j<n;j++){const s=onSphere(),r=.25+Math.pow(R(),.75)*2.1,b=.2+R()*.25;set(f,i++,s[0]*r,s[1]*r*.85,s[2]*r,5,b*.62,b*.48,b,1.6+R()*1.6);}
  for(let j=0,n=N*(o.bulge||.18)|0;j<n;j++){const b=.18+R()*.25;set(f,i++,gauss()*.15,gauss()*.08,gauss()*.15,0,b,b*.84,b*.6,1.1+R());}
  while(i<N){const r=.12+Math.pow(R(),.9)*1.35,scatter=R()<.22;
    const th=scatter?R()*TAU:(i%2)*Math.PI+Math.log(r/.12)*wind+gauss()*.3;
    const t=r/1.47;let c=[lerp(1,.62,t),lerp(.85,.76,t),lerp(.62,1,t)],b=.16+R()*.3,s=1+R()*1.2;
    if(!scatter&&R()<.05){c=[1,.36,.6];b=.35;s=2.4;}
    if(o.ring&&Math.abs(r-.9)<.07&&R()<.5){c=[.62,.72,1];b=.4;}
    set(f,i++,Math.cos(th)*r,gauss()*.025,Math.sin(th)*r,0,c[0]*b,c[1]*b,c[2]*b,s);}
  return f;
}
function fWeb(){
  const f=mk();let i=bgStars(f,0,N*.06|0);
  const nodes=[...Array(46)].map(()=>{const s=onSphere(),r=Math.cbrt(R())*1.7;return[s[0]*r*1.3,s[1]*r,s[2]*r];});
  nodes.slice(0,6).forEach(n=>f.bodies.push([Math.hypot(n[0],n[2]),Math.atan2(n[2],n[0]),.16,.22]));
  const edges=[];nodes.forEach((n,a)=>{const d=nodes.map((m,b)=>[Math.hypot(n[0]-m[0],n[1]-m[1],n[2]-m[2]),b]).sort((p,q)=>p[0]-q[0]);edges.push([a,d[1][1]],[a,d[2][1]],[a,d[3][1]]);});
  for(let j=0,n=N*.22|0;j<n;j++){const p=nodes[j%nodes.length],b=.18+R()*.25;set(f,i++,p[0]+gauss()*.05,p[1]+gauss()*.05,p[2]+gauss()*.05,0,b,b*.8,b*.62,1.2+R()*1.5);}
  while(i<N){const [a,b]=edges[(R()*edges.length)|0],t=R(),w=.025*(1+Math.sin(t*Math.PI));const A=nodes[a],B=nodes[b],k=.16+R()*.24;
    set(f,i++,lerp(A[0],B[0],t)+gauss()*w,lerp(A[1],B[1],t)+gauss()*w,lerp(A[2],B[2],t)+gauss()*w,0,k*.5,k*.55,k,1.1+R()*.9);}
  return f;
}

function fStrings(){
  const f=mk();let i=bgStars(f,0,N*.05|0);
  const cells=[];for(let gx=-4;gx<=4;gx++)for(let gy=-2;gy<=2;gy++){if(Math.abs(gx)<=1&&Math.abs(gy)<=1)continue;cells.push([gx*.8,gy*.8]);}
  for(let j=0,nl=N*.28|0;j<nl;j++){const c=cells[j%cells.length],a=R()*TAU,r=.14+((j%cells.length)%3)*.045,b=.22+R()*.18;
    set(f,i++,c[0]+Math.cos(a)*r,c[1]+Math.sin(a)*r,-.5,12,b*.75,b*.85,b*1.2,1.2);}
  const n=5,pw=(z,e)=>{const r=Math.hypot(z[0],z[1]),t=Math.atan2(z[1],z[0]),m=Math.pow(r,e);return[m*Math.cos(t*e),m*Math.sin(t*e)];},
    rotc=(z,g)=>[z[0]*Math.cos(g)-z[1]*Math.sin(g),z[0]*Math.sin(g)+z[1]*Math.cos(g)],al=Math.PI/4;
  for(let k=0;k<14;k++){const s=onSphere(),r=1.25+R()*.35;for(let j=0;j<40;j++){set(f,i++,s[0]*r,s[1]*r*.7,s[2]*r,16,.5,.5,.55,1.5);set(f,i++,-s[0]*r,-s[1]*r*.7,-s[2]*r,17,.5,.5,.55,1.5);}}
  for(let j=0,n=N*.015|0;j<n;j++){const s=onSphere(),r=.3+Math.cbrt(R())*2;for(const k of[18,19])set(f,i++,s[0]*r*1.3,s[1]*r*.8,s[2]*r,k,.55,.6,.8,1.3);}
  const COL=[[1,.76,.48],[.66,.78,1],[.95,.93,.9]];
  while(i<N){const k1=(R()*n)|0,k2=(R()*n)|0,a=(R()*2-1)*1.05,b=R()*Math.PI/2;
    const ch=[Math.cosh(a)*Math.cos(b),Math.sinh(a)*Math.sin(b)],sh=[Math.sinh(a)*Math.cos(b),Math.cosh(a)*Math.sin(b)];
    const z1=rotc(pw(ch,2/n),TAU*k1/n),z2=rotc(pw([sh[1],-sh[0]],2/n),TAU*k2/n);
    const c=COL[(k1+k2)%3],v=.2+R()*.22;
    set(f,i++,z1[0]*.95,z2[0]*.95,(Math.cos(al)*z1[1]+Math.sin(al)*z2[1])*.95,0,c[0]*v,c[1]*v,c[2]*v,1.05+R()*.5);}
  return f;
}
function fBang(){
  const f=mk();let i=0;
  const cl=[...Array(90)].map(()=>{const s=onSphere(),r=Math.cbrt(R())*1.5;return[s[0]*r,s[1]*r,s[2]*r];});
  for(let j=0,n=N*.68|0;j<n;j++){const c=cl[j%cl.length],k=R()<.3,b=.2+R()*.35,col=R()<.5?[1,.85,.65]:[.7,.8,1];
    set(f,i++,c[0]+gauss()*(k?.15:.05),c[1]+gauss()*(k?.15:.05),c[2]+gauss()*(k?.15:.05),0,col[0]*b,col[1]*b,col[2]*b,1+R()*1.4);}
  /* the afterglow: a speckled sphere of hot and cold spots, like the Planck satellite's map */
  while(i<N){const s=onSphere(),v=Math.sin(s[0]*9+Math.sin(s[1]*7)*2)*Math.sin(s[1]*11+s[2]*5)*Math.sin(s[2]*8-s[0]*4)+Math.sin(s[0]*23+s[2]*19)*.35;
    const t=clamp(.5+v*.6,0,1),col=t<.5?[lerp(.1,.8,t*2),lerp(.25,.85,t*2),1]:[1,lerp(.85,.35,t*2-1),lerp(.7,.1,t*2-1)],b=.34+R()*.1;
    set(f,i++,s[0]*2.1,s[1]*2.1,s[2]*2.1,20,col[0]*b,col[1]*b,col[2]*b,1.8+R()*1.2);}
  return f;
}
const LY=9.461e12;
const SCENES=[
  {name:"Look up",light:["Visible starlight", 550, "Your eyes catch photons that left these stars years to centuries ago."],make:fSky,mode:0,km:2.14,dist:()=>3,trail:true,spin:h=>h*h*2.6,b:"to turn the sky",coord:"Your site · look north for Polaris",beats:[
    "Twenty minutes after the last light goes out, your eyes adjust and the Milky Way appears.",
    "Find the Big Dipper and follow its two pointer stars, Merak and Dubhe. They lead you to Polaris, the pole star.",
    "Keep scrolling and the Earth turns. Every star circles the pole, drawing the trails a long-exposure photo would catch."]},
  {name:"The Moon",light:["Reflected sunlight", 560, "Sunlight bounces off the Moon’s surface and reaches you 1.3 seconds later."],make:fMoon,mode:5,km:384400,dist:h=>lerp(3.5,2.1,ease(h)),spin:h=>h*1.3,b:"to rotate the Moon",coord:"384,400 km away · 3,474 km wide",beats:[
    "Our first stop. The Moon is 384,400 km away, and its light reaches you in 1.3 seconds.",
    "The dark patches are maria, plains of old lava. Early astronomers thought they were seas.",
    "The best views are along the terminator, where low sunlight throws long shadows from crater walls."]},
  {name:"Jupiter",light:["Reflected sunlight", 580, "Sunlight reflected from its cloud tops, which show bands of colour."],make:fJupiter,mode:5,km:7.2e8,dist:h=>lerp(3.8,3,ease(h)),spin:h=>h*3,b:"to watch the moons orbit",coord:"142,984 km wide · 4 Galilean moons",beats:[
    "Jupiter is so large that about 1,300 Earths would fit inside it.",
    "The Great Red Spot is a storm wider than Earth. People have watched it for at least 190 years.",
    "Galileo found its four largest moons in 1610. Io, Europa, Ganymede and Callisto change places every night."]},
  {name:"Saturn",light:["Reflected sunlight", 590, "Sunlight reflected from its clouds and from the ice of its rings."],make:fPlanet,mode:1,km:1.3e9,dist:h=>lerp(3.4,1.85,ease(h)),spin:h=>h*1.6,b:"to zoom in",coord:"1.3 billion km · magnitude 0.7",beats:[
    "In the 24-inch telescope, Saturn's rings look close enough to touch.",
    "The rings span about 280,000 km, yet most of them are less than a kilometre thick. They are made of water ice.",
    "Saturn is so light for its size that it would float in water, if you could find an ocean big enough."]},
  {name:"The Solar System",light:["Sunlight", 500, "The Sun’s light is brightest around 500 nm, in the blue-green, and it lights every planet you see."],make:fSolar,mode:6,km:6e9,dist:h=>lerp(3.7,3,ease(h)),spin:h=>h*2,b:"to look down on the orbits",coord:"Sun to Neptune · 4.5 billion km",beats:[
    "Pull back far enough and the planets turn into points of light on nearly flat orbits.",
    "Between Mars and Jupiter lies the asteroid belt. Past Neptune is the icy Kuiper belt.",
    "Sunlight needs about four hours to reach Neptune. Next, we leave the Sun behind."]},
  {name:"Orion Nebula",light:["Hydrogen-alpha, 656 nm", 656, "Glowing hydrogen gives the nebula its red light at 656.3 nm; oxygen adds a green glow at 500.7 nm."],make:fNebula,mode:2,km:1344*LY,dist:h=>lerp(3,2.3,ease(h)),spin:h=>h*1.4,b:"to light new stars",coord:"M42 · RA 05h 35m · Dec −05° 23′",beats:[
    "1,344 light-years away, a cloud of gas is collapsing into new stars.",
    "The four stars of the Trapezium at its heart are less than a million years old.",
    "On a winter night you can see it without a telescope, as a fuzzy star in Orion's sword."]},
  {name:"The Crab Nebula",light:["Synchrotron light, radio to gamma rays", "broad", "Electrons spiralling in strong magnetic fields shine across almost the whole spectrum."],make:fCrab,mode:7,km:6500*LY,dist:h=>lerp(2.4,3.1,h),spin:()=>0,b:"to watch it explode",coord:"M1 · RA 05h 34m · Dec +22° 01′",beats:[
    "In 1054, astronomers in China recorded a new star bright enough to see in daylight for 23 days.",
    "It was a supernova: a massive star exploding at the end of its life, 6,500 light-years away.",
    "The debris still expands at about 1,500 km per second. At its centre a neutron star spins 30 times a second."]},
  {name:"Sagittarius A*",light:["Radio waves, 1.3 mm", "radio", "Dust hides the galactic centre in visible light. The Event Horizon Telescope imaged it at a wavelength of 1.3 mm."],make:fBlackHole,mode:8,km:26000*LY,dist:h=>lerp(3.3,2,ease(h)),spin:h=>h*3,b:"to fall closer",coord:"RA 17h 45m · Dec −29° 00′ · 4 million suns",beats:[
    "At the centre of our galaxy sits a black hole about 4 million times the mass of the Sun.",
    "Gas spiralling in heats up and glows. Gravity bends that light around the dark shadow.",
    "In 2022 the Event Horizon Telescope published the first image of it, made with radio dishes on several continents."]},
  {name:"The Milky Way",light:["Visible light and the 21 cm hydrogen line", "radio", "Radio waves 21 cm long from cold hydrogen gas map the spiral arms that dust hides from our eyes."],make:()=>fGalaxy({halo:true}),mode:3,km:2e5*LY,dist:h=>lerp(3.1,3.7,ease(h)),spin:h=>h*3.2,b:"to spin a galactic year",coord:"Seen from 200,000 light-years out",beats:[
    "From far outside, this is roughly what our home galaxy would look like.",
    "It is about 100,000 light-years across and holds 100 to 400 billion stars.",
    "The Sun sits in a minor arm and needs 230 million years to go around once."]},
  {name:"Andromeda",light:["Visible light", 550, "The light reaching your eye tonight left Andromeda about 2.5 million years ago."],make:()=>fGalaxy({wind:3.2,bulge:.26,ring:true,sats:true}),mode:9,km:2.5e6*LY,dist:h=>lerp(3.6,2.4,ease(h)),spin:h=>h,b:"to fly closer",coord:"M31 · RA 00h 43m · Dec +41° 16′",beats:[
    "The Andromeda Galaxy is one of the most distant things you can see with your own eyes.",
    "It holds about a trillion stars, more than the Milky Way.",
    "It is falling toward us at about 110 km per second. In roughly 4.5 billion years the two galaxies will merge."]},
  {name:"The cosmic web",light:["Redshifted galaxy light", "red", "Expanding space stretches light to longer, redder wavelengths on its way to us. That stretch tells us the distance."],make:fWeb,mode:4,km:1e9*LY,dist:()=>3.7,spin:()=>0,b:"to turn around",coord:"Filaments hundreds of millions of light-years long",beats:[
    "Galaxies gather along filaments hundreds of millions of light-years long, with vast empty voids between them.",
    "This cosmic web is the largest structure we know of.",
    "From here the journey turns around and zooms in, past atoms and nuclei, to the smallest scale physics can describe."]},
  {name:"The smallest scale",light:["Beyond light", "none", "No light could probe this scale: it would take energies about 10¹⁹ times a proton’s mass-energy."],make:fStrings,mode:10,km:1.6e-38,dist:h=>lerp(3.7,2.6,ease(h)),lab:true,spin:h=>h*1.4,b:"to go back to the beginning of time",coord:"Planck length · 1.6 × 10⁻³⁵ m",beats:[
    "String theory proposes that at about 10⁻³⁵ m, the Planck length, everything is made of tiny vibrating strings.",
    "Each way a string can vibrate would show up as a different particle, the way one guitar string plays many notes.",
    "The theory needs extra dimensions curled up too small to see, often drawn as Calabi–Yau shapes. No experiment has tested it yet."]},
  {name:"The Big Bang",light:["Microwaves, about 1 mm", "radio", "The Big Bang’s afterglow left as visible light. Expanding space has stretched it into microwaves, now at 2.7 degrees above absolute zero."],make:fBang,mode:11,km:13.8e9*LY,dist:()=>3.6,final:true,bang:true,spin:()=>0,b:"",coord:"13.8 billion years ago · the oldest light, at 2.7 K",beats:[
    "Everything in the universe, every galaxy on this journey, was once packed into a space far smaller than an atom.",
    "13.8 billion years ago it began to expand, and it has been expanding ever since. The Big Bang was not an explosion in space: it was space itself stretching.",
    "The faint speckled glow is the cosmic microwave background, the oldest light there is. Its tiny hot and cold spots grew into the galaxies."]}
];
/* ---------- physics layers ----------
   gr: the spacetime sheet under each stop (general relativity). y = height below the scene, size = half-width,
       a = brightness, M/s = depth and width of the central dip, weave = loop-quantum-gravity weave.
   Orbiting bodies (formation.bodies) add their own smaller dips. lens = Einstein radius for background stars. */
const PHYS=[
  {gr:{y:-1.2,size:3,a:0,M:0,s:.5}},
  {gr:{y:-.95,size:3.2,a:.9,M:.42,s:.42},theory:[
    ["Special relativity","Scroll fast and you travel near the speed of light. Stars crowd toward the direction you are heading and turn bluer, and when you scroll back they spread out and redden. This is relativistic aberration and the Doppler effect."],
    ["General relativity","The faint grid under the Moon is spacetime. Einstein’s general relativity says mass curves it, and that curve is what we feel as gravity. The Moon makes a small dip; Earth’s deeper one keeps the Moon in orbit. The grid runs under every stop from here on.","Move your cursor or finger across the grid: it has mass too, and spacetime sinks under it."]]},
  {gr:{y:-.9,size:3.2,a:.9,M:.62,s:.45}},
  {gr:{y:-.78,size:3.2,a:.85,M:.55,s:.45}},
  {gr:{y:-.1,size:2.6,a:1,M:.5,s:.14},theory:[
    ["General relativity · orbits","The Sun makes the deepest dip in the grid, and each planet rolls around its slope in a small dip of its own. Einstein’s theory also explained what Newton’s could not: Mercury’s orbit slowly swings round, 43 arcseconds a century more than Newton predicts."],
    ["Kepler’s laws","Planets move on ellipses with the Sun at one focus, and speed up as they swing close to it. The glowing wedge behind Mars always sweeps the same area in the same time, Kepler’s second law. The orbits of Mercury and Mars are stretched here so you can see it."],
    ["Nuclear fusion","The flashes in the Sun’s core stand for fusion. At 15 million °C, hydrogen nuclei fuse into helium, and each second about 4 million tonnes of mass turn into the energy that makes the Sun shine, by E = mc²."]]},
  {gr:{y:-.95,size:3.2,a:.6,M:.22,s:.7}},
  {gr:{y:-.85,size:3.2,a:.8,M:.85,s:.06},theory:[
    ["General relativity · neutron star","The pulsar packs about 1.4 Suns into a ball some 20 km wide, so its dip in the grid is narrow and steep."],
    ["Pulsar beams","The neutron star sweeps two radio beams around about 30 times a second, like a lighthouse. Each time one points at Earth we see a flash. Here it is slowed down 20 times."],
    ["Time dilation","Strong gravity slows time. A clock on the pulsar’s surface ticks about a quarter slower than one far away."]],clock:[.77,"On the pulsar’s surface"]},
  {gr:{y:-.45,size:3.4,a:1,M:1.5,s:.09,fd:1},lens:.3,theory:[
    ["Gravitational lensing","The background stars bend around the black hole. Light from a star behind it is split into two images, one on each side, and a star exactly in line would spread into a ring, called an Einstein ring."],
    ["Hawking radiation","The faint sparks leaving the shadow’s edge show Hawking radiation. In 1974 Stephen Hawking showed that quantum effects make black holes glow very slightly. Sagittarius A* is far too cold for this to be seen: about 10⁻¹⁴ kelvin."],
    ["Frame dragging","A spinning mass drags spacetime around with it, so the grid near the black hole twists into a whirlpool."],
    ["Doppler beaming","Gas on the side of the disk moving toward you looks brighter and bluer, and the side moving away looks dimmer and redder. That is why the Event Horizon Telescope images are brighter on one side."],
    ["Tidal stretching","Gravity pulls much harder on the near side of anything falling in than on its far side, stretching it into a long thin strand. Astronomers call it spaghettification.","Move your cursor or finger near the disk to stretch it."],
    ["Time dilation","A clock hovering just outside the event horizon, at 1.1 times its radius, ticks at less than a third of the rate of one far away."]],clock:[.3,"Just outside the horizon"]},
  {gr:{y:-.3,size:3.4,a:.8,M:.5,s:.3},theory:[
    ["Dark matter","Stars far from the centre orbit about as fast as stars near it, so the galaxy must hold far more mass than we can see. An invisible halo of dark matter holds it together. Across the universe there is about five times more dark matter than ordinary matter, and nobody yet knows what it is.","Move your cursor or finger over the galaxy to reveal the halo."]]},
  {gr:{y:-.35,size:3.4,a:.75,M:.5,s:.3,gw:1},lens:.1,theory:[
    ["Gravitational lensing","Whole galaxies bend light too. Here the effect is exaggerated so you can see it. Telescopes find real galaxy lenses as arcs and rings, and astronomers use them to weigh the dark matter inside."],
    ["Gravitational waves","When Andromeda and the Milky Way merge, their central black holes will spiral together and shake spacetime, sending ripples across the grid like these. LIGO first detected such waves in 2015, from two black holes 1.3 billion light-years away."]]},
  {gr:{y:-1.35,size:3.6,a:1,M:0,s:.5},theory:[
    ["Dark energy","Space between the filaments keeps stretching, and in 1998 two teams found that the expansion is speeding up. The unknown cause is called dark energy, about 68% of the universe. Scroll on and watch the web, and the grid under it, spread faster and faster."]]},
  {gr:{y:-1.1,size:3.2,a:1.7,M:0,s:.5,weave:1},theory:[
    ["Loop quantum gravity","String theory’s main rival keeps Einstein’s spacetime but says it is not smooth. At the Planck scale it is woven from tiny loops, like cloth seen up close. The grid that followed you through the universe becomes that weave here. Like string theory, it has not been tested."],
    ["Quantum uncertainty","At this scale everything is quantum. Each point of the shape is a fuzzy cloud of places it might be, until it is measured. It is the same rule that wipes out the stripes in the double-slit experiment.","Move your cursor or finger over the shape to measure it: the clouds snap to points."],
    ["Quantum entanglement","The pairs of clouds on opposite sides are entangled. Measure one and its partner settles at the same moment, however far apart they are, one amber and one blue. Einstein called it spooky action at a distance; experiments since the 1980s show it is real.","Move your cursor or finger over one cloud of a pair."],
    ["Vacuum fluctuations","Even empty space is never quite empty. Pairs of particles flicker into existence and vanish again almost at once, the flickers you see here."]]},
  {gr:{y:-1.3,size:3.4,a:0,M:0,s:.5},theory:[
    ["Cosmic inflation","In the first tiny fraction of a second, space may have grown by a factor of at least 10²⁶, far faster than light, before settling into the slower expansion we see today."],
    ["The cosmic microwave background","For 380,000 years the universe was a glowing fog. When it cooled enough, light broke free. That light still fills the sky, discovered in 1965, and its hot and cold spots differ by only about 1 part in 100,000."]]}
];
SCENES.forEach((sc,i)=>Object.assign(sc,PHYS[i]));
const ROMAN=["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII"];
const FORMS=[];
const form=i=>FORMS[i]||(FORMS[i]=SCENES[i].make());
form(0);form(1);
SCENES.forEach((_,i)=>setTimeout(()=>form(i),400+i*150));

function init(opts){

const hudD=opts.hudD,hudL=opts.hudL;
const stage=opts.stage,cv=opts.canvas,bar=opts.bar,cue=opts.cue;
const SEG=2.2, LASTI=SCENES.length-1;
let segPx=1,P=0,Pt=0,pair=[-1,-1],shown=-1,time=0,last=performance.now(),mouseOn=0;
const ptr={mx:0,my:0,tx:0,ty:0,inside:false};
let shiftV=0,beta=0,bang=0,lastP=0;
addEventListener("universe:bang",()=>{bang=0;kick();});
function setUI(i,beat){opts.onScene&&opts.onScene(i,beat);}
const nf=(v,d=0)=>v.toLocaleString("en",{maximumFractionDigits:d,minimumFractionDigits:d});
const SUP="⁰¹²³⁴⁵⁶⁷⁸⁹",sup=e=>String(e).replace("-","⁻").replace(/\d/g,d=>SUP[d]);
const sci=(v,u)=>{const e=Math.floor(Math.log10(v));return nf(v/Math.pow(10,e),1)+" × 10"+sup(e)+" "+u;};
function fmtDist(km){
  if(km<1e-3)return sci(km*1000,"m");
  if(km<1)return nf(km*1000)+" m";
  if(km<3)return km>=2?"Ground level":nf(km,1)+" km";
  if(km<1e3)return nf(km)+" km";
  if(km<1e6)return nf(Math.round(km/100)*100)+" km";
  if(km<1e9)return nf(km/1e6)+" million km";
  if(km<9.461e11)return nf(km/1e9,1)+" billion km";
  const ly=km/LY;
  if(ly<10)return nf(ly,2)+" light-years";
  if(ly<1e6)return nf(Math.round(ly))+" light-years";
  if(ly<9.995e8)return nf(ly/1e6,1)+" million light-years";
  return nf(ly/1e9,1)+" billion light-years";
}
function fmtLight(km){
  if(km<2)return"Light crosses it in "+sci(km/299792.458,"s");
  if(km<3)return"Starlight, arriving now";
  const s=km/299792.458;
  if(s<60)return"Light takes "+nf(s,1)+" seconds";
  if(s<3600)return"Light takes "+nf(s/60)+" minutes";
  if(s<3*86400)return"Light takes "+nf(s/3600,1)+" hours";
  const y=km/LY;
  if(y<1)return"Light takes "+nf(y*365.25)+" days";
  return"This light left "+(y<1e6?nf(Math.round(y)):y<9.995e8?nf(y/1e6,1)+" million":nf(y/1e9,1)+" billion")+" years ago";
}
const readScroll=()=>{Pt=clamp(opts.getP(),0,LASTI);};
addEventListener("scroll",()=>{readScroll();kick();},{passive:true});
function setPtr(e){const r=stage.getBoundingClientRect();ptr.tx=((e.clientX-r.left)/r.width)*2-1;ptr.ty=((e.clientY-r.top)/r.height)*2-1;}
addEventListener("pointermove",e=>{ptr.inside=true;setPtr(e);},{passive:true});
addEventListener("pointerdown",e=>{ptr.inside=true;setPtr(e);},{passive:true});
document.addEventListener("pointerleave",()=>{ptr.inside=false;});
addEventListener("pointerup",e=>{if(e.pointerType!=="mouse")ptr.inside=false;});
let stageVisible=true;

/* ---------- WebGL particle engine ---------- */
let gl=null;
try{gl=cv.getContext("webgl",{antialias:false,alpha:false,preserveDrawingBuffer:true,powerPreference:"high-performance"});}catch(_){gl=null;}
const VS=`precision highp float;
attribute vec4 aPA,aCA,aPB,aCB,aR;
uniform float uMix,uTime,uHoldA,uSpinA,uModeA,uModeB,uDist,uAspect,uPx,uMouseOn,uMotion,uShift,uLensA,uLensB,uReveal,uBeta,uBang;
uniform vec2 uMouse;
varying vec3 vC;
varying float vB;
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,s,-s,c);}
float horizon(float x){return -.95+.12*sin(x*1.7)+.06*sin(x*4.3+1.);}
float ecc(float r){return r<.25?.25:abs(r-.5)<.02?.32:.07;}
vec2 kep(float a,float e,float M){float E=M;for(int k=0;k<6;k++)E-=(E-e*sin(E)-M)/(1.-e*cos(E));return vec2(a*(cos(E)-e),a*sqrt(1.-e*e)*sin(E));}
vec4 anim(vec4 p,float mode,float hold,float spin,out float sz,out float lit,out float dp){
  vec3 q=p.xyz;float k=p.w;float vis=1.;sz=1.;lit=1.;dp=0.;
  if(abs(k-1.)<.1)return vec4(q,1.);
  bool orb=k>7.9;float orR=max((k-8.)*10.,.15);
  if(mode<.5){vec2 pole=vec2(-.35,1.5);q.xy=pole+rot(spin)*(q.xy-pole);if(q.y<horizon(q.x)+.012)vis=0.;}
  else if(mode<1.5){
    if(abs(k-2.)<.1)q.xz=rot(spin+uTime*.12)*q.xz;else q.xz=rot(spin*.5+uTime*.035)*q.xz;
    q.yz=rot(.42)*q.yz;q.xy=rot(-.28)*q.xy;
    if(abs(k-2.)<.1){vis=step(0.,q.z);lit=.1+.9*clamp(dot(normalize(q),normalize(vec3(-.6,.35,.75))),0.,1.);}
    else if(q.z<0.&&length(q.xy)<.6)vis=0.;
  }
  else if(mode<2.5){
    q*=1.+hold*.22;float r=length(q.xz);q.xz=rot((uTime*.03+spin*.4)/(r+.6))*q.xz;q.y+=sin(q.x*3.+uTime*.25)*.02;
    if(abs(k-4.)<.1)sz=1.+hold*1.6;
  }
  else if(mode<3.5){
    float r=length(q.xz);q.xz=rot((uTime*.04+spin)*.35/(r+.25))*q.xz;
    q.yz=rot(mix(.5,1.25,hold))*q.yz;q.xy=rot(.3)*q.xy;
  }
  else if(mode<4.5){q*=.78+.62*hold*hold;q.xz=rot(uTime*.05)*q.xz;q.yz=rot(.25+sin(uTime*.1)*.1)*q.yz;}
  else if(mode<5.5){
    if(orb)q.xz=rot((uTime*.12+spin*2.5)/pow(orR,1.5))*q.xz;else q.xz=rot(spin+uTime*.05)*q.xz;
    q.yz=rot(.12)*q.yz;
    if(abs(k-2.)<.1){vis=step(0.,q.z);lit=.05+.95*clamp(dot(normalize(q),normalize(vec3(-.8,.25,.5))),0.,1.);}
    else if(orb&&q.z<0.&&length(q.xy)<.74)vis=0.;
  }
  else if(mode<6.5){
    float om=(uTime*.1+spin*3.)*.3;
    if(abs(k-13.)<.1){float w=5.5;vec2 P=rot(w)*kep(.5,.32,q.z-w+om/pow(.5,1.5)-q.y*.8)*sqrt(q.x);lit=.4+.9*(1.-q.y);q=vec3(P.x,0.,P.y);}
    else if(abs(k-15.)<.1){lit=pow(max(0.,sin(uTime*(2.+aR.y*3.)+aR.x*40.)),30.)*6.;sz=1.+lit*.3;}
    else if(orb){float w=orR*11.;vec2 c0=normalize(q.xz+1e-5)*orR,off=q.xz-c0;q.xz=rot(w)*kep(orR,ecc(orR),atan(c0.y,c0.x)-w+om/pow(orR,1.5))+off;}
    q.yz=rot(mix(.28,1.05,hold))*q.yz;
  }
  else if(mode<7.5){
    float ph=uTime*9.42;vec3 ax=vec3(sin(.8)*cos(ph),cos(.8),sin(.8)*sin(ph));
    if(abs(k-14.)<.1){vec3 u1=normalize(cross(ax,vec3(.3,0.,1.))),u2=cross(ax,u1);float s=q.x;
      q=ax*s*q.y+(u1*cos(q.z)+u2*sin(q.z))*s*.07*aR.y;lit=(1.-s/1.6)*(1.-s/1.6)*1.4;return vec4(q,1.);}
    q.xz=rot(uTime*.03)*q.xz;
    if(abs(k-9.)<.1)sz=1.+2.2*pow(abs(sin(ph)),12.);
    else{q*=mix(.05,1.12,hold);float fl=1.-hold;lit=1.+fl*fl*2.2;}
  }
  else if(mode<8.5){
    if(abs(k-11.)<.1){float f=fract(uTime*.06+aR.x*7.),r=aR.y<.35?.37-f*.08:.31+f*1.6;
      q=vec3(cos(q.x)*r*1.05,sin(q.x)*r*.92,.02);lit=aR.y<.35?(1.-f)*.8:1.-f;return vec4(q,1.);}
    if(abs(k-10.)<.1)q.xy=rot(uTime*.04)*q.xy;
    else{float r=length(q.xz);q.xz=rot((uTime*.5+spin*5.)*.1/pow(max(r,.3),1.5))*q.xz;dp=q.x/max(r,.01);lit=pow(1.+.42*dp,3.);
      q.yz=rot(.17)*q.yz;q.xy=rot(-.12)*q.xy;if(q.z<0.&&length(q.xy)<.31)vis=0.;}
  }
  else if(mode<9.5){float r=length(q.xz);q.xz=rot((uTime*.03+spin)*.3/(r+.25))*q.xz;q.yz=rot(.3)*q.yz;q.xy=rot(.6)*q.xy;}
  else if(mode<10.5){
    if(k>17.9){vec3 h=fract(sin(q*vec3(12.9,78.2,37.7)+q.yzx*5.1)*43758.5);float f=fract(uTime*(.25+h.x*.3)+h.y);
      q+=normalize(h-.5)*sin(3.14159*f)*.08*(k>18.5?1.:-1.);lit=pow(sin(3.14159*f),2.)*1.8;}
    if(abs(k-12.)<.1){vec2 c=floor(q.xy/.8+.5)*.8;vec2 d=q.xy-c;float r=length(d),th=atan(d.y,d.x),n=2.+floor(aR.x*4.);
      r*=1.+(.2+hold*.15)*sin(n*th+uTime*(1.4+n*.5)+spin*6.);q.xy=c+vec2(cos(th),sin(th))*r;q.z+=.05*sin(n*th-uTime*2.);}
    else{q.xz=rot(uTime*.12+spin*2.)*q.xz;q.yz=rot(.35+sin(uTime*.2)*.15)*q.yz;q*=1.+.035*sin(length(q)*12.-uTime*3.);}
  }
  else{
    /* the Big Bang: one bright point, inflation, then steady expansion; the afterglow appears once light breaks free */
    float b=uBang,a=b<.1?.003+.62*pow(b/.1,3.):.625+.375*smoothstep(.1,.95,b);
    if(abs(k-20.)>.1)q+=normalize(aR.yzw-.5+1e-4)*pow(aR.x,.333)*.9*(1.-smoothstep(.35,.9,b));
    q=q*a;q.xz=rot(uTime*.03)*q.xz;q.yz=rot(.2)*q.yz;
    if(abs(k-20.)<.1)lit=smoothstep(.3,.5,b)*(q.z>0.?.3:1.);else{float hot=1.-smoothstep(.02,.3,b);lit=1.+2.5*hot;sz=mix(1.,.35,1.-smoothstep(.0,.08,b));}
  }
  return vec4(q,vis);
}
void main(){
  float d=aR.x*.45;float t=smoothstep(d,d+.55,uMix);
  float sA,lA,sB,lB,dA,dB;
  vec4 A=anim(aPA,uModeA,uHoldA,uSpinA,sA,lA,dA);
  vec4 B=anim(aPB,uModeB,0.,0.,sB,lB,dB);
  vec3 p=mix(A.xyz,B.xyz,t);
  float fly=sin(t*3.14159)*uMotion;
  float hn=1.+floor(aR.x*5.);
  vec3 wv=vec3(sin(p.y*3.1+uTime*1.7+hn),sin(p.x*2.3*hn+uTime*2.3),cos(p.x*1.7+p.y*2.+uTime*1.3));
  vec3 jr=normalize(aR.yzw-.5+1e-4)*pow(aR.x,.333)*.5;
  p+=wv*fly*.55+jr*fly*.22;
  p.z+=fly*aR.y*1.3;
  p+=(aR.yzw-.5)*.01*sin(uTime*(6.+floor(aR.x*6.)*3.)+aR.y*40.)*uMotion;
  float vz=uDist-p.z;
  if(vz<.2){gl_Position=vec4(3.,3.,3.,1.);gl_PointSize=0.;vC=vec3(0.);return;}
  vec2 sp=p.xy*1.6/vz;sp.x/=uAspect;sp.x+=uShift;
  float kind=t<.5?aPA.w:aPB.w,glow=1.;
  vec2 dm=(sp-uMouse)*vec2(uAspect,1.);float near=exp(-dot(dm,dm)/.05)*uReveal;
  vec3 tint=vec3(1.);
  /* entangled pairs: measuring either cloud settles both, one amber and one blue */
  bool ent=abs(kind-16.)<.1||abs(kind-17.)<.1;
  if(ent){vec2 s2=-p.xy*1.6/(uDist+p.z);s2.x/=uAspect;s2.x+=uShift;vec2 d2=(s2-uMouse)*vec2(uAspect,1.);
    near=max(near,exp(-dot(d2,d2)/.05)*uReveal);float tq=uMotion>.5?floor(uTime*20.):0.;
    vec3 h=fract(sin(vec3(dot(aR.xy,vec2(12.99,78.23)),dot(aR.zw,vec2(39.35,11.13)),dot(aR.xw,vec2(73.15,52.21)))+tq*vec3(.71,1.13,.37))*43758.55);
    p+=(aR.yzw-.5)*.05+(h-.5)*.32*(1.-near);vz=uDist-p.z;sp=p.xy*1.6/vz;sp.x/=uAspect;sp.x+=uShift;
    tint=mix(vec3(1.),abs(kind-16.)<.1?vec3(2.4,1.5,.6):vec3(.7,1.5,2.6),near);}
  /* quantum uncertainty: at the Planck scale each point is a cloud until the cursor measures it */
  float fz=(uModeA>9.5&&abs(aPA.w)<.1?1.-t:0.)+(uModeB>9.5&&abs(aPB.w)<.1?t:0.);
  if(fz>0.){float tq=uMotion>.5?floor(uTime*24.):0.;
    vec3 h=fract(sin(vec3(dot(aR.xy,vec2(12.99,78.23)),dot(aR.zw,vec2(39.35,11.13)),dot(aR.xw,vec2(73.15,52.21)))+tq*vec3(.71,1.13,.37))*43758.55);
    p+=(h-.5)*.36*fz*(1.-near);vz=uDist-p.z;sp=p.xy*1.6/vz;sp.x/=uAspect;sp.x+=uShift;glow=1.+near*fz*.8;}
  /* dark matter: invisible until the cursor passes over it */
  if(abs(kind-5.)<.1){glow=exp(-dot(dm,dm)/.14)*uReveal*2.2;}
  /* gravitational lensing of the background stars (point-lens images and magnification) */
  float lens=mix(uLensA,uLensB,t);
  if(lens>0.&&abs(kind-1.)<.1&&p.z<-1.){vec2 c=vec2(uShift,0.),d=(sp-c)*vec2(uAspect,1.);float r=length(d)+1e-5,u=r/lens,s=sqrt(u*u+4.);
    bool sec=aR.w<.35&&u<2.5;float th=sec?(u-s)*.5:(u+s)*.5,mu=(u*u+2.)/(2.*u*s)+(sec?-.5:.5);
    sp=c+d/r*th*lens/vec2(uAspect,1.);glow=clamp(mu,0.,4.);}
  /* tidal stretching near the black hole: along the line to the hole, squeezed across it */
  float tide=(uModeA>7.5&&uModeA<8.5&&abs(aPA.w)<.1)?1.-t:0.;
  if(tide>0.){vec2 c=vec2(uShift,0.),n=normalize((uMouse-c)*vec2(uAspect,1.)+1e-5),d=(sp-uMouse)*vec2(uAspect,1.);
    float w=exp(-dot(d,d)/.025)*uReveal*tide,al=dot(d,n);vec2 pe=d-n*al;
    d=n*al*(1.+2.*w)+pe*(1.-.5*w)-n*.03*w;sp=uMouse+d/vec2(uAspect,1.);}
  if(abs(kind-1.)>.1&&abs(kind-5.)>.1&&fz<.5&&!ent&&tide<.5){
    vec2 dd=(sp-uMouse)*vec2(uAspect,1.);float dl=length(dd);
    sp+=dd/(dl+1e-4)/vec2(uAspect,1.)*.12*exp(-dl*dl/.03)*uMouseOn;
  }
  /* special relativity: fast scrolling is flying near light speed (aberration plus Doppler shift) */
  if(abs(uBeta)>.003){vec2 c=vec2(uShift,0.),d=(sp-c)*vec2(uAspect,1.);float r=length(d)+1e-5,ct=cos(atan(r/1.6)),c2=(ct+uBeta)/(1.+uBeta*ct);
    sp=c+d/r*1.6*tan(min(acos(clamp(c2,-1.,1.)),1.45))/vec2(uAspect,1.);
    float D=sqrt(1.-uBeta*uBeta)/(1.-uBeta*c2),sh=clamp(log(D)*1.4,-1.,1.);tint*=vec3(1.-.45*sh,1.-.12*abs(sh),1.+.6*sh)*clamp(D,.5,1.6);}
  gl_Position=vec4(sp,0.,1.);
  float tw=1.+.28*sin(uTime*(1.5+aR.z*4.)+aR.x*60.)*uMotion;
  float size=mix(aCA.w*sA,aCB.w*sB,t)*tw*(glow>1.?sqrt(glow):1.);
  vB=smoothstep(2.4,5.2,size)*(1.-fly);
  gl_PointSize=clamp(size*uPx*3./vz*(1.+vB*3.),1.,150.);
  float vis=mix(A.w,B.w,t);
  vec3 dopA=vec3(1.-.28*dA,1.,1.+.4*dA),dopB=vec3(1.-.28*dB,1.,1.+.4*dB);
  vC=mix(aCA.rgb*lA*dopA,aCB.rgb*lB*dopB,t)*vis*(1.+fly*.3)*glow*tint;
}`;
const FS=`precision mediump float;varying vec3 vC;varying float vB;
void main(){vec2 q=gl_PointCoord-.5;float r=length(q),s=1.+vB*3.;
  float core=smoothstep(.5,0.,r*s);core*=core;
  float halo=exp(-r*10.)*.45*vB;
  float spikes=(exp(-abs(q.x)*130.)*exp(-abs(q.y)*6.5)+exp(-abs(q.y)*130.)*exp(-abs(q.x)*6.5))*vB;
  gl_FragColor=vec4(vC*(core*1.3+halo)+mix(vC,vec3(1.),.5)*spikes*.9,1.);}`;
/* Spacetime sheet: a grid of lines bent by every mass in the scene (general relativity),
   woven into loops at the Planck scale (loop quantum gravity). Two sheets, for the scene we leave and the one we reach. */
const GVS=`precision highp float;
attribute vec3 aG;
uniform vec4 uWA[6],uWB[6],uSA,uSB,uTA,uTB,uXA,uXB;
uniform float uMix,uDist,uAspect,uShift,uMouseOn,uLines,uTime;
uniform vec2 uMouse;
varying float vA,vD;
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,s,-s,c);}
vec4 sheet(vec4 S,vec4 T,vec4 X,bool A){
  vec2 p=aG.xy*S.y*T.z;float y=S.x,dip=0.;
  float r2=dot(p,p);if(X.x>0.)p=rot(X.x*(.9/(r2+.12))+uTime*.1*X.x)*p;
  for(int k=0;k<6;k++){vec4 w=A?uWA[k]:uWB[k];vec2 d=p-w.xy*T.z;dip+=w.z*w.w/sqrt(dot(d,d)+w.w*w.w+1e-4);}
  y-=dip;
  if(X.y>0.){float r=sqrt(r2),ph=atan(p.y,p.x);y+=X.y*.11*sin(7.*r-uTime*2.4+2.*ph)*smoothstep(.15,.6,r)*exp(-r*.25);}
  if(S.w>0.){float c=2.*S.y*T.z/(uLines-1.),fixd=aG.z<.5?aG.y:aG.x,idx=floor((fixd+1.)*(uLines-1.)*.5+.5);
    float sg=mod(idx,2.)*2.-1.;y+=S.w*c*.4*cos(3.14159*(aG.z<.5?p.x:p.y)/c)*sg*(aG.z<.5?1.:-1.);}
  vec3 q=vec3(p.x,y,p.y);q.xz=rot(T.w)*q.xz;q.yz=rot(T.x)*q.yz;q.xy=rot(T.y)*q.xy;
  return vec4(q,dip);
}
void main(){
  float m=smoothstep(0.,1.,uMix);
  vec4 A=sheet(uSA,uTA,uXA,true),B=sheet(uSB,uTB,uXB,false);
  vec3 q=mix(A.xyz,B.xyz,m);
  float vz=uDist-q.z;vec2 sp=q.xy*1.6/max(vz,.05);sp.x/=uAspect;sp.x+=uShift;
  vec2 dm=(sp-uMouse)*vec2(uAspect,1.);float pull=exp(-dot(dm,dm)/.03)*uMouseOn;
  q.y-=.2*pull;vz=uDist-q.z;
  sp=q.xy*1.6/max(vz,.05);sp.x/=uAspect;sp.x+=uShift;
  gl_Position=vec4(sp,0.,1.);
  float edge=1.-smoothstep(.35,1.,length(aG.xy));
  vA=mix(uSA.z,uSB.z,m)*edge*smoothstep(.45,1.1,vz)*clamp(3.2/vz,0.,1.4);
  vD=clamp(mix(A.w,B.w,m)*1.6+pull*.8,0.,1.);
}`;
const GFS=`precision mediump float;varying float vA,vD;uniform float uFade;
void main(){vec3 c=mix(vec3(.3,.42,.85),vec3(1.,.72,.42),vD)*(.17+.14*vD);
  gl_FragColor=vec4(c*vA*uFade+(vA>.004?2./255.:0.),1.);}`;
const QVS=`attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
const QFS=`precision mediump float;uniform vec4 uC;void main(){gl_FragColor=uC;}`;

let prog,qprog,gprog,GU={},gridBuf,gridN=0,GL_LINES_N=49,U={},QU={},bufP=[],bufC=[],bufR,quad,slot=0,W=1,H=1,dpr=1,A_LOC={};
function sh(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;}
function link(vs,fs){const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,vs));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));return p;}
function upload(s,i){const F=form(i);gl.bindBuffer(gl.ARRAY_BUFFER,bufP[s]);gl.bufferData(gl.ARRAY_BUFFER,F.p,gl.DYNAMIC_DRAW);gl.bindBuffer(gl.ARRAY_BUFFER,bufC[s]);gl.bufferData(gl.ARRAY_BUFFER,F.c,gl.DYNAMIC_DRAW);}
if(gl){
  try{
    prog=link(VS,FS);qprog=link(QVS,QFS);
    ["uMix","uTime","uHoldA","uSpinA","uModeA","uModeB","uDist","uAspect","uPx","uMouseOn","uMotion","uMouse","uShift","uLensA","uLensB","uReveal","uBeta","uBang"].forEach(n=>U[n]=gl.getUniformLocation(prog,n));
    ["aPA","aCA","aPB","aCB","aR"].forEach(n=>A_LOC[n]=gl.getAttribLocation(prog,n));
    QU.uC=gl.getUniformLocation(qprog,"uC");QU.p=gl.getAttribLocation(qprog,"p");
    gprog=link(GVS,GFS);
    ["uWA","uWB","uSA","uSB","uTA","uTB","uXA","uXB","uMix","uDist","uAspect","uShift","uMouseOn","uLines","uMouse","uFade","uTime"].forEach(n=>GU[n]=gl.getUniformLocation(gprog,n));
    GU.aG=gl.getAttribLocation(gprog,"aG");
    { const L=GL_LINES_N,M=96,v=[];
      for(let dir=0;dir<2;dir++)for(let l=0;l<L;l++){const f=-1+2*l/(L-1);
        for(let k=0;k<M;k++){const a=-1+2*k/M,b=-1+2*(k+1)/M;
          if(dir===0)v.push(a,f,0,b,f,0);else v.push(f,a,1,f,b,1);}}
      gridN=v.length/3;gridBuf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,gridBuf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(v),gl.STATIC_DRAW); }
    for(let s=0;s<2;s++){bufP[s]=gl.createBuffer();bufC[s]=gl.createBuffer();}
    upload(0,0);upload(1,1);pair=[0,1];
    const r=new Float32Array(N*4);for(let j=0;j<r.length;j++)r[j]=R();
    bufR=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,bufR);gl.bufferData(gl.ARRAY_BUFFER,r,gl.STATIC_DRAW);
    quad=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,quad);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    gl.enable(gl.BLEND);gl.clearColor(0,0,0,1);
  }catch(err){console.warn("WebGL unavailable, using a still canvas",err);gl=null;}
}
const c2d=gl?null:cv.getContext("2d");

const bloom=opts.bloom||null,bctx=bloom&&bloom.getContext("2d");
function resize(){
  const r=stage.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,1.75);
  W=Math.max(1,Math.round(r.width*dpr));H=Math.max(1,Math.round(r.height*dpr));cv.width=W;cv.height=H;
  if(bloom){bloom.width=Math.max(1,W>>2);bloom.height=Math.max(1,H>>2);}
  readScroll();
  if(gl){gl.viewport(0,0,W,H);gl.clear(gl.COLOR_BUFFER_BIT);}
  kick();
}
new ResizeObserver(resize).observe(stage);

/* where the sheet sits for scene i: mirrors the tilts in the shader's anim() so the dips stay under their bodies */
const WA=new Float32Array(24),WB=new Float32Array(24);
function sheetParams(i,hold,spin,t,W){
  const sc=SCENES[i],g=sc.gr,m=sc.mode;let yz=0,xy=0,scale=1,yaw=0,orbit=null;
  if(m===1){yz=.42;xy=-.28;}
  else if(m===2)scale=1+hold*.22;
  else if(m===3){yz=lerp(.5,1.25,hold);xy=.3;}
  else if(m===4){scale=.78+.62*hold*hold;yaw=t*.05;yz=.25+Math.sin(t*.1)*.1;orbit=()=>0;}
  else if(m===5){yz=.12;orbit=r=>(t*.12+spin*2.5)/Math.pow(r,1.5);}
  else if(m===6){yz=lerp(.28,1.05,hold);orbit=r=>(t*.1+spin*3)*.3/Math.pow(r,1.5);}
  else if(m===11)yz=.2;
  else if(m===7)yaw=t*.03;
  else if(m===8){yz=.17;xy=-.12;}
  else if(m===9){yz=.3;xy=.6;}
  else if(m===10)yz=.3;
  W.fill(0);W[2]=g.M;W[3]=g.s;
  if(orbit){let k=1;for(const [r,a,M,s] of form(i).bodies){if(k>5)break;let x,z;
    if(m===6){const w=peri(r);[x,z]=rot2(kep(r,ecc(r),a-w+orbit(r)),w);}else{const th=a+orbit(r);x=Math.cos(th)*r;z=Math.sin(th)*r;}
    W[k*4]=x;W[k*4+1]=z;W[k*4+2]=M;W[k*4+3]=s;k++;}}
  if(g.gw)for(const k of[1,2]){const th=t*1.2+(k-1)*Math.PI;W[k*4]=Math.cos(th)*.09;W[k*4+1]=Math.sin(th)*.09;W[k*4+2]=.18;W[k*4+3]=.05;}
  return{S:[g.y,g.size,g.a,g.weave||0],T:[yz,xy,scale,yaw],X:[g.fd||0,g.gw||0,0,0]};
}
function drawGrid(fade,mixV,dist,hold,spin,i,j,t){
  const A=sheetParams(i,ease(hold),spin,t,WA),B=sheetParams(j,0,0,t,WB);
  if(A.S[2]===0&&B.S[2]===0)return;
  gl.useProgram(gprog);
  for(const l of Object.values(A_LOC))gl.disableVertexAttribArray(l);
  gl.bindBuffer(gl.ARRAY_BUFFER,gridBuf);gl.enableVertexAttribArray(GU.aG);gl.vertexAttribPointer(GU.aG,3,gl.FLOAT,false,0,0);
  gl.uniform4fv(GU.uWA,WA);gl.uniform4fv(GU.uWB,WB);
  gl.uniform4fv(GU.uSA,A.S);gl.uniform4fv(GU.uSB,B.S);gl.uniform4fv(GU.uTA,A.T);gl.uniform4fv(GU.uTB,B.T);gl.uniform4fv(GU.uXA,A.X);gl.uniform4fv(GU.uXB,B.X);gl.uniform1f(GU.uTime,t);
  gl.uniform1f(GU.uMix,mixV);gl.uniform1f(GU.uDist,dist);gl.uniform1f(GU.uAspect,W/H);gl.uniform1f(GU.uShift,shiftV);
  gl.uniform1f(GU.uMouseOn,reduced?mouseOn*.5:mouseOn);gl.uniform2f(GU.uMouse,ptr.mx,-ptr.my);gl.uniform1f(GU.uLines,GL_LINES_N);gl.uniform1f(GU.uFade,fade);
  gl.drawArrays(gl.LINES,0,gridN);
  gl.disableVertexAttribArray(GU.aG);
}
function bindAttr(name,buf){const l=A_LOC[name];gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,4,gl.FLOAT,false,0,0);}
function drawGL(fade,mixV,dist,hold,spin,i,j){
  const t=reduced?0:time;
  gl.useProgram(qprog);
  for(const l of Object.values(A_LOC))gl.disableVertexAttribArray(l);
  gl.bindBuffer(gl.ARRAY_BUFFER,quad);gl.enableVertexAttribArray(QU.p);gl.vertexAttribPointer(QU.p,2,gl.FLOAT,false,0,0);
  gl.blendEquation(gl.FUNC_ADD);gl.blendFunc(gl.ZERO,gl.ONE_MINUS_SRC_ALPHA);gl.uniform4f(QU.uC,0,0,0,fade);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  gl.blendEquation(gl.FUNC_REVERSE_SUBTRACT);gl.blendFunc(gl.ONE,gl.ONE);gl.uniform4f(QU.uC,2/255,2/255,2/255,0);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  gl.disableVertexAttribArray(QU.p);
  gl.blendEquation(gl.FUNC_ADD);gl.blendFunc(gl.ONE,gl.ONE);
  drawGrid(fade,mixV,dist,hold,spin,i,j,t);
  gl.useProgram(prog);
  bindAttr("aPA",bufP[0]);bindAttr("aCA",bufC[0]);bindAttr("aPB",bufP[1]);bindAttr("aCB",bufC[1]);bindAttr("aR",bufR);
  gl.uniform1f(U.uMix,mixV);gl.uniform1f(U.uTime,t);gl.uniform1f(U.uHoldA,ease(hold));gl.uniform1f(U.uSpinA,spin);
  gl.uniform1f(U.uModeA,SCENES[i].mode);gl.uniform1f(U.uModeB,SCENES[j].mode);gl.uniform1f(U.uDist,dist);
  gl.uniform1f(U.uAspect,W/H);gl.uniform1f(U.uShift,shiftV);gl.uniform1f(U.uPx,H/760);gl.uniform1f(U.uMotion,reduced?0:1);
  gl.uniform2f(U.uMouse,ptr.mx,-ptr.my);gl.uniform1f(U.uMouseOn,reduced?0:mouseOn);gl.uniform1f(U.uReveal,mouseOn);
  gl.uniform1f(U.uLensA,SCENES[i].lens||0);gl.uniform1f(U.uLensB,SCENES[j].lens||0);gl.uniform1f(U.uBeta,beta);gl.uniform1f(U.uBang,bang);
  gl.drawArrays(gl.POINTS,0,N);
  if(bctx&&!reduced){bctx.globalCompositeOperation="copy";bctx.drawImage(cv,0,0,bloom.width,bloom.height);}
}
function draw2D(k){
  const f=form(k),asp=W/H;c2d.fillStyle="#04050a";c2d.fillRect(0,0,W,H);
  for(let i=0;i<N;i+=2){const o=i*4,vz=3.2-f.p[o+2];const x=(f.p[o]*1.6/vz/asp*.5+.5)*W,y=(-f.p[o+1]*1.6/vz*.5+.5)*H;
    c2d.fillStyle=`rgb(${f.c[o]*255|0},${f.c[o+1]*255|0},${f.c[o+2]*255|0})`;c2d.fillRect(x,y,dpr*1.4,dpr*1.4);}
}

let running=false,scheduled=false;
function kick(){if(!running&&!scheduled){scheduled=true;last=performance.now();requestAnimationFrame(loop);}}
function loop(now){
  running=true;scheduled=false;
  const dt=clamp((now-last)/1000,0,.05);last=now;time+=dt;
  readScroll();
  P=reduced?Pt:P+(Pt-P)*(1-Math.pow(.0004,dt));
  if(Math.abs(Pt-P)<1e-4)P=Pt;P=clamp(P,0,LASTI);
  const vP=(P-lastP)/Math.max(dt,1e-3);lastP=P;
  beta+=((reduced?0:clamp(vP*.3,-.6,.6))-beta)*Math.min(1,dt*5);if(Math.abs(beta)<.002)beta=0;
  const i=Math.min(Math.floor(P),LASTI),u=P-i,end=i>=LASTI;
  const hold=end?0:clamp(u/.68,0,1),mixV=end?0:ease(clamp((u-.68)/.32,0,1)),j=end?i:i+1;
  if(gl&&(pair[0]!==i||pair[1]!==j)){upload(0,i);upload(1,j);pair=[i,j];}
  const show=mixV>.5?j:i,bs=SCENES[show].beats.length,beat=show===i?Math.min(bs-1,Math.floor(hold*bs*.999)):0,key=show*10+beat;
  if(key!==shown){shown=key;setUI(show,beat);}
  bang=SCENES[show].bang?(reduced?1:Math.min(1,bang+dt/16)):0;
  const km=Math.exp(lerp(Math.log(SCENES[i].km),Math.log(SCENES[j].km),mixV));
  if(Math.abs(km-(loop.km||0))>km*1e-4){loop.km=km;hudD.textContent=fmtDist(km);hudL.textContent=fmtLight(km);}
  const spin=SCENES[i].spin(ease(hold))*(reduced?.3:1);
  const k=1-Math.pow(.001,dt);
  ptr.mx+=(ptr.tx-ptr.mx)*Math.min(1,k*2);ptr.my+=(ptr.ty-ptr.my)*Math.min(1,k*2);
  mouseOn+=((ptr.inside?1:0)-mouseOn)*Math.min(1,k);
  shiftV+=((opts.shift?opts.shift():0)-shiftV)*.06;
  bar.style.transform=`scaleX(${(P/LASTI).toFixed(4)})`;
  cue.style.opacity=P<.06?1:0;
  const dist=lerp(SCENES[i].dist(hold),SCENES[j].dist(0),mixV);
  const fade=reduced?1:(mixV>0&&mixV<1)?.16:(SCENES[i].trail?lerp(.5,.035,ease(hold)):.55);
  if(gl)drawGL(fade,mixV,dist,hold,spin,i,j);else draw2D(mixV>.5?j:i);
  if(stageVisible&&!document.hidden)requestAnimationFrame(loop);else running=false;
}
document.addEventListener("visibilitychange",()=>{if(!document.hidden)kick();});
resize();
return{goTo(i){opts.scrollToP(i);}};
}
return{SCENES,ROMAN,reduced,init};
})();
