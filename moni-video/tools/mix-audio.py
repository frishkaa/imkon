"""Offline mix of the film soundtrack: music bed + SFX cues (from tools/export-cues.mjs).

Music: "Better Times are Coming" — Alejandro Magaña (A. M.), Mixkit Stock Music Free License.
SFX: Mixkit Sound Effects Free License (see assets/audio/CREDITS.md).
The track is 120 BPM with its first downbeat at 0.564 s, so film time t == music time t + 0.564.
The film is 96 s long, so the track plays to its own ending (film ~95.4 s).
The last 0.564 s of the film carries the track's own pickup so the loop restarts seamlessly.

usage: python3 tools/mix-audio.py assets/audio/cues.json assets/audio/soundtrack.wav
"""
import json, subprocess, sys
import numpy as np

SR, DUR, OFF = 48000, 96.0, 0.564
MUSIC = 'assets/audio/src/better-times-are-coming.mp3'
SFX_DIR = 'assets/audio/sfx/'

def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()

def ramp(n, up=True):
    r = np.linspace(0, 1, n, dtype=np.float32) if up else np.linspace(1, 0, n, dtype=np.float32)
    return (np.sin(r * np.pi / 2) ** 2)[:, None]

cues = json.load(open(sys.argv[1]))
N = int(SR * DUR)
out = np.zeros((N, 2), np.float32)

m = load(MUSIC)
bed = m[int(OFF * SR): int(OFF * SR) + N]
bed = np.pad(bed, ((0, N - len(bed)), (0, 0)))
fo = int(0.5 * SR)                                   # the track ends on its own at ~95.4 s; fade only its tail ...
bed[-fo:] *= ramp(fo, up=False)
pick = m[:int(OFF * SR)]                             # ... and lay the pickup bar's tail under it
p0 = N - len(pick)
pk = pick.copy(); pk *= ramp(len(pk), up=True) ** 0.5
bed[p0:] += pk
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
print('mixed', len(cues), 'cues; pre-limit peak %.2f' % peak)
