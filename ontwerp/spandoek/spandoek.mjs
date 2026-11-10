#!/usr/bin/env node
// Spandoek voor de lichtbak op de gevel (verhouding 5:1, bijvoorbeeld 500 × 100 cm), in de huisstijl van Het raakpunt.
// Leesvolgorde voor wie langsrijdt: vraag → licht → uitnodiging.
//   node ontwerp/spandoek/spandoek.mjs [woord]   → ontwerp/spandoek/spandoek-<woord>-{donker,licht}.png
import { writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { beeldmerkSvg, KLEUREN as K } from '../../src/lib/logo.mjs';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const FONTS = path.join(HIER, '..', '..', 'src', 'static', 'fonts');
const require = createRequire(import.meta.url);
let pw;
try { pw = require(process.env.PLAYWRIGHT_MODULE || 'playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }

const WOORD = process.argv[2] || 'Moe?';
const naam = WOORD.toLowerCase().replace(/[^a-z]/g, '');
const B = 3000, H = 600;
const f = (n) => pathToFileURL(path.join(FONTS, n)).href;

const VARIANTEN = {
  donker: { bg: K.nacht, woord: K.ivoor, url: K.ivoor, nu: K.goud, gloed: 'rgba(240,194,78,.22)', merk: beeldmerkSvg({ donker: true, sterkte: 1.25, titel: '' }) },
  licht: { bg: K.papier, woord: K.god, url: K.nacht, nu: K.mens, gloed: 'rgba(240,194,78,.28)', merk: beeldmerkSvg({ donker: false, sterkte: 1.1, titel: '' }) }
};

const pagina = (v) => `<!doctype html><html lang="nl"><head><meta charset="utf-8"><style>
@font-face{font-family:N;src:url(${f('newsreader-opsz-normal.woff2')});font-weight:200 800}
@font-face{font-family:A;src:url(${f('atkinson-next.woff2')});font-weight:200 800}
*{box-sizing:border-box;margin:0}body{margin:0}
.d{width:${B}px;height:${H}px;background:${v.bg};display:flex;align-items:center;justify-content:space-between;padding:0 120px 0 110px;gap:70px;overflow:hidden}
.w{font:400 380px/1 N;letter-spacing:-.02em;color:${v.woord};-webkit-text-stroke:7px ${v.woord};transform:translateY(-14px);white-space:nowrap}
.m{position:relative;flex:none;width:330px;height:380px}
.m::before{content:'';position:absolute;inset:-20%;background:radial-gradient(closest-side,${v.gloed},transparent)}
.m svg{position:relative;width:100%;height:100%;display:block;overflow:visible}
.u{font:700 156px/1 A;letter-spacing:-.01em;color:${v.url};white-space:nowrap}.u b{color:${v.nu};font-weight:700}
</style></head><body><div class="d"><p class="w">${WOORD}</p><div class="m">${v.merk}</div><p class="u">komnaardekerk<b>.nu</b></p></div></body></html>`;

const TMP = path.join(HIER, '.tmp.html');
const browser = await pw.chromium.launch();
const p = await browser.newPage({ viewport: { width: B, height: H } });
for (const [v, o] of Object.entries(VARIANTEN)) {
  writeFileSync(TMP, pagina(o));
  await p.goto(pathToFileURL(TMP).href);
  await p.evaluate(() => document.fonts.ready);
  const maten = await p.evaluate(() => ['.w', '.m', '.u'].map((s) => { const r = document.querySelector(s).getBoundingClientRect(); return [s, Math.round(r.left), Math.round(r.right)]; }));
  console.log(v, JSON.stringify(maten));
  await p.screenshot({ path: path.join(HIER, `spandoek-${naam}-${v}.png`) });
}
await browser.close();
rmSync(TMP, { force: true });
