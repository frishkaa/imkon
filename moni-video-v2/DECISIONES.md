# DECISIONES — Moní showreel (v2)

**Deliverable:** `deliverables/moni-showreel-1080p60.mp4` — 1920×1080, 60 fps, 24.0 s, H.264 (12 Mbps) + AAC.
Loudness −12.2 LUFS integrated, −1.0 dBTP.
**Brief:** a 20–25 s motion-graphics piece that works as a showreel. Made only with code (no image, video or
audio generation models), with music composed and synthesized from scratch and no samples. Fully in English.

---

## 1. What I decided

### Concept
The piece is a showreel for Moní, not a product tour. Every scene uses a different motion technique,
and all of them hang on one 128 BPM grid. The story is Moní's own: *laws are written for everyone,
yet understood by almost no one → Moní → ask, review, draft → "Ask Moní first."*

### Tempo and form: 128 BPM, 12 bars + tail = 24.0 s
At 128 BPM a bar is 1.875 s, so 12 bars are exactly 22.5 s. A 1.5 s ring-out on the final chord brings
the piece to 24 s, inside the 20–25 s brief. Every scene boundary is on a bar line, and every flag, cut
and count lands on a beat or an 8th note.

| bar | time (s) | music | picture |
|---|---|---|---|
| 1 | 0.00 | impact, filtered Dm pad, ticking hats | gold slash; "LAWS / ARE / WRITTEN / FOR EVERYONE." one word per beat, four techniques |
| 2 | 1.88 | B♭, accelerating snare roll, riser, **1/8 gap** | "UNDERSTOOD by almost **NO ONE.**": letters converge, shudder with the riser, freeze in the gap |
| 3 | 3.75 | **drop**: four-on-the-floor, stabs | gold iris + shockwave; MONÍ letters slam in; the swirl draws itself and throws sparks |
| 4 | 5.63 | groove | **shape-morph match cut**: the logo's O becomes the input field; the question types itself |
| 5 | 7.50 | stab | "Yes —" slams on the downbeat; a LABOUR CODE · ART. 28 pill; three conditions orbit in 3D |
| 6 | 9.38 | whoosh | zoom-through into "Ask in English / Russian / Tajik" (slot roll); a waveform driven by the real mix |
| 7 | 11.25 | arp enters | the waveform flattens into a gold line that wipes the review in; the scan beam flags 5 clauses on the 8th-note grid |
| 8 | 13.13 | — | each flag is struck through and rewritten (tracked changes); stamp; page flip |
| 9 | 15.00 | bell motif | a contract writes itself (skeleton → text); `[specify]` gaps glow on the bell notes; pull-back to a wall of contracts |
| 10 | 16.88 | fill | four stat cuts on four beats, each with its own technique |
| 11 | 18.75 | **breakdown** (Gm → A), riser, 1/8 gap | dark; "Need a lawyer?"; 380 particle streaks spiral into a gold dot |
| 12 | 20.63 | **D major** (Picardy third) impact + 3 bell stings | burst of 460 particles, iris, logo; "Ask Moní first." on bell 2; tajiklaw.ai on bell 3 |

### Techniques on show (one or more per scene)
- **Variable-font animation:** Roboto Serif's width (50–150) and weight (100–900) axes are tweened per
  letter, so letterforms stretch and condense instead of just scaling.
- **Kinetic type, six ways:** mask rise, depth punch, 3D letter flips, axis stretch, scatter-to-converge,
  and riser-driven shudder with a chromatic split.
- **Transitions with carriers:** iris + shockwave; O → input-field shape morph; zoom-through on the
  citation pill; a waveform line that becomes a wipe; a page flip on the same axis into the next page;
  a pull-back into a grid; hard cuts on the beat.
- **Audio-reactive visuals from the actual score:** `synth.py` exports per-frame loudness and a beat map.
  The voice waveform reads the real mix RMS, the camera shake follows the kick envelope, and the review
  flags are snapped to the 8th-note grid.
