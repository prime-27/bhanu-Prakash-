/* Bhanu Prakash portfolio: React components (htm templates, no build step). */
const { useState, useEffect, useRef, useCallback, useMemo } = React;
const html = htm.bind(React.createElement);
const { SCENES, ROMAN, reduced } = window.Universe;
const LASTI = SCENES.length - 1;
const smooth = reduced ? "auto" : "smooth";
const scrollToId = id => document.getElementById(id)?.scrollIntoView({ behavior: smooth });

/* ---------- content (source of truth: website brief) ---------- */
const CONTENT = {
  nav: [["home","Home"],["about","About"],["astronomy","Astronomy"],["tonight","Tonight"],["development","Development"],["light","Light"],["projects","Projects"],["notes","Notes"]],
  hero: {
    eyebrow: "Astronomy · Education · Technology",
    title: "Exploring the Universe. Building What’s Next.",
    text: "I’m Bhanu Prakash, an astronomer and stargazing expert with an MSc in Astronomy and three years of experience bringing astronomy to schools, communities, and curious minds. I also design and develop websites, software, and applications."
  },
  bio: [
    "I am Bhanu Prakash, an astronomer with an MSc in Astronomy from Osmania University (2025) and three years of experience conducting stargazing sessions, astronomy outreach programs, and hands-on educational workshops. I work with schools, students, families, and the wider public to make the night sky understandable and exciting.",
    "I have been involved in organizing and delivering telescope-based night-sky observations, public stargazing experiences, astronomy awareness programs, school outreach sessions, and interactive workshops. I enjoy translating complex astronomical ideas into engaging experiences for people of different ages and backgrounds.",
    "My astronomy work includes helping participants recognize celestial objects, understand telescopes and observational techniques, explore the Moon and planets, and connect what they see in the sky to the science behind it. I am particularly interested in experiences that move beyond lectures and give participants opportunities to observe, ask questions, and learn by doing.",
    "I also develop websites, software, and applications. This technical side of my work lets me approach problems creatively and build digital tools, including science-oriented and educational experiences. My goal is to use both astronomy and technology to create accessible, meaningful learning opportunities."
  ],
  creds: [
    ["Education","MSc in Astronomy, Osmania University, 2025",null],
    ["Experience","About 3 years in observation, outreach and public engagement","Confirm start year"],
    ["Based in","Hyderabad, India","Confirm service area"],
    ["Works with","Schools, teachers, families, beginners, enthusiasts and public groups",null]
  ],
  astroSkills: [
    ["Night-sky stargazing","Planning and facilitating guided observations for individuals and groups."],
    ["Telescope operation","Setting up, aligning, handling and explaining observational telescopes."],
    ["Astronomical observation","The Moon, planets, stars, constellations and deep-sky objects when conditions permit."],
    ["School outreach","Age-appropriate sessions, demonstrations and interactive learning."],
    ["Workshops","Telescope basics, lunar craters, eclipses, solar-system concepts and more."],
    ["Science communication","Explaining astronomy clearly to beginners and answering their questions."],
    ["Event facilitation","Public astronomy evenings, group programs and astronomy-themed experiences."],
    ["Observation planning","Choosing targets and adapting to weather, sky conditions, audience and venue."]
  ],
  astroServices: [
    ["Guided Stargazing Sessions","Telescope-based sky experiences for public groups, families, private gatherings and communities."],
    ["School Astronomy Programs","Interactive school visits, demonstrations, astronomy talks and curriculum-adjacent activities."],
    ["Astronomy Workshops","Practical sessions designed around a specific age group, concept, duration and available equipment."],
    ["Astronomy Events & Outreach","Planning, facilitation and scientific engagement for astronomy-themed events."]
  ],
  audience: ["School students","Teachers","Families","Beginners","Astronomy enthusiasts","Public groups"],
  targets: [
    ["The Moon","Earth’s satellite","384,400 km","Every month","Craters and mountains along the line between day and night."],
    ["Jupiter","Planet","600–970 million km","Around opposition","Cloud belts and four bright moons that change position nightly."],
    ["Saturn","Planet","1.3 billion km","Around opposition","A ringed disc, with its largest moon Titan nearby."],
    ["Orion Nebula","M42","1,344 light-years","Dec – Mar","A glowing cloud of gas around four young stars."]
  ],
  devSkills: [
    ["Website design & development","Responsive personal and organizational web experiences."],
    ["Software & applications","From concept to working features."],
    ["Interactive educational tools","Science-oriented digital experiences and simulations."],
    ["Interface design","Usability and content structured for clear digital experiences."],
    ["Problem solving","Prototyping, testing and iterative development."],
    ["Astronomy simulations","47 live sky tools, simulators and physics labs, listed under Projects."]
  ],
  devServices: [
    ["Website Development","Design and development of websites with attention to clarity, responsiveness and usability."],
    ["Software & Application Projects","Development of, or collaboration on, applications and interactive tools, subject to project scope."]
  ],
  gallery: [
    { src: "", cap: "Telescope session with a public group" },
    { src: "", cap: "School astronomy workshop" },
    { src: "", cap: "The Moon through the telescope" },
    { src: "", cap: "Setting up and aligning the telescope" },
    { src: "", cap: "Public astronomy evening" },
    { src: "", cap: "Hands-on workshop activity" }
  ],
  inquiry: ["Guided stargazing session","School astronomy program","Astronomy workshop","Astronomy event or outreach","Website development","Software or application project","Something else"]
};
const TAGS = { all:"All", astronomy:"Astronomy", education:"Education", web:"Web", software:"Software", dev:"In Development" };


/* ---------- scroll ↔ journey mapping ----------
   Every block on the page carries data-p0/data-p1: the journey position (chapter units)
   while that block passes the middle of the screen. The whole page is one trip. */
function readP() {
  const blocks = document.querySelectorAll("[data-p0]"), c = innerHeight * .5;
  if (!blocks.length) return 0;
  const doc = document.documentElement;
  if (scrollY + innerHeight >= doc.scrollHeight - 4) return LASTI;
  let P = 0, mode = "content";
  for (const b of blocks) {
    const r = b.getBoundingClientRect(), p0 = +b.dataset.p0, p1 = +b.dataset.p1;
    if (r.bottom <= c) { P = p1; continue; }
    if (r.top <= c) { P = p0 + (p1 - p0) * (c - r.top) / r.height; mode = b.dataset.kind || "content"; }
    break;
  }
  if (document.body.dataset.mode !== mode) document.body.dataset.mode = mode;
  return P;
}
function scrollToP(target) {
  const blocks = [...document.querySelectorAll("[data-p0]")];
  const t = target === 0 ? 0 : Math.min(target + .15, LASTI);
  const b = blocks.find(x => t >= +x.dataset.p0 && t < +x.dataset.p1) || blocks[blocks.length - 1];
  const r = b.getBoundingClientRect(), p0 = +b.dataset.p0, p1 = +b.dataset.p1;
  const y = scrollY + r.top + r.height * Math.min(1, (t - p0) / (p1 - p0)) - innerHeight * .5;
  scrollTo({ top: target === 0 ? 0 : Math.max(0, y), behavior: smooth });
}
const shiftFor = () => (innerWidth > 1020 ? .36 : 0);

/* ---------- sparks overlay (Canvas 2D) ---------- */
/* Strings: every divider on the site is a string you can pluck (1D wave equation, fixed ends). */
function startStrings(canvas) {
  const ctx = canvas.getContext("2d"), rnd = Math.random, loops = [], sparks = [], STATE = new WeakMap(), NP = 72;
  let W = 1, H = 1, raf = 0, px = -1, py = -1, lastY = scrollY;
  const resize = () => { const d = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; canvas.width = W * d; canvas.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
  const st = el => { let o = STATE.get(el); if (!o) { o = { y: new Float32Array(NP), v: new Float32Array(NP), e: 0 }; STATE.set(el, o); } return o; };
  const geom = el => { const r = el.getBoundingClientRect();
    if (el.dataset.string !== undefined) return { x: r.left, w: r.width, y: r.top + r.height / 2 };
    const inner = el.querySelector(":scope > .inner") || el; const ri = inner.getBoundingClientRect(); return { x: ri.left, w: ri.width, y: r.top + .5 }; };
  const list = () => document.querySelectorAll("main > section.band, main > section.interlude, footer, [data-string]");
  const pluck = (o, at, amp) => { if (reduced) return; at = clamp(at, .04, .96); for (let i = 1; i < NP - 1; i++) { const u = i / (NP - 1); o.y[i] += amp * (u < at ? u / at : (1 - u) / (1 - at)); } };
  const onMove = e => {
    const x = e.clientX, y = e.clientY;
    if (py >= 0) for (const el of list()) { const g = geom(el); if (g.y < -5 || g.y > H + 5) continue;
      if ((py - g.y) * (y - g.y) < 0 && x > g.x && x < g.x + g.w) pluck(st(el), (x - g.x) / g.w, clamp((y - py) * .9, -16, 16)); }
    px = x; py = y; kick();
  };
  const onTap = e => { if (e.pointerType === "mouse") return; for (const el of list()) { const g = geom(el); if (Math.abs(e.clientY - g.y) < 28 && e.clientX > g.x && e.clientX < g.x + g.w) pluck(st(el), (e.clientX - g.x) / g.w, 10); } kick(); };
  const onPluck = e => { const el = e.detail.el; if (el) pluck(st(el), e.detail.at ?? .5, e.detail.amp ?? 8); kick(); };
  const onBurst = e => { if (reduced) return; const { x, y, n = 24, speed = 4 } = e.detail;
    for (let k = 0; k < Math.max(3, n / 6); k++) { const a = rnd() * 6.283, v = speed * (.25 + rnd() * .5); loops.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 5 + rnd() * 9, m: 2 + ((rnd() * 4) | 0), ph: rnd() * 6, life: 1 }); }
    for (let k = 0; k < n / 2; k++) { const a = rnd() * 6.283, v = speed * (.3 + rnd()); sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, life: 1 }); }
    kick(); };
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  function frame() {
    raf = 0; ctx.clearRect(0, 0, W, H);
    const navB = (document.querySelector(".top")?.getBoundingClientRect().bottom) || 0, hudT = (document.querySelector(".hudbar")?.getBoundingClientRect().top) || H;
    ctx.save(); ctx.beginPath(); ctx.rect(0, navB, W, hudT - navB + 3); ctx.clip();
    const dy = scrollY - lastY; lastY = scrollY; let busy = loops.length + sparks.length > 0;
    for (const el of list()) {
      const g = geom(el); if (g.y < -10 || g.y > H + 10 || g.w < 10) continue; const o = st(el);
      if (Math.abs(dy) > 1 && !reduced && Math.abs(g.y - H * .5) < H * .45) for (let i = 1; i < NP - 1; i++) o.v[i] += Math.sin(Math.PI * i / (NP - 1)) * clamp(dy, -40, 40) * .006;
      let e = 0;
      for (let pass = 0; pass < 2; pass++) for (let i = 1; i < NP - 1; i++) { o.v[i] = (o.v[i] + .3 * (o.y[i - 1] - 2 * o.y[i] + o.y[i + 1])) * .992; }
      for (let i = 1; i < NP - 1; i++) { o.y[i] += o.v[i]; e += Math.abs(o.y[i]); }
      o.e = e / NP; if (o.e > .02) busy = true; else if (o.e > 0) { o.y.fill(0); o.v.fill(0); o.e = 0; }
      const amber = el.dataset.tone === "amber";
      ctx.beginPath(); for (let i = 0; i < NP; i++) { const X = g.x + g.w * i / (NP - 1), Y = g.y + o.y[i]; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }
      ctx.lineWidth = 1; ctx.strokeStyle = amber ? "rgba(255,194,122,.45)" : "rgba(190,200,235,.2)"; ctx.stroke();
      { const tb = performance.now() / 1000; for (const sg of [-1, 1]) { ctx.beginPath();
        for (let i = 0; i < NP; i++) { const u = i / (NP - 1), X = g.x + g.w * u, Y = g.y + o.y[i] * .75 + sg * 2.6 * Math.sin(Math.PI * u) * Math.sin(Math.PI * u * 7 + tb * .9 * sg); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }
        ctx.lineWidth = .6; ctx.strokeStyle = amber ? "rgba(255,194,122,.22)" : "rgba(190,200,235,.12)"; ctx.stroke(); } }
      if (o.e > .05) { const k = Math.min(1, o.e / 3); ctx.globalCompositeOperation = "lighter";
        ctx.lineWidth = 5; ctx.strokeStyle = `rgba(255,194,122,${(.12 * k).toFixed(3)})`; ctx.stroke();
        ctx.lineWidth = 1.2; ctx.strokeStyle = `rgba(255,194,122,${(.75 * k).toFixed(3)})`; ctx.stroke(); ctx.globalCompositeOperation = "source-over"; }
    }
    ctx.globalCompositeOperation = "lighter";
    for (let i = loops.length - 1; i >= 0; i--) { const L = loops[i]; L.x += L.vx; L.y += L.vy; L.vx *= .96; L.vy *= .96; L.ph += .3; L.life -= .014; L.r += .15;
      if (L.life <= 0) { loops.splice(i, 1); continue; }
      ctx.beginPath(); for (let k = 0; k <= 40; k++) { const t = k / 40 * 6.283, r = L.r * (1 + .28 * Math.sin(L.m * t + L.ph)); const X = L.x + Math.cos(t) * r, Y = L.y + Math.sin(t) * r; k ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }
      ctx.lineWidth = 1; ctx.strokeStyle = `rgba(${L.m % 2 ? "255,194,122" : "241,238,230"},${(L.life * .8).toFixed(3)})`; ctx.stroke(); }
    for (let i = sparks.length - 1; i >= 0; i--) { const p = sparks[i]; p.x += p.vx; p.y += p.vy; p.vy += .06; p.vx *= .98; p.life -= .025;
      if (p.life <= 0) { sparks.splice(i, 1); continue; } ctx.fillStyle = `rgba(241,238,230,${p.life.toFixed(3)})`; ctx.fillRect(p.x, p.y, 1.6, 1.6); }
    ctx.globalCompositeOperation = "source-over"; ctx.restore();
    if (busy || Math.abs(dy) > 0) kick();
  }
  resize(); addEventListener("resize", () => { resize(); kick(); }); addEventListener("scroll", kick, { passive: true });
  addEventListener("pointermove", onMove, { passive: true }); addEventListener("pointerdown", onTap, { passive: true }); addEventListener("particles:burst", onBurst); addEventListener("strings:pluck", onPluck);
  setTimeout(kick, 300);
  return () => { cancelAnimationFrame(raf); removeEventListener("pointermove", onMove); removeEventListener("particles:burst", onBurst); removeEventListener("strings:pluck", onPluck); };
}
const pluckEl = (el, at = .5, amp = 8) => window.dispatchEvent(new CustomEvent("strings:pluck", { detail: { el, at, amp } }));
const burst = (x, y, o = {}) => window.dispatchEvent(new CustomEvent("particles:burst", { detail: { x, y, ...o } }));
const burstAt = (el, o) => { if (!el) return; const r = el.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, o); };
function Sparks() { const ref = useRef(); useEffect(() => startStrings(ref.current), []); return html`<canvas className="sparks" ref=${ref} aria-hidden="true"></canvas>`; }

/* ---------- hooks ---------- */
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-45% 0px -50% 0px" });
    ids.forEach(id => { const el = document.getElementById(id); el && io.observe(el); });
    return () => io.disconnect();
  }, []);
  return active;
}
function useDialog() {
  const ref = useRef(null);
  const [data, setData] = useState(null);
  const open = useCallback(d => setData(d), []);
  const close = useCallback(() => ref.current?.open && ref.current.close(), []);
  useEffect(() => { if (data != null && ref.current && !ref.current.open) ref.current.showModal(); }, [data]);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const onClose = () => setData(null), onClick = e => { if (e.target === el) el.close(); };
    el.addEventListener("close", onClose); el.addEventListener("click", onClick);
    return () => { el.removeEventListener("close", onClose); el.removeEventListener("click", onClick); };
  }, []);
  return { ref, data, open, close, setData };
}

