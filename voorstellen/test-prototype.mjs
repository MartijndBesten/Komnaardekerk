#!/usr/bin/env node
// Eindgebruikerstest van het prototype (drie richtingen) in Chromium:
// axe (WCAG 2.2 AA + best practice), consolefouten, geen opslag of externe verzoeken,
// geen horizontaal scrollen op 320 px, werkt zonder JavaScript, en de interacties werken.
//
//   node voorstellen/bouw.mjs && node voorstellen/test-prototype.mjs

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
const LV = JSON.parse(await readFile(path.join(HIER, 'levensvragen.json'), 'utf8'));

const POORT = 8791;
const BASIS = `http://localhost:${POORT}`;
const server = await start(POORT);
const browser = await chromium.launch();

let ok = 0;
const fouten = [];
async function scenario(naam, fn) {
  try { await fn(); ok++; console.log(`✓ ${naam}`); }
  catch (e) { fouten.push(naam); console.log(`✗ ${naam}\n  ${e.message.split('\n').join('\n  ')}`); }
}
const eis = (v, m) => { if (!v) throw new Error(m); };

// Spion vóór elk script: registreert elke poging tot opslag
const SPION = () => {
  window.__opslag = [];
  for (const s of [window.localStorage, window.sessionStorage]) {
    const orig = s.setItem.bind(s);
    s.setItem = (k, v) => { window.__opslag.push(k); return orig(k, v); };
  }
  const desc = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
  Object.defineProperty(document, 'cookie', { get: () => desc.get.call(document), set: (v) => { window.__opslag.push('cookie:' + v); desc.set.call(document, v); } });
};

async function nieuwePagina({ breedte = 1440, js = true, beweging = 'reduce' } = {}) {
  const ctx = await browser.newContext({ viewport: { width: breedte, height: 900 }, javaScriptEnabled: js, reducedMotion: beweging });
  const page = await ctx.newPage();
  page.__console = [];
  page.__extern = [];
  page.on('console', (m) => m.type() === 'error' && page.__console.push(m.text()));
  page.on('pageerror', (e) => page.__console.push(e.message));
  page.on('request', (r) => { if (!r.url().startsWith(BASIS) && !r.url().startsWith('blob:') && !r.url().startsWith('data:')) page.__extern.push(r.url()); });
  if (js) await page.addInitScript(SPION);
  return { ctx, page };
}
async function axe(page) {
  await page.evaluate(AXE);
  return page.evaluate(async () => {
    const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] }, resultTypes: ['violations'] });
    return r.violations.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
  });
}
async function schoon(page) {
  eis(page.__console.length === 0, `consolefouten: ${page.__console.join('; ')}`);
  eis(page.__extern.length === 0, `externe verzoeken: ${page.__extern.join(', ')}`);
  const opslag = await page.evaluate(() => ({ spion: window.__opslag || [], ls: localStorage.length, ss: sessionStorage.length, cookie: document.cookie }));
  eis(opslag.spion.length === 0 && opslag.ls === 0 && opslag.ss === 0 && opslag.cookie === '', `opslag gebruikt: ${JSON.stringify(opslag)}`);
}

