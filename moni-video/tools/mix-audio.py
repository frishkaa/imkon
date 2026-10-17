"""Offline mix of the film soundtrack: music bed + SFX cues (from tools/export-cues.mjs).

Music: "Better Times are Coming" — Alejandro Magaña (A. M.), Mixkit Stock Music Free License.
SFX: Mixkit Sound Effects Free License (see assets/audio/CREDITS.md).
The track is 120 BPM with its first downbeat at 0.564 s, so track bar m = [0.564 + 2m, 2.564 + 2m) s and the
film's bar k = [2k, 2k + 2) s. The film is the 96 s cut plus 24 s of reading holds (film.js HOLDS), 8 s in each
part, so the bed is the track with one 4-bar phrase repeated in each part (EDIT, one track bar per film bar).
Its return still lands on the review findings (46 s), the reprise on "Moní Pro" (94 s), and the track ends on
its own under the loop dissolve (~119.4 s). The last 0.564 s carries the track's pickup, so the loop is seamless.

usage: python3 tools/mix-audio.py assets/audio/cues.json assets/audio/soundtrack.wav
"""
import json, subprocess, sys
import numpy as np

SR, BAR, OFF = 48000, 2.0, 0.564
MUSIC = 'assets/audio/src/better-times-are-coming.mp3'
SFX_DIR = 'assets/audio/sfx/'
EDIT = (list(range(0, 8)) + list(range(4, 8)) + list(range(8, 19)) +     # 0–46   intro, A2 twice, B, breakdown, build
        list(range(19, 24)) + list(range(20, 24)) + list(range(24, 39)) +  # 46–94  the return (review), full section
        [39] + list(range(40, 44)) * 2 + list(range(44, 48)))             # 94–120 reprise twice, B, the ending
DUR = len(EDIT) * BAR
XF = int(0.015 * SR)                      # splice crossfade, taken from the incoming bar's pre-roll

def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()

def ramp(n, up=True):
    r = np.linspace(0, 1, n, dtype=np.float32) if up else np.linspace(1, 0, n, dtype=np.float32)
    return (np.sin(r * np.pi / 2) ** 2)[:, None]

cues = json.load(open(sys.argv[1]))
N = int(SR * DUR)
B = int(SR * BAR)
out = np.zeros((N, 2), np.float32)

m = load(MUSIC)
O = int(OFF * SR)
mp = np.pad(m, ((0, B), (0, 0)))                     # room past the track's end
seg = lambda j, a, b: mp[O + j * B + a: O + j * B + b]
bed = np.zeros((N, 2), np.float32)
for k, j in enumerate(EDIT):
    bed[k * B:(k + 1) * B] = seg(j, 0, B)
    if k and j != EDIT[k - 1] + 1:                   # splice: equal-power crossfade just before the downbeat
        i = k * B
        bed[i - XF:i] = bed[i - XF:i] * ramp(XF, up=False) + seg(j, -XF, 0) * ramp(XF, up=True)
fo = int(0.5 * SR)                                   # the track ends on its own at ~119.4 s; fade only its tail ...
bed[-fo:] *= ramp(fo, up=False)
pick = m[:O]                                         # ... and lay the pickup bar's tail under it
pk = pick.copy(); pk *= ramp(len(pk), up=True) ** 0.5
bed[N - len(pk):] += pk
out += bed * 0.62

cache = {}
for c in cues:
    if c['gain'] <= 0:
        continue
    name = c['name']
    if name not in cache:
        cache[name] = load(SFX_DIR + name + '.mp3')
    s = cache[name] * float(c['gain']) * 0.55
    i = int(round(c['t'] * SR))
    if i >= N:
        continue
    j = min(N, i + len(s))
    out[i:j] += s[:j - i]

# gentle bus compression + ceiling at -1 dBFS
peak = np.max(np.abs(out)) + 1e-9
out = np.tanh(out * 1.15) / np.tanh(1.15)
out *= (10 ** (-1 / 20)) / max(1e-9, np.max(np.abs(out)))
pcm = (np.clip(out, -1, 1) * 32767).astype('<i2')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '-', sys.argv[2]],
               input=pcm.tobytes(), check=True)
print('mixed', len(cues), 'cues over %.0f s; pre-limit peak %.2f' % (DUR, peak))
