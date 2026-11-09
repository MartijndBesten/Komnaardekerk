#!/usr/bin/env node
// Maakt alle merkbestanden in src/static/merk/ uit src/lib/logo.mjs (één bron).
//   node scripts/merk.mjs
// Vereist Playwright voor de PNG's (cloudsessie: voorgeïnstalleerd; lokaal: PLAYWRIGHT_MODULE=<pad>).
// Woordmerkpaden opnieuw maken (alleen bij letterwijziging): scripts/merk_paden.py → merk/bron/woordmerk-newsreader.json.

import { writeFile, mkdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import * as L from '../src/lib/logo.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UIT = path.join(ROOT, 'src', 'static', 'merk');
const require = createRequire(import.meta.url);
let pw;
try { pw = require(process.env.PLAYWRIGHT_MODULE || 'playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }

await rm(path.join(UIT, 'logo'), { recursive: true, force: true });
await mkdir(path.join(UIT, 'logo'), { recursive: true });
const K = L.KLEUREN;

const bestanden = {
  'logo/beeldmerk.svg': L.beeldmerkSvg({ donker: false }),
  'logo/beeldmerk-donker.svg': L.beeldmerkSvg({ donker: true }),
  'logo/beeldmerk-kerst-donker.svg': L.beeldmerkSvg({ donker: true, kerst: true }),
  'logo/beeldmerk-vlak.svg': L.vlakSvg({ donker: false }),
  'logo/beeldmerk-vlak-donker.svg': L.vlakSvg({ donker: true }),
  'logo/beeldmerk-zwart.svg': L.monoSvg({ kleur: '#000000' }),
  'logo/beeldmerk-wit.svg': L.monoSvg({ kleur: '#FFFFFF' }),
  'logo/woordmerk.svg': L.woordmerkSvg({}),
  'logo/woordmerk-donker.svg': L.woordmerkSvg({ donker: true }),
  'logo/logo-horizontaal.svg': L.horizontaalSvg({ vlak: true }),
  'logo/logo-horizontaal-donker.svg': L.horizontaalSvg({ donker: true, vlak: true }),
  'logo/logo-horizontaal-stralend.svg': L.horizontaalSvg({}),
  'logo/logo-horizontaal-stralend-donker.svg': L.horizontaalSvg({ donker: true }),
  'logo/logo-horizontaal-zwart.svg': L.horizontaalSvg({ mono: '#000000' }),
  'logo/logo-horizontaal-wit.svg': L.horizontaalSvg({ mono: '#FFFFFF' }),
  'logo/logo-staand.svg': L.staandSvg({}),
  'logo/logo-staand-donker.svg': L.staandSvg({ donker: true }),
  'logo/logo-staand-zwart.svg': L.staandSvg({ mono: '#000000' }),
  'logo/logo-staand-wit.svg': L.staandSvg({ mono: '#FFFFFF' }),
  'logo/icoon.svg': L.icoonSvg()
};
for (const [rel, inhoud] of Object.entries(bestanden)) await writeFile(path.join(UIT, rel), inhoud + '\n');
console.log(`✓ ${Object.keys(bestanden).length} SVG's`);

// PNG's
const pngs = {
  'favicon-32.png': { b: 32, h: 32, svg: L.icoonSvg(), transparant: true },
  'apple-touch-icon.png': { b: 180, h: 180, svg: L.icoonSvg({ rond: 0 }) },
  'logo/icoon-512.png': { b: 512, h: 512, svg: L.icoonSvg(), transparant: true },
  'logo/beeldmerk-donker-1200.png': { b: 1200, h: 1376, svg: L.beeldmerkSvg({ donker: true }), achtergrond: K.nacht },
  'logo/logo-horizontaal-1600.png': { b: 1600, h: 480, svg: L.horizontaalSvg({}), transparant: true, pad: 30 }
};
// Deelbeeld (og:image): warm donker, stralend merk en de kernzin in Newsreader.
const lettertype = async (f) => `data:font/woff2;base64,${(await readFile(path.join(ROOT, 'src/static/fonts', f))).toString('base64')}`;
const kop = await lettertype('newsreader-opsz-normal.woff2');
const kopI = await lettertype('newsreader-opsz-italic.woff2');
const deelbeeldHtml = `<!doctype html><style>
@font-face{font-family:K;src:url(${kop})}@font-face{font-family:K;font-style:italic;src:url(${kopI})}
html,body{margin:0}.v{width:1200px;height:630px;background:${K.nacht};display:grid;grid-template-columns:1fr 520px;align-items:center;padding:0 40px 0 90px;box-sizing:border-box;gap:20px;overflow:hidden}
h1{font:400 104px/0.98 K;letter-spacing:-.03em;margin:0;color:${K.ivoor}}h1 em{display:block;color:${K.goud};font-style:italic}
p{font:400 30px/1.3 K;color:${K.ivoor};opacity:.85;margin:34px 0 0}.merk{width:520px}.merk svg{width:100%;height:auto;display:block}</style>
<div class="v"><div><h1>Kom naar de kerk.<em>Er is plek voor jou.</em></h1><p>Een uitnodiging van christenen uit Houten en omgeving</p></div><div class="merk">${L.beeldmerkSvg({ donker: true, titel: '' })}</div></div>`;

const browser = await pw.chromium.launch();
{
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(deelbeeldHtml);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(UIT, 'deelbeeld.jpg'), type: 'jpeg', quality: 86 });
  await page.close();
}
for (const [naam, o] of Object.entries(pngs)) {
  const page = await browser.newPage({ viewport: { width: o.b, height: o.h }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><style>html,body{margin:0;background:${o.achtergrond || 'transparent'}}div{width:${o.b}px;height:${o.h}px;display:grid;place-items:center;box-sizing:border-box;padding:${o.pad || 0}px}svg{width:100%;height:100%}</style><div>${o.svg}</div>`);
  await page.screenshot({ path: path.join(UIT, naam), omitBackground: !!o.transparant });
  await page.close();
}
await browser.close();
console.log(`✓ ${Object.keys(pngs).length} PNG's + deelbeeld.jpg`);
