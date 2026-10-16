"""Moní v3 score: a slow felt-piano and strings cue, composed and synthesized from scratch.

No samples and no generative-audio models. The piano is additive synthesis (inharmonic partials,
two detuned strings per note, two-stage decay, felt hammer filter); the strings are detuned
band-limited saws through a low-pass; the reverb is a convolution with a synthesized impulse response.

The picture's cue list (assets/data/cues.js) is the source of truth: the music is scored to it.
60 BPM in D-flat major, so one beat = one second and every scene boundary falls on a beat.

usage: python3 tools/score.py assets/data/cues.js assets/audio/score.wav
"""
import json, sys, wave
import numpy as np
from scipy import signal

CUES = json.loads(open(sys.argv[1]).read().split('=', 1)[1].strip().rstrip(';'))
SR = 48000
DUR = float(CUES['duration'])
N = int(SR * DUR)
rng = np.random.default_rng(20261030)

def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)

def lp(x, fc, order=2):
    b, a = signal.butter(order, min(fc, SR * 0.45) / (SR / 2), 'low')
    return signal.lfilter(b, a, x)

def hp(x, fc, order=2):
    b, a = signal.butter(order, fc / (SR / 2), 'high')
    return signal.lfilter(b, a, x)

def bp(x, lo, hi):
    b, a = signal.butter(2, [lo / (SR / 2), min(hi, SR * 0.45) / (SR / 2)], 'band')
    return signal.lfilter(b, a, x)

def saw_blep(freq, n, phase0=0.0):
    f = np.broadcast_to(np.asarray(freq, dtype=np.float64), (n,))
    dt = f / SR
    ph = (phase0 + np.cumsum(dt)) % 1.0
    y = 2 * ph - 1
    m1 = ph < dt
    x = ph[m1] / dt[m1]; y[m1] -= x + x - x * x - 1
    m2 = ph > 1 - dt
    x = (ph[m2] - 1) / dt[m2]; y[m2] -= x * x + x + x + 1
    return y

def place(bus, x, t, gain=1.0, pan=0.0):
    i = int(round(t * SR))
    if i >= N: return
    if x.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        x = np.stack([x * l * 1.414, x * r * 1.414], 1)
    j = min(N, i + len(x))
    bus[i:j] += x[:j - i] * gain

# ---------------------------------------------------------------- instruments
def piano(m, vel=0.4, hold=3.0):
    """felt piano note. vel 0..1 sets loudness and brightness; hold = seconds before the damper falls."""
    f0 = mtof(m)
    t60 = float(np.clip(16 * 2 ** (-(m - 33) / 15), 2.2, 16))      # low notes ring longer
    length = min(hold + 0.9, t60 * 0.9 + 0.2)
    n = int(length * SR); t = np.arange(n) / SR
    B = 0.00011 * 2 ** ((m - 60) / 16)                               # string stiffness (inharmonicity)
    tilt = 2.35 - 0.9 * vel                                          # softer touch = darker
    out = np.zeros(n)
    k = 1
    while True:
        fk = k * f0 * np.sqrt(1 + B * k * k)
        if fk > 11000 or k > 30: break
        amp = abs(np.sin(np.pi * k / 7.3)) / k ** tilt                # hammer strikes 1/7.3 along the string
        tau = t60 / 6.9 / (1 + 0.22 * (k - 1) ** 1.25)
        env = 0.5 * np.exp(-t / (tau * 0.18)) + 0.5 * np.exp(-t / tau)   # prompt sound + aftersound
        det = 2 ** ((0.35 + 0.04 * k) / 1200)                          # two strings, slightly apart
        p1, p2 = rng.uniform(0, 2 * np.pi, 2)
        out += amp * env * (np.sin(2 * np.pi * fk * t + p1) + 0.85 * np.sin(2 * np.pi * fk * det * t + p2))
        k += 1
    att = 1 - np.exp(-t / (0.006 - 0.003 * vel))                       # felt: a rounded attack
    out *= att
    # felt hammer + key mechanism: a short, low knock
    knock = bp(rng.standard_normal(n), 120, 900) * np.exp(-t / 0.018) * 0.06
    out = out / 2.2 + knock
    out = lp(out, 900 + 5200 * vel ** 1.6 + 0.6 * f0)                  # the felt muffles the top
    damp = np.ones(n); i = int(hold * SR)
    if i < n: damp[i:] = np.exp(-(t[i:] - hold) / 0.16)
    return out * damp * vel

