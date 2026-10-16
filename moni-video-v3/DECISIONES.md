# DECISIONES — Moní (v3)

**Deliverable:** `deliverables/moni-v3-1080p60.mp4`. It is 1920×1080 at 60 fps and runs 56.0 s, encoded as H.264 with AAC audio.
The score measures −15.8 LUFS integrated with a true peak of −1.5 dBTP.

**Feedback on v2:**
- "A lot of AI-slop patterns, like the font."
- "Too fast, I cannot read it."
- "Make it luxury, premium class, like Harvey AI: super expensive and smart."

**Constraints kept from v2:**
- Code only: no image, video or audio generation models.
- Music composed and synthesized from scratch, with no samples.
- 1080p60, fully in English.

---

## 1. What I decided

### Reading the feedback honestly
Before designing anything, I listed what in v2 was actually slop. Each item is a pattern that signals
"generated" rather than "designed":

- **Type:**
  - Roboto Serif with its width and weight axes stretched per letter.
  - ALL-CAPS word slams.
  - Gold on every accent.
  - Copy built on em-dashes ("Yes —").
- **Effects:**
  - Particle sparks, shockwaves, a 460-particle burst.
  - A chromatic shudder and camera shake on the kick.
  - A gradient shine sweep.
- **Furniture:**
  - A HUD with corner brackets, a section index and a running timecode.
  - Pill-shaped citation chips.
  - 3D orbiting cards.
  - A slot-machine word roll.
  - Stat counters.
- **Pace:** v2 was cut to a 128 BPM grid, so text changed every beat or bar. Some words were on screen for **one
  beat (0.47 s)**, and no line had more than about 1.9 s.

All of it is gone in v3.

### What I took from Harvey's visual language (not its assets)
Harvey's public design language is restraint:
- **Colour:** a warm near-black ground, ivory type, one accent.
- **Type:** a serif display at a light or regular weight with slightly negative tracking. Uppercase sans
  appears only in small eyebrows.
- **Shapes:** 1 px hairlines, radii of 4 and 8 px, no gradients, glows or pills.
- **Motion:** quiet. Things fade in with a short upward settle on `cubic-bezier(0.2, 0, 0, 1)`.

I adopted the language and the easing curve, not the identity. Moní keeps its own logo, and its bronze is
the film's only accent. The bronze appears in the logo and nowhere else, apart from two small marks.

| token | value | use |
|---|---|---|
| ground | `#0f0e0d` | every frame (never pure black) |
| ivory | `#fafaf9` | headlines and primary text |
| ivory 74 / 54 / 34 % | — | secondary text, eyebrows, labels |
| surface | `#1a1918` | the question field, the finding card and the file card |
| hairline | white 12–22 % | rules, borders |
| bronze | `#bf9a66` | the Moní logo's n and swirl only |
| amber | `#d8be93` | the highlighter on the risky clause, and "High risk" |
| paper | `#f2efe8` | the contract pages |

### Type: chosen by process, not reflex
1. **Voice.** Three words for Moní: *precise, discreet, authoritative*. The physical object is *an engraved
   letterhead from a senior partner's chambers*.
2. **Excluded by rule.** The serifs an AI reaches for first when asked for "luxury":
   - Playfair Display, Cormorant, Fraunces, Instrument Serif, Newsreader, Lora, Crimson, DM Serif.
   - The "elegant free default", EB Garamond.
   - The sans defaults Inter, DM Sans, Space Grotesk, Plus Jakarta, Outfit, IBM Plex and Roboto.
3. **Specimen.** I set 12 non-reflex serifs and 11 sans on the real `#0f0e0d` ground at real sizes, using the
   film's own sentences, and compared them side by side:
   - Serifs: Spectral, Source Serif 4, Libre Caslon, Noto Serif Display, Literata, Ibarra Real Nova, Gloock,
     Castoro, Bodoni Moda, Petrona, Brygada 1918, Hedvig Letters.
   - Sans: Public Sans, Libre Franklin, Schibsted Grotesk, Albert Sans, Hanken Grotesk, Mona Sans, Red Hat
     Text, Archivo, Onest, Host Grotesk, Wix Madefor.
4. **Display: Source Serif 4, at its *Display* optical size (`opsz 60`), weight 300.**
   - It is a transitional face in the Fournier lineage, the kind of type modern legal codes were set in.
   - At display size its hairlines are sharp and its contrast is calm, so it stays readable at a distance on a TV.
   - Its italic is a true italic, which I use as the quiet counter-voice ("*Understood by few.*").
   - Most people only ever see the text cut. The display cut is what makes it look expensive.
