#!/usr/bin/env node
// Campagnemiddelen per richting renderen (Playwright): spandoeken (4 woorden), uitnodigingskaart (voor/achter), poster.
//   node voorstellen/mockups.mjs           → voorstellen/mockups/*.png
// De montage op de Sionkerk-foto staat in montage.py en blijft intern (foto niet vrij te gebruiken).

import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { beeldmerk, logoHorizontaal, logoStaand } from './logos.mjs';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const UIT = path.join(HIER, 'mockups');
mkdirSync(UIT, { recursive: true });
const TMP = path.join(HIER, '.mockup-tmp.html');
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = createRequire('/opt/node22/lib/node_modules/')('playwright')); }

const F = (n) => pathToFileURL(path.join(HIER, 'fonts', n)).href;
const FOTO = (n) => pathToFileURL(path.join(HIER, n)).href;
const FONTS = `
@font-face { font-family: 'Atkinson Next'; src: url(${F('atkinson-next.woff2')}); font-weight: 200 800; }
@font-face { font-family: 'Newsreader'; src: url(${F('newsreader-opsz-normal.woff2')}); }
@font-face { font-family: 'Archivo'; src: url(${F('archivo.woff2')}); font-weight: 500 900; font-stretch: 62% 100%; }
@font-face { font-family: 'Instrument Serif'; src: url(${F('instrument-serif-normal.woff2')}); }
* { box-sizing: border-box; margin: 0; } body { margin: 0; } svg { display: block; }
.past { white-space: nowrap; } .tekst, .onder { min-width: 0; }`;
// tekst laten passen in de beschikbare breedte (zoals een vormgever het woord zou schalen)
const PAS = `<script>Promise.all([...document.fonts].map(f=>f.load())).then(()=>document.fonts.ready).then(()=>{for(const el of document.querySelectorAll('.past')){let s=parseFloat(getComputedStyle(el).fontSize);const p=el.parentElement,cs=getComputedStyle(p);const max=(p.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight)-24)*(+el.dataset.vul||1);const tw=()=>{const g=document.createRange();g.selectNodeContents(el);return g.getBoundingClientRect().width};while(tw()>max&&s>10){s-=2;el.style.fontSize=s+'px';}}document.body.dataset.klaar=1;});</script>`;

const WOORDEN = ['Moe', 'Alleen', 'Zoekend', 'Nieuwsgierig'];
const vorm = { 1: (w) => `${w}?`, 2: (w) => `${w.toUpperCase()}?`, 3: (w) => `${w.toLowerCase()}?` };

