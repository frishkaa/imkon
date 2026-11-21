"""Генерирует фоновую музыку для ролика (MIDI → WAV через FluidSynth).

Спокойная «корпоративно-кинематографичная» тема: струнные, фортепиано,
бас, лёгкая перкуссия. Без сторонних библиотек.

    python3 music/compose.py 100          # длительность ролика, сек
    → music/theme.mid, public/music.wav
"""
import os
import random
import struct
import subprocess
import sys

DURATION = float(sys.argv[1]) if len(sys.argv) > 1 else 100.0
BPM = 96
TPQ = 480  # тиков на четверть
BAR = TPQ * 4
SEC_PER_BAR = 60 / BPM * 4
random.seed(7)

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

# Аккорды: Bm – G – D – A (vi–IV–I–V), затем вариант с Em
PROG_A = [(47, 'm'), (43, ''), (50, ''), (45, '')]
PROG_B = [(40, 'm'), (43, ''), (50, ''), (45, '')]


def triad(root, q):
    return [root, root + (3 if q == 'm' else 4), root + 7]


def vlq(n):
    out = [n & 0x7F]
    n >>= 7
    while n:
        out.append((n & 0x7F) | 0x80)
        n >>= 7
    return bytes(reversed(out))


class Track:
    def __init__(self, ch, program=None, volume=100, pan=64, reverb=60):
        self.ch = ch
        self.ev = []  # (tick, order, bytes)
        if program is not None:
            self.ev.append((0, 0, bytes([0xC0 | ch, program])))
        self.ev.append((0, 0, bytes([0xB0 | ch, 7, volume])))
        self.ev.append((0, 0, bytes([0xB0 | ch, 10, pan])))
        self.ev.append((0, 0, bytes([0xB0 | ch, 91, reverb])))

    def note(self, t, dur, pitch, vel):
        vel = max(1, min(127, int(vel)))
        self.ev.append((int(t), 2, bytes([0x90 | self.ch, pitch, vel])))
        self.ev.append((int(t + dur), 1, bytes([0x80 | self.ch, pitch, 0])))

    def cc(self, t, num, val):
        self.ev.append((int(t), 0, bytes([0xB0 | self.ch, num, max(0, min(127, int(val)))])))

    def chunk(self):
        self.ev.sort(key=lambda e: (e[0], e[1]))
        data = b''
        last = 0
        for t, _, b in self.ev:
            data += vlq(t - last) + b
            last = t
        data += vlq(0) + b'\xFF\x2F\x00'
        return b'MTrk' + struct.pack('>I', len(data)) + data


bars = int(DURATION / SEC_PER_BAR) + 1
sec2bar = lambda s: s / SEC_PER_BAR

tempo = Track(0)
tempo.ev = [(0, 0, b'\xFF\x51\x03' + struct.pack('>I', int(60_000_000 / BPM))[1:])]

strings = Track(0, program=48, volume=92, pan=54, reverb=90)  # String Ensemble 1
high = Track(1, program=49, volume=70, pan=74, reverb=100)  # String Ensemble 2
piano = Track(2, program=0, volume=88, pan=70, reverb=70)  # Acoustic Grand
bass = Track(3, program=32, volume=88, pan=64, reverb=30)  # Acoustic Bass
horn = Track(4, program=60, volume=62, pan=50, reverb=95)  # French Horn
drums = Track(9, volume=70, pan=64, reverb=40)

# Отметки формы (в тактах)
INTRO_END = sec2bar(6)
PULSE_IN = sec2bar(14)
FULL_IN = sec2bar(30)
LIFT_IN = sec2bar(66)
OUTRO = sec2bar(DURATION - 10)
LAST = int(sec2bar(DURATION - 6))

