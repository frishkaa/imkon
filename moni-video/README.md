# Moní · AI Conf 2026 film

A 96-second, seamlessly looping motion-design film for **Moní (tajiklaw.ai)**, made for the big
screen at **AI Conf 2026, Dushanbe (30–31 October)**. It shows Moní Pro doing real work:
- answering a legal question with article citations;
- answering in the user's own language, by text or voice;
- reviewing a lease against the Civil Code;
- running a tax calculation;
- drafting a services agreement;
- keeping every chat in your account.

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
music's end hit hands over to the opening break on the last beat, so the loop point is invisible and inaudible.
The film also works without sound, because every beat has on-screen text.

## Storyboard (120 BPM: every cut lands on a 2 s bar)

| time | scene | what happens |
|---|---|---|
| 0–8 | Hook | Music: a sparse break. The names of Tajik codes and articles drift in 3D. "Laws are written for everyone. But they read as if written for *no one.*" (from Moní's About page) |
| 8–12 | Logo | The build kicks in with the logo. The vector Moní logo; the gold swirl draws itself; "Tajik law, made simple with AI." The logo then flies into the site header |
| 12–26 | Ask | tajiklaw.ai assembles around the logo. Drop 1 hits as the cursor starts typing the probation question, "Moní is thinking", then the real answer streams in with *Labour Code, Art. 28* highlighted and its sources listed |
| 26–34 | Your language | "Ask in your language." A sample of the languages Moní answers in cascades in ("and many more"; the film gives no total). A question asked by voice is transcribed and answered (limitation period: three years, Civil Code Art. 214) |
| 34–52 | Review | A lease is uploaded and sent. Under the breakdown and riser the scan runs; on drop 2 (38 s) a scan line finds 5 problem clauses, each wired to Moní's review card. "Apply fixes" writes tracked changes into the document |
| 52–64 | Calculator | Calculator mode opens, and the 17 calculation types scroll past. Income Tax, 8,000 TJS, then Calculate. Moní's step-by-step result and breakdown table follow; net pay **6,917.92 TJS** counts up (Tax Code Arts. 183, 191, 332) |
| 64–70 | Drafting | A short beat: the drafted services agreement opens in the document viewer, with its `[specify: …]` gaps flagged |
| 70–78 | Your account | Music: the second breakdown and riser. The real login card ("Welcome back — Log in to see your chat history"). After logging in, the "Chats" sidebar opens with this film's conversations saved in it, and the earlier tax calculation reopens exactly as it was. "Every chat, *saved.*" |
| 78–86 | Moní Pro | The final drop. Night scene with six tiles: Legal Q&A · contract review · calculators · any language · drafting · current legislation (thousands of Tajik legal acts) |
| 86–96 | End card | Logo; "Need a lawyer? Ask Moní first."; tajiklaw.ai; a QR code (→ https://tajiklaw.ai/); AI Conf 2026 · Dushanbe. The final drop carries the card and the track's own end hit lands at 94 s, as the card dissolves into the opening frame |

## How it is made

- **Exact site style.** `assets/css/moni-site.css` is tajiklaw.ai's own stylesheet, scoped under
  `.moni` (`tools/` has the extractor); `assets/data/fragments.js` is real DOM captured from the
  Pro version with Playwright (header, hero, chat input, answer markup, document viewer).
  Inside the browser the site keeps its own fonts (Nunito, Roboto Serif), plus Tinos for the
  Times-style document sheet. The film's own titles and captions use **General Sans** (Indian Type Foundry, via
  Fontshare; the ITF Free Font License allows commercial use). It is set semibold with tight tracking and no
  italics, the way startup launch decks are set. The emphasised words are in Moní's gold.
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
- **Music.** "Our Ups and Downs" (Michael Ramir C., Mixkit, free for commercial use) was chosen to fit the
  usual launch-film pattern:
  - modern future-house / synth-pop, instrumental, at 120 BPM;
  - a quiet open, a build into the reveal, the product moments on the drops, and a clean ending on the end card.

  It was picked from 43 Mixkit candidates by measuring tempo, structure and dynamics. The CLAP audio–text model
  was used as a check for "modern launch music" versus "cheesy corporate" and for vocals.

  Its downbeats sit exactly on the film's 2 s grid. `EDIT` in `tools/mix-audio.py` re-cuts the track bar for bar,
  so its own build, drops, breakdowns and end hit land on the logo (8 s), the first question (14 s), the review
  findings (38 s), "Moní Pro" (78 s) and the loop (94 s). There are only three in-section splices, with no
  time-stretching.

## Provenance of the legal content

Everything Moní "says" in the film is Moní's own output, captured on tajiklaw.ai/trial (Pro), 16–17 Oct 2026:

- **Ask.** The full answer to *"Can an employer dismiss an employee during the probation period under the Labor
  Code of Tajikistan?"*.
  - It is trimmed to fit: sections 3–6 are omitted.
  - Citations are shown in English.
- **Languages.** The film names no total, per the Moní team. The chips are a sample: English, Russian, Tajik,
  Chinese, Kazakh, Uzbek, Arabic, Turkish, Italian, German, French, Spanish, Japanese, Hindi, Urdu, Persian,
  Korean and Kyrgyz, followed by "and many more".
  - The voice answer (three years, Civil Code Art. 214) is Moní's answer to the same question asked in
    Russian and in Tajik, shown in English.
- **Legislation.** The film says "thousands of Tajik legal acts", per the Moní team, rather than a figure.
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
- **Account.** Two parts are real; the rest is a stand-in:
  - The login card is the site's own: /trial/en/login reads "Log in to see your chat history".
  - The sidebar is the site's own chat-history drawer. The site's code notes that history is kept on the server
    for logged-in users and in the browser for guests.
  - The user "Nilufar" (nilufar@example.com) is a stand-in, so no real account was created or used.
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
- **Chat sidebar on `/en/`.** The labels are still Russian ("Чаты", "Новый чат"); the film shows them in English.
- **Languages.** tajiklaw.ai/llms.txt still says "18 languages" and "~220 legal acts". The team says both figures
  are out of date, so the llms.txt may be worth updating.

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