- **Procedural particle systems** (Canvas 2D, pure functions of time): drifting dust, sparks emitted
  along the logo swirl's actual path, a 380-streak vortex, and a 460-particle burst with drag.
- **Data/UI motion:** typed input, a counter, connector lines, tracked-change redlines, a rubber stamp,
  skeleton bars turning into text, a dial count-up and flip digits.
- **Stillness before climax:** a hard 1/8-note freeze before both drops, in sound and in picture.
- **Reel HUD:** corner marks, section index, a live frame-accurate timecode and a progress bar.

### Score, synthesized in numpy/scipy (`tools/synth.py`, about 300 lines, 11 s to run)
- **Instruments, all from oscillators and seeded noise:**
  - kick: sine with a pitch envelope, plus a noise click
  - clap: three band-passed noise bursts plus a tail
  - hats: noise plus square partials, high-passed
  - snare: tone plus noise
  - bass: polyBLEP saw with a sine at the fundamental, through an enveloped low-pass
  - pads and stabs: 7–9 voice detuned polyBLEP supersaws
  - pluck arp: saw/square through a fast filter envelope
  - bells: 2-operator FM
  - risers and whooshes: noise through a moving filter, plus a pitched saw sweep
  - impacts: sub-boom, noise crash and thump
- **Mix:** kick-keyed sidechain ducking, and convolution reverb with a synthesized impulse response
  (decaying stereo noise, darkened over time). A smoothed-RMS glue compressor and soft clipping feed a
  −2 dBFS ceiling.
- **Harmony:** Dm – B♭ – F – C (i–VI–III–VII) for momentum, a Gm → A dominant breakdown for tension,
  and resolution to **D major** for the logo.

### Brand and language
- Brand: Moní's own palette (canvas #f8f7f4, ink #1a1a1f, navy #222437, gold #c18d48) and fonts
  (Roboto Serif and Nunito, plus Tinos for documents). The logo is the vector trace made for v1.
- English only, with no Cyrillic anywhere. Legal references are written as **"Labour Code · Art. 28"**
  and **"Civil Code · Art. 680(5)"**, and languages as "English / Russian / Tajik" and "EN RU TJ".
- **Accuracy:** each legal fact comes from Moní's real answers captured for v1:
  - probation dismissal under the Labour Code, Art. 28, and its three conditions
  - Civil Code Arts. 680(5), 683(1), 384(1), 687/516 and 718(3) for the five lease issues
  - "12 calculator categories" from Moní's llms.txt, and "Moní Pro — no limits" from the trial page

  The corrected clause wording is mine.

### Toolchain
HyperFrames (Apache-2.0): HTML + GSAP rendered frame-by-frame in headless Chrome at 60 fps. There is
one paused timeline, and every visual is a pure function of time, so frames render deterministically
in any order.

---

## 2. What I discarded (and why)

| idea | why not |
|---|---|
| Reusing v1's Mixkit music and SFX | They are samples, which the brief forbids. Everything was re-synthesized |
| Any TTS or voiceover | It would need a generation model; the kinetic type carries the message |
| WebGL / GLSL shaders for the particles | The renderer uses software GL, so slow or blank frames were a risk. Canvas 2D is deterministic and fast enough |
| v1's pixel-exact site replica | Too dense for a 24 s reel; abstracted UI in brand style reads in a fraction of a second |
| 140 BPM | Frantic for a legal brand and too many bars to fill. 120 BPM was too slow for 24 s. 128 BPM gives exactly 12 bars |
| White flash frames on the drops | Harsh on large screens and a photosensitivity risk; replaced by an iris + shockwave |
| Heavy glitch / RGB-split as a style | Cheap-looking for a premium legal brand; kept only as a 0.5 s chromatic shudder under the riser |
| Claiming "18 languages" | That figure belongs to the free version; the film shows only what the Pro UI offers (EN / RU / TJ) |
| Per-letter animation on "EN RU TJ" | Inline-block letters break kerning ("T J"), so that panel animates per word |
| A box-shadow glow on the breakdown dot | A big blur on a scaled layer rasterizes as a visible square; replaced with a radial gradient |
| 4K for v2 | Not requested (1080p60 asked); 60 fps doubles the frame count and 4K would have quadrupled capture time again |

