#!/usr/bin/env node
// Eindgebruikerstest van het uitgewerkte ontwerp (ronde 6) in Chromium.
//   node ontwerp/bouw.mjs && node ontwerp/test.mjs

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
const POORT = 8795;
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
  page.on('request', (r) => { if (!r.url().startsWith(BASIS) && !r.url().startsWith('blob:')) page.__ext.push(r.url()); });
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
const overloop = (page, b) => page.evaluate((b) => {
  const f = [];
  if (document.documentElement.scrollWidth > b) f.push(`pagina ${document.documentElement.scrollWidth}px`);
  for (const el of document.querySelectorAll('main *, header *, footer *')) {
    if (el.closest('[hidden]') || el.closest('.paginakop-foto')) continue;
    const r = el.getBoundingClientRect();
    if (r.width && (r.right > b + 0.5 || r.left < -0.5) && getComputedStyle(el).position !== 'absolute') f.push(`${el.tagName.toLowerCase()}.${el.className?.baseVal ?? el.className} ${Math.round(r.left)}–${Math.round(r.right)}`);
  }
  return f.slice(0, 5);
}, b);

const PADEN = ['/', '/wie-is-jezus/', '/de-eerste-keer/', '/kerken/', '/over/', '/moe/', '/opnieuw-beginnen/'];
for (const pad of PADEN) {
  await scenario(`${pad}: geen overloop op 320/375/390/768/1024/1440 px, axe op 390 en 1440, één h1, logo, Denckh.nl, schoon`, async () => {
    const { ctx, page } = await pagina({ breedte: 390 });
    await page.goto(BASIS + pad, { waitUntil: 'networkidle' });
    for (const b of [320, 375, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width: b, height: 800 });
      await page.waitForTimeout(40);
      const f = await overloop(page, b);
      eis(f.length === 0, `overloop op ${b}px: ${f.join('; ')}`);
    }
    await page.setViewportSize({ width: 390, height: 800 });
    const a1 = await axe(page); eis(a1.length === 0, `axe 390:\n${a1.join('\n')}`);
    await page.setViewportSize({ width: 1440, height: 900 });
    const a2 = await axe(page); eis(a2.length === 0, `axe 1440:\n${a2.join('\n')}`);
    eis((await page.locator('h1').count()) === 1, 'één h1');
    eis((await page.locator('header .logo[aria-label="Kom naar de kerk."]').count()) === 1, 'logo met toegankelijke naam');
    eis((await page.locator('footer .maker a[href="https://denckh.nl"]').textContent()).includes('Concept en realisatie door'), 'Concept en realisatie door Denckh.nl');
    eis((await page.locator('footer a[href="tel:08000113"]').count()) === 1, '113 in de footer');
    const kapot = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src));
    eis(kapot.length === 0, `afbeeldingen laden niet: ${kapot}`);
    await schoon(page);
    await ctx.close();
  });
}

await scenario('home: in één oogopslag — wat is dit, voor wie, wat vind je, waar kun je heen, en twee duidelijke knoppen', async () => {
  const { ctx, page } = await pagina({ breedte: 390 });
  await page.goto(BASIS + '/');
  const t = await page.textContent('main');
  for (const v of ['Wat is dit?', 'Voor wie?', 'Wat vind je hier?', 'Waar kun je heen?']) eis(t.includes(v), `ontbreekt: ${v}`);
  eis(await page.isVisible('.hero a.knop[href="/kerken/"]'), 'knop Vind een kerk in de hero');
  const hero = await page.locator('.hero .knop').first().boundingBox();
  eis(hero.y < 844 * 1.1, 'eerste knop staat (bijna) in beeld op mobiel');
  await ctx.close();
});