def chord(bus, notes, t, vel=0.3, hold=3.5, roll=0.035, pan=0.0):
    for i, m in enumerate(sorted(notes)):
        place(bus, piano(m, vel * (0.92 if i else 1.0), hold), t + i * roll, 1.0, pan + (m - 60) / 60)

def strings(notes, t0, t1, att=1.8, rel=2.4, cutoff=1500):
    """string-ensemble pad: 4 detuned saws per note with slow vibrato, low-passed, in stereo"""
    n = int((t1 - t0 + rel) * SR); t = np.arange(n) / SR
    L = np.zeros(n); R = np.zeros(n)
    for m in notes:
        for v, c in enumerate((-7, -2.5, 2.5, 7)):
            rate = 4.6 + 0.37 * v + 0.05 * m % 1
            vib = 1 + 0.0011 * np.sin(2 * np.pi * rate * t + v * 1.7)
            s = saw_blep(mtof(m) * 2 ** (c / 1200) * vib, n, rng.uniform())
            (L if v % 2 == 0 else R)[:] += s
    env = np.ones(n)
    a = int(att * SR); env[:a] = np.sin(np.linspace(0, np.pi / 2, a)) ** 2
    r0 = int((t1 - t0) * SR); env[r0:] = np.cos(np.linspace(0, np.pi / 2, n - r0)) ** 2
    out = np.stack([L, R], 1) * env[:, None] / (2 * len(notes))
    for ch in (0, 1):
        out[:, ch] = hp(lp(lp(out[:, ch], cutoff), cutoff * 1.6), 140)
    return out

def sub(m, t0, t1, att=1.4, rel=2.0):
    n = int((t1 - t0 + rel) * SR); t = np.arange(n) / SR
    f = mtof(m)
    x = np.sin(2 * np.pi * f * t) + 0.18 * np.sin(4 * np.pi * f * t)
    env = np.ones(n); a = int(att * SR); env[:a] = np.sin(np.linspace(0, np.pi / 2, a)) ** 2
    r0 = int((t1 - t0) * SR); env[r0:] = np.cos(np.linspace(0, np.pi / 2, n - r0)) ** 2
    return lp(x * env, 160)

def boom(m=25):
    """the soft, deep 'felt' hit under the logo: a pitched-down sine, no click"""
    n = int(3.5 * SR); t = np.arange(n) / SR
    f = mtof(m) * (1 + 0.12 * np.exp(-t / 0.08))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 1.1) * (1 - np.exp(-t / 0.012))
    return lp(x, 140)

def air(len_s=2.2):
    """a breath of filtered noise swelling into a downbeat (the only 'transition' sound)"""
    n = int(len_s * SR); t = np.arange(n) / SR
    x = bp(rng.standard_normal(n), 2500, 9000) + 0.6 * bp(rng.standard_normal(n), 500, 2000)
    e = (t / len_s) ** 3; e[-int(0.06 * SR):] *= np.linspace(1, 0, int(0.06 * SR))
    return x * e

# ---------------------------------------------------------------- composition
DB_MAJ9 = [49, 56, 60, 63, 65]; BBM9 = [46, 53, 56, 60, 61]; GB_MAJ7S11 = [54, 58, 60, 61, 65]
AB_SUS = [51, 56, 61, 63]; AB = [51, 56, 60, 63]; DB_F = [53, 56, 61, 65, 68]
GB_MAJ9 = [54, 58, 61, 65, 68]; EBM9 = [51, 54, 58, 61, 65]; AB13SUS = [51, 54, 56, 61, 65]
GB_MAJ7 = [53, 54, 58, 61]; AB7SUS = [54, 56, 61, 63]