/* ---------- small components ---------- */
const Ph = ({ children }) => html`<span className="ph">${children}</span>`;
const Logo = () => html`<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="27" fill="none" stroke="#9aa1bb" strokeWidth="1.6"/><path d="M11 44 L23 34 L33 38 L44 23 L52 25" fill="none" stroke="#9aa1bb" strokeWidth="1.4" strokeDasharray="3 3" strokeLinecap="round"/><g fill="#f1eee6"><circle cx="11" cy="44" r="2.5"/><circle cx="23" cy="34" r="2.5"/><circle cx="33" cy="38" r="2.5"/><circle cx="52" cy="25" r="2.5"/></g><circle cx="44" cy="23" r="4.2" fill="#ffc27a"/></svg>`;
const fmtKm = km => { const LY = 9.461e12; if (km < 1e-3) { const m = km * 1000, e = Math.floor(Math.log10(m)); return (m / Math.pow(10, e)).toFixed(1) + " × 10" + String(e).replace("-", "⁻").replace(/\d/g, d => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]) + " m"; } if (km < 3) return "Ground level"; if (km < 1e6) return Math.round(km).toLocaleString("en") + " km"; if (km < 1e9) return Math.round(km / 1e6) + " million km"; if (km < 1e12) return (km / 1e9).toFixed(1) + " billion km"; const ly = km / LY; return ly < 1e6 ? Math.round(ly).toLocaleString("en") + " light-years" : ly < 1e9 ? (ly / 1e6).toFixed(1) + " million light-years" : (ly / 1e9).toFixed(1) + " billion light-years"; };

function Section({ id, label, title, lede, chapter, p, children }) {
  return html`<section className="band" id=${id} aria-labelledby=${id + "-h"} data-p0=${p[0]} data-p1=${p[1]} data-kind="content">
    <div className="inner">
      ${label && html`<span className="label">${label}</span>`}
      ${title && html`<h2 id=${id + "-h"}>${title}</h2>`}
      ${lede && html`<p className="lede">${lede}</p>`}
      ${children}
      ${chapter != null && html`<${FieldNotes} i=${chapter}/>`}
    </div></section>`;
}
function FieldNotes({ i }) {
  const sc = SCENES[i];
  return html`<aside className="notes" aria-label=${"Now passing: " + sc.name}>
    <div className="notes-h"><span className="label">Now passing · ${ROMAN[i]}</span><h3>${sc.name}</h3><span className="coordline">${sc.coord} · ${fmtKm(sc.km)}</span></div>
    <div className="notes-body"><ol>${sc.beats.map((b, k) => html`<li key=${k}>${b}</li>`)}</ol><${SeenBy} sc=${sc}/><${Theory} sc=${sc}/></div></aside>`;
}
function Interlude({ i, p }) {
  const sc = SCENES[i];
  return html`<section className="interlude" data-p0=${p[0]} data-p1=${p[1]} data-kind="interlude" aria-labelledby=${"ch" + i}>
    <div className="inner"><div className="il">
      <span className="label">Chapter ${ROMAN[i]} · ${fmtKm(sc.km)} from Earth</span>
      <h2 id=${"ch" + i}>${sc.name}</h2>
      <p className="coordline">${sc.coord}</p>
      <ol>${sc.beats.map((b, k) => html`<li key=${k}>${b}</li>`)}</ol>
      <${SeenBy} sc=${sc}/>
      <${Theory} sc=${sc}/>
      ${sc.final && html`<${StringLab}/>`}
      ${sc.final ? html`<button className="link back" type="button" onClick=${() => scrollToP(0)}>↑ Travel back to Earth</button>` : html`<span className="hint">Keep scrolling ${sc.b} ↓</span>`}
    </div></div></section>`;
}
const SkillGrid = ({ items }) => html`<ul className="skills">${items.map(([b, s]) => html`<li key=${b}><b>${b}</b><span>${s}</span></li>`)}</ul>`;
const Services = ({ items, start = 1, track }) => html`
  <div className="subhead"><h3>Ways to work with me</h3><span>${track}</span></div>
  <div className="services">${items.map(([t, d], i) => html`<div className="svc" key=${t}>
    <span className="n">${String(start + i).padStart(2, "0")}</span><h3>${t}</h3><p>${d}</p>
    <button className="link" type="button" onClick=${() => window.dispatchEvent(new CustomEvent("prefill", { detail: t }))}>Ask about this →</button></div>`)}</div>`;

/* ---------- chrome ---------- */
function Nav({ active }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { const k = e => e.key === "Escape" && setOpen(false); addEventListener("keydown", k); return () => removeEventListener("keydown", k); }, []);
  return html`<header className="top">
    <a className="mark" href="#home" aria-label="Bhanu Prakash, home"><${Logo}/><span><b>Bhanu Prakash</b><small>Astronomer · Developer</small></span></a>
    <button className="menu" type="button" aria-expanded=${open} aria-controls="siteNav" onClick=${() => setOpen(o => !o)}>${open ? "Close" : "Menu"}</button>
    <nav className=${"navs" + (open ? " open" : "")} id="siteNav" aria-label="Site" onClick=${e => e.target.closest("a") && setOpen(false)}>
      ${CONTENT.nav.map(([id, name]) => html`<a key=${id} href=${"#" + id} aria-current=${active === id ? "true" : undefined}>${name}</a>`)}
      <a href="#contact" className="cta">Contact</a>
    </nav></header>`;
}
function HudBar({ view, refs, api }) {
  const sc = SCENES[view.i];
  return html`<div className="hudbar" aria-label="Journey position">
    <i className="prog" ref=${refs.bar}></i>
    <i className="hb-string" data-string="" data-tone="amber" aria-hidden="true"></i>
    <span className="hb-ch">${ROMAN[view.i]} / ${ROMAN[LASTI]}</span>
    <b className="hb-name">${sc.name}</b>
    <ol className="hb-dots">${SCENES.map((s, k) => html`<li key=${k}><button type="button" aria-label=${`Travel to chapter ${k + 1}: ${s.name}`} title=${s.name}
      aria-current=${k === view.i ? "step" : undefined} onClick=${() => api.current?.goTo(k)}></button></li>`)}</ol>
    <span className="hb-dist"><b ref=${refs.hudD}></b><em ref=${refs.hudL}></em></span>
  </div>`;
}
function Hero({ cueRef }) {
  const hs = useRef();
  useEffect(() => { const t = setTimeout(() => pluckEl(hs.current, .3, 12), 1400); return () => clearTimeout(t); }, []);
  return html`<section className="introhero" id="home" data-p0="0" data-p1=".6" data-kind="hero" aria-labelledby="hero-h">
    <div className="inner"><div className="hero-copy">
      <span className="eyebrow">${CONTENT.hero.eyebrow}</span>
      <h1 id="hero-h">${CONTENT.hero.title}</h1>
      <p>${CONTENT.hero.text}</p>
      <div className="btns"><a className="btn" href="#projects">Explore My Work</a><a className="btn ghost" href="#contact">Get in Touch</a></div>
      <p className="trip">Scroll to travel from this hillside to the edge of the observable universe, then down to the smallest scale. Twelve stops, from 384,400 km out to a billion light-years and in to 10⁻³⁵ m.</p>
      <div className="hero-string" data-string="" data-tone="amber" ref=${hs} aria-hidden="true"></div>
      <p className="trip strings-hint">String theory says everything is made of vibrating strings. So is this page: every line is a string you can pluck with your cursor or finger. Behind it all runs Einstein’s spacetime, a grid that bends under every mass you pass.</p>
    </div></div>
    <div className="cue" ref=${cueRef} aria-hidden="true">Scroll to leave Earth<i></i></div>
  </section>`;
}

/* ---------- content sections ---------- */
/* ---------- Particle portrait: Bhanu rebuilt from stardust ----------
   assets/portraits/pNN.png are aligned sources (R = brightness, G = depth from a 3D face mesh, A = person mask);
   pNN.jpg are the matching photos for the reveal. The same particles morph from one photo to the next. */
const PORTRAITS = ["13", "21", "18", "19", "22", "20"];
function samplePortrait(img, N) {
  const GW = img.width, GH = img.height, c = document.createElement("canvas"); c.width = GW; c.height = GH;
  const o = c.getContext("2d"); o.drawImage(img, 0, 0); const d = o.getImageData(0, 0, GW, GH).data;
  const T = new Float32Array(N * 3), L = new Float32Array(N); let n = 0, guard = 0;
  while (n < N && guard++ < N * 60) {
    const x = Math.random() * GW, y = Math.random() * GH, i = ((y | 0) * GW + (x | 0)) * 4, a = d[i + 3] / 255, l = d[i] / 255;
    if (a < .35 || l < .05 || Math.random() > (.3 + .7 * l) * a) continue;
    T[n * 3] = (x / GW - .5) * 2; T[n * 3 + 1] = (.5 - y / GH) * 2 * GH / GW; T[n * 3 + 2] = d[i + 1] / 255 * .32 + (l - .5) * .02; L[n] = l; n++;
  }
  return { T, L, aspect: GH / GW };
}
function startPortrait(canvas, imgs, onIndex) {
  const N = innerWidth < 700 ? 16000 : 30000, S = imgs.map(im => samplePortrait(im, N)), asp = S[0].aspect;
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return { stop() {}, show() {} };
  const vs = `attribute vec3 aT,aT2,aS;attribute float aL,aL2,aR;uniform float uP,uM,uT,uRx,uRy,uAsp,uSize,uScale;uniform vec2 uMs;varying vec3 vC;varying float vA;
  void main(){float d=(aT.y/uScale*.5+.5)*.55+aR*.25;float k=smoothstep(d,d+.35,uP);
    float dm=aR*.45;float m=smoothstep(dm,dm+.55,uM);float fly=sin(m*3.14159);
    vec3 tg=mix(aT,aT2,m);tg+=vec3(sin(aR*91.+uT),cos(aR*57.+uT*.8),sin(aR*33.))*fly*.28;float l=mix(aL,aL2,m);
    vec3 p=mix(aS,tg,k);float sw=(1.-k)*2.;p.x+=sin(uT*.7+aR*20.)*.03*sw;p.y+=cos(uT*.6+aR*17.)*.03*sw;
    p.xy+=vec2(sin(uT*.9+aR*40.),cos(uT*.8+aR*31.))*.003*k;
    float cy=cos(uRy),sy=sin(uRy),cx=cos(uRx),sx=sin(uRx);vec3 q=vec3(p.x*cy+p.z*sy,p.y,-p.x*sy+p.z*cy);q=vec3(q.x,q.y*cx-q.z*sx,q.y*sx+q.z*cx);
    float z=3.2-q.z;vec2 s=q.xy*2.9/z;s.x/=uAsp;s/=uScale;vec2 dd=(s-uMs)*vec2(uAsp,1.);float dl=length(dd);s+=dd/(dl+1e-4)*.09*exp(-dl*dl/.012)/vec2(uAsp,1.);
    gl_Position=vec4(s,0.,1.);gl_PointSize=uSize*(.55+l*.9)*(1.+sw*.4+fly*.6);
    vec3 warm=vec3(1.,.48,.2),hot=vec3(1.,.82,.58),white=vec3(1.,.97,.92);vC=mix(mix(warm,hot,smoothstep(.15,.55,l)),white,smoothstep(.6,.95,l));vA=(.28+.85*l)*mix(.45,1.,k)*(1.-fly*.35);}`;
  const fs = `precision mediump float;varying vec3 vC;varying float vA;void main(){vec2 q=gl_PointCoord-.5;float r=length(q);float a=smoothstep(.5,.15,r)*vA;gl_FragColor=vec4(vC*a,a);}`;
  const sh = (t, src) => { const s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return { stop() {}, show() {} };
  gl.useProgram(pr);
  const st = new Float32Array(N * 3), rr = new Float32Array(N);
  for (let i = 0; i < N; i++) { const a = Math.random() * 6.283, r = .4 + Math.random() * 1.6; st[i * 3] = Math.cos(a) * r; st[i * 3 + 1] = -1.6 - Math.random() * 1.2; st[i * 3 + 2] = Math.sin(a) * r * .6; rr[i] = Math.random(); }
  const mk = (data, name, n) => { const b = gl.createBuffer(), l = gl.getAttribLocation(pr, name); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, n, gl.FLOAT, false, 0, 0); return b; };
  const bT = mk(S[0].T, "aT", 3), bL = mk(S[0].L, "aL", 1), bT2 = mk(S[0].T, "aT2", 3), bL2 = mk(S[0].L, "aL2", 1); mk(st, "aS", 3); mk(rr, "aR", 1);
  const put = (b, data) => { gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferSubData(gl.ARRAY_BUFFER, 0, data); };
  const U = n => gl.getUniformLocation(pr, n), uP = U("uP"), uM = U("uM"), uT = U("uT"), uRx = U("uRx"), uRy = U("uRy"), uAsp = U("uAsp"), uSize = U("uSize"), uMs = U("uMs"), uScale = U("uScale");
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
  let W = 1, H = 1, dpr = 1, raf = 0, vis = false, last = 0, t = 0, P = 0, goal = 0, rx = 0, ry = 0, trx = 0, try_ = 0, mx = 9, my = 9, cur = 0, next = -1, M = 0, hold = 0, hovering = false;
  const resize = () => { dpr = Math.min(devicePixelRatio || 1, 2); const r = canvas.getBoundingClientRect(); W = r.width; H = r.height; canvas.width = W * dpr; canvas.height = H * dpr; gl.viewport(0, 0, canvas.width, canvas.height); };
  const move = e => { const r = canvas.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width * 2 - 1, ny = (e.clientY - r.top) / r.height * 2 - 1; try_ = nx * .45; trx = ny * .2; mx = nx; my = -ny; hovering = true; };
  const leave = () => { trx = try_ = 0; mx = my = 9; hovering = false; };
  const show = k => { if (next >= 0 || k === cur || !S[k]) return; next = k; M = 0; put(bT2, S[k].T); put(bL2, S[k].L); onIndex && onIndex(k); };
  function frame(now) {
    raf = vis ? requestAnimationFrame(frame) : 0; const dt = Math.min(.05, (now - (last || now)) / 1000); last = now; if (!reduced) t += dt;
    P += (goal - P) * Math.min(1, dt * (reduced ? 60 : .9)); rx += (trx - rx) * Math.min(1, dt * 3); ry += ((try_ + Math.sin(t * .35) * .06) - ry) * Math.min(1, dt * 3);
    if (next >= 0) { M = Math.min(1, M + dt / (reduced ? .01 : 2.4)); if (M >= 1) { put(bT, S[next].T); put(bL, S[next].L); cur = next; next = -1; M = 0; hold = 0; } }
    else if (P > .95 && !hovering && S.length > 1) { hold += dt; if (hold > 6.5) show((cur + 1) % S.length); }
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uP, P * 1.25); gl.uniform1f(uM, M * 1.2); gl.uniform1f(uT, t); gl.uniform1f(uRx, rx); gl.uniform1f(uRy, ry); gl.uniform1f(uAsp, W / H);
    gl.uniform1f(uScale, asp * 1.16); gl.uniform1f(uSize, Math.max(1.4, W / 300 * 1.05) * dpr); gl.uniform2f(uMs, mx, my);
    gl.drawArrays(gl.POINTS, 0, N);
  }
  const io = new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis) { goal = 1; if (!raf) { last = 0; raf = requestAnimationFrame(frame); } } }, { threshold: .2 });
  io.observe(canvas); resize(); addEventListener("resize", resize); canvas.addEventListener("pointermove", move); canvas.addEventListener("pointerleave", leave);
  return { show, stop() { io.disconnect(); cancelAnimationFrame(raf); removeEventListener("resize", resize); } };
}
function ParticlePortrait() {
  const can = useRef(), api = useRef(null), [idx, setIdx] = useState(0), [reveal, setReveal] = useState(false), [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    Promise.all(PORTRAITS.map(n => new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = `assets/portraits/p${n}.png`; })))
      .then(list => { const ok = list.filter(Boolean); if (!alive || !ok.length) return; api.current = startPortrait(can.current, ok, k => setIdx(k)); setReady(true); });
    return () => { alive = false; api.current && api.current.stop(); };
  }, []);
  return html`<div className=${"portrait pp" + (reveal ? " reveal" : "")}
      role="img" aria-label="Portrait of Bhanu Prakash, drawn in particles that move between six photos">
    <span className="bigword" aria-hidden="true">ASTRONOMER</span>
    ${PORTRAITS.map((n, k) => html`<img key=${n} src=${`assets/portraits/p${n}.jpg`} alt="" className=${"pp-photo" + (k === idx ? " on" : "")} loading="lazy"/>`)}
    <canvas ref=${can} className="pp-canvas"></canvas>
    ${ready && html`<div className="pp-dots" role="group" aria-label="Choose a photo">${PORTRAITS.map((n, k) => html`<button key=${n} type="button" aria-pressed=${k === idx} aria-label=${"Photo " + (k + 1)} onClick=${e => { e.stopPropagation(); api.current && api.current.show(k); }}></button>`)}</div>`}
    <button type="button" className="pp-toggle" onClick=${() => setReveal(v => !v)}>${reveal ? "Show particles" : "Show photo"}</button>
  </div>`;
}

