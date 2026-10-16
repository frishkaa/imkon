"""Moní showreel score — composed and synthesized from scratch in numpy/scipy.

No samples, no generative-audio models: every sound below is an oscillator, a seeded noise
source, an envelope or a filter. 128 BPM, D minor, 12 bars + a 3.4 s tail (24.0 s total).

    B1  intro        Dm pad (filtered), ticking hats, opening impact
    B2  build        Bb, snare roll 8ths->16ths->32nds, noise + pitch riser, 1/8 gap
    B3-B6  drop      Dm Bb F C — four-on-the-floor, offbeat bass, claps, stabs
    B7-B10 lift      same changes + 16th arp, open hats, bell motif in B9-B10, fill
    B11 breakdown    Gm | A — drums out, filter opens, riser, 1/8 gap
    B12 finale       D major (Picardy third) impact, bell sting, ring-out

usage: python3 tools/synth.py assets/audio/score.wav assets/data/audio-env.js
"""
import json, sys
import numpy as np
from scipy import signal

SR = 48000
BPM = 128
BEAT = 60 / BPM
BAR = 4 * BEAT
S16 = BEAT / 4
DUR = 24.0
N = int(SR * DUR)
FPS = 60
rng = np.random.default_rng(20261030)

def t_of(bar, beat=0.0):            # bar is 1-based
    return (bar - 1) * BAR + beat * BEAT

def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)

def env_adsr(n, a, d, s, r, sustain_len):
    a_n, d_n, r_n = int(a * SR), int(d * SR), int(r * SR)
    s_n = max(0, int(sustain_len * SR) - a_n - d_n)
    e = np.concatenate([np.linspace(0, 1, max(1, a_n)), np.linspace(1, s, max(1, d_n)),
                        np.full(s_n, s), np.linspace(s, 0, max(1, r_n))])
    if len(e) < n: e = np.pad(e, (0, n - len(e)))
    return e[:n]

def saw_blep(freq, n, phase0=0.0):
    """band-limited sawtooth (polyBLEP); freq may be scalar or per-sample array"""
    f = np.broadcast_to(np.asarray(freq, dtype=np.float64), (n,))
    dt = f / SR
    ph = (phase0 + np.cumsum(dt)) % 1.0
    y = 2 * ph - 1
    m1 = ph < dt
    x = ph[m1] / dt[m1]; y[m1] -= x + x - x * x - 1
    m2 = ph > 1 - dt
    x = (ph[m2] - 1) / dt[m2]; y[m2] -= x * x + x + x + 1
    return y

def sine(freq, n, phase0=0.0):
    f = np.broadcast_to(np.asarray(freq, dtype=np.float64), (n,))
    return np.sin(2 * np.pi * (phase0 + np.cumsum(f) / SR))

def lp(x, fc, q=0.707):
    b, a = signal.butter(2, min(fc, SR * 0.45) / (SR / 2), 'low')
    return signal.lfilter(b, a, x)

def hp(x, fc):
    b, a = signal.butter(2, fc / (SR / 2), 'high')
    return signal.lfilter(b, a, x)

def bp(x, lo, hi):
    b, a = signal.butter(2, [lo / (SR / 2), min(hi, SR * 0.45) / (SR / 2)], 'band')
    return signal.lfilter(b, a, x)

def sweep_lp(x, fc_curve, block=256):
    """time-varying 2-pole low-pass (per-block coefficients, continuous state)"""
    y = np.zeros_like(x)
    zi = np.zeros(2)
    for i in range(0, len(x), block):
        fc = float(np.clip(fc_curve[min(i, len(fc_curve) - 1)], 40, SR * 0.45))
        b, a = signal.butter(2, fc / (SR / 2), 'low')
        y[i:i + block], zi = signal.lfilter(b, a, x[i:i + block], zi=zi)
    return y

def place(bus, x, t, gain=1.0, pan=0.0):
    i = int(round(t * SR))
    if i >= N or i + len(x) <= 0: return
    if i < 0: x, i = x[-i:], 0
    j = min(N, i + len(x))
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    bus[i:j, 0] += x[:j - i] * gain * l * 1.414
    bus[i:j, 1] += x[:j - i] * gain * r * 1.414

