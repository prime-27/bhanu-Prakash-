/* Star trails: stars circling the celestial pole with fading trails and twinkling diffraction spikes.
   From stargazinghyderabad.com by Bhanu Prakash. No dependencies: plain WebGL.

   Use:
     <canvas id="sky" style="position:fixed;inset:0;width:100%;height:100%"></canvas>
     <script src="star-trails.js"></script>
     <script>StarTrails(document.getElementById("sky"));</script>

   Options (all optional):
     speed      0.12   turns of the sky per minute (0 = still)
     scroll     false  true: the sky turns as the page scrolls instead of with time
     trail      0.75   trail length, 0 (none) to 1 (very long)
     stars      9000   number of stars (halved automatically on small or slow devices)
     pole       [0.25, 0.18]  where the pole star sits, as a fraction of width and height from the top left
     milkyWay   true   draw a faint band of the Milky Way
     horizon    true   draw a dark hillside along the bottom that hides stars below it
     background "#04050a"
   Returns { stop(), setSpeed(n), set(option, value) }. */
(function (root) {
  "use strict";
  function StarTrails(canvas, o) {
    o = Object.assign({ speed: .12, scroll: false, trail: .75, stars: 9000, pole: [.25, .18], milkyWay: true, horizon: true, background: "#04050a" }, o || {});
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, preserveDrawingBuffer: true });
    if (!gl) { canvas.style.background = o.background; return { stop() {}, setSpeed() {} }; }
    const small = innerWidth < 700 || (navigator.hardwareConcurrency || 8) < 4, N = Math.round(o.stars * (small ? .5 : 1));

    /* seeded random so the sky is the same on every visit */
    let seed = 20261113;
    const R = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const gauss = () => { let u = 0; while (!u) u = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.2832 * R()); };
    const tint = b => { const t = R(), c = t < .22 ? [.66, .78, 1] : t < .62 ? [1, 1, 1] : t < .86 ? [1, .9, .72] : [1, .72, .52]; return c.map(x => x * b); };

    /* each star: angle and distance from the pole (sky units, 1 = screen height), colour, size */
    const P = new Float32Array(N * 4), C = new Float32Array(N * 4); let i = 0;
    const put = (a, r, c, s, k) => { P[i * 4] = a; P[i * 4 + 1] = r; P[i * 4 + 2] = R(); P[i * 4 + 3] = k; C[i * 4] = c[0]; C[i * 4 + 1] = c[1]; C[i * 4 + 2] = c[2]; C[i * 4 + 3] = s; i++; };
    put(0, 0, [1, 1, .95], 6.5, 0);                                    /* Polaris */
    if (o.milkyWay) for (let j = 0, n = N * .3 | 0; j < n; j++) {      /* a band across the sky, offset from the pole */
      const t = -1.6 + R() * 3.2, off = gauss() * .1 * (1 + .5 * Math.sin(t * 2.1)), x = t * .9 - off * .35 + .2, y = .55 - t * .32 + off;
      const b = .15 + R() * .3, c = R() < .55 ? [.72, .8, 1] : [1, .86, .72];
      put(Math.atan2(y, x), Math.hypot(x, y), c.map(v => v * b), 1 + R() * 1.4, 0);
    }
    while (i < N) { const m = Math.pow(R(), 4); put(R() * 6.2832, 2.6 * Math.sqrt(R()), tint(.16 + m * 1.05), 1 + m * 4.2, 0); }

    const VS = `precision highp float;attribute vec4 aP,aC;uniform float uSpin,uTime,uAsp,uPx,uMotion,uHorizon;uniform vec2 uPole;varying vec3 vC;varying float vB;
      float hz(float x){return -.82+.07*sin(x*3.1)+.035*sin(x*7.7+1.);}
      void main(){float a=aP.x+uSpin;vec2 p=uPole+vec2(cos(a)*aP.y/uAsp,sin(a)*aP.y)*vec2(1.,1.);
        gl_Position=vec4(p,0.,1.);
        float tw=1.+.28*sin(uTime*(1.5+aP.z*4.)+aP.z*60.)*uMotion,size=aC.w*tw;
        vB=smoothstep(2.4,5.2,size);gl_PointSize=clamp(size*uPx*(1.+vB*3.),1.,90.);
        float vis=uHorizon>.5?step(hz(p.x),p.y-.01):1.;vC=aC.rgb*vis;}`;
    const FS = `precision mediump float;varying vec3 vC;varying float vB;
      void main(){vec2 q=gl_PointCoord-.5;float r=length(q),s=1.+vB*3.;float core=smoothstep(.5,0.,r*s);core*=core;
        float halo=exp(-r*10.)*.45*vB,spikes=(exp(-abs(q.x)*130.)*exp(-abs(q.y)*6.5)+exp(-abs(q.y)*130.)*exp(-abs(q.x)*6.5))*vB;
        gl_FragColor=vec4(vC*(core*1.3+halo)+mix(vC,vec3(1.),.5)*spikes*.9,1.);}`;
    const QVS = `attribute vec2 p;varying vec2 v;void main(){v=p;gl_Position=vec4(p,0.,1.);}`;
    const QFS = `precision mediump float;uniform vec4 uC;void main(){gl_FragColor=uC;}`;
    const HFS = `precision mediump float;varying vec2 v;uniform vec3 uBg;
      float hz(float x){return -.82+.07*sin(x*3.1)+.035*sin(x*7.7+1.);}
      void main(){float h=hz(v.x);if(v.y>h)discard;float edge=smoothstep(.012,0.,h-v.y);gl_FragColor=vec4(mix(uBg,vec3(.09,.11,.19),edge*.6),1.);}`;
    const sh = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x)); return x; };
    const prog = (v, f) => { const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, v)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, f)); gl.linkProgram(p); return p; };
    const sp = prog(VS, FS), qp = prog(QVS, QFS), hp = prog(QVS, HFS);
    const buf = d => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, d, gl.STATIC_DRAW); return b; };
    const bP = buf(P), bC = buf(C), quad = buf(new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]));
    const U = n => gl.getUniformLocation(sp, n), uSpin = U("uSpin"), uTime = U("uTime"), uAsp = U("uAsp"), uPx = U("uPx"), uMotion = U("uMotion"), uHorizon = U("uHorizon"), uPole = U("uPole");
    const bg = (o.background.match(/[0-9a-f]{2}/gi) || ["04", "05", "0a"]).map(h => parseInt(h, 16) / 255);

    let W = 1, H = 1, raf = 0, last = 0, time = 0, spin = 0, speed = o.speed, visible = true;
    const resize = () => { const d = Math.min(devicePixelRatio || 1, 1.75), r = canvas.getBoundingClientRect(); W = Math.max(1, r.width * d | 0); H = Math.max(1, r.height * d | 0); canvas.width = W; canvas.height = H; gl.viewport(0, 0, W, H); gl.clearColor(bg[0], bg[1], bg[2], 1); gl.clear(gl.COLOR_BUFFER_BIT); };
    const drawQuad = (p, loc) => { gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); gl.disableVertexAttribArray(loc); };
    function frame(now) {
      raf = 0; const dt = Math.min(.05, (now - (last || now)) / 1000); last = now; if (!reduced) time += dt;
      if (o.scroll) spin = (scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)) * 6.2832 * .45;
      else if (!reduced) spin += speed * 6.2832 / 60 * dt;
      /* fade the previous frame a little instead of clearing it: that leaves the trails */
      const fade = reduced ? 1 : .5 * Math.pow(.012, Math.min(1, Math.max(0, o.trail)));
      gl.enable(gl.BLEND); gl.useProgram(qp); const ql = gl.getAttribLocation(qp, "p");
      gl.blendEquation(gl.FUNC_ADD); gl.blendFunc(gl.ZERO, gl.ONE_MINUS_SRC_ALPHA); gl.uniform4f(gl.getUniformLocation(qp, "uC"), 0, 0, 0, fade); drawQuad(qp, ql);
      gl.blendEquation(gl.FUNC_REVERSE_SUBTRACT); gl.blendFunc(gl.ONE, gl.ONE); gl.uniform4f(gl.getUniformLocation(qp, "uC"), 2 / 255, 2 / 255, 2 / 255, 0); drawQuad(qp, ql);
      gl.blendEquation(gl.FUNC_ADD); gl.blendFunc(gl.ONE, gl.ONE); gl.useProgram(sp);
      const lp = gl.getAttribLocation(sp, "aP"), lc = gl.getAttribLocation(sp, "aC");
      gl.bindBuffer(gl.ARRAY_BUFFER, bP); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 4, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, bC); gl.enableVertexAttribArray(lc); gl.vertexAttribPointer(lc, 4, gl.FLOAT, false, 0, 0);
      gl.uniform1f(uSpin, spin); gl.uniform1f(uTime, time); gl.uniform1f(uAsp, W / H); gl.uniform1f(uPx, H / 760); gl.uniform1f(uMotion, reduced ? 0 : 1);
      gl.uniform1f(uHorizon, o.horizon ? 1 : 0); gl.uniform2f(uPole, o.pole[0] * 2 - 1, 1 - o.pole[1] * 2);
      gl.drawArrays(gl.POINTS, 0, N); gl.disableVertexAttribArray(lp); gl.disableVertexAttribArray(lc);
      if (o.horizon) { gl.disable(gl.BLEND); gl.useProgram(hp); gl.uniform3f(gl.getUniformLocation(hp, "uBg"), bg[0], bg[1], bg[2]); drawQuad(hp, gl.getAttribLocation(hp, "p")); }
      if (visible && !document.hidden) raf = requestAnimationFrame(frame);
    }
    const kick = () => { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } };
    const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) kick(); }); io.observe(canvas);
    const onVis = () => { if (!document.hidden) kick(); }; document.addEventListener("visibilitychange", onVis);
    const ro = new ResizeObserver(() => { resize(); kick(); }); ro.observe(canvas);
    resize(); kick();
    return {
      setSpeed(n) { speed = n; kick(); },
      set(k, v) { o[k] = v; if (k === "speed") speed = v; kick(); },
      stop() { cancelAnimationFrame(raf); raf = 0; visible = false; io.disconnect(); ro.disconnect(); document.removeEventListener("visibilitychange", onVis); }
    };
  }
  root.StarTrails = StarTrails;
})(window);