await scenario('wisselende woorden: vanzelf, stil bij focus, pauze, ander woord, stil bij minder beweging', async () => {
  const { ctx, page } = await pagina({ beweging: 'no-preference' });
  await page.goto(BASIS + '/');
  const a = await page.textContent('.wissel');
  await page.waitForTimeout(5400);
  eis(a !== (await page.textContent('.wissel')), 'woord wisselt vanzelf');
  await page.focus('.wissel');
  const b = await page.textContent('.wissel');
  await page.waitForTimeout(5000);
  eis(b === (await page.textContent('.wissel')), 'staat stil bij focus');
  await page.click('[data-pauze]');
  eis((await page.getAttribute('[data-pauze]', 'aria-pressed')) === 'true', 'pauze aria-pressed');
  await page.click('[data-ander]');
  await page.waitForTimeout(800);
  eis((await page.getAttribute('.wissel', 'href')) === `/${await page.getAttribute('.wissel', 'data-woord')}/`, 'link volgt het woord');
  await ctx.close();
  const r = await pagina({ beweging: 'reduce' });
  await r.page.goto(BASIS + '/');
  const w = await r.page.textContent('.wissel');
  await r.page.waitForTimeout(5000);
  eis(w === (await r.page.textContent('.wissel')), 'geen wissel bij minder beweging');
  await r.ctx.close();
});

await scenario('woord kiezen: herkenning, hoop met bron, drie vervolgstappen, focus heen en terug', async () => {
  const { ctx, page } = await pagina({ breedte: 390 });
  await page.goto(BASIS + '/');
  await page.click('.woordveld .woord[data-woord="baan-kwijt"]');
  eis(await page.isVisible('#paneel-baan-kwijt'), 'paneel open');
  eis(await page.evaluate(() => document.activeElement?.id) === 'kop-baan-kwijt', 'focus op de kop');
  const knoppen = await page.locator('#paneel-baan-kwijt .stappen a').allTextContents();
  eis(JSON.stringify(knoppen) === JSON.stringify(['Ontdek Jezus', 'Wat gebeurt er in de kerk?', 'Vind een kerk']), `stappen: ${knoppen}`);
  eis((await page.textContent('#paneel-baan-kwijt .hoop')).includes('Matteüs 6'), 'Bijbelbron');
  await page.click('.woordveld .woord[data-woord="gelukkig"]');
  eis((await page.locator('.paneel:visible').count()) === 1, 'één paneel tegelijk');
  await page.click('#paneel-gelukkig [data-sluit]');
  eis(await page.evaluate(() => document.activeElement?.dataset.woord) === 'gelukkig', 'focus terug');
  await page.click('.woordveld .woord[data-woord="verdriet"]');
  eis(await page.isVisible('#paneel-verdriet a[href="tel:08000113"]'), '113 bij verdriet');
  const a = await axe(page); eis(a.length === 0, `axe met paneel:\n${a.join('\n')}`);
  await schoon(page);
  await ctx.close();
});

await scenario('mobiel menu: knop opent en sluit, aria-expanded klopt; desktop toont het menu altijd', async () => {
  const { ctx, page } = await pagina({ breedte: 390 });
  await page.goto(BASIS + '/');
  eis(!(await page.isVisible('#hoofdmenu')), 'menu dicht op mobiel');
  await page.click('.menu-knop');
  eis(await page.isVisible('#hoofdmenu a[href="/kerken/"]') && (await page.getAttribute('.menu-knop', 'aria-expanded')) === 'true', 'menu open');
  await page.click('.menu-knop');
  eis(!(await page.isVisible('#hoofdmenu')), 'menu weer dicht');
  await page.setViewportSize({ width: 1440, height: 900 });
  eis(await page.isVisible('#hoofdmenu') && !(await page.isVisible('.menu-knop')), 'desktop: menu zichtbaar, geen knop');
  await ctx.close();
});