# (start, end, voicing, bass) — chord changes sit on the scene cues
PLAN = [
    (0, 4, DB_MAJ9, 37), (4, 8, BBM9, 34),                                  # open
    (8, 11, GB_MAJ7S11, 30), (11, 14, AB_SUS, 32),                          # logo
    (14, 18, DB_F, 41), (18, 22, GB_MAJ9, 42), (22, 25, EBM9, 39), (25, 28, AB13SUS, 32),   # ask
    (28, 32, BBM9, 34), (32, 36, GB_MAJ7, 30), (36, 40, AB7SUS, 32),        # review
    (40, 44, GB_MAJ9, 30), (44, 47.5, AB, 32),                              # draft
    (48, 56, DB_MAJ9, 37),                                                  # end card
]

piano_bus = np.zeros((N, 2)); pad_bus = np.zeros((N, 2)); low_bus = np.zeros((N, 2)); fx_bus = np.zeros((N, 2))

for t0, t1, v, b in PLAN:
    final = t0 == 48
    chord(piano_bus, [b - 12, b] + v if final else [b] + v, t0, vel=0.34 if final else 0.26, hold=(DUR - t0 if final else t1 - t0), roll=0.05 if final else 0.03)
    place(pad_bus, strings([m + 12 for m in v[-3:]] + v[:2], t0, min(t1, DUR - 3) if final else t1 + 0.15,
                           att=2.6 if t0 in (0, 48) else 1.4, rel=3.2 if final else 1.6, cutoff=1300 if t0 < 14 else 1700), t0)
    place(low_bus, sub(b - 12 if b > 36 else b, t0, t1, att=1.0, rel=1.4 if not final else 3.0), t0, 1.0)

# eighth-note ostinato through the three product scenes (14 → 47.5 s); quarter notes while the page is read
for t0, t1, v, b in PLAN:
    if not (14 <= t0 < 48): continue
    tones = sorted(set([m + 12 for m in v] + [v[0] + 24]))
    pat = [0, 2, 4, 3, 1, 3, 2, 4]
    step = 0.5 if not (28 <= t0 < 40) else 1.0
    k = 0; t = t0
    while t < t1 - 1e-6 and t < 47.5:
        m = tones[pat[k % 8] % len(tones)]
        accent = 1.0 if abs(t - round(t)) < 1e-6 else 0.8
        place(piano_bus, piano(m, 0.17 * accent, hold=0.9 if step == 0.5 else 1.6), t, 1.0, -0.25 + 0.5 * (k % 2))
        k += 1; t += step

# the theme: four falling notes, stated in the open and answered on the end card
K = CUES
MEL = [(0.6, 77, .40, 1.0), (1.6, 75, .32, 1.0), (2.6, 73, .32, 1.4), (4.0, 72, .36, 1.0), (5.0, 73, .30, 1.0), (6.0, 68, .32, 1.9),
       (K['logo']['tag'], 82, .26, 1.2), (K['logo']['tag'] + 1.0, 80, .24, 2.4),          # tagline
       (K['ask']['answer'], 77, .30, 1.6), (K['ask']['cite'], 80, .24, 1.6),              # the answer arrives, then its source
       (K['review']['note'], 73, .30, 2.0), (K['review']['fix'], 77, .30, 2.4),           # the finding, then the fix
       (K['draft']['head'], 80, .26, 2.0),                                                # draft
       (48.0, 77, .40, 1.0), (49.0, 75, .32, 1.0), (50.0, 72, .32, 1.0), (51.0, 73, .38, 5.0)]
for t, m, vel, hold in MEL:
    place(piano_bus, piano(m, vel, hold), t, 1.0, 0.12)

# the two brand moments: logo in, end card in
for t in (CUES['logo']['in'], CUES['end']['logo']):
    place(low_bus, boom(25 if t > 40 else 30), t, 0.55)
    place(fx_bus, air(2.2), t - 2.2, 0.05, pan=0.0)
