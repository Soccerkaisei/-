"""明るい和風アコースティックBGM（30秒）を合成する。
自作の合成音源なので著作権フリー。ヨナ抜き風の音階（D E G A B）、96BPM、
1小節=2.5秒なので 15秒（=6小節）でちょうど区切れる。

  python3 bgm.py sfx.json bgm.wav
sfx.json … {"pops":[秒...], "chimes":[秒...]}（render.js が出力）
"""
import json
import sys
import wave

import numpy as np

SR = 44100
DUR = 30.0
BPM = 96
BEAT = 60 / BPM          # 0.625s
BAR = BEAT * 4           # 2.5s
N = int(SR * DUR)
L = np.zeros(N)
R = np.zeros(N)
rng = np.random.default_rng(11)


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def pluck(freq, dur, bright=0.5, decay=0.996):
    """Karplus-Strong（周期ごとにベクトル化）"""
    p = max(2, int(round(SR / freq)))
    n = int(SR * dur)
    y = np.zeros(n + p + 1)
    burst = rng.uniform(-1, 1, p)
    # 明るさ：はじめのノイズを少しなめらかに
    for _ in range(int((1 - bright) * 4)):
        burst = 0.5 * (burst + np.roll(burst, 1))
    y[1:p + 1] = burst
    pos = p + 1
    while pos < n + p + 1:
        end = min(pos + p, n + p + 1)
        k = end - pos
        y[pos:end] = decay * 0.5 * (y[pos - p:pos - p + k] + y[pos - p - 1:pos - p - 1 + k])
        pos = end
    out = y[1:n + 1]
    env = np.ones(n)
    rel = min(n, int(0.08 * SR))
    env[-rel:] = np.linspace(1, 0, rel)
    return out * env


def add(t, sig, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    L[i:i + len(sig)] += sig * (1 - max(0, pan))
    R[i:i + len(sig)] += sig * (1 + min(0, pan))


def koto(t, m, dur, gain=0.55):
    s = pluck(mtof(m), max(dur, 0.4) + 0.9, bright=0.9, decay=0.9975)
    add(t, s, gain, pan=0.3)


def strum(t, notes, gain=0.22, up=False):
    seq = notes[::-1] if up else notes
    for k, m in enumerate(seq):
        add(t + k * 0.014, pluck(mtof(m), 1.6, bright=0.55, decay=0.995), gain * (0.8 if up else 1), pan=-0.35)


def bass(t, m, dur, gain=0.28):
    n = int(SR * dur)
    tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * mtof(m) * tt) * np.exp(-tt * 2.2)
    s[: int(.005 * SR)] *= np.linspace(0, 1, int(.005 * SR))
    add(t, s, gain)


def shaker(t, gain=0.035):
    n = int(SR * 0.07)
    s = np.diff(rng.uniform(-1, 1, n + 1)) * np.exp(-np.arange(n) / SR * 60)
    add(t, s, gain, pan=0.15)


def pop(t, gain=0.35):
    n = int(SR * 0.14)
    tt = np.arange(n) / SR
    f = 950 * np.exp(-tt * 9) + 420
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 28)
    add(t, s, gain)


def chime(t, gain=0.16):
    n = int(SR * 2.2)
    tt = np.arange(n) / SR
    s = sum(a * np.sin(2 * np.pi * mtof(86) * r * tt) * np.exp(-tt * d)
            for r, a, d in [(1, 1, 2.2), (2.76, .5, 4), (5.4, .25, 7)])
    add(t, s, gain)


CHORDS = {
    "D": [50, 57, 62, 66, 69], "G": [43, 50, 55, 59, 62, 67],
    "Em": [40, 47, 52, 55, 59, 64], "A": [45, 52, 57, 61, 64],
}
ROOT = {"D": 38, "G": 43, "Em": 40, "A": 45}
PROG = ["D", "G", "D", "G", "Em", "A", "D", "G", "Em", "A", "D", "D"]

A = [(0, 74, 1), (1, 76, .5), (1.5, 79, .5), (2, 81, 1), (3, 79, .5), (3.5, 76, .5),
     (4, 74, 1.5), (5.5, 71, .5), (6, 69, 1), (7, 71, 1)]
B = [(0, 76, .5), (.5, 79, .5), (1, 81, 1), (2, 83, 1), (3, 81, 1),
     (4, 79, .5), (4.5, 76, .5), (5, 74, 1), (6, 76, 2)]
A_END = [(0, 74, 1), (1, 76, .5), (1.5, 79, .5), (2, 81, 1), (3, 79, .5), (3.5, 76, .5),
         (4, 74, 1), (5, 71, 1), (6, 74, 4)]
INTRO = [(0, 81, .5), (.5, 79, .5), (1, 74, .5), (2, 81, .5), (2.5, 79, .5), (3, 76, 1),
         (4, 79, .5), (4.5, 76, .5), (5, 74, .5), (6, 71, .5), (6.5, 74, .5), (7, 76, 1)]
MELODY = [(0, INTRO), (2, A), (4, B), (6, A), (8, B), (10, A_END)]


def main():
    sfx = json.load(open(sys.argv[1])) if len(sys.argv) > 1 else {"pops": [], "chimes": []}
    out = sys.argv[2] if len(sys.argv) > 2 else "bgm.wav"

    for b, ch in enumerate(PROG):
        t0 = b * BAR
        last = b == len(PROG) - 1
        notes = CHORDS[ch]
        strum(t0, notes, 0.24)
        if not last:
            strum(t0 + 1.5 * BEAT, notes[-3:], 0.13, up=True)
            strum(t0 + 2 * BEAT, notes, 0.19)
            strum(t0 + 3 * BEAT, notes[-4:], 0.12)
            strum(t0 + 3.5 * BEAT, notes[-3:], 0.11, up=True)
        bass(t0, ROOT[ch], BEAT * 2)
        if not last:
            bass(t0 + 2 * BEAT, ROOT[ch] + 7, BEAT * 2, 0.2)
        if 2 <= b < len(PROG) - 1:
            for k in range(8):
                shaker(t0 + k * BEAT / 2, 0.03 if k % 2 == 0 else 0.045)

    for bar, phrase in MELODY:
        for beat, m, d in phrase:
            koto(bar * BAR + beat * BEAT, m, d * BEAT, 0.5 if bar else 0.4)

    for t in sfx.get("pops", []):
        pop(t)
    for t in sfx.get("chimes", []):
        chime(t)

    mix = np.stack([L, R], axis=1)
    fade_in = int(0.05 * SR)
    fade_out = int(2.5 * SR)
    mix[:fade_in] *= np.linspace(0, 1, fade_in)[:, None]
    mix[-fade_out:] *= np.linspace(1, 0, fade_out)[:, None] ** 1.5
    mix = np.tanh(mix / np.max(np.abs(mix)) * 1.2) / np.tanh(1.2) * 0.89
    pcm = (mix * 32767).astype("<i2")
    with wave.open(out, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print("bgm ->", out)


if __name__ == "__main__":
    main()
