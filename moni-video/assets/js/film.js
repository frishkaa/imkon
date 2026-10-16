/* Moní · tajiklaw.ai — AI Conf 2026 showcase. One paused GSAP timeline, 90 s, 120 BPM (bar = 2 s).
   Scene map (seconds):  1 hook 0–8 · 2 logo 8–12 · 3 ask 12–26 · 4 languages 26–34 ·
   5 review 34–56 · 6 drafting 56–70 · 7 Moní Pro 70–78 · 8 end card + loop 78–90. */
(function () {
  const F = window.FRAG, D = window.FILM, L = window.MONI_LOGO;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const el = FX.el, S = FX.sfx;
  const tl = gsap.timeline({ paused: true });

  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /* ---------------- shared builders ---------------- */
  const LOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="#1d6b3a" stroke-width="2.4"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  const STOP = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>';
  const DOC_IC = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>';
  const DL_IC = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';

  /* helix path that traces the logo's gold swirl, used as a draw-on mask */
  function swirlPath() {
    const pts = [];
    const turns = 3.7, n = 160;
    for (let i = 0; i <= n; i++) {
      const u = i / n, th = u * turns * Math.PI * 2;
      const rx = 19 + 3 * Math.sin(u * Math.PI);
      pts.push([291 + rx * Math.cos(th + 0.6), 11 + 41 * u + 5.2 * Math.sin(th + 0.6)]);
    }
    return 'M' + pts.map(p => p[0].toFixed(2) + ',' + p[1].toFixed(2)).join('L');
  }
  function logoSVG(idp) {
    const p = L.paths;
    return '<svg viewBox="0 0 320 145"><defs><mask id="' + idp + '-m" maskUnits="userSpaceOnUse" x="240" y="-10" width="100" height="80">' +
      '<path class="swirl-draw" d="' + swirlPath() + '" fill="none" stroke="#fff" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/></mask></defs>' +
      '<path class="lg lg-m" fill="' + L.navy + '" d="' + p.m + '"/><path class="lg lg-o" fill="' + L.navy + '" d="' + p.o + '"/>' +
      '<path class="lg lg-n" fill="' + L.gold + '" d="' + p.n + '"/><path class="lg lg-i" fill="' + L.navy + '" d="' + p.i + '"/>' +
      '<g mask="url(#' + idp + '-m)"><path class="lg-swirl" fill="' + L.gold + '" d="' + p.swirl + '"/></g></svg>';
  }
  function drawSwirl(root, t, dur) {
    const path = $('.swirl-draw', root);
    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    tl.fromTo(path, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: dur, ease: 'power2.inOut' }, t);
  }

  function makeBrowser(parent, path) {
    const b = el('div', 'browser', '<div class="bw-bar"><span class="bw-dot r"></span><span class="bw-dot y"></span><span class="bw-dot g"></span>' +
      '<div class="bw-url">' + LOCK + '<span>tajiklaw.ai</span><span class="dim">' + path + '</span></div></div>' +
      '<div class="bw-view"><div class="moni" data-theme="light"></div></div>', parent);
    return { el: b, moni: $('.moni', b) };
  }

  function fakeInput(form) {
    const ta = $('textarea', form);
    if (ta) ta.style.visibility = 'hidden';
    form.style.position = 'relative';
    const f = el('div', 'fake-input', '<span class="fi-line"><span class="ph">Ask me...</span><span class="typed"></span><span class="caret"></span></span>', form);
    return { ph: $('.ph', f), typed: $('.typed', f), caret: $('.caret', f), box: f, line: $('.fi-line', f) };
  }

  function genCardHTML(label) {
    return '<div class="msg msg-ai gen-indicator"><div class="gen-card"><div class="gen-progress"><div class="gen-progress-fill"></div></div>' +
      '<div class="gen-body"><div class="gen-wave">' + '<span></span>'.repeat(7) + '</div><div class="gen-info"><span class="gen-label">' + label +
      '</span><span class="gen-time">0s</span></div></div><div class="gen-footer"><button class="gen-stop-btn">' + STOP + ' Stop</button></div></div></div>';
  }
  function animateGen(root, t0, t1) {
    const bars = $$('.gen-wave span', root), time = $('.gen-time', root), fill = $('.gen-progress-fill', root);
    const delays = [0, .1, .2, .3, .4, .3, .2];
    const st = { t: 0 };
    const write = function () {
      bars.forEach(function (b, i) {
        const v = 0.5 - 0.5 * Math.cos((st.t - delays[i]) / 1.2 * Math.PI * 2);
        b.style.height = (6 + 14 * v) + 'px'; b.style.opacity = (0.4 + 0.6 * v).toFixed(3);
      });
      time.textContent = Math.max(0, Math.floor(st.t)) + 's';
      fill.style.width = (8 + 64 * (1 - Math.exp(-st.t / 2.2))).toFixed(2) + '%';
    };
    write();
    tl.to(st, { t: t1 - t0, duration: t1 - t0, ease: 'none', onUpdate: write }, t0);
  }

  /* boolean class/attr switch that survives seeking in both directions */
  function toggleAt(t, fnOn, fnOff) {
    const st = { v: 0 };
    tl.to(st, { v: 1, duration: 0.001, ease: 'none', onUpdate: function () { if (st.v > 0.5) fnOn(); else fnOff(); } }, t);
  }

  function callout(parent, x, y, kicker, html, extra) {
    const c = el('div', 'callout', '<span class="kicker">' + kicker + '</span><div class="display">' + html + '</div>' + (extra || ''), parent);
    c.style.left = x + 'px'; c.style.top = y + 'px';
    return c;
  }
  function calloutIn(c, t) {
    const k = $('.kicker', c), d = $('.display', c), rest = $$('.lede, .cite-chip, .file-out', c);
    tl.fromTo(k, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, t);
    FX.waterfall(tl, FX.words(d), t + 0.08, { stagger: 0.05, y: 40, blur: 8, dur: 0.7 });
    if (rest.length) tl.fromTo(rest, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.12 }, t + 0.45);
  }
  function calloutOut(c, t) {
    tl.to(c, { opacity: 0, y: -24, filter: 'blur(6px)', duration: 0.4, ease: 'power2.in' }, t);
  }

  /* ======================= 1 · HOOK ======================= */
  const fragSpecs = [];
  (function planFragments() {
    const r = rng(14);
    D.hookFragments.forEach(function (f, i) {
      const ang = i * 2.39996 + 0.4;
      const rad = 330 + r() * 640;
      fragSpecs.push({ text: f[0], cls: f[1], x: Math.cos(ang) * rad * 1.5, y: Math.sin(ang) * rad * 0.74,
        z: -1700 + r() * 1650, size: 24 + r() * 26, op: 0.16 + r() * 0.26 });
    });
  })();
  function buildField(world) {
    return fragSpecs.map(function (s) {
      const e = el('div', 'frag ' + s.cls, s.text, world);
      e.style.fontSize = s.size.toFixed(1) + 'px';
      return { e: e, s: s };
    });
  }
  function fieldAt(items, t) {
    items.forEach(function (it) {
      const s = it.s;
      const blur = Math.min(5, Math.abs(s.z + 350) / 260);
      tl.set(it.e, { x: s.x, y: s.y, z: s.z, xPercent: -50, yPercent: -50, opacity: s.op, filter: 'blur(' + blur.toFixed(2) + 'px)' }, t);
    });
  }

  function buildS1() {
    const items = buildField($('#s1World'));
    fieldAt(items, 0);
    items.forEach(function (it) {
      const s = it.s;
      tl.to(it.e, { z: s.z + 560, duration: 6.4, ease: 'none' }, 0);
      tl.to(it.e, { z: s.z + 3000, opacity: 0, duration: 1.5, ease: 'power3.in' }, 6.5);
    });
    const w1 = FX.words($('#hookL1')), w2 = FX.words($('#hookL2'));
    tl.set(w1.concat(w2), { opacity: 0 }, 0);
    FX.waterfall(tl, w1, 0.45, { stagger: 0.075, y: 54, blur: 12, dur: 0.85 });
    FX.waterfall(tl, w2, 2.6, { stagger: 0.075, y: 54, blur: 12, dur: 0.85 });
    // "no one." settles a beat later — stillness before the turn
    const em = $('#hookL2 em');
    tl.fromTo(em, { color: '#63636e' }, { color: '#c18d48', duration: 0.6, ease: 'power2.out' }, 3.9);
    tl.fromTo('#hookVeil', { opacity: 0.9 }, { opacity: 0.9 }, 0);
    // exit: push through the type (Z forward) into the logo
    tl.to('#hook', { scale: 1.6, opacity: 0, filter: 'blur(16px)', duration: 1.25, ease: 'power4.in' }, 6.75);
    tl.to('#hookVeil', { opacity: 0, duration: 1.0, ease: 'power2.in' }, 6.9);
    S('air-woosh-quick', 0.35, 0.5); S('sparkle-touch', 3.85, 0.35); S('whoosh-fast', 6.9, 0.8);
  }

  /* ======================= 2 · LOGO ======================= */
  let headerLogoFrame = null;   // filled by S3 so the logo lands exactly on the site header
  function buildS2() {
    const wrap = $('#logoWrap');
    wrap.innerHTML = logoSVG('lg2');
    const letters = $$('.lg', wrap);
    // continue the Z push: grow while arriving (same scale sign as the hook's exit)
    tl.fromTo(wrap, { scale: 0.78, x: 88, y: 40 }, { scale: 1, x: 0, y: 0, duration: 1.3, ease: 'power3.out' }, 8.0);
    tl.fromTo(letters, { opacity: 0, y: 26, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out', stagger: 0.07 }, 8.0);
    drawSwirl(wrap, 8.35, 1.15);
    tl.fromTo('#tagRule', { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power3.inOut' }, 9.0);
    FX.waterfall(tl, FX.words($('#tagline')), 9.15, { stagger: 0.06, y: 30, blur: 8, dur: 0.7 });
    tl.to(['#tagline', '#tagRule'], { opacity: 0, y: -14, duration: 0.35, ease: 'power2.in' }, 10.75);
    S('shimmer-sparkle-sweep', 8.3, 0.55); S('ui-confirm-tone', 9.2, 0.25);
    return function flyToHeader() {
      const h = headerLogoFrame;
      const sc = h.w / 800;
      tl.to(wrap, { x: h.x - 560, y: h.y - 300, scale: sc, duration: 0.95, ease: 'power3.inOut' }, 11.05);
      S('swoosh-quick', 11.15, 0.6);
    };
  }

  /* ======================= 3 · ASK ======================= */
  function buildS3() {
    const cam = $('#s3Cam'), over = $('#s3Over');
    const B = makeBrowser(cam, '/trial/en/');
    const m = B.moni;
    m.innerHTML = F.header + F.sbToggle + '<main class="main main-home">' + F.welcome + '</main>' +
      '<div class="chat-layer"><div class="chat-scroll"><div class="chat-area" style="display:flex"></div></div></div>' +
      '<div class="dock">' + F.modeBarChat + F.inputWrapChat + F.uploadNoticeChat + F.footerBottom + '</div>';
    // the live English hero reads "Need lawyer?" — shown here with the article restored
    $$('.welcome-title', m).forEach(function (t) { t.innerHTML = t.innerHTML.replace('Need lawyer?', 'Need a lawyer?'); });
    const welcome = $('.welcome', m), wTitle = $('.welcome-title', m), wSub = $('.welcome-sub', m), wModes = $('.mode-bar', welcome);
    const wInput = $('.input-wrap.centered', m), wForm = $('.input-form', wInput), wSend = $('.send-btn', wInput);
    const wNotice = $$('.upload-notice, .disclaimer-text', welcome);
    const dock = $('.dock', m), dForm = $('.dock .input-form', m);
    const chat = $('.chat-area', m), scroll = $('.chat-scroll', m);
    const hdrBits = $$('.site-nav .nav-link, .header-actions > *', m), sbT = $('.sb-toggle', m), hdrLogo = $('.logo-img.light-logo', m);
    wSend.classList.remove('on'); wSend.setAttribute('disabled', '');
    const fi = fakeInput(wForm); fakeInput(dForm);

    // chat content: question, thinking card, Moní's real answer (trimmed to fit the frame)
    chat.innerHTML = '<div class="msg msg-user"><div class="msg-content">' + D.ask.question + '</div></div>' + genCardHTML('Moní is thinking') +
      '<div class="msg msg-ai answer">' + F.qa[1].html + '</div>';
    const uMsg = $('.msg-user', chat), gen = $('.gen-indicator', chat), ans = $('.answer', chat);
    const content = $('.msg-content', ans);
    $$('p', content).forEach(function (p) {
      const s = p.querySelector('strong');
      const k = s ? s.textContent.trim() : '';
      if (/^(3|4|5|6)\.|^Summary/.test(k)) p.remove();
    });
    const lead = $('p strong', content);
    lead.classList.add('mark-hl');
    const hl = el('span', 'hl-bar', null, lead);
    const srcP = $$('p', content).find(function (p) { return /Sources/.test(p.textContent); });
    const btns = $('.msg-btns', ans);
    gen.style.position = 'absolute'; gen.style.left = '40px';   // overlay the answer's slot while thinking

    // ---- measurements (browser-space, untransformed) ----
    const R = function (e) { return FX.measure(e, B.el); };
    const rLogo = R(hdrLogo), rForm = R(wForm), rSend = R(wSend), rDForm = R(dForm);
    const rU = R(uMsg), rAns = R(ans), rLead = R(lead), rSrc = R(srcP), rList = R($('ul', content));
    gen.style.top = (rAns.y - R(chat).y + 32) + 'px';

    // ---- camera: starts full-bleed (site == frame), pulls back to reveal the browser ----
    const camS = FX.camera(cam, { fx: 640, fy: 400, s: 1.5 });
    const toFrame = function (r, st) { return { x: 960 + (r.x - st.fx) * st.s, y: 540 + (r.y - st.fy) * st.s, w: r.w * st.s }; };
    headerLogoFrame = toFrame(rLogo, { fx: 640, fy: 400, s: 1.5 });
    camS.set(tl, 12.0, { fx: 640, fy: 400, s: 1.5 });

    // page assembles around the landed logo
    tl.set(hdrLogo, { opacity: 0 }, 0); tl.set(hdrLogo, { opacity: 1 }, 12.0);
    tl.fromTo(hdrBits, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.05 }, 12.0);
    tl.fromTo(sbT, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 12.2);
    FX.waterfall(tl, FX.words(wTitle), 12.05, { stagger: 0.05, y: 34, blur: 8, dur: 0.7 });
    tl.fromTo([wSub, wModes, wInput].concat(wNotice), { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08 }, 12.35);
    tl.set([dock, uMsg, ans, gen, btns], { opacity: 0 }, 0);

    camS.to(tl, 13.0, 1.3, { fx: 640, fy: 390, s: 1.2 }, 'power3.inOut');                       // reveal the browser
    camS.to(tl, 14.4, 3.0, { fx: 640, fy: rForm.cy - 20, s: 1.38 }, 'sine.inOut');               // drift toward the input

    // cursor: enters from below, focuses the input, types, sends
    const cur = FX.cursor(B.el, 64);
    cur.place(tl, 13.6, rForm.x + 260, 900);
    cur.move(tl, 13.7, 0.75, rForm.x + 230, rForm.cy + 6, 'power3.out');
    cur.ringAt(tl, 14.5, rForm.x + 230, rForm.cy + 6);
    cur.click(tl, 14.5);
    toggleAt(14.55, function () { wForm.classList.add('focus'); }, function () { wForm.classList.remove('focus'); });
    tl.set(fi.ph, { opacity: 1 }, 0); tl.set(fi.ph, { opacity: 0 }, 14.62);
    tl.set(fi.caret, { opacity: 0 }, 0); tl.set(fi.caret, { opacity: 1 }, 14.6);
    cur.move(tl, 14.75, 0.6, rForm.x + 300, rForm.b + 70, 'power2.out');                         // drift aside while typing
    FX.type(tl, fi.typed, D.ask.question, 14.7, 2.45, fi);
    toggleAt(14.75, function () { wSend.classList.add('on'); wSend.removeAttribute('disabled'); }, function () { wSend.classList.remove('on'); wSend.setAttribute('disabled', ''); });
    S('typewriter-digital', 14.7, 0.35); S('typewriter-digital', 15.95, 0.3); S('ui-click-tone', 14.5, 0.6);
    cur.move(tl, 17.2, 0.45, rSend.cx, rSend.cy, 'power3.inOut');
    cur.ringAt(tl, 17.7, rSend.cx, rSend.cy);
    cur.click(tl, 17.7);
    tl.to(wSend, { scale: 0.88, duration: 0.1, ease: 'power2.in' }, 17.7); tl.to(wSend, { scale: 1, duration: 0.25, ease: 'back.out(1.6)' }, 17.8);
    S('ui-click-tone', 17.7, 0.7); S('swoosh-quick', 17.85, 0.4);

    // send → welcome hero lifts away, input docks at the bottom, the question bubble lands
    tl.to([wTitle, wSub, wModes].concat(wNotice), { opacity: 0, y: -40, filter: 'blur(6px)', duration: 0.4, ease: 'power2.in', stagger: 0.03 }, 17.82);
    tl.to(wInput, { y: rDForm.y - rForm.y, duration: 0.6, ease: 'power3.inOut' }, 17.85);
    tl.set([fi.typed, fi.caret], { opacity: 1 }, 14.6); tl.set([fi.typed, fi.caret], { opacity: 0 }, 17.84);   // the field clears on send
    tl.set(fi.ph, { opacity: 1 }, 17.84);
    toggleAt(17.84, function () { fi.line.style.visibility = 'hidden'; fi.line.style.transform = 'none'; fi.line.style.visibility = 'visible'; }, function () {});
    tl.to(wInput, { opacity: 0, duration: 0.01 }, 18.45); tl.set(dock, { opacity: 1 }, 18.45);
    tl.fromTo(uMsg, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, 18.05);
    cur.move(tl, 18.0, 0.7, rSend.cx + 260, 1000, 'power2.in');                                   // cursor leaves the frame
    S('ui-message-pop', 18.1, 0.45);

    // thinking
    tl.fromTo(gen, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' }, 18.45);
    animateGen(gen, 18.45, 19.9);
    tl.to(gen, { opacity: 0, duration: 0.2 }, 19.75);
    camS.to(tl, 18.1, 1.4, { fx: 640, fy: 330, s: 1.45 }, 'power3.inOut');
    S('data-compute', 18.5, 0.25);

    // Moní's answer streams in (real output, captured from tajiklaw.ai/trial)
    tl.set(ans, { opacity: 1 }, 19.85);
    const stream = FX.stream(tl, content, 19.85, 4.6, { lead: 7 });
    tl.set(btns, { opacity: 1 }, 24.4);
    tl.fromTo(hl, { scaleX: 0 }, { scaleX: 1, duration: 0.55, ease: 'power2.inOut' }, 20.75);
    S('sparkle-touch', 20.8, 0.35);

    // camera slides the chat to the right half; editorial caption takes the left
    camS.to(tl, 20.2, 1.1, { fx: 332, fy: 352, s: 1.3 }, 'power3.inOut');
    const visTop = 70, visBottom = 720 - 190;                                                     // visible chat window in site px
    const sListEnd = Math.max(0, rList.b - visBottom + 10);
    const sSrc = Math.max(0, rSrc.y - visTop - 150);
    tl.fromTo(scroll, { y: 0 }, { y: -sListEnd, duration: 1.9, ease: 'sine.inOut' }, 21.6);
    tl.to(scroll, { y: -sSrc, duration: 1.2, ease: 'power3.inOut' }, 23.55);

    const c1 = callout(over, 120, 290, 'Legal Q&amp;A', 'Answers that cite <em>the law.</em>',
      '<div class="lede">Every claim points to the exact article — here, the Labour Code.</div><span class="cite-chip"><i></i>ТК РТ, ст. 28</span>');
    calloutIn(c1, 20.9);
    calloutOut(c1, 23.35);
    const c2 = callout(over, 120, 300, 'Sources', 'Built on <em>current</em> legislation.',
      '<div class="lede">Labour Code of the Republic of Tajikistan, as amended 17.06.2026.</div>');
    calloutIn(c2, 23.75);
    tl.to(over, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 25.55);
    S('ui-popup-dry', 20.95, 0.4); S('ui-popup-dry', 23.8, 0.4);

    // exit: whip LEFT (the film's current) into the languages scene
    camS.to(tl, 25.6, 0.6, { fx: 332 + 1700, fy: 352, s: 1.3 }, 'power4.in');
    S('whoosh-fast', 25.6, 0.7);
    return { stream: stream };
  }

  /* ======================= 4 · LANGUAGES ======================= */
  function buildS4() {
    const cam = $('#s4Cam'), cards = $('#langCards');
    const xs = [90, 680, 1270];
    const built = D.langs.map(function (lg, i) {
      const c = el('div', 'lang-card', '<div class="lang-tag"><b>' + lg.tag + '</b>' + lg.name + '</div>' +
        (lg.voice ? '<div class="voice-pill"><span class="mic"><svg viewBox="0 0 24 24" fill="none" stroke="#1a1a1f" stroke-width="2.2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg></span><span class="bars">' + '<span></span>'.repeat(18) + '</span></div>' : '') +
        '<div class="msg msg-user"><div class="msg-content"><span class="q"></span></div></div>' +
        '<div class="msg msg-ai"><div class="msg-content">' + lg.a + '</div></div>', cards);
      c.style.left = xs[i] + 'px';
      return { c: c, q: $('.q', c), a: $('.msg-ai .msg-content', c), u: $('.msg-user', c), v: $('.voice-pill', c), lg: lg };
    });
    const camS = FX.camera(cam, { fx: 960, fy: 540, s: 1 });
    camS.set(tl, 26.0, { fx: 960 - 760, fy: 540, s: 1 });
    camS.to(tl, 26.0, 0.75, { fx: 960, fy: 540, s: 1 }, 'power4.out');                              // arrive from the right
    FX.waterfall(tl, FX.words($('#langHead')), 26.15, { stagger: 0.06, y: 40, blur: 8, dur: 0.7 });
    const starts = [26.55, 27.55, 28.55];
    built.forEach(function (b, i) {
      const t = starts[i];
      tl.fromTo(b.c, { opacity: 0, y: 70, rotateZ: i === 1 ? 0 : (i === 0 ? -1.2 : 1.2) }, { opacity: 1, y: 0, rotateZ: 0, duration: 0.7, ease: 'power3.out' }, t);
      if (b.v) {
        tl.set(b.u, { opacity: 0 }, 0);
        const bars = $$('.bars span', b.v), st = { k: 0 };
        const wr = function () {
          bars.forEach(function (s, j) {
            const amp = Math.max(0, Math.sin(st.k * 7.3 + j * 0.9) * 0.55 + Math.sin(st.k * 11.1 + j * 1.7) * 0.45);
            const env = Math.min(1, st.k / 0.3) * Math.min(1, Math.max(0, (1.3 - st.k) / 0.3));
            s.style.height = (6 + 18 * amp * env).toFixed(1) + 'px';
          });
        };
        wr();
        tl.to(st, { k: 1.3, duration: 1.3, ease: 'none', onUpdate: wr }, t + 0.5);
        tl.to(b.v, { opacity: 0.45, duration: 0.3 }, t + 1.8);
        tl.fromTo(b.u, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, t + 1.75);
        b.q.textContent = b.lg.q;
        FX.stream(tl, b.q, t + 1.75, 0.5, { lead: 3 });
        FX.stream(tl, b.a, t + 2.35, 1.0, { lead: 4 });
        S('ui-notify-tech', t + 0.5, 0.3); S('ui-message-pop', t + 2.35, 0.3);
      } else {
        FX.type(tl, b.q, b.lg.q, t + 0.35, 0.8);
        FX.stream(tl, b.a, t + 1.3, 1.0, { lead: 4 });
        S('typewriter-digital', t + 0.35, 0.18); S('ui-message-pop', t + 1.3, 0.3);
      }
    });
    tl.fromTo('#langFoot', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 31.4);
    camS.to(tl, 31.0, 2.6, { fx: 960, fy: 556, s: 1.035 }, 'sine.inOut');
    camS.to(tl, 33.62, 0.58, { fx: 960 + 1900, fy: 556, s: 1.035 }, 'power4.in');                     // exit LEFT
    S('whoosh-fast', 33.62, 0.7);
  }

  /* ======================= 5 · REVIEW ======================= */
  function buildS5() {
    const cam = $('#s5Cam'), over = $('#s5Over');
    const camS = FX.camera(cam, { fx: 960, fy: 540, s: 1 });
    const paraIdx = function (id) { return D.lease.paras.findIndex(function (p) { return p.id === id; }); };
    const findings = D.findings.slice().sort(function (a, b) { return paraIdx(a.para) - paraIdx(b.para); });
    // the lease, on the site's own document-viewer sheet
    const paper = el('div', 'rv-paper moni free', '<div class="dv-sheet"><div class="dv-para dv-p-title">' + D.lease.title + '</div>' +
      D.lease.paras.map(function (p) {
        return '<div class="dv-para ' + (p.cls || '') + (p.id ? ' clause" data-c="' + p.id : '') + '">' + (p.id ? '<span class="flag"></span>' : '') + '<span class="txt">' + p.t + '</span></div>';
      }).join('') + '</div>', cam);
    const scan = el('div', 'scanline', null, $('.dv-sheet', paper));
    scan.style.top = '0px';
    // the review card — markup and classes from the site's upload.js renderReviewCard()
    const rv = el('div', 'rv-panel moni free', '<div class="msg msg-ai"><div class="doc-review-card"><div class="dr-head"><span class="dr-ic">' + DOC_IC + '</span>' +
      '<div class="dr-ttl"><b>Document review: Commercial Lease Agreement</b><div class="dr-meta"><span class="dr-risk dr-risk-high">High risk</span><span class="dr-type">Lease</span></div></div></div>' +
      '<div class="dr-summary">5 clauses conflict with the Civil Code of the Republic of Tajikistan or shift risk onto the tenant.</div>' +
      '<div class="dr-findings">' + findings.map(function (f, i) {
        return '<div class="dr-finding' + (f.sev === 'high' ? ' dr-sev-high' : '') + '" data-f="' + i + '"><div class="dr-f-head"><span class="dr-cat ' + (f.cat === 'red' ? 'dr-cat-red' : 'dr-cat-amber') + '">' + f.catLabel +
          '</span><span class="dr-f-clause">' + f.clause + '</span></div><div class="dr-f-issue">' + f.issue + '</div><div class="dr-f-law">' + f.law + '<span class="dr-v ok">verified</span></div></div>';
      }).join('') + '</div><div class="dr-fixbar"><button type="button" class="dr-fix-btn">Apply fixes and download</button>' +
      '<label class="dr-fix-opt"><input type="checkbox" class="dr-fix-track" checked><span>track changes (see what was edited)</span></label></div></div></div>', cam);
    const fnd = $$('.dr-finding', rv), head = $('.dr-head', rv), summ = $('.dr-summary', rv), fixbar = $('.dr-fixbar', rv), fixBtn = $('.dr-fix-btn', rv);
    // counter + status
    const counter = el('div', 'rv-counter', '<span class="num">0</span><span class="lbl">issues found</span>', cam);
    const num = $('.num', counter);
    const status = el('div', 'rv-status', '<span class="spin"></span><span>Analyzing the document under the laws of Tajikistan…</span>', cam);
    // upload strip (site attach chip + input), shown before the review exists
    const up = el('div', 'moni free', '<div class="input-wrap" style="width:760px"><div class="attach-chip"><span class="attach-ic">' + DOC_IC + '</span><span class="attach-text"><span class="attach-name">' + D.lease.file +
      '</span><span class="attach-sub">Attached · will be analyzed on send</span></span></div><div class="input-form"><textarea class="input-textarea" rows="1"></textarea><div class="input-btns-right">' +
      '<button class="send-btn on"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg></button></div></div></div>', cam);
    up.style.position = 'absolute'; up.style.left = '1000px'; up.style.top = '640px';
    const upFI = fakeInput($('.input-form', up));
    upFI.ph.textContent = 'Ask about this document, or just press send…';
    const upSend = $('.send-btn', up);
    const c0 = callout(cam, 1000, 230, 'Contract review', 'Upload a <em>contract.</em>', '<div class="lede">Moní reads it against the Civil Code and flags what could cost you.</div>');
    // connectors
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'connector'); svg.setAttribute('width', '1920'); svg.setAttribute('height', '1080');
    cam.appendChild(svg);

    // measure
    const R = function (e) { return FX.measure(e, cam); };
    const clauses = {};
    $$('.clause', paper).forEach(function (c) { clauses[c.dataset.c] = { el: c, r: R(c), flag: $('.flag', c), txt: $('.txt', c) }; });
    findings.forEach(function (f) { clauses[f.para].flag.classList.add(f.cat); });
    const sheet = $('.dv-sheet', paper), rSheet = R(sheet);
    const rF = fnd.map(R), rFix = R(fixBtn), rSend = R(upSend);
    const card = $('.doc-review-card', rv), rCard = R(card), rSumm = R(summ), Z = 1.15;
    const clipAt = function (bottomY) { return 'inset(0px 0px ' + Math.max(0, (rCard.b - bottomY) / Z).toFixed(1) + 'px 0px round 16px)'; };

    // phase A — the document arrives
    tl.set([rv, counter, status, svg], { opacity: 0 }, 0);
    camS.set(tl, 34.0, { fx: 960 - 760, fy: 540, s: 1 });
    camS.to(tl, 34.0, 0.75, { fx: 960, fy: 540, s: 1 }, 'power4.out');
    tl.fromTo(paper, { x: 900, y: 40, rotateZ: 4, opacity: 0 }, { x: 0, y: 0, rotateZ: -1.4, opacity: 1, duration: 1.1, ease: 'power3.out' }, 34.15);
    tl.to(paper, { rotateZ: 0, duration: 0.8, ease: 'power2.inOut' }, 35.25);
    calloutIn(c0, 34.5);
    tl.fromTo(up, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 35.4);
    S('paper-slide', 34.2, 0.8); S('ui-popup-dry', 35.45, 0.35);
    const cur = FX.cursor(cam, 84);
    cur.place(tl, 35.6, rSend.cx + 120, 1250);
    cur.move(tl, 35.7, 0.8, rSend.cx, rSend.cy, 'power3.out');
    cur.ringAt(tl, 36.6, rSend.cx, rSend.cy); cur.click(tl, 36.6);
    tl.to(upSend, { scale: 0.88, duration: 0.1 }, 36.6); tl.to(upSend, { scale: 1, duration: 0.25, ease: 'back.out(1.6)' }, 36.7);
    S('ui-click-tone', 36.6, 0.7);
    tl.to([c0, up], { opacity: 0, y: -30, filter: 'blur(6px)', duration: 0.45, ease: 'power2.in', stagger: 0.05 }, 36.8);
    cur.move(tl, 36.9, 0.6, rSend.cx + 300, 1250, 'power2.in');
    tl.fromTo(status, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, 37.0);
    const spin = $('.spin', status);
    tl.fromTo(spin, { rotation: 0 }, { rotation: 720, duration: 1.6, ease: 'none' }, 37.0);
    S('data-scan', 37.1, 0.45);

    // phase B — the drop (music returns at 38.5): scan + findings
    tl.fromTo(rv, { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' }, 37.98);
    tl.set(fnd, { opacity: 0 }, 0);
    tl.set(card, { clipPath: clipAt(rSumm.b + 8) }, 0);
    tl.fromTo([head, summ], { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.1 }, 38.03);
    tl.set(fixbar, { opacity: 0 }, 0);
    tl.to(status, { opacity: 0, duration: 0.3 }, 37.95);
    tl.fromTo(counter, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, 38.03);
    tl.set(svg, { opacity: 1 }, 38.0);
    S('bass-hit-futuristic', 38.0, 0.9);
    const scanT0 = 38.08, scanDur = 4.6, sheetH = rSheet.h;
    tl.fromTo(scan, { top: 40, opacity: 0 }, { top: sheetH - 30, opacity: 1, duration: scanDur, ease: 'none' }, scanT0);
    tl.to(scan, { opacity: 0, duration: 0.3 }, scanT0 + scanDur);
    // order findings by where the scan meets their clause
    const order = findings.map(function (f, i) { return { f: f, i: i, c: clauses[f.para] }; })
      .sort(function (a, b) { return a.c.r.y - b.c.r.y; });
    const cnt = { n: 0 };
    order.forEach(function (o, k) {
      const t = scanT0 + scanDur * (o.c.r.y - rSheet.y + 12) / sheetH;
      tl.fromTo(o.c.flag, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.35, ease: 'power3.out' }, t);
      const ff = fnd[o.i];
      tl.fromTo(ff, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.45, ease: 'power3.out' }, t + 0.12);
      tl.to(card, { clipPath: clipAt(rF[o.i].b + 10), duration: 0.4, ease: 'power3.out' }, t + 0.06);
      // connector: clause → finding
      const a = o.c.r, b = rF[o.i];
      const x1 = a.r + 6, y1 = a.cy, x2 = b.x - 8, y2 = b.y + 22;
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', 'M' + x1 + ',' + y1 + ' C' + (x1 + 70) + ',' + y1 + ' ' + (x2 - 70) + ',' + y2 + ' ' + x2 + ',' + y2);
      p.setAttribute('fill', 'none'); p.setAttribute('stroke', o.f.cat === 'red' ? '#e05252' : '#c18d48'); p.setAttribute('stroke-width', '2');
      p.setAttribute('stroke-opacity', '0.55');
      svg.appendChild(p);
      const len = Math.hypot(x2 - x1, y2 - y1) * 1.25;
      p.style.strokeDasharray = len;
      tl.fromTo(p, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.45, ease: 'power2.out' }, t + 0.05);
      tl.to(cnt, { n: k + 1, duration: 0.25, ease: 'none', onUpdate: function () { num.textContent = Math.round(cnt.n); } }, t + 0.1);
      S(o.f.cat === 'red' ? 'ui-select-click' : 'switch-tap', t + 0.1, 0.45);
    });
    tl.fromTo(fixbar, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 43.1);
    tl.to(card, { clipPath: clipAt(rCard.b + 2), duration: 0.5, ease: 'power3.out' }, 43.05);
    tl.to(svg, { opacity: 0, duration: 0.5 }, 45.6);

    // phase C — apply fixes: redlines appear on the document (tracked changes)
    const cur2 = FX.cursor(cam, 84);
    cur2.place(tl, 44.0, rFix.cx + 160, 1250);
    cur2.move(tl, 44.1, 0.8, rFix.cx, rFix.cy, 'power3.out');
    cur2.ringAt(tl, 45.1, rFix.cx, rFix.cy); cur2.click(tl, 45.1);
    tl.to(fixBtn, { scale: 0.95, duration: 0.1 }, 45.1); tl.to(fixBtn, { scale: 1, duration: 0.25, ease: 'back.out(1.6)' }, 45.2);
    S('ui-click-tone', 45.1, 0.7); S('write-fast', 45.5, 0.4);
    cur2.move(tl, 45.4, 0.6, rFix.cx + 400, 1250, 'power2.in');
    tl.to(rv, { opacity: 0, x: 80, duration: 0.5, ease: 'power2.in' }, 45.5);
    tl.to(counter, { opacity: 0, duration: 0.3 }, 45.5);
    camS.to(tl, 45.55, 1.2, { fx: rSheet.cx, fy: rSheet.cy + 10, s: 1.4 }, 'power3.inOut');
    // build redline spans per clause
    const redStart = 46.6;
    order.forEach(function (o, k) {
      const txt = o.c.txt, f = o.f, html = txt.innerHTML;
      const at = html.indexOf(f.del);
      if (at < 0) return;
      txt.innerHTML = html.slice(0, at) + '<span class="del">' + f.del + '</span> <span class="ins"></span>' + html.slice(at + f.del.length);
      const del = $('.del', txt), ins = $('.ins', txt);
      const t = redStart + k * 0.62;
      tl.set(del, { textDecorationColor: 'rgba(224,82,82,0)', color: '#1a1a1a' }, 0);
      tl.to(del, { textDecorationColor: 'rgba(224,82,82,1)', color: '#9a5050', duration: 0.3, ease: 'power2.out' }, t);
      tl.set(ins, { display: 'none' }, 0);
      tl.set(ins, { display: 'inline' }, t + 0.18);
      FX.type(tl, ins, f.ins, t + 0.18, 0.55);
      tl.to(o.c.flag, { opacity: 0.35, duration: 0.4 }, t + 0.3);
      S('pen-click', 0, 0);
    });
    FX.cues = FX.cues.filter(function (c) { return c.name !== 'pen-click'; });
    order.forEach(function (o, k) { S('write-fast', redStart + k * 0.62 + 0.18, 0.28); });

    // phase D — corrected file + caption
    const c3 = callout(over, 1130, 300, 'Fixed', 'Corrections, <em>tracked.</em>',
      '<div class="lede">Every edit is visible in the .docx — formatting, stamps and layout stay intact.</div>' +
      '<div class="file-out" style="position:relative;margin-top:34px"><div class="ico">W</div><div><div class="nm">Commercial_Lease_14-26_fixed.docx</div><div class="sub"><b>5 edits applied</b> · tracked changes</div></div></div>');
    camS.to(tl, 50.2, 1.3, { fx: rSheet.r - 70, fy: rSheet.cy - 10, s: 1.12 }, 'power3.inOut');
    calloutIn(c3, 50.9);
    S('ui-success-soft', 51.4, 0.5);
    camS.to(tl, 52.6, 3.0, { fx: rSheet.r - 64, fy: rSheet.cy - 10, s: 1.15 }, 'sine.inOut');
    tl.to(over, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 55.55);
    camS.to(tl, 55.62, 0.58, { fx: rSheet.r - 64 + 1900, fy: rSheet.cy - 10, s: 1.15 }, 'power4.in');   // exit LEFT
    S('whoosh-fast', 55.62, 0.7);
  }

  /* ======================= 6 · DRAFTING ======================= */
  function buildS6() {
    const cam = $('#s6Cam'), over = $('#s6Over');
    const B = makeBrowser(cam, '/trial/en/');
    const m = B.moni;
    m.innerHTML = F.header + F.sbToggle +
      '<div class="chat-layer"><div class="chat-scroll"><div class="chat-area" style="display:flex"></div></div></div>' +
      '<div class="dock">' + F.modeBarChat + F.inputWrapChat + F.uploadNoticeChat + F.footerBottom + '</div>' +
      '<div class="dv-overlay film">' + F.docViewer + '</div>';
    const chat = $('.chat-area', m), dForm = $('.dock .input-form', m), dSend = $('.dock .send-btn', m);
    const fi = fakeInput(dForm);
    const aiHtml = F.draft[1].html;
    chat.innerHTML = '<div class="msg msg-user"><div class="msg-content">' + D.draftPrompt + '</div></div>' + genCardHTML('Moní is thinking') +
      '<div class="msg msg-ai drafted">' + aiHtml + '</div>';
    const uMsg = $('.msg-user', chat), gen = $('.gen-indicator', chat), ai = $('.drafted', chat);
    // English labels on the real draft message
    const intro = ai.querySelector('.msg-content > p, .msg-content') ;
    $$('*', ai).forEach(function (n) {
      if (n.children.length === 0 && n.textContent) {
        n.textContent = n.textContent
          .replace(/Составил проект договора \(([^)]+)\)\. Проверьте и заполните пометки «\[уточнить: …\]»\./, 'Drafted a contract (services). Review it and fill in the «[specify: …]» marks.')
          .replace(/Документ · нажмите, чтобы открыть/, 'Document · click to open')
          .replace(/Договор об оказании услуг № \[уточнить: номер договора\]/, D.draft.title);
      }
    });
    const card = $('.doc-card', ai) || ai;
    const gen2 = gen; gen2.style.position = 'absolute'; gen2.style.left = '40px';
    // doc viewer: replace body with the English rendering of Moní's draft
    const panel = $('.dv-panel', m), overlay = $('.dv-overlay', m);
        const title = $('.dv-title', panel); if (title) title.textContent = D.draft.title;
    const body = $('.dv-body', panel);
    body.innerHTML = '<div class="dv-sheet">' + D.draft.paras.map(function (p) { return '<div class="dv-para ' + (p.cls || '') + '">' + p.t + '</div>'; }).join('') + '</div>';
    const comments = $('.dv-comments', panel); if (comments) { const ct = $('.dv-comments-title', comments); if (ct) ct.textContent = 'Your comments (0)'; }
    const marks = $$('.ph-mark', panel);

    const R = function (e) { return FX.measure(e, B.el); };
    const rDForm = R(dForm), rSend = R(dSend), rAi = R(ai), rCard = R(card), rPanel = R(panel), rSheet = R($('.dv-sheet', panel));
    gen2.style.top = (rAi.y - R(chat).y + 32) + 'px';
    const rPrice = R($$('.dv-para', panel).find(function (p) { return /^3\.1\./.test(p.textContent); }));

    const camS = FX.camera(cam, { fx: 640, fy: 400, s: 1.2 });
    camS.set(tl, 56.0, { fx: 640 - 760, fy: 300, s: 1.0, ry: -14 });
    camS.to(tl, 56.0, 0.9, { fx: 640, fy: 300, s: 1.0, ry: 0 }, 'power4.out');
    tl.set([uMsg, gen2, ai, panel], { opacity: 0 }, 0);
    tl.set(panel, { x: 900 }, 0);

    const c0 = callout(over, 0, 0, 'Contract drafting', 'Need a contract? <em>Moní drafts it.</em>');
    c0.style.width = '1920px'; c0.style.textAlign = 'center'; c0.style.top = '70px';
    $('.display', c0).style.fontSize = '62px';
    calloutIn(c0, 56.2);
    tl.to(c0, { opacity: 0, y: -20, duration: 0.4, ease: 'power2.in' }, 58.2);

    const cur = FX.cursor(B.el, 64);
    cur.place(tl, 56.6, rDForm.x + 300, 980);
    cur.move(tl, 56.7, 0.7, rDForm.x + 240, rDForm.cy + 4, 'power3.out');
    cur.ringAt(tl, 57.4, rDForm.x + 240, rDForm.cy + 4); cur.click(tl, 57.4);
    toggleAt(57.45, function () { dForm.classList.add('focus'); }, function () { dForm.classList.remove('focus'); });
    tl.set(fi.ph, { opacity: 1 }, 0); tl.set(fi.ph, { opacity: 0 }, 57.5);
    tl.set(fi.caret, { opacity: 0 }, 0); tl.set(fi.caret, { opacity: 1 }, 57.5); tl.set(fi.caret, { opacity: 0 }, 59.9);
    cur.move(tl, 57.6, 0.5, rDForm.x + 320, rDForm.b + 60, 'power2.out');
    FX.type(tl, fi.typed, D.draftPrompt, 57.55, 1.9, fi);
    toggleAt(57.6, function () { dSend.classList.add('on'); }, function () { dSend.classList.remove('on'); });
    S('ui-click-tone', 57.4, 0.6); S('typewriter-digital', 57.55, 0.32);
    camS.to(tl, 58.2, 1.5, { fx: 640, fy: 520, s: 1.36 }, 'power3.inOut');
    cur.move(tl, 59.3, 0.4, rSend.cx, rSend.cy, 'power3.inOut');
    cur.ringAt(tl, 59.75, rSend.cx, rSend.cy); cur.click(tl, 59.75);
    S('ui-click-tone', 59.75, 0.7);
    tl.set(fi.typed, { opacity: 1 }, 0); tl.set(fi.typed, { opacity: 0 }, 59.85);
    toggleAt(59.85, function () { dSend.classList.remove('on'); dForm.classList.remove('focus'); }, function () { dSend.classList.add('on'); dForm.classList.add('focus'); });
    tl.fromTo(uMsg, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, 59.9);
    S('ui-message-pop', 59.95, 0.45);
    camS.to(tl, 59.9, 1.0, { fx: 640, fy: 300, s: 1.4 }, 'power3.inOut');
    tl.fromTo(gen2, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35 }, 60.2);
    animateGen(gen2, 60.2, 61.5);
    tl.to(gen2, { opacity: 0, duration: 0.2 }, 61.35);
    tl.fromTo(ai, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 61.45);
    if (card !== ai) tl.fromTo(card, { scale: 0.92, transformOrigin: '0 50%' }, { scale: 1, duration: 0.6, ease: 'back.out(1.7)' }, 61.6);
    S('chime-crystal', 61.6, 0.35);
    cur.move(tl, 61.8, 0.6, rCard.x + 120, rCard.cy, 'power3.out');
    cur.ringAt(tl, 62.5, rCard.x + 120, rCard.cy); cur.click(tl, 62.5);
    S('ui-click-tone', 62.5, 0.7); S('paper-page-turn', 62.6, 0.6);
    cur.move(tl, 62.7, 0.5, rCard.x + 160, 1000, 'power2.in');
    // doc viewer slides in
    tl.fromTo(overlay, { backgroundColor: 'rgba(0,0,0,0)' }, { backgroundColor: 'rgba(0,0,0,0.38)', duration: 0.45 }, 62.6);
    tl.to(panel, { opacity: 1, x: 0, duration: 0.7, ease: 'power4.out' }, 62.6);
    camS.to(tl, 62.6, 1.0, { fx: rPanel.cx - 260, fy: 380, s: 1.42 }, 'power3.inOut');
    // 1) caption first: whole sheet on the right half, message on the left
    const sheetBody = $('.dv-sheet', panel);
    const s1 = 1.3, fxA = rSheet.r - (1870 - 960) / s1;
    camS.to(tl, 63.65, 1.0, { fx: fxA, fy: rSheet.y + 330, s: s1 }, 'power3.inOut');
    const c1 = callout(over, 120, 300, 'Drafted in seconds', 'A complete <em>first draft.</em>',
      '<div class="lede">Real clauses for a real deal — the gaps you must fill are flagged in gold.</div>' +
      '<div class="file-out" style="position:relative;margin-top:34px"><div class="ico">W</div><div><div class="nm">Services_Agreement.docx</div><div class="sub">Ready to edit · download in one click</div></div></div>');
    const veil = el('div', 'layer', null, over);
    veil.style.background = 'linear-gradient(90deg, rgba(248,247,244,.98) 0%, rgba(248,247,244,.92) 38%, rgba(248,247,244,0) 47%)';
    over.insertBefore(veil, c1);
    tl.fromTo(veil, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 63.9);
    calloutIn(c1, 64.2);
    marks.forEach(function (mk, i) {
      tl.fromTo(mk, { boxShadow: '0 0 0 0px rgba(193,141,72,0)', backgroundColor: 'rgba(232,192,120,0)' },
        { boxShadow: '0 0 0 2px rgba(193,141,72,.55)', backgroundColor: 'rgba(232,192,120,.55)', duration: 0.35, ease: 'power2.out' }, 64.7 + i * 0.22);
    });
    S('ui-popup-dry', 64.25, 0.4); S('sparkle-touch', 64.8, 0.3); S('ui-success-soft', 65.3, 0.35);
    tl.to([c1, veil], { opacity: 0, x: -30, duration: 0.45, ease: 'power2.in' }, 66.75);
    // 2) detail: push into the page and scroll to the price clause
    camS.to(tl, 66.85, 1.2, { fx: rSheet.cx, fy: rSheet.y + 300, s: 1.8 }, 'power3.inOut');
    tl.fromTo(sheetBody, { y: 0 }, { y: -(rPrice.y - rSheet.y - 220), duration: 1.6, ease: 'power2.inOut' }, 67.3);
    S('paper-page-turn', 67.4, 0.4);
    // exit: rise (chapter boundary into Moní Pro)
    tl.to(over, { opacity: 0, duration: 0.3 }, 69.35);
    camS.to(tl, 69.45, 0.75, { fx: rSheet.cx, fy: rSheet.y + 300 + 1300, s: 1.8 }, 'power4.in');
    S('transition-tech-slide', 69.45, 0.6);
  }

  /* ======================= 7 · MONÍ PRO (night) ======================= */
  const ICONS = {
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    search: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h7"/><polyline points="14 2 14 8 20 8"/><circle cx="17" cy="16" r="3.2"/><line x1="19.4" y1="18.4" x2="22" y2="21"/>',
    doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M8 17l3-3 2 2 3-4"/>',
    calc: '<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="11" x2="9" y2="11"/><line x1="12" y1="11" x2="13" y2="11"/><line x1="16" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="9" y2="15"/><line x1="12" y1="15" x2="13" y2="15"/><line x1="16" y1="15" x2="16" y2="18"/>',
    globe: '<circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19"/><path d="M12 2.5c2.6 2.8 3.9 6 3.9 9.5S14.6 18.7 12 21.5C9.4 18.7 8.1 15.5 8.1 12S9.4 5.3 12 2.5z"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/><line x1="9" y1="7" x2="16" y2="7"/>'
  };
  function buildS7() {
    const grid = $('#capsGrid');
    const tiles = D.caps.map(function (c) {
      return el('div', 'cap', '<div class="shine"></div><div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + ICONS[c.ic] + '</svg></div><h3>' + c.h + '</h3><p>' + c.p + '</p>', grid);
    });
    tl.to('#bgNight', { opacity: 1, duration: 0.55, ease: 'power2.inOut' }, 69.6);
    const camS = FX.camera($('#s7Cam'), { fx: 960, fy: 540, s: 1 });
    camS.set(tl, 70.0, { fx: 960, fy: 540 - 420, s: 1 });
    camS.to(tl, 70.0, 0.8, { fx: 960, fy: 540, s: 1 }, 'power4.out');                               // rises in
    tl.fromTo('#capsKick', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5 }, 70.15);
    FX.waterfall(tl, FX.words($('#capsHead')), 70.25, { stagger: 0.07, y: 50, blur: 10, dur: 0.8 });
    tl.fromTo(tiles, { opacity: 0, y: 70, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out', stagger: 0.12 }, 71.3);
    tiles.forEach(function (t, i) {
      const strokes = $$('svg *', t);
      strokes.forEach(function (s) {
        const len = (s.getTotalLength ? s.getTotalLength() : 60) || 60;
        s.style.strokeDasharray = len;
        tl.fromTo(s, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' }, 71.5 + i * 0.12);
      });
      tl.fromTo($('.shine', t), { x: 0 }, { x: 760, duration: 0.9, ease: 'power2.inOut' }, 74.2 + i * 0.1);
      S('ui-popup-dry', 71.3 + i * 0.12, 0.22);
    });
    S('impact-zoom-quick', 70.05, 0.5); S('shimmer-sparkle-sweep', 74.2, 0.35);
    camS.to(tl, 72.0, 5.4, { fx: 960, fy: 552, s: 1.04 }, 'sine.inOut');
    tl.to('#bgNight', { opacity: 0, duration: 0.6, ease: 'power2.inOut' }, 77.55);
    tl.to('#s7Cam', { opacity: 0, filter: 'blur(8px)', duration: 0.45, ease: 'power2.in' }, 77.6);
    S('air-woosh-quick', 77.6, 0.5);
  }

  /* ======================= 8 · END CARD + LOOP ======================= */
  function buildS8() {
    const logo = $('#endLogo');
    logo.innerHTML = logoSVG('lg8');
    $('#qrSlot').innerHTML = window.MONI_QR;
    FX.waterfall(tl, $$('.lg', logo), 78.2, { stagger: 0.07, y: 30, blur: 6, dur: 0.75 });
    drawSwirl(logo, 78.5, 1.1);
    FX.waterfall(tl, FX.words($('#endHead')), 78.9, { stagger: 0.06, y: 40, blur: 8, dur: 0.75 });
    tl.fromTo('#endUrl', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 79.6);
    tl.fromTo('#qrCard', { opacity: 0, x: 80, rotateZ: 2 }, { opacity: 1, x: 0, rotateZ: 0, duration: 0.9, ease: 'power3.out' }, 78.6);
    tl.fromTo('#endMeta', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, 80.0);
    tl.fromTo('#confBadge', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, 80.2);
    S('shimmer-sparkle-sweep', 78.3, 0.5); S('chime-crystal', 79.6, 0.3);
    // gentle camera — the card holds for people to scan the QR code
    const camS = FX.camera($('#s8Cam'), { fx: 960, fy: 540, s: 1.03 });
    camS.set(tl, 78.0, { fx: 960, fy: 540, s: 1.03 });
    camS.to(tl, 78.0, 10.4, { fx: 960, fy: 540, s: 1.0 }, 'sine.inOut');
    // loop seam: the end card dissolves into the exact opening frame of the hook
    tl.to('#s8Cam', { opacity: 0, filter: 'blur(10px)', duration: 1.1, ease: 'power2.inOut' }, 88.4);
    const items = buildField($('#s8World'));
    fieldAt(items, 0);
    tl.set($$('.frag', $('#s8World')), { opacity: 0 }, 78.0);
    items.forEach(function (it) { tl.to(it.e, { opacity: it.s.op, duration: 1.2, ease: 'power1.inOut' }, 88.75); });
  }

  /* ======================= assemble ======================= */
  function build() {
    FX.flushInit(tl);
    buildS1();
    const fly = buildS2();
    buildS3();
    fly();
    buildS4();
    buildS5();
    buildS6();
    buildS7();
    buildS8();
    FX.flushInit(tl);
    tl.seek(0);
    window.__FILM_CUES = FX.cues.slice().sort(function (a, b) { return a.t - b.t; });
    return { timeline: tl };   // wrapped: a GSAP timeline is a thenable and would stall the promise
  }

  const faces = ['400 16px Nunito', '600 16px Nunito', '700 16px Nunito', '800 16px Nunito', 'italic 400 16px Nunito',
    '400 40px "Roboto Serif"', '500 40px "Roboto Serif"', 'italic 400 40px "Roboto Serif"', '400 16px Tinos', '700 16px Tinos'];
  /* index.html registers the timeline once this resolves (window.__timelines["main"]). */
  window.__buildFilm = function () {
    return Promise.all(faces.map(function (f) { return document.fonts.load(f, 'Aaжҷӯ'); }))
      .then(function () { return document.fonts.ready; }).then(build);
  };
})();