5. **Text: Public Sans.** It was built for the U.S. Web Design System, for public-sector interfaces. The law is
   a public service, and the face is neutral, open and very legible at small sizes.
6. **Runners-up and why they lost:**
   - Noto Serif Display: too fashion-magazine.
   - Bodoni Moda: its hairlines break up at 1080p from across a hall.
   - Gloock and Castoro: too heavy and warm for "discreet".
   - Libre Caslon Display: one weight, with a mismatched italic.
   - Spectral: bookish at display sizes.
7. **Sizes for a big screen:**
   - Display 120 px, headings 76 px, the answer 44 px, UI text 32 px.
   - Everything a viewer must read is 23 px or larger. Letterspaced 16–19 px caps are used only for labels.

### Pace: reading time decides the timeline; the music follows it
- **Readability rule.** Every block of text stays fully legible for at least **1.0 s + 0.3 s per word** before
  anything leaves. "Legible" means 0.7 s after its fade starts.
- **Single source of truth.** All times live in `assets/data/cues.js`, which both the picture and the score read.

| block | words | legible | leaves | held | needed |
|---|---|---|---|---|---|
| The law is written for everyone. | 6 | 2.2 s | 6.9 s | 4.7 s | 2.8 s |
| *Understood by few.* | 3 | 4.5 s | 6.9 s | 2.4 s | 1.9 s |
| An AI lawyer for the laws of Tajikistan. | 7 | 9.9 s | 13.2 s | 3.3 s | 3.1 s |
| Ask in plain language. + lede | 10 | 15.8 s | 27.0 s | 11.2 s | 4.0 s |
| Can my employer dismiss me during probation? | 7 | typed by 19.4 s | 27.0 s | 7.6 s | 3.1 s |
| Yes, but only on the grounds set out in Article 28 of the Labour Code. | 13 | 21.3 s | 27.0 s | 5.7 s | 4.9 s |
| Source: Labour Code of the Republic of Tajikistan, Art. 28(8) | 8 | 22.3 s | 27.0 s | 4.7 s | 3.4 s |
| Every clause, checked against the law. | 6 | 29.6 s | 39.2 s | 9.6 s | 2.8 s |
| Finding card (title, explanation, citation) | 21 | 31.9 s | 39.2 s | 7.3 s | 7.3 s |
| A complete first draft, ready to edit. + lede | 15 | 41.6 s | 47.0 s | 5.4 s | 5.5 s* |
| Services Agreement.docx card | 5 | 44.3 s | 47.0 s | 2.7 s | 2.5 s |
| Tajik law, understood. · tajiklaw.ai · footer | 11 | 50.3 s | end | ≥ 4.6 s | 4.3 s |

\*The heading is legible at 41.1 s, and the lede follows it.

**Result.** The **shortest hold is 2.4 s**, against 0.47 s in v2. The film carries about 2.1 words per second
on average.

**Why 56 s and not 24 s.** v2's brief was 20–25 s, but its fault was exactly that it had to sprint. Saying
the same things at a readable pace takes about 56 s, which also suits a conference screen that loops all day.
The alternative was cutting the story to two scenes. I preferred to keep Ask, Review and Draft, because that is
the product.

### Motion: four moves, nothing else
1. **Fade and rise:** opacity 0 → 1 with an 18–20 px settle, on `cubic-bezier(0.2, 0, 0, 1)` (Harvey's
   curve), over 1.4–2.0 s. Exits take 0.8–0.9 s and drift 10 px up.
2. **A hairline drawing across** the top of each section, plus the logo's swirl drawing itself.
3. **Typing.** The caret blinks only while the field is idle, as a real caret does.
4. **Highlighter and tracked change.**
   - An amber highlighter passes over the risky clause.
   - The clause is struck through.
   - The corrected clause then opens up beneath it, pushing the rest of the page down.

Between those moves the frame is completely still. I tried a slow push-in on the title cards and measured
it, and it failed (see Iterations, step 6).

There are no cuts on beats. Scenes dip through the ground colour, so every scene starts from a clean frame.
The layout grid holds across Ask, Review and Draft: the same left column (a hairline, an eyebrow, a heading)
and the same right-hand object. The eye never has to search.