# ---------------------------------------------------------------- instruments
def kick(punch=1.0):
    n = int(0.42 * SR); t = np.arange(n) / SR
    f = 46 + 120 * np.exp(-t / 0.035) + 60 * np.exp(-t / 0.006)
    body = sine(f, n) * np.exp(-t / 0.22)
    click = hp(rng.standard_normal(n), 2500) * np.exp(-t / 0.004) * 0.35
    return np.tanh((body + click) * 1.6 * punch) * 0.9

def clap():
    n = int(0.32 * SR); t = np.arange(n) / SR
    nz = bp(rng.standard_normal(n), 900, 3200)
    e = np.zeros(n)
    for k, o in enumerate([0, 0.011, 0.022]):
        i = int(o * SR); e[i:] += np.exp(-(t[:n - i]) / 0.007) * (0.8 if k < 2 else 1)
    e += np.exp(-np.maximum(0, t - 0.022) / 0.09) * (t > 0.022) * 0.55
    return nz * e * 0.55

def hat(open_=False):
    n = int((0.28 if open_ else 0.06) * SR); t = np.arange(n) / SR
    # metallic: noise + a cluster of square-ish partials, high-passed
    m = sum(np.sign(np.sin(2 * np.pi * f * t)) for f in (5850, 7350, 8650, 10400)) * 0.15
    x = hp(rng.standard_normal(n) * 0.7 + m, 7000)
    return x * np.exp(-t / (0.09 if open_ else 0.014)) * (0.32 if open_ else 0.26)

def snare(level=1.0):
    n = int(0.2 * SR); t = np.arange(n) / SR
    tone = sine(185 * (1 + 0.3 * np.exp(-t / 0.01)), n) * np.exp(-t / 0.05) * 0.5
    nz = bp(rng.standard_normal(n), 1500, 9000) * np.exp(-t / 0.07)
    return (tone + nz) * 0.42 * level

def boom(len_s=2.6):
    n = int(len_s * SR); t = np.arange(n) / SR
    f = 31 + 70 * np.exp(-t / 0.12)
    sub = sine(f, n) * np.exp(-t / 0.9)
    crash = lp(hp(rng.standard_normal(n), 3000), 12000) * np.exp(-t / 0.55) * 0.35
    thump = lp(rng.standard_normal(n), 300) * np.exp(-t / 0.03) * 1.2
    return np.tanh((sub * 1.3 + crash + thump)) * 0.95

def whoosh(len_s=0.9, up=True):
    n = int(len_s * SR); t = np.arange(n) / SR
    u = t / len_s
    shape = np.sin(np.pi * u) ** 2 if up else np.exp(-t / 0.25)
    fc = 600 + 5200 * (u if up else (1 - u))
    x = sweep_lp(hp(rng.standard_normal(n), 300), fc)
    return x * shape * 0.5

def riser(len_s):
    n = int(len_s * SR); t = np.arange(n) / SR
    u = t / len_s
    nz = sweep_lp(hp(rng.standard_normal(n), 200), 400 + 9000 * u ** 2) * (u ** 1.8) * 0.55
    tone = saw_blep(110 * 2 ** (u * 3), n) * (u ** 2.2) * 0.12
    return nz + lp(tone, 4000)

def supersaw(midis, len_s, cutoff=2600, attack=0.02, release=0.25, voices=7, detune=0.18):
    n = int((len_s + release) * SR)
    out = np.zeros((n, 2))
    for m in midis:
        f0 = mtof(m)
        for v in range(voices):
            d = (v - (voices - 1) / 2) / ((voices - 1) / 2)
            f = f0 * 2 ** (d * detune / 12)
            x = saw_blep(f, n, phase0=rng.random())
            pan = d * 0.7
            out[:, 0] += x * np.cos((pan + 1) * np.pi / 4)
            out[:, 1] += x * np.sin((pan + 1) * np.pi / 4)
    e = env_adsr(n, attack, 0.2, 0.8, release, len_s)[:, None]
    out = np.stack([lp(out[:, 0], cutoff), lp(out[:, 1], cutoff)], 1) * e
    return out / (voices * len(midis)) * 2.2

