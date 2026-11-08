#!/usr/bin/env node
// Maakt alle merkbestanden in src/static/merk/ uit src/lib/logo.mjs (één bron).
//   node scripts/merk.mjs
// Vereist Playwright voor de PNG's (cloudsessie: voorgeïnstalleerd; lokaal: PLAYWRIGHT_MODULE=<pad>).
// Woordmerkpaden opnieuw maken (alleen bij letterwijziging): zie scripts/merk_paden.py.

import { writeFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import * as L from '../src/lib/logo.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UIT = path.join(ROOT, 'src', 'static', 'merk');
const require = createRequire(import.meta.url);
let pw;
try {
  pw = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
} catch {
  pw = require('/opt/node22/lib/node_modules/playwright');
}

await mkdir(path.join(UIT, 'logo'), { recursive: true });
await mkdir(path.join(UIT, 'concepten'), { recursive: true });

const bestanden = {};
for (const schema of ['kleur', 'donker', 'zwart', 'wit']) {
  const achter = schema === 'kleur' ? '' : `-${schema}`;
  bestanden[`logo/logo-horizontaal${achter}.svg`] = L.horizontaalSvg({ concept: 'A', schema });
  bestanden[`logo/logo-staand${achter}.svg`] = L.staandSvg({ concept: 'A', schema });
  bestanden[`logo/beeldmerk${achter}.svg`] = L.beeldmerkSvg('A', schema);
  bestanden[`logo/woordmerk${achter}.svg`] = L.woordmerkSvg({ schema });
}
bestanden['logo/icoon.svg'] = L.icoonSvg({ concept: 'A' });
bestanden['logo/icoon-donker.svg'] = L.icoonSvg({ concept: 'A', achtergrond: L.KLEUREN.inkt, schema: 'donker' });
// Concepten (ter vergelijking op /ontwerp/)
bestanden['concepten/a-open-deur.svg'] = L.horizontaalSvg({ concept: 'A' });
bestanden['concepten/a-beeldmerk.svg'] = L.beeldmerkSvg('A');
bestanden['concepten/b-portaal.svg'] = L.horizontaalSvg({ concept: 'B', punt: 'gewoon' });
bestanden['concepten/b-beeldmerk.svg'] = L.beeldmerkSvg('B');
bestanden['concepten/c-de-punt.svg'] = L.woordmerkSvg({});
bestanden['concepten/c-monogram.svg'] = L.beeldmerkSvg('C');
bestanden['concepten/c-staand.svg'] = L.woordmerkSvg({ regels: 2 });

for (const [rel, inhoud] of Object.entries(bestanden)) await writeFile(path.join(UIT, rel), inhoud + '\n');
console.log(`✓ ${Object.keys(bestanden).length} SVG's`);

// PNG's
const pngs = {
  'favicon-32.png': { b: 32, h: 32, svg: L.icoonSvg({ concept: 'A' }), transparant: true },
  'apple-touch-icon.png': { b: 180, h: 180, svg: L.icoonSvg({ concept: 'A', rond: 0 }) },
  'logo/icoon-512.png': { b: 512, h: 512, svg: L.icoonSvg({ concept: 'A' }), transparant: true },
  'logo/logo-horizontaal-1600.png': { b: 1600, h: 280, svg: L.horizontaalSvg({ concept: 'A' }), transparant: true, pad: 30 }
};
// Deelbeeld (og:image): echte foto van de open deur + kernzin + logo.
const held = JSON.parse(await readFile(path.join(ROOT, 'content/fotos.json'), 'utf8')).held;
const heldBestand = held.src.replace('/foto/', '').replace('.webp', `-${held.breedtes[held.breedtes.length - 1]}.webp`);
const fotoData = `data:image/webp;base64,${(await readFile(path.join(ROOT, 'src/static/foto', heldBestand))).toString('base64')}`;
const lettertype = async (f) => `data:font/woff2;base64,${(await readFile(path.join(ROOT, 'src/static/fonts', f))).toString('base64')}`;
const kop = await lettertype('newsreader-opsz-normal.woff2');
const kopI = await lettertype('newsreader-opsz-italic.woff2');
const deelbeeldHtml = `<!doctype html><style>
@font-face{font-family:K;src:url(${kop})}@font-face{font-family:K;font-style:italic;src:url(${kopI})}
html,body{margin:0}.v{width:1200px;height:630px;background:#F5EFE4;display:grid;grid-template-columns:1fr 420px;align-items:center;padding:0 80px 0 90px;box-sizing:border-box;gap:40px;overflow:hidden}
h1{font:400 112px/0.95 K;letter-spacing:-.035em;margin:0;color:#1E2721}h1 span{display:block;padding-left:.6em}h1 em{color:#9C4325}
.logo{width:330px;margin-top:46px}.boog{width:330px;height:470px;border-radius:999px 999px 0 0;overflow:hidden;justify-self:end;margin-top:90px;box-shadow:0 30px 60px -30px rgba(60,40,10,.5)}
.boog img{width:100%;height:100%;object-fit:cover}</style>
<div class="v"><div><h1>Er is plek <span>voor <em>jou.</em></span></h1><div class="logo">${L.horizontaalSvg({ concept: 'A' })}</div></div><div class="boog"><img src="${fotoData}"></div></div>`;

const browser = await pw.chromium.launch();
{
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(deelbeeldHtml);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(UIT, 'deelbeeld.jpg'), type: 'jpeg', quality: 85 });
  await page.close();
}
for (const [naam, o] of Object.entries(pngs)) {
  const page = await browser.newPage({ viewport: { width: o.b, height: o.h }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><style>html,body{margin:0;background:transparent}div{width:${o.b}px;height:${o.h}px;display:grid;place-items:center;box-sizing:border-box;padding:${o.pad || 0}px}svg{width:100%;height:100%}</style><div>${o.svg}</div>`);
  await page.screenshot({ path: path.join(UIT, naam), omitBackground: !!o.transparant });
  await page.close();
}
await browser.close();
console.log(`✓ ${Object.keys(pngs).length} PNG's`);