function About() {
  return html`<section className="band" id="about" aria-labelledby="about-h" data-p0=".6" data-p1="1.3" data-kind="content"><div className="inner">
    <div className="about">
    <div><${ParticlePortrait}/></div>
    <div className="prose">
      <span className="label">About</span>
      <h2 id="about-h">Astronomy, education, observation and technology</h2>
      ${CONTENT.bio.map((p, i) => html`<p key=${i}>${p}</p>`)}
      <dl className="creds">${CONTENT.creds.map(([t, d, ph]) => html`<div key=${t}><dt>${t}</dt><dd>${d} ${ph && html`<${Ph}>${ph}<//>`}</dd></div>`)}</dl>
    </div></div>
    <${FieldNotes} i=${1}/>
    </div></section>`;
}
function Astronomy() {
  return html`<${Section} id="astronomy" p=${[2.6, 3.2]} chapter=${3} label="Astronomy & Outreach" title="Helping people experience astronomy firsthand"
    lede="From guided telescope observations to engaging school workshops, every session is planned around the audience, the venue and what the sky offers that night.">
    <${SkillGrid} items=${CONTENT.astroSkills}/>
    <div className="subhead"><h3>Who I work with</h3><span>Audiences</span></div>
    <ul className="audience">${CONTENT.audience.map(a => html`<li key=${a}>${a}</li>`)}</ul>
    <${Services} items=${CONTENT.astroServices} track="Astronomy"/>
    <div className="table-wrap"><table>
      <caption>What participants observe</caption>
      <thead><tr><th scope="col">Object</th><th scope="col">Distance</th><th scope="col">Best placed</th><th scope="col">Through the telescope</th></tr></thead>
      <tbody>${CONTENT.targets.map(([n, k, d, w, s]) => html`<tr key=${n}><td>${n}<small>${k}</small></td><td>${d}</td><td className="when">${w}</td><td>${s}</td></tr>`)}</tbody>
    </table></div><//>`;
}
function Development() {
  return html`<${Section} id="development" p=${[4.6, 5.2]} chapter=${5} label="Technology & Development" title="Digital experiences that turn ideas into useful tools"
    lede=${html`I create websites and applications with attention to clarity, responsiveness and usability, including science-oriented and educational experiences. <${Ph}>Languages, frameworks & tools to confirm<//>`}>
    <div className="dev"><${SkillGrid} items=${CONTENT.devSkills}/></div>
    <${Services} items=${CONTENT.devServices} start=${5} track="Development"/><//>`;
}
const TOOLS = [{"t": "Star Map", "d": "The whole sky with names and stories in Telugu and English.", "c": "sky", "u": "https://beyondthesky.in/star-map"}, {"t": "Constellations & Zodiac", "d": "The 88 constellations, the Sun’s path and star lore from many cultures.", "c": "sky", "u": "https://beyondthesky.in/constellations"}, {"t": "Constellations in 3D", "d": "Fly through real stars and watch Orion fall apart.", "c": "sky", "u": "https://beyondthesky.in/constellations-3d"}, {"t": "Nakshatras", "d": "The 27 nakshatras: Telugu stories, real stars, your birth star.", "c": "sky", "u": "https://beyondthesky.in/nakshatras"}, {"t": "Sky Calendar", "d": "Eclipses, meteor showers and planet events, month by month.", "c": "sky", "u": "https://beyondthesky.in/calendar"}, {"t": "Events", "d": "Every eclipse, meteor shower and planet event of the year.", "c": "sky", "u": "https://beyondthesky.in/almanac"}, {"t": "This Week", "d": "The Moon, NASA picture of the day and next launches, live.", "c": "sky", "u": "https://beyondthesky.in/this-week"}, {"t": "Eclipse Simulator", "d": "Watch any eclipse from 2020 to 2040 as it looks from your city.", "c": "sky", "u": "https://beyondthesky.in/eclipse-simulator"}, {"t": "Deep Sky Guide", "d": "The best galaxies, nebulae and star clusters to find from Hyderabad.", "c": "sky", "u": "https://beyondthesky.in/deep-sky"}, {"t": "Planet Finder", "d": "Point your phone at the sky to find the Moon and planets.", "c": "sky", "u": "https://beyondthesky.in/planet-finder"}, {"t": "Star Party Planner", "d": "Plan an observing night hour by hour, and print it.", "c": "sky", "u": "https://beyondthesky.in/star-party-planner"}, {"t": "Light Map", "d": "Find the darkest skies near you.", "c": "sky", "u": "https://beyondthesky.in/light-pollution"}, {"t": "Choose a Telescope", "d": "Six questions to find your first telescope.", "c": "sky", "u": "https://beyondthesky.in/choose-a-telescope"}, {"t": "Space Weather", "d": "Flare classes, solar storms, the aurora and what they do to satellites and grids.", "c": "sun", "u": "https://beyondthesky.in/space-weather"}, {"t": "Space Weather over India", "d": "The May 2024 superstorm as recorded at Hyderabad and Alibag.", "c": "sun", "u": "https://beyondthesky.in/space-weather-india"}, {"t": "Solar Flare Statistics", "d": "Thirty years of GOES flares by phase of the solar cycle, with a fitted power law.", "c": "sun", "u": "https://beyondthesky.in/flare-statistics"}, {"t": "Sun Time Machine", "d": "The real Sun on any day since 1996, from the surface to the corona.", "c": "sun", "u": "https://beyondthesky.in/sun-time-machine"}, {"t": "Aditya-L1", "d": "India’s first solar observatory, its seven instruments and how to get its data.", "c": "sun", "u": "https://beyondthesky.in/aditya-l1"}, {"t": "Kodaikanal Archive", "d": "A century of solar images from the Kodaikanal Solar Observatory.", "c": "sun", "u": "https://beyondthesky.in/kodaikanal"}, {"t": "Solar Cycle Explorer", "d": "Sunspots since 1749, Cycle 25, the butterfly diagram and data to download.", "c": "sun", "u": "https://beyondthesky.in/solar-cycle"}, {"t": "Special Relativity", "d": "Time dilation, the speed limit and E = mc², with live models.", "c": "physics", "u": "https://beyondthesky.in/special-relativity"}, {"t": "General Relativity", "d": "Curved space, slow time, bent light and waves, with a live model of each.", "c": "physics", "u": "https://beyondthesky.in/relativity"}, {"t": "Black Hole Lab", "d": "Fly around a ray-traced black hole, with lessons and quizzes.", "c": "physics", "u": "https://beyondthesky.in/black-hole"}, {"t": "Gravitational Waves", "d": "Every black hole and neutron star merger heard so far, with the chirps.", "c": "physics", "u": "https://beyondthesky.in/gravitational-waves"}, {"t": "Orbits and Kepler", "d": "Launch your own orbit, weigh the Earth and plan a trip to Mars.", "c": "physics", "u": "https://beyondthesky.in/orbits"}, {"t": "Stellar Life Cycles", "d": "The HR diagram, how stars die and where the elements come from.", "c": "physics", "u": "https://beyondthesky.in/stars"}, {"t": "Redshift and Hubble", "d": "Why distant galaxies look red and how the universe expands.", "c": "physics", "u": "https://beyondthesky.in/redshift"}, {"t": "CMB and Dark Matter", "d": "The oldest light, the sound of the early universe and the unseen mass.", "c": "physics", "u": "https://beyondthesky.in/cmb"}, {"t": "Exoplanets", "d": "Worlds orbiting other stars, from real NASA data.", "c": "physics", "u": "https://beyondthesky.in/exoplanet"}, {"t": "MSc Physics Lab", "d": "Sixteen labs: stars, neutron stars, cosmology, radiation, orbits, black holes, discs, the solar wind, CME forecasts, gravitational waves, radio, exoplanets and more.", "c": "physics", "u": "https://beyondthesky.in/msc?level=msc"}, {"t": "Solar System", "d": "Fly through the planets in 3D.", "c": "scale", "u": "https://beyondthesky.in/solar-system"}, {"t": "Size of the Universe", "d": "Zoom from a person to the edge of everything.", "c": "scale", "u": "https://beyondthesky.in/size-of-the-universe"}, {"t": "Sun to Oort Cloud", "d": "How far the Solar System really goes, out to the Voyagers and beyond.", "c": "scale", "u": "https://beyondthesky.in/sun-to-oort-cloud"}, {"t": "Light Travel Time", "d": "When the light you see tonight left its star or galaxy.", "c": "scale", "u": "https://beyondthesky.in/light-travel-time"}, {"t": "Cosmic Timeline", "d": "13.8 billion years, from the Big Bang to now.", "c": "scale", "u": "https://beyondthesky.in/Cosmictimeline"}, {"t": "Time Systems", "d": "Every clock in the universe, live: sundial, star, atomic and Mars time.", "c": "scale", "u": "https://beyondthesky.in/time-systems"}, {"t": "Vishwa Kalamanam (విశ్వ కాలమానం)", "d": "Indian units of time, from paramanu to the life of Brahma, beside science, in Telugu.", "c": "scale", "u": "https://beyondthesky.in/vishwa-kalamanam"}, {"t": "Telescopes", "d": "Live positions of the world’s major telescopes.", "c": "scale", "u": "https://beyondthesky.in/telescopes"}, {"t": "Sky Postcard", "d": "The real sky on your special day, as a postcard.", "c": "learn", "u": "https://beyondthesky.in/sky-postcard"}, {"t": "Sundial and Shadows", "d": "Where shadows fall today, and a sundial to print.", "c": "learn", "u": "https://beyondthesky.in/sundial"}, {"t": "Your Weight in Space", "d": "Your weight and age on other worlds.", "c": "learn", "u": "https://beyondthesky.in/weight-in-space"}, {"t": "Moon Impact Lab", "d": "Crash an asteroid into the Moon and see the crater.", "c": "learn", "u": "https://beyondthesky.in/moon-impact"}, {"t": "Astronomy Quiz", "d": "Test what you know about the sky and space.", "c": "learn", "u": "https://beyondthesky.in/quiz"}, {"t": "For Teachers", "d": "Printable lesson packs in English and Telugu.", "c": "teach", "u": "https://beyondthesky.in/for-teachers"}, {"t": "Research", "d": "Open data guides, Python notebooks and astronomy opportunities in India.", "c": "teach", "u": "https://beyondthesky.in/research"}, {"t": "Careers", "d": "Internships, jobs, workshops and fellowships in physics and astronomy, with email alerts.", "c": "teach", "u": "https://beyondthesky.in/careers"}, {"t": "Installable Sky App", "d": "The sky tools as an app you can add to your phone’s home screen.", "c": "teach", "u": "https://beyondthesky.in/app"}];
const TOOL_TAGS = { all: "All", sky: "Sky tools", sun: "The Sun", physics: "Physics labs", scale: "Scale & time", learn: "Learn & play", teach: "Teaching & careers" };
/* Set to false to hide the links to the live tools. */
const SHOW_TOOL_LINKS = true;
function Projects() {
  const [filter, setFilter] = useState("all");
  const counts = useMemo(() => Object.fromEntries(Object.keys(TOOL_TAGS).map(k => [k, k === "all" ? TOOLS.length : TOOLS.filter(p => p.c === k).length])), []);
  const shown = TOOLS.filter(p => filter === "all" || p.c === filter);
  return html`<${Section} id="projects" p=${[7.0, 7.6]} chapter=${7} label="Projects" title=${`${TOOLS.length} astronomy tools I designed and built`}
    lede="Interactive sky tools, solar data explorers, physics labs and teaching resources, many in both English and Telugu. Each one runs in the browser.">
    <div className="filters" role="group" aria-label="Filter projects">
      ${Object.entries(TOOL_TAGS).map(([k, n]) => html`<button key=${k} type="button" aria-pressed=${filter === k} onClick=${e => { setFilter(k); burstAt(e.currentTarget, { n: 16, speed: 3 }); }}>${n} <span className="count">${counts[k]}</span></button>`)}
    </div>
    <p className="sr" aria-live="polite">${shown.length} projects shown</p>
    <div className="projects">${shown.map(pr => html`<article className="card" key=${pr.t} onMouseEnter=${e => burst(e.clientX, e.clientY, { n: 12, speed: 2.4 })}>
      <div className="tags"><span className=${pr.c === "physics" || pr.c === "teach" ? "dev" : ""}>${TOOL_TAGS[pr.c]}</span></div>
      <h3>${pr.t}</h3><p>${pr.d}</p>
      ${SHOW_TOOL_LINKS && html`<div className="cardfoot"><span></span><a className="link" href=${pr.u} target="_blank" rel="noopener">Open the tool ↗</a></div>`}
    </article>`)}</div>
  <//>`;
}

