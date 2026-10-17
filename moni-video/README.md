# Moní · AI Conf 2026 film

A 90-second, seamlessly looping motion-design film for **Moní (tajiklaw.ai)**, made for the big
screen at **AI Conf 2026, Dushanbe (30–31 October)**. It shows Moní Pro doing real work:
- answering a legal question with article citations;
- answering in 18 languages, by text or voice;
- reviewing a lease against the Civil Code;
- running a tax calculation;
- drafting a services agreement.

Everything on screen is in English.

Built with [HyperFrames](https://github.com/heygen-com/hyperframes) (Apache-2.0). It is HTML plus GSAP,
rendered frame by frame in headless Chrome, so there is no licence fee for commercial use.

## Deliverables

| file | use |
|---|---|
| `renders/moni-aiconf2026-4k60.mp4` | **The master.** 3840×2160 at 60 fps, H.264 with stereo AAC |
| `renders/moni-aiconf2026-4k60-hevc.mp4` | The same picture in HEVC (H.265). Use it if the TV won't play 4K60 H.264 from USB |
| `renders/moni-aiconf2026-1080p60.mp4` | A lighter 1080p60 copy for laptops and social media |

The MP4s are build outputs and are not committed (`renders/` is git-ignored). Re-create them
with the commands at the bottom of this file.

Set the player to **loop**. The last two seconds dissolve back into the opening frame, and the
music's pickup bar is mixed into the tail, so the loop point is invisible and inaudible.
The film also works without sound, because every beat has on-screen text.

## Storyboard (120 BPM: every cut lands on a 2 s bar)

| time | scene | what happens |
|---|---|---|
| 0–8 | Hook | The names of Tajik codes and articles drift in 3D. "Laws are written for everyone. But they read as if written for *no one.*" (from Moní's About page) |
| 8–12 | Logo | The vector Moní logo; the gold swirl draws itself; "Tajik law, made simple with AI." The logo then flies into the site header |
| 12–26 | Ask | tajiklaw.ai assembles around the logo. The cursor types the probation question, "Moní is thinking", then the real answer streams in with *Labour Code, Art. 28* highlighted and its sources listed |
| 26–34 | 18 languages | The 18 languages Moní answers in cascade in. A question asked by voice is transcribed and answered (limitation period: three years, Civil Code Art. 214) |
| 34–52 | Review | A lease is uploaded and sent. On the music's drop (38 s) a scan line finds 5 problem clauses, each wired to Moní's review card. "Apply fixes" writes tracked changes into the document |
| 52–64 | Calculator | Calculator mode opens, and the 17 calculation types scroll past. Income Tax, 8,000 TJS, then Calculate. Moní's step-by-step result and breakdown table follow; net pay **6,917.92 TJS** counts up (Tax Code Arts. 183, 191, 332) |
| 64–70 | Drafting | A short beat: the drafted services agreement opens in the document viewer, with its `[specify: …]` gaps flagged |
| 70–78 | Moní Pro | Night scene with six tiles: Legal Q&A · contract review · calculators · 18 languages · drafting · current legislation |
| 78–90 | End card | Logo; "Need a lawyer? Ask Moní first."; tajiklaw.ai; a QR code (→ https://tajiklaw.ai/); AI Conf 2026 · Dushanbe. It then dissolves into the opening frame |

## How it is made

- **Exact site style.** `assets/css/moni-site.css` is tajiklaw.ai's own stylesheet, scoped under
  `.moni` (`tools/` has the extractor); `assets/data/fragments.js` is real DOM captured from the
  Pro version with Playwright (header, hero, chat input, answer markup, document viewer).
  Fonts are the site's (Nunito, Roboto Serif) plus Tinos for the Times-style document sheet.
- **Vector logo.** `assets/brand/moni-logo.svg` is traced from the site's 320 px PNG so it stays
  sharp at 4K and the swirl can be drawn on.
- **Motion.**
  - `assets/js/film.js` builds one paused GSAP timeline at 60 fps.
  - `assets/js/fx.js` holds the seek-safe helpers: token-stream reveal, typing, camera rig,
    oversized cursor and motion blur.
  - Motion follows the HyperFrames *motion-doctrine*: one current (leftward), causal clicks, no idle
    wobble.
  - **Every fast camera move carries directional motion blur.** It is a one-axis SVG Gaussian whose
    strength follows the move's own velocity curve, roughly a 180° shutter.
  - Button presses settle without overshoot.
  - Text-heavy holds are kept perfectly still, because a very slow zoom makes text re-rasterize in
    visible steps.
- **English only.** Moní's English answers keep Russian code abbreviations (e.g. "ТК РТ, ст. 28"). The film
  converts them to English ("Labour Code, Art. 28"). At build time it scans every text node in the
  composition and reports any Cyrillic, and the count is zero.
- **Sound.** `tools/mix-audio.py` mixes the music bed with SFX cues that the film registers at
  build time (`tools/export-cues.mjs` → `assets/audio/cues.json`). Credits: `assets/audio/CREDITS.md`.

## Provenance of the legal content

Everything Moní "says" in the film is Moní's own output, captured on tajiklaw.ai/trial (Pro), 16–17 Oct 2026:

- **Ask.** The full answer to *"Can an employer dismiss an employee during the probation period under the Labor
  Code of Tajikistan?"*.
  - It is trimmed to fit: sections 3–6 are omitted.
  - Citations are shown in English.
- **18 languages.** The list comes from Moní's own llms.txt: Russian, Tajik, English, Chinese, Kazakh, Uzbek,
  Arabic, Turkish, Italian, German, French, Spanish, Japanese, Hindi, Urdu, Persian, Korean and Kyrgyz.
  The same file says voice input works in all 18.
  - The voice answer (three years, Civil Code Art. 214) is Moní's answer to the same question asked in
    Russian and in Tajik, shown in English.
- **Review.** The review endpoint was timing out during capture (see the notes below). Each finding on Moní's
  review card therefore comes from Moní's answers to clause-specific questions:

  | finding | source |
  |---|---|
  | Rent changes only by agreement, at most once a year | Civil Code Art. 680(5) |
  | A building lease of one year or more needs state registration | Art. 718(3) |
  | The landlord may terminate early only in court, on Art. 687 grounds | Arts. 687, 516 |
  | Capital repairs are the landlord's duty by default | Art. 683(1) |
  | A court may reduce a disproportionate penalty | Art. 384(1) |

  The suggested replacement wording is ours.
- **Calculator.** The panel is the real Pro calculator: the 17 calculation types and the Income Tax form,
  captured in English.
  - The result is Moní's real calculation for 8,000 TJS a month, at an "other" organization, for a resident
    at their main place of work. Its output was in Russian and is shown here in English. It works out as:

    | step | amount |
    |---|---|
    | Social tax, 2% (Tax Code Art. 332(2)) | 160.00 |
    | Personal deduction, 2 × 78 (Art. 191(1)) | 156.00 |
    | Taxable income | 7,684.00 |
    | Income tax, 12% (Art. 183(1)) | 922.08 |
    | Net pay | 6,917.92 TJS |
- **Drafting.** An English rendering of the contract Moní drafted. Its output was in Russian.
- **Fictitious parties.** The lease and the companies in it (Somon City Plaza LLC, Pamir Trade LLC, Somon
  Digital LLC) are fictitious.

## Notes for the Moní team (found while capturing)

- `POST https://api.tajiklaw.ai/review` returned **Cloudflare 524** after ~2 min for both a full
  and a 6-clause lease, and attaching the same file with a question also ended without an answer
  (~160 s). Contract review on /trial looked broken at capture time.
- The review card labels are hard-coded in Russian in `upload.js` even on `/en/` (the film shows
  them in English).
- The English hero reads "Need lawyer? Ask Moní first" (missing "a"); the film uses "Need a lawyer?".
- In English, the limitation-period question did not retrieve ГК РТ ст. 214, while the same question
  in Russian and Tajik did.
- The /trial page says the free Pro trial ended on 9 September; the `moni-pro` login still works.
- **Calculator on `/en/`:**
  - Results come back in Russian, starting with the request bubble "Расчёт: Income Tax".
  - The field labels of *Vacation Pay*, *Final Settlement* and *Salary & Advance* are still in Russian.
- **Languages.** llms.txt advertises 18 languages; the Pro header's language menu offers only the interface
  languages.

## Edit / re-render

```bash
npx hyperframes@0.8.166 preview --background     # Studio preview
npx hyperframes@0.8.166 check                    # lint + layout + contrast
# after changing SFX timing in film.js, re-mix the soundtrack:
npx http-server -p 8765 -s . &                   # any static server
node tools/export-cues.mjs http://127.0.0.1:8765/index.html assets/audio/cues.json
python3 tools/mix-audio.py assets/audio/cues.json assets/audio/soundtrack.wav
# final renders
npx hyperframes@0.8.166 render --fps 60 --resolution 4k --quality high --crf 14 --output renders/moni-aiconf2026-4k60.mp4
ffmpeg -i renders/moni-aiconf2026-4k60.mp4 -c:v libx265 -crf 18 -preset medium -tag:v hvc1 -c:a copy renders/moni-aiconf2026-4k60-hevc.mp4
ffmpeg -i renders/moni-aiconf2026-4k60.mp4 -vf scale=1920:1080:flags=lanczos -c:v libx264 -crf 16 -preset slow -c:a copy renders/moni-aiconf2026-1080p60.mp4
```

## Skills used to make this

Installed into the agent from GitHub for this job:
`heygen-com/hyperframes` (hyperframes, product-launch-video, motion-doctrine, cut-the-curve,
oversized-cursor, seam-craft, hyperframes-animation/-keyframes/-cli…), `remotion-dev/skills`,
`greensock/gsap-skills`, `iart-ai/motion-design-skills`, `iart-ai/kinetic-typography-skills`,
`iart-ai/ad-video-skills`, `iart-ai/web-animation-skills`, `liyupi/ai-promo-video-maker`,
`kingselyjoe/video-shotcraft-dsh` (also the Mixkit SFX library), `Vincentwei1021/video-talkcraft`,
and for browser capture `lackeyjb/playwright-skill` + `microsoft/playwright-cli`.
