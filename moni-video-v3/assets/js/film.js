/* Moní v3. One paused GSAP timeline, 56 s @ 60 fps. All timing comes from window.CUES
   (assets/data/cues.js), which the score is written against. Motion vocabulary is deliberately small:
   a fade with a short rise, a hairline drawing across, typing, a highlighter, a tracked change.
   Every writer is a pure function of timeline time, so frames render in any order. */
(function () {
  const C = window.CUES, L = window.MONI_LOGO;
  const $ = function (s, r) { return (r || document).querySelector(s); };
  const $$ = function (s, r) { return Array.from((r || document).querySelectorAll(s)); };
  const tl = gsap.timeline({ paused: true });

  /* cubic-bezier easing, solved numerically (same curve CSS would use) */
  function bez(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const X = function (t) { return ((ax * t + bx) * t + cx) * t; };
    const Y = function (t) { return ((ay * t + by) * t + cy) * t; };
    const dX = function (t) { return (3 * ax * t + 2 * bx) * t + cx; };
    return function (x) {
      if (x <= 0) return 0; if (x >= 1) return 1;
      let t = x;
      for (let i = 0; i < 8; i++) { const d = dX(t); if (Math.abs(d) < 1e-6) break; t -= (X(t) - x) / d; }
      let lo = 0, hi = 1;                       // bisection fallback keeps it monotonic
      if (Math.abs(X(t) - x) > 1e-5) { t = x; for (let i = 0; i < 30; i++) { if (X(t) < x) lo = t; else hi = t; t = (lo + hi) / 2; } }
      return Y(t);
    };
  }
  const IN = bez(0.2, 0, 0, 1);       // entrances: quick to start, long settle
  const OUT = bez(0.4, 0, 1, 1);      // exits
  const MOVE = bez(0.65, 0, 0.35, 1); // in-place changes

  function rise(target, t, dur, dy) {
    tl.fromTo(target, { opacity: 0, y: dy == null ? 18 : dy }, { opacity: 1, y: 0, duration: dur || 1.4, ease: IN }, t);
  }
  function fadeIn(target, t, dur) { tl.fromTo(target, { opacity: 0 }, { opacity: 1, duration: dur || 1.2, ease: IN }, t); }
  function leave(target, t, dur) { tl.to(target, { opacity: 0, y: -10, duration: dur || 0.8, ease: OUT }, t); }
  function drawRule(target, t, dur) { tl.fromTo(target, { scaleX: 0 }, { scaleX: 1, duration: dur || 1.6, ease: IN }, t); }
  /* layout read-out while a clip is still hidden by the runtime */
  function whileShown(section, fn) {
    const prev = section.getAttribute('style');
    section.style.display = 'block'; section.style.visibility = 'visible';
    const r = fn();
    if (prev == null) section.removeAttribute('style'); else section.setAttribute('style', prev);
    return r;
  }

  /* ---------- logo (traced vector; letters ivory, the n and the swirl in the brand bronze) ---------- */
  function helixPoint(u) {
    const th = u * 3.7 * Math.PI * 2, rx = 19 + 3 * Math.sin(u * Math.PI);
    return [291 + rx * Math.cos(th + 0.6), 11 + 41 * u + 5.2 * Math.sin(th + 0.6)];
  }
  function helixPath() {
    const pts = []; for (let i = 0; i <= 160; i++) pts.push(helixPoint(i / 160));
    return 'M' + pts.map(function (p) { return p[0].toFixed(2) + ',' + p[1].toFixed(2); }).join('L');
  }
  function logo(parent, id, w, top) {
    const box = document.createElement('div');
    box.className = 'logo-svg';
    box.style.left = ((1920 - w) / 2) + 'px'; box.style.top = top + 'px';
    box.style.width = w + 'px'; box.style.height = (w * 145 / 320) + 'px';
    const p = L.paths, ivory = '#fafaf9', bronze = '#bf9a66';
    box.innerHTML = '<svg viewBox="0 0 320 145"><defs><mask id="' + id + 'm" maskUnits="userSpaceOnUse" x="240" y="-10" width="100" height="80">' +
      '<path class="sw-draw" d="' + helixPath() + '" fill="none" stroke="#fff" stroke-width="15" stroke-linecap="round"/></mask></defs>' +
      '<path class="lg" fill="' + ivory + '" d="' + p.m + '"/><path class="lg" fill="' + ivory + '" d="' + p.o + '"/>' +
      '<path class="lg" fill="' + bronze + '" d="' + p.n + '"/><path class="lg" fill="' + ivory + '" d="' + p.i + '"/>' +
      '<g mask="url(#' + id + 'm)"><path fill="' + bronze + '" d="' + p.swirl + '"/></g></svg>';
    parent.appendChild(box);
    return { box: box, letters: $$('.lg', box), draw: $('.sw-draw', box) };
  }
  function logoIn(lg, t, tSwirl) {
    lg.letters.forEach(function (g, i) {
      tl.fromTo(g, { opacity: 0, y: 7 }, { opacity: 1, y: 0, duration: 1.8, ease: IN }, t + i * 0.12);
    });
    const len = lg.draw.getTotalLength();
    lg.draw.style.strokeDasharray = len;
    tl.fromTo(lg.draw, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: 2.0, ease: MOVE }, tSwirl);
  }

  /* ---------- typing with a caret that blinks only while idle ---------- */
  function typing(node, caret, text, t0, t1, tShow, tHide) {
    const st = { t: tShow };
    const write = function () {
      const t = st.t;
      const k = Math.max(0, Math.min(text.length, Math.floor((t - t0) / (t1 - t0) * text.length + 1e-6)));
      node.textContent = text.slice(0, t < t0 ? 0 : k);
      const typingNow = t >= t0 && t <= t1;
      caret.style.opacity = t >= tHide ? 0 : typingNow ? 1 : (Math.floor((t - tShow) / 0.53) % 2 === 0 ? 1 : 0);
    };
    tl.fromTo(st, { t: tShow }, { t: tHide + 0.01, duration: tHide + 0.01 - tShow, ease: 'none', onUpdate: write }, tShow);
    st.t = tShow; write();
  }

  /* ---------- scenes ---------- */
  function s1() {
    const k = C.open;
    rise('#s1a', k.l1, 1.8, 20);
    rise('#s1b', k.l2, 1.8, 20);
    rise('#s1c', k.l3, 2.0, 20);
    leave('#s1w', k.out, 0.9);
  }

  function s2() {
    const k = C.logo, w = $('#s2w');
    const lg = logo(w, 'lgA', 600, 300);
    logoIn(lg, k.in, k.swirl);
    rise('#s2tag', k.tag, 1.6, 14);
    leave(w, k.out, 0.9);
  }

  function s3() {
    const k = C.ask;
    drawRule('#s3rule', k.head, 1.8);
    rise('#s3eb', k.head + 0.15, 1.4, 12);
    $$('#s3h .ln').forEach(function (ln, i) { rise(ln, k.head + 0.35 + i * 0.16, 1.6); });
    rise('#s3p', k.head + 1.0, 1.4, 12);
    // the little swirl beside "Moní" in the answer header
    $('#s3mark').innerHTML = '<path fill="#bf9a66" d="' + L.paths.swirl + '"/>';
    rise('#s3field', k.panel, 1.4, 16);
    typing($('#s3q'), $('#s3caret'), 'Can my employer dismiss me during probation?', k.type[0], k.type[1], k.panel, k.send);
    // send: the button acknowledges, the question settles back
    tl.to('#s3send', { scale: 0.92, duration: 0.12, ease: MOVE }, k.send);
    tl.to('#s3send', { scale: 1, opacity: 0.35, duration: 0.5, ease: IN }, k.send + 0.12);
    tl.to('#s3q', { color: 'rgba(250,250,249,.74)', duration: 0.6, ease: MOVE }, k.send);
    rise('#s3who', k.answer - 0.3, 1.2, 10);
    $$('#s3lead .ln').forEach(function (ln, i) { rise(ln, k.answer + i * 0.22, 1.6); });
    rise('#s3cite', k.cite, 1.4, 10);
    leave('#s3w', k.out, 0.9);
  }

  function s4() {
    const k = C.review;
    drawRule('#s4rule', k.head, 1.8);
    rise('#s4eb', k.head + 0.15, 1.4, 12);
    $$('#s4h .ln').forEach(function (ln, i) { rise(ln, k.head + 0.35 + i * 0.16, 1.6); });
    rise('#s4page', k.page, 1.8, 40);
    // the highlighter passes over clause 2.2
    tl.fromTo('#s4mark', { backgroundSize: '0% 100%' }, { backgroundSize: '100% 100%', duration: 1.0, ease: MOVE }, k.mark);
    // the note sits in the page's right margin, level with the clause it is about
    const top = whileShown($('#s4'), function () { return $('#s4page').offsetTop + $('#s4clause').offsetTop - 22; });
    $('#s4note').style.top = top + 'px';
    rise('#s4note', k.note, 1.5, 16);
    // the fix: strike the clause, write the replacement beneath it (tracked change)
    tl.fromTo('#s4del', { textDecorationColor: 'rgba(156,74,62,0)', color: '#23201c' },
      { textDecorationColor: 'rgba(156,74,62,1)', color: '#8a8378', duration: 0.8, ease: MOVE }, k.fix);
    tl.to('#s4mark', { backgroundImage: 'linear-gradient(rgba(216,190,147,.22), rgba(216,190,147,.22))', duration: 0.8, ease: MOVE }, k.fix);
    // the replacement line opens up beneath the struck clause (it takes no space until then)
    const insH = whileShown($('#s4'), function () { return $('#s4ins').offsetHeight; });
    tl.fromTo('#s4ins', { height: 0 }, { height: insH, duration: 0.9, ease: MOVE }, k.fix + 0.2);
    tl.fromTo('#s4ins', { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 1.2, ease: IN }, k.fix + 0.6);
    leave('#s4w', k.out, 0.9);
  }

  function s5() {
    const k = C.draft;
    drawRule('#s5rule', k.head, 1.8);
    rise('#s5eb', k.head + 0.15, 1.4, 12);
    $$('#s5h .ln').forEach(function (ln, i) { rise(ln, k.head + 0.35 + i * 0.16, 1.6); });
    rise('#s5p', k.head + 1.1, 1.4, 12);
    fadeIn('#s5page', k.page, 1.2);
    const lines = $$('#s5page > *');
    const step = (k.ink[1] - k.ink[0]) / (lines.length - 1);
    lines.forEach(function (ln, i) {
      tl.fromTo(ln, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.9, ease: IN }, k.ink[0] + i * step);
    });
    $('#s5file').style.top = '800px';
    rise('#s5file', k.ink[1] - 1.6, 1.4, 14);
    leave('#s5w', k.out, 0.9);
  }

  function s6() {
    const k = C.end, w = $('#s6w');
    const lg = logo(w, 'lgB', 520, 296);
    logoIn(lg, k.logo, k.logo + 0.5);
    rise('#s6tag', k.tag, 1.6, 14);
    rise('#s6url', k.url, 1.4, 10);
    drawRule('#s6rule', k.foot, 2.2);
    rise('#s6l', k.foot + 0.3, 1.4, 8);
    rise('#s6r', k.foot + 0.45, 1.4, 8);
  }

  function build() {
    s1(); s2(); s3(); s4(); s5(); s6();
    // pin the timeline's length to the composition, so the last frames hold rather than end early
    tl.to({}, { duration: 0.001 }, C.duration - 0.001);
    tl.seek(0);
    return { timeline: tl };
  }

  const faces = ["300 40px 'Source Serif 4'", "italic 300 40px 'Source Serif 4'", "400 20px 'Source Serif 4'", "600 20px 'Source Serif 4'",
    "italic 400 20px 'Source Serif 4'", "400 20px 'Public Sans'", "500 20px 'Public Sans'"];
  window.__buildFilm = function () {
    return Promise.all(faces.map(function (f) { return document.fonts.load(f, 'Aa'); })).then(function () { return document.fonts.ready; }).then(build);
  };
})();