def pluck(m, len_s=0.22, bright=1.0):
    n = int(len_s * SR); t = np.arange(n) / SR
    x = saw_blep(mtof(m), n) * 0.6 + np.sign(np.sin(2 * np.pi * mtof(m) * 1.003 * t)) * 0.25
    fc = 300 + 5200 * bright * np.exp(-t / 0.05)
    return sweep_lp(x, fc, block=64) * np.exp(-t / 0.11) * 0.5

def bass(m, len_s):
    n = int(len_s * SR); t = np.arange(n) / SR
    f = mtof(m)
    x = saw_blep(f, n) * 0.55 + sine(f, n) * 0.7    # sub at the fundamental (no sub-octave rumble)
    fc = 180 + 900 * np.exp(-t / 0.06)
    e = np.minimum(1, t / 0.004) * np.exp(-t / 0.5) * np.clip((len_s - t) / 0.01, 0, 1)
    return np.tanh(sweep_lp(x, fc, block=64) * e * 1.4) * 0.55

def bell(m, len_s=1.6):
    """2-operator FM bell"""
    n = int(len_s * SR); t = np.arange(n) / SR
    fc = mtof(m)
    idx = 3.2 * np.exp(-t / 0.35)
    mod = np.sin(2 * np.pi * fc * 3.5 * t) * idx
    return np.sin(2 * np.pi * fc * t + mod) * np.exp(-t / 0.6) * 0.32

# ---------------------------------------------------------------- arrangement
drums = np.zeros((N, 2)); bassbus = np.zeros((N, 2)); synths = np.zeros((N, 2)); fx = np.zeros((N, 2)); leads = np.zeros((N, 2))
events = {'kick': [], 'clap': [], 'hat': [], 'impact': [], 'whoosh': [], 'snare': [], 'stab': [], 'bell': []}

CH = {'Dm': ([62, 65, 69, 76], 38), 'Bb': ([58, 62, 65, 72], 34), 'F': ([57, 60, 65, 67], 41),
      'C': ([55, 60, 64, 67], 36), 'Gm': ([55, 58, 62, 67], 43), 'A': ([57, 61, 64, 69], 45),
      'D': ([62, 66, 69, 74, 78], 38)}
prog = {1: 'Dm', 2: 'Bb', 3: 'Dm', 4: 'Bb', 5: 'F', 6: 'C', 7: 'Dm', 8: 'Bb', 9: 'F', 10: 'C'}

# impacts
for t0 in (0.0, t_of(3), t_of(12)):
    place(fx, boom(3.4 if t0 > 20 else 2.4), t0, 0.95 if t0 > 0 else 0.8); events['impact'].append(t0)

# pads
pad_intro = supersaw(CH['Dm'][0], BAR, cutoff=900, attack=0.6, release=0.5)
synths[:len(pad_intro)] += pad_intro[:N] * 0.9
pad_b2 = supersaw(CH['Bb'][0], BAR, cutoff=1400, attack=0.05, release=0.3)
i = int(t_of(2) * SR); synths[i:i + len(pad_b2)] += pad_b2[:N - i] * 0.95
for b in range(3, 11):
    p = supersaw(CH[prog[b]][0], BAR, cutoff=2100 if b < 7 else 3200, attack=0.01, release=0.2)
    i = int(t_of(b) * SR); synths[i:i + len(p)] += p[:N - i] * 0.75
# breakdown chords with opening filter
for ch, beat0, beats in (('Gm', 0, 2), ('A', 2, 2)):
    p = supersaw(CH[ch][0], beats * BEAT, cutoff=1200 if ch == 'Gm' else 2600, attack=0.03, release=0.15)
    i = int(t_of(11, beat0) * SR); synths[i:i + len(p)] += p[:N - i] * 0.8
# finale: D major, big and long
fin = supersaw(CH['D'][0] + [50, 86], DUR - t_of(12), cutoff=4200, attack=0.005, release=0.05, voices=9, detune=0.24)
tail = np.exp(-np.arange(len(fin)) / SR / 1.15)[:, None]
i = int(t_of(12) * SR); synths[i:i + len(fin)] += (fin * tail)[:N - i] * 1.1
events['stab'] += [t_of(12)]

