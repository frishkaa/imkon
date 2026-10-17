"""Offline mix of the film soundtrack: music bed + SFX cues (from tools/export-cues.mjs).

Music: "Our Ups and Downs" — Michael Ramir C., Mixkit Stock Music Free License.
SFX: Mixkit Sound Effects Free License (see assets/audio/CREDITS.md).
The track is 120.000 BPM with its downbeats exactly on a 2 s grid (bar j = [2j, 2j + 2) s), the same
grid as the film, so the bed is a bar-for-bar music edit of it (EDIT below, one entry per film bar).
Its own sections land on the film's hits: the build enters with the logo (8 s), drop 1 as the first
question is typed (14 s), the breakdown + riser under the upload/scan and drop 2 on the findings (38 s),
a second breakdown under the account scene and the final drop on "Moní Pro" (78 s), and the track's own
end hit at 94 s under the loop dissolve. Splices only join bars of the same section (chosen by
spectral/chroma continuity); the last beat crossfades into the head's material so the loop is seamless.

usage: python3 tools/mix-audio.py assets/audio/cues.json assets/audio/soundtrack.wav
"""
import json, subprocess, sys
import numpy as np

SR, DUR, BAR = 48000, 96.0, 2.0
MUSIC = 'assets/audio/src/our-ups-and-downs.mp3'
SFX_DIR = 'assets/audio/sfx/'
EDIT = ([10, 9, 10, 11] +                 # 0–8    break: sparse under the hook
        [12, 14, 15] +                    # 8–14   build enters with the logo
        list(range(16, 24)) +             # 14–30  drop 1: ask a question, languages
        list(range(24, 28)) +             # 30–38  breakdown + riser: upload, scan
        list(range(28, 44)) +             # 38–70  drop 2: findings, calculator, drafting
        [44, 45, 50, 51] +                # 70–78  breakdown + riser: your account
        list(range(52, 60)) +             # 78–94  final drop: Moní Pro, end card
        [60])                             # 94–96  end hit under the loop dissolve
XF = int(0.015 * SR)                      # splice crossfade, taken from the incoming bar's pre-roll
BED_GAIN = 0.80                           # this master sits ~2.3 dB under the previous track

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
assert len(EDIT) * B == N, 'EDIT must cover the film bar for bar'
out = np.zeros((N, 2), np.float32)

m = load(MUSIC)
m = np.pad(m, ((XF, B), (0, 0)))                     # pre-roll for a splice into bar 0, room past the end
seg = lambda j, a, b: m[XF + j * B + a: XF + j * B + b]
bed = np.zeros((N, 2), np.float32)
for k, j in enumerate(EDIT):
    bed[k * B:(k + 1) * B] = seg(j, 0, B)
    if k and j != EDIT[k - 1] + 1:                   # splice: equal-power crossfade just before the downbeat
        i = k * B
        bed[i - XF:i] = bed[i - XF:i] * ramp(XF, up=False) + seg(j, -XF, 0) * ramp(XF, up=True)
lb = int(0.5 * SR)                                   # loop seam: the end hit's last beat hands over to the
tail = seg(EDIT[0] - 1, B - lb, B)                   # head's predecessor, so 96 s flows into 0 s
bed[-lb:] = bed[-lb:] * ramp(lb, up=False) + tail * ramp(lb, up=True)
out += bed * BED_GAIN

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
print('mixed', len(cues), 'cues; pre-limit peak %.2f' % peak)
