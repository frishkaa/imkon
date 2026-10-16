// Scope tajiklaw.ai's stylesheet under .moni and strip clock-driven CSS (transitions/keyframes).
// usage: node tools/scope-css.mjs style.css assets/css/moni-site.css   (needs: npm i postcss postcss-prefix-selector)
import fs from 'fs';
import postcss from 'postcss';
import prefixer from 'postcss-prefix-selector';
const [inp, out] = process.argv.slice(2);
const css = fs.readFileSync(inp, 'utf8');
// drop @import (google fonts) and font-face (we ship our own)
const res = await postcss([
  { postcssPlugin: 'strip', Once(root) {
    root.walkAtRules(r => { if (['import', 'font-face', 'keyframes', '-webkit-keyframes'].includes(r.name)) r.remove(); });
    root.walkDecls(d => { if (/^(-webkit-)?(transition|animation)(-|$)/.test(d.prop) || d.prop === 'will-change') d.remove(); if (d.prop === 'font-family') d.value = d.value.replace(/'SF Mono',\s*'Fira Code',\s*/, ''); });
    root.walkRules(r => { if (!r.nodes || r.nodes.length === 0) r.remove(); });
  } },
  prefixer({
    prefix: '.moni',
    transform(prefix, selector, prefixed) {
      if (selector.startsWith(':root')) return selector.replace(':root', prefix);
      if (/^\[data-theme/.test(selector)) return prefix + selector;
      if (/^html\[data-theme/.test(selector)) return selector.replace(/^html/, prefix);
      if (/^(html|body)\b/.test(selector)) return selector.replace(/^(html|body)/, prefix);
      return prefixed;
    }
  })
]).process(css, { from: undefined });
let s = res.css.replace(/(\d+(?:\.\d+)?)vh\b/g, 'calc(var(--vh) * $1)').replace(/(\d+(?:\.\d+)?)vw\b/g, 'calc(var(--vw) * $1)');
// keyframes names: prefix not needed; but kill all animations/transitions (GSAP drives everything)

fs.writeFileSync(out, s);
console.log('ok', s.length);