place(piano_bus, piano(30, 0.42, 5.5), CUES['logo']['in'], 0.9, -0.2)   # G-flat 1 under the logo
place(piano_bus, piano(42, 0.32, 5.5), CUES['logo']['in'], 0.9, -0.1)

# ---------------------------------------------------------------- mix
def reverb_ir(len_s=4.2, tau=0.62):
    n = int(len_s * SR); t = np.arange(n) / SR
    ir = np.stack([rng.standard_normal(n), rng.standard_normal(n)], 1) * np.exp(-t / tau)[:, None]
    for ch in (0, 1):    # darker as it decays
        y = np.zeros(n); zi = np.zeros(2); blk = 1024
        for i in range(0, n, blk):
            fc = 7000 * np.exp(-t[i] / 1.0) + 700
            bb, aa = signal.butter(2, fc / (SR / 2), 'low')
            y[i:i + blk], zi = signal.lfilter(bb, aa, ir[i:i + blk, ch], zi=zi)
        ir[:, ch] = y
    ir[: int(0.022 * SR)] = 0                                            # pre-delay
    return ir / np.sqrt(np.sum(ir ** 2, 0))

IR = reverb_ir()
def verb(x, wet):
    y = np.stack([signal.fftconvolve(x[:, c], IR[:, c])[:N] for c in (0, 1)], 1)
    return x * (1 - wet * 0.35) + y * wet

for name, bus in (('piano', piano_bus), ('pad', pad_bus), ('low', low_bus), ('fx', fx_bus)):
    print(f'  {name:6s} rms {20 * np.log10(np.sqrt(np.mean(bus ** 2)) + 1e-12):6.1f} dB  peak {20 * np.log10(np.max(np.abs(bus)) + 1e-12):6.1f} dB')
def at(bus, db):     # set a bus to a target RMS level (dBFS) before the mix
    return bus * 10 ** (db / 20) / (np.sqrt(np.mean(bus ** 2)) + 1e-12)
mix = verb(at(piano_bus, -20), 0.42) + verb(at(pad_bus, -29), 0.55) + at(low_bus, -34) + verb(at(fx_bus, -46), 0.6)
for c in (0, 1):
    mix[:, c] = hp(mix[:, c], 36, order=4)       # TV speakers can't use the very bottom; keep it clean
# gentle levelling (slow RMS, 2:1 above threshold) and a soft ceiling
rms = np.sqrt(np.convolve(np.mean(mix ** 2, 1), np.ones(4800) / 4800, 'same')) + 1e-9
thr = np.percentile(rms, 70)
gain = np.where(rms > thr, (thr / rms) ** 0.5, 1.0)
gain = np.convolve(gain, np.ones(2400) / 2400, 'same')[:, None]
mix *= gain
fade_in = np.minimum(1, np.arange(N) / (0.05 * SR))[:, None]
fl = int(2.5 * SR); fade = np.ones(N); fade[-fl:] = np.cos(np.linspace(0, np.pi / 2, fl)) ** 2
mix *= fade_in * fade[:, None]
mix *= 10 ** (-1.5 / 20) / np.max(np.abs(mix))
# +2.5 dB of make-up into a smooth peak limiter (2 ms look-ahead, 250 ms release) so it sits near -16 LUFS
mix *= 10 ** (2.5 / 20)
ceil = 10 ** (-1.5 / 20)
peak = np.max(np.abs(mix), 1)
la = int(0.002 * SR)
peak = np.maximum.reduce([np.roll(peak, -k) for k in range(la)])
g = np.minimum(1.0, ceil / (peak + 1e-9))
rel = np.exp(-1 / (0.25 * SR))
for i in range(1, N):                     # instant attack, exponential release
    g[i] = min(g[i], g[i - 1] * rel + (1 - rel))
mix *= np.convolve(g, np.ones(la) / la, 'same')[:, None]
mix = np.clip(mix, -ceil, ceil)

pcm = (mix * 32767).astype('<i2')
with wave.open(sys.argv[2], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('wrote', sys.argv[2], f'{DUR:.1f}s')
