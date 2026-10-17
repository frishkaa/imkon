/* Moní · tajiklaw.ai — AI Conf 2026 showcase. One paused GSAP timeline, 96 s @ 60 fps, 120 BPM (bar = 2 s).
   Scene map (seconds):  1 hook 0–8 · 2 logo 8–12 · 3 ask 12–26 · 4 18 languages 26–34 · 5 review 34–52 ·
   6 calculator 52–64 · 7 drafting 64–70 · 8 account 70–78 · 9 Moní Pro 78–86 · 10 end card + loop 86–96.
   English only. */
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

  /* Moní's English answers keep Russian code abbreviations (e.g. "ТК РТ, ст. 28"); the film shows them in English. */
  const CODES = { 'ТК': 'Labour Code', 'ГК': 'Civil Code', 'УК': 'Criminal Code', 'НК': 'Tax Code', 'СК': 'Family Code' };
  const ACTS = [
    [/ТРУДОВОЙ КОДЕКС РЕСПУБЛИКИ ТАДЖИКИСТАН/g, 'Labour Code of the Republic of Tajikistan'],
    [/УГОЛОВНЫЙ КОДЕКС РЕСПУБЛИКИ ТАДЖИКИСТАН/g, 'Criminal Code of the Republic of Tajikistan'],
    [/Закон РТ "О содействии занятости населения"/g, 'Law of the Republic of Tajikistan "On Promotion of Employment"'],
    [/Законы РТ от 17\.05\.2004 г\. № 35 and от 6\.10\.2008 г\. № 422/g, 'Laws of the Republic of Tajikistan No. 35 of 17.05.2004 and No. 422 of 06.10.2008']
  ];
  function englishCitations(root) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), nodes = [];
    while (w.nextNode()) nodes.push(w.currentNode);
    nodes.forEach(function (n) {
      let v = n.nodeValue;
      v = v.replace(/(ТК|ГК|УК|НК|СК) РТ, ст\. (\d+)(?:, (?:п\.|ч\.) (\d+))?/g, function (_, c, a, k) { return CODES[c] + ', Art. ' + a + (k ? '(' + k + ')' : ''); });
      ACTS.forEach(function (r) { v = v.replace(r[0], r[1]); });
      v = v.replace(/ — ст\. ([\d, ]+) \(от ([\d.]+), ред\. ([\d.]+)\)/g, ' — Art. $1 (of $2, as amended $3)');
      n.nodeValue = v;
    });
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
    englishCitations(content);
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
    tl.to(wSend, { scale: 0.88, duration: 0.1, ease: 'power2.in' }, 17.7); tl.to(wSend, { scale: 1, duration: 0.25, ease: 'power3.out' }, 17.8);
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
    camS.to(tl, 20.2, 1.1, { fx: 190, fy: 352, s: 1.12 }, 'power3.inOut');
    const visTop = 70, visBottom = 720 - 190;                                                     // visible chat window in site px
    const sListEnd = Math.max(0, rList.b - visBottom + 10);
    const sSrc = Math.max(0, rSrc.y - visTop - 150);
    tl.fromTo(scroll, { y: 0 }, { y: -sListEnd, duration: 1.9, ease: 'sine.inOut' }, 21.6);
    tl.to(scroll, { y: -sSrc, duration: 1.2, ease: 'power3.inOut' }, 23.55);

    const c1 = callout(over, 120, 290, 'Legal Q&amp;A', 'Answers that cite <em>the law.</em>',
      '<div class="lede">Every claim points to the exact article — here, the Labour Code.</div><span class="cite-chip"><i></i>Labour Code · Art. 28</span>');
    calloutIn(c1, 20.9);
    calloutOut(c1, 23.35);
    const c2 = callout(over, 120, 300, 'Sources', 'Built on <em>current</em> legislation.',
      '<div class="lede">Labour Code of the Republic of Tajikistan, as amended 17.06.2026.</div>');
    calloutIn(c2, 23.75);
    tl.to(over, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 25.55);
    S('ui-popup-dry', 20.95, 0.4); S('ui-popup-dry', 23.8, 0.4);

    // exit: whip LEFT (the film's current) into the languages scene
    camS.to(tl, 25.6, 0.6, { fx: 190 + 1700, fy: 352, s: 1.12 }, 'power4.in');
    FX.whipBlur(tl, cam, 25.6, 0.6, 1700, 'in');
    S('whoosh-fast', 25.6, 0.7);
    return { stream: stream };
  }

  /* ======================= 4 · 18 LANGUAGES ======================= */
  const MIC = '<svg viewBox="0 0 24 24" fill="none" stroke="#1a1a1f" stroke-width="2.2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>';
  function buildS4() {
    const cam = $('#s4Cam'), box = $('#langChips'), cards = $('#langCards');
    const chips = D.languages.map(function (n) { return el('span', 'lang-chip', n, box); });
    const v = D.voice;
    const card = el('div', 'lang-card voice-card', '<div class="lang-tag"><b class="mic-b">' + MIC + '</b>Asked by voice</div>' +
      '<div class="voice-pill"><span class="mic">' + MIC + '</span><span class="bars">' + '<span></span>'.repeat(26) + '</span></div>' +
      '<div class="msg msg-user"><div class="msg-content"><span class="q"></span></div></div>' +
      '<div class="msg msg-ai"><div class="msg-content">' + v.a + '</div></div>', cards);
    const q = $('.q', card), ans = $('.msg-ai .msg-content', card), uMsg = $('.msg-user', card), pill = $('.voice-pill', card);
    q.textContent = v.q;

    const camS = FX.camera(cam, { fx: 960, fy: 540, s: 1 });
    camS.set(tl, 26.0, { fx: 960 - 760, fy: 540, s: 1 });
    camS.to(tl, 26.0, 0.75, { fx: 960, fy: 540, s: 1 }, 'power4.out');                              // arrive from the right
    FX.whipBlur(tl, cam, 26.0, 0.75, 760, 'out');
    FX.waterfall(tl, FX.words($('#langHead')), 26.15, { stagger: 0.06, y: 40, blur: 8, dur: 0.75 });
    // the 18 languages cascade in, then a soft gold wave runs through them
    tl.fromTo(chips, { opacity: 0, y: 34, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out', stagger: 0.045 }, 26.5);
    chips.forEach(function (c, i) {
      const t = 27.75 + i * 0.055;
      tl.to(c, { backgroundColor: 'rgba(232,192,120,.42)', borderColor: 'rgba(193,141,72,.7)', duration: 0.3, ease: 'power2.out' }, t);
      tl.to(c, { backgroundColor: 'rgba(255,255,255,1)', borderColor: 'rgba(224,221,214,1)', duration: 0.6, ease: 'power2.inOut' }, t + 0.3);
    });
    tl.to(chips[0], { backgroundColor: '#c18d48', borderColor: '#c18d48', color: '#1a1a1f', duration: 0.45, ease: 'power2.out' }, 29.3);   // the one being spoken
    S('shimmer-sparkle-sweep', 27.75, 0.3);
    // a question asked by voice: waveform → transcript → answer
    tl.fromTo(card, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 27.0);
    tl.set(uMsg, { opacity: 0 }, 0);
    const bars = $$('.bars span', pill), st = { k: 0 };
    const wr = function () {
      bars.forEach(function (sp, j) {
        const amp = Math.max(0, Math.sin(st.k * 7.3 + j * 0.9) * 0.55 + Math.sin(st.k * 11.1 + j * 1.7) * 0.45);
        const env = Math.min(1, st.k / 0.3) * Math.min(1, Math.max(0, (1.5 - st.k) / 0.3));
        sp.style.height = (6 + 20 * amp * env).toFixed(1) + 'px';
      });
    };
    wr();
    tl.to(st, { k: 1.5, duration: 1.5, ease: 'none', onUpdate: wr }, 27.6);
    tl.to(pill, { opacity: 0.45, duration: 0.4 }, 29.1);
    tl.fromTo(uMsg, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, 29.05);
    FX.stream(tl, q, 29.05, 0.6, { lead: 3 });
    FX.stream(tl, ans, 29.75, 1.2, { lead: 4 });
    S('ui-notify-tech', 27.6, 0.3); S('ui-message-pop', 29.75, 0.3);
    tl.fromTo('#langFoot', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 31.2);
    camS.to(tl, 33.62, 0.58, { fx: 960 + 1900, fy: 540, s: 1 }, 'power4.in');                          // exit LEFT
    FX.whipBlur(tl, cam, 33.62, 0.58, 1900, 'in');
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
    FX.whipBlur(tl, cam, 34.0, 0.75, 760, 'out');
    tl.fromTo(paper, { x: 900, y: 40, rotateZ: 4, opacity: 0 }, { x: 0, y: 0, rotateZ: -1.4, opacity: 1, duration: 1.1, ease: 'power3.out' }, 34.15);
    tl.to(paper, { rotateZ: 0, duration: 0.8, ease: 'power2.inOut' }, 35.25);
    calloutIn(c0, 34.5);
    tl.fromTo(up, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 35.4);
    S('paper-slide', 34.2, 0.8); S('ui-popup-dry', 35.45, 0.35);
    const cur = FX.cursor(cam, 84);
    cur.place(tl, 35.6, rSend.cx + 120, 1250);
    cur.move(tl, 35.7, 0.8, rSend.cx, rSend.cy, 'power3.out');
    cur.ringAt(tl, 36.6, rSend.cx, rSend.cy); cur.click(tl, 36.6);
    tl.to(upSend, { scale: 0.88, duration: 0.1 }, 36.6); tl.to(upSend, { scale: 1, duration: 0.25, ease: 'power3.out' }, 36.7);
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
    tl.to(fixBtn, { scale: 0.95, duration: 0.1 }, 45.1); tl.to(fixBtn, { scale: 1, duration: 0.25, ease: 'power3.out' }, 45.2);
    S('ui-click-tone', 45.1, 0.7); S('write-fast', 45.5, 0.4);
    cur2.move(tl, 45.4, 0.6, rFix.cx + 400, 1250, 'power2.in');
    tl.to(rv, { opacity: 0, x: 80, duration: 0.5, ease: 'power2.in' }, 45.5);
    tl.to(counter, { opacity: 0, duration: 0.3 }, 45.5);
    camS.to(tl, 45.55, 1.2, { fx: rSheet.cx, fy: rSheet.cy + 10, s: 1.4 }, 'power3.inOut');
    // build redline spans per clause
    const redStart = 46.6, redGap = 0.5;
    order.forEach(function (o, k) {
      const txt = o.c.txt, f = o.f, html = txt.innerHTML;
      const at = html.indexOf(f.del);
      if (at < 0) return;
      txt.innerHTML = html.slice(0, at) + '<span class="del">' + f.del + '</span> <span class="ins"></span>' + html.slice(at + f.del.length);
      const del = $('.del', txt), ins = $('.ins', txt);
      const t = redStart + k * redGap;
      tl.set(del, { textDecorationColor: 'rgba(224,82,82,0)', color: '#1a1a1a' }, 0);
      tl.to(del, { textDecorationColor: 'rgba(224,82,82,1)', color: '#9a5050', duration: 0.3, ease: 'power2.out' }, t);
      tl.set(ins, { display: 'none' }, 0);
      tl.set(ins, { display: 'inline' }, t + 0.18);
      FX.type(tl, ins, f.ins, t + 0.18, 0.55);
      tl.to(o.c.flag, { opacity: 0.35, duration: 0.4 }, t + 0.3);
      S('pen-click', 0, 0);
    });
    FX.cues = FX.cues.filter(function (c) { return c.name !== 'pen-click'; });
    order.forEach(function (o, k) { S('write-fast', redStart + k * redGap + 0.18, 0.28); });

    // phase D — corrected file + caption
    const c3 = callout(over, 1130, 300, 'Fixed', 'Corrections, <em>tracked.</em>',
      '<div class="lede">Every edit is visible in the .docx — formatting, stamps and layout stay intact.</div>' +
      '<div class="file-out" style="position:relative;margin-top:34px"><div class="ico">W</div><div><div class="nm">Commercial_Lease_14-26_fixed.docx</div><div class="sub"><b>5 edits applied</b> · tracked changes</div></div></div>');
    camS.to(tl, 48.95, 1.2, { fx: rSheet.r - 70, fy: rSheet.cy - 10, s: 1.12 }, 'power3.inOut');
    calloutIn(c3, 49.45);
    S('ui-success-soft', 49.95, 0.5);
    tl.to(over, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 51.5);
    camS.to(tl, 51.62, 0.58, { fx: rSheet.r - 70 + 1900, fy: rSheet.cy - 10, s: 1.12 }, 'power4.in');   // exit LEFT
    FX.whipBlur(tl, cam, 51.62, 0.58, 1900, 'in');
    S('whoosh-fast', 51.62, 0.7);
  }

  /* ======================= 6 · CALCULATOR ======================= */
  const CALC_IC = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/></svg>';
  function fmtTJS(v) { return v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function buildC() {
    const cam = $('#sCCam'), over = $('#sCOver');
    const B = makeBrowser(cam, '/trial/en/');
    const m = B.moni;
    m.innerHTML = F.header + F.sbToggle + '<main class="main main-home calc-home">' + F.welcome + '</main>' +
      '<div class="chat-layer"><div class="chat-scroll"><div class="chat-area" style="display:flex"></div></div></div>' +
      '<div class="dock">' + F.modeBarChat + F.inputWrapChat + F.uploadNoticeChat + F.footerBottom + '</div>';
    $$('.welcome-title', m).forEach(function (t) { t.innerHTML = t.innerHTML.replace('Need lawyer?', 'Need a lawyer?'); });
    const main = $('.main', m), welcome = $('.welcome', m);
    const mb = $$('.welcome .mode-btn', m), bSend = mb[0], bCalc = mb[1];
    const wTop = $$('.welcome-title, .welcome-sub, .welcome .mode-bar', m);
    const wInput = $('.input-wrap.centered', m), notice = $('.welcome .upload-notice', m), disc = $('.welcome .disclaimer-text', m);
    notice.insertAdjacentHTML('afterend', D.calc.panel);
    const panel = $('.welcome .calc-panel', m);
    const typeSel = $('#calcType', panel), income = $('#cIncome', panel), submit = $('.calc-submit', panel);
    $('#cIncomeOrgType', panel).value = 'other';
    income.value = '';
    // the native option list can't be captured, so it is drawn in the site's own select style
    const g0 = typeSel.parentElement; g0.style.position = 'relative';
    const dd = el('div', 'calc-dd', '<div class="dd-win"><div class="dd-list">' + D.calc.types.map(function (t, i) {
      return '<div class="dd-it' + (i === 0 ? ' sel' : '') + '">' + t + '</div>'; }).join('') + '</div><div class="dd-hover"></div></div>', g0);
    const ddList = $('.dd-list', dd), ddHover = $('.dd-hover', dd);
    // chat after "Calculate": request bubble, thinking card, Moní's calculation (English rendering of its real output)
    const chat = $('.chat-area', m), scroll = $('.chat-scroll', m), dock = $('.dock', m), dForm = $('.dock .input-form', m);
    fakeInput(dForm);
    chat.innerHTML = '<div class="msg msg-user"><div class="msg-content calc-q">' + CALC_IC + ' ' + D.calc.question + '</div></div>' + genCardHTML('Moní is calculating') +
      '<div class="msg msg-ai calc-ans"><div class="calc-result-card"><div class="calc-result-header">' + CALC_IC + ' Income Tax</div>' +
      '<div class="calc-result-body"><div class="msg-content">' + D.calc.result + '</div></div></div></div>';
    const uMsg = $('.msg-user', chat), gen = $('.gen-indicator', chat), ans = $('.calc-ans', chat), rcard = $('.calc-result-card', ans);
    const content = $('.calc-result-body .msg-content', ans), netRow = $('tr.net', ans), table = $('.tbl-wrap', ans);
    gen.style.position = 'absolute'; gen.style.left = '40px';
    // pre-click layout: the chat input sits where the calculator will open
    welcome.style.position = 'relative';

    const R = function (e) { return FX.measure(e, B.el); };
    const rWel = R(welcome), rNotice = R(notice);
    wInput.style.position = 'absolute'; wInput.style.left = '50%'; wInput.style.marginLeft = '-400px'; wInput.style.width = '800px';
    wInput.style.top = (rNotice.y - rWel.y) + 'px';
    const rCalc = R(bCalc), rType = R(typeSel), rInc = R(income), rSub = R(submit), rPanel = R(panel);
    const rAns = R(ans), rTable = R(table), rChat = R(chat), rItem = R($('.dd-it', dd));
    gen.style.top = (rAns.y - rChat.y + 32) + 'px';
    const itemH = rItem.h, visItems = 9;
    $('.dd-win', dd).style.height = (itemH * visItems + 12) + 'px';

    // ---- camera ----
    const camS = FX.camera(cam, { fx: 640, fy: 380, s: 1.15 });
    camS.set(tl, 52.0, { fx: 640 - 760, fy: 380, s: 1.15 });
    camS.to(tl, 52.0, 0.75, { fx: 640, fy: 380, s: 1.15 }, 'power4.out');
    FX.whipBlur(tl, cam, 52.0, 0.75, 760, 'out');
    tl.set([notice, panel, disc, dd, dock, uMsg, gen, ans], { opacity: 0 }, 0);
    tl.set(main, { y: 0 }, 0);

    // ---- 1. switch to Calculator mode ----
    const cur = FX.cursor(B.el, 64);
    cur.place(tl, 52.35, rCalc.cx + 240, 900);
    cur.move(tl, 52.45, 0.65, rCalc.cx + 8, rCalc.cy + 4, 'power3.out');
    cur.ringAt(tl, 53.15, rCalc.cx + 8, rCalc.cy + 4); cur.click(tl, 53.15);
    tl.to(bCalc, { scale: 0.95, duration: 0.1, ease: 'power2.in' }, 53.15); tl.to(bCalc, { scale: 1, duration: 0.3, ease: 'power3.out' }, 53.25);
    toggleAt(53.2, function () { bCalc.classList.add('active'); bSend.classList.remove('active'); }, function () { bCalc.classList.remove('active'); bSend.classList.add('active'); });
    S('ui-click-tone', 53.15, 0.6);
    tl.to(wInput, { opacity: 0, y: -12, duration: 0.3, ease: 'power2.in' }, 53.2);
    tl.fromTo([notice, panel, disc], { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.06 }, 53.3);
    S('ui-popup-dry', 53.35, 0.35);
    // the page scrolls so the form is in view; the camera follows it in
    const sc1 = Math.max(0, rType.y - 150);
    tl.to(main, { y: -sc1, duration: 0.9, ease: 'power3.inOut' }, 53.65);
    camS.to(tl, 53.6, 1.0, { fx: rPanel.cx, fy: 330, s: 1.42 }, 'power3.inOut');

    // ---- 2. the 17 calculation types ----
    const tx = rType.x + 190, ty = rType.cy - sc1;
    cur.move(tl, 54.2, 0.5, tx, ty, 'power3.inOut');
    cur.ringAt(tl, 54.75, tx, ty); cur.click(tl, 54.75);
    S('ui-select-click', 54.75, 0.5);
    tl.fromTo(dd, { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' }, 54.8);
    const listTop = rType.b - sc1 + 6 + 6;                              // first item's top in browser space
    const itemY = function (i, scrollPx) { return listTop + i * itemH - scrollPx + itemH / 2; };
    const maxScroll = (D.calc.types.length - visItems) * itemH;
    // hover travels down the list (the list scrolls under it), then back up to "Income Tax"
    tl.fromTo(ddHover, { y: 0 }, { y: (visItems - 2) * itemH, duration: 0.75, ease: 'power2.inOut' }, 55.0);
    cur.move(tl, 55.0, 0.75, tx - 40, itemY(visItems - 2, 0), 'power2.inOut');
    tl.fromTo(ddList, { y: 0 }, { y: -maxScroll, duration: 0.6, ease: 'power2.inOut' }, 55.55);
    tl.to(ddList, { y: 0, duration: 0.55, ease: 'power2.inOut' }, 56.2);
    tl.to(ddHover, { y: 0, duration: 0.55, ease: 'power2.inOut' }, 56.2);
    cur.move(tl, 56.2, 0.55, tx - 60, itemY(0, 0), 'power2.inOut');
    cur.ringAt(tl, 56.8, tx - 60, itemY(0, 0)); cur.click(tl, 56.8);
    tl.to(dd, { opacity: 0, duration: 0.18, ease: 'power2.in' }, 56.88);
    S('ui-select-click', 56.8, 0.45);

    // ---- 3. income, then Calculate ----
    const ix = rInc.x + 120, iy = rInc.cy - sc1;
    cur.move(tl, 57.0, 0.35, ix, iy, 'power3.inOut');
    cur.ringAt(tl, 57.38, ix, iy); cur.click(tl, 57.38);
    toggleAt(57.42, function () { income.classList.add('film-focus'); }, function () { income.classList.remove('film-focus'); });
    const ist = { n: 0 }, digits = '8000';
    tl.to(ist, { n: 4, duration: 0.42, ease: 'none', onUpdate: function () { income.value = digits.slice(0, Math.round(ist.n)); } }, 57.48);
    S('typewriter-digital', 57.48, 0.3);
    const sc2 = Math.max(sc1, rSub.b - 610);
    tl.to(main, { y: -sc2, duration: 0.7, ease: 'power3.inOut' }, 57.9);
    camS.to(tl, 57.85, 0.8, { fx: rPanel.cx, fy: 400, s: 1.3 }, 'power3.inOut');
    toggleAt(57.95, function () { income.classList.remove('film-focus'); }, function () { income.classList.add('film-focus'); });
    cur.move(tl, 57.95, 0.6, rSub.cx + 40, rSub.cy - sc2, 'power3.inOut');
    cur.ringAt(tl, 58.6, rSub.cx + 40, rSub.cy - sc2); cur.click(tl, 58.6);
    tl.to(submit, { scale: 0.97, duration: 0.1, ease: 'power2.in' }, 58.6); tl.to(submit, { scale: 1, duration: 0.3, ease: 'power3.out' }, 58.7);
    S('ui-click-tone', 58.6, 0.7);
    cur.move(tl, 58.75, 0.6, rSub.cx + 300, 1000, 'power2.in');

    // ---- 4. Moní calculates ----
    tl.to(welcome, { opacity: 0, y: -40, filter: 'blur(6px)', duration: 0.45, ease: 'power2.in' }, 58.75);
    tl.fromTo(dock, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 59.0);
    tl.fromTo(uMsg, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, 59.0);
    S('ui-message-pop', 59.05, 0.45);
    camS.to(tl, 58.9, 1.2, { fx: 190, fy: 352, s: 1.12 }, 'power3.inOut');                             // chat to the right half
    tl.fromTo(gen, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' }, 59.3);
    animateGen(gen, 59.3, 60.15);
    tl.to(gen, { opacity: 0, duration: 0.2 }, 60.0);
    S('data-compute', 59.35, 0.3);
    tl.fromTo(ans, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 60.1);
    tl.set(rcard, { opacity: 1 }, 60.1);
    FX.stream(tl, content, 60.25, 1.9, { lead: 8 });
    S('chime-crystal', 60.15, 0.3);
    const visTop = 70, visBottom = 720 - 190;
    const sTable = Math.max(0, rTable.b - visBottom + 6);
    tl.fromTo(scroll, { y: 0 }, { y: -sTable, duration: 1.3, ease: 'power2.inOut' }, 60.75);
    tl.fromTo($$('td', netRow), { backgroundColor: 'rgba(232,192,120,0)' }, { backgroundColor: 'rgba(232,192,120,.5)', duration: 0.5, ease: 'power2.out' }, 62.05);
    S('sparkle-touch', 62.05, 0.35);

    // ---- caption ----
    const c1 = callout(over, 120, 250, 'Calculator', 'Taxes and fees, <em>calculated.</em>',
      '<div class="lede">17 calculation types, every step tied to the Tax Code.</div>' +
      '<div class="calc-out"><span class="lbl">Net pay</span><span class="num">0.00</span><span class="cur">TJS</span></div>' +
      '<span class="cite-chip"><i></i>Tax Code · Art. 183, 191, 332</span>');
    tl.set(over, { opacity: 1 }, 52.0);
    calloutIn(c1, 59.55);
    const out = $('.calc-out', c1), num = $('.num', out), cnt = { v: 0 };
    tl.fromTo(out, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 60.9);
    tl.to(cnt, { v: 6917.92, duration: 1.2, ease: 'power2.out', onUpdate: function () { num.textContent = fmtTJS(cnt.v); } }, 61.0);
    S('ui-popup-dry', 59.6, 0.4);
    tl.to(over, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 63.3);
    camS.to(tl, 63.42, 0.58, { fx: 190 + 1900, fy: 352, s: 1.12 }, 'power4.in');                       // exit LEFT
    FX.whipBlur(tl, cam, 63.42, 0.58, 1900, 'in');
    S('whoosh-fast', 63.42, 0.7);
  }

  /* ======================= 7 · DRAFTING (a short beat) ======================= */
  function buildS6() {
    const cam = $('#s6Cam'), over = $('#s6Over');
    const B = makeBrowser(cam, '/trial/en/');
    const m = B.moni;
    m.innerHTML = F.header + F.sbToggle +
      '<div class="chat-layer"><div class="chat-scroll"><div class="chat-area" style="display:flex"></div></div></div>' +
      '<div class="dock">' + F.modeBarChat + F.inputWrapChat + F.uploadNoticeChat + F.footerBottom + '</div>' +
      '<div class="dv-overlay film">' + F.docViewer + '</div>';
    const chat = $('.chat-area', m);
    fakeInput($('.dock .input-form', m));
    chat.innerHTML = '<div class="msg msg-user"><div class="msg-content">' + D.draftPrompt + '</div></div>' +
      '<div class="msg msg-ai drafted">' + F.draft[1].html + '</div>';
    const ai = $('.drafted', chat);
    $$('*', ai).forEach(function (n) {
      if (n.children.length === 0 && n.textContent) {
        n.textContent = n.textContent
          .replace(/Составил проект договора \(([^)]+)\)\. Проверьте и заполните пометки «\[уточнить: …\]»\./, 'Drafted a contract (services). Review it and fill in the «[specify: …]» marks.')
          .replace(/Документ · нажмите, чтобы открыть/, 'Document · click to open')
          .replace(/Договор об оказании услуг № \[уточнить: номер договора\]/, D.draft.title);
      }
    });
    const panel = $('.dv-panel', m), overlay = $('.dv-overlay', m);
    const title = $('.dv-title', panel); if (title) title.textContent = D.draft.title;
    $('.dv-body', panel).innerHTML = '<div class="dv-sheet">' + D.draft.paras.map(function (p) { return '<div class="dv-para ' + (p.cls || '') + '">' + p.t + '</div>'; }).join('') + '</div>';
    const comments = $('.dv-comments', panel); if (comments) { const ct = $('.dv-comments-title', comments); if (ct) ct.textContent = 'Your comments (0)'; }
    $$('button, span, div', panel).forEach(function (n) { if (n.children.length === 0 && /Отправить замечания в чат/.test(n.textContent)) n.textContent = 'Send comments to chat'; });
    const marks = $$('.ph-mark', panel);
    const rSheet = FX.measure($('.dv-sheet', panel), B.el);
    overlay.style.backgroundColor = 'rgba(0,0,0,0.38)';

    const s1 = 1.3, fxA = rSheet.r - (1870 - 960) / s1, fyA = rSheet.y + 330;
    const camS = FX.camera(cam, { fx: fxA, fy: fyA, s: s1 });
    camS.set(tl, 64.0, { fx: fxA - 760, fy: fyA, s: s1 });
    camS.to(tl, 64.0, 0.8, { fx: fxA, fy: fyA, s: s1 }, 'power4.out');
    FX.whipBlur(tl, cam, 64.0, 0.8, 760, 'out');
    tl.fromTo(panel, { x: 60 }, { x: 0, duration: 0.9, ease: 'power3.out' }, 64.0);
    S('paper-page-turn', 64.1, 0.5);
    const c1 = callout(over, 120, 300, 'Contract drafting', 'A first draft, <em>ready to edit.</em>',
      '<div class="lede">The gaps you still need to fill are flagged in gold.</div>' +
      '<div class="file-out" style="position:relative;margin-top:34px"><div class="ico">W</div><div><div class="nm">Services_Agreement.docx</div><div class="sub">Ready to edit · download in one click</div></div></div>');
    const veil = el('div', 'layer', null, over);
    veil.style.background = 'linear-gradient(90deg, rgba(248,247,244,.98) 0%, rgba(248,247,244,.92) 38%, rgba(248,247,244,0) 47%)';
    over.insertBefore(veil, c1);
    tl.set(over, { opacity: 1 }, 64.0);
    tl.fromTo(veil, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 64.2);
    calloutIn(c1, 64.4);
    marks.forEach(function (mk, i) {
      tl.fromTo(mk, { boxShadow: '0 0 0 0px rgba(193,141,72,0)', backgroundColor: 'rgba(232,192,120,0)' },
        { boxShadow: '0 0 0 2px rgba(193,141,72,.55)', backgroundColor: 'rgba(232,192,120,.55)', duration: 0.4, ease: 'power2.out' }, 65.1 + i * 0.16);
    });
    S('ui-popup-dry', 64.45, 0.4); S('sparkle-touch', 65.15, 0.3);
    // exit LEFT into the account scene
    tl.to(over, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 69.3);
    camS.to(tl, 69.42, 0.58, { fx: fxA + 1900, fy: fyA, s: s1 }, 'power4.in');
    FX.whipBlur(tl, cam, 69.42, 0.58, 1900, 'in');
    S('whoosh-fast', 69.42, 0.7);
  }


  /* ======================= 8 · ACCOUNT: every chat saved ======================= */
  function buildA() {
    const A = D.account, IC = A.icons;
    const cam = $('#sACam'), over = $('#sAOver');
    const B = makeBrowser(cam, '/trial/en/login');
    // page 1 — the real login card ("Log in to see your chat history")
    const mL = B.moni;
    mL.innerHTML = F.header + '<main class="main main-content"><div class="auth-page"><div class="auth-card">' +
      '<img src="assets/brand/moni-logo.svg" alt="Moní" class="auth-logo light-logo">' +
      '<div class="auth-title">Welcome back</div><div class="auth-sub">Log in to see your chat history</div>' +
      '<div class="auth-field"><label>Email</label><input class="auth-input" type="text" placeholder="you@example.com"></div>' +
      '<div class="auth-field"><label>Password</label><input class="auth-input" type="text" placeholder="Your password"></div>' +
      '<button class="auth-submit" type="button">Log in</button>' +
      '<div class="auth-foot"><a>Forgot password?</a><br>Don\'t have an account? <a>Sign up</a></div></div></div></main>';
    // page 2 — home, logged in: account in the header, chat history in the sidebar
    const mH = el('div', 'moni', null, $('.bw-view', B.el));
    mH.setAttribute('data-theme', 'light');
    mH.style.position = 'absolute'; mH.style.left = '0'; mH.style.top = '0';
    const acct = '<div class="acct-wrap"><button class="acct-btn"><span class="acct-avatar">' + A.name[0] + '</span><span class="acct-label">' + A.name + '</span></button></div>';
    const items = A.chats.map(function (t, i) {
      return '<div class="sb-item' + (i === 0 ? ' active' : '') + '"><span class="sb-title">' + t + '</span><span class="sb-actions">' +
        '<button class="sb-act">' + IC.pin + '</button><button class="sb-act">' + IC.edit + '</button><button class="sb-act danger">' + IC.del + '</button></span></div>';
    }).join('');
    const chatA = '<div class="msg msg-user"><div class="msg-content">' + D.draftPrompt + '</div></div>' +
      '<div class="msg msg-ai"><div class="msg-content"><p>Drafted a contract (services). Review it and fill in the «[specify: …]» marks.</p></div></div>';
    const chatB = '<div class="msg msg-user"><div class="msg-content calc-q">' + CALC_IC + ' ' + D.calc.question + '</div></div>' +
      '<div class="msg msg-ai calc-ans"><div class="calc-result-card" style="opacity:1"><div class="calc-result-header">' + CALC_IC + ' Income Tax</div>' +
      '<div class="calc-result-body"><div class="msg-content">' + D.calc.result + '</div></div></div></div>';
    mH.innerHTML = F.header.replace(/<a class="acct-login-btn"[^>]*>[^<]*<\/a>/, acct) +
      '<div class="chat-layer"><div class="chat-scroll"><div class="chat-area chat-a" style="display:flex">' + chatA + '</div>' +
      '<div class="chat-area chat-b" style="display:flex;position:absolute;left:0;right:0;top:0">' + chatB + '</div></div></div>' +
      '<div class="dock">' + F.modeBarChat + F.inputWrapChat + F.uploadNoticeChat + F.footerBottom + '</div>' +
      '<div class="sb-overlay"></div><aside class="sidebar"><div class="sb-head"><span class="sb-head-title">Chats</span><button class="sb-collapse">' + IC.collapse + '</button></div>' +
      '<button class="sb-new">' + IC.new + ' New chat</button><div class="sb-list">' + items + '</div></aside>';
    fakeInput($('.dock .input-form', mH));
    const sidebar = $('.sidebar', mH), overlay = $('.sb-overlay', mH), sbItems = $$('.sb-item', mH), chatAEl = $('.chat-a', mH), chatBEl = $('.chat-b', mH);
    const emailIn = $$('.auth-input', mL)[0], pwIn = $$('.auth-input', mL)[1], submit = $('.auth-submit', mL);

    const R = function (e) { return FX.measure(e, B.el); };
    const rEmail = R(emailIn), rPw = R(pwIn), rSub = R(submit), rItem1 = R(sbItems[1]);

    // ---- camera: arrive on the login card ----
    const camS = FX.camera(cam, { fx: 640, fy: 400, s: 1.25 });
    camS.set(tl, 70.0, { fx: 640 - 760, fy: 400, s: 1.25 });
    camS.to(tl, 70.0, 0.75, { fx: 640, fy: 400, s: 1.25 }, 'power4.out');
    FX.whipBlur(tl, cam, 70.0, 0.75, 760, 'out');
    tl.set(over, { opacity: 1 }, 70.0);

    // ---- log in ----
    const cur = FX.cursor(B.el, 64);
    cur.place(tl, 70.3, rEmail.x + 300, 860);
    cur.move(tl, 70.4, 0.45, rEmail.x + 120, rEmail.cy + 4, 'power3.out');
    cur.ringAt(tl, 70.88, rEmail.x + 120, rEmail.cy + 4); cur.click(tl, 70.88);
    toggleAt(70.92, function () { emailIn.classList.add('film-focus'); }, function () { emailIn.classList.remove('film-focus'); });
    const est = { n: 0 };
    tl.to(est, { n: A.email.length, duration: 0.55, ease: 'none', onUpdate: function () { emailIn.value = A.email.slice(0, Math.round(est.n)); } }, 70.95);
    S('typewriter-digital', 70.95, 0.3);
    cur.move(tl, 71.4, 0.25, rPw.x + 120, rPw.cy + 4, 'power3.inOut');
    cur.ringAt(tl, 71.68, rPw.x + 120, rPw.cy + 4); cur.click(tl, 71.68);
    toggleAt(71.7, function () { emailIn.classList.remove('film-focus'); pwIn.classList.add('film-focus'); }, function () { emailIn.classList.add('film-focus'); pwIn.classList.remove('film-focus'); });
    const pst = { n: 0 };
    tl.to(pst, { n: 10, duration: 0.3, ease: 'none', onUpdate: function () { pwIn.value = '••••••••••'.slice(0, Math.round(pst.n)); } }, 71.72);
    cur.move(tl, 72.05, 0.3, rSub.cx + 30, rSub.cy, 'power3.inOut');
    cur.ringAt(tl, 72.38, rSub.cx + 30, rSub.cy); cur.click(tl, 72.38);
    tl.to(submit, { scale: 0.98, duration: 0.1, ease: 'power2.in' }, 72.38); tl.to(submit, { scale: 1, duration: 0.25, ease: 'power3.out' }, 72.48);
    S('ui-click-tone', 72.38, 0.7);
    cur.move(tl, 72.5, 0.6, rSub.cx + 400, 1000, 'power2.in');

    // ---- signed in: the history is there ----
    const card = $('.auth-card', mL), urlDim = $('.bw-url .dim', B.el);
    tl.to(card, { opacity: 0, y: -24, duration: 0.25, ease: 'power2.in' }, 72.45);                      // the login card leaves first
    tl.fromTo(mH, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 72.68);
    toggleAt(72.68, function () { urlDim.textContent = '/trial/en/'; }, function () { urlDim.textContent = '/trial/en/login'; });
    S('ui-success-soft', 72.7, 0.45);
    // whole page in view (the account sits top-right), caption on the left
    camS.to(tl, 72.6, 1.1, { fx: 340, fy: 360, s: 1.0 }, 'power3.inOut');
    tl.fromTo(sidebar, { x: -300 }, { x: 0, duration: 0.7, ease: 'power3.out' }, 72.95);
    tl.fromTo(overlay, { opacity: 0 }, { opacity: 0.55, duration: 0.6, ease: 'power2.out' }, 72.95);
    toggleAt(72.95, function () { sidebar.style.boxShadow = '4px 0 28px rgba(0,0,0,.14)'; overlay.style.visibility = 'visible'; },
      function () { sidebar.style.boxShadow = ''; overlay.style.visibility = 'hidden'; });
    tl.fromTo(sbItems, { opacity: 0, x: -18 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out', stagger: 0.08 }, 73.2);
    S('ui-popup-dry', 73.0, 0.35);
    // open an earlier chat: the calculation from a minute ago, exactly as it was
    const ix = rItem1.x + 120, iy = rItem1.cy;
    cur.place(tl, 74.6, ix + 120, 860);
    cur.move(tl, 74.7, 0.6, ix, iy, 'power3.out');
    toggleAt(75.0, function () { sbItems[1].classList.add('film-hover'); }, function () { sbItems[1].classList.remove('film-hover'); });
    cur.ringAt(tl, 75.4, ix, iy); cur.click(tl, 75.4);
    toggleAt(75.45, function () { sbItems[0].classList.remove('active'); sbItems[1].classList.add('active'); }, function () { sbItems[0].classList.add('active'); sbItems[1].classList.remove('active'); });
    tl.set(chatBEl, { opacity: 0 }, 0);
    tl.to(chatAEl, { opacity: 0, duration: 0.25, ease: 'power2.in' }, 75.5);
    tl.fromTo(chatBEl, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 75.65);
    S('ui-click-tone', 75.4, 0.6);
    cur.move(tl, 75.6, 0.6, ix + 260, 1000, 'power2.in');

    // ---- caption ----
    const c1 = callout(over, 110, 330, 'Your account', 'Every chat, <em>saved.</em>',
      '<div class="lede">Log in on any device and your whole history is there.</div>');
    c1.style.width = '470px'; $('.display', c1).style.fontSize = '64px'; $('.lede', c1).style.maxWidth = '440px';
    calloutIn(c1, 73.15);
    S('ui-popup-dry', 73.2, 0.3);

    // exit: rise (chapter boundary into Moní Pro)
    tl.to(over, { opacity: 0, duration: 0.3 }, 77.3);
    camS.to(tl, 77.45, 0.75, { fx: 340, fy: 360 + 1300, s: 1.0 }, 'power4.in');
    FX.whipBlur(tl, cam, 77.45, 0.75, 1300, 'in', 'y');
    S('transition-tech-slide', 77.45, 0.6);
  }

  /* ======================= 9 · MONÍ PRO (night) ======================= */
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
    tl.to('#bgNight', { opacity: 1, duration: 0.55, ease: 'power2.inOut' }, 77.6);
    const camS = FX.camera($('#s7Cam'), { fx: 960, fy: 540, s: 1 });
    camS.set(tl, 78, { fx: 960, fy: 540 - 420, s: 1 });
    camS.to(tl, 78, 0.8, { fx: 960, fy: 540, s: 1 }, 'power4.out');                               // rises in
    tl.fromTo('#capsKick', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5 }, 78.15);
    FX.waterfall(tl, FX.words($('#capsHead')), 78.25, { stagger: 0.07, y: 50, blur: 10, dur: 0.8 });
    tl.fromTo(tiles, { opacity: 0, y: 70, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out', stagger: 0.12 }, 79.3);
    tiles.forEach(function (t, i) {
      const strokes = $$('svg *', t);
      strokes.forEach(function (s) {
        const len = (s.getTotalLength ? s.getTotalLength() : 60) || 60;
        s.style.strokeDasharray = len;
        tl.fromTo(s, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' }, 79.5 + i * 0.12);
      });
      tl.fromTo($('.shine', t), { x: 0 }, { x: 760, duration: 0.9, ease: 'power2.inOut' }, 82.2 + i * 0.1);
      S('ui-popup-dry', 79.3 + i * 0.12, 0.22);
    });
    S('impact-zoom-quick', 78.05, 0.5); S('shimmer-sparkle-sweep', 82.2, 0.35);
    tl.to('#bgNight', { opacity: 0, duration: 0.6, ease: 'power2.inOut' }, 85.55);
    tl.to('#s7Cam', { opacity: 0, filter: 'blur(8px)', duration: 0.45, ease: 'power2.in' }, 85.6);
    S('air-woosh-quick', 85.6, 0.5);
  }

  /* ======================= 10 · END CARD + LOOP ======================= */
  function buildS8() {
    const logo = $('#endLogo');
    logo.innerHTML = logoSVG('lg8');
    $('#qrSlot').innerHTML = window.MONI_QR;
    FX.waterfall(tl, $$('.lg', logo), 86.2, { stagger: 0.07, y: 30, blur: 6, dur: 0.75 });
    drawSwirl(logo, 86.5, 1.1);
    FX.waterfall(tl, FX.words($('#endHead')), 86.9, { stagger: 0.06, y: 40, blur: 8, dur: 0.75 });
    tl.fromTo('#endUrl', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 87.6);
    tl.fromTo('#qrCard', { opacity: 0, x: 80, rotateZ: 2 }, { opacity: 1, x: 0, rotateZ: 0, duration: 0.9, ease: 'power3.out' }, 86.6);
    tl.fromTo('#endMeta', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, 88);
    tl.fromTo('#confBadge', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, 88.2);
    S('shimmer-sparkle-sweep', 86.3, 0.5); S('chime-crystal', 87.6, 0.3);
    // the card holds perfectly still so people can scan the QR code (a slow drift would make text shimmer)
    // loop seam: the end card dissolves into the exact opening frame of the hook
    tl.to('#s8Cam', { opacity: 0, filter: 'blur(10px)', duration: 1.1, ease: 'power2.inOut' }, 94.4);
    const items = buildField($('#s8World'));
    fieldAt(items, 0);
    tl.set($$('.frag', $('#s8World')), { opacity: 0 }, 86);
    items.forEach(function (it) { tl.to(it.e, { opacity: it.s.op, duration: 1.2, ease: 'power1.inOut' }, 94.75); });
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
    buildC();
    buildS6();
    buildA();
    buildS7();
    buildS8();
    FX.flushInit(tl);
    const cyr = [], tw = document.createTreeWalker($('#root'), NodeFilter.SHOW_TEXT, null);
    while (tw.nextNode()) { if (/[\u0400-\u04FF]/.test(tw.currentNode.nodeValue)) cyr.push(tw.currentNode.nodeValue.trim().slice(0, 80)); }
    window.__CYRILLIC = cyr;
    if (cyr.length) console.warn('Cyrillic text in the film:', cyr);
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