function Gallery() {
  const dlg = useDialog();
  const n = CONTENT.gallery.length, idx = dlg.data;
  useEffect(() => {
    const k = e => { if (idx == null) return; if (e.key === "ArrowRight") dlg.setData((idx + 1) % n); if (e.key === "ArrowLeft") dlg.setData((idx - 1 + n) % n); };
    addEventListener("keydown", k); return () => removeEventListener("keydown", k);
  }, [idx]);
  return html`<${Section} id="gallery" p=${[8.6, 9.2]} chapter=${9} label="Gallery" title="From the field" lede="Real photographs of telescope sessions, workshops and events go here, shared with permission and captioned.">
    <div className="gallery">${CONTENT.gallery.map((g, i) => html`<figure key=${g.cap}>
      <button className=${"img" + (g.src ? " has-photo" : "")} type="button" aria-label=${"Open photo: " + g.cap} onClick=${e => { burstAt(e.currentTarget, { n: 30, speed: 4 }); dlg.open(i); }}>
        ${g.src ? html`<img src=${g.src} alt=${g.alt} loading="lazy" style=${{ objectPosition: g.pos || "50% 50%" }}/>` : "Photo to add"}</button><figcaption>${g.cap}</figcaption></figure>`)}</div>
    <dialog ref=${dlg.ref} className="modal lightbox" aria-label="Photo viewer">
      ${idx != null && html`<div className="modal-in">
        <div className="modal-head"><span className="label">${idx + 1} / ${n}</span><button className="x" type="button" aria-label="Close" onClick=${dlg.close}>×</button></div>
        ${CONTENT.gallery[idx].src ? html`<img className="lb-photo" src=${CONTENT.gallery[idx].src} alt=${CONTENT.gallery[idx].alt}/>` : html`<div className="img big">Photo to add</div>`}
        <div className="lb-foot"><button className="link" type="button" onClick=${() => dlg.setData((idx - 1 + n) % n)}>← Previous</button>
          <span>${CONTENT.gallery[idx].cap}</span><button className="link" type="button" onClick=${() => dlg.setData((idx + 1) % n)}>Next →</button></div>
      </div>`}
    </dialog><//>`;
}
function Contact({ onToast }) {
  const empty = { name: "", email: "", type: "", message: "", consent: false };
  const [f, setF] = useState(empty);
  const [errors, setErrors] = useState({});
  const [tried, setTried] = useState(false);
  useEffect(() => {
    const h = e => { setF(s => ({ ...s, type: CONTENT.inquiry.find(o => o.toLowerCase().startsWith(e.detail.toLowerCase().split(" ")[0])) || s.type })); document.getElementById("contact")?.scrollIntoView({ behavior: smooth }); };
    addEventListener("prefill", h); return () => removeEventListener("prefill", h);
  }, []);
  const validate = s => {
    const e = {};
    if (!s.name.trim()) e.name = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(s.email)) e.email = "Enter an email address like name@example.com.";
    if (!s.type) e.type = "Choose what the inquiry is about.";
    if (s.message.trim().length < 10) e.message = "Add a few details, at least 10 characters.";
    if (!s.consent) e.consent = "Tick this box so I can reply.";
    return e;
  };
  const set = k => e => { const s = { ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }; setF(s); if (tried) setErrors(validate(s)); };
  const submit = e => {
    e.preventDefault(); setTried(true);
    const er = validate(f); setErrors(er);
    const first = Object.keys(er)[0];
    if (first) { document.getElementById("f-" + first)?.focus(); return; }
    burstAt(e.currentTarget.querySelector("button[type=submit]"), { n: 90, speed: 6.5 });
    const subject = `${f.type}: enquiry from ${f.name}`, body = `${f.message}\n\nName: ${f.name}\nEmail: ${f.email}`;
    window.location.href = `mailto:bhanuastro2427@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    onToast("Your email app should open with the message ready to send. If it doesn’t, email bhanuastro2427@gmail.com or message +91 75692 81287 on WhatsApp.");
    setF(empty); setTried(false);
  };
  const Field = (k, label, input, full) => html`<div className=${"field" + (full ? " full" : "")}>
    <label htmlFor=${"f-" + k}>${label}</label>${input}${errors[k] && html`<span className="err" id=${"e-" + k}>${errors[k]}</span>`}</div>`;
  const a = k => ({ id: "f-" + k, "aria-invalid": errors[k] ? "true" : undefined, "aria-describedby": errors[k] ? "e-" + k : undefined });
  return html`<section className="band" id="contact" aria-labelledby="contact-h" data-p0="9.6" data-p1="10.3" data-kind="content"><div className="inner">
    <div className="arrive"><span className="label">Chapter ${ROMAN[LASTI - 1]} · ${fmtKm(SCENES[LASTI - 1].km)} from Earth</span>
      <p>You have reached the cosmic web, where galaxies gather along filaments hundreds of millions of light-years long. Every stop so far can be seen or photographed from Earth. Keep scrolling: the journey turns around and zooms in to the smallest scale.</p><${Theory} sc=${SCENES[LASTI - 1]}/></div>
    <div className="contact">
    <div>
      <span className="label">Contact</span>
      <h2 id="contact-h">Let’s bring your idea to life</h2>
      <p className="lede" style=${{ marginBottom: "32px" }}>Planning a stargazing evening, a school astronomy session, or a digital project? Send a message with a few details.</p>
      <dl>
        <div><dt>Email</dt><dd><a className="clink" href="mailto:bhanuastro2427@gmail.com">bhanuastro2427@gmail.com</a> <${CopyBtn} text="bhanuastro2427@gmail.com"/></dd></div>
        <div><dt>Phone & WhatsApp</dt><dd><a className="clink" href="tel:+917569281287">+91 75692 81287</a> <${CopyBtn} text="+917569281287"/><br/><a className="link" href="https://wa.me/917569281287" target="_blank" rel="noopener">Message on WhatsApp ↗</a></dd></div>
        <div><dt>Service area</dt><dd>Hyderabad, India <${Ph}>Confirm travel coverage<//></dd></div>
      </dl>
      <button className="link back" type="button" onClick=${() => scrollToP(0)}>↑ Travel back to Earth</button>
    </div>
    <form onSubmit=${submit} noValidate>
      ${Field("name", "Name", html`<input ...${a("name")} autoComplete="name" value=${f.name} onChange=${set("name")}/>`)}
      ${Field("email", "Email", html`<input ...${a("email")} type="email" autoComplete="email" value=${f.email} onChange=${set("email")}/>`)}
      ${Field("type", "Inquiry type", html`<select ...${a("type")} value=${f.type} onChange=${set("type")}><option value="">Choose one</option>${CONTENT.inquiry.map(o => html`<option key=${o}>${o}</option>`)}</select>`, true)}
      ${Field("message", "Message", html`<textarea ...${a("message")} value=${f.message} onChange=${set("message")} placeholder="Date, audience size, venue or project idea"></textarea>`, true)}
      <div className="field full"><label className="consent" htmlFor="f-consent"><input ...${a("consent")} type="checkbox" checked=${f.consent} onChange=${set("consent")}/>
        <span>I agree that my details are used only to reply to this inquiry.</span></label>${errors.consent && html`<span className="err" id="e-consent">${errors.consent}</span>`}</div>
      <div className="send-row"><button className="btn" type="submit">Send by email</button>
        <button className="btn ghost" type="button" onClick=${() => { const t = `Hello Bhanu, I’m ${f.name || "…"}. ${f.type ? f.type + ": " : ""}${f.message}`; window.open(`https://wa.me/917569281287?text=${encodeURIComponent(t)}`, "_blank", "noopener"); }}>Send on WhatsApp</button></div>
    </form></div></div></section>`;
}
function CopyBtn({ text }) {
  const [done, setDone] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1800); } catch (_) { const r = document.createRange(); const el = document.activeElement.previousElementSibling; if (el) { r.selectNodeContents(el); getSelection().removeAllRanges(); getSelection().addRange(r); } } };
  return html`<button type="button" className="copy" onClick=${copy} aria-label=${"Copy " + text}>${done ? "Copied" : "Copy"}</button>`;
}
function Toast({ msg, onDone }) {
  useEffect(() => { if (!msg) return; const t = setTimeout(onDone, 7000); return () => clearTimeout(t); }, [msg]);
  return html`<div role="status" aria-live="polite">${msg && html`<div className="toast">${msg}<button className="x" type="button" aria-label="Dismiss" onClick=${onDone}>×</button></div>`}</div>`;
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
/* ---------- Expertise: five areas as the five bright stars of Cassiopeia ---------- */
const AREAS = [
  { k: "01 · Observation", star: "Segin", t: ["Stargazing +", "Telescopes"], d: "Night-sky stargazing, telescope operation and observation planning." },
  { k: "02 · Education", star: "Ruchbah", t: ["School Outreach +", "Workshops"], d: "School astronomy programs, demonstrations and hands-on workshops." },
  { k: "03 · Communication", star: "Navi", t: ["Science Talks +", "Events"], d: "Science communication, public astronomy evenings and event facilitation." },
  { k: "04 · Digital", star: "Schedar", t: ["Web Design +", "Development"], d: "Responsive websites designed for clarity, speed and usability." },
  { k: "05 · Systems", star: "Caph", t: ["Software +", "Applications"], d: "Applications and interactive educational tools, from concept to working features." }
];
/* Real positions (RA scaled by cos Dec, east to the left), 58 px per degree; radius by apparent magnitude. */
const CAS = [[120, 150, 4.2, "above"], [323, 354, 5.4, "below"], [535, 325, 6.4, "above"], [654, 570, 7.2, "below"], [880, 418, 6.8, "above"]];
const CAS_EDGES = [[0, 1], [1, 2], [2, 3], [3, 4]];
const BG_STARS = (() => { let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; return [...Array(70)].map(() => [r() * 1000, r() * 700, .4 + r() * r() * 1.8, .2 + r() * .5]); })();
function Expertise() {
  const [hot, setHot] = useState(null);
  const dots = useRef([]), edgeEls = useRef([]), edgeB = useRef([]), amp = useRef([0, 0, 0, 0]), hotRef = useRef(null);
  useEffect(() => { hotRef.current = hot; if (hot != null) CAS_EDGES.forEach(([a, b], i) => { if (a === hot || b === hot) amp.current[i] = 14; }); }, [hot]);
  useEffect(() => {
    if (reduced) return;
    let ph = 0;
    const P = [...Array(14)].map((_, i) => ({ e: i % 4, t: Math.random(), v: .003 + Math.random() * .004, dir: i % 2 ? 1 : -1 }));
    let raf;
    const tick = () => {
      P.forEach((p, i) => {
        p.t += p.v; if (p.t > 1) { p.t = 0; p.e = (Math.random() * 4) | 0; }
        const [a, b] = CAS_EDGES[p.e], A = CAS[p.dir > 0 ? a : b], B = CAS[p.dir > 0 ? b : a], el = dots.current[i];
        if (el) { el.setAttribute("cx", A[0] + (B[0] - A[0]) * p.t); el.setAttribute("cy", A[1] + (B[1] - A[1]) * p.t); el.setAttribute("opacity", Math.sin(p.t * Math.PI).toFixed(2)); }
      });
      ph += .55;
      CAS_EDGES.forEach(([a, b], i) => { const el = edgeEls.current[i]; if (!el) return; const A = CAS[a], B = CAS[b], m = amp.current[i] *= .965;
        const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L; let d = `M${A[0]} ${A[1]}`;
        for (let k = 1; k <= 24; k++) { const u = k / 24, w = m * Math.sin(Math.PI * u) * Math.cos(ph) + m * .35 * Math.sin(2 * Math.PI * u) * Math.sin(ph * 1.7); d += `L${(A[0] + dx * u + nx * w).toFixed(1)} ${(A[1] + dy * u + ny * w).toFixed(1)}`; }
        el.setAttribute("d", d);
        [-1, 1].forEach((sg, c) => { const e2 = edgeB.current[i * 2 + c]; if (!e2) return; let d2 = `M${A[0]} ${A[1]}`;
          for (let k = 1; k <= 32; k++) { const u = k / 32, w = m * Math.sin(Math.PI * u) * Math.cos(ph) * .8 + sg * 6 * Math.sin(Math.PI * u) * Math.sin(Math.PI * u * 3 + ph * .12 * sg);
            d2 += `L${(A[0] + dx * u + nx * w).toFixed(1)} ${(A[1] + dy * u + ny * w).toFixed(1)}`; }
          e2.setAttribute("d", d2); }); });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, []);
  const area = hot != null ? AREAS[hot] : null;
  return html`<section className="band" id="expertise" aria-labelledby="exp-h" data-p0="1.3" data-p1="1.6" data-kind="content"><div className="inner">
    <span className="label">Expertise</span>
    <h2 id="exp-h">Five areas, one constellation</h2>
    <p className="lede">Cassiopeia’s five bright stars draw a W in the northern sky, best seen from Hyderabad on autumn and early-winter evenings. Each star is one area of my work. Point at a star to see what it covers.</p>
    <div className="cas" onMouseLeave=${() => setHot(null)}>
      <svg viewBox="0 0 1000 700" aria-hidden="true">
        ${[180, 360, 540].map(y => html`<line key=${"g" + y} className="grid" x1="0" x2="1000" y1=${y} y2=${y + 40}/>`)}
        ${[250, 500, 750].map(x => html`<line key=${"v" + x} className="grid" y1="0" y2="700" x1=${x} x2=${x - 30}/>`)}
        <text className="gridl" x="8" y="172">+64°</text><text className="gridl" x="8" y="352">+61°</text><text className="gridl" x="8" y="532">+58°</text>
        ${BG_STARS.map(([x, y, r, o], i) => html`<circle key=${"b" + i} cx=${x} cy=${y} r=${r} className="bg-star" opacity=${o}/>`)}
        ${CAS_EDGES.map(([a, b], i) => html`<path key=${i} ref=${el => (edgeEls.current[i] = el)} d=${`M${CAS[a][0]} ${CAS[a][1]}L${CAS[b][0]} ${CAS[b][1]}`}
          className=${"w" + (hot == null ? "" : (a === hot || b === hot ? " hot" : " cold"))}/>`)}
        ${CAS_EDGES.map((e, i) => [0, 1].map(c => html`<path key=${"b" + i + c} ref=${el => (edgeB.current[i * 2 + c] = el)} className=${"wb" + (hot != null && (e[0] === hot || e[1] === hot) ? " hot" : "")} d=""/>`))}
        ${[...Array(14)].map((_, i) => html`<circle key=${"d" + i} r="2.4" className="edge-dot" ref=${el => (dots.current[i] = el)} cx="-10" cy="-10"/>`)}
        ${CAS.map(([x, y, r], i) => html`<g key=${"s" + i} className=${"cstar" + (hot === i ? " on" : "")}>
          <circle cx=${x} cy=${y} r=${r * 3.2} className="halo"/><circle cx=${x} cy=${y} r=${r} className="core"/>
          <path d=${`M${x - r * 2.6} ${y}H${x + r * 2.6}M${x} ${y - r * 2.6}V${y + r * 2.6}`} className="spike"/></g>`)}
      </svg>
      ${AREAS.map((a, i) => { const [x, y, , pos] = CAS[i]; return html`<button key=${i} type="button" className=${"cas-l " + pos + (hot === i ? " on" : "")}
        style=${{ left: x / 10 + "%", top: y / 7 + "%" }}
        onMouseEnter=${() => setHot(i)} onFocus=${() => setHot(i)} onClick=${e => { setHot(i); burstAt(e.currentTarget, { n: 14, speed: 2.6 }); }}>
        <span className="pk">${a.k}</span><span className="pt">${a.t[0]}<br/>${a.t[1]}</span><span className="sn">${a.star}</span></button>`; })}
    </div>
    <p className="pent-cap" aria-live="polite">${area ? html`<b>${area.t.join(" ")}</b> ${area.d}` : "Each line is a connection: outreach shapes the tools, and the tools make the sky easier to explain."}</p>
    <ol className="pent-list">${AREAS.map(a => html`<li key=${a.k}><span className="pk">${a.k} · ${a.star}</span><b>${a.t.join(" ")}</b><span>${a.d}</span></li>`)}</ol>
  </div></section>`;
}

/* ---------- Process: a star's life in six stages, along the Milky Way ---------- */
const STAGES = [
  { n: "Understand", obj: "Stellar nebula", s: "Nebula", d: "Stars are born in cold clouds of gas and dust. Every session and project starts the same way, as questions: who is the audience, where is the venue, and what should people leave knowing?" },
  { n: "Plan", obj: "Protostar", s: "Protostar", d: "Gravity pulls the cloud into a hot, dense core that feeds from a spinning disk and fires jets from its poles. Plan what the sky will offer that night, check the Moon and the weather, or map out a site’s pages and features." },
  { n: "Prepare", obj: "Young star and disk", s: "Young star", d: "The young star clears its surroundings while planets begin to form in the disk around it. Set up and align the telescopes, prepare demonstrations, or build and test the first working version." },
  { n: "Deliver", obj: "Main-sequence star", s: "Main sequence", d: "Hydrogen fuses into helium in the core and the star shines steadily, for about 10 billion years in the Sun’s case. Run the stargazing session, school program or workshop, or launch the website or app." },
  { n: "Reflect", obj: "Red giant", s: "Red giant", d: "When the hydrogen in its core runs out, the star swells into a red giant many times its size. Gather questions and feedback, and see what worked and what the sky or the users taught us." },
  { n: "Grow", obj: "Planetary nebula and white dwarf", s: "White dwarf", d: "A Sun-like star sheds its outer layers as a glowing shell around a white dwarf, returning carbon and nitrogen to space for new stars and planets. Turn one evening into a program and one launch into a product that keeps growing." }
];
function Spark({ k, size = 24 }) {
  const dots = (n, r, seed) => [...Array(n)].map((_, i) => { const a = i * 2.39996 + seed, rr = r * Math.sqrt((i + .5) / n); return html`<circle key=${i} cx=${12 + Math.cos(a) * rr} cy=${12 + Math.sin(a) * rr * .8} r=${.55 + (i % 3) * .25} className="si-dot"/>`; });
  const art = [
    html`<g>${dots(22, 8.2, 1)}<circle cx="12" cy="12" r="1.4" className="si-core dim"/></g>`,
    html`<g><path d="M12 2.5V8M12 16v5.5" className="si-jet"/><ellipse cx="12" cy="12" rx="7.5" ry="2" className="si-disk"/><circle cx="12" cy="12" r="2.4" className="si-core warm"/></g>`,
    html`<g><ellipse cx="12" cy="12" rx="9" ry="2.6" className="si-disk"/><ellipse cx="12" cy="12" rx="5.6" ry="1.6" className="si-gap"/><circle cx="12" cy="12" r="2.6" className="si-core"/><circle cx="19.2" cy="12.9" r=".9" className="si-dot"/></g>`,
    html`<g><path d="M12 3.5V7M12 17v3.5M3.5 12H7M17 12h3.5M6 6l2.3 2.3M15.7 15.7L18 18M18 6l-2.3 2.3M8.3 15.7L6 18" className="si-ray"/><circle cx="12" cy="12" r="4" className="si-core sun"/></g>`,
    html`<g><circle cx="12" cy="12" r="8.6" className="si-core red"/><circle cx="9.5" cy="10" r="1.6" className="si-spot"/><circle cx="14.5" cy="14" r="1.2" className="si-spot"/></g>`,
    html`<g><ellipse cx="12" cy="12" rx="8.4" ry="7" className="si-ring"/><ellipse cx="12" cy="12" rx="5.6" ry="4.6" className="si-ring2"/><circle cx="12" cy="12" r="1.3" className="si-core wd"/></g>`
  ];
  return html`<svg className=${"stage-icon" + (k >= 5 ? " guide" : "")} width=${size} height=${size} viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="11.3" className="si-bg"/>${art[k] || art[0]}</svg>`;
}
function buildProcessObjects() {
  const R = Math.random, G = () => { let u = 0; while (!u) u = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.283 * R()); }, O = [];
  const ring = (S, r, n, a, fn) => { let pv = null; for (let i = 0; i <= n; i++) { const t = i / n * 6.283, p = fn(t, r); if (pv) S.push([...pv, ...p, a]); pv = p; } };
  // 0 Understand: a molecular cloud with filaments, gathering toward a dense core
  { const pts = []; for (let i = 0; i < 1300; i++) { const f = i % 5, a = f * 1.26 + G() * .12, r = Math.pow(R(), .7) * 1.7, tw = r * 1.4;
      pts.push([Math.cos(a + tw) * r + G() * .08, G() * .18 * (1 - r / 2), Math.sin(a + tw) * r * .7 + G() * .08, .2 + R() * .5, i % 9 ? 0 : 2]); }
    for (let i = 0; i < 160; i++) pts.push([G() * .12, G() * .1, G() * .12, .7 + R() * .3, 0]);
    O.push({ segs: [], pts, pitch: .75, spin: .08, glow: [{ c: "200,190,235", r: 1.5, a: .14 }, { c: "255,226,190", r: .3, a: .45 }] }); }
  // 1 Plan: a protostar, a hot core fed by a spinning disk, firing jets from its poles
  { const pts = [];
    for (let i = 0; i < 260; i++) pts.push([G() * .09, G() * .09, G() * .09, .7 + R() * .3, 1]);
    for (let i = 0; i < 900; i++) { const r = .18 + Math.pow(R(), .7) * 1.1, a = R() * 6.283; pts.push([Math.cos(a) * r, G() * .03 * (1 + r), Math.sin(a) * r, .22 + R() * .4, r < .45 ? 1 : 0]); }
    for (let i = 0; i < 520; i++) { const sg = i % 2 ? 1 : -1, h = Math.pow(R(), .8) * 1.7, w = .03 + h * .07; pts.push([G() * w, sg * (.12 + h), G() * w, .3 + (1 - h / 1.8) * .55, 2]); }
    for (let i = 0; i < 420; i++) { const u = R() * 2 - 1, a = R() * 6.283, sq = Math.sqrt(1 - u * u), r = 1.2 + R() * .5; pts.push([sq * Math.cos(a) * r, u * r * .8, sq * Math.sin(a) * r, .08 + R() * .14, 0]); }
    pts.push([0, 0, 0, 3, 1]);
    O.push({ segs: [], pts, pitch: .3, spin: .3, glow: [{ c: "255,205,150", r: .42, a: .75, solid: true }, { c: "168,199,255", r: 1.3, a: .08 }] }); }
  // 2 Prepare: a protoplanetary disk with gaps where planets are clearing their orbits
  { const pts = []; for (let i = 0; i < 1500; i++) { let r; do { r = .25 + Math.pow(R(), .8) * 1.45; } while ((r > .62 && r < .72) || (r > 1.08 && r < 1.16));
      const a = R() * 6.283; pts.push([Math.cos(a) * r, G() * .015 * (1 + r), Math.sin(a) * r, .25 + R() * .45, r < .5 ? 1 : 0]); }
    for (const [r, a] of [[.67, 1.1], [1.12, 3.9]]) pts.push([Math.cos(a) * r, 0, Math.sin(a) * r, 2.2, 2]);
    pts.push([0, 0, 0, 3, 1]);
    O.push({ segs: [], pts, pitch: .42, spin: .25, glow: [{ c: "255,232,195", r: .34, a: .8, solid: true }, { c: "255,194,122", r: 1.5, a: .1 }] }); }
  // 3 Deliver: a star ignites, with flaring loops and a corona
  { const S = [], pts = []; for (let i = 0; i < 900; i++) { const u = R() * 2 - 1, a = R() * 6.283, s = Math.sqrt(1 - u * u), r = .62; pts.push([s * Math.cos(a) * r, u * r, s * Math.sin(a) * r, .45 + R() * .5, 1]); }
    for (let i = 0; i < 420; i++) { const u = R() * 2 - 1, a = R() * 6.283, s = Math.sqrt(1 - u * u), r = .66 + Math.pow(R(), 2.5) * .9; pts.push([s * Math.cos(a) * r, u * r, s * Math.sin(a) * r, .2 + R() * .3, 0]); }
    for (let k = 0; k < 22; k++) { const u = R() * 2 - 1, a = R() * 6.283, sq = Math.sqrt(1 - u * u), d = [sq * Math.cos(a), u, sq * Math.sin(a)], L = .64 + .15 + R() * .55;
      S.push([d[0] * .64, d[1] * .64, d[2] * .64, d[0] * L, d[1] * L, d[2] * L, .25 + R() * .35]); }
    pts.push([0, 0, 0, 4, 1]);
    O.push({ segs: S, pts, pitch: .2, spin: .1, glow: [{ c: "255,226,170", r: .68, a: .95, solid: true }, { c: "255,200,120", r: 1.6, a: .22 }] }); }
  // 4 Reflect: a red giant, swollen and mottled by giant convection cells
  { const pts = [], cells = [...Array(9)].map(() => { const u = R() * 2 - 1, a = R() * 6.283, sq = Math.sqrt(1 - u * u); return [sq * Math.cos(a), u, sq * Math.sin(a)]; });
    for (let i = 0; i < 1500; i++) { const u = R() * 2 - 1, a = R() * 6.283, sq = Math.sqrt(1 - u * u), n = [sq * Math.cos(a), u, sq * Math.sin(a)];
      let b = .35 + R() * .3; for (const c of cells) if (Math.hypot(n[0] - c[0], n[1] - c[1], n[2] - c[2]) < .35) b += .25;
      const r = 1.15 + G() * .02; pts.push([n[0] * r, n[1] * r, n[2] * r, Math.min(.95, b), 4]); }
    for (let i = 0; i < 380; i++) { const u = R() * 2 - 1, a = R() * 6.283, sq = Math.sqrt(1 - u * u), r = 1.25 + Math.pow(R(), 2) * .6; pts.push([sq * Math.cos(a) * r, u * r, sq * Math.sin(a) * r, .08 + R() * .12, 4]); }
    pts.push([0, 0, 0, 2.2, 1]);
    O.push({ segs: [], pts, pitch: .15, spin: .05, glow: [{ c: "255,104,58", r: 1.17, a: .85, solid: true, limb: true }, { c: "255,120,72", r: 1.9, a: .14 }] }); }
  // 5 Grow: a planetary nebula, a glowing shell of shed gas around a white dwarf
  { const pts = [];
    for (let i = 0; i < 2400; i++) { const u = R() * 2 - 1, a = R() * 6.283, sq = Math.sqrt(1 - u * u), r = 1 + G() * .07, rim = Math.abs(u) < .55;
      if (!rim && R() < .6) continue; pts.push([sq * Math.cos(a) * r * 1.15, u * r * .95, sq * Math.sin(a) * r, .45 + R() * .5, R() < .6 ? 3 : 4]); }
    for (let i = 0; i < 520; i++) { const u = R() * 2 - 1, a = R() * 6.283, sq = Math.sqrt(1 - u * u), r = Math.pow(R(), .5) * .78; pts.push([sq * Math.cos(a) * r, u * r * .9, sq * Math.sin(a) * r, .2 + R() * .3, 2]); }
    for (let i = 0; i < 300; i++) { const u = R() * 2 - 1, a = R() * 6.283, sq = Math.sqrt(1 - u * u), r = 1.4 + R() * .45; pts.push([sq * Math.cos(a) * r, u * r, sq * Math.sin(a) * r, .06 + R() * .08, 3]); }
    pts.push([0, 0, 0, 2.6, 0]);
    O.push({ segs: [], pts, pitch: .25, spin: .07, glow: [{ c: "242,71,127", r: 1.2, a: .45, ring: true }, { c: "168,199,255", r: .8, a: .16 }, { c: "255,255,255", r: .14, a: 1, solid: true }] }); }
  return O;
}
const PCOL = ["241,238,230", "255,194,122", "168,199,255", "242,71,127", "255,120,72"];
function startProcess(canvas, section, onStage, ctl = { mode: "formed", paused: false }) {
  let ex = 0;
  const ctx = canvas.getContext("2d"), objs = buildProcessObjects(), SP = 7, N = STAGES.length;
  let W = 1, H = 1, raf = 0, t = 0, f = 0, ft = 0, last = performance.now(), shown = -1, visible = false;
  const drag = { on: false, x: 0, y: 0, yaw: 0, pitch: 0, vy: 0, vp: 0 };
  const band = (() => { const R = Math.random, G = () => { let u = 0; while (!u) u = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.283 * R()); }, B = [];
    for (let i = 0; i < 2600; i++) { const x = -12 + R() * (SP * (N - 1) + 24), y = G() * .32 * (1 + .3 * Math.sin(x * .4)), z = G() * .6;
      if (Math.abs(y + .04 * Math.sin(x)) < .045 && R() < .8) continue; const m = Math.pow(R(), 3);
      B.push([x, y - .05, z - .4, .12 + m * .7, R() < .3 ? 2 : R() < .3 ? 1 : 0, R() * 6.28]); } return B; })();
  const resize = () => { const d = Math.min(devicePixelRatio || 1, 2), r = canvas.getBoundingClientRect(); W = r.width; H = r.height; canvas.width = W * d; canvas.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
  const read = () => { const r = section.getBoundingClientRect(), span = r.height - innerHeight; ft = clamp(-r.top / Math.max(1, span), 0, 1) * (N - 1); };
  const down = e => { drag.on = true; drag.x = e.clientX; drag.y = e.clientY; };
  const move = e => { if (!drag.on) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY; drag.vy = dx * .008; drag.vp = dy * .006; drag.yaw += drag.vy; drag.pitch = clamp(drag.pitch + drag.vp, -1.2, 1.2); };
  const up = () => { drag.on = false; };
  canvas.addEventListener("pointerdown", down); addEventListener("pointermove", move); addEventListener("pointerup", up);
  const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); } });
  io.observe(section); addEventListener("resize", resize); resize();
  const small = innerWidth < 700, F = () => Math.min(H * 1.05, W * (W < 700 ? 1.35 : .9));
  function proj(x, y, z, camX) { const zc = 9 - z; if (zc < .3) return null; const k = F() / zc; return [W / 2 + (x - camX) * k, H * (W < 700 ? .5 : .56) - y * k, k]; }
  function frame(now) {
    raf = visible ? requestAnimationFrame(frame) : 0;
    const dt = clamp((now - last) / 1000, 0, .05); last = now; if (!reduced && !ctl.paused) t += dt;
    ex += ((ctl.mode === "scattered" ? 1 : 0) - ex) * Math.min(1, dt * 2.5);
    read(); f += (ft - f) * (reduced ? 1 : 1 - Math.pow(.002, dt));
    const st = Math.round(f); if (st !== shown) { shown = st; drag.yaw = 0; drag.pitch = 0; onStage(st); }
    if (!drag.on) { drag.yaw += drag.vy; drag.vy *= .94; drag.pitch += drag.vp; drag.vp *= .9; drag.pitch *= .98; }
    const camX = f * SP;
    ctx.clearRect(0, 0, W, H); ctx.globalCompositeOperation = "lighter"; ctx.lineCap = "round";
    const c0 = proj(st * SP, 0, 0, camX);
    if (c0) { const g = ctx.createRadialGradient(c0[0], c0[1], 0, c0[0], c0[1], H * .45); g.addColorStop(0, "rgba(241,238,230,.12)"); g.addColorStop(1, "rgba(241,238,230,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    // the Milky Way band the stages sit along
    for (const q of band) { if (Math.abs(q[0] - camX) > 16) continue; const p = proj(q[0], q[1], q[2], camX); if (!p) continue;
      const a = q[3] * (.75 + .25 * Math.sin(t * 1.3 + q[5])); ctx.fillStyle = `rgba(${PCOL[q[4]]},${a.toFixed(3)})`; const s = q[3] > .6 ? 1.8 : 1.1; ctx.fillRect(p[0], p[1], s, s); }
    /* a braid of vibrating strings: each strand plays a different mode, so they weave and cross */
    { const NSTR = small ? 6 : 8, span = SP * (N - 1) + 6;
      for (let k = 0; k < NSTR; k++) {
        const n = 1 + (k % 4) + Math.floor(f * .6), ph = k * 1.7, A = (reduced ? .12 : .4) * (.5 + .5 * Math.abs(Math.sin(k * 2.3))), sp = .55 + k * .12, pts = [];
        for (let x = camX - 16; x <= camX + 16; x += .07) {
          const u = (x + 3) / span, tilt = (x - camX) * -.11;
          const y = tilt + A * Math.sin(Math.PI * u * n * 2 + ph + t * sp) + .06 * Math.sin(x * 1.3 + k);
          const z = A * .9 * Math.cos(Math.PI * u * n * 2 + ph * 1.3 + t * sp * .8);
          const p = proj(x, y, z, camX); if (p) pts.push(p); }
        if (pts.length < 2) continue;
        const amber = k === 0;
        ctx.beginPath(); pts.forEach((p, j) => j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
        ctx.strokeStyle = amber ? "rgba(255,194,122,.08)" : "rgba(241,238,230,.045)"; ctx.lineWidth = 5; ctx.stroke();
        ctx.strokeStyle = amber ? "rgba(255,214,160,.7)" : "rgba(241,238,230,.34)"; ctx.lineWidth = .9; ctx.stroke();
        const shift = Math.floor(t * 40 * sp + k * 13);
        for (let j = 0; j < pts.length; j += 11) { const q = pts[(j + shift) % pts.length];
          ctx.fillStyle = amber ? "rgba(255,214,160,.8)" : "rgba(241,238,230,.6)"; ctx.fillRect(q[0] - .9, q[1] - .9, 1.8, 1.8); }
      } }
    objs.forEach((o, i) => {
      const w = Math.max(0, 1 - Math.abs(f - i)), sc = .8 + .5 * w, br = .25 + .75 * w, cx = i * SP;
      if (Math.abs(cx - camX) > 17) return;
      const yaw = t * (o.spin || .15) + (i === st ? drag.yaw : 0), pitch = (o.pitch || 0) + (i === st ? drag.pitch : 0);
      const cyw = Math.cos(yaw), syw = Math.sin(yaw), cp = Math.cos(pitch), spp = Math.sin(pitch);
      const tf = (x0, y0, z0) => { const h = Math.sin(x0 * 12.9898 + y0 * 78.233 + z0 * 37.719) * 43758.5453, jr = h - Math.floor(h), ee = 1 + ex * (.9 + jr * 1.4) * (i === st ? 1 : .25);
        const x = x0 * ee + ex * (jr - .5) * .6, y = y0 * ee + ex * Math.sin(t * .8 + jr * 6.28) * .12, z = z0 * ee; const X = x * cyw + z * syw, Z = -x * syw + z * cyw; const Y2 = y * cp - Z * spp, Z2 = y * spp + Z * cp; return proj(cx + X * sc, Y2 * sc, Z2 * sc, camX); };
      if (o.glow) { const C = tf(0, 0, 0); if (C) for (const gl of o.glow) {
        const rad = gl.r * sc * C[2] * (1 + ex * .6), a = gl.a * br * (1 - ex * .5), g = ctx.createRadialGradient(C[0], C[1], 0, C[0], C[1], rad), col = gl.c;
        if (gl.ring) { g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(.62, `rgba(${col},${(a * .25).toFixed(3)})`); g.addColorStop(.86, `rgba(${col},${a.toFixed(3)})`); g.addColorStop(1, `rgba(${col},0)`); }
        else if (gl.solid) { g.addColorStop(0, `rgba(${col},${a.toFixed(3)})`); g.addColorStop(gl.limb ? .78 : .55, `rgba(${col},${(a * (gl.limb ? .72 : .6)).toFixed(3)})`); g.addColorStop(gl.limb ? .97 : 1, `rgba(${col},${(gl.limb ? a * .3 : 0).toFixed(3)})`); g.addColorStop(1, `rgba(${col},0)`); }
        else { g.addColorStop(0, `rgba(${col},${a.toFixed(3)})`); g.addColorStop(1, `rgba(${col},0)`); }
        ctx.fillStyle = g; ctx.fillRect(C[0] - rad, C[1] - rad, rad * 2, rad * 2); } }
      for (const s of o.segs) { const A = tf(s[0], s[1], s[2]), B = tf(s[3], s[4], s[5]); if (!A || !B) continue;
        ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]);
        ctx.strokeStyle = `rgba(241,238,230,${(s[6] * br * .08).toFixed(3)})`; ctx.lineWidth = 4; ctx.stroke();
        ctx.strokeStyle = `rgba(241,238,230,${(s[6] * br * .8).toFixed(3)})`; ctx.lineWidth = 1; ctx.stroke(); }
      for (const p of o.pts) { const P = tf(p[0], p[1], p[2]); if (!P) continue; const big = p[3] > 1.5, s = big ? p[3] * 1.6 : 1.5;
        ctx.fillStyle = `rgba(${PCOL[p[4] || 0]},${((big ? .95 : p[3]) * br).toFixed(3)})`;
        if (big) { const g = ctx.createRadialGradient(P[0], P[1], 0, P[0], P[1], s * 3); g.addColorStop(0, `rgba(${PCOL[p[4] || 0]},${(.9 * br).toFixed(2)})`); g.addColorStop(1, `rgba(${PCOL[p[4] || 0]},0)`); ctx.fillStyle = g; ctx.fillRect(P[0] - s * 3, P[1] - s * 3, s * 6, s * 6); }
        else ctx.fillRect(P[0] - s / 2, P[1] - s / 2, s, s); }
    });
    ctx.globalCompositeOperation = "source-over";
  }
  return () => { cancelAnimationFrame(raf); io.disconnect(); removeEventListener("resize", resize); removeEventListener("pointerup", up); removeEventListener("pointermove", move); };
}
function Process() {
  const sec = useRef(), can = useRef();
  const [stage, setStage] = useState(0);
  const strRef = useRef();
  const ctl = useRef({ mode: "formed", paused: false }), [pmode, setPmode] = useState("formed"), [paused, setPaused] = useState(false);
  useEffect(() => { ctl.current.mode = pmode; ctl.current.paused = paused; }, [pmode, paused]);
  useEffect(() => startProcess(can.current, sec.current, setStage, ctl.current), []);
  useEffect(() => { pluckEl(strRef.current, (stage + .5) / STAGES.length, 10); }, [stage]);
  const go = i => { const s = sec.current, top = s.getBoundingClientRect().top + scrollY, span = s.offsetHeight - innerHeight; scrollTo({ top: top + span * i / (STAGES.length - 1) + 2, behavior: smooth }); };
  const N = STAGES.length, S = STAGES[stage];
  return html`<section className="process" id="process" ref=${sec} data-p0="5.2" data-p1="5.6" data-kind="process" aria-labelledby="proc-h">
    <div className="proc-stick">
      <canvas ref=${can} className="proc-canvas" aria-label=${"Interactive model: " + S.obj + ". Drag to rotate."}></canvas>
      <div className="proc-head"><span className="label">Process · the life of a star</span><h2 id="proc-h">From the first question to a full sky</h2></div>
      <ol className="phases"><li className="phase-string" aria-hidden="true" data-string="" data-tone="amber" ref=${strRef}></li>${STAGES.map((s, i) => html`<li key=${i} className=${i === stage ? "on" : i < stage ? "past" : ""}>
        <button type="button" onClick=${() => go(i)} aria-current=${i === stage ? "step" : undefined} aria-label=${`Stage ${i + 1}: ${s.n}`}>
          <span className="ph-l"><span className="ph-n">${String(i + 1).padStart(2, "0")}</span> ${s.n}<span className="ph-sub">${s.s}</span></span><span className="mb"><${Spark} k=${i} size=${i === stage ? 56 : 30}/></span>
        </button></li>`)}</ol>
      <div className="proc-foot">
        <div className="proc-now" aria-live="polite">
          <span className="proc-count"><${Spark} k=${stage} size=${16}/> ${String(stage + 1).padStart(2, "0")} / ${String(N).padStart(2, "0")} · ${S.obj}</span>
          <h3>${S.n}</h3><p>${S.d}</p>
        </div>
        <div className="proc-nav">
          <div className="proc-modes" role="group" aria-label="View">
            ${[["formed", "Formed"], ["scattered", "Scattered"]].map(([k, n]) => html`<button key=${k} type="button" aria-pressed=${pmode === k} onClick=${() => setPmode(k)}>${n}</button>`)}
            <button type="button" aria-pressed=${paused} onClick=${() => setPaused(v => !v)}>${paused ? "Play" : "Pause"}</button>
          </div>
          <span>Drag to rotate, choose a stage to travel to it</span>
          <div className="proc-steps">${STAGES.map((s, i) => html`<button key=${i} type="button" aria-pressed=${i === stage} aria-label=${`Stage ${i + 1}: ${s.n}, ${s.s}`} title=${s.s} onClick=${() => go(i)}><${Spark} k=${i} size=${30}/><span>${String(i + 1).padStart(2, "0")}</span></button>`)}</div></div>
      </div>
    </div></section>`;
}

/* ---------- Sky calculations for Hyderabad, computed in the browser ----------
   Sun: low-precision solar coordinates. Moon: main periodic terms (about 1° accuracy).
   Planets: JPL "Approximate Positions of the Planets", Table 1 (valid 1800–2050). */
const SITE = { lat: 17.385, lon: 78.487, tz: 5.5, name: "Hyderabad" };
const D2R = Math.PI / 180, R2D = 180 / Math.PI;
const n360 = x => ((x % 360) + 360) % 360;
const dayNum = date => date.getTime() / 86400000 + 2440587.5 - 2451545;
const oblq = d => (23.439 - 4e-7 * d) * D2R;
function eclToEq(lon, lat, d) {
  const l = lon * D2R, b = lat * D2R, e = oblq(d);
  const x = Math.cos(b) * Math.cos(l), y = Math.cos(b) * Math.sin(l) * Math.cos(e) - Math.sin(b) * Math.sin(e), z = Math.cos(b) * Math.sin(l) * Math.sin(e) + Math.sin(b) * Math.cos(e);
  return { ra: n360(Math.atan2(y, x) * R2D), dec: Math.asin(z) * R2D };
}
function sunLon(d) { const L = 280.460 + .9856474 * d, g = (357.528 + .9856003 * d) * D2R; return n360(L + 1.915 * Math.sin(g) + .020 * Math.sin(2 * g)); }
function moonEcl(d) {
  const L = 218.316 + 13.176396 * d, M = (134.963 + 13.064993 * d) * D2R, F = (93.272 + 13.229350 * d) * D2R, D = (297.850 + 12.190749 * d) * D2R, Ms = (357.529 + .98560028 * d) * D2R;
  return { lon: n360(L + 6.289 * Math.sin(M) + 1.274 * Math.sin(2 * D - M) + .658 * Math.sin(2 * D) + .214 * Math.sin(2 * M) - .186 * Math.sin(Ms) - .114 * Math.sin(2 * F)), lat: 5.128 * Math.sin(F) };
}
const ELEM = {
  Mercury: [.38709927, .20563593, 7.00497902, 252.25032350, 77.45779628, 48.33076593, .00000037, .00001906, -.00594749, 149472.67411175, .16047689, -.12534081],
  Venus: [.72333566, .00677672, 3.39467605, 181.97909950, 131.60246718, 76.67984255, .00000390, -.00004107, -.00078890, 58517.81538729, .00268329, -.27769418],
  Earth: [1.00000261, .01671123, -.00001531, 100.46457166, 102.93768193, 0, .00000562, -.00004392, -.01294668, 35999.37244981, .32327364, 0],
  Mars: [1.52371034, .09339410, 1.84969142, -4.55343205, -23.94362959, 49.55953891, .00001847, .00007882, -.00813131, 19140.30268499, .44441088, -.29257343],
  Jupiter: [5.20288700, .04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909, -.00011607, -.00013253, -.00183714, 3034.74612775, .21252668, .20469106],
  Saturn: [9.53667594, .05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448, -.00125060, -.00050991, .00193609, 1222.49362201, -.41897216, -.28867794]
};
function helio(p, T) {
  const a = p[0] + p[6] * T, e = p[1] + p[7] * T, I = (p[2] + p[8] * T) * D2R, L = p[3] + p[9] * T, w = p[4] + p[10] * T, O = p[5] + p[11] * T;
  let M = n360(L - w); if (M > 180) M -= 360; M *= D2R;
  let E = M + e * Math.sin(M); for (let k = 0; k < 6; k++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  const xp = a * (Math.cos(E) - e), yp = a * Math.sqrt(1 - e * e) * Math.sin(E), om = (w - O) * D2R, Om = O * D2R;
  const co = Math.cos(om), so = Math.sin(om), cO = Math.cos(Om), sO = Math.sin(Om), cI = Math.cos(I), sI = Math.sin(I);
  return [(co * cO - so * sO * cI) * xp + (-so * cO - co * sO * cI) * yp, (co * sO + so * cO * cI) * xp + (-so * sO + co * cO * cI) * yp, so * sI * xp + co * sI * yp];
}
function radec(name, date) {
  const d = dayNum(date);
  if (name === "Sun") return eclToEq(sunLon(d), 0, d);
  if (name === "Moon") { const m = moonEcl(d); return eclToEq(m.lon, m.lat, d); }
  const T = d / 36525, P = helio(ELEM[name], T), E = helio(ELEM.Earth, T), g = [P[0] - E[0], P[1] - E[1], P[2] - E[2]];
  return eclToEq(n360(Math.atan2(g[1], g[0]) * R2D), Math.atan2(g[2], Math.hypot(g[0], g[1])) * R2D, d);
}
function altAz(name, date) {
  const { ra, dec } = radec(name, date), d = dayNum(date), lst = n360(280.46061837 + 360.98564736629 * d + SITE.lon);
  const H = (lst - ra) * D2R, ph = SITE.lat * D2R, de = dec * D2R;
  const alt = Math.asin(Math.sin(ph) * Math.sin(de) + Math.cos(ph) * Math.cos(de) * Math.cos(H));
  const az = Math.atan2(-Math.sin(H) * Math.cos(de), Math.cos(ph) * Math.sin(de) - Math.sin(ph) * Math.cos(de) * Math.cos(H));
  return { alt: alt * R2D, az: n360(az * R2D) };
}
const COMPASS = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"];
const dirOf = az => COMPASS[Math.round(az / 45) % 8];
const istDate = (y, m, dd, h = 0, mi = 0) => new Date(Date.UTC(y, m, dd, h, mi) - SITE.tz * 3600000);
const istParts = date => { const t = new Date(date.getTime() + SITE.tz * 3600000); return { y: t.getUTCFullYear(), m: t.getUTCMonth(), d: t.getUTCDate(), h: t.getUTCHours(), mi: t.getUTCMinutes(), wd: t.getUTCDay() }; };
const fmtTime = date => { const p = istParts(date), h12 = ((p.h + 11) % 12) + 1; return `${h12}:${String(p.mi).padStart(2, "0")} ${p.h < 12 ? "AM" : "PM"}`; };
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const fmtDay = date => { const p = istParts(date); return `${DAYS[p.wd]} ${p.d} ${MONTHS[p.m]}`; };
function moonPhase(date) {
  const d = dayNum(date), el = n360(moonEcl(d).lon - sunLon(d)), illum = (1 - Math.cos(el * D2R)) / 2;
  const name = el < 8 || el > 352 ? "New Moon" : el < 82 ? "Waxing crescent" : el < 98 ? "First quarter" : el < 172 ? "Waxing gibbous" : el < 188 ? "Full Moon" : el < 262 ? "Waning gibbous" : el < 278 ? "Last quarter" : "Waning crescent";
  return { el, illum, name, age: el / 360 * 29.53 };
}
const SKY_NOTES = {
  Moon: "Craters show best along the line between day and night.",
  Mercury: "Low in twilight and never far from the Sun. Look just after sunset or before sunrise.",
  Venus: "The brightest planet. It never strays far from the Sun, so look in twilight.",
  Mars: "A steady orange-red point that does not twinkle like the stars around it.",
  Jupiter: "Binoculars held steady show up to four of its moons in a line.",
  Saturn: "A small telescope shows the rings."
};
function tonight(y, m, dd) {
  const start = istDate(y, m, dd, 12), steps = 24 * 12, sun = [];
  for (let i = 0; i <= steps; i++) { const t = new Date(start.getTime() + i * 300000); sun.push([t, altAz("Sun", t).alt]); }
  const cross = (lvl, down) => { for (let i = 1; i < sun.length; i++) if (down ? sun[i - 1][1] >= lvl && sun[i][1] < lvl : sun[i - 1][1] < lvl && sun[i][1] >= lvl) return sun[i][0]; return null; };
  const sunset = cross(-.833, true), sunrise = cross(-.833, false), darkStart = cross(-18, true), darkEnd = cross(-18, false), nightStart = cross(-6, true), nightEnd = cross(-6, false);
  const objs = ["Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"].map(name => {
    let best = null, first = null, last = null;
    if (nightStart && nightEnd) for (let t = nightStart.getTime(); t <= nightEnd.getTime(); t += 600000) {
      const dt = new Date(t), h = altAz(name, dt);
      if (h.alt > 10) { if (!first) first = dt; last = dt; if (!best || h.alt > best.alt) best = { ...h, t: dt }; }
    }
    return { name, visible: !!best, best, first, last, note: SKY_NOTES[name] };
  });
  const phase = moonPhase(istDate(y, m, dd, 21));
  const moon = objs[0], darkHours = darkStart && darkEnd ? (darkEnd - darkStart) / 3600000 : 0;
  const moonDark = moon.visible && moon.first && moon.last ? Math.max(0, (Math.min(moon.last, darkEnd) - Math.max(moon.first, darkStart)) / 3600000) : 0;
  const rating = phase.illum < .3 || moonDark < darkHours * .3 ? "Good night for faint stars and the Milky Way" : phase.illum > .75 ? "Bright Moon: best for the Moon and planets" : "Fair: plan deep-sky viewing around the Moon";
  return { sunset, sunrise, darkStart, darkEnd, objs, phase, rating };
}
function lunarEvents(from, days) {
  const out = []; let prev = null;
  for (let h = 0; h <= days * 24; h++) {
    const t = new Date(from.getTime() + h * 3600000), d = dayNum(t), el = n360(moonEcl(d).lon - sunLon(d));
    if (prev != null) { if (prev > 300 && el < 60) out.push({ t, kind: "new" }); if (prev < 180 && el >= 180) out.push({ t, kind: "full" }); }
    prev = el;
  }
  return out;
}
const SHOWERS = [["Quadrantids", 0, 3], ["Lyrids", 3, 22], ["Eta Aquariids", 4, 5], ["Perseids", 7, 12], ["Orionids", 9, 21], ["Leonids", 10, 17], ["Geminids", 11, 13]];
function skyCalendar(now) {
  const p = istParts(now), from = istDate(p.y, p.m, p.d), until = from.getTime() + 120 * 86400000, items = [];
  lunarEvents(from, 120).forEach(e => items.push(e.kind === "new"
    ? { t: e.t, title: "New Moon", tag: "Best nights", d: "Darkest skies of the month. The nights around it are the best for faint stars, nebulae and the Milky Way." }
    : { t: e.t, title: "Full Moon", tag: "Moon night", d: "The Moon is up all night and washes out faint stars. A good night to talk about the Moon itself." }));
  for (const yr of [p.y, p.y + 1]) SHOWERS.forEach(([n, mo, da]) => { const t = istDate(yr, mo, da, 23); if (t >= from && t.getTime() <= until) items.push({ t, title: `${n} meteor shower peak`, tag: "Meteor shower", d: "Approximate peak night. Watch after midnight from a dark site, away from city lights." }); });
  return items.sort((a, b) => a.t - b.t).slice(0, 8);
}

/* ---------- Tonight's Sky + calendar + events section ---------- */
/* Add Bhanu's own public sessions here. Each one also becomes an Event in Google's structured data.
   { date: "2026-12-14", time: "19:30", title: "Geminids night", place: "Venue, Hyderabad", desc: "…", link: "https://…" } */
const EVENTS = [];
function MoonIcon({ el, size = 64 }) {
  const f = el / 360, c = 32, r = 28, rx = Math.abs(Math.cos(el * D2R)) * r, waxing = f < .5;
  const crescent = (el < 90) || (el > 270);
  const lit = `M${c} ${c - r}A${r} ${r} 0 0 ${waxing ? 1 : 0} ${c} ${c + r}A${rx} ${r} 0 0 ${crescent ? (waxing ? 0 : 1) : (waxing ? 1 : 0)} ${c} ${c - r}Z`;
  return html`<svg width=${size} height=${size} viewBox="0 0 64 64" className="moonicon" aria-hidden="true"><circle cx="32" cy="32" r="28" className="m-dark"/><path d=${lit} className="m-lit"/></svg>`;
}
function useEventSchema(events) {
  useEffect(() => {
    if (!events.length) return;
    const s = document.createElement("script"); s.type = "application/ld+json";
    s.textContent = JSON.stringify(events.map(e => ({ "@context": "https://schema.org", "@type": "Event", name: e.title, startDate: `${e.date}T${e.time || "19:00"}:00+05:30`,
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode", eventStatus: "https://schema.org/EventScheduled", description: e.desc,
      location: { "@type": "Place", name: e.place, address: { "@type": "PostalAddress", addressLocality: "Hyderabad", addressCountry: "IN" } },
      organizer: { "@type": "Person", name: "Bhanu Prakash" }, url: e.link || location.href.split("#")[0] })));
    document.head.appendChild(s); return () => s.remove();
  }, []);
}
function Tonight() {
  const now = new Date(), p0 = istParts(now);
  const [off, setOff] = useState(0);
  const base = istDate(p0.y, p0.m, p0.d + off), p = istParts(base);
  const sky = useMemo(() => tonight(p.y, p.m, p.d), [off]);
  const cal = useMemo(() => skyCalendar(now), []);
  useEventSchema(EVENTS);
  const strRef = useRef();
  useEffect(() => { pluckEl(strRef.current, .5, 6); }, [off]);
  const vis = sky.objs.filter(o => o.visible), hidden = sky.objs.filter(o => !o.visible);
  const label = off === 0 ? "Tonight" : off === 1 ? "Tomorrow night" : fmtDay(base);
  return html`<${Section} id="tonight" p=${[3.2, 3.6]} label="Tonight’s Sky" title="What’s up over Hyderabad"
    lede="Calculated live in your browser for Hyderabad (17.4° N, 78.5° E). Positions are good to about a degree and times to a few minutes.">
    <div className="sky-controls" role="group" aria-label="Choose a night">
      ${[0, 1, 2, 3, 4, 5, 6].map(k => html`<button key=${k} type="button" aria-pressed=${off === k} onClick=${() => setOff(k)}>${k === 0 ? "Tonight" : fmtDay(istDate(p0.y, p0.m, p0.d + k))}</button>`)}
    </div>
    <div className="sky-grid">
      <div className="sky-moon">
        <${MoonIcon} el=${sky.phase.el} size=${96}/>
        <div><span className="label">${label} · Moon</span><h3>${sky.phase.name}</h3>
          <p className="coordline">${Math.round(sky.phase.illum * 100)}% lit · ${sky.phase.age.toFixed(1)} days since New Moon</p>
          <p className="rating">${sky.rating}</p></div>
      </div>
      <dl className="sky-times">
        <div><dt>Sunset</dt><dd>${sky.sunset ? fmtTime(sky.sunset) : "—"}</dd></div>
        <div><dt>Fully dark</dt><dd>${sky.darkStart ? fmtTime(sky.darkStart) : "—"}</dd></div>
        <div><dt>Dark until</dt><dd>${sky.darkEnd ? fmtTime(sky.darkEnd) : "—"}</dd></div>
        <div><dt>Sunrise</dt><dd>${sky.sunrise ? fmtTime(sky.sunrise) : "—"}</dd></div>
      </dl>
    </div>
    <div className="sky-string" data-string="" data-tone="amber" ref=${strRef} aria-hidden="true"></div>
    <div className="sky-list">
      ${vis.map(o => html`<article key=${o.name} className="sky-obj">
        <h3>${o.name}</h3>
        <p className="when">${o.first.getTime() === o.last.getTime() ? "Around " + fmtTime(o.first) : "Up " + fmtTime(o.first) + " – " + fmtTime(o.last)}</p>
        <p>Highest at <b>${fmtTime(o.best.t)}</b>, ${Math.round(o.best.alt)}° up in the ${dirOf(o.best.az)}.</p>
        <p className="note">${o.note}</p></article>`)}
      ${!vis.length && html`<p>No bright planets are well placed ${label.toLowerCase()}.</p>`}
    </div>
    ${hidden.length > 0 && html`<p className="sky-hidden">Not well placed ${label.toLowerCase()}: ${hidden.map(o => o.name).join(", ")}.</p>`}

    <div className="subhead" style=${{ marginTop: "72px" }}><h3>Sky calendar</h3><span>Next 4 months</span></div>
    <ol className="cal">${cal.map((e, i) => html`<li key=${i}>
      <time dateTime=${e.t.toISOString()}><b>${istParts(e.t).d}</b><span>${MONTHS[istParts(e.t).m]} ${istParts(e.t).y}</span></time>
      <div><span className=${"tag" + (e.tag === "Best nights" ? " good" : "")}>${e.tag}</span><h4>${e.title}</h4><p>${e.d}</p></div></li>`)}</ol>

    <div className="subhead" style=${{ marginTop: "72px" }}><h3>Upcoming sessions</h3><span>Public stargazing</span></div>
    ${EVENTS.length ? html`<ol className="cal">${EVENTS.map((e, i) => html`<li key=${i}><time dateTime=${e.date}><b>${+e.date.slice(8, 10)}</b><span>${MONTHS[+e.date.slice(5, 7) - 1]} ${e.date.slice(0, 4)}</span></time>
        <div><span className="tag good">${e.time || "Evening"} · ${e.place}</span><h4>${e.title}</h4><p>${e.desc}</p>${e.link && html`<a className="link" href=${e.link}>Details →</a>`}</div></li>`)}</ol>`
      : html`<div className="no-events"><p>No public sessions are announced right now. New dates are planned around the New Moon nights above.</p>
        <button className="btn ghost" type="button" onClick=${() => window.dispatchEvent(new CustomEvent("prefill", { detail: "Guided stargazing session" }))}>Request a session</button></div>`}
  <//>`;
}

