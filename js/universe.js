/* Particle universe: WebGL engine and the twelve formations of the journey. */
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
const mk=()=>({p:new Float32Array(N*4),c:new Float32Array(N*4)});
function set(f,i,x,y,z,k,r,g,b,s){const o=i*4;f.p[o]=x;f.p[o+1]=y;f.p[o+2]=z;f.p[o+3]=k;f.c[o]=r;f.c[o+1]=g;f.c[o+2]=b;f.c[o+3]=s;}
const horizon=x=>-.95+.12*Math.sin(x*1.7)+.06*Math.sin(x*4.3+1);
function bgStars(f,i,n){for(let j=0;j<n;j++){const m=Math.pow(R(),3);set(f,i++,(R()*2-1)*4.2,(R()*2-1)*2.6,-1.2-R()*2.5,1,...starCol(.18+m*.7),1+m*2.2);}return i;}

/* ---------- formations ----------
   kind: 0 animated · 1 static · 2 lit sphere · 3 rings · 4 young stars · 9 pulsar · 10 lensed light
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
  for(let j=0,n=N*.32|0;j<n;j++){const t=-3.6+R()*7.2,off=gauss()*.2*(1+.5*Math.sin(t*2.1));const b=.15+R()*.3;
    const c=R()<.55?[.72,.8,1]:[1,.86,.72];set(f,i++,t-off*.35,.2+t*.36+off,0,0,c[0]*b,c[1]*b,c[2]*b,1+R()*1.4);}
  while(i<N){const m=Math.pow(R(),4);set(f,i++,-3.6+R()*7.2,-1+R()*3.2,0,0,...starCol(.12+m*1.05),.9+m*4.2);}
  return f;
}
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
    const a=k*1.9+.4;i=blob(f,i,N*.008|0,Math.cos(a)*r,0,Math.sin(a)*r,s,8+r/10,c.map(v=>v*.7),1.5);});
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
  PL.forEach(([r])=>{for(let j=0,n=N*.02|0;j<n;j++){const a=R()*TAU;set(f,i++,Math.cos(a)*r,0,Math.sin(a)*r,0,.045,.055,.1,1);}});
  PL.forEach(([r,s,c])=>{const a=R()*TAU;i=blob(f,i,N*.007|0,Math.cos(a)*r,0,Math.sin(a)*r,s,8+r/10,c.map(v=>v*.75),1.4);});
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
  for(let j=0,n=N*.28|0;j<n;j++){const b=.045+R()*.07;set(f,i++,gauss()*.28,gauss()*.2,gauss()*.2,0,b*.55,b*.7,b*1.2,2.5+R()*2.5);}
  while(i<N){const n=onSphere();
    const fil=Math.sin(n[0]*9+Math.sin(n[1]*7)*2)*Math.sin(n[1]*8+n[2]*6)*Math.sin(n[2]*10+n[0]*3);
    if(Math.abs(fil)>.15&&R()<.85)continue;
    const r=(.55+gauss()*.06)*(1+fil*.3),b=.12+R()*.18,c=R()<.7?[1,.35,.22]:[1,.75,.4];
    set(f,i++,n[0]*r*1.25,n[1]*r*.9,n[2]*r,0,c[0]*b,c[1]*b,c[2]*b,1.3+R()*1.2);}
  return f;
}
function fBlackHole(){
  const f=mk();let i=bgStars(f,0,N*.07|0);
  for(let j=0,n=N*.62|0;j<n;j++){const r=.36+Math.pow(R(),1.6)*1.1,a=R()*TAU,t=(r-.36)/1.1,b=(.5-.38*t)*(.6+R()*.4);
    set(f,i++,Math.cos(a)*r,gauss()*.006*(1+t*3),Math.sin(a)*r,0,b,b*lerp(.95,.45,t),b*lerp(.85,.18,t),1.1+R()*.9);}
  for(let j=0,n=N*.05|0;j<n;j++){const a=R()*TAU,r=.29+Math.abs(gauss())*.012;set(f,i++,Math.cos(a)*r,Math.sin(a)*r,0,10,.5,.43,.3,1.2);}
  while(i<N){const a=R()*TAU,r=.36+Math.pow(R(),1.8)*.5,t=(r-.36)/.5,b=(.35-.25*t)*(.5+R()*.5);
    set(f,i++,Math.cos(a)*r*1.05,Math.sin(a)*r*.92,-.01,10,b,b*.75,b*.45,1.1);}
  return f;
}
function fGalaxy(o={}){
  const wind=o.wind||2.3,f=mk();let i=bgStars(f,0,N*.05|0);
  if(o.sats){i=blob(f,i,N*.012|0,.42,.2,.3,.04,1,[.5,.42,.3],1.4);for(let j=0,n=N*.02|0;j<n;j++)set(f,i++,-.6+gauss()*.07,-.42+gauss()*.05,.3,1,.2,.18,.15,1.6);}
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
  const COL=[[1,.76,.48],[.66,.78,1],[.95,.93,.9]];
  while(i<N){const k1=(R()*n)|0,k2=(R()*n)|0,a=(R()*2-1)*1.05,b=R()*Math.PI/2;
    const ch=[Math.cosh(a)*Math.cos(b),Math.sinh(a)*Math.sin(b)],sh=[Math.sinh(a)*Math.cos(b),Math.cosh(a)*Math.sin(b)];
    const z1=rotc(pw(ch,2/n),TAU*k1/n),z2=rotc(pw([sh[1],-sh[0]],2/n),TAU*k2/n);
    const c=COL[(k1+k2)%3],v=.2+R()*.22;
    set(f,i++,z1[0]*.95,z2[0]*.95,(Math.cos(al)*z1[1]+Math.sin(al)*z2[1])*.95,0,c[0]*v,c[1]*v,c[2]*v,1.05+R()*.5);}
  return f;
}
const LY=9.461e12;
const SCENES=[
  {name:"Look up",make:fSky,mode:0,km:2.14,dist:()=>3,trail:true,spin:h=>h*h*2.6,b:"to turn the sky",coord:"Your site · look north for Polaris",beats:[
    "Twenty minutes after the last light goes out, your eyes adjust and the Milky Way appears.",
    "Find the Big Dipper and follow its two pointer stars, Merak and Dubhe. They lead you to Polaris, the pole star.",
    "Keep scrolling and the Earth turns. Every star circles the pole, drawing the trails a long-exposure photo would catch."]},
  {name:"The Moon",make:fMoon,mode:5,km:384400,dist:h=>lerp(3.5,2.1,ease(h)),spin:h=>h*1.3,b:"to rotate the Moon",coord:"384,400 km away · 3,474 km wide",beats:[
    "Our first stop. The Moon is 384,400 km away, and its light reaches you in 1.3 seconds.",
    "The dark patches are maria, plains of old lava. Early astronomers thought they were seas.",
    "The best views are along the terminator, where low sunlight throws long shadows from crater walls."]},
  {name:"Jupiter",make:fJupiter,mode:5,km:7.2e8,dist:h=>lerp(3.8,3,ease(h)),spin:h=>h*3,b:"to watch the moons orbit",coord:"142,984 km wide · 4 Galilean moons",beats:[
    "Jupiter is so large that about 1,300 Earths would fit inside it.",
    "The Great Red Spot is a storm wider than Earth. People have watched it for at least 190 years.",
    "Galileo found its four largest moons in 1610. Io, Europa, Ganymede and Callisto change places every night."]},
  {name:"Saturn",make:fPlanet,mode:1,km:1.3e9,dist:h=>lerp(3.4,1.85,ease(h)),spin:h=>h*1.6,b:"to zoom in",coord:"1.3 billion km · magnitude 0.7",beats:[
    "In the 24-inch telescope, Saturn's rings look close enough to touch.",
    "The rings span about 280,000 km, yet most of them are less than a kilometre thick. They are made of water ice.",
    "Saturn is so light for its size that it would float in water, if you could find an ocean big enough."]},
  {name:"The Solar System",make:fSolar,mode:6,km:6e9,dist:h=>lerp(3.7,3,ease(h)),spin:h=>h*2,b:"to look down on the orbits",coord:"Sun to Neptune · 4.5 billion km",beats:[
    "Pull back far enough and the planets turn into points of light on nearly flat orbits.",
    "Between Mars and Jupiter lies the asteroid belt. Past Neptune is the icy Kuiper belt.",
    "Sunlight needs about four hours to reach Neptune. Next, we leave the Sun behind."]},
  {name:"Orion Nebula",make:fNebula,mode:2,km:1344*LY,dist:h=>lerp(3,2.3,ease(h)),spin:h=>h*1.4,b:"to light new stars",coord:"M42 · RA 05h 35m · Dec −05° 23′",beats:[
    "1,344 light-years away, a cloud of gas is collapsing into new stars.",
    "The four stars of the Trapezium at its heart are less than a million years old.",
    "On a winter night you can see it without a telescope, as a fuzzy star in Orion's sword."]},
  {name:"The Crab Nebula",make:fCrab,mode:7,km:6500*LY,dist:h=>lerp(2.4,3.1,h),spin:()=>0,b:"to watch it explode",coord:"M1 · RA 05h 34m · Dec +22° 01′",beats:[
    "In 1054, astronomers in China recorded a new star bright enough to see in daylight for 23 days.",
    "It was a supernova: a massive star exploding at the end of its life, 6,500 light-years away.",
    "The debris still expands at about 1,500 km per second. At its centre a neutron star spins 30 times a second."]},
  {name:"Sagittarius A*",make:fBlackHole,mode:8,km:26000*LY,dist:h=>lerp(3.3,2,ease(h)),spin:h=>h*3,b:"to fall closer",coord:"RA 17h 45m · Dec −29° 00′ · 4 million suns",beats:[
    "At the centre of our galaxy sits a black hole about 4 million times the mass of the Sun.",
    "Gas spiralling in heats up and glows. Gravity bends that light around the dark shadow.",
    "In 2022 the Event Horizon Telescope published the first image of it, made with radio dishes on several continents."]},
  {name:"The Milky Way",make:()=>fGalaxy(),mode:3,km:2e5*LY,dist:h=>lerp(3.1,3.7,ease(h)),spin:h=>h*3.2,b:"to spin a galactic year",coord:"Seen from 200,000 light-years out",beats:[
    "From far outside, this is roughly what our home galaxy would look like.",
    "It is about 100,000 light-years across and holds 100 to 400 billion stars.",
    "The Sun sits in a minor arm and needs 230 million years to go around once."]},
  {name:"Andromeda",make:()=>fGalaxy({wind:3.2,bulge:.26,ring:true,sats:true}),mode:9,km:2.5e6*LY,dist:h=>lerp(3.6,2.4,ease(h)),spin:h=>h,b:"to fly closer",coord:"M31 · RA 00h 43m · Dec +41° 16′",beats:[
    "The Andromeda Galaxy is one of the most distant things you can see with your own eyes.",
    "It holds about a trillion stars, more than the Milky Way.",
    "It is falling toward us at about 110 km per second. In roughly 4.5 billion years the two galaxies will merge."]},
  {name:"The cosmic web",make:fWeb,mode:4,km:1e9*LY,dist:()=>3.7,spin:()=>0,b:"to turn around",coord:"Filaments hundreds of millions of light-years long",beats:[
    "Galaxies gather along filaments hundreds of millions of light-years long, with vast empty voids between them.",
    "This cosmic web is the largest structure we know of.",
    "From here the journey turns around and zooms in, past atoms and nuclei, to the smallest scale physics can describe."]},
  {name:"The smallest scale",make:fStrings,mode:10,km:1.6e-38,dist:h=>lerp(3.7,2.6,ease(h)),final:true,spin:h=>h*1.4,b:"to pluck the strings",coord:"Planck length · 1.6 × 10⁻³⁵ m",beats:[
    "String theory proposes that at about 10⁻³⁵ m, the Planck length, everything is made of tiny vibrating strings.",
    "Each way a string can vibrate would show up as a different particle, the way one guitar string plays many notes.",
    "The theory needs extra dimensions curled up too small to see, often drawn as Calabi–Yau shapes. No experiment has tested it yet."]}
];
const ROMAN=["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];
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
let shiftV=0;
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
uniform float uMix,uTime,uHoldA,uSpinA,uModeA,uModeB,uDist,uAspect,uPx,uMouseOn,uMotion,uShift;
uniform vec2 uMouse;
varying vec3 vC;
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,s,-s,c);}
float horizon(float x){return -.95+.12*sin(x*1.7)+.06*sin(x*4.3+1.);}
vec4 anim(vec4 p,float mode,float hold,float spin,out float sz,out float lit){
  vec3 q=p.xyz;float k=p.w;float vis=1.;sz=1.;lit=1.;
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
  else if(mode<4.5){q.xz=rot(uTime*.05)*q.xz;q.yz=rot(.25+sin(uTime*.1)*.1)*q.yz;}
  else if(mode<5.5){
    if(orb)q.xz=rot((uTime*.12+spin*2.5)/pow(orR,1.5))*q.xz;else q.xz=rot(spin+uTime*.05)*q.xz;
    q.yz=rot(.12)*q.yz;
    if(abs(k-2.)<.1){vis=step(0.,q.z);lit=.05+.95*clamp(dot(normalize(q),normalize(vec3(-.8,.25,.5))),0.,1.);}
    else if(orb&&q.z<0.&&length(q.xy)<.74)vis=0.;
  }
  else if(mode<6.5){
    if(orb)q.xz=rot((uTime*.1+spin*3.)*.3/pow(orR,1.5))*q.xz;
    q.yz=rot(mix(.28,1.05,hold))*q.yz;
  }
  else if(mode<7.5){
    q.xz=rot(uTime*.03)*q.xz;
    if(abs(k-9.)<.1)sz=1.+1.6*step(.5,fract(uTime*1.5));
    else{q*=mix(.05,1.12,hold);float fl=1.-hold;lit=1.+fl*fl*2.2;}
  }
  else if(mode<8.5){
    if(abs(k-10.)<.1)q.xy=rot(uTime*.04)*q.xy;
    else{float r=length(q.xz);q.xz=rot((uTime*.5+spin*5.)*.1/pow(max(r,.3),1.5))*q.xz;lit=1.+.7*q.x/max(r,.01);
      q.yz=rot(.17)*q.yz;q.xy=rot(-.12)*q.xy;if(q.z<0.&&length(q.xy)<.31)vis=0.;}
  }
  else if(mode<9.5){float r=length(q.xz);q.xz=rot((uTime*.03+spin)*.3/(r+.25))*q.xz;q.yz=rot(.3)*q.yz;q.xy=rot(.6)*q.xy;}
  else{
    if(abs(k-12.)<.1){vec2 c=floor(q.xy/.8+.5)*.8;vec2 d=q.xy-c;float r=length(d),th=atan(d.y,d.x),n=2.+floor(aR.x*4.);
      r*=1.+(.2+hold*.15)*sin(n*th+uTime*(1.4+n*.5)+spin*6.);q.xy=c+vec2(cos(th),sin(th))*r;q.z+=.05*sin(n*th-uTime*2.);}
    else{q.xz=rot(uTime*.12+spin*2.)*q.xz;q.yz=rot(.35+sin(uTime*.2)*.15)*q.yz;q*=1.+.035*sin(length(q)*12.-uTime*3.);}
  }
  return vec4(q,vis);
}
void main(){
  float d=aR.x*.45;float t=smoothstep(d,d+.55,uMix);
  float sA,lA,sB,lB;
  vec4 A=anim(aPA,uModeA,uHoldA,uSpinA,sA,lA);
  vec4 B=anim(aPB,uModeB,0.,0.,sB,lB);
  vec3 p=mix(A.xyz,B.xyz,t);
  float fly=sin(t*3.14159)*uMotion;
  p+=(aR.yzw-.5)*fly*.9;
  p.z+=fly*aR.y*1.8;
  p+=(aR.yzw-.5)*.01*sin(uTime*(6.+floor(aR.x*6.)*3.)+aR.y*40.)*uMotion;
  float vz=uDist-p.z;
  if(vz<.2){gl_Position=vec4(3.,3.,3.,1.);gl_PointSize=0.;vC=vec3(0.);return;}
  vec2 sp=p.xy*1.6/vz;sp.x/=uAspect;sp.x+=uShift;
  float kind=t<.5?aPA.w:aPB.w;
  if(abs(kind-1.)>.1){
    vec2 dd=(sp-uMouse)*vec2(uAspect,1.);float dl=length(dd);
    sp+=dd/(dl+1e-4)/vec2(uAspect,1.)*.12*exp(-dl*dl/.03)*uMouseOn;
  }
  gl_Position=vec4(sp,0.,1.);
  float tw=1.+.28*sin(uTime*(1.5+aR.z*4.)+aR.x*60.)*uMotion;
  float size=mix(aCA.w*sA,aCB.w*sB,t)*tw;
  gl_PointSize=clamp(size*uPx*3./vz,1.,56.);
  float vis=mix(A.w,B.w,t);
  vC=mix(aCA.rgb*lA,aCB.rgb*lB,t)*vis*(1.+fly*.3);
}`;
const FS=`precision mediump float;varying vec3 vC;
void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,0.,d);a*=a;gl_FragColor=vec4(vC*a*1.3,1.);}`;
const QVS=`attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
const QFS=`precision mediump float;uniform vec4 uC;void main(){gl_FragColor=uC;}`;

let prog,qprog,U={},QU={},bufP=[],bufC=[],bufR,quad,slot=0,W=1,H=1,dpr=1,A_LOC={};
function sh(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;}
function link(vs,fs){const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,vs));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));return p;}
function upload(s,i){const F=form(i);gl.bindBuffer(gl.ARRAY_BUFFER,bufP[s]);gl.bufferData(gl.ARRAY_BUFFER,F.p,gl.DYNAMIC_DRAW);gl.bindBuffer(gl.ARRAY_BUFFER,bufC[s]);gl.bufferData(gl.ARRAY_BUFFER,F.c,gl.DYNAMIC_DRAW);}
if(gl){
  try{
    prog=link(VS,FS);qprog=link(QVS,QFS);
    ["uMix","uTime","uHoldA","uSpinA","uModeA","uModeB","uDist","uAspect","uPx","uMouseOn","uMotion","uMouse","uShift"].forEach(n=>U[n]=gl.getUniformLocation(prog,n));
    ["aPA","aCA","aPB","aCB","aR"].forEach(n=>A_LOC[n]=gl.getAttribLocation(prog,n));
    QU.uC=gl.getUniformLocation(qprog,"uC");QU.p=gl.getAttribLocation(qprog,"p");
    for(let s=0;s<2;s++){bufP[s]=gl.createBuffer();bufC[s]=gl.createBuffer();}
    upload(0,0);upload(1,1);pair=[0,1];
    const r=new Float32Array(N*4);for(let j=0;j<r.length;j++)r[j]=R();
    bufR=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,bufR);gl.bufferData(gl.ARRAY_BUFFER,r,gl.STATIC_DRAW);
    quad=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,quad);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    gl.enable(gl.BLEND);gl.clearColor(0,0,0,1);
  }catch(err){console.warn("WebGL unavailable, using a still canvas",err);gl=null;}
}
const c2d=gl?null:cv.getContext("2d");

function resize(){
  const r=stage.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,1.75);
  W=Math.max(1,Math.round(r.width*dpr));H=Math.max(1,Math.round(r.height*dpr));cv.width=W;cv.height=H;
  readScroll();
  if(gl){gl.viewport(0,0,W,H);gl.clear(gl.COLOR_BUFFER_BIT);}
  kick();
}
new ResizeObserver(resize).observe(stage);

function bindAttr(name,buf){const l=A_LOC[name];gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,4,gl.FLOAT,false,0,0);}
function drawGL(fade,mixV,dist,hold,spin,i,j){
  const t=reduced?0:time;
  gl.useProgram(qprog);
  for(const l of Object.values(A_LOC))gl.disableVertexAttribArray(l);
  gl.bindBuffer(gl.ARRAY_BUFFER,quad);gl.enableVertexAttribArray(QU.p);gl.vertexAttribPointer(QU.p,2,gl.FLOAT,false,0,0);
  gl.blendEquation(gl.FUNC_ADD);gl.blendFunc(gl.ZERO,gl.ONE_MINUS_SRC_ALPHA);gl.uniform4f(QU.uC,0,0,0,fade);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  gl.blendEquation(gl.FUNC_REVERSE_SUBTRACT);gl.blendFunc(gl.ONE,gl.ONE);gl.uniform4f(QU.uC,2/255,2/255,2/255,0);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  gl.disableVertexAttribArray(QU.p);
  gl.useProgram(prog);gl.blendEquation(gl.FUNC_ADD);gl.blendFunc(gl.ONE,gl.ONE);
  bindAttr("aPA",bufP[0]);bindAttr("aCA",bufC[0]);bindAttr("aPB",bufP[1]);bindAttr("aCB",bufC[1]);bindAttr("aR",bufR);
  gl.uniform1f(U.uMix,mixV);gl.uniform1f(U.uTime,t);gl.uniform1f(U.uHoldA,ease(hold));gl.uniform1f(U.uSpinA,spin);
  gl.uniform1f(U.uModeA,SCENES[i].mode);gl.uniform1f(U.uModeB,SCENES[j].mode);gl.uniform1f(U.uDist,dist);
  gl.uniform1f(U.uAspect,W/H);gl.uniform1f(U.uShift,shiftV);gl.uniform1f(U.uPx,H/760);gl.uniform1f(U.uMotion,reduced?0:1);
  gl.uniform2f(U.uMouse,ptr.mx,-ptr.my);gl.uniform1f(U.uMouseOn,reduced?0:mouseOn);
  gl.drawArrays(gl.POINTS,0,N);
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
  const i=Math.min(Math.floor(P),LASTI),u=P-i,end=i>=LASTI;
  const hold=end?0:clamp(u/.68,0,1),mixV=end?0:ease(clamp((u-.68)/.32,0,1)),j=end?i:i+1;
  if(gl&&(pair[0]!==i||pair[1]!==j)){upload(0,i);upload(1,j);pair=[i,j];}
  const show=mixV>.5?j:i,bs=SCENES[show].beats.length,beat=show===i?Math.min(bs-1,Math.floor(hold*bs*.999)):0,key=show*10+beat;
  if(key!==shown){shown=key;setUI(show,beat);}
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
