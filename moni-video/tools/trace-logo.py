"""Trace the site's 320px Moni.png into assets/brand/moni-logo.svg (pip install potracer)."""
import numpy as np, potrace
from PIL import Image, ImageFilter
src = Image.open('site/pro/image/Moni.png').convert('RGBA')
S = 12
W0, H0 = src.size
big = src.resize((W0*S, H0*S), Image.BICUBIC)
rgb = np.array(big).astype(float)[..., :3]
gold = (rgb[..., 0] - rgb[..., 2] > 60)
def alpha_blur(sig):
    return np.array(big.split()[3].filter(ImageFilter.GaussianBlur(sig))).astype(float) / 255
def rdp(pts, eps):
    if len(pts) < 3: return pts
    a, b = np.array(pts[0]), np.array(pts[-1])
    ab = b - a; n = np.hypot(*ab) or 1e-9
    d = [abs(ab[0]*(p[1]-a[1]) - ab[1]*(p[0]-a[0])) / n for p in pts[1:-1]]
    i = int(np.argmax(d)) + 1
    if d[i-1] > eps:
        return rdp(pts[:i+1], eps)[:-1] + rdp(pts[i:], eps)
    return [pts[0], pts[-1]]
def trace_poly(mask, eps=0.35):
    plist = potrace.Bitmap(~mask).trace(turdsize=80, alphamax=0.0, opticurve=False)
    out = []
    for c in plist:
        pts = [(c.start_point.x/S, c.start_point.y/S)]
        for seg in c.segments:
            if seg.is_corner: pts += [(seg.c.x/S, seg.c.y/S), (seg.end_point.x/S, seg.end_point.y/S)]
            else: pts += [(seg.end_point.x/S, seg.end_point.y/S)]
        pts.append(pts[0])
        p0 = np.array(pts[0]); far = int(np.argmax([np.hypot(p[0]-p0[0], p[1]-p0[1]) for p in pts]))
        sp = rdp(pts[:far+1], eps)[:-1] + rdp(pts[far:], eps)
        out.append('M' + 'L'.join(f'{x:.2f},{y:.2f}' for x, y in sp[:-1]) + 'Z')
    return ' '.join(out)
def trace_curve(mask, alphamax=1.2, tol=0.8):
    plist = potrace.Bitmap(~mask).trace(turdsize=80, alphamax=alphamax, opticurve=True, opttolerance=tol)
    d = []
    for c in plist:
        parts = [f"M{c.start_point.x/S:.2f},{c.start_point.y/S:.2f}"]
        for seg in c.segments:
            if seg.is_corner: parts.append(f"L{seg.c.x/S:.2f},{seg.c.y/S:.2f}L{seg.end_point.x/S:.2f},{seg.end_point.y/S:.2f}")
            else: parts.append(f"C{seg.c1.x/S:.2f},{seg.c1.y/S:.2f} {seg.c2.x/S:.2f},{seg.c2.y/S:.2f} {seg.end_point.x/S:.2f},{seg.end_point.y/S:.2f}")
        parts.append('Z'); d.append(''.join(parts))
    return ' '.join(d)
a_lo = alpha_blur(S*0.3); a_hi = alpha_blur(S*0.8)
navy = (~gold)
def colmask(m, x0, x1):
    r = np.zeros_like(m); r[:, x0*S:x1*S] = m[:, x0*S:x1*S]; return r
mM = colmask((a_lo > 0.5) & navy, 5, 103)
mO = colmask((a_hi > 0.5) & navy, 104, 192)
mI = colmask((a_lo > 0.5) & navy, 270, 290)
nys = np.nonzero(mM)[0]; top = nys.min()
gl = (a_lo > 0.5) & gold; gl[:top + 2*S, :] = False
gs = (alpha_blur(S*0.6) > 0.42) & gold; gs[top + 2*S:, :] = False
paths = {'m': trace_poly(mM), 'o': trace_curve(mO, 1.3, 1.0), 'n': trace_poly(gl), 'i': trace_poly(mI), 'swirl': trace_curve(gs, 1.15, 0.5)}
NAVY, GOLD = '#222437', '#c18d48'
svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W0} {H0}" width="{W0}" height="{H0}">']
for k in ['m', 'o', 'n', 'i', 'swirl']:
    svg.append(f'<path id="logo-{k}" fill="{GOLD if k in ("n","swirl") else NAVY}" d="{paths[k]}"/>')
svg.append('</svg>')
open('/home/user/imkon/moni-video/assets/brand/moni-logo.svg', 'w').write('\n'.join(svg))
for k, v in paths.items(): print(k, len(v))