### Story and copy
| scene | time | on screen |
|---|---|---|
| Thesis | 0–8 s | "The law is written for everyone. *Understood by few.*" |
| Mark | 8–14 s | Moní logo (the swirl draws itself); "*An AI lawyer for the laws of Tajikistan.*" (Moní's own site title, translated) |
| Ask | 14–28 s | "Ask in plain language." The question is typed and sent; Moní answers and cites its source |
| Review | 28–40 s | "Every clause, checked against the law." A lease page; clause 2.2 is flagged, explained, struck and rewritten |
| Draft | 40–48 s | "A complete first draft, ready to edit." A services agreement inks in with its `[specify]` gaps marked, plus a Word file card |
| End card | 48–56 s | Logo; "*Tajik law, understood.*"; tajiklaw.ai; "English · Russian · Tajik"; "AI Conf 2026 · Dushanbe" |

**Accuracy.** Every legal statement comes from Moní's real answers, captured in the Pro version for v1:
- The probation answer and its source (Labour Code, Art. 28 and Art. 28(8)).
- The lease finding (Civil Code, Art. 680(5): rent changes only by agreement, at most once a year). It is
  finding 1 of the 5 that Moní returned for that lease.
- The draft's terms (TJS 25,000, 60 days, 50/50) and its `[specify]` placeholders.
- The Word export.

The wording of the corrected clause is mine. There is no Cyrillic anywhere.

### Score: scored to the picture
`tools/score.py` uses numpy and scipy and needs no samples. It reads the same cue file as the picture.

- **Form:** 60 BPM in D♭ major. One beat is one second, so every scene boundary is also a beat.
- **Chords:** the changes land on scene cues:
  - D♭maj9 → B♭m9 (thesis)
  - G♭maj7♯11 → A♭sus (logo)
  - D♭/F → G♭maj9 → E♭m9 → A♭13sus (ask)
  - B♭m9 → G♭maj7 → A♭7sus (review)
  - G♭maj9 → A♭ (draft)
  - D♭maj9 (end card)
- **Melody:** a four-note falling theme is stated in the opening and resolved on the end card. Single piano
  notes mark the moments that matter: the answer arriving, its source, the finding, the fix and the draft.
  Each sits on a chord tone or a 9th of the harmony underneath.
- **Felt piano (additive synthesis):**
  - Up to 30 inharmonic partials per note, with stiffness rising up the keyboard.
  - Two slightly detuned strings per note.
  - A two-stage decay, with prompt sound and aftersound.
  - A hammer-position comb at 1/7.3 of the string, and a velocity-dependent felt low-pass.
  - A soft key knock, and a damper at the end of each note.
  - An eighth-note ostinato carries the product scenes. It moves to quarter notes while the viewer reads the
    contract page, and stops for a breath before the final chord.
- **Strings:** four detuned band-limited saws per note with slow vibrato, low-passed, with slow attacks.
- **Low end:** a sub on the bass root, and a soft pitched "felt" hit under each logo entrance.
- **Air:** a noise breath swells into each logo entrance. It is the only transition sound.
- **Mix:**
  - Each bus is set to a target RMS level before mixing.
  - Convolution reverb with a synthesized, darkening 4.2 s impulse response.
  - Slow levelling and a 4th-order high-pass at 36 Hz, because TV speakers can't use the very bottom.
  - A look-ahead peak limiter.
  - Result: −15.8 LUFS integrated, −1.5 dBTP, LRA 2.8 LU.

---

## 2. What I discarded (and why)

| idea | why not |
|---|---|
| Everything listed under "Reading the feedback honestly" | Slop: effects standing in for design |
| The three probation conditions as a list under the answer | 36 words could not be read in the 6.6 s available; the answer + source carry the point |
| An explanatory line under "Every clause, checked against the law." | The finding card says it better; it pushed the scene over the reading budget |
| The full citation on the finding card | Shortened to "Civil Code, Art. 680(5)" to fit the reading budget |
| A persistent letterhead (logo top-left, URL top-right) | Too close to v2's HUD; empty frames look more confident |
| Film grain / vignette | Harvey's language has neither; flat ground compresses cleanly on H.264 |
| Any camera drift or push-in | Measured: the text re-rasterizes in steps (judder); stillness is also more Harvey |
| Synthesized keyboard clicks under the typing | Sound effects for UI read as cheap next to a piano score |
| Showing all five lease findings | One finding, explained and fixed, is more convincing than five glimpsed |
| Noto Serif Display, Bodoni Moda, Spectral, Libre Caslon Display | See "Type" above |
| Keeping 24 s | Unreadable at that length; see "Pace" |

---

## 3. Iterations

1. **Type specimen** (two sheets, 23 faces) → Source Serif 4 Display + Public Sans.
2. **Score, first mix.** The sub bus was 22 dB louder than the piano: the waveform was a flat block and the
   spectrogram was solid below 100 Hz. I set each bus to a target RMS (piano −20, strings −29, sub −34, air −46),
   added a 36 Hz high-pass and a look-ahead limiter. That went from −12.0 LUFS (all sub) via −18.3 to −15.8 LUFS
   with a 21 dB piano crest.
3. **Reading-budget pass** on paper, before building:
   - cut the conditions list, the review lede and the long citation
   - moved the tagline earlier
   - moved the finding card earlier and held it longer
4. **Snapshot pass 1** (8 hold frames):
   - The finding card had no `top`, so it covered the page title. Its top is now computed from the clause's
     position, so it sits level with clause 2.2 in the page's margin.
   - The Ask scene was top-heavy, so both columns are now aligned on one line at y = 340.
   - The logo-to-tagline gap was tightened.
   - The draft page looked empty at the bottom, so a Word file card was added.
5. **Snapshot pass 2** (12 frames in mid-transition): the corrected clause reserved an empty gap on the page
   before the fix appeared. It now opens from zero height when the fix lands.
6. **First 60 fps render (2 min 44 s) and measuring it rather than eyeballing it:**
   - **Judder.** On the thesis card, the frame-to-frame difference was zero on most frames, with spikes up to
     1.67 grey levels every 2–3 frames. So the 1.8 % push-in made the 120 px serif re-rasterize in visible
     steps, which reads as shimmer on a big TV. The UI hold at 24–26 s was identical frame to frame. I removed
     the drift from both title cards, so the film is now still except for its four moves.
   - **Bitrate.** The default encode came out at 0.63 Mbps, because the frames are mostly static. That is
     clean on still frames, but thin for fades on a large panel. The final encode uses CRF 12.
   - **Reading budget, checked against the render.** I moved the tagline 0.2 s earlier and held it 0.1 s
     longer. I brought the Word card in 0.8 s earlier. Then I re-ran the score so its notes follow the moved
     cues.
7. **Final render at CRF 12** (2 min 46 s, 6.4 MB). Checked against the MP4:
   - Once a line has settled, the thesis card is identical from frame to frame (difference 0.0).
   - The logo's first visible frame is at 8.000 s, and the felt hit under it starts at 8.012 s.

---

## 4. Time

Measured from the shell clock (`date -u`), from the moment I started on the feedback until the commit:

| phase | UTC | duration |
|---|---|---|
| Feedback read; Harvey's design language and the anti-slop rules researched | 21:32 → 21:34 | ~2 min |
| Fact check against captured Moní answers; type specimen (23 faces); project scaffolded | 21:34 → 21:40 | ~6 min |
| Score composed, synthesized and mixed (3 mixes, spectrogram and loudness checks) | 21:40 → 21:48 | ~8 min |
| Composition built; reading-budget pass; 3 snapshot passes (5 fixes) | 21:48 → 21:55 | ~7 min |
| First 60 fps render (2 min 44 s), with DECISIONES drafted in parallel | 21:55 → 21:58 | ~3 min |
| Lost time: my wait loop matched its own process name and waited out its timeout | 21:58 → 22:04 | ~6 min |
| Render measured (bitrate, crops, judder); drift removed; timing fixes | 22:04 → 22:08 | ~4 min |
| Score re-run; final render (2 min 46 s); AV-sync and stillness checks | 22:08 → 22:13 | ~5 min |
| DECISIONES.md, README, commit | 22:13 → 22:13 | ~1 min |
| **Total wall-clock** | **21:32:11 → 22:13:01** | **≈ 41 min** (of which ~5.5 min is render compute and ~6 min was idle) |

---

## 5. Files

- `assets/data/cues.js`: every time in the film, shared by picture and score
- `tools/score.py`: the score (composition, synthesis, mix) → `assets/audio/score.wav`
- `assets/js/film.js`: the whole film (one GSAP timeline, five motion moves)
- `assets/css/film.css`: the tokens and layout; `index.html`: the scenes and their copy
- `assets/fonts/`: Source Serif 4 (roman + italic, variable) and Public Sans (variable), both OFL
- Re-render: `python3 tools/score.py assets/data/cues.js assets/audio/score.wav`, then
  `npx hyperframes@0.8.166 render --fps 60 --quality high --output renders/moni-v3-1080p60.mp4`