for (const r of [1, 2, 3]) {
  for (const pad of ['/', '/moe/', '/verdriet/', '/kijk-binnen/', '/eerste-bezoek/']) {
    await scenario(`r${r}${pad}: axe 390/1440 px, geen fouten, opslag of externe verzoeken, geen scroll op 320 px`, async () => {
      const { ctx, page } = await nieuwePagina({ breedte: 390 });
      await page.goto(`${BASIS}/r${r}${pad}`, { waitUntil: 'networkidle' });
      const a1 = await axe(page);
      eis(a1.length === 0, `axe 390:\n${a1.join('\n')}`);
      await page.setViewportSize({ width: 320, height: 800 });
      const breed = await page.evaluate(() => document.documentElement.scrollWidth);
      eis(breed <= 320, `horizontaal scrollen op 320 px (${breed})`);
      await page.setViewportSize({ width: 1440, height: 900 });
      const a2 = await axe(page);
      eis(a2.length === 0, `axe 1440:\n${a2.join('\n')}`);
      eis((await page.locator('h1').count()) === 1, 'precies één h1');
      eis(await page.locator('.maker img[alt="Denckh."]').count() === 1, 'Denckh-makervermelding in de footer');
      await schoon(page);
      await ctx.close();
    });
  }

  await scenario(`r${r}: woord kiezen opent het paneel op de pagina, focus op de kop, terug naar het woordveld`, async () => {
    const { ctx, page } = await nieuwePagina();
    await page.goto(`${BASIS}/r${r}/`, { waitUntil: 'networkidle' });
    await page.click('.woord[data-woord="alleen"]');
    eis(page.url().endsWith(`/r${r}/`), 'blijft op de pagina');
    eis(await page.isVisible('#paneel-alleen'), 'paneel zichtbaar');
    eis((await page.locator('.paneel:visible').count()) === 1, 'precies één paneel open');
    eis(await page.evaluate(() => document.activeElement?.id) === 'kop-alleen', 'focus op de paneelkop');
    eis((await page.getAttribute('.woord[data-woord="alleen"]', 'aria-current')) === 'true', 'gekozen woord gemarkeerd');
    await page.click('.woord[data-woord="verdriet"]');
    eis(await page.isVisible('#paneel-verdriet .hulp a[href="tel:08000113"]'), 'hulplijn 113 bij verdriet');
    await page.click('#paneel-verdriet [data-terug]');
    eis(!(await page.isVisible('#paneel-verdriet')), 'paneel dicht');
    eis(await page.evaluate(() => document.activeElement?.dataset.woord) === 'verdriet', 'focus terug op het woord');
    const a = await axe(page);
    eis(a.length === 0, `axe met open paneel:\n${a.join('\n')}`);
    await schoon(page);
    await ctx.close();
  });

  await scenario(`r${r}: zonder JavaScript leidt een woord naar de spandoekpagina met dezelfde inhoud`, async () => {
    const { ctx, page } = await nieuwePagina({ js: false });
    await page.goto(`${BASIS}/r${r}/`);
    eis(!(await page.isVisible('.pauze')), 'geen pauzeknop zonder JS (er wisselt niets)');
    await page.click('.woord[data-woord="zoekend"]');
    await page.waitForURL(`**/r${r}/zoekend/`);
    const tekst = await page.textContent('main');
    eis(tekst.includes('Matteüs 7:7') && tekst.includes('debijbel.nl'), 'Bijbelgedachte met vindplaats en link');
    await page.goto(`${BASIS}/r${r}/kijk-binnen/`);
    eis((await page.locator('.stap-item:visible').count()) === 16, 'alle stappen van beide diensten zichtbaar zonder JS');
    await page.goto(`${BASIS}/r${r}/eerste-bezoek/`);
    eis((await page.locator('.kerk:visible').count()) === 11, 'alle kerken zichtbaar zonder JS');
    eis(!(await page.isVisible('.filters')), 'filters verborgen zonder JS (werken alleen met JS)');
    await ctx.close();
  });

  await scenario(`r${r}: wisselende woorden in de hero zijn te pauzeren en staan stil bij ‘minder beweging’`, async () => {
    const { ctx, page } = await nieuwePagina({ beweging: 'no-preference' });
    await page.goto(`${BASIS}/r${r}/`);
    eis(await page.isVisible('.pauze'), 'pauzeknop zichtbaar');
    await page.click('.pauze');
    eis((await page.getAttribute('.pauze', 'aria-pressed')) === 'true', 'aria-pressed na pauze');
    const w1 = await page.textContent('.wissel');
    await page.waitForTimeout(3600);
    eis((await page.textContent('.wissel')) === w1, 'woord blijft staan na pauze');
    await ctx.close();
    const b = await nieuwePagina({ beweging: 'reduce' });
    await b.page.goto(`${BASIS}/r${r}/`);
    eis(!(await b.page.isVisible('.pauze')), 'geen wisseling (en geen knop) bij minder beweging');
    await b.ctx.close();
  });

  await scenario(`r${r}: kijk eens binnen — tabs met pijltjestoetsen, stap voor stap, alles tonen`, async () => {
    const { ctx, page } = await nieuwePagina();
    await page.goto(`${BASIS}/r${r}/kijk-binnen/`);
    eis(await page.isVisible('#dienst-protestants') && !(await page.isVisible('#dienst-katholiek')), 'eerste tab open');
    await page.focus('#tab-protestants');
    await page.keyboard.press('ArrowRight');
    eis(await page.isVisible('#dienst-katholiek'), 'pijl rechts opent rooms-katholiek');
    eis(await page.evaluate(() => document.activeElement.id) === 'tab-katholiek', 'focus volgt tab');
    const lijst = page.locator('#dienst-katholiek');
    eis((await lijst.locator('.stap-item:visible').count()) === 1, 'één stap tegelijk');
    await page.locator('#dienst-katholiek .stapper [data-volgende]').click();
    await page.locator('#dienst-katholiek .stapper [data-volgende]').click();
    eis((await lijst.locator('.stap-item.actief h3').textContent()) === 'Lezingen', 'derde stap na twee keer volgende');
    eis((await page.locator('#dienst-katholiek .stapper [aria-live]').textContent()).includes('Stap 3 van 7'), 'voortgang voorgelezen');
    await page.locator('#dienst-katholiek .stapper .alles').click();
    eis((await lijst.locator('.stap-item:visible').count()) === 7, 'alle stappen na ‘toon alle’');
    eis((await page.textContent('#dienst-katholiek')).includes('De communie is voor katholieken'), 'eerlijke uitleg communie');
    const a = await axe(page);
    eis(a.length === 0, `axe:\n${a.join('\n')}`);
    await schoon(page);
    await ctx.close();
  });

  await scenario(`r${r}: eerste kerkbezoek — feitelijke filters, eerstvolgende dienst, route en agendabestand`, async () => {
    const { ctx, page } = await nieuwePagina({ breedte: 390 });
    await page.goto(`${BASIS}/r${r}/eerste-bezoek/`);
    eis(await page.isVisible('.filters'), 'filters zichtbaar met JS');
    await page.check('input[name="traditie"][value="rooms-katholiek"]');
    eis((await page.locator('.kerk:visible').count()) === 3, 'drie rooms-katholieke kerken');
    await page.check('input[name="wens"][value="kinderen"]');
    const n = await page.locator('.kerk:visible').count();
    eis(n === 1, `één RK-kerk met kinderwerk (kreeg ${n})`);
    eis((await page.textContent('[data-aantal]')).includes('1 kerk past'), 'aantal gemeld');
    await page.check('input[name="plaats"][value="’t Goy"]');
    eis((await page.textContent('[data-aantal]')).startsWith('Geen kerk past'), 'lege uitkomst met uitleg');
    await page.check('input[name="plaats"][value=""]');
    await page.uncheck('input[name="wens"][value="kinderen"]');
    await page.check('input[name="traditie"][value=""]');
    eis((await page.locator('.kerk:visible').count()) === 11, 'alles weer zichtbaar');
    const kaart = page.locator('.kerk', { has: page.locator('h3', { hasText: 'Sionkerk' }) });
    eis((await kaart.locator('[data-volgende]').textContent()).startsWith('Eerstvolgende: zondag'), 'eerstvolgende dienst berekend');
    eis((await kaart.locator('a', { hasText: 'Route' }).getAttribute('href')).startsWith('https://www.openstreetmap.org/'), 'routelink OpenStreetMap');
    const [download] = await Promise.all([page.waitForEvent('download'), kaart.locator('button', { hasText: 'agenda' }).click()]);
    const ics = await readFile(await download.path(), 'utf8');
    eis(ics.includes('BEGIN:VEVENT') && ics.includes('Sionkerk') && ics.includes('Eikenhout 221'), 'ics met kerk en adres');
    await schoon(page);
    await ctx.close();
  });
}

await scenario('alle spandoek-URL’s bestaan in alle richtingen', async () => {
  const { ctx, page } = await nieuwePagina({ js: false });
  for (const r of [1, 2, 3]) for (const w of LV.woorden) {
    const res = await page.goto(`${BASIS}/r${r}/${w.id}/`);
    eis(res.status() === 200, `/r${r}/${w.id}/ gaf ${res.status()}`);
  }
  await ctx.close();
});

await browser.close();
server.close();
console.log(`\n${ok} geslaagd, ${fouten.length} mislukt`);
process.exit(fouten.length ? 1 : 0);