---

## 3. Iterations

**Score**

1. First mix: −8.7 LUFS with a true peak of +0.7 dBFS (over-driven tanh, aggressive glue). I lowered the
   drive from 1.6 to 0.9, eased the compressor and set a −2 dBFS ceiling, which gave −12.3 LUFS.
2. Spectrogram review (I can't listen, so I checked by eye): the sub sine an octave below the bass
   (~37 Hz rumble) and supersaw pads crowding 200–600 Hz. I moved the sub to the fundamental,
   high-passed the pads at 170 Hz and raised the snare build, which gave −12.1 LUFS and −1.8 dBFS.

**Picture**

3. First pass, 24 snapshots:
   - line 1 overflowed the frame at 190 px → 150 px
   - "NO ONE." lost its gold to a CSS specificity clash → inline colour
   - the pill's ripple ring showed before its cue (a `fromTo` immediate render) → `set` + `immediateRender: false`
   - the answer block sat too high → rebalanced
   - the waveform showed as a dotted line before its entrance
   - the slot clipped words
   - the stamp wrapped onto two lines
   - the draft page was half empty → added skeleton sections 4–6
   - the end-card shine appeared as a rectangle → moved into an SVG gradient on clones of the letters
4. Second pass:
   - the slot was still clipping, because widths were measured after the scene's 0.72 entry scale → used `offsetWidth`
   - the 3D condition cards overflowed the right edge → narrower and shifted
   - the HUD collided with the contract wall → it fades earlier
5. 60 fps draft (2 min 09 s to render) and an **objective AV-sync check**: frame-differencing the video
   against the score's beat map put the stat cuts **0–8 ms** from the grid. The drops peak 40–50 ms
   after the downbeat because the iris grows from the beat; the onset itself is on the beat.
6. Frame-by-frame look at both drops: confirmed the 1/8 freeze, and found the square glow → radial gradient.
7. Final 1080p60 render (3 min 22 s), full contact sheet, found the "T J" kerning → per-word animation →
   re-rendered (3 min 34 s).

---

## 4. Time

Measured from the shell clock (`date -u`) at the start and at the push:

| phase | UTC | duration |
|---|---|---|
| Brief received, project scaffolded, variable fonts fetched | 20:56 → 20:57 | ~1 min |
| Score written, synthesized and mixed (3 versions, spectrogram check) | 20:57 → 21:01 | ~4 min |
| Composition built + 2 snapshot passes (9 fixes) | 21:01 → 21:13 | ~12 min |
| 60 fps draft render (2 min 09 s) + AV-sync and drop QA, glow fix | 21:13 → 21:17 | ~4 min |
| Final render (3 min 22 s), contact sheet, kerning fix, re-render (3 min 34 s) | 21:17 → 21:25 | ~8 min |
| DECISIONES.md, README, commit, push | 21:25 → 21:27 | ~2 min |
| **Total wall-clock** | **20:56:00 → 21:26:32** | **≈ 31 min** (of which ~9 min is render compute) |

The v1 4K master was still rendering in the background for the first ~10 minutes and shared the same
4 CPU cores.

---

## 5. Files

- `tools/synth.py`: the score (composition, synthesis, mix) plus the beat map and loudness export
- `assets/audio/score.wav`: the rendered score; `assets/data/audio-env.js`: beat map + per-frame RMS
- `assets/js/reel.js`: the whole film (one GSAP timeline, Canvas particle systems, HUD)
- `assets/css/reel.css`, `index.html`: layout and scene clips
- Re-render: `npx hyperframes@0.8.166 render --fps 60 --quality high --output renders/moni-showreel-1080p60.mp4`