/* ---------- Sky Notes (articles are static pages in /notes for search engines) ---------- */
const NOTES = [
  { slug: "sky-december-2026", title: "The night sky over Hyderabad: December 2026", tag: "Monthly sky · Dec 2026", mins: 3, d: "The Geminid meteor shower under dark skies, Saturn high in the evening, Jupiter and Mars rising in Leo, and Venus before dawn." },
  { slug: "sky-january-2027", title: "The night sky over Hyderabad: January 2027", tag: "Monthly sky · Jan 2027", mins: 3, d: "The Quadrantid meteors, Orion and its nebula high in the evening, Jupiter and Mars near Regulus, Saturn sinking in the west." },
  { slug: "sky-february-2027", title: "The night sky over Hyderabad: February 2027", tag: "Monthly sky · Feb 2027", mins: 3, d: "Jupiter and Mars reach opposition in Leo and are up all night, Saturn says goodbye in the evening twilight, and Venus rises before dawn." },
  { slug: "best-night-for-stargazing", title: "When is the best night to go stargazing?", tag: "Planning", mins: 4, d: "Why the New Moon week, a dark site and twenty minutes of patience matter more than a big telescope." },
  { slug: "find-cassiopeia-from-hyderabad", title: "How to find Cassiopeia from Hyderabad", tag: "Constellations", mins: 3, d: "The bright W in the northern sky: when to look, where to face, and the five stars that make it." },
  { slug: "see-the-orion-nebula", title: "See the Orion Nebula with your own eyes", tag: "Deep sky", mins: 3, d: "A star nursery 1,344 light-years away that you can spot from a dark site, no telescope needed." }
];
function SkyNotes() {
  return html`<${Section} id="notes" p=${[9.2, 9.6]} label="Sky Notes" title="Short guides to the night sky"
    lede="Practical notes for beginners: what to look for, when, and how, from the sessions I run.">
    <div className="note-grid">${NOTES.map(n => html`<a key=${n.slug} className="note-card" href=${"notes/" + n.slug + ".html"} onMouseEnter=${e => burst(e.clientX, e.clientY, { n: 10, speed: 2 })}>
      <span className="tag">${n.tag} · ${n.mins} min read</span><h3>${n.title}</h3><p>${n.d}</p><span className="link">Read the note →</span></a>`)}</div>
  <//>`;
}