// ---------- spandoek 3:1 (1800 × 600 px) ----------
function spandoek(r, woord) {
  const w = vorm[r](woord);
  if (r === 1) return `<div class="s s1"><div class="tekst"><p class="woord past" data-vul="1">${w}</p><p class="dom">komnaardekerk.nu</p></div><div class="merk">${beeldmerk(1, { schema: 'donker', titel: '' })}</div></div>
<style>.s1{width:1800px;height:600px;background:radial-gradient(900px 700px at 82% 50%,#3A5F54 0%,#29463E 55%,#1F3832 100%);color:#F8F7F3;display:grid;grid-template-columns:1fr 560px;overflow:hidden;position:relative}
.s1 .tekst{padding:40px 0 0 90px;display:flex;flex-direction:column;justify-content:center}.s1 .woord{font:500 330px/0.9 Newsreader;letter-spacing:-0.03em}.s1 .dom{font:800 86px/1 'Atkinson Next';margin-top:36px;color:#F3D9CC;letter-spacing:-0.01em}
.s1 .merk{width:760px;margin:-80px 0 0 -40px}</style>`;
  if (r === 2) return `<div class="s s2"><div class="tekst"><p class="woord past" data-vul="1">${w}</p><p class="dom"><span>komnaardekerk.nu</span></p></div><div class="paneel"><div class="merk">${beeldmerk(2, { schema: 'donker', titel: '' })}</div></div></div>
<style>.s2{width:1800px;height:600px;background:#F4F1EA;color:#25312F;display:grid;grid-template-columns:1fr 600px;overflow:hidden}
.s2 .tekst{padding:40px 40px 0 80px;display:flex;flex-direction:column;justify-content:flex-end}.s2 .woord{margin:auto 0}.s2 .woord{font:900 400px/0.8 Archivo;font-stretch:62%}
.s2 .dom{background:#8E4E3D;color:#FBF3EA;margin:0 -40px 0 -80px;padding:28px 40px 30px 80px;font:800 84px/1 'Atkinson Next'}
.s2 .paneel{background:#25312F;display:grid;place-items:center}.s2 .merk{width:520px}</style>`;
  return `<div class="s s3"><div class="tekst"><p class="woord past" data-vul="1">${w}</p><p class="dom">komnaardekerk.nu</p></div><div class="merk">${beeldmerk(3, { schema: 'donker', titel: '' })}</div></div>
<style>.s3{width:1800px;height:600px;background:radial-gradient(700px 520px at 80% 40%,#3B3F52 0%,transparent 70%),linear-gradient(180deg,#1F2B3B,#141C27);color:#F8F7F3;display:grid;grid-template-columns:1fr 560px;overflow:hidden}
.s3 .tekst{padding:20px 0 0 90px;display:flex;flex-direction:column;justify-content:center}.s3 .woord{font:400 400px/0.82 'Instrument Serif';letter-spacing:-0.02em}
.s3 .dom{font:700 84px/1 'Atkinson Next';color:#E2B3A3;margin-top:30px}.s3 .merk{width:620px;margin:-10px 0 0 -40px}</style>`;
}

// ---------- uitnodigingskaart A6 liggend (1480 × 1050 px), voor + achter ----------
function kaartVoor(r) {
  const w = vorm[r]('Moe');
  const stijl = {
    1: { bg: 'radial-gradient(900px 800px at 78% 30%,#3A5F54,#29463E 60%,#1F3832)', ink: '#F8F7F3', dom: '#F3D9CC', font: "500 300px/0.9 Newsreader", schema: 'donker' },
    2: { bg: '#F4F1EA', ink: '#25312F', dom: '#8E4E3D', font: "900 380px/0.8 Archivo", schema: 'licht' },
    3: { bg: 'radial-gradient(800px 700px at 75% 25%,#3B3F52,transparent 70%),linear-gradient(180deg,#1F2B3B,#141C27)', ink: '#F8F7F3', dom: '#E2B3A3', font: "400 360px/0.85 'Instrument Serif'", schema: 'donker' }
  }[r];
  return `<div class="k" style="background:${stijl.bg};color:${stijl.ink}"><div class="m">${beeldmerk(r, { schema: stijl.schema, titel: '' })}</div><p class="woord" style="font:${stijl.font};${r === 2 ? 'font-stretch:62%;' : ''}">${w}</p><p class="zin">Kom naar de kerk. Er is plek voor jou.</p><p class="dom" style="color:${stijl.dom}">komnaardekerk.nu</p></div>
<style>.k{width:1480px;height:1050px;padding:110px 120px;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end}.k .m{position:absolute;width:640px;right:-60px;top:-40px}
.k .zin{font:600 54px/1.2 'Atkinson Next';margin:40px 0 20px}.k .dom{font:800 72px/1 'Atkinson Next'}</style>`;
}
function kaartAchter(r) {
  const s = {
    1: { bg: '#F8F7F3', ink: '#25312F', acc: '#29463E', kop: "500 64px/1.15 Newsreader" },
    2: { bg: '#FBF9F4', ink: '#25312F', acc: '#8E4E3D', kop: "800 70px/1.05 Archivo" },
    3: { bg: '#F8F7F3', ink: '#1F2B3B', acc: '#8C5442', kop: "400 76px/1.05 'Instrument Serif'" }
  }[r];
  return `<div class="a" style="background:${s.bg};color:${s.ink}"><div class="links"><p class="kop" style="font:${s.kop};${r === 2 ? 'font-stretch:66%;text-transform:uppercase;' : ''}">Je bent van harte welkom.</p><p class="t">Zondag gaan in Houten, Schalkwijk en ’t Goy de deuren van de kerken open. Je hoeft niets te weten en niets te kunnen. Kom zoals je bent.</p><p class="t">Jezus zegt: kom bij Mij, jullie die moe zijn en zwaar te dragen hebben. Bij Mij vind je rust. <span class="ref">(Matteüs 11:28, vrij weergegeven)</span></p><p class="dom" style="color:${s.acc}">komnaardekerk.nu/moe</p></div><div class="rechts"><div class="qr">QR-code<br>naar /moe/</div><div class="logo">${logoStaand(r, { schema: 'licht' })}</div></div></div>
<style>.a{width:1480px;height:1050px;padding:100px 110px;display:grid;grid-template-columns:1fr 360px;gap:90px}.a .kop{margin-bottom:40px}.a .t{font:400 38px/1.45 'Atkinson Next';margin-bottom:26px}.a .ref{font-size:28px;opacity:.8}
.a .dom{font:800 52px/1 'Atkinson Next';margin-top:30px}.a .rechts{display:flex;flex-direction:column;justify-content:space-between;align-items:center}.a .qr{width:300px;height:300px;border:4px dashed currentColor;display:grid;place-items:center;text-align:center;font:600 30px/1.3 'Atkinson Next';opacity:.55}.a .logo{width:330px}</style>`;
}

