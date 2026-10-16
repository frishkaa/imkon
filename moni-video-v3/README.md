# Moní — v3 film (AI Conf 2026, Dushanbe)

This is a 56-second film for tajiklaw.ai, built as a HyperFrames composition (HTML and GSAP, rendered
frame by frame).
- **Picture:** 1920×1080 at 60 fps.
- **Sound:** an original felt-piano and strings score, synthesized in numpy with no samples.
- **Design:** a warm near-black ground, ivory type in Source Serif 4 Display and Public Sans, and slow,
  readable pacing.

The design decisions, discarded ideas, iterations and time spent are in [DECISIONES.md](DECISIONES.md).

```bash
python3 tools/score.py assets/data/cues.js assets/audio/score.wav     # ~1 min
npx --yes hyperframes@0.8.166 snapshot --at 5.5,25,37.5,54            # stills for review
npx --yes hyperframes@0.8.166 render --fps 60 --quality high --output renders/moni-v3-1080p60.mp4
```

All timing lives in `assets/data/cues.js`. If you change a cue, re-run `score.py` so the music keeps
landing on it.