await scenario('de eerste keer: tabbladen met pijltjes, katholiek legt de communie eerlijk uit', async () => {
  const { ctx, page } = await pagina();
  await page.goto(BASIS + '/de-eerste-keer/');
  eis(await page.isVisible('#dienst-protestants') && !(await page.isVisible('#dienst-katholiek')), 'eerste tab');
  await page.focus('#tab-protestants');
  await page.keyboard.press('ArrowRight');
  eis(await page.isVisible('#dienst-katholiek'), 'pijl rechts');
  eis((await page.textContent('#dienst-katholiek')).includes('De communie is voor katholieken'), 'uitleg communie');
  const a = await axe(page); eis(a.length === 0, `axe:\n${a.join('\n')}`);
  await ctx.close();
});

await scenario('kerken: filters op feiten, eerstvolgende dienst, route en agenda', async () => {
  const { ctx, page } = await pagina({ breedte: 390 });
  await page.goto(BASIS + '/kerken/');
  eis((await page.locator('.kerk:visible').count()) === 11, '11 kerken');
  await page.check('input[name="soort"][value="rooms-katholiek"]');
  eis((await page.locator('.kerk:visible').count()) === 3, '3 katholieke kerken');
  await page.check('input[name="wens"][value="kinderen"]');
  eis((await page.textContent('[data-aantal]')).includes('1 kerk past'), 'aantal gemeld');
  await page.check('input[name="plaats"][value="\'t Goy"]');
  eis((await page.textContent('[data-aantal]')).startsWith('Geen kerk past'), 'lege uitkomst met uitleg');
  await page.check('input[name="plaats"][value=""]'); await page.uncheck('input[name="wens"][value="kinderen"]'); await page.check('input[name="soort"][value=""]');
  const sion = page.locator('.kerk', { has: page.locator('h2', { hasText: 'Sionkerk' }) });
  eis((await sion.locator('[data-volgende]').textContent()).startsWith('Eerstvolgende: zondag'), 'eerstvolgende dienst');
  eis((await sion.locator('a', { hasText: 'Route' }).getAttribute('href')).startsWith('https://www.openstreetmap.org/'), 'route');
  const [dl] = await Promise.all([page.waitForEvent('download'), sion.locator('button', { hasText: 'agenda' }).click()]);
  eis((await readFile(await dl.path(), 'utf8')).includes('Eikenhout 221'), 'agendabestand met adres');
  await schoon(page);
  await ctx.close();
});

await scenario('zonder JavaScript: alles leesbaar, woord leidt naar eigen pagina, alle kerken en beide diensten zichtbaar', async () => {
  const { ctx, page } = await pagina({ js: false, beweging: 'no-preference' });
  await page.goto(BASIS + '/');
  eis(await page.isVisible('#hoofdmenu a[href="/kerken/"]'), 'menu zichtbaar');
  const verborgen = await page.evaluate(() => [...document.querySelectorAll('.onthul')].filter((e) => getComputedStyle(e).opacity !== '1').length);
  eis(verborgen === 0, `${verborgen} blokken onzichtbaar zonder JS`);
  await page.click('.wissel');
  await page.waitForURL('**/moe/');
  eis((await page.textContent('h1')).trim() === 'Moe?', 'woordpagina');
  await page.goto(BASIS + '/kerken/');
  eis((await page.locator('.kerk:visible').count()) === 11 && !(await page.isVisible('.filters')), 'alle kerken, geen filters');
  await page.goto(BASIS + '/de-eerste-keer/');
  eis(await page.isVisible('#dienst-protestants') && await page.isVisible('#dienst-katholiek'), 'beide diensten');
  await ctx.close();
});

await scenario('alle woordpagina’s bestaan', async () => {
  const { ctx, page } = await pagina({ js: false });
  for (const w of W) { const r = await page.goto(`${BASIS}/${w.id}/`); eis(r.status() === 200, `/${w.id}/ gaf ${r.status()}`); }
  await ctx.close();
});

await browser.close();
server.close();
console.log(`\n${ok} geslaagd, ${fout.length} mislukt`);
process.exit(fout.length ? 1 : 0);
