/* Moní — showreel v2. One paused GSAP timeline, 24 s @ 60 fps, locked to the synthesized score
   (128 BPM; window.SCORE from assets/data/audio-env.js). Every writer below is a pure function of
   timeline time so frames can be rendered in any order. English only. */
(function () {
  const SC = window.SCORE, L = window.MONI_LOGO;
  const BEAT = SC.beat, BAR = SC.bar, FPS = SC.fps;
  const bt = function (bar, beat) { return (bar - 1) * BAR + (beat || 0) * BEAT; };
  const $ = function (s, r) { return (r || document).querySelector(s); };
  const $$ = function (s, r) { return Array.from((r || document).querySelectorAll(s)); };
  const clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  const tl = gsap.timeline({ paused: true });

  function el(tag, cls, html, parent) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    if (parent) parent.appendChild(e);
    return e;
  }
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function splitChars(node) {
    const out = [];
    const walk = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null);
    const texts = []; while (walk.nextNode()) texts.push(walk.currentNode);
    texts.forEach(function (tn) {
      const f = document.createDocumentFragment();
      Array.from(tn.nodeValue).forEach(function (c) { const s = el('span', 'ch', null); s.textContent = c; f.appendChild(s); out.push(s); });
      tn.parentNode.replaceChild(f, tn);
    });
    return out;
  }
  function splitWords(node) {
    const out = [];
    const walk = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null);
    const texts = []; while (walk.nextNode()) texts.push(walk.currentNode);
    texts.forEach(function (tn) {
      const f = document.createDocumentFragment();
      tn.nodeValue.split(/(\s+)/).forEach(function (p) {
        if (!p) return;
        if (/^\s+$/.test(p)) { f.appendChild(document.createTextNode(p)); return; }
        const s = el('span', 'w', null); s.textContent = p; f.appendChild(s); out.push(s);
      });
      tn.parentNode.replaceChild(f, tn);
    });
    return out;
  }
  /* variable-font axis tween (wdth / wght), seek-safe */
  function vf(els, from, to, t, dur, ease, stagger) {
    els = [].concat(els);
    els.forEach(function (e, i) {
      const st = Object.assign({}, from);
      const write = function () { e.style.fontVariationSettings = "'opsz' 144, 'wdth' " + st.w.toFixed(1) + ", 'wght' " + st.g.toFixed(0); };
      write();
      tl.to(st, { w: to.w, g: to.g, duration: dur, ease: ease || 'expo.out', onUpdate: write }, t + (stagger || 0) * i);
    });
  }
  function typeText(node, text, t, dur) {
    const st = { n: 0 };
    node.textContent = '';
    tl.to(st, { n: text.length, duration: dur, ease: 'none', onUpdate: function () { node.textContent = text.slice(0, Math.round(st.n)); } }, t);
  }
  function setAt(t, fnOn, fnOff) {
    const st = { v: 0 };
    tl.to(st, { v: 1, duration: 0.001, ease: 'none', onUpdate: function () { (st.v > 0.5 ? fnOn : fnOff)(); } }, t);
  }
  function measure(node, space) {
    let p = node; const scenes = [];
    while (p && p !== document.body) { if (p.classList && p.classList.contains('scene')) scenes.push(p); p = p.parentElement; }
    const saved = scenes.map(function (s) { return [s, s.getAttribute('style')]; });
    scenes.forEach(function (s) { s.style.display = 'block'; s.style.visibility = 'visible'; });
    const r = node.getBoundingClientRect(), a = space.getBoundingClientRect();
    saved.forEach(function (q) { if (q[1] == null) q[0].removeAttribute('style'); else q[0].setAttribute('style', q[1]); });
    return { x: r.left - a.left, y: r.top - a.top, w: r.width, h: r.height, cx: r.left - a.left + r.width / 2, cy: r.top - a.top + r.height / 2, r: r.right - a.left, b: r.bottom - a.top };
  }

  /* ---------- logo ---------- */
  function helixPoint(u) {   // centre-line of the gold swirl, logo units (viewBox 320x145)
    const th = u * 3.7 * Math.PI * 2;
    const rx = 19 + 3 * Math.sin(u * Math.PI);
    return [291 + rx * Math.cos(th + 0.6), 11 + 41 * u + 5.2 * Math.sin(th + 0.6)];
  }
  function helixPath() {
    const pts = []; for (let i = 0; i <= 160; i++) pts.push(helixPoint(i / 160));
    return 'M' + pts.map(function (p) { return p[0].toFixed(2) + ',' + p[1].toFixed(2); }).join('L');
  }
  function logo(parent, id, x, y, w) {
    const box = el('div', 'logo-svg', null, parent);
    box.style.left = x + 'px'; box.style.top = y + 'px'; box.style.width = w + 'px'; box.style.height = (w * 145 / 320) + 'px';
    const p = L.paths;
    box.innerHTML = '<svg viewBox="0 0 320 145"><defs><mask id="' + id + 'm" maskUnits="userSpaceOnUse" x="240" y="-10" width="100" height="80">' +
      '<path class="sw-draw" d="' + helixPath() + '" fill="none" stroke="#fff" stroke-width="15" stroke-linecap="round"/></mask></defs>' +
      '<path class="lg lg-m" fill="' + L.navy + '" d="' + p.m + '"/><path class="lg lg-o" fill="' + L.navy + '" d="' + p.o + '"/>' +
      '<path class="lg lg-n" fill="' + L.gold + '" d="' + p.n + '"/><path class="lg lg-i" fill="' + L.navy + '" d="' + p.i + '"/>' +
      '<g mask="url(#' + id + 'm)"><path class="lg-sw" fill="' + L.gold + '" d="' + p.swirl + '"/></g></svg>';
    $$('.lg', box).forEach(function (g) { g.style.transformBox = 'fill-box'; g.style.transformOrigin = '50% 50%'; });
    return { box: box, letters: $$('.lg', box), o: $('.lg-o', box), m: $('.lg-m', box), n: $('.lg-n', box), i: $('.lg-i', box),
      swirl: $('.lg-sw', box), draw: $('.sw-draw', box), k: w / 320, x: x, y: y };
  }
  function drawSwirl(lg, t, dur) {
    const len = lg.draw.getTotalLength();
    lg.draw.style.strokeDasharray = len;
    tl.fromTo(lg.draw, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: dur, ease: 'power2.inOut' }, t);
  }

  /* ---------- canvas FX (all particle systems are pure functions of time) ---------- */
  const fx = $('#fx'), g = fx.getContext('2d');
  const R = rng(42);
  const dust = Array.from({ length: 110 }, function () { return { x: R() * 1920, y: R() * 1080, vx: (R() - .5) * 18, vy: -6 - R() * 16, s: .8 + R() * 2.2, a: .12 + R() * .3, ph: R() * 6.28 }; });
  const sparksA = Array.from({ length: 70 }, function (_, i) { return { u: i / 70, ang: R() * 6.28, sp: 40 + R() * 160, life: .45 + R() * .5, s: 1 + R() * 2.2 }; });
  const spiral = Array.from({ length: 380 }, function () { return { th: R() * 6.28, r0: 280 + R() * 900, w: 1.2 + R() * 2.2, d: R() * .45, s: .8 + R() * 2.2, c: R() < .8 }; });
  const burst = Array.from({ length: 460 }, function () { const a = R() * 6.28, v = 500 + Math.pow(R(), .6) * 2100; return { vx: Math.cos(a) * v, vy: Math.sin(a) * v * .8, k: 2.2 + R() * 2.5, life: 1.1 + R() * 2.2, s: 1.2 + R() * 3.6, c: R() < .72 }; });
  let swirlA = null, swirlB = null;       // logo transforms for the spark emitters (filled by scenes)
  function frameIdx(t) { return clamp(Math.round(t * FPS), 0, SC.rms.length - 1); }
  function ring(x, y, rad, alpha, w, col) { if (alpha <= 0) return; g.globalAlpha = alpha; g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.arc(x, y, rad, 0, 6.2832); g.stroke(); }
  function sparks(lgm, t0, dur, t) {
    if (!lgm || t < t0 || t > t0 + dur + 1.2) return;
    sparksA.forEach(function (p) {
      const ts = t0 + p.u * dur, age = t - ts;
      if (age < 0 || age > p.life) return;
      const hp = helixPoint(p.u);
      const x = lgm.x + hp[0] * lgm.k + Math.cos(p.ang) * p.sp * age, y = lgm.y + hp[1] * lgm.k + Math.sin(p.ang) * p.sp * age + 60 * age * age;
      g.globalAlpha = (1 - age / p.life) * .9; g.fillStyle = '#e8c078';
      g.beginPath(); g.arc(x, y, p.s * (1 - age / p.life * .5), 0, 6.2832); g.fill();
    });
  }
  function drawFX(t) {
    g.clearRect(0, 0, 1920, 1080);
    const f = frameIdx(t), low = SC.low[f];
    // 1 · dust motes in the cold open, breathing with the low end
    if (t < 3.8) {
      dust.forEach(function (d) {
        const x = (d.x + d.vx * t + 1920) % 1920, y = (d.y + d.vy * t + 1080) % 1080;
        g.globalAlpha = d.a * (0.6 + 0.8 * low) * clamp((3.75 - t) / .1, 0, 1); g.fillStyle = '#e8c078';
        g.beginPath(); g.arc(x, y, d.s, 0, 6.2832); g.fill();
      });
    }
    // 2 · shockwave on the drops
    [[3.75, 960, 540], [20.625, 960, 470]].forEach(function (s) {
      const u = (t - s[0]) / 0.7; if (u < 0 || u > 1) return;
      const e = 1 - Math.pow(1 - u, 3);
      ring(s[1], s[2], 40 + 1500 * e, (1 - u) * .9, 6 * (1 - u) + 1, '#c18d48');
      ring(s[1], s[2], 20 + 1100 * e, (1 - u) * .45, 2, '#e8c078');
    });
    // 3 · swirl sparks while the logo's swirl draws
    sparks(swirlA, 3.95, 0.6, t);
    sparks(swirlB, 20.8, 0.62, t);
    // 4 · breakdown: particles spiral into the dot, faster as the riser climbs
    if (t > 18.75 && t < 20.66) {
      const cx = 960, cy = 470;
      spiral.forEach(function (p) {
        const u = clamp((Math.min(t, 20.53) - 18.75 - p.d) / (1.78 - p.d), 0, 1);
        if (u <= 0) return;
        const e = Math.pow(u, 2.4), r = p.r0 * (1 - e), th = p.th + p.w * (u * 2.4 + e * 6);
        const e2 = Math.pow(Math.max(0, u - .03), 2.4), r2 = p.r0 * (1 - e2), th2 = p.th + p.w * ((u - .03) * 2.4 + e2 * 6);
        g.globalAlpha = Math.min(1, u * 3) * (r < 14 ? r / 14 : 1) * .85;
        g.strokeStyle = p.c ? '#e8c078' : '#f3efe6'; g.lineWidth = p.s;
        g.beginPath(); g.moveTo(cx + Math.cos(th2) * r2, cy + Math.sin(th2) * r2 * .62); g.lineTo(cx + Math.cos(th) * r, cy + Math.sin(th) * r * .62); g.stroke();
      });
    }
    // 5 · finale burst: drag + a little gravity, then the dust floats
    if (t >= 20.625) {
      const age0 = t - 20.625;
      burst.forEach(function (p) {
        if (age0 > p.life) return;
        const dr = (1 - Math.exp(-p.k * age0)) / p.k;
        const x = 960 + p.vx * dr, y = 470 + p.vy * dr + 40 * age0 * age0;
        g.globalAlpha = Math.pow(1 - age0 / p.life, 1.4) * .95; g.fillStyle = p.c ? '#c18d48' : '#222437';
        g.beginPath(); g.arc(x, y, p.s * (1 - .4 * age0 / p.life), 0, 6.2832); g.fill();
      });
    }
    g.globalAlpha = 1;
  }

  /* ---------- camera shake from the kick envelope ---------- */
  const stage = $('#stage');
  function shakeAt(t) {
    const f = frameIdx(t), low = SC.low[f];
    let amp = 0;
    if (t >= 3.75 && t < 18.75) amp = 3.2 * low * low;
    [[3.75, 16], [7.5, 7], [20.625, 20]].forEach(function (h) { const u = t - h[0]; if (u >= 0 && u < .45) amp += h[1] * Math.exp(-u / .09); });
    const x = Math.sin(t * 91.7) * .6 + Math.sin(t * 57.3 + 1.3) * .4, y = Math.cos(t * 83.1) * .6 + Math.sin(t * 41.9 + .7) * .4;
    stage.style.transform = 'translate(' + (x * amp).toFixed(2) + 'px,' + (y * amp).toFixed(2) + 'px)';
  }

  /* ---------- HUD ---------- */
  const hud = $('#hud');
  function hudAt(t) {
    const tot = Math.round(t * FPS), ss = Math.floor(tot / FPS), ff = tot % FPS;
    $('#hudTC').textContent = '00:' + String(ss).padStart(2, '0') + ':' + String(ff).padStart(2, '0');
    $('#hudP').style.transform = 'scaleX(' + (t / 24).toFixed(4) + ')';
  }
  function hudSection(t, n, s) {
    setAt(t, function () { $('#hudN').textContent = n; $('#hudS').textContent = s; }, function () {});
    tl.fromTo('#hudBL', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: .28, ease: 'power3.out' }, t);
  }

  /* ======================================================================================= */
  /* 1 · COLD OPEN (0 – 3.75): "Laws are written for everyone. Understood by almost no one." */
  function s1() {
    const w = $('#s1w');
    tl.fromTo(w, { scale: 1 }, { scale: 1.07, duration: 3.75, ease: 'none', transformOrigin: '50% 50%' }, 0);   // slow push all through the open
    const slash = el('div', 'slash', null, w);
    tl.fromTo(slash, { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: .32, ease: 'expo.out' }, 0);
    tl.to(slash, { opacity: 0, duration: .3 }, .55);
    const A = el('div', 'layer', null, w);
    const l1 = el('div', 'kin vf s1-word', null, A); l1.style.top = '330px'; l1.style.fontSize = '150px';
    const l2 = el('div', 'kin vf s1-word', null, A); l2.style.top = '530px'; l2.style.fontSize = '150px';
    const wLaws = el('span', null, 'LAWS ', l1), wAre = el('span', null, 'ARE ', l1), wWrit = el('span', null, 'WRITTEN', l1);
    const wFor = el('span', null, 'FOR ', l2), wEvery = el('span', 'gold', 'EVERYONE.', l2);
    const cLaws = splitChars(wLaws), cAre = splitChars(wAre), cWrit = splitChars(wWrit), cFor = splitChars(wFor), cEv = splitChars(wEvery);
    // beat 1: LAWS rises out of the slash, width-axis snapping from condensed to normal
    tl.fromTo(cLaws, { yPercent: 70, opacity: 0, filter: 'blur(8px)' }, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: .45, ease: 'expo.out', stagger: .03 }, .02);
    vf(cLaws, { w: 50, g: 900 }, { w: 100, g: 700 }, .02, .55, 'expo.out', .03);
    // beat 2: ARE punches in from depth
    tl.fromTo(cAre, { scale: 2.4, opacity: 0, filter: 'blur(14px)' }, { scale: 1, opacity: 1, filter: 'blur(0px)', duration: .32, ease: 'expo.out', stagger: .02 }, bt(1, 1));
    vf(cAre, { w: 100, g: 300 }, { w: 100, g: 700 }, bt(1, 1), .4);
    // beat 3: WRITTEN flips up letter by letter (3D)
    tl.set(l1, { perspective: 900 }, 0);
    tl.fromTo(cWrit, { rotateX: -95, opacity: 0, transformOrigin: '50% 100%' }, { rotateX: 0, opacity: 1, duration: .42, ease: 'back.out(1.6)', stagger: .028 }, bt(1, 2));
    vf(cWrit, { w: 100, g: 700 }, { w: 100, g: 700 }, bt(1, 2), .1);
    // beat 4: FOR EVERYONE. stretches across the width axis 50 → 125 → 100
    tl.fromTo(cFor.concat(cEv), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .3, ease: 'power3.out', stagger: .018 }, bt(1, 3));
    vf(cFor.concat(cEv), { w: 50, g: 900 }, { w: 118, g: 600 }, bt(1, 3), .32, 'power3.out', .015);
    vf(cFor.concat(cEv), { w: 118, g: 600 }, { w: 100, g: 700 }, bt(1, 3) + .45, .3, 'power2.inOut', .0);
    // bar 2: the sentence recedes, the counter-statement slams over it
    tl.to(A, { scale: .78, opacity: .16, filter: 'blur(6px)', duration: .4, ease: 'power3.out' }, bt(2));
    const B = el('div', 'layer', null, w);
    const u1 = el('div', 'kin vf s1-word', 'UNDERSTOOD', B); u1.style.top = '250px'; u1.style.fontSize = '200px';
    const u2 = el('div', 'kin s1-small', 'by almost', B); u2.style.top = '490px'; u2.style.fontSize = '40px'; u2.style.letterSpacing = '.5em';
    const u3 = el('div', 'kin vf s1-word', 'NO ONE.', B); u3.style.top = '560px'; u3.style.fontSize = '300px'; u3.style.color = '#c18d48';
    const cU1 = splitChars(u1), cU3 = splitChars(u3);
    tl.fromTo(cU1, { opacity: 0, x: function (i) { return (i - 4.5) * 40; }, filter: 'blur(10px)' }, { opacity: 1, x: 0, filter: 'blur(0px)', duration: .35, ease: 'expo.out', stagger: .015 }, bt(2));
    vf(cU1, { w: 150, g: 200 }, { w: 75, g: 800 }, bt(2), .5, 'expo.out', .01);
    tl.fromTo(u2, { opacity: 0, letterSpacing: '1.4em' }, { opacity: 1, letterSpacing: '.5em', duration: .4, ease: 'expo.out' }, bt(2, 1));
    // NO ONE. — letters converge from scattered positions, then shudder with the riser
    const r = rng(9);
    tl.fromTo(cU3, { opacity: 0, x: function () { return (r() - .5) * 1400; }, y: function () { return (r() - .5) * 700; }, rotation: function () { return (r() - .5) * 120; }, scale: 2.2 },
      { opacity: 1, x: 0, y: 0, rotation: 0, scale: 1, duration: .5, ease: 'expo.out', stagger: .02 }, bt(2, 2));
    vf(cU3, { w: 60, g: 900 }, { w: 112, g: 900 }, bt(2, 2), .6, 'expo.out', .02);
    const jit = { a: 0 };
    const writeJit = function () {
      const tt = tl.time();
      cU3.forEach(function (c, i) { c.style.translate = (Math.sin(tt * 97 + i * 2.1) * 9 * jit.a).toFixed(1) + 'px ' + (Math.cos(tt * 83 + i) * 6 * jit.a).toFixed(1) + 'px'; });
    };
    tl.to(jit, { a: 1, duration: bt(2, 3.5) - bt(2, 3), ease: 'power2.in', onUpdate: writeJit }, bt(2, 3));
    tl.to(jit, { a: 0, duration: .001, onUpdate: writeJit }, bt(2, 3.5));   // the 1/8 gap: everything freezes before the drop
    tl.set(cU3, { textShadow: '0 0 0 rgba(0,0,0,0)' }, 0);
    tl.to(cU3, { textShadow: '-6px 0 0 rgba(224,82,82,.55), 6px 0 0 rgba(120,170,255,.45)', duration: .5, ease: 'power2.in' }, bt(2, 2.75));
  }

  /* 2 · DROP (3.75 – 5.65): gold iris, logo slam, swirl sparks, tagline */
  let LG2;
  function s2() {
    const iris = $('#s2iris'), w = $('#s2w');
    const st = { r: 0 };
    tl.fromTo(st, { r: 0 }, { r: 1500, duration: .6, ease: 'expo.out', onUpdate: function () { iris.style.clipPath = 'circle(' + st.r.toFixed(1) + 'px at 50% 50%)'; } }, 3.75);
    LG2 = logo(w, 'l2', 460, 228, 1000);
    swirlA = LG2;
    tl.fromTo(LG2.letters, { scale: 2.3, opacity: 0, filter: 'blur(18px)' }, { scale: 1, opacity: 1, filter: 'blur(0px)', duration: .55, ease: 'expo.out', stagger: .05 }, 3.76);
    drawSwirl(LG2, 3.95, .6);
    const tag = el('div', 'tag', 'Tajik law, made simple with AI.', w); tag.style.top = '730px';
    const ct = splitChars(tag);
    tl.fromTo(ct, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .4, ease: 'power3.out', stagger: .012 }, 4.25);
    // hand-off: everything but the O clears; the O becomes the input field in scene 3
    tl.to(LG2.m, { x: -380, opacity: 0, filter: 'blur(10px)', duration: .38, ease: 'power3.in' }, 5.12);
    tl.to([LG2.n, LG2.i], { x: 380, opacity: 0, filter: 'blur(10px)', duration: .38, ease: 'power3.in', stagger: .03 }, 5.12);
    tl.to(LG2.swirl, { y: -60, opacity: 0, duration: .3, ease: 'power3.in' }, 5.12);
    tl.to(ct, { opacity: 0, y: 30, duration: .25, ease: 'power2.in', stagger: .004 }, 5.1);
    tl.set(LG2.o, { opacity: 0 }, 5.16);
  }

  /* 3 · ASK (5.15 – 9.45) */
  let pillCenter = [640, 740];
  function s3() {
    const w = $('#s3w'), bg = $('#s3bg');
    tl.set(bg, { opacity: 0 }, 0); tl.set(bg, { opacity: 1 }, 5.62);
    // O → input field (shape morph: ellipse ring → pill box)
    const k = LG2.k, ox = 460 + 109.5 * k, oy = 228 + 62.6 * k, owid = 77.5 * k, ohei = 70.6 * k;
    const morph = el('div', 'morph', null, w);
    tl.set(morph, { left: ox, top: oy, width: owid, height: ohei, borderWidth: 26, borderColor: '#222437', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0)', opacity: 1 }, 0);
    tl.to(morph, { left: 360, top: 470, width: 1200, height: 140, borderWidth: 2, borderColor: '#c18d48', borderRadius: 70, backgroundColor: '#ffffff', duration: .46, ease: 'expo.inOut' }, 5.16);
    tl.set(morph, { opacity: 0 }, 5.63);
    const box = el('div', 'askbox', '<div class="q"><span class="ph">Ask me…</span><span class="typed"></span><span class="caret"></span></div>' +
      '<div class="send"><svg viewBox="0 0 24 24" fill="none" stroke="#f8f7f4" stroke-width="2.6"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg></div>', w);
    const ph = $('.ph', box), typed = $('.typed', box), caret = $('.caret', box), send = $('.send', box);
    tl.set(box, { opacity: 0 }, 0); tl.set(box, { opacity: 1 }, 5.62);
    tl.set(ph, { display: 'inline' }, 0); tl.set(ph, { display: 'none' }, 5.72);
    const Q = 'Can my employer dismiss me during probation?';
    typeText(typed, Q, 5.72, 1.22);
    tl.fromTo(caret, { opacity: 1 }, { opacity: 0, duration: .001 }, 5.95); tl.set(caret, { opacity: 1 }, 6.05);
    tl.fromTo(send, { scale: .7, opacity: .25 }, { scale: 1, opacity: 1, duration: .3, ease: 'back.out(2)' }, 5.8);
    tl.to(send, { scale: .82, duration: .07, ease: 'power2.in' }, 7.0); tl.to(send, { scale: 1, duration: .2, ease: 'back.out(2)' }, 7.07);
    tl.to(box, { y: -330, scale: .5, opacity: 0, duration: .32, ease: 'power3.in' }, 7.08);
    const bub = el('div', 'bubble', Q, w);
    tl.fromTo(bub, { opacity: 0, y: 40, scale: .9 }, { opacity: 1, y: 0, scale: 1, duration: .35, ease: 'back.out(1.6)' }, 7.22);
    // the answer lands on the downbeat of bar 5
    const yes = el('div', 'ans-yes vf', 'Yes<span class="gold"> —</span>', w);
    const cy = splitChars(yes);
    tl.fromTo(cy, { opacity: 0, scale: 2.6, filter: 'blur(20px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: .42, ease: 'expo.out', stagger: .035 }, bt(5));
    vf(cy, { w: 150, g: 900 }, { w: 90, g: 800 }, bt(5), .5, 'expo.out', .035);
    const line = el('div', 'ans-line', 'but only on the grounds set out in', w);
    line.style.fontSize = '54px'; line.style.top = '600px';
    const wl = splitWords(line);
    tl.fromTo(wl, { opacity: 0, y: 36, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: .35, ease: 'power3.out', stagger: .045 }, bt(5) + .14);
    const pill = el('div', 'pill', '<i></i>LABOUR CODE · ART. 28', w); pill.style.left = '210px'; pill.style.top = '710px';
    tl.fromTo(pill, { scale: 1.7, opacity: 0, transformOrigin: '0% 50%' }, { scale: 1, opacity: 1, duration: .38, ease: 'back.out(2.2)' }, bt(5, 1));
    const rg = el('div', 'ring', null, w); rg.style.left = '210px'; rg.style.top = '710px'; rg.style.width = '560px'; rg.style.height = '88px';
    tl.set(rg, { opacity: 0 }, 0);
    tl.fromTo(rg, { scale: 1, opacity: .9 }, { scale: 1.5, opacity: 0, duration: .6, ease: 'expo.out', immediateRender: false }, bt(5, 1) + .05);
    pillCenter = [210 + 280, 710 + 44];
    // three conditions orbit in on beats 3, 4 and the last 8th
    const lab = el('div', 'label', 'Three conditions', w); lab.style.position = 'absolute'; lab.style.left = '1040px'; lab.style.top = '330px'; lab.style.color = '#8a5e26';
    tl.fromTo(lab, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: .3, ease: 'power3.out' }, bt(5, 2) - .1);
    const stg = el('div', 'req-stage', null, w), world = el('div', 'req-world', null, stg);
    world.style.left = '1040px'; world.style.top = '380px'; world.style.width = '640px';
    const reqs = [['Probation agreed in the contract', 'Labour Code, Art. 28'], ['A negative result of the work', 'Labour Code, Art. 28(8)'], ['Written notice ≥ 7 days ahead', 'with the reasons stated']];
    const CK = '<svg viewBox="0 0 24 24" fill="none" stroke="#c18d48" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="5 12.5 10 17 19 7"/></svg>';
    const times = [bt(5, 2), bt(5, 3), bt(5, 3.5)];
    reqs.forEach(function (q, i) {
      const c = el('div', 'req', '<span class="ck">' + CK + '</span><div>' + q[0] + '<small>' + q[1] + '</small></div>', world);
      c.style.top = (i * 156) + 'px';
      tl.fromTo(c, { opacity: 0, z: -900, rotateY: 55, x: 260 }, { opacity: 1, z: 0, rotateY: 0, x: 0, duration: .45, ease: 'expo.out' }, times[i]);
      const pl = $('polyline', c); const len = 22; pl.style.strokeDasharray = len;
      tl.fromTo(pl, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: .25, ease: 'power2.out' }, times[i] + .18);
    });
    tl.fromTo(world, { rotateY: -16 }, { rotateY: -5, duration: 1.1, ease: 'sine.inOut' }, bt(5, 2));
    // exit: zoom through the citation (Z forward, same scale sign as scene 4's entry)
    tl.to(w, { scale: 2.3, opacity: 0, filter: 'blur(16px)', transformOrigin: pillCenter[0] + 'px ' + pillCenter[1] + 'px', duration: .34, ease: 'power3.in' }, 9.06);
  }

  /* 4 · LANGUAGES (9.375 – 11.275): slot roll + audio-reactive voice wave → flat line */
  let waveBars = [];
  function s4() {
    const w = $('#s4w');
    tl.fromTo(w, { scale: .72, opacity: 0, filter: 'blur(14px)' }, { scale: 1, opacity: 1, filter: 'blur(0px)', duration: .32, ease: 'expo.out' }, 9.375);
    const row = el('div', 'lang-row', null, w);
    const fixed = el('div', 'lang-fixed vf', 'Ask in', row);
    fixed.style.fontVariationSettings = "'opsz' 144, 'wdth' 100, 'wght' 500";
    const slot = el('div', 'slot vf', null, row), col = el('div', 'slot-col', null, slot);
    ['English', 'Russian', 'Tajik'].forEach(function (s) { el('div', null, s, col); });
    $$('div', col).forEach(function (d) { d.style.fontVariationSettings = "'opsz' 144, 'wdth' 100, 'wght' 600"; d.style.fontStyle = 'italic'; });
    const rows = $$('div', col);
    const widths = rows.map(function (d) { const sp = el('span', null, d.textContent, null); d.textContent = ''; d.appendChild(sp); return sp.offsetWidth + 40; });   // layout width (immune to the entry scale) + italic overhang
    tl.set(slot, { width: widths[0] }, 0);
    tl.set(col, { y: 170 }, 0);
    [[9.375, 0], [bt(6, 1), -170], [bt(6, 2), -340]].forEach(function (s, i) {
      tl.to(col, { y: s[1], duration: .26, ease: 'back.out(1.4)' }, s[0]);
      if (i) tl.to(slot, { width: widths[i], duration: .3, ease: 'expo.inOut' }, s[0]);
      tl.fromTo(col, { filter: 'blur(7px)' }, { filter: 'blur(0px)', duration: .22, ease: 'power2.out' }, s[0]);
      vf(rows[i], { w: 125, g: 300 }, { w: 100, g: 600 }, s[0], .4, 'expo.out');
    });
    // voice: 72 bars driven by the actual mix loudness (history scrolls outward from the centre)
    const wave = el('div', 'wave', null, w);
    for (let i = 0; i < 72; i++) waveBars.push(el('span', null, null, wave));
    const cap = el('div', 'wave-cap', '…or just say it.', w);
    const st = { on: 0, flat: 0 };
    const writeWave = function () {
      const f = frameIdx(tl.time());
      waveBars.forEach(function (b, i) {
        const d = Math.abs(i - 35.5);
        const v = SC.rms[clamp(f - Math.round(d * 1.4), 0, SC.rms.length - 1)];
        const win = Math.pow(1 - d / 38, .7);
        const h = (6 + (14 + 210 * Math.pow(v, 1.25)) * win) * st.on;
        b.style.height = (h * (1 - st.flat) + 3 * st.flat).toFixed(1) + 'px';
        b.style.background = d < 9 ? '#c18d48' : '#1a1a1f';
        b.style.opacity = (1 - st.flat * .9).toFixed(3);
      });
    };
    writeWave();
    tl.to(st, { on: 1, duration: .35, ease: 'power2.out', onUpdate: writeWave }, bt(6, 1.6));
    tl.to(st, { on: 1, duration: 10.95 - (bt(6, 1.6) + .35), ease: 'none', onUpdate: writeWave }, bt(6, 1.6) + .35);
    tl.to(st, { flat: 1, duration: .14, ease: 'power3.in', onUpdate: writeWave }, 10.82);
    tl.fromTo(cap, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .3, ease: 'power3.out' }, bt(6, 2.4));
    tl.to([row, cap], { opacity: 0, y: -30, duration: .2, ease: 'power2.in' }, 10.8);
  }

  /* 5 · REVIEW (10.95 – 14.9) */
  const CLAUSES = [
    { t: '1.2  The lease term is five years from the date of signing.' },
    { t: '2.2  The Landlord may change the rent at any time on three days’ notice.', cat: 'red', cite: 'Civil Code · Art. 680(5)', fix: 'Rent changes only by agreement, at most once a year.' },
    { t: '3.1  The Tenant carries out all capital repairs at its own expense.', cat: 'amber', cite: 'Civil Code · Art. 683(1)', fix: 'Capital repairs are the Landlord’s duty.' },
    { t: '4.1  Late rent: a penalty of 5% of the debt for each day of delay.', cat: 'amber', cite: 'Civil Code · Art. 384(1)', fix: 'Penalty 0.1% a day, capped at 10%.' },
    { t: '5.1  The Landlord may terminate at any time without giving reasons.', cat: 'red', cite: 'Civil Code · Arts. 687, 516', fix: 'Early termination only in court, on Art. 687 grounds.' },
    { t: '6.1  This lease is not subject to state registration.', cat: 'red', cite: 'Civil Code · Art. 718(3)', fix: 'The lease is subject to state registration.' },
    { t: '6.3  Matters not covered are governed by the laws of Tajikistan.' }
  ];
  function s5() {
    const sec = $('#s5'), clip = $('#s5clip'), w = $('#s5w');
    // the flattened voice line rises and wipes the review in beneath it
    const fl = el('div', 'flatline', null, sec);
    const wipe = { y: 749 };
    const writeWipe = function () { clip.style.clipPath = 'inset(' + Math.max(0, wipe.y).toFixed(1) + 'px 0px 0px 0px)'; fl.style.top = wipe.y.toFixed(1) + 'px'; };
    writeWipe();
    tl.to(wipe, { y: -12, duration: .3, ease: 'power3.in', onUpdate: writeWipe }, 11.0);
    tl.set(fl, { opacity: 0 }, 11.31);
    const stg = el('div', 'doc-stage', null, w);
    const doc = el('div', 'doc', '<h4>LEASE AGREEMENT No. 14/26</h4>', stg);
    const cls = CLAUSES.map(function (c) {
      const p = el('div', 'cl', (c.cat ? '<span class="hl ' + c.cat + '"></span>' : '') + '<span class="txt">' + c.t + '</span>', doc);
      return { el: p, c: c, hl: $('.hl', p), txt: $('.txt', p) };
    });
    const beam = el('div', 'beam', null, doc);
    const counter = el('div', 'issues', '<span class="num">0</span><span class="lbl">issues found</span>', w);
    const num = $('.num', counter), lbl = $('.lbl', counter);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'links'); svg.setAttribute('width', 1920); svg.setAttribute('height', 1080); w.appendChild(svg);
    const pos = cls.map(function (c) { return measure(c.el, w); });
    const dpos = measure(doc, w);
    tl.fromTo(doc, { rotateX: 48, y: 260, z: -480, opacity: 0 }, { rotateX: 0, y: 0, z: 0, opacity: 1, duration: .6, ease: 'expo.out' }, 10.98);
    tl.fromTo(counter, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: .3, ease: 'power3.out' }, 11.35);
    // scan beam
    const b0 = 120, b1 = dpos.h - 60, s0 = 11.42, s1 = 12.95;
    tl.fromTo(beam, { top: b0, opacity: 0 }, { top: b1, opacity: 1, duration: s1 - s0, ease: 'none' }, s0);
    tl.to(beam, { opacity: 0, duration: .2 }, s1);
    const cnt = { n: 0 };
    let k = 0;
    cls.forEach(function (c, i) {
      if (!c.c.cat) return;
      const yIn = pos[i].y - dpos.y;
      let t = s0 + (s1 - s0) * clamp((yIn - b0 + 10) / (b1 - b0), 0, 1);
      t = Math.round(t / (BEAT / 2)) * (BEAT / 2);            // snap each flag to the 8th-note grid
      tl.fromTo(c.hl, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: .22, ease: 'power3.out' }, t);
      const tag = el('div', 'tagcite', '<span class="dot" style="background:' + (c.c.cat === 'red' ? '#e05252' : '#c18d48') + '"></span>' + c.c.cite, w);
      tag.style.left = '1180px'; tag.style.top = (pos[i].cy - 30) + 'px';
      tl.fromTo(tag, { opacity: 0, x: -30, scale: .9 }, { opacity: 1, x: 0, scale: 1, duration: .3, ease: 'back.out(1.8)' }, t + .06);
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const x1 = dpos.r + 8, y1 = pos[i].cy, x2 = 1172, y2 = pos[i].cy;
      p.setAttribute('d', 'M' + x1 + ',' + y1 + ' L' + x2 + ',' + y2);
      p.setAttribute('stroke', c.c.cat === 'red' ? '#e05252' : '#c18d48'); p.setAttribute('stroke-width', '2.5'); p.setAttribute('fill', 'none');
      svg.appendChild(p); p.style.strokeDasharray = 140;
      tl.fromTo(p, { strokeDashoffset: 140 }, { strokeDashoffset: 0, duration: .2, ease: 'power2.out' }, t + .02);
      const kk = ++k;
      tl.to(cnt, { n: kk, duration: .12, ease: 'none', onUpdate: function () { num.textContent = Math.round(cnt.n); } }, t);
      tl.fromTo(num, { scale: 1.35 }, { scale: 1, duration: .25, ease: 'back.out(2)' }, t);
      c.tag = tag; c.path = p;
    });
    tl.to(counter, { y: -20, duration: .3, ease: 'power2.inOut' }, 13.0);
    // bar 8: every flag gets fixed — strike, then the corrected wording types in (tracked changes)
    setAt(bt(8), function () { lbl.textContent = 'fixes applied'; num.style.color = '#2e9e5b'; }, function () { lbl.textContent = 'issues found'; num.style.color = '#e05252'; });
    tl.fromTo(num, { scale: 1.4 }, { scale: 1, duration: .3, ease: 'back.out(2)' }, bt(8));
    const flagged = cls.filter(function (c) { return c.c.cat; });
    tl.to(flagged.map(function (c) { return c.tag; }).concat(flagged.map(function (c) { return c.path; })), { opacity: 0, duration: .25 }, bt(8) - .05);
    flagged.forEach(function (c, j) {
      const t = bt(8) + .08 + j * BEAT / 2;
      const del = c.txt;
      tl.fromTo(del, { textDecorationColor: 'rgba(224,82,82,0)', color: '#222222' }, { textDecorationColor: 'rgba(224,82,82,1)', color: '#9a5a5a', duration: .16, ease: 'power2.out' }, t);
      del.style.textDecorationLine = 'line-through'; del.style.textDecorationThickness = '2px';
      const ins = el('span', 'ins', null, c.el);
      el('span', null, ' ', c.el);
      c.el.insertBefore(document.createTextNode(' '), ins);
      typeText(ins, '→ ' + c.c.fix, t + .1, .3);
      tl.to(c.hl, { opacity: .35, duration: .3 }, t + .2);
    });
    tl.to(w, { scale: 1.16, transformOrigin: '640px 540px', duration: 1.2, ease: 'power2.inOut' }, bt(8) + .05);
    const stamp = el('div', 'stamp', 'Tracked changes ✓', doc);
    stamp.style.left = '210px'; stamp.style.top = '660px';
    tl.fromTo(stamp, { opacity: 0, scale: 2.2, rotation: -16 }, { opacity: 1, scale: 1, rotation: -8, duration: .35, ease: 'back.out(1.8)' }, 14.28);
    // page flip into the drafting scene (same axis, same direction)
    tl.to(doc, { rotateY: -90, duration: .32, ease: 'power2.in', transformOrigin: '50% 50%' }, 14.55);
    tl.to(counter, { opacity: 0, x: 40, duration: .25, ease: 'power2.in' }, 14.55);
  }

  /* 6 · DRAFT (14.85 – 16.9) */
  function s6() {
    const w = $('#s6w');
    tl.set(w, { scale: 1.16, transformOrigin: '640px 540px' }, 0);
    tl.to(w, { scale: 1, duration: .8, ease: 'power3.out' }, 14.9);
    const stg = el('div', 'doc-stage', null, w);
    const page = el('div', 'doc', null, stg);
    const h = el('h4', null, '', page); const hTxt = 'SERVICES AGREEMENT';
    const no = el('div', 'cl', 'No. <span class="ph">[specify]</span> · Dushanbe, <span class="ph">[date]</span>', page); no.style.textAlign = 'center'; no.style.marginBottom = '30px';
    const secs = [
      ['1. SUBJECT', ['The Contractor develops the Client’s corporate website: six pages and a CMS.', 'Client: Pamir Trade LLC, TIN <span class="ph">[specify]</span>.']],
      ['2. TERM', ['Services are completed within 60 calendar days of the advance payment.']],
      ['3. PRICE AND PAYMENT', ['Total: TJS 25,000 — 50% in advance, 50% within five days of acceptance.', 'VAT: <span class="ph">[specify, if applicable]</span>.']]
    ];
    const blocks = [];
    secs.forEach(function (s) {
      const hd = el('div', 'cl', '<b></b>', page); hd.style.marginTop = '14px'; hd.style.marginBottom = '10px';
      const sk = el('div', null, null, page); sk.style.position = 'relative';
      const bars = s[1].map(function (_, j) { const b = el('div', 'sk', null, sk); b.style.width = (92 - j * 18) + '%'; return b; });
      el('div', 'sk', null, sk).style.width = '64%';
      const txt = el('div', null, s[1].map(function (x) { return '<div class="cl">' + x + '</div>'; }).join(''), page);
      txt.style.marginTop = '-' + (sk.childElementCount * 28) + 'px';
      blocks.push({ hd: $('b', hd), title: s[0], bars: $$('.sk', sk), txt: txt });
    });
    const rest = el('div', null, null, page); rest.style.marginTop = '22px';
    ['4. RIGHTS AND OBLIGATIONS', '5. ACCEPTANCE', '6. INTELLECTUAL PROPERTY'].forEach(function (hd, i) {
      const h2 = el('div', 'cl', '<b>' + hd + '</b>', rest); h2.style.marginBottom = '10px'; h2.style.opacity = '.5';
      [96, 88, 70].forEach(function (wd) { const b = el('div', 'sk', null, rest); b.style.width = wd + '%'; });
    });
    tl.fromTo(rest.children, { opacity: 0, x: -16 }, { opacity: function (i, e) { return e.classList.contains('cl') ? .5 : 1; }, x: 0, duration: .2, ease: 'power3.out', stagger: BEAT / 4 }, 15.9);
    tl.fromTo(page, { rotateY: 90 }, { rotateY: 0, duration: .32, ease: 'power2.out', transformOrigin: '50% 50%' }, 14.87);
    typeText(h, hTxt, 15.0, .3);
    tl.fromTo(no, { opacity: 0 }, { opacity: 1, duration: .2 }, 15.3);
    let t = 15.12;
    blocks.forEach(function (b) {
      typeText(b.hd, b.title, t, .18);
      tl.fromTo(b.bars, { scaleX: 0 }, { scaleX: 1, duration: .14, ease: 'power3.out', stagger: BEAT / 4 }, t + .06);
      tl.set(b.txt, { opacity: 0 }, 0);
      t += .26;
    });
    blocks.forEach(function (b, i) {
      tl.to(b.bars, { opacity: 0, duration: .18 }, 15.82 + i * .12);
      tl.fromTo(b.txt, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .25, ease: 'power3.out' }, 15.86 + i * .12);
    });
    const phs = $$('.ph', page);
    SC.events.bell.filter(function (x) { return x > 15 && x < 16.6; }).forEach(function (tb, i) {
      const ph = phs[i % phs.length];
      tl.fromTo(ph, { boxShadow: '0 0 0 0 rgba(193,141,72,0)' }, { boxShadow: '0 0 0 6px rgba(193,141,72,.35)', duration: .12, yoyo: true, repeat: 1, ease: 'power2.out' }, tb);
    });
    const k1 = el('div', 'vf', 'A full contract.', w), k2 = el('div', 'vf gold', 'In seconds.', w);
    [k1, k2].forEach(function (k, i) { k.style.position = 'absolute'; k.style.left = '1150px'; k.style.top = (380 + i * 130) + 'px'; k.style.fontSize = '104px'; k.style.whiteSpace = 'nowrap'; k.style.fontStyle = i ? 'italic' : 'normal'; });
    const c1 = splitChars(k1), c2 = splitChars(k2);
    tl.fromTo(c1, { opacity: 0, yPercent: 60 }, { opacity: 1, yPercent: 0, duration: .32, ease: 'expo.out', stagger: .014 }, 15.25);
    tl.fromTo(c2, { opacity: 0, yPercent: 60 }, { opacity: 1, yPercent: 0, duration: .32, ease: 'expo.out', stagger: .014 }, 15.6);
    vf(c1.concat(c2), { w: 70, g: 800 }, { w: 100, g: 500 }, 15.25, .5, 'expo.out', .01);
    tl.to([k1, k2], { opacity: 0, x: 60, duration: .2, ease: 'power2.in' }, 16.28);
    // pull back: the page becomes one cell of a wall of contracts
    const grid = el('div', 'layer', null, $('#s6'));
    const names = ['LEASE', 'EMPLOYMENT', 'SUPPLY', 'LOAN', 'SALE', 'AGENCY', 'LICENSE', 'PARTNERSHIP', 'STORAGE', 'TRANSPORT', 'CONSTRUCTION', 'CONSULTING', 'DISTRIBUTION', 'FRANCHISE'];
    let n = 0;
    const cells = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
      if (r === 1 && c === 2) continue;
      const m = el('div', 'mini', '<b>' + names[n++] + ' AGREEMENT</b>' + '<i></i>'.repeat(9), grid);
      m.style.width = '295px'; m.style.height = '310px'; m.style.padding = '30px 26px';
      m.style.left = (960 - 147.5 + (c - 2) * 335) + 'px'; m.style.top = (540 - 155 + (r - 1) * 350) + 'px';
      $$('i', m).forEach(function (x, j) { x.style.width = (100 - (j * 37) % 45) + '%'; });
      cells.push({ m: m, d: Math.hypot(c - 2, r - 1) });
    }
    tl.to(w, { scale: .36, x: 960 - .36 * 640 - 0, y: 540 - .36 * 550, transformOrigin: '0px 0px', duration: .5, ease: 'expo.inOut' }, 16.3);
    cells.forEach(function (c) {
      tl.fromTo(c.m, { opacity: 0, scale: .6 }, { opacity: 1, scale: 1, duration: .3, ease: 'expo.out' }, 16.45 + c.d * .06);
    });
  }

  /* 7 · STATS (16.875 – 18.75): four cuts, four techniques */
  function s7() {
    const w = $('#s7w');
    const P = [
      { bg: '#c18d48', fg: '#1a1a1f', big: '12', sub: 'Calculators', fine: 'Taxes · fees · duties · fines' },
      { bg: '#1a1a1f', fg: '#f3efe6', big: 'EN RU TJ', sub: 'Languages', fine: 'Type it — or say it' },
      { bg: '#f8f7f4', fg: '#1a1a1f', big: '24/7', sub: 'Always on', fine: 'Answers in seconds' },
      { bg: '#c18d48', fg: '#1a1a1f', big: 'ALL', sub: 'Laws · codes · bylaws', fine: 'Moní Pro — no limits' }
    ];
    P.forEach(function (p, i) {
      const t0 = bt(10, i), t1 = bt(10, i + 1);
      const pane = el('div', 'stat', '<div class="big vf"></div><div class="sub"></div><div class="fine"></div>', w);
      pane.style.background = p.bg; pane.style.color = p.fg;
      const big = $('.big', pane), sub = $('.sub', pane), fine = $('.fine', pane);
      sub.textContent = p.sub; fine.textContent = p.fine;
      if (i === 1) { big.style.fontSize = '260px'; big.style.letterSpacing = '.02em'; }
      tl.set(pane, { opacity: 0 }, 0); tl.set(pane, { opacity: 1 }, t0); if (i < 3) tl.set(pane, { opacity: 0 }, t1);
      if (i === 0) {
        // count-up inside a drawing dial
        const dial = el('div', 'dial', '<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="92" fill="none" stroke="rgba(26,26,31,.18)" stroke-width="3"/><circle class="arc" cx="100" cy="100" r="92" fill="none" stroke="#1a1a1f" stroke-width="5" stroke-linecap="round" transform="rotate(-90 100 100)"/></svg>', pane);
        const arc = $('.arc', dial), L0 = 2 * Math.PI * 92; arc.style.strokeDasharray = L0;
        tl.fromTo(arc, { strokeDashoffset: L0 }, { strokeDashoffset: 0, duration: .4, ease: 'power3.out' }, t0);
        const c = { n: 0 };
        tl.fromTo(c, { n: 0 }, { n: 12, duration: .36, ease: 'power3.out', onUpdate: function () { big.textContent = Math.round(c.n); } }, t0);
        tl.fromTo(big, { scale: .7 }, { scale: 1, duration: .4, ease: 'back.out(2)' }, t0);
      } else if (i === 1) {
        big.textContent = p.big;
        const cs = splitWords(big);   // per word: per-letter spans would break the T–J kerning
        tl.fromTo(cs, { opacity: 0, x: function (j) { return (j % 2 ? 1 : -1) * 320; } }, { opacity: 1, x: 0, duration: .26, ease: 'expo.out', stagger: .03 }, t0);
        vf(cs, { w: 50, g: 900 }, { w: 100, g: 700 }, t0, .3, 'expo.out', .03);
      } else if (i === 2) {
        big.textContent = p.big;
        const cs = splitChars(big);
        tl.set(big, { perspective: 800 }, 0);
        tl.fromTo(cs, { rotateX: -100, opacity: 0, transformOrigin: '50% 50% -60px' }, { rotateX: 0, opacity: 1, duration: .3, ease: 'back.out(1.7)', stagger: .04 }, t0);
      } else {
        big.textContent = p.big;
        vf(big, { w: 50, g: 900 }, { w: 150, g: 800 }, t0, .42, 'expo.out');
        tl.fromTo(big, { scale: 1.25 }, { scale: 1, duration: .42, ease: 'expo.out' }, t0);
      }
      tl.fromTo([sub, fine], { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .22, ease: 'power3.out', stagger: .04 }, t0 + .06);
    });
    tl.to(w.lastChild, { opacity: 0, duration: .08 }, 18.74);
  }

  /* 8 · BREAKDOWN (18.75 – 20.65) */
  function s8() {
    const w = $('#s8w');
    // glow = radial gradient (a large box-shadow on a scaled layer rasterises as a visible square)
    const glow = el('div', null, null, w);
    Object.assign(glow.style, { position: 'absolute', left: '960px', top: '470px', width: '640px', height: '640px', margin: '-320px 0 0 -320px', borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(240,207,143,.55) 0%, rgba(232,192,120,.22) 22%, rgba(193,141,72,.07) 45%, rgba(193,141,72,0) 70%)' });
    const dot = el('div', null, null, w);
    Object.assign(dot.style, { position: 'absolute', left: '960px', top: '470px', width: '24px', height: '24px', margin: '-12px 0 0 -12px', borderRadius: '50%', background: 'radial-gradient(circle at 40% 40%, #f6dca6, #c18d48 70%)' });
    tl.fromTo(dot, { scale: 0 }, { scale: 1, duration: .4, ease: 'back.out(2)' }, 18.8);
    tl.fromTo(glow, { scale: .15, opacity: 0 }, { scale: .45, opacity: .8, duration: .4, ease: 'power2.out' }, 18.8);
    tl.to(glow, { scale: 1.25, opacity: 1, duration: 20.53 - 19.2, ease: 'power2.in' }, 19.2);
    tl.to(dot, { scale: 1.9, duration: 20.53 - 19.2, ease: 'power2.in' }, 19.2);
    const need = el('div', 'need', '', w);
    typeText(need, 'Need a lawyer?', 19.0, .8);
    tl.to(need, { letterSpacing: '.04em', duration: 1.5, ease: 'sine.inOut' }, 19.0);
  }

  /* 9 · FINALE (20.625 – 24) */
  function s9() {
    const iris = $('#s9iris'), w = $('#s9w');
    const st = { r: 0 };
    tl.fromTo(st, { r: 0 }, { r: 1700, duration: .7, ease: 'expo.out', onUpdate: function () { iris.style.clipPath = 'circle(' + st.r.toFixed(1) + 'px at 960px 470px)'; } }, 20.625);
    const lg = logo(w, 'l9', 535, 170, 850);
    swirlB = lg;
    tl.fromTo(lg.letters, { scale: 1.9, opacity: 0, filter: 'blur(16px)' }, { scale: 1, opacity: 1, filter: 'blur(0px)', duration: .6, ease: 'expo.out', stagger: .05 }, 20.64);
    drawSwirl(lg, 20.8, .62);
    const tag = el('div', 'final-tag vf', 'Ask <em>Moní first.</em>', w);
    tag.style.top = '600px';
    const wds = splitWords(tag);
    tl.fromTo(wds, { opacity: 0, y: 50, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: .45, ease: 'expo.out', stagger: .09 }, SC.events.bell[SC.events.bell.length - 2]);
    vf(wds, { w: 140, g: 300 }, { w: 100, g: 500 }, SC.events.bell[SC.events.bell.length - 2], .7, 'expo.out', .09);
    const url = el('div', 'url', 'tajiklaw.ai', w); url.style.top = '770px';
    const line = el('div', 'url-line', null, w); line.style.top = '838px';
    const tb = SC.events.bell[SC.events.bell.length - 1];
    tl.fromTo(url, { opacity: 0, letterSpacing: '.5em' }, { opacity: 1, letterSpacing: '.12em', duration: .6, ease: 'expo.out' }, tb);
    tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: .5, ease: 'expo.inOut' }, tb + .15);
    const conf = el('div', 'label', 'AI Conf 2026 · Dushanbe · 30–31 October', w);
    Object.assign(conf.style, { position: 'absolute', left: '0', right: '0', top: '900px', textAlign: 'center', color: '#8a5e26' });
    tl.fromTo(conf, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .4, ease: 'power3.out' }, tb + .35);
    // light sweep across the mark
    const svgEl = $('svg', lg.box), NS = 'http://www.w3.org/2000/svg';
    const defs = $('defs', svgEl);
    defs.insertAdjacentHTML('beforeend', '<linearGradient id="l9shine" gradientUnits="userSpaceOnUse" x1="-120" y1="0" x2="-40" y2="40">' +
      '<stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>');
    const gl = document.createElementNS(NS, 'g');
    lg.letters.forEach(function (p) { const c = p.cloneNode(); c.setAttribute('fill', 'url(#l9shine)'); c.removeAttribute('class'); gl.appendChild(c); });
    svgEl.appendChild(gl);
    const grad = $('#l9shine', svgEl);
    tl.fromTo(grad, { attr: { x1: -120, x2: -40 } }, { attr: { x1: 330, x2: 410 }, duration: 1.1, ease: 'power2.inOut' }, 22.35);
    tl.fromTo(w, { scale: 1.04 }, { scale: 1, duration: 3.2, ease: 'sine.out', transformOrigin: '960px 470px' }, 20.7);
  }

  function build() {
    s1(); s2(); s3(); s4(); s5(); s6(); s7(); s8(); s9();
    // HUD: in after the first drop, out for the stat cuts / breakdown, back for the finale
    tl.set(hud, { opacity: 0 }, 0);
    tl.to(hud, { opacity: 1, duration: .3 }, 4.1);
    tl.to(hud, { opacity: 0, duration: .25 }, 16.25);
    tl.to(hud, { opacity: 1, duration: .4 }, 21.5);
    hudSection(4.1, '00', 'Moní');
    hudSection(5.62, '01', 'Ask');
    hudSection(9.375, '01', 'Ask · any language');
    hudSection(11.3, '02', 'Review');
    hudSection(14.9, '03', 'Draft');
    hudSection(21.5, '04', 'Start now');
    // per-frame writers (canvas, shake, HUD clock) — one proxy over the whole film
    const clock = { t: 0 };
    const tick = function () { drawFX(clock.t); shakeAt(clock.t); hudAt(clock.t); };
    tl.fromTo(clock, { t: 0 }, { t: 24, duration: 24, ease: 'none', onUpdate: tick }, 0);
    tick();
    tl.seek(0);
    return { timeline: tl };
  }

  const faces = ["400 40px 'Roboto Serif'", "900 40px 'Roboto Serif'", "italic 400 40px 'Roboto Serif'", '800 20px Nunito', '600 20px Nunito', '400 20px Tinos', '700 20px Tinos'];
  window.__buildReel = function () {
    return Promise.all(faces.map(function (f) { return document.fonts.load(f, 'Aa'); })).then(function () { return document.fonts.ready; }).then(build);
  };
})();