/* ---------- Light: the wave each stop is seen by ---------- */
function nmColor(nm) {
  let r = 0, g = 0, b = 0;
  if (nm < 440) { r = (440 - nm) / 60; b = 1; } else if (nm < 490) { g = (nm - 440) / 50; b = 1; } else if (nm < 510) { g = 1; b = (510 - nm) / 20; }
  else if (nm < 580) { r = (nm - 510) / 70; g = 1; } else if (nm < 645) { r = 1; g = (645 - nm) / 65; } else r = 1;
  const f = nm < 420 ? .3 + .7 * (nm - 380) / 40 : nm > 700 ? .3 + .7 * (780 - nm) / 80 : 1;
  return `rgb(${[r, g, b].map(c => Math.round(255 * Math.pow(Math.max(0, c) * f, .8))).join(",")})`;
}
function LightWave({ wave }) {
  const W = 132, H = 20, pts = [];
  const kind = typeof wave === "number" ? "nm" : wave;
  for (let x = 0; x <= W; x += 1.5) {
    let y = 0;
    if (kind === "nm") y = Math.sin(x / (wave / 70) * 2) * 6;
    else if (kind === "radio") y = Math.sin(x / 22) * 6;
    else if (kind === "broad") y = Math.sin(Math.pow(x / W, 2.2) * 60) * 6;
    else if (kind === "red") y = Math.sin(x / (720 / 70) * 2 * (1 - x / W * .25)) * 6;
    pts.push(`${x.toFixed(1)},${(H / 2 - y).toFixed(1)}`);
  }
  const col = kind === "nm" ? nmColor(wave) : kind === "red" ? "#ff6b4a" : kind === "none" ? "var(--dim)" : "var(--ice)";
  return html`<svg className="lightwave" width=${W} height=${H} viewBox=${`0 0 ${W} ${H}`} aria-hidden="true">
    ${kind === "none" ? html`<line x1="0" y1=${H / 2} x2=${W} y2=${H / 2} stroke=${col} strokeDasharray="2 5"/>` : html`<polyline points=${pts.join(" ")} fill="none" stroke=${col} strokeWidth="1.6" strokeLinecap="round"/>`}</svg>`;
}
/* the physics each stop shows on top of the particles: general relativity, lensing, dark matter and more */
function Theory({ sc }) {
  if (!sc.theory) return null;
  return html`<div className="theory">${sc.theory.map(([t, d, how]) => html`<div key=${t}><span className="label">Physics · ${t}</span><p>${d}</p>${how && html`<p className="how">${how}</p>`}</div>`)}</div>`;
}
function SeenBy({ sc }) {
  if (!sc.light) return null;
  return html`<div className="seenby"><${LightWave} wave=${sc.light[1]}/><div><span className="label">Seen by · ${sc.light[0]}</span><p>${sc.light[2]}</p></div></div>`;
}

