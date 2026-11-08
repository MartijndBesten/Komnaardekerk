#!/usr/bin/env node
// Maakt de merkbestanden in src/static/merk/ vanuit dezelfde bron als de site
// (src/lib/merk.mjs + de zelf gehoste lettertypen). Draai na een merkwijziging:
//   node scripts/merk.mjs
// Vereist Playwright (in de cloudsessie voorgeïnstalleerd; lokaal: PLAYWRIGHT_MODULE=<pad>).

import { writeFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { beeldmerk, favicon, KLEUR } from '../src/lib/merk.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UIT = path.join(ROOT, 'src', 'static', 'merk');
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const font = async (f) => `data:font/woff2;base64,${(await readFile(path.join(ROOT, 'src/static/fonts', f))).toString('base64')}`;
const kopFont = await font('newsreader-opsz-normal.woff2');
const kopItalic = await font('newsreader-opsz-italic.woff2');
const tekstFont = await font('atkinson-next.woff2');

const basisCss = `
@font-face{font-family:Kop;src:url(${kopFont}) format('woff2');font-style:normal}
@font-face{font-family:Kop;src:url(${kopItalic}) format('woff2');font-style:italic}
@font-face{font-family:Tekst;src:url(${tekstFont}) format('woff2');font-weight:200 800}
*{margin:0;box-sizing:border-box}
body{background:${KLEUR.papier};color:${KLEUR.inkt};font-family:Tekst}
`;

const ontwerpen = {
  'deelbeeld.png': {
    breedte: 1200,
    hoogte: 630,
    html: `<style>${basisCss}
      .v{width:1200px;height:630px;display:grid;grid-template-columns:1.5fr 1fr;align-items:center;padding:0 90px;position:relative;overflow:hidden}
      h1{font-family:Kop;font-weight:400;font-size:118px;line-height:.93;letter-spacing:-.035em}
      h1 em{color:#9C4325}
      h1 span{display:block;padding-left:.62em}
      .m{display:flex;align-items:center;gap:16px;margin-top:44px;font-family:Kop;font-size:34px}
      .m small{display:block;font-family:Tekst;font-weight:700;font-size:15px;letter-spacing:.2em;text-transform:uppercase;color:${KLEUR.mos};margin-top:4px}
      .bm{width:300px;justify-self:end;margin-right:30px}
      .m svg{width:34px}
    </style><div class="v"><div><h1>Er is plek <span>voor <em>jou.</em></span></h1>
      <div class="m">${beeldmerk({ klasse: 'k' })}<div>kom naar de kerk<small>Houten</small></div></div></div>
      ${beeldmerk({ klasse: 'bm' })}</div>`
  },
  'logo-liggend.png': {
    breedte: 1200,
    hoogte: 400,
    html: `<style>${basisCss}.v{width:1200px;height:400px;display:flex;align-items:center;gap:44px;padding:0 110px}
      svg{width:150px}.n{font-family:Kop;font-size:110px;letter-spacing:-.01em;line-height:1}
      small{display:block;font-family:Tekst;font-weight:700;font-size:30px;letter-spacing:.2em;text-transform:uppercase;color:${KLEUR.mos};margin-top:16px}</style>
      <div class="v">${beeldmerk()}<div class="n">kom naar de kerk<small>Houten</small></div></div>`
  },
  'beeldmerk-512.png': {
    breedte: 512,
    hoogte: 512,
    html: `<style>${basisCss}.v{width:512px;height:512px;display:grid;place-items:center}svg{width:300px}</style><div class="v">${beeldmerk()}</div>`
  },
  'apple-touch-icon.png': {
    breedte: 180,
    hoogte: 180,
    html: `<style>${basisCss}.v{width:180px;height:180px;display:grid;place-items:center}svg{width:180px}</style><div class="v">${favicon()}</div>`
  },
  'favicon-32.png': {
    breedte: 32,
    hoogte: 32,
    html: `<style>${basisCss}html,body{background:transparent}.v{width:32px;height:32px}svg{width:32px}</style><div class="v">${favicon()}</div>`
  }
};

await mkdir(UIT, { recursive: true });
await writeFile(path.join(UIT, 'beeldmerk.svg'), beeldmerk({ titel: 'Kom naar de kerk' }).replace('<svg ', '<svg width="560" height="720" '));
await writeFile(path.join(UIT, 'beeldmerk-licht.svg'),
  beeldmerk({ titel: 'Kom naar de kerk', kleuren: { ...KLEUR, inkt: KLEUR.papier, lichtZacht: 'rgba(240,207,140,.4)' } }).replace('<svg ', '<svg width="560" height="720" '));

const browser = await chromium.launch();
for (const [naam, o] of Object.entries(ontwerpen)) {
  const page = await browser.newPage({ viewport: { width: o.breedte, height: o.hoogte }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html><body>${o.html}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(UIT, naam), omitBackground: naam === 'favicon-32.png' });
  await page.close();
  console.log('✓', naam);
}
await browser.close();
