#!/usr/bin/env node
// Schrijft de definitieve logobestanden naar ontwerp/logo/definitief/ (SVG + PNG).
//   node ontwerp/logo/exporteer.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import * as D from './definitief.mjs';

const UIT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'definitief');
mkdirSync(UIT, { recursive: true });
let chromium;
try { ({ chromium } = createRequire(import.meta.url)('playwright')); } catch { ({ chromium } = createRequire('/opt/node22/lib/node_modules/')('playwright')); }

const K = D.KLEUR;
const BESTANDEN = [
  ['beeldmerk-kleur-op-donker', D.beeldmerk({ donker: true }), K.nacht, 1200],
  ['beeldmerk-kleur-op-licht', D.beeldmerk({ donker: false }), K.papier, 1200],
  ['beeldmerk-kleur-op-donker-kerst', D.beeldmerk({ donker: true, kerst: true }), K.nacht, 1200],
  ['beeldmerk-vlak-op-donker', D.beeldmerkVlak({ donker: true }), K.nacht, 600],
  ['beeldmerk-vlak-op-licht', D.beeldmerkVlak({ donker: false }), K.papier, 600],
  ['beeldmerk-mono-donker', D.beeldmerkMono({ kleur: K.nacht }), null, 600],
  ['beeldmerk-mono-ivoor', D.beeldmerkMono({ kleur: K.ivoor }), K.nacht, 600],
  ['beeldmerk-mono-zwart', D.beeldmerkMono({ kleur: '#000000' }), null, 600],
  ['logo-horizontaal-op-licht', D.logoHorizontaal({ donker: false }), K.papier, 2400],
  ['logo-horizontaal-op-donker', D.logoHorizontaal({ donker: true }), K.nacht, 2400],
  ['logo-horizontaal-vlak-op-licht', D.logoHorizontaal({ donker: false, vlak: true }), null, 2400],
  ['logo-staand-op-licht', D.logoStaand({ donker: false }), K.papier, 1200],
  ['logo-staand-op-donker', D.logoStaand({ donker: true }), K.nacht, 1200],
  ['favicon', D.favicon(), null, 512]
];
const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });
for (const [naam, svg, bg, breedte] of BESTANDEN) {
  writeFileSync(path.join(UIT, `${naam}.svg`), svg);
  const vb = svg.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
  const hoogte = Math.round((breedte * vb[3]) / vb[2]);
  await page.setViewportSize({ width: breedte, height: hoogte });
  await page.setContent(`<!doctype html><body style="margin:0;background:${bg || 'transparent'}"><div style="width:${breedte}px;height:${hoogte}px">${svg.replace('<svg', '<svg style="width:100%;height:100%;display:block"')}</div></body>`);
  await page.screenshot({ path: path.join(UIT, `${naam}.png`), omitBackground: !bg, clip: { x: 0, y: 0, width: breedte, height: hoogte } });
  console.log('✓', naam, `${breedte}×${hoogte}`);
}
// favicon ook als 32 en 16 px PNG
for (const m of [32, 16]) {
  await page.setViewportSize({ width: m, height: m });
  await page.setContent(`<!doctype html><body style="margin:0"><div style="width:${m}px;height:${m}px">${D.favicon().replace('<svg', '<svg style="width:100%;height:100%;display:block"')}</div></body>`);
  await page.screenshot({ path: path.join(UIT, `favicon-${m}.png`), omitBackground: true, clip: { x: 0, y: 0, width: m, height: m } });
}
await browser.close();
console.log('✓ definitief in', UIT);