/* ---------- Light: wave or particle? An interactive double-slit experiment ---------- */
function startDoubleSlit(canvas, state) {
  const ctx = canvas.getContext("2d"), hits = [], flying = [], bins = new Float32Array(90);
  let W = 1, H = 1, raf = 0, t = 0, visible = false, last = 0, acc = 0;
  const resize = () => { const d = Math.min(devicePixelRatio || 1, 2), r = canvas.getBoundingClientRect(); W = r.width; H = r.height; canvas.width = W * d; canvas.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
  const geo = () => ({ sx: W * .08, bx: W * .42, scr: W * .9, cy: H / 2, d: H * .16, a: H * .028 });
  // intensity on the screen: two-slit interference times the single-slit envelope, or two separate humps when the path is measured
  const I = (y, g) => { const L = g.scr - g.bx, lam = state.nm / 550 * H * .055, k = Math.PI / (lam * L);
    const env = u => { const b = k * g.a * u; return b === 0 ? 1 : Math.pow(Math.sin(b) / b, 2); };
    if (state.detect) { const s = g.d * 1.7; return .5 * (Math.exp(-Math.pow((y - g.d / 2) / s, 2)) + Math.exp(-Math.pow((y + g.d / 2) / s, 2))); }
    return Math.pow(Math.cos(k * g.d * y), 2) * env(y); };
  const sample = g => { for (let n = 0; n < 400; n++) { const y = (Math.random() * 2 - 1) * H * .46; if (Math.random() < I(y, g)) return y; } return 0; };
  const fire = () => { const g = geo(), slit = Math.random() < .5 ? -1 : 1; flying.push({ x: g.sx, y: g.cy, slit, target: sample(g), stage: 0 }); };
  state.clear = () => { hits.length = 0; bins.fill(0); state.onCount(0); };
  function frame(now) {
    raf = visible ? requestAnimationFrame(frame) : 0;
    const dt = Math.min(.05, (now - (last || now)) / 1000); last = now; t += dt;
    if (state.on) { acc += dt * state.rate; while (acc > 1) { fire(); acc--; } }
    const g = geo(), col = nmColor(state.nm);
    ctx.clearRect(0, 0, W, H);
    // waves spreading from the slits (only while no one watches which slit)
    if (!state.detect && !reduced) { ctx.lineWidth = 1;
      for (const s of [-1, 1]) for (let k = 0; k < 9; k++) { const r = ((t * 60 + k * 34) % 306);
        ctx.beginPath(); ctx.arc(g.bx, g.cy + s * g.d / 2, r, -Math.PI / 2.4, Math.PI / 2.4);
        ctx.strokeStyle = col.replace("rgb", "rgba").replace(")", `,${(.22 * (1 - r / 306)).toFixed(3)})`); ctx.stroke(); } }
    // incoming plane waves
    if (!reduced) for (let k = 0; k < 6; k++) { const x = g.sx + ((t * 60 + k * 34) % (g.bx - g.sx)); ctx.fillStyle = col.replace("rgb", "rgba").replace(")", ",.12)"); ctx.fillRect(x, g.cy - H * .3, 1, H * .6); }
    // barrier with two slits
    ctx.fillStyle = "rgba(190,200,235,.55)";
    const s1 = g.cy - g.d / 2, s2 = g.cy + g.d / 2;
    ctx.fillRect(g.bx - 2, 0, 4, s1 - g.a); ctx.fillRect(g.bx - 2, s1 + g.a, 4, s2 - s1 - 2 * g.a); ctx.fillRect(g.bx - 2, s2 + g.a, 4, H - s2 - g.a);
    if (state.detect) { ctx.strokeStyle = "rgba(255,194,122,.9)"; ctx.lineWidth = 1.5; for (const y of [s1, s2]) { ctx.beginPath(); ctx.arc(g.bx + 10, y, 6, 0, 6.283); ctx.stroke(); } }
    // source
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(g.sx, g.cy, 5, 0, 6.283); ctx.fill();
    // photons in flight: always detected as single dots
    for (let i = flying.length - 1; i >= 0; i--) { const p = flying[i], v = W * .9 * dt;
      if (p.stage === 0) { p.x += v; if (p.x >= g.bx) { p.stage = 1; p.y = g.cy + (state.detect ? p.slit * g.d / 2 : 0); } }
      else { p.x += v; const f = (p.x - g.bx) / (g.scr - g.bx); p.y = g.cy + (state.detect ? p.slit * g.d / 2 : 0) * (1 - f) + p.target * f;
        if (p.x >= g.scr) { flying.splice(i, 1); hits.push([g.scr + Math.random() * W * .07, g.cy + p.target]); const b = Math.floor((p.target / (H * .46) * .5 + .5) * bins.length); if (b >= 0 && b < bins.length) bins[b]++; state.onCount(hits.length); if (hits.length > 6000) hits.shift(); continue; } }
      ctx.fillStyle = "#fff"; ctx.fillRect(p.x - 1, p.y - 1, 2.4, 2.4); }
    // the detection screen
    ctx.fillStyle = "rgba(190,200,235,.08)"; ctx.fillRect(g.scr, 0, W * .07, H);
    ctx.fillStyle = col; for (const h of hits) ctx.fillRect(h[0], h[1], 1.4, 1.4);
    // histogram of arrivals
    const mx = Math.max(1, ...bins); ctx.beginPath();
    for (let i = 0; i < bins.length; i++) { const y = g.cy + ((i + .5) / bins.length * 2 - 1) * H * .46, x = g.scr - 6 - bins[i] / mx * W * .16; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.strokeStyle = "rgba(255,194,122,.8)"; ctx.lineWidth = 1.2; ctx.stroke();
  }
  const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible && !raf) { last = 0; raf = requestAnimationFrame(frame); } });
  io.observe(canvas); resize(); addEventListener("resize", resize);
  return () => { io.disconnect(); cancelAnimationFrame(raf); removeEventListener("resize", resize); };
}
function LightSection() {
  const can = useRef(), st = useRef({ on: true, detect: false, nm: 532, rate: 70, onCount: () => {} });
  const [on, setOn] = useState(true), [detect, setDetect] = useState(false), [nm, setNm] = useState(532), [count, setCount] = useState(0);
  useEffect(() => { st.current.onCount = c => { if (c % 25 === 0 || c < 25) setCount(c); }; return startDoubleSlit(can.current, st.current); }, []);
  useEffect(() => { Object.assign(st.current, { on, detect, nm }); }, [on, detect, nm]);
  const reset = () => { st.current.clear?.(); setCount(0); };
  return html`<${Section} id="light" p=${[6.6, 7.0]} label="Light · wave or particle?" title="Everything on this journey reaches us as light"
    lede="Every stop on this site is known to us only through the light it sends. And light behaves in two ways at once: it spreads and interferes like a wave, yet it always arrives as single particles called photons.">
    <div className="slit-wrap">
      <canvas ref=${can} className="slit" role="img" aria-label=${`Double-slit experiment: ${count} photons detected. ${detect ? "Which-slit detectors on: two plain bands." : "No detectors: interference stripes."}`}></canvas>
      <div className="slit-ui">
        <div className="slit-stats"><b>${count.toLocaleString("en")}</b><span>photons detected</span></div>
        <div className="slit-ctl" role="group" aria-label="Experiment controls">
          <button type="button" aria-pressed=${on} onClick=${() => setOn(v => !v)}>${on ? "Pause photons" : "Fire photons"}</button>
          <button type="button" aria-pressed=${detect} onClick=${() => { setDetect(v => !v); reset(); }}>${detect ? "Stop watching the slits" : "Watch which slit"}</button>
          <button type="button" onClick=${reset}>Clear screen</button>
        </div>
        <label className="slit-nm" htmlFor="nm">Colour of light <b style=${{ color: nmColor(nm) }}>${nm} nm</b>
          <input id="nm" type="range" min="400" max="680" step="2" value=${nm} onInput=${e => { setNm(+e.target.value); reset(); }}/></label>
      </div>
    </div>
    <ol className="duality">
      <li><span className="label">1801 · Wave</span><h3>Stripes</h3><p>Thomas Young sent light through two narrow slits. It spread out and overlapped like ripples on water, making bright and dark stripes where the waves add up or cancel. Longer, redder light makes wider stripes: try the slider.</p></li>
      <li><span className="label">1905 · Particle</span><h3>Photons</h3><p>Einstein explained the photoelectric effect by treating light as packets of energy, photons, each carrying E = hf. It earned him the 1921 Nobel Prize. On a screen, light always lands as single dots.</p></li>
      <li><span className="label">Both · Complementarity</span><h3>Watch, and the stripes vanish</h3><p>Fire photons one at a time and the dots still build up stripes, as if each one passed through both slits. Measure which slit each photon takes and the stripes disappear, leaving two plain bands. Press “Watch which slit” to see it.</p></li>
    </ol>
    <p className="duality-note">Telescopes use both sides of light: they collect photons one by one, and they split light into its wavelengths to read what stars and nebulae are made of. The particles behind this whole site do the same: they travel between chapters as waves, and settle into points when they arrive.</p>
  <//>`;
}