for b in range(bars):
    if b > LAST:
        break
    t0 = b * BAR
    prog = PROG_A if (b // 8) % 2 == 0 else PROG_B
    root, q = prog[b % 4]
    tri = triad(root, q)
    final = b == LAST
    if final:
        root, q = 50, ''  # финальный аккорд — D мажор
        tri = triad(root, q)

    # струнный пэд: аккорд в среднем регистре
    sv = 58 if b < INTRO_END else 66 if b < FULL_IN else 74
    if b >= OUTRO:
        sv = 60
    dur = BAR * (3 if final else 1)
    for p in [tri[0] + 12, tri[1] + 12, tri[2] + 12, tri[0] + 24]:
        strings.note(t0, dur - 10, p, sv + random.randint(-3, 3))

    # верхние струнные — в кульминации
    if LIFT_IN <= b < OUTRO or final:
        melody = [tri[2] + 24, tri[1] + 24, tri[0] + 36, tri[1] + 24]
        for k, p in enumerate(melody[:2] if not final else melody[:1]):
            high.note(t0 + k * BAR // 2, BAR // 2 - 20 if not final else BAR * 3, p, 62)

    # валторна — длинные ноты в кульминации
    if LIFT_IN + 4 <= b < OUTRO and b % 2 == 0:
        horn.note(t0, BAR * 2 - 40, tri[0] + 12, 56)

    # фортепиано: остинато восьмыми
    if b >= INTRO_END and not final:
        pat = [tri[0] + 24, tri[2] + 12, tri[1] + 24, tri[2] + 24, tri[0] + 36, tri[2] + 24, tri[1] + 24, tri[2] + 12]
        pv = 54 if b < PULSE_IN else 62 if b < FULL_IN else 66
        if b >= OUTRO:
            pv = 50
        for k, p in enumerate(pat):
            acc = 8 if k % 4 == 0 else 0
            piano.note(t0 + k * TPQ // 2 + random.randint(0, 12), TPQ // 2, p, pv + acc + random.randint(-4, 4))
    elif b < INTRO_END:
        # вступление: редкие ноты
        for k, p in enumerate([tri[2] + 24, tri[0] + 36]):
            piano.note(t0 + k * BAR // 2, BAR // 2, p, 52)
    else:
        piano.note(t0, BAR * 3, tri[0] + 24, 58)
        piano.note(t0, BAR * 3, tri[1] + 24, 54)
        piano.note(t0, BAR * 3, tri[2] + 24, 54)

    # бас
    if b >= PULSE_IN and b < OUTRO:
        bass.note(t0, TPQ * 2 - 30, root - 12, 80)
        bass.note(t0 + TPQ * 2, TPQ * 2 - 30, root - 12 + (7 if b % 2 else 0), 72)
    elif final:
        bass.note(t0, BAR * 3, root - 12, 72)

    # перкуссия
    if FULL_IN <= b < OUTRO:
        for beat in range(4):
            bt = t0 + beat * TPQ
            if beat in (0, 2):
                drums.note(bt, 120, 36, 78 if beat == 0 else 64)  # мягкая бочка
            if beat in (1, 3) and b >= FULL_IN + 4:
                drums.note(bt, 120, 37, 44)  # side stick
            for h in range(2):
                drums.note(bt + h * TPQ // 2, 60, 42, 30 + (8 if h == 0 else 0) + random.randint(-4, 4))
        if b % 8 == 7:
            drums.note(t0 + 3 * TPQ, BAR, 49, 50)  # тарелка перед новой фразой
    elif PULSE_IN <= b < FULL_IN:
        for beat in range(4):
            drums.note(t0 + beat * TPQ, 60, 70, 34)  # маракас — лёгкий пульс

tracks = [tempo, strings, high, piano, bass, horn, drums]
mid = b'MThd' + struct.pack('>IHHH', 6, 1, len(tracks), TPQ) + b''.join(t.chunk() for t in tracks)
mid_path = os.path.join(HERE, 'theme.mid')
open(mid_path, 'wb').write(mid)

sf = next(p for p in ['/usr/share/sounds/sf2/FluidR3_GM.sf2', '/usr/share/sounds/sf2/default-GM.sf2'] if os.path.exists(p))
raw = os.path.join(HERE, 'theme_raw.wav')
subprocess.run(['fluidsynth', '-ni', '-g', '0.6', '-r', '44100', '-F', raw, sf, mid_path], check=True, capture_output=True)
out = os.path.join(ROOT, 'public', 'music.wav')
subprocess.run(
    [
        'ffmpeg', '-nostdin', '-loglevel', 'error', '-y', '-i', raw,
        '-af', f'atrim=0:{DURATION},afade=t=in:d=1.5,afade=t=out:st={DURATION - 5}:d=5,loudnorm=I=-18:TP=-2:LRA=11',
        '-ar', '44100', out,
    ],
    check=True,
)
os.remove(raw)
print('ok', out)