# stabs on phrase downbeats
for b in (3, 5, 7, 9):
    s = supersaw([m + 12 for m in CH[prog[b]][0]], BEAT * 0.5, cutoff=5200, attack=0.002, release=0.12)
    i = int(t_of(b) * SR); synths[i:i + len(s)] += s[:N - i] * 0.6; events['stab'].append(t_of(b))

# drums — intro hats
for k in range(16):
    place(drums, hat(), t_of(1) + k * S16, 0.35 + 0.25 * (k % 4 == 2), pan=0.25); events['hat'].append(t_of(1) + k * S16)
# build: snare roll accelerating, then a 1/8 gap before the drop
roll = [t_of(2, b) for b in (0, 0.5, 1, 1.5)] + [t_of(2, 2 + k / 4) for k in range(4)] + [t_of(2, 3 + k / 8) for k in range(7)]
for k, t0 in enumerate(roll):
    place(drums, snare(0.35 + 0.65 * k / len(roll)), t0, 1.35, pan=-0.1); events['snare'].append(t0)
# main grooves B3-B10
for b in range(3, 11):
    for q in range(4):
        tk = t_of(b, q)
        place(drums, kick(), tk); events['kick'].append(tk)
        if q in (1, 3):
            place(drums, clap(), tk, 0.9, pan=0.05); events['clap'].append(tk)
        place(drums, hat(), tk + BEAT / 2, 0.85, pan=0.3); events['hat'].append(tk + BEAT / 2)
        for g in (1, 3):
            place(drums, hat(), tk + g * S16, 0.32, pan=-0.3)
        if q == 3 and b >= 7:
            place(drums, hat(True), tk + BEAT / 2, 0.75, pan=0.35)
# fill into the breakdown (end of B10)
for k in range(8):
    t0 = t_of(10, 2 + k / 4)
    place(drums, snare(0.4 + 0.07 * k), t0, pan=0.15 * ((-1) ** k)); events['snare'].append(t0)
# breakdown: accelerating snare at the very end + gap
for k in range(8):
    t0 = t_of(11, 3) + k * (BEAT / 8) * 0.875
    place(drums, snare(0.3 + 0.08 * k), t0); events['snare'].append(t0)
# finale pulses
for tk in (t_of(12), t_of(12, 2)):
    place(drums, kick(1.2), tk); events['kick'].append(tk)

# bass: offbeat 8ths with octave pops, B3-B10
for b in range(3, 11):
    root = CH[prog[b]][1]
    for q in range(4):
        for half in (0.5,):
            m = root + (12 if q == 3 else 0)
            place(bassbus, bass(m, BEAT * 0.45), t_of(b, q + half))
        if q == 0:
            place(bassbus, bass(root, BEAT * 0.3), t_of(b, q), 0.8)
place(bassbus, bass(CH['D'][1] - 12, 3.0), t_of(12), 1.1)

# arp B5-B10 (16ths over chord tones), brighter and an octave up in B9-B10
for b in range(5, 11):
    tones = CH[prog[b]][0]
    pat = [0, 1, 2, 3, 2, 1, 2, 3] * 2
    for k in range(16):
        m = tones[pat[k] % len(tones)] + (12 if b >= 9 else 0)
        place(leads, pluck(m, bright=0.7 + 0.3 * (b >= 9)), t_of(b) + k * S16, 0.42 if b < 9 else 0.5, pan=0.35 * np.sin(k * 0.8))
# bell motif B9-B10 and the finale sting
motif = [(9, 0, 81), (9, 1.5, 79), (9, 2.5, 77), (9, 3, 76), (10, 0, 72), (10, 1.5, 74), (10, 2.5, 76), (10, 3.5, 79)]
for b, bt, m in motif:
    place(leads, bell(m), t_of(b, bt), 0.65, pan=-0.2); events['bell'].append(t_of(b, bt))
for bt, m in ((0, 86), (0.75, 81), (1.5, 90)):
    place(leads, bell(m, 2.4), t_of(12, bt), 0.8); events['bell'].append(t_of(12, bt))