/* ---------- String lab: one string, many notes ---------- */
const MODES = [
  { n: 1, open: "The lowest vibration of an open string is massless. In many string models, a state like this behaves as the photon, the particle of light.", closed: "One of the closed string’s lowest vibrations is massless and behaves like the graviton, the particle string theory proposes for gravity." },
  { n: 2, open: "One step up the scale: more nodes, more energy. In string theory, more vibrational energy shows up as more mass.", closed: "A closed loop vibrates in waves running both ways around it, like a ring that rings." },
  { n: 3, open: "Each higher harmonic would be a heavier particle, in steps set by the string’s tension.", closed: "Higher loop modes would also be heavier particles, far beyond anything a collider can make." },
  { n: 4, open: "These heavy states are near the Planck scale, so no experiment has seen one.", closed: "That is the theory’s great difficulty: its predictions sit at energies we cannot reach." },
  { n: 5, open: "In the theory, ordinary particles are the lightest notes; the rest are out of reach.", closed: "The same loop, a different note, a different particle." },
  { n: 6, open: "Like a guitar string: the same string, playing higher and higher notes.", closed: "One kind of object, a whole spectrum of particles." }
];
function StringLab() {
  const can = useRef(), [kind, setKind] = useState("open"), [n, setN] = useState(1), sref = useRef({ kind: "open", n: 1, kick: 1 });
  useEffect(() => { Object.assign(sref.current, { kind, n, kick: 1.6 }); }, [kind, n]);
  useEffect(() => {
    const c = can.current, ctx = c.getContext("2d"); let raf = 0, t = 0, vis = false, W = 1, H = 1;
    const resize = () => { const d = Math.min(devicePixelRatio || 1, 2), r = c.getBoundingClientRect(); W = r.width; H = r.height; c.width = W * d; c.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
    const frame = () => { raf = vis ? requestAnimationFrame(frame) : 0; t += reduced ? 0 : .016; const S = sref.current; S.kick += (1 - S.kick) * .03;
      ctx.clearRect(0, 0, W, H); const cx = W / 2, cy = H / 2, w = S.n, A = Math.min(H * .28, 34) * S.kick, ph = Math.cos(t * (2 + w * 1.1));
      ctx.lineCap = "round";
      const draw = (pts, col, lw) => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.stroke(); };
      if (S.kind === "open") {
        const x0 = W * .14, x1 = W * .86, pts = [];
        for (let i = 0; i <= 120; i++) { const u = i / 120; pts.push([x0 + (x1 - x0) * u, cy + A * Math.sin(Math.PI * w * u) * ph]); }
        ctx.fillStyle = "rgba(143,211,255,.12)"; ctx.fillRect(x0 - 10, cy - H * .38, 6, H * .76); ctx.fillRect(x1 + 4, cy - H * .38, 6, H * .76);
        ctx.fillStyle = "rgba(143,211,255,.7)"; ctx.font = "11px 'IBM Plex Mono', monospace"; ctx.fillText("D-brane", x0 - 22, cy + H * .45); ctx.fillText("D-brane", x1 - 18, cy + H * .45);
        draw(pts, "rgba(255,194,122,.12)", 7); draw(pts, "#ffc27a", 1.6);
        [x0, x1].forEach(x => { ctx.fillStyle = "#f1eee6"; ctx.beginPath(); ctx.arc(x, cy, 3.5, 0, 6.283); ctx.fill(); });
      } else {
        const R = Math.min(H * .3, 70), pts = [];
        for (let i = 0; i <= 160; i++) { const a = i / 160 * 6.283, r = R + A * .55 * (Math.sin(w * a - t * 2.2) * .5 + Math.sin(w * a + t * 2.2) * .5) * (w === 1 ? .6 : 1); pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * .8]); }
        draw(pts, "rgba(255,194,122,.12)", 7); draw(pts, "#ffc27a", 1.6);
      }
    };
    const io = new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis && !raf) raf = requestAnimationFrame(frame); });
    io.observe(c); resize(); addEventListener("resize", resize);
    return () => { io.disconnect(); cancelAnimationFrame(raf); removeEventListener("resize", resize); };
  }, []);
  const m = MODES[n - 1];
  return html`<div className="stringlab">
    <span className="label">String lab · one string, many notes</span>
    <canvas ref=${can} className="lab" role="img" aria-label=${`${kind === "open" ? "Open" : "Closed"} string vibrating in mode ${n}`}></canvas>
    <div className="lab-ctl">
      <div role="group" aria-label="String type">${["open", "closed"].map(k => html`<button key=${k} type="button" aria-pressed=${kind === k} onClick=${() => setKind(k)}>${k === "open" ? "Open string" : "Closed string"}</button>`)}</div>
      <div role="group" aria-label="Vibration mode">${MODES.map(x => html`<button key=${x.n} type="button" aria-pressed=${n === x.n} aria-label=${"Mode " + x.n} onClick=${() => setN(x.n)}>${x.n}</button>`)}</div>
    </div>
    <p className="lab-text">${kind === "open" ? m.open : m.closed}</p>
    <p className="lab-small">Open strings have two ends, which in string theory rest on surfaces called D-branes. Closed strings are loops. Superstring theory needs 10 dimensions (M-theory, 11), with the extra ones curled up too small to see. It remains a hypothesis: no experiment has tested it.</p>
  </div>`;
}

/* ---------- Starlight ribbons: light from the current object streaming to you.
   Each strand ripples at that object's wavelength (wave) and carries photons (particles). ---------- */
function startRibbons(canvas) {
  const ctx = canvas.getContext("2d"); let W = 1, H = 1, raf = 0, t = 0, last = 0, op = 0, opB = 0, lastSY = scrollY, vel = 0;
  const small = innerWidth < 760, NR = small ? 6 : 10, NS = small ? 4 : 6;
  const RB = [...Array(NR)].map((_, k) => ({ a: -.55 + k / (NR - 1) * 1.1, ph: Math.random() * 6.28, sp: .5 + Math.random() * .6, w: .6 + Math.random() * .8, photons: [...Array(3)].map(() => Math.random()) }));
  const resize = () => { const d = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; canvas.width = W * d; canvas.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
  const colorOf = () => { const sc = SCENES[+document.body.dataset.ch || 0], l = sc && sc.light; const w = l ? l[1] : 550;
    if (typeof w === "number") return [nmColor(w), w]; if (w === "red") return ["rgb(255,120,90)", 700]; if (w === "radio") return ["rgb(143,211,255)", 1400]; if (w === "broad") return ["rgb(190,200,255)", 380]; return ["rgb(241,238,230)", 0]; };
  function frame(now) {
    raf = requestAnimationFrame(frame); const dt = Math.min(.05, (now - (last || now)) / 1000); last = now; if (!reduced) t += dt;
    const mode = document.body.dataset.mode, want = mode === "interlude" || mode === "hero" ? 1 : 0; op += (want - op) * Math.min(1, dt * 3);
    ctx.clearRect(0, 0, W, H);
    const wantB = mode === "interlude" ? 1 : mode === "hero" ? .8 : mode === "content" ? .4 : 0; opB += (wantB - opB) * Math.min(1, dt * 3);
    const dyS = scrollY - lastSY; lastSY = scrollY; vel = vel * .9 + Math.abs(dyS) * .1;
    if (op < .01 && opB < .01) return;
    const [c0, nm] = colorOf(), cv = c0.match(/\d+/g).map(Number), mixw = [241, 238, 230], col = `rgb(${cv.map((v, k) => Math.round(v * .45 + mixw[k] * .55)).join(",")})`;
    const rgba = a => col.replace("rgb", "rgba").replace(")", `,${a.toFixed(3)})`), hero = mode === "hero";
    const sx = hero ? W * .82 : W > 1020 ? W * .68 : W * .5, sy = hero ? H * .12 : H * .5;
    ctx.globalCompositeOperation = "lighter"; ctx.lineCap = "round";
    if (opB > .01) {
      const ch = +document.body.dataset.ch || 0, n = 1 + ch % 4, NB = small ? 5 : 7, bx = hero ? W * .5 : sx, by = hero ? H * .8 : sy, slope = hero ? -.08 : -.3, boost = 1 + Math.min(2, vel * .06);
      for (let k = 0; k < NB; k++) {
        const ph = k * 1.9, spd = .5 + k * .11, A = (hero ? 12 : small ? 18 : 28) * (.5 + .5 * Math.abs(Math.sin(k * 2.3))) * boost, pts = [];
        for (let x = -W * .05; x <= W * 1.05; x += 6) { const u = x / W, env = .4 + .9 * Math.exp(-Math.pow((x - bx) / (W * .28), 2));
          pts.push([x, by + (x - bx) * slope + A * env * Math.sin(6.283 * u * (n + k % 3) + ph + t * spd)]); }
        const tint = k === 0;
        ctx.beginPath(); pts.forEach((q, j) => j ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]));
        ctx.strokeStyle = tint ? rgba(.08 * opB) : `rgba(241,238,230,${(.04 * opB).toFixed(3)})`; ctx.lineWidth = 5; ctx.stroke();
        ctx.strokeStyle = tint ? rgba(.7 * opB) : `rgba(241,238,230,${(.3 * opB).toFixed(3)})`; ctx.lineWidth = .9; ctx.stroke();
        const sh = Math.floor(t * 30 * spd + k * 11);
        for (let j = 0; j < pts.length; j += 9) { const q = pts[(j + sh) % pts.length]; ctx.fillStyle = `rgba(241,238,230,${(.55 * opB).toFixed(3)})`; ctx.fillRect(q[0] - .9, q[1] - .9, 1.8, 1.8); }
      }
    }
    if (op > .01) for (const r of RB) {
      const ex = hero ? W * (.08 + (r.a + .55) * .5) : -W * .15, ey = hero ? H * 1.08 : H * (.5 + r.a * 1.4);
      const cx = (sx + ex) / 2 + (hero ? -W * .1 : W * .05) * r.w, cy = (sy + ey) / 2 + r.a * H * .25;
      const L = Math.hypot(ex - sx, ey - sy), lam = nm ? clamp(nm / 550, .5, 2.6) * 70 : 0, amp = nm ? 5 * r.w : 0;
      for (let j = 0; j < NS; j++) {
        const off = (j - (NS - 1) / 2);
        ctx.beginPath();
        for (let k = 0; k <= 64; k++) { const u = k / 64, iu = 1 - u;
          let x = iu * iu * sx + 2 * iu * u * cx + u * u * ex, y = iu * iu * sy + 2 * iu * u * cy + u * u * ey;
          const tx = 2 * iu * (cx - sx) + 2 * u * (ex - cx), ty = 2 * iu * (cy - sy) + 2 * u * (ey - cy), tl = Math.hypot(tx, ty) || 1, nx = -ty / tl, ny = tx / tl;
          const spread = off * (1.5 + u * 9) * r.w, wv = amp * u * Math.sin(u * L / Math.max(lam, 1) * 6.283 - t * 4 * r.sp + r.ph + j * .6);
          x += nx * (spread + wv); y += ny * (spread + wv); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        const a = op * (.05 + .05 * Math.cos(off));
        ctx.strokeStyle = rgba(a * .5); ctx.lineWidth = 4; ctx.stroke();
        ctx.strokeStyle = rgba(a * 2.2); ctx.lineWidth = .9; ctx.stroke();
      }
      r.photons.forEach((p, k) => { const u = (p + t * .12 * r.sp) % 1, iu = 1 - u;
        const x = iu * iu * sx + 2 * iu * u * cx + u * u * ex, y = iu * iu * sy + 2 * iu * u * cy + u * u * ey, g = ctx.createRadialGradient(x, y, 0, x, y, 10);
        g.addColorStop(0, `rgba(255,255,255,${(.9 * op * Math.sin(u * Math.PI)).toFixed(3)})`); g.addColorStop(.3, rgba(.35 * op)); g.addColorStop(1, rgba(0)); ctx.fillStyle = g; ctx.fillRect(x - 10, y - 10, 20, 20); });
    }
    ctx.globalCompositeOperation = "source-over";
  }
  resize(); addEventListener("resize", resize); raf = requestAnimationFrame(frame);
  return () => { cancelAnimationFrame(raf); removeEventListener("resize", resize); };
}
function Ribbons() { const ref = useRef(); useEffect(() => startRibbons(ref.current), []); return html`<canvas className="ribbons" ref=${ref} aria-hidden="true"></canvas>`; }

/* ---------- app ---------- */
function App() {
  const active = useActiveSection(["home", "about", "expertise", "astronomy", "tonight", "development", "process", "light", "projects", "gallery", "notes", "contact"]);
  const [toast, setToast] = useState("");
  const [view, setView] = useState({ i: 0, beat: 0 });
  const refs = { stage: useRef(), canvas: useRef(), bloom: useRef(), bar: useRef(), hudD: useRef(), hudL: useRef(), cue: useRef() };
  const api = useRef(null);
  useEffect(() => {
    if (api.current) return;
    api.current = window.Universe.init({
      stage: refs.stage.current, canvas: refs.canvas.current, bar: refs.bar.current, cue: refs.cue.current,
      hudD: refs.hudD.current, hudL: refs.hudL.current, getP: readP, scrollToP, shift: shiftFor,
      bloom: refs.bloom.current,
      onScene: (i, beat) => { document.body.dataset.ch = i; setView(v => (v.i === i && v.beat === beat ? v : { i, beat })); }
    });
  }, []);
  return html`<a className="skip" href="#about">Skip to content</a>
    <div className="sky" ref=${refs.stage} aria-hidden="true"><canvas ref=${refs.canvas}></canvas><canvas className="bloom" ref=${refs.bloom}></canvas></div>
    <${Ribbons}/>
    <div className="scrim" aria-hidden="true"></div>
    <${Sparks}/>
    <${Nav} active=${active}/>
    <main>
      <${Hero} cueRef=${refs.cue}/>
      <${About}/>
      <${Expertise}/>
      <${Interlude} i=${2} p=${[1.6, 2.6]}/>
      <${Astronomy}/>
      <${Tonight}/>
      <${Interlude} i=${4} p=${[3.6, 4.6]}/>
      <${Development}/>
      <${Process}/>
      <${Interlude} i=${6} p=${[5.6, 6.6]}/>
      <${LightSection}/>
      <${Projects}/>
      <${Interlude} i=${8} p=${[7.6, 8.6]}/>
      <${Gallery}/>
      <${SkyNotes}/>
      <${Contact} onToast=${setToast}/>
      <${Interlude} i=${11} p=${[10.3, 11]}/>
    </main>
    <footer><div className="inner"><span className="foot-mark"><${Logo}/><span>© Bhanu Prakash · Exploring the universe. Making science accessible. Building technology that inspires.</span></span><span>Hyderabad · Draft site: amber dashed tags are placeholders to confirm.</span></div></footer>
    <${HudBar} view=${view} refs=${refs} api=${api}/>
    <${Toast} msg=${toast} onDone=${() => setToast("")}/>`;
}
ReactDOM.createRoot(document.getElementById("root")).render(html`<${App}/>`);
