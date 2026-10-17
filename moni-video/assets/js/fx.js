/* Seek-safe motion helpers for the Moní film. Everything here is a pure function of timeline
   time: proxies tweened by GSAP write the DOM in onUpdate, and every writer handles jumps in
   either direction (HyperFrames seeks frames out of order across parallel workers). */
(function () {
  const FX = {};
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  FX.clamp = clamp;

  FX.el = function (tag, cls, html, parent) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    if (parent) parent.appendChild(e);
    return e;
  };

  /* Wrap every word of every text node under `root` in <span class="w">. Returns the spans. */
  FX.splitWords = function (root) {
    const words = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (n) {
      const parts = n.nodeValue.split(/(\s+)/);
      if (parts.length === 1 && !parts[0].trim()) return;
      const frag = document.createDocumentFragment();
      parts.forEach(function (p) {
        if (!p) return;
        if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
        const s = document.createElement('span');
        s.className = 'w';
        s.textContent = p;
        frag.appendChild(s);
        words.push(s);
      });
      n.parentNode.replaceChild(frag, n);
    });
    return words;
  };

  /* Token-stream reveal (like Moní's SSE stream): words fade in with a soft leading edge of
     `lead` words. Blocks (li, hr, tr, ...) follow the first word they contain/precede. */
  FX.stream = function (tl, root, start, dur, opts) {
    opts = opts || {};
    const lead = opts.lead || 6;
    const words = FX.splitWords(root);
    const N = words.length;
    const blocks = [];
    root.querySelectorAll(opts.blocks || 'li, hr, tr, .lang-tag').forEach(function (b) {
      let idx = N;
      const first = b.querySelector('.w');
      if (first) idx = words.indexOf(first);
      else {
        for (let i = 0; i < N; i++) {
          if (b.compareDocumentPosition(words[i]) & Node.DOCUMENT_POSITION_FOLLOWING) { idx = i; break; }
        }
      }
      blocks.push({ el: b, idx: idx });
    });
    const op = function (i, p) { return clamp((p - i) / lead, 0, 1); };
    words.forEach(function (w) { w.style.opacity = 0; });
    blocks.forEach(function (b) { b.el.style.opacity = 0; });
    const st = { p: 0 };
    let last = 0;
    const apply = function () {
      const p = st.p;
      const lo = Math.floor(Math.min(last, p) - lead) - 1;
      const hi = Math.ceil(Math.max(last, p)) + 1;
      for (let i = Math.max(0, lo); i < Math.min(N, hi); i++) words[i].style.opacity = op(i, p);
      for (let k = 0; k < blocks.length; k++) {
        const b = blocks[k];
        if (b.idx >= lo - lead && b.idx <= hi + lead) b.el.style.opacity = op(b.idx, p + lead * 0.6);
      }
      last = p;
    };
    tl.to(st, { p: N + lead, duration: dur, ease: opts.ease || 'none', onUpdate: apply }, start);
    return { words: words, count: N, timeOfWord: function (i) { return start + dur * (i + lead) / (N + lead); } };
  };

  /* Typing into a fake input: text appears char by char; caret blinks only while idle. */
  FX.type = function (tl, textEl, text, start, dur, field) {
    const st = { n: 0 };
    textEl.textContent = '';
    const line = field && field.line, box = field && field.box;
    tl.to(st, {
      n: text.length, duration: dur, ease: 'none',
      onUpdate: function () {
        textEl.textContent = text.slice(0, Math.round(st.n));
        if (line) {   // keep the caret in view, like a real single-line input
          const over = line.scrollWidth - box.clientWidth;
          line.style.transform = over > 0 ? 'translateX(' + (-over - 6) + 'px)' : 'none';
        }
      }
    }, start);
  };

  /* Deterministic caret blink (steps), active between t0 and t1. */
  FX.blink = function (tl, el, t0, t1, period) {
    period = period || 1.0;
    const n = Math.max(0, Math.floor((t1 - t0) / period));
    for (let i = 0; i < n; i++) {
      tl.set(el, { opacity: 0 }, t0 + i * period + period * 0.5);
      tl.set(el, { opacity: 1 }, t0 + (i + 1) * period);
    }
  };

  /* Camera rig: maps focus point (fx, fy) of the content to the frame centre at scale s with
     optional tilt. transform = translate(C) rotateX rotateY scale(s) translate(-F). */
  FX.camera = function (el, init, centre) {
    const C = centre || [960, 540];
    const st = Object.assign({ fx: 960, fy: 540, s: 1, rx: 0, ry: 0, rz: 0 }, init || {});
    const write = function () {
      el.style.transform = 'translate(' + C[0] + 'px,' + C[1] + 'px) rotateX(' + st.rx + 'deg) rotateY(' + st.ry +
        'deg) rotateZ(' + st.rz + 'deg) scale(' + st.s + ') translate(' + (-st.fx) + 'px,' + (-st.fy) + 'px)';
    };
    write();
    return {
      state: st,
      set: function (tl, t, v) { tl.set(st, Object.assign({}, v, { onUpdate: write }), t); },
      to: function (tl, t, dur, v, ease) {
        tl.to(st, Object.assign({}, v, { duration: dur, ease: ease || 'power3.inOut', onUpdate: write }), t);
      },
      write: write
    };
  };

  /* Oversized macOS-style pointer. Tip sits at (5, 3) of a 24-unit box. */
  FX.CURSOR_SVG = '<svg viewBox="0 0 24 24"><path d="M5 3 L5 20.2 L9.1 16.4 L12 22.6 L15.1 21.2 L12.3 15.1 L18.2 15.1 Z" fill="#1c1c1c" stroke="#ffffff" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  FX.cursor = function (parent, size) {
    const c = FX.el('div', 'cursor', FX.CURSOR_SVG, parent);
    c.style.width = size + 'px'; c.style.height = size + 'px';
    const tipX = size * 5 / 24, tipY = size * 3 / 24;
    const ring = FX.el('div', 'click-ring', null, parent);
    const api = {
      el: c, ring: ring,
      place: function (tl, t, x, y) { tl.set(c, { x: x - tipX, y: y - tipY }, t); },
      move: function (tl, t, dur, x, y, ease) { tl.to(c, { x: x - tipX, y: y - tipY, duration: dur, ease: ease || 'power3.out' }, t); },
      click: function (tl, t) {
        tl.to(c, { scale: 0.84, duration: 0.1, ease: 'power2.in', transformOrigin: '21% 12%' }, t);
        tl.to(c, { scale: 1, duration: 0.22, ease: 'power2.out', transformOrigin: '21% 12%' }, t + 0.1);
        tl.fromTo(ring, { x: 0, y: 0, scale: 0.3, opacity: 0.9 }, { scale: 1.6, opacity: 0, duration: 0.5, ease: 'power2.out' }, t + 0.04);
      },
      ringAt: function (tl, t, x, y) { tl.set(ring, { left: x, top: y }, t); }
    };
    tl0(function (tl) { tl.set(c, { x: -400, y: 2000 }, 0); });
    return api;
  };
  const pending = [];
  function tl0(fn) { pending.push(fn); }
  FX.flushInit = function (tl) { pending.forEach(function (fn) { fn(tl); }); pending.length = 0; };

  /* Measure an element's box in the coordinate space of `space` (untransformed layout).
     Temporarily forces the owning scene visible so hidden clips still have layout. */
  FX.measure = function (el, space) {
    const scenes = [];
    let p = el;
    while (p && p !== document.body) {
      if (p.classList && p.classList.contains('scene')) scenes.push(p);
      p = p.parentElement;
    }
    const saved = scenes.map(function (s) { return [s, s.getAttribute('style')]; });
    scenes.forEach(function (s) { s.style.display = 'block'; s.style.visibility = 'visible'; });
    const r = el.getBoundingClientRect();
    const a = space.getBoundingClientRect();
    const k = a.width / (space.offsetWidth || a.width || 1);
    saved.forEach(function (pair) { if (pair[1] == null) pair[0].removeAttribute('style'); else pair[0].setAttribute('style', pair[1]); });
    const x = (r.left - a.left) / k, y = (r.top - a.top) / k, w = r.width / k, h = r.height / k;
    return { x: x, y: y, w: w, h: h, cx: x + w / 2, cy: y + h / 2, r: x + w, b: y + h };
  };

  /* Directional motion blur for fast camera moves. A one-axis SVG Gaussian whose strength follows the
     move's own velocity curve: a power4 move (x ~ t^5) has velocity ~ t^4, so the blur rides a power3
     (quartic) curve up into the cut ('in') or down out of it ('out'). Peak sigma ~ 0.012 * distance /
     duration (local px), i.e. roughly a 180-degree shutter at 60 fps. Removed entirely when ~0. */
  let mbN = 0;
  FX.whipBlur = function (tl, el, t, dur, dist, mode, axis) {
    const id = 'mb' + (++mbN), peak = 0.012 * dist / dur;
    const defs = document.getElementById('fxDefs');
    defs.insertAdjacentHTML('beforeend', '<filter id="' + id + '" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">' +
      '<feGaussianBlur stdDeviation="0 0" edgeMode="duplicate"/></filter>');
    const g = defs.lastElementChild.firstElementChild;
    const st = { v: 0 };
    const write = function () {
      if (st.v < 0.3) { el.style.filter = ''; return; }
      g.setAttribute('stdDeviation', axis === 'y' ? '0 ' + st.v.toFixed(2) : st.v.toFixed(2) + ' 0');
      el.style.filter = 'url(#' + id + ')';
    };
    if (mode === 'out') tl.fromTo(st, { v: peak }, { v: 0, duration: dur, ease: 'power3.out', onUpdate: write, immediateRender: false }, t);
    else tl.fromTo(st, { v: 0 }, { v: peak, duration: dur, ease: 'power3.in', onUpdate: write, immediateRender: false }, t);
  };

  /* Layout height (ignores transforms such as a tilted page), with the owning scene forced visible. */
  FX.layoutHeight = function (el) {
    const scenes = [];
    let p = el;
    while (p && p !== document.body) { if (p.classList && p.classList.contains('scene')) scenes.push(p); p = p.parentElement; }
    const saved = scenes.map(function (s) { return [s, s.getAttribute('style')]; });
    scenes.forEach(function (s) { s.style.display = 'block'; s.style.visibility = 'visible'; });
    const h = el.offsetHeight;
    saved.forEach(function (pair) { if (pair[1] == null) pair[0].removeAttribute('style'); else pair[0].setAttribute('style', pair[1]); });
    return h;
  };

  /* Reading holds. The film is authored on one clock; `holds` ([authored time, seconds], whole bars) pause the
     story there so text stays on screen longer. W maps authored time to film time. */
  FX.warp = function (holds) {
    const hs = holds.slice().sort(function (a, b) { return a[0] - b[0]; });
    const W = function (t) { let s = t; for (let i = 0; i < hs.length; i++) if (hs[i][0] < t - 1e-6) s += hs[i][1]; return s; };
    W.holds = hs;
    return W;
  };
  /* A timeline facade that places every tween through W. Short tweens (UI fades, clicks, cursor moves) jump whole
     to whichever side of a hold their midpoint falls on, so they keep their speed; long ones (camera drifts, text
     streams, scrolls) stretch across it, so a reveal simply runs slower. Staggered groups count as one span. */
  FX.warped = function (tl, W, snap) {
    snap = snap == null ? 1.25 : snap;
    const place = function (targets, v, p) {
      if (typeof p !== 'number') return [v, p];
      const d = v.duration == null ? 0.5 : v.duration;
      const n = typeof v.stagger === 'number' ? gsap.utils.toArray(targets).length : 1;
      const span = d + (n > 1 ? v.stagger * (n - 1) : 0);
      if (span <= snap) { const mid = p + span / 2; return [v, p + W(mid) - mid]; }
      const p2 = W(p), k = (W(p + span) - p2) / span;
      if (Math.abs(k - 1) < 1e-6) return [v, p2];
      const v2 = Object.assign({}, v, { duration: d * k });
      if (n > 1) v2.stagger = v.stagger * k;
      return [v2, p2];
    };
    return {
      to: function (t, v, p) { const a = place(t, v, p); return tl.to(t, a[0], a[1]); },
      fromTo: function (t, f, v, p) { const a = place(t, v, p); return tl.fromTo(t, f, a[0], a[1]); },
      set: function (t, v, p) { return tl.set(t, v, typeof p === 'number' ? W(p) : p); },
      seek: function (x) { return tl.seek(x); },
      W: W, timeline: tl
    };
  };

  /* Waterfall entry: staggered rise + de-blur of word spans. */
  FX.waterfall = function (tl, els, t, opts) {
    opts = opts || {};
    tl.fromTo(els, { y: opts.y || 46, opacity: 0, filter: 'blur(' + (opts.blur || 10) + 'px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: opts.dur || 0.75, ease: opts.ease || 'power3.out', stagger: opts.stagger || 0.06 }, t);
  };

  /* Split an element's text into word spans (for display type). */
  FX.words = function (el) { return FX.splitWords(el); };

  /* Sound cues — collected at build time, mixed offline into the soundtrack (tools/mix-audio.py). */
  FX.cues = [];
  FX.sfx = function (name, t, gain) { FX.cues.push({ name: name, t: Math.round(t * 1000) / 1000, gain: gain == null ? 1 : gain }); };

  window.FX = FX;
})();
