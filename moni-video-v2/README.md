# Moní · showreel (v2)

A 24-second, 60 fps motion-graphics reel for Moní (tajiklaw.ai), made entirely in code. The music
is composed and synthesized from scratch in `tools/synth.py`: no samples, no generative models.
It is English-only.

- **Watch:** `deliverables/moni-showreel-1080p60.mp4` (1920×1080, 60 fps, 24.0 s)
- **Decisions, discarded ideas, iterations, time:** `DECISIONES.md`

```bash
python3 tools/synth.py assets/audio/score.wav assets/data/audio-env.js   # rebuild the score (numpy + scipy)
npx hyperframes@0.8.166 preview --background                             # Studio preview
npx hyperframes@0.8.166 render --fps 60 --quality high --output renders/moni-showreel-1080p60.mp4
```
