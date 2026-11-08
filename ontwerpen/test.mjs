#!/usr/bin/env node
// Eindgebruikerstest van de drie ontwerpen (ronde 5) in Chromium.
//   node ontwerpen/bouw.mjs && node ontwerpen/test.mjs
// Controleert: geen horizontaal scrollen op 320/375/390/768/1440 px, axe (WCAG 2.2 AA + best practice),
// geen consolefouten, geen opslag of externe verzoeken, werkt zonder JavaScript, wisselende woorden
// (pauze, focus, minder beweging), woord kiezen met focusbeheer, kerken met adres en tijden.

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { start } from './serve.mjs';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = createRequire('/opt/node22/lib/node_modules/')('playwright')); }
const AXE = await readFile(path.join(HIER, '..', 'node_modules/axe-core/axe.min.js'), 'utf8');
const W = JSON.parse(await readFile(path.join(HIER, 'woorden.json'), 'utf8')).woorden;
const POORT = 8793;
const BASIS = `http://localhost:${POORT}`;
const server = await start(POORT);
const browser = await chromium.launch();

let ok = 0;
const fout = [];
async function scenario(naam, fn) {
  try { await fn(); ok++; console.log(`✓ ${naam}`); } catch (e) { fout.push(naam); console.log(`✗ ${naam}\n  ${e.message.split('\n').join('\n  ')}`); }
}
const eis = (v, m) => { if (!v) throw new Error(m); };
const SPION = () => {
  window.__opslag = [];
  for (const s of [window.localStorage, window.sessionStorage]) { const o = s.setItem.bind(s); s.setItem = (k, v) => { window.__opslag.push(k); return o(k, v); }; }
  const d = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
  Object.defineProperty(document, 'cookie', { get: () => d.get.call(document), set: (v) => { window.__opslag.push('cookie'); d.set.call(document, v); } });
};
async function pagina({ breedte = 1440, js = true, beweging = 'reduce' } = {}) {
  const ctx = await browser.newContext({ viewport: { width: breedte, height: 900 }, javaScriptEnabled: js, reducedMotion: beweging });
  const page = await ctx.newPage();
  page.__f = []; page.__ext = [];
  page.on('console', (m) => m.type() === 'error' && page.__f.push(m.text()));
  page.on('pageerror', (e) => page.__f.push(e.message));
  page.on('request', (r) => { if (!r.url().startsWith(BASIS)) page.__ext.push(r.url()); });
  if (js) await page.addInitScript(SPION);
  return { ctx, page };
}
async function axe(page) {
  await page.evaluate(AXE);
  return page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] }, resultTypes: ['violations'] })).violations.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`));
}
async function schoon(page) {
  eis(page.__f.length === 0, `consolefouten: ${page.__f.join('; ')}`);
  eis(page.__ext.length === 0, `externe verzoeken: ${page.__ext.join(', ')}`);
  const o = await page.evaluate(() => ({ s: window.__opslag || [], l: localStorage.length, ss: sessionStorage.length, c: document.cookie }));
  eis(!o.s.length && !o.l && !o.ss && !o.c, `opslag gebruikt: ${JSON.stringify(o)}`);
}
// meet ook elementen die buiten beeld steken (niet alleen scrollWidth)
const overloop = (page, b) => page.evaluate((b) => {
  const fouten = [];
  if (document.documentElement.scrollWidth > b) fouten.push(`pagina ${document.documentElement.scrollWidth}px`);
  for (const el of document.querySelectorAll('main *, header *, footer *')) {
    const r = el.getBoundingClientRect();
    if (r.width && (r.right > b + 0.5 || r.left < -0.5) && getComputedStyle(el).position !== 'absolute') fouten.push(`${el.tagName.toLowerCase()}.${el.className} ${Math.round(r.left)}–${Math.round(r.right)}`);
  }
  return fouten.slice(0, 5);
}, b);

for (const c of ['a', 'b', 'c']) {
  for (const pad of ['/', '/moe/', '/opnieuw-beginnen/']) {
    await scenario(`${c}${pad}: geen overloop op 320/375/390/768/1440 px, axe op 390 en 1440, schoon`, async () => {
      const { ctx, page } = await pagina({ breedte: 390 });
      await page.goto(`${BASIS}/${c}${pad}`, { waitUntil: 'networkidle' });
      for (const b of [320, 375, 390, 768, 1440]) {
        await page.setViewportSize({ width: b, height: 800 });
        await page.waitForTimeout(50);
        const f = await overloop(page, b);
        eis(f.length === 0, `overloop op ${b}px: ${f.join('; ')}`);
      }
      await page.setViewportSize({ width: 390, height: 800 });
      const a1 = await axe(page); eis(a1.length === 0, `axe 390:\n${a1.join('\n')}`);
      await page.setViewportSize({ width: 1440, height: 900 });
      const a2 = await axe(page); eis(a2.length === 0, `axe 1440:\n${a2.join('\n')}`);
      eis((await page.locator('h1').count()) === 1, 'één h1');
      eis((await page.locator('footer .maker a[href="https://denckh.nl"] img[alt="Denckh.nl"]').count()) === 1, 'Denckh.nl in de footer');
      eis((await page.locator('header .logo').count()) === 1, 'logo in de kop');
      await schoon(page);
      await ctx.close();
    });
  }

  await scenario(`${c}: wisselende woorden — één tegelijk, pauze bij focus en knop, ‘ander woord’, stil bij minder beweging`, async () => {
    const { ctx, page } = await pagina({ beweging: 'no-preference' });
    await page.goto(`${BASIS}/${c}/`);
    const eerst = await page.textContent('.wissel');
    await page.waitForTimeout(5200);
    const later = await page.textContent('.wissel');
    eis(eerst !== later, 'woord wisselt vanzelf');
    await page.focus('.wissel');
    const bij = await page.textContent('.wissel');
    await page.waitForTimeout(5000);
    eis((await page.textContent('.wissel')) === bij, 'staat stil zolang het woord focus heeft');
    await page.click('[data-pauze]');
    eis((await page.getAttribute('[data-pauze]', 'aria-pressed')) === 'true', 'pauzeknop aria-pressed');
    await page.click('[data-ander]');
    await page.waitForTimeout(700);
    const href = await page.getAttribute('.wissel', 'href');
    const id = await page.getAttribute('.wissel', 'data-woord');
    eis(href.endsWith(`/${c}/${id}/`), 'link volgt het getoonde woord');
    await ctx.close();
    const r = await pagina({ beweging: 'reduce' });
    await r.page.goto(`${BASIS}/${c}/`);
    const w1 = await r.page.textContent('.wissel');
    await r.page.waitForTimeout(4600);
    eis((await r.page.textContent('.wissel')) === w1, 'geen automatische wissel bij minder beweging');
    eis(!(await r.page.isVisible('[data-pauze]')), 'geen pauzeknop nodig bij minder beweging');
    await r.ctx.close();
  });

  await scenario(`${c}: woord kiezen opent tekst, hoop en drie vervolgstappen; focus en terug werken`, async () => {
    const { ctx, page } = await pagina({ breedte: 390 });
    await page.goto(`${BASIS}/${c}/`);
    await page.click('.woordveld .woord[data-woord="verdriet"]');
    eis(page.url().endsWith(`/${c}/`), 'blijft op de pagina');
    eis(await page.isVisible('#paneel-verdriet'), 'paneel zichtbaar');
    eis(await page.evaluate(() => document.activeElement?.id) === 'kop-verdriet', 'focus op de kop');
    const knoppen = await page.locator('#paneel-verdriet .stappen a').allTextContents();
    eis(JSON.stringify(knoppen) === JSON.stringify(['Ontdek Jezus', 'Wat gebeurt er in de kerk?', 'Vind een kerk']), `vervolgstappen: ${knoppen}`);
    eis(await page.isVisible('#paneel-verdriet a[href="tel:08000113"]'), '113 bij verdriet');
    await page.click('#paneel-verdriet .stappen a:text("Vind een kerk")');
    eis(page.url().endsWith('#kerken'), 'stap brengt je naar de kerken');
    await page.click('.woordveld .woord[data-woord="gelukkig"]');
    eis(await page.isVisible('#paneel-gelukkig') && !(await page.isVisible('#paneel-verdriet')), 'één paneel tegelijk, ook positieve woorden');
    await page.click('#paneel-gelukkig [data-sluit]');
    eis(await page.evaluate(() => document.activeElement?.dataset.woord) === 'gelukkig', 'focus terug op het woord');
    const a = await axe(page); eis(a.length === 0, `axe met paneel:\n${a.join('\n')}`);
    await schoon(page);
    await ctx.close();
  });

  await scenario(`${c}: zonder JavaScript — spandoekadres, woorden en kerken werken`, async () => {
    const { ctx, page } = await pagina({ js: false });
    await page.goto(`${BASIS}/${c}/`);
    eis(!(await page.isVisible('.wissel-knoppen')), 'geen bedieningsknoppen zonder JS');
    await page.click('.wissel');
    await page.waitForURL(`**/${c}/moe/`);
    eis((await page.textContent('h1')).trim() === 'Moe?', 'woordpagina /moe/');
    eis((await page.textContent('main')).includes('Matteüs 11:28'), 'bron bij de hoop');
    await page.click('.stappen a:text("Vind een kerk")');
    await page.waitForURL(`**/${c}/#kerken`);
    eis((await page.locator('.kerk').count()) === 11, '11 kerken');
    eis((await page.locator('.plaatsnaam').allTextContents()).join('|') === 'Houten|Schalkwijk|’t Goy', 'alle drie de plaatsen');
    await ctx.close();
  });
}

await scenario('alle woordpagina’s bestaan in alle concepten', async () => {
  const { ctx, page } = await pagina({ js: false });
  for (const c of ['a', 'b', 'c']) for (const w of W) { const r = await page.goto(`${BASIS}/${c}/${w.id}/`); eis(r.status() === 200, `/${c}/${w.id}/ gaf ${r.status()}`); }
  await ctx.close();
});

await browser.close();
server.close();
console.log(`\n${ok} geslaagd, ${fout.length} mislukt`);
process.exit(fout.length ? 1 : 0);
