/* Bhanu Prakash portfolio: React components (htm templates, no build step). */
const { useState, useEffect, useRef, useCallback, useMemo } = React;
const html = htm.bind(React.createElement);
const { SCENES, ROMAN, reduced } = window.Universe;
const LASTI = SCENES.length - 1;
const smooth = reduced ? "auto" : "smooth";
const scrollToId = id => document.getElementById(id)?.scrollIntoView({ behavior: smooth });

/* ---------- content (source of truth: website brief) ---------- */
const CONTENT = {
  nav: [["home","Home"],["about","About"],["astronomy","Astronomy"],["tonight","Tonight"],["development","Development"],["projects","Projects"],["notes","Notes"]],
  hero: {
    eyebrow: "Astronomy · Education · Technology",
    title: "Exploring the Universe. Building What’s Next.",
    text: "I’m Bhanu Prakash, an astronomer and stargazing expert with an MSc in Astronomy and three years of experience bringing astronomy to schools, communities, and curious minds. I also design and develop websites, software, and applications."
  },
  bio: [
    "I am Bhanu Prakash, an astronomer with an MSc in Astronomy and three years of experience conducting stargazing sessions, astronomy outreach programs, and hands-on educational workshops. I work with schools, students, families, and the wider public to make the night sky understandable and exciting.",
    "I have been involved in organizing and delivering telescope-based night-sky observations, public stargazing experiences, astronomy awareness programs, school outreach sessions, and interactive workshops. I enjoy translating complex astronomical ideas into engaging experiences for people of different ages and backgrounds.",
    "My astronomy work includes helping participants recognize celestial objects, understand telescopes and observational techniques, explore the Moon and planets, and connect what they see in the sky to the science behind it. I am particularly interested in experiences that move beyond lectures and give participants opportunities to observe, ask questions, and learn by doing.",
    "I also develop websites, software, and applications. This technical side of my work lets me approach problems creatively and build digital tools, including science-oriented and educational experiences. My goal is to use both astronomy and technology to create accessible, meaningful learning opportunities."
  ],
  creds: [
    ["Education","MSc in Astronomy","University · year"],
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
    ["Astronomy simulations","Including the Beyond the Sky Virtual AstroLab, in development."]
  ],
  devServices: [
    ["Website Development","Design and development of websites with attention to clarity, responsiveness and usability."],
    ["Software & Application Projects","Development of, or collaboration on, applications and interactive tools, subject to project scope."]
  ],
  projects: [
    { t:"School astronomy outreach", c:["astronomy","education"], d:"Audience, topic, demonstrations and learning outcomes for a school program." },
    { t:"Public stargazing events", c:["astronomy"], d:"Venue type, the telescope experience and the objects observed on the night." },
    { t:"Astronomy workshops", c:["education","astronomy"], d:"Hands-on activities and the educational design behind them." },
    { t:"Beyond the Sky", c:["astronomy","education"], d:"Your personal role and contributions, kept distinct from the organization itself.", note:"Role to confirm" },
    { t:"Beyond the Sky Virtual AstroLab", c:["software","education","dev"], d:"Interactive astronomy simulations for learning. Currently in development." },
    { t:"Websites built", c:["web"], d:"Live links, screenshots, technologies and your exact contribution to each site." },
    { t:"Software & applications", c:["software"], d:"Features, screenshots, demos, repositories and current status for each project." }
  ],
  caseFields: ["Category","Role","Client or organization","Date","Location","Objective","Audience","Responsibilities","Tools, equipment or technology","Process","Outcomes","Live link","Permissions & credits"],
  gallery: ["Telescope session with a public group","School astronomy workshop","The Moon through the telescope","Setting up and aligning the telescope","Public astronomy evening","Hands-on workshop activity"],
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
    <ol>${sc.beats.map((b, k) => html`<li key=${k}>${b}</li>`)}</ol></aside>`;
}
function Interlude({ i, p }) {
  const sc = SCENES[i];
  return html`<section className="interlude" data-p0=${p[0]} data-p1=${p[1]} data-kind="interlude" aria-labelledby=${"ch" + i}>
    <div className="inner"><div className="il">
      <span className="label">Chapter ${ROMAN[i]} · ${fmtKm(sc.km)} from Earth</span>
      <h2 id=${"ch" + i}>${sc.name}</h2>
      <p className="coordline">${sc.coord}</p>
      <ol>${sc.beats.map((b, k) => html`<li key=${k}>${b}</li>`)}</ol>
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
      <p className="trip strings-hint">String theory says everything is made of vibrating strings. So is this page: every line is a string you can pluck with your cursor or finger.</p>
    </div></div>
    <div className="cue" ref=${cueRef} aria-hidden="true">Scroll to leave Earth<i></i></div>
  </section>`;
}

/* ---------- content sections ---------- */
function About() {
  return html`<section className="band" id="about" aria-labelledby="about-h" data-p0=".6" data-p1="1.3" data-kind="content"><div className="inner">
    <div className="about">
    <div><div className="portrait" role="img" aria-label="Placeholder for a professional portrait of Bhanu Prakash with a telescope">
      <svg viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="20" r="9" fill="none" stroke="#9aa1bb"/><path d="M10 50c3-10 10-15 18-15s15 5 18 15" fill="none" stroke="#9aa1bb"/></svg>
      Professional portrait<br/><${Ph}>Photo to add<//></div></div>
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
function Projects() {
  const [filter, setFilter] = useState("all");
  const dlg = useDialog();
  const counts = useMemo(() => Object.fromEntries(Object.keys(TAGS).map(k => [k, k === "all" ? CONTENT.projects.length : CONTENT.projects.filter(p => p.c.includes(k)).length])), []);
  const shown = CONTENT.projects.filter(p => filter === "all" || p.c.includes(filter));
  const p = dlg.data;
  return html`<${Section} id="projects" p=${[6.6, 7.6]} chapter=${7} label="Projects" title="Selected work"
    lede="Case studies will be added here with role, audience, process, outcomes and photographs. The cards below are templates until each project is confirmed.">
    <div className="filters" role="group" aria-label="Filter projects">
      ${Object.entries(TAGS).map(([k, n]) => html`<button key=${k} type="button" aria-pressed=${filter === k} onClick=${e => { setFilter(k); burstAt(e.currentTarget, { n: 16, speed: 3 }); }}>${n} <span className="count">${counts[k]}</span></button>`)}
    </div>
    <p className="sr" aria-live="polite">${shown.length} projects shown</p>
    <div className="projects">${shown.map(pr => html`<article className="card" key=${pr.t} onMouseEnter=${e => burst(e.clientX, e.clientY, { n: 12, speed: 2.4 })}>
      <div className="tags">${pr.c.map(c => html`<span key=${c} className=${c === "dev" ? "dev" : ""}>${c === "dev" ? "In development" : TAGS[c]}</span>`)}</div>
      <h3>${pr.t}</h3><p>${pr.d}</p>
      <div className="cardfoot"><${Ph}>${pr.note || "Case study to add"}<//><button className="link" type="button" onClick=${() => dlg.open(pr)}>View case study →</button></div>
    </article>`)}</div>
    <dialog ref=${dlg.ref} className="modal" aria-labelledby="cs-title">
      ${p && html`<div className="modal-in">
        <div className="modal-head"><div><span className="label">Case study template</span><h3 id="cs-title">${p.t}</h3></div>
          <button className="x" type="button" aria-label="Close" onClick=${dlg.close}>×</button></div>
        <p>${p.d}</p>
        <dl className="cs">${CONTENT.caseFields.map(f => html`<div key=${f}><dt>${f}</dt><dd><${Ph}>To add<//></dd></div>`)}</dl>
        <div className="photos">${[1, 2, 3].map(n => html`<div key=${n} className="img">Photo or screenshot</div>`)}</div>
      </div>`}
    </dialog><//>`;
}
function Gallery() {
  const dlg = useDialog();
  const n = CONTENT.gallery.length, idx = dlg.data;
  useEffect(() => {
    const k = e => { if (idx == null) return; if (e.key === "ArrowRight") dlg.setData((idx + 1) % n); if (e.key === "ArrowLeft") dlg.setData((idx - 1 + n) % n); };
    addEventListener("keydown", k); return () => removeEventListener("keydown", k);
  }, [idx]);
  return html`<${Section} id="gallery" p=${[8.6, 9.2]} chapter=${9} label="Gallery" title="From the field" lede="Real photographs of telescope sessions, workshops and events go here, shared with permission and captioned.">
    <div className="gallery">${CONTENT.gallery.map((c, i) => html`<figure key=${c}>
      <button className="img" type="button" aria-label=${"Open photo: " + c} onClick=${e => { burstAt(e.currentTarget, { n: 30, speed: 4 }); dlg.open(i); }}>Photo to add</button><figcaption>${c}</figcaption></figure>`)}</div>
    <dialog ref=${dlg.ref} className="modal lightbox" aria-label="Photo viewer">
      ${idx != null && html`<div className="modal-in">
        <div className="modal-head"><span className="label">${idx + 1} / ${n}</span><button className="x" type="button" aria-label="Close" onClick=${dlg.close}>×</button></div>
        <div className="img big">Photo to add</div>
        <div className="lb-foot"><button className="link" type="button" onClick=${() => dlg.setData((idx - 1 + n) % n)}>← Previous</button>
          <span>${CONTENT.gallery[idx]}</span><button className="link" type="button" onClick=${() => dlg.setData((idx + 1) % n)}>Next →</button></div>
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
    onToast("Thanks, " + f.name.split(" ")[0] + ". This draft form doesn’t send messages yet. Connect it to an email or form service before launch.");
    setF(empty); setTried(false);
  };
  const Field = (k, label, input, full) => html`<div className=${"field" + (full ? " full" : "")}>
    <label htmlFor=${"f-" + k}>${label}</label>${input}${errors[k] && html`<span className="err" id=${"e-" + k}>${errors[k]}</span>`}</div>`;
  const a = k => ({ id: "f-" + k, "aria-invalid": errors[k] ? "true" : undefined, "aria-describedby": errors[k] ? "e-" + k : undefined });
  return html`<section className="band" id="contact" aria-labelledby="contact-h" data-p0="9.6" data-p1="10.3" data-kind="content"><div className="inner">
    <div className="arrive"><span className="label">Chapter ${ROMAN[LASTI - 1]} · ${fmtKm(SCENES[LASTI - 1].km)} from Earth</span>
      <p>You have reached the cosmic web, where galaxies gather along filaments hundreds of millions of light-years long. Every stop so far can be seen or photographed from Earth. Keep scrolling: the journey turns around and zooms in to the smallest scale.</p></div>
    <div className="contact">
    <div>
      <span className="label">Contact</span>
      <h2 id="contact-h">Let’s bring your idea to life</h2>
      <p className="lede" style=${{ marginBottom: "32px" }}>Planning a stargazing evening, a school astronomy session, or a digital project? Send a message with a few details.</p>
      <dl>
        <div><dt>Email</dt><dd><${Ph}>Professional email to add<//></dd></div>
        <div><dt>WhatsApp & social</dt><dd><${Ph}>Optional links to add<//></dd></div>
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
      <div><button className="btn" type="submit">Send inquiry</button></div>
    </form></div></div></section>`;
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
  const dots = useRef([]), edgeEls = useRef([]), amp = useRef([0, 0, 0, 0]), hotRef = useRef(null);
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
        el.setAttribute("d", d); });
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
  { n: "Understand", obj: "Molecular cloud", d: "Who is the audience, where is the venue, and what should people leave knowing? Like a cloud of gas before a star forms, every session and project starts as questions." },
  { n: "Plan", obj: "Celestial sphere", d: "Pick what the sky will offer that night, check the Moon phase and the weather, or chart a site’s pages and features." },
  { n: "Prepare", obj: "Protoplanetary disk", d: "Set up and align the telescopes, prepare demonstrations and materials, or build and test the first working version." },
  { n: "Deliver", obj: "A star ignites", d: "First light: run the stargazing session, school program or workshop, or launch the website or application." },
  { n: "Reflect", obj: "Reflection nebula", d: "Like dust lit by nearby stars, gather questions and feedback, and see what worked and what the sky or the users taught us." },
  { n: "Grow", obj: "Spiral galaxy", d: "Turn one evening into a program, one workshop into a series, one launch into a product that keeps growing." }
];
function Spark({ k, size = 24 }) {
  const c = 12, r = 2 + k * 1.2, L = 4 + k * 1.3;
  return html`<svg className=${"spark" + (k >= 5 ? " guide" : "")} width=${size} height=${size} viewBox="0 0 24 24" aria-hidden="true">
    <circle cx=${c} cy=${c} r="11" className="spark-ring"/>
    <path d=${`M${c} ${c - L}Q${c} ${c} ${c + L} ${c}Q${c} ${c} ${c} ${c + L}Q${c} ${c} ${c - L} ${c}Q${c} ${c} ${c} ${c - L}Z`} className="spark-ray"/>
    <circle cx=${c} cy=${c} r=${r * .45} className="spark-core"/></svg>`;
}
function buildProcessObjects() {
  const R = Math.random, G = () => { let u = 0; while (!u) u = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.283 * R()); }, O = [];
  const ring = (S, r, n, a, fn) => { let pv = null; for (let i = 0; i <= n; i++) { const t = i / n * 6.283, p = fn(t, r); if (pv) S.push([...pv, ...p, a]); pv = p; } };
  // 0 Understand: a molecular cloud with filaments, gathering toward a dense core
  { const pts = []; for (let i = 0; i < 1300; i++) { const f = i % 5, a = f * 1.26 + G() * .12, r = Math.pow(R(), .7) * 1.7, tw = r * 1.4;
      pts.push([Math.cos(a + tw) * r + G() * .08, G() * .18 * (1 - r / 2), Math.sin(a + tw) * r * .7 + G() * .08, .2 + R() * .5, i % 9 ? 0 : 2]); }
    for (let i = 0; i < 160; i++) pts.push([G() * .12, G() * .1, G() * .12, .7 + R() * .3, 0]);
    O.push({ segs: [], pts, pitch: .75, spin: .08 }); }
  // 1 Plan: the celestial sphere, with lines of right ascension and declination and a constellation charted on it
  { const S = [], r = 1.25;
    for (const d of [-60, -30, 0, 30, 60]) { const dr = d * Math.PI / 180; ring(S, r, 56, d ? .22 : .5, t => [Math.cos(t) * Math.cos(dr) * r, Math.sin(dr) * r, Math.sin(t) * Math.cos(dr) * r]); }
    for (let k = 0; k < 6; k++) { const a = k * Math.PI / 6; let pv = null; for (let i = 0; i <= 40; i++) { const t = i / 40 * Math.PI - Math.PI / 2, p = [Math.cos(t) * Math.cos(a) * r, Math.sin(t) * r, Math.cos(t) * Math.sin(a) * r]; if (pv) S.push([...pv, ...p, .18]); pv = p; } }
    const sph = (ra, dec) => [Math.cos(dec) * Math.cos(ra) * r, Math.sin(dec) * r, Math.cos(dec) * Math.sin(ra) * r];
    const cs = [[.2, .55], [.45, .4], [.68, .45], [.85, .2], [1.12, .33]].map(([a, d]) => sph(a, d));
    for (let i = 0; i < 4; i++) S.push([...cs[i], ...cs[i + 1], .95]);
    O.push({ segs: S, pts: cs.map((p, i) => [...p, i === 2 ? 2.2 : 1.6, i === 2 ? 1 : 0]), pitch: .35, spin: .12 }); }
  // 2 Prepare: a protoplanetary disk with gaps where planets are clearing their orbits
  { const pts = []; for (let i = 0; i < 1500; i++) { let r; do { r = .25 + Math.pow(R(), .8) * 1.45; } while ((r > .62 && r < .72) || (r > 1.08 && r < 1.16));
      const a = R() * 6.283; pts.push([Math.cos(a) * r, G() * .015 * (1 + r), Math.sin(a) * r, .25 + R() * .45, r < .5 ? 1 : 0]); }
    for (const [r, a] of [[.67, 1.1], [1.12, 3.9]]) pts.push([Math.cos(a) * r, 0, Math.sin(a) * r, 2.2, 2]);
    pts.push([0, 0, 0, 3, 1]);
    O.push({ segs: [], pts, pitch: .42, spin: .25 }); }
  // 3 Deliver: a star ignites, with flaring loops and a corona
  { const S = [], pts = []; for (let i = 0; i < 900; i++) { const u = R() * 2 - 1, a = R() * 6.283, s = Math.sqrt(1 - u * u), r = .62; pts.push([s * Math.cos(a) * r, u * r, s * Math.sin(a) * r, .45 + R() * .5, 1]); }
    for (let i = 0; i < 420; i++) { const u = R() * 2 - 1, a = R() * 6.283, s = Math.sqrt(1 - u * u), r = .66 + Math.pow(R(), 2.5) * .9; pts.push([s * Math.cos(a) * r, u * r, s * Math.sin(a) * r, .2 + R() * .3, 0]); }
    for (let k = 0; k < 22; k++) { const u = R() * 2 - 1, a = R() * 6.283, sq = Math.sqrt(1 - u * u), d = [sq * Math.cos(a), u, sq * Math.sin(a)], L = .64 + .15 + R() * .55;
      S.push([d[0] * .64, d[1] * .64, d[2] * .64, d[0] * L, d[1] * L, d[2] * L, .25 + R() * .35]); }
    pts.push([0, 0, 0, 4, 1]);
    O.push({ segs: S, pts, pitch: .2, spin: .1 }); }
  // 4 Reflect: a young cluster lighting the dust around it, like the Pleiades
  { const pts = [], stars = [[-.6, .35, .1], [-.2, .55, -.2], [.25, .4, .15], [.55, .1, -.1], [.05, .05, .3], [-.45, -.15, -.25], [.35, -.35, .05]];
    stars.forEach(([x, y, z], i) => pts.push([x, y, z, i < 3 ? 2.6 : 1.9, 2]));
    for (let i = 0; i < 1100; i++) { const s = stars[i % stars.length], r = Math.pow(R(), 1.5) * .55; const a = R() * 6.283;
      pts.push([s[0] + Math.cos(a) * r + G() * .05, s[1] + G() * .16 + Math.sin(a) * r * .3, s[2] + Math.sin(a) * r * .5, .12 + R() * .3, 2]); }
    O.push({ segs: [], pts, pitch: .1, spin: .06 }); }
  // 5 Grow: a spiral galaxy, arms reaching outward
  { const pts = []; for (let i = 0; i < 1600; i++) { const bulge = i < 280; if (bulge) { pts.push([G() * .16, G() * .08, G() * .16, .5 + R() * .5, 1]); continue; }
      const r = .18 + Math.pow(R(), .85) * 1.55, a = (i % 2) * Math.PI + Math.log(r / .18) * 2.2 + G() * .28;
      pts.push([Math.cos(a) * r, G() * .025, Math.sin(a) * r, .25 + R() * .5, R() < .07 ? 3 : (r > 1 ? 2 : 0)]); }
    O.push({ segs: [], pts, pitch: .95, spin: .2 }); }
  return O;
}
const PCOL = ["241,238,230", "255,194,122", "168,199,255", "242,71,127"];
function startProcess(canvas, section, onStage) {
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
  const F = () => Math.min(H * 1.05, W * .9);
  function proj(x, y, z, camX) { const zc = 9 - z; if (zc < .3) return null; const k = F() / zc; return [W / 2 + (x - camX) * k, H * .56 - y * k, k]; }
  function frame(now) {
    raf = visible ? requestAnimationFrame(frame) : 0;
    const dt = clamp((now - last) / 1000, 0, .05); last = now; if (!reduced) t += dt;
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
    { const x0 = -3, x1 = SP * (N - 1) + 3, Lx = x1 - x0, nh = 1 + f, A = reduced ? 0 : .16, pts = [];
      for (let x = Math.max(x0, camX - 15); x <= Math.min(x1, camX + 15); x += .06) { const u = (x - x0) / Lx;
        const y = A * Math.sin(Math.PI * u * Math.round(nh * 2)) * Math.cos(t * (2 + nh)) + A * .4 * Math.sin(Math.PI * u * (Math.round(nh * 2) + 1)) * Math.sin(t * (3 + nh));
        const p = proj(x, y - .02, 0, camX); if (p) pts.push(p); }
      if (pts.length > 1) { ctx.beginPath(); pts.forEach((p, k) => k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
        ctx.strokeStyle = "rgba(255,194,122,.08)"; ctx.lineWidth = 6; ctx.stroke(); ctx.strokeStyle = "rgba(255,214,160,.6)"; ctx.lineWidth = 1.1; ctx.stroke(); } }
    objs.forEach((o, i) => {
      const w = Math.max(0, 1 - Math.abs(f - i)), sc = .8 + .5 * w, br = .25 + .75 * w, cx = i * SP;
      if (Math.abs(cx - camX) > 17) return;
      const yaw = t * (o.spin || .15) + (i === st ? drag.yaw : 0), pitch = (o.pitch || 0) + (i === st ? drag.pitch : 0);
      const cyw = Math.cos(yaw), syw = Math.sin(yaw), cp = Math.cos(pitch), spp = Math.sin(pitch);
      const tf = (x, y, z) => { const X = x * cyw + z * syw, Z = -x * syw + z * cyw; const Y2 = y * cp - Z * spp, Z2 = y * spp + Z * cp; return proj(cx + X * sc, Y2 * sc, Z2 * sc, camX); };
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
  useEffect(() => startProcess(can.current, sec.current, setStage), []);
  useEffect(() => { pluckEl(strRef.current, (stage + .5) / STAGES.length, 10); }, [stage]);
  const go = i => { const s = sec.current, top = s.getBoundingClientRect().top + scrollY, span = s.offsetHeight - innerHeight; scrollTo({ top: top + span * i / (STAGES.length - 1) + 2, behavior: smooth }); };
  const N = STAGES.length, S = STAGES[stage];
  return html`<section className="process" id="process" ref=${sec} data-p0="5.2" data-p1="5.6" data-kind="process" aria-labelledby="proc-h">
    <div className="proc-stick">
      <canvas ref=${can} className="proc-canvas" aria-label=${"Interactive model: " + S.obj + ". Drag to rotate."}></canvas>
      <div className="proc-head"><span className="label">Process · the life of a star, on one string</span><h2 id="proc-h">From the first question to a full sky</h2></div>
      <ol className="phases"><li className="phase-string" aria-hidden="true" data-string="" data-tone="amber" ref=${strRef}></li>${STAGES.map((s, i) => html`<li key=${i} className=${i === stage ? "on" : i < stage ? "past" : ""}>
        <button type="button" onClick=${() => go(i)} aria-current=${i === stage ? "step" : undefined} aria-label=${`Stage ${i + 1}: ${s.n}`}>
          <span className="ph-l"><span className="ph-n">${String(i + 1).padStart(2, "0")}</span> ${s.n}</span><span className="mb"><${Spark} k=${i} size=${i === stage ? 56 : 30}/></span>
        </button></li>`)}</ol>
      <div className="proc-foot">
        <div className="proc-now" aria-live="polite">
          <span className="proc-count"><${Spark} k=${stage} size=${16}/> ${String(stage + 1).padStart(2, "0")} / ${String(N).padStart(2, "0")} · ${S.obj}</span>
          <h3>${S.n}</h3><p>${S.d}</p>
        </div>
        <div className="proc-nav"><span>Drag to rotate, choose a stage to travel to it</span>
          <div>${STAGES.map((s, i) => html`<button key=${i} type="button" aria-pressed=${i === stage} onClick=${() => go(i)}>${String(i + 1).padStart(2, "0")}</button>`)}</div></div>
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

/* ---------- app ---------- */
function App() {
  const active = useActiveSection(["home", "about", "expertise", "astronomy", "tonight", "development", "process", "projects", "gallery", "notes", "contact"]);
  const [toast, setToast] = useState("");
  const [view, setView] = useState({ i: 0, beat: 0 });
  const refs = { stage: useRef(), canvas: useRef(), bar: useRef(), hudD: useRef(), hudL: useRef(), cue: useRef() };
  const api = useRef(null);
  useEffect(() => {
    if (api.current) return;
    api.current = window.Universe.init({
      stage: refs.stage.current, canvas: refs.canvas.current, bar: refs.bar.current, cue: refs.cue.current,
      hudD: refs.hudD.current, hudL: refs.hudL.current, getP: readP, scrollToP, shift: shiftFor,
      onScene: (i, beat) => setView(v => (v.i === i && v.beat === beat ? v : { i, beat }))
    });
  }, []);
  return html`<a className="skip" href="#about">Skip to content</a>
    <div className="sky" ref=${refs.stage} aria-hidden="true"><canvas ref=${refs.canvas}></canvas></div>
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
