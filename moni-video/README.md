# Moní · AI Conf 2026 film

A 90-second, seamlessly looping motion-design film for **Moní (tajiklaw.ai)**, made for the big
screen at **AI Conf 2026, Dushanbe (30–31 October)**. It shows Moní Pro doing real work:
answering a legal question with article citations, answering in English / Русский / Тоҷикӣ,
reviewing a lease against the Civil Code, and drafting a services agreement.

Built with [HyperFrames](https://github.com/heygen-com/hyperframes) (Apache-2.0: HTML + GSAP,
rendered frame-by-frame in headless Chrome), so there is no licence fee for commercial use.

## Deliverables

| file | use |
|---|---|
| `renders/moni-aiconf2026-4k.mp4` | **play this on the TV** — 3840×2160, 30 fps, H.264, stereo AAC |
| `renders/moni-aiconf2026-1080p.mp4` | lighter copy for laptops / social |

Set the player to **loop**. The last two seconds dissolve back into the opening frame, and the
music's pickup bar is mixed into the tail, so the loop point is invisible and inaudible.
The film works without sound too (every beat has on-screen text).

## Storyboard (120 BPM — every cut lands on a 2 s bar)

| time | scene | what happens |
|---|---|---|
| 0–8 | Hook | Real code names drift in 3D; "Laws are written for everyone. But they read as if written for *no one.*" (from Moní's About page) |
| 8–12 | Logo | Vector Moní logo; the gold swirl draws itself; "Tajik law, made simple with AI." The logo then flies into the site header |
| 12–26 | Ask | tajiklaw.ai assembles around the logo; cursor types the probation question; "Moní is thinking"; the real answer streams with `ТК РТ, ст. 28` highlighted; sources (Labour Code, ed. 17.06.2026) |
| 26–34 | Languages | Three real answers: EN (probation), RU and TJ (limitation period — three years, ГК РТ ст. 214); Tajik one arrives by voice |
| 34–56 | Review | A lease flies in and is sent; on the music's drop (38 s) a scan line finds 5 problem clauses, wired to Moní's review card; "Apply fixes" writes tracked changes into the document |
| 56–70 | Drafting | "Draft a services agreement…" → Moní's document card → the site's document viewer opens the contract; `[specify: …]` gaps glow gold |
| 70–78 | Moní Pro | Night scene: all laws · review · drafting · calculators · languages · current legislation |
| 78–90 | End card | Logo, "Need a lawyer? Ask Moní first.", tajiklaw.ai, QR code (→ https://tajiklaw.ai/), AI Conf 2026 · Dushanbe, then dissolve into the opening frame |

## How it is made

- **Exact site style.** `assets/css/moni-site.css` is tajiklaw.ai's own stylesheet, scoped under
  `.moni` (`tools/` has the extractor); `assets/data/fragments.js` is real DOM captured from the
  Pro version with Playwright (header, hero, chat input, answer markup, document viewer).
  Fonts are the site's (Nunito, Roboto Serif) plus Tinos for the Times-style document sheet.
- **Vector logo.** `assets/brand/moni-logo.svg` is traced from the site's 320 px PNG so it stays
  sharp at 4K and the swirl can be drawn on.
- **Motion.** `assets/js/film.js` builds one paused GSAP timeline; `assets/js/fx.js` holds the
  seek-safe helpers (token-stream reveal, typing, camera rig, oversized cursor). Motion follows
  the HyperFrames *motion-doctrine*: one current (leftward), causal clicks, no idle wobble.
- **Sound.** `tools/mix-audio.py` mixes the music bed with SFX cues that the film registers at
  build time (`tools/export-cues.mjs` → `assets/audio/cues.json`). Credits: `assets/audio/CREDITS.md`.

## Provenance of the legal content

Everything Moní "says" in the film is Moní's own output, captured on tajiklaw.ai/trial (Pro) on
16 Oct 2026:

- **Ask scene** — the full answer to *"Can an employer dismiss an employee during the probation
  period under the Labor Code of Tajikistan?"* (trimmed to fit: sections 3–6 omitted).
- **Languages** — RU: *"Какой срок исковой давности по Гражданскому кодексу РТ?"* → «три года
  (ГК РТ, ст. 214)»; TJ: *"Мӯҳлати умумии даъво…"* → «се сол (ГК РТ, моддаи 214)».
- **Review** — the review endpoint was timing out during capture (see notes), so each finding on
  Moní's review card is taken from Moní's answers to clause-specific questions: rent changes only
  by agreement, ≤ once a year (ГК РТ ст. 680 ч. 5); building lease ≥ 1 year needs state
  registration (ст. 718 ч. 3); landlord may terminate early only in court on art. 687 grounds
  (ст. 687, 516); capital repairs are the landlord's duty by default (ст. 683 п. 1); a court may
  reduce a disproportionate penalty (ст. 384 ч. 1). The suggested replacement wording is ours.
- **Drafting** — an English rendering of the contract Moní drafted (its output was in Russian).
- The lease and the companies in it (Somon City Plaza LLC, Pamir Trade LLC, Somon Digital LLC)
  are fictitious.

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

## Edit / re-render

```bash
npx hyperframes@0.8.166 preview --background     # Studio preview
npx hyperframes@0.8.166 check                    # lint + layout + contrast
# after changing SFX timing in film.js, re-mix the soundtrack:
npx http-server -p 8765 -s . &                   # any static server
node tools/export-cues.mjs http://127.0.0.1:8765/index.html assets/audio/cues.json
python3 tools/mix-audio.py assets/audio/cues.json assets/audio/soundtrack.wav
# final renders
npx hyperframes@0.8.166 render --resolution 4k --quality high --output renders/moni-aiconf2026-4k.mp4
npx hyperframes@0.8.166 render --quality high --output renders/moni-aiconf2026-1080p.mp4
```

## Skills used to make this

Installed into the agent from GitHub for this job:
`heygen-com/hyperframes` (hyperframes, product-launch-video, motion-doctrine, cut-the-curve,
oversized-cursor, seam-craft, hyperframes-animation/-keyframes/-cli…), `remotion-dev/skills`,
`greensock/gsap-skills`, `iart-ai/motion-design-skills`, `iart-ai/kinetic-typography-skills`,
`iart-ai/ad-video-skills`, `iart-ai/web-animation-skills`, `liyupi/ai-promo-video-maker`,
`kingselyjoe/video-shotcraft-dsh` (also the Mixkit SFX library), `Vincentwei1021/video-talkcraft`,
and for browser capture `lackeyjb/playwright-skill` + `microsoft/playwright-cli`.
