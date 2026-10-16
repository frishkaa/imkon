// Dump the SFX cue list the film registers at build time (window.__FILM_CUES) to JSON.
// usage: node tools/export-cues.mjs http://127.0.0.1:8765/index.html assets/audio/cues.json
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
const [url, out] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.addInitScript(() => { window.__timelines = {}; });
await p.goto(url);
await p.waitForFunction(() => !!(window.__timelines && window.__timelines.main), null, { timeout: 30000 });
const cues = await p.evaluate(() => window.__FILM_CUES);
fs.writeFileSync(out, JSON.stringify(cues, null, 1));
console.log(cues.length, 'cues');
await b.close();
