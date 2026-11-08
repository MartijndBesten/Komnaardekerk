#!/usr/bin/env node
// Spandoek per concept: alleen het woord en het domein (issue #131). 3:1, bijvoorbeeld 600 × 200 cm.
//   node ontwerpen/spandoek.mjs  → ontwerpen/spandoek/spandoek-{a,b,c}.png (+ webp)
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const UIT = path.join(HIER, 'spandoek');
mkdirSync(UIT, { recursive: true });
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = createRequire('/opt/node22/lib/node_modules/')('playwright')); }
const F = (n) => pathToFileURL(path.join(HIER, '..', 'voorstellen', 'fonts', n)).href;
const FONTS = `@font-face{font-family:'Atkinson Next';src:url(${F('atkinson-next.woff2')});font-weight:200 800}
@font-face{font-family:'Newsreader';src:url(${F('newsreader-opsz-normal.woff2')})}
@font-face{font-family:'Archivo';src:url(${F('archivo.woff2')});font-weight:500 900;font-stretch:62% 100%}
*{box-sizing:border-box;margin:0}body{margin:0}`;

const DOEK = {
  a: `<div class="d"><p class="w">Moe?</p><p class="u">komnaardekerk.nu</p></div>
<style>.d{width:1800px;height:600px;background:#1E2A2F;color:#F2EFE9;display:flex;flex-direction:column;justify-content:center;padding:0 110px}
.w{font:400 380px/0.85 Newsreader;letter-spacing:-0.025em}.u{font:700 92px/1 'Atkinson Next';color:#EADFC8;margin-top:34px}</style>`,
  b: `<div class="d"><p class="w">MOE?</p><p class="u">komnaardekerk.nu</p></div>
<style>.d{width:1800px;height:600px;background:#FAFAF8;color:#101820;display:flex;flex-direction:column;justify-content:center;padding:0 100px;border-left:28px solid #2F5F99}
.w{font:900 420px/0.8 Archivo;font-stretch:66%}.u{font:800 96px/1 Archivo;font-stretch:80%;color:#2F5F99;margin-top:40px}</style>`,
  c: `<div class="d"><p class="w">Moe?</p><p class="u">komnaardekerk.nu</p></div>
<style>.d{width:1800px;height:600px;background:#1F2140;color:#FBF8F4;display:flex;flex-direction:column;justify-content:center;padding:0 110px}
.w{font:800 360px/0.86 'Atkinson Next';letter-spacing:-0.03em}.u{font:700 92px/1 'Atkinson Next';color:#FBE9DA;margin-top:38px}</style>`
};

const TMP = path.join(HIER, '.spandoek-tmp.html');
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1800, height: 600 } });
for (const [c, html] of Object.entries(DOEK)) {
  writeFileSync(TMP, `<!doctype html><html lang="nl"><head><meta charset="utf-8"><style>${FONTS}</style></head><body>${html}</body></html>`);
  await p.goto(pathToFileURL(TMP).href, { waitUntil: 'load' });
  await p.evaluate(() => Promise.all([...document.fonts].map((f) => f.load())));
  await p.screenshot({ path: path.join(UIT, `spandoek-${c}.png`) });
}
await b.close();
rmSync(TMP, { force: true });
console.log('✓ spandoeken in', UIT);
