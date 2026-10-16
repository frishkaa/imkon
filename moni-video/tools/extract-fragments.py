"""Turn captured tajiklaw.ai/trial pages (saved by Playwright) into clean, script-free HTML
fragments that the film re-renders with the site's own (scoped) CSS.

usage: python3 tools/extract-fragments.py <capture-dir> assets/data/fragments.js
"""
import json, re, sys, html as H
from pathlib import Path

cap = Path(sys.argv[1]); out = Path(sys.argv[2])

def body_of(p):
    s = Path(p).read_text(encoding='utf-8')
    return s[s.find('<body'):s.rfind('</body>')]

def clean(s):
    s = re.sub(r'<script\b.*?</script>', '', s, flags=re.S)
    s = re.sub(r'<style\b.*?</style>', '', s, flags=re.S)
    s = re.sub(r'\son\w+="[^"]*"', '', s)                     # inline handlers
    s = re.sub(r'<input type="file"[^>]*>', '', s)
    s = re.sub(r'<input type="hidden"[^>]*>', '', s)
    s = s.replace('/trial/image/Moni.png', 'assets/brand/moni-logo.svg')
    s = s.replace('/trial/image/Moni-dark.png', 'assets/brand/moni-logo.svg')
    s = re.sub(r'\sid="', ' data-sid="', s)                     # keep ids as data attrs (avoid dup ids)
    return s

def grab(s, start_pat, tag='div'):
    """return outerHTML of the first element whose opening tag matches start_pat (balanced)."""
    m = re.search(start_pat, s)
    if not m: return ''
    i = m.start(); depth = 0
    for t in re.finditer(r'<(/?)(%s)\b[^>]*?(/?)>' % tag, s[i:]):
        if t.group(1): depth -= 1
        elif not t.group(3): depth += 1
        if depth == 0: return s[i:i + t.end()]
    return s[i:]

frag = {}
qa = clean(body_of(cap / 'q2/answer.html'))
frag['header'] = grab(qa, r'<header class="header"', 'header')
frag['sbToggle'] = grab(qa, r'<button class="sb-toggle"', 'button')
welcome_src = clean(body_of(cap / 'rev/attached.html'))
frag['welcome'] = grab(welcome_src, r'<div class="welcome"')
frag['welcome'] = re.sub(r'<div class="calc-panel".*?(?=<div class="disclaimer-text")', '', frag['welcome'], flags=re.S)
frag['welcome'] = re.sub(r'<div class="voice-wave".*?</button></div>', '', frag['welcome'], flags=re.S)
frag['attachChip'] = grab(welcome_src, r'<div class="attach-chip"')
frag['welcome'] = frag['welcome'].replace(frag['attachChip'], '')
frag['modeBarChat'] = grab(qa, r'<div class="mode-bar compact"')
frag['inputWrapChat'] = grab(qa, r'<div class="input-wrap" data-sid="inputWrapChat"')
frag['uploadNoticeChat'] = grab(qa, r'<div class="upload-notice" data-sid="uploadNoticeChat"')
frag['footerBottom'] = grab(qa, r'<div class="footer-bottom"')

def msgs(p):
    return json.loads(Path(p).read_text(encoding='utf-8'))

for key, path in [('qa', 'q2/answer.msgs.json'), ('qa_limit', 'q4/answer.msgs.json'), ('qa_consumer', 'q5/answer.msgs.json'), ('draft', 'draft2/draft.msgs.json')]:
    try:
        ms = msgs(cap / path)
    except FileNotFoundError:
        continue
    frag[key] = [{'cls': m['cls'], 'route': m['route'], 'html': clean(m['html'])} for m in ms]

dv = clean(body_of(cap / 'draft2/opened.html'))
frag['docViewer'] = grab(dv, r'<div class="dv-panel"')
try:
    frag['draftDoc'] = json.loads((cap / 'draft2/doc.json').read_text(encoding='utf-8'))
except FileNotFoundError:
    pass
out.write_text('window.FRAG = ' + json.dumps(frag, ensure_ascii=False) + ';\n', encoding='utf-8')
for k, v in frag.items():
    print(k, len(json.dumps(v, ensure_ascii=False)))