// ---------- poster A3 staand (1188 × 1680 px) ----------
function poster(r) {
  const w = vorm[r]('Zoekend');
  if (r === 1) return `<div class="p p1"><div class="foto"></div><div class="onder"><div class="licht">${beeldmerk(1, { schema: 'donker', titel: '' })}</div><p class="woord past">${w}</p><p class="zin">Kom naar de kerk.<br>Er is plek voor jou.</p><p class="sub">Kerken in Houten, Schalkwijk en ’t Goy nodigen je uit om Jezus Christus te leren kennen.</p><p class="dom">komnaardekerk.nu</p></div></div>
<style>.p1{width:1188px;height:1680px;position:relative;overflow:hidden;background:#29463E;color:#F8F7F3}.p1 .foto{position:absolute;inset:0 0 520px 0;background:url(${FOTO('foto/toren-breed-1600.webp')}) 62% 75%/cover}
.p1 .foto::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgb(41 70 62/.0) 40%,#29463E 100%)}.p1 .licht{position:absolute;width:420px;right:40px;bottom:120px}
.p1 .onder{position:absolute;left:0;right:0;bottom:0;padding:0 90px 90px}.p1 .woord{font:500 250px/0.9 Newsreader;letter-spacing:-0.03em}.p1 .zin{font:500 64px/1.15 Newsreader;margin:30px 0 24px}.p1 .sub{font:400 34px/1.4 'Atkinson Next';max-width:620px;color:#DCE5DF}.p1 .dom{font:800 72px/1 'Atkinson Next';color:#F3D9CC;margin-top:46px}</style>`;
  if (r === 2) return `<div class="p p2"><p class="woord past">${w}</p><div class="foto"><div class="roos">${beeldmerk(2, { schema: 'licht', titel: '' })}</div></div><div class="onder"><p class="zin">Kom naar de kerk.<br>Er is plek voor jou.</p><p class="sub">Kerken in Houten, Schalkwijk en ’t Goy nodigen je uit om Jezus Christus te leren kennen.</p></div><p class="dom">komnaardekerk.nu</p></div>
<style>.p2{width:1188px;height:1680px;background:#F4F1EA;color:#25312F;display:flex;flex-direction:column;padding:80px 80px 0}.p2 .woord{font:900 290px/0.82 Archivo;font-stretch:62%}
.p2 .foto{position:relative;height:760px;margin:40px -80px 0 0;background:url(${FOTO('../src/static/foto/rk-houten-1600.webp')}) 50% 30%/cover}.p2 .roos{position:absolute;width:300px;left:-40px;bottom:-110px;filter:drop-shadow(0 8px 20px rgb(0 0 0/.25))}
.p2 .onder{padding:150px 0 0}.p2 .zin{font:800 96px/0.98 Archivo;font-stretch:66%;text-transform:uppercase}.p2 .sub{font:400 34px/1.4 'Atkinson Next';margin-top:24px;max-width:880px}
.p2 .dom{margin:auto -80px 0;background:#8E4E3D;color:#FBF3EA;font:800 76px/1 'Atkinson Next';padding:44px 80px}</style>`;
  return `<div class="p p3"><div class="foto"></div><div class="ster">${beeldmerk(3, { schema: 'donker', titel: '' })}</div><div class="onder"><p class="woord past">${w}</p><p class="zin">Kom naar de kerk. Er is plek voor jou.</p><p class="sub">Kerken in Houten, Schalkwijk en ’t Goy nodigen je uit om Jezus Christus te leren kennen.</p><p class="dom">komnaardekerk.nu</p></div></div>
<style>.p3{width:1188px;height:1680px;position:relative;overflow:hidden;background:#141C27;color:#F8F7F3;isolation:isolate}.p3 .foto{position:absolute;inset:0 0 400px 0;z-index:-2;background:url(${FOTO('foto/toren-breed-1600.webp')}) 62% 85%/cover;filter:grayscale(1) brightness(.8) contrast(1.1);opacity:.5}
.p3::before{content:'';position:absolute;inset:0;z-index:-1;background:radial-gradient(700px 600px at 62% 22%,rgb(217 164 147/.3),transparent 65%),linear-gradient(180deg,rgb(31 43 59/.5) 0%,rgb(20 28 39/.85) 55%,#141C27 75%)}
.p3 .ster{position:absolute;width:480px;left:calc(62% - 240px);top:40px}.p3 .onder{position:absolute;left:0;right:0;bottom:0;padding:0 90px 90px}.p3 .woord{font:400 290px/0.85 'Instrument Serif'}.p3 .zin{font:400 76px/1.05 'Instrument Serif';margin:24px 0}.p3 .sub{font:400 34px/1.4 'Atkinson Next';color:#D5DAE1;max-width:880px}.p3 .dom{font:700 72px/1 'Atkinson Next';color:#E2B3A3;margin-top:46px}</style>`;
}

// ---------- renderen ----------
const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });
async function render(html, w, h, naam) {
  await page.setViewportSize({ width: w, height: h });
  // via een bestand laden: lettertypen en foto's via file:// werken niet vanaf about:blank
  writeFileSync(TMP, `<!doctype html><html lang="nl"><head><meta charset="utf-8"><style>${FONTS}</style></head><body>${html}${PAS}</body></html>`);
  await page.goto(pathToFileURL(TMP).href, { waitUntil: 'load' });
  await page.waitForSelector('body[data-klaar]');
  await page.screenshot({ path: path.join(UIT, `${naam}.png`), clip: { x: 0, y: 0, width: w, height: h } });
}
for (const r of [1, 2, 3]) {
  for (const w of WOORDEN) await render(spandoek(r, w), 1800, 600, `spandoek-r${r}-${w.toLowerCase()}`);
  await render(kaartVoor(r), 1480, 1050, `kaart-r${r}-voor`);
  await render(kaartAchter(r), 1480, 1050, `kaart-r${r}-achter`);
  await render(poster(r), 1188, 1680, `poster-r${r}`);
}
await browser.close();
rmSync(TMP, { force: true });
console.log('✓ mockups in', UIT);