# transitions + risers
for t0, ln in ((t_of(4) - 0.45, 0.6), (t_of(6) - 0.45, 0.6), (t_of(7) - 0.5, 0.65), (t_of(9) - 0.5, 0.65), (t_of(10) - 0.45, 0.6)):
    place(fx, whoosh(ln), t0, 0.55, pan=0.2); events['whoosh'].append(t0 + ln * 0.5)
place(fx, riser(BAR), t_of(2), 0.75)
place(fx, riser(BAR * 0.97), t_of(11), 0.85)

# ---------------------------------------------------------------- mix
kicks = np.array(events['kick'])
tt = np.arange(N) / SR
duck = np.ones(N)
for tk in kicks:
    i = int(tk * SR); j = min(N, i + int(0.35 * SR)); u = (np.arange(j - i)) / SR
    duck[i:j] = np.minimum(duck[i:j], 1 - 0.62 * np.exp(-u / 0.09))
duck = duck[:, None]

def reverb_ir(len_s=2.4, decay=0.55):
    n = int(len_s * SR); t = np.arange(n) / SR
    ir = np.stack([rng.standard_normal(n), rng.standard_normal(n)], 1) * np.exp(-t / decay)[:, None]
    ir[:, 0] = sweep_lp(ir[:, 0], 9000 * np.exp(-t / 0.8) + 600, block=512)
    ir[:, 1] = sweep_lp(ir[:, 1], 9000 * np.exp(-t / 0.8) + 600, block=512)
    ir[: int(0.012 * SR)] = 0
    return ir / np.sqrt(np.sum(ir ** 2, 0))

IR = reverb_ir()
def verb(x, wet):
    y = np.stack([signal.fftconvolve(x[:, 0], IR[:, 0])[:N], signal.fftconvolve(x[:, 1], IR[:, 1])[:N]], 1)
    return x + y * wet

synths = np.stack([hp(synths[:, 0], 170), hp(synths[:, 1], 170)], 1)   # leave the low end to kick + bass
mix = (drums * 0.95 + bassbus * 0.9 * duck + verb(synths * duck, 0.35) * 0.6 + verb(leads, 0.45) * 0.7 + verb(fx, 0.25) * 0.8)
mix[:, 0] = hp(mix[:, 0], 28); mix[:, 1] = hp(mix[:, 1], 28)
# gentle glue: smoothed RMS compressor
rms = np.sqrt(np.convolve(np.mean(mix ** 2, 1), np.ones(1200) / 1200, 'same')) + 1e-9
gain = np.minimum(1, (0.22 / rms) ** 0.25)[:, None]
mix = np.tanh(mix * gain * 0.9) / np.tanh(0.9)
fade = np.ones(N); fl = int(0.25 * SR); fade[-fl:] = np.linspace(1, 0, fl)
mix *= fade[:, None]
mix *= 10 ** (-2.0 / 20) / np.max(np.abs(mix))   # -2 dBFS sample peak leaves true-peak headroom

pcm = (mix * 32767).astype('<i2')
import wave
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())

# ---------------------------------------------------------------- visual drivers (60 fps)
F = int(DUR * FPS)
hop = SR // FPS
mono = mix.mean(1)
lowb = lp(mono, 140)
def frame_rms(x):
    return np.array([np.sqrt(np.mean(x[i * hop:(i + 1) * hop] ** 2)) for i in range(F)])
r_all, r_low = frame_rms(mono), frame_rms(lowb)
norm = lambda a: (a / (np.percentile(a, 99) + 1e-9)).clip(0, 1).round(3).tolist()
env = {'fps': FPS, 'bpm': BPM, 'beat': BEAT, 'bar': BAR, 'duration': DUR,
       'rms': norm(r_all), 'low': norm(r_low), 'events': {k: [round(x, 4) for x in sorted(v)] for k, v in events.items()}}
open(sys.argv[2], 'w').write('window.SCORE = ' + json.dumps(env) + ';\n')
print('wrote', sys.argv[1], 'and', sys.argv[2], '| kicks', len(events['kick']))
