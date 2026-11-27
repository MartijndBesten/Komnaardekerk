#!/usr/bin/env node
// Eindgebruikerstests in een echte browser (Playwright/Chromium) tegen de gebouwde site.
// Start zelf een lokale server die Cloudflare nabootst (scripts/serve.mjs).
//
//   node scripts/test-browser.mjs
//   TEST_BASE_URL=https://komnaardekerk.nl node scripts/test-browser.mjs   (alleen alleen-lezen controles)
//   PLAYWRIGHT_MODULE=<pad naar playwright> als playwright niet globaal vindbaar is.
//
// Schermafbeeldingen komen in test-resultaten/ (niet in Git).

import { createRequire } from 'node:module';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { maakServer } from './serve.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UIT = path.join(ROOT, 'test-resultaten');
const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
} catch {
  playwright = require('/opt/node22/lib/node_modules/playwright');
}
const { chromium, devices } = playwright;
const AXE = await readFile(path.join(ROOT, 'node_modules/axe-core/axe.min.js'), 'utf8');

const PAGINAS = ['/', '/waarom-naar-de-kerk/', '/voor-het-eerst/', '/kerken/', '/kerken/sionkerk/', '/kerken/t-waal-en-honswijk/', '/ontdek-het-geloof/', '/activiteiten/', '/samen-naar-de-kerk/', '/over-ons/', '/privacy/', '/samen-naar-de-kerk/bedankt/', '/samen-naar-de-kerk/niet-gelukt/'];
const BREEDTES = [320, 360, 390, 768, 1024, 1440];

let geslaagd = 0;
const fouten = [];
async function scenario(naam, fn) {
  try {
    await fn();
    geslaagd++;
    console.log(`  ✓ ${naam}`);
  } catch (e) {
    fouten.push(`${naam}: ${e.message}`);
    console.log(`  ✗ ${naam}\n      ${e.message.split('\n').join('\n      ')}`);
  }
}
function eis(waar, melding) {
  if (!waar) throw new Error(melding);
}

await mkdir(UIT, { recursive: true });

// Server: standaard (formulier 'uit' aan serverkant) en één met het formulier 'aan'.
const extern = process.env.TEST_BASE_URL;
// TEST_BUNDEL=1: test de uit te rollen Worker-bundel (.uitrol/komnaardekerk.mjs) in plaats van dist/.
const bundel = process.env.TEST_BUNDEL ? await import(path.join(ROOT, '.uitrol/komnaardekerk.mjs')) : null;
if (bundel) console.log('Test tegen de Worker-bundel .uitrol/komnaardekerk.mjs');
const server = maakServer({ bundel });
await new Promise((r) => server.listen(0, r));
const BASIS = extern || `http://localhost:${server.address().port}`;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_BIN || undefined });

async function nieuwePagina(opties = {}) {
  const ctx = await browser.newContext({ locale: 'nl-NL', ...opties });
  const page = await ctx.newPage();
  page._fouten = [];
  page.on('console', (m) => {
    if (m.type() === 'error' || /Content Security Policy/i.test(m.text())) page._fouten.push(m.text());
  });
  page.on('pageerror', (e) => page._fouten.push(String(e)));
  page.on('requestfailed', (r) => page._fouten.push(`request mislukt: ${r.url()}`));
  return { ctx, page };
}

async function axe(page) {
  // Via evaluate (buiten de CSP om): een inline <script> wordt terecht door de CSP geblokkeerd.
  if (!(await page.evaluate(() => !!window.axe))) await page.evaluate(AXE);
  return page.evaluate(async () => {
    const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] }, resultTypes: ['violations'] });
    return r.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
  });
}

async function alleOnthullen(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 25));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.waitForTimeout(1100);
}

console.log(`\nkomnaardekerk.nl browsertests tegen ${BASIS}\n`);

// ---------- 1. Elke pagina op elke breedte: laden, geen fouten, geen horizontale scroll, toegankelijkheid ----------
console.log('Pagina’s × breedtes');
for (const pad of PAGINAS) {
  await scenario(`${pad} op ${BREEDTES.join('/')} px: geen fouten, geen horizontaal scrollen, axe zonder schendingen`, async () => {
    const { ctx, page } = await nieuwePagina({ viewport: { width: 1440, height: 900 } });
    const resp = await page.goto(BASIS + pad, { waitUntil: 'networkidle' });
    eis(resp.status() === 200, `status ${resp.status()}`);
    // wisselende woorden stilzetten, anders scant axe midden in een overgang (woord tijdelijk doorzichtig)
    if (await page.locator('[data-pauze]').count()) { await page.locator('[data-pauze]').click(); await page.waitForTimeout(800); }
    eis((await page.locator('h1').count()) === 1, 'niet precies één h1');
    const csp = resp.headers()['content-security-policy'] || '';
    eis(csp.includes("script-src 'self'"), 'CSP-header ontbreekt');
    // Voorkomt dat Cloudflare scripts (Web Analytics-beacon) in de HTML spuit.
    eis(/no-transform/.test(resp.headers()['cache-control'] || ''), `HTML zonder no-transform (cache-control: ${resp.headers()['cache-control']})`);
    eis(/noindex/.test(resp.headers()['x-robots-tag'] || ''), 'conceptpagina zonder X-Robots-Tag: noindex');
    eis((await page.locator('.conceptbalk').count()) === 0, 'conceptbalk zichtbaar');
    // Makersvermelding met het officiële Denckh-logo (DENCKH_MERKVERMELDING.md).
    const maker = page.locator('.maker a');
    eis((await maker.getAttribute('href')) === 'https://denckh.nl', 'Denckh-link ontbreekt of klopt niet');
    eis((await maker.textContent()).includes('Concept en realisatie door'), 'makerstekst ontbreekt');
    eis((await maker.locator('img').getAttribute('src')).endsWith('/merk/denckh/denckh-logo-signature-light.svg'), 'niet het officiële signatuurlogo');
    eis(await page.locator('.maker img').evaluate((i) => i.complete && i.naturalWidth > 0), 'Denckh-logo laadt niet');
    // Alle afbeeldingen laden echt.
    const kapot = await page.evaluate(() => [...document.images].filter((i) => i.loading !== 'lazy' && i.complete && i.naturalWidth === 0).map((i) => i.src));
    eis(kapot.length === 0, `afbeelding laadt niet: ${kapot.join(', ')}`);
    for (const w of BREEDTES) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.waitForTimeout(50);
      const sw = await page.evaluate(() => document.documentElement.scrollWidth);
      eis(sw <= w, `horizontaal scrollen op ${w}px (scrollWidth ${sw})`);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await alleOnthullen(page);
    const schendingen = await axe(page);
    eis(schendingen.length === 0, `axe (390px):\n${schendingen.join('\n')}`);
    await page.setViewportSize({ width: 1440, height: 900 });
    await alleOnthullen(page);
    const schendingenDesktop = await axe(page);
    eis(schendingenDesktop.length === 0, `axe (1440px):\n${schendingenDesktop.join('\n')}`);
    eis(page._fouten.length === 0, `console/CSP/request-fouten:\n${page._fouten.join('\n')}`);
    await ctx.close();
  });
}

await scenario('Onbekende pagina geeft 404 met een weg terug', async () => {
  const { ctx, page } = await nieuwePagina();
  const r = await page.goto(BASIS + '/bestaat-niet/', { waitUntil: 'networkidle' });
  eis(r.status() === 404, `status ${r.status()}`);
  eis(await page.getByRole('link', { name: 'Naar de startpagina', exact: true }).isVisible(), 'geen link naar start');
  await ctx.close();
});

// ---------- 2. Persona's en kerntaken ----------
console.log('\nScenario’s');

await scenario('Eerste indruk (5 seconden): kop, uitleg en twee acties direct zichtbaar op een telefoon', async () => {
  const { ctx, page } = await nieuwePagina({ ...devices['iPhone 13'] });
  await page.goto(BASIS + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const h1 = page.getByRole('heading', { level: 1 });
  eis((await h1.textContent()).includes('Er is plek voor jou'), 'hoofdtitel');
  for (const naam of ['Vind een kerk', 'Wat houdt je bezig?']) {
    const knop = page.getByRole('link', { name: naam });
    const box = await knop.boundingBox();
    eis(box && box.y + box.height <= 844 + 20, `'${naam}' niet in beeld zonder scrollen (y=${box?.y})`);
    eis(box.height >= 44, `'${naam}' te klein om te tikken (${box.height}px)`);
  }
  await page.screenshot({ path: path.join(UIT, 'mobiel-eerste-scherm.png') });
  await ctx.close();
});

await scenario('Moeder die uitgeput is (mobiel): kiest "Moe?", leest, wisselt naar "Alleen?", gaat naar ‘Samen naar de kerk’', async () => {
  const { ctx, page } = await nieuwePagina({ ...devices['Pixel 7'] });
  await page.goto(BASIS + '/', { waitUntil: 'networkidle' });
  const moe = page.locator('#gevoel-moe');
  await moe.locator('summary').click();
  eis(await moe.evaluate((d) => d.open), 'moe niet open');
  eis(await moe.getByText('In de kerk hoef je niets te doen. Je mag gewoon zitten en luisteren.').isVisible(), 'tekst niet zichtbaar');
  eis((await moe.getByRole('link', { name: 'Ontdek Jezus' }).count()) === 1, 'vervolgstap Ontdek Jezus ontbreekt');
  eis((await moe.locator('a[href^="https://www.debijbel.nl/"]').count()) === 1, 'Bijbelverwijzing ontbreekt');
  const alleen = page.locator('#gevoel-alleen');
  await alleen.locator('summary').click();
  eis(await alleen.evaluate((d) => d.open), 'alleen niet open');
  eis(!(await moe.evaluate((d) => d.open)), 'vorige keuze bleef open (niet exclusief)');
  await page.screenshot({ path: path.join(UIT, 'mobiel-keuze-alleen.png') });
  await alleen.getByRole('link', { name: /Ga samen/ }).click();
  await page.waitForURL(/\/samen-naar-de-kerk\/$/);
  eis(await page.getByRole('heading', { name: 'Handig om te weten, maar niets moet' }).isVisible(), 'kop met tips niet zichtbaar');
  eis(page._fouten.length === 0, page._fouten.join('\n'));
  await ctx.close();
});


await scenario('Wisselende woorden: één tegelijk, stil bij focus, pauze en ‘ander woord’, klik opent de keuze', async () => {
  const { ctx, page } = await nieuwePagina({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASIS + '/', { waitUntil: 'networkidle' });
  const a = await page.locator('.wissel').textContent();
  await page.waitForTimeout(5400);
  eis(a !== (await page.locator('.wissel').textContent()), 'woord wisselt niet vanzelf');
  await page.locator('.wissel').focus();
  const b = await page.locator('.wissel').textContent();
  await page.waitForTimeout(5000);
  eis(b === (await page.locator('.wissel').textContent()), 'woord wisselt terwijl het focus heeft');
  await page.locator('[data-pauze]').click();
  eis((await page.locator('[data-pauze]').getAttribute('aria-pressed')) === 'true', 'pauze niet aria-pressed');
  await page.locator('[data-ander]').click();
  await page.waitForTimeout(800);
  const id = await page.locator('.wissel').getAttribute('data-woord');
  eis((await page.locator('.wissel').getAttribute('href')) === `#gevoel-${id}`, 'link volgt het woord niet');
  await page.locator('.wissel').click();
  eis(await page.locator(`#gevoel-${id}`).evaluate((d) => d.open), 'klik op het woord opent de keuze niet');
  await ctx.close();
});

await scenario('Een zondagochtend: tijdlijn groeit mee, keuzes passen de tekst aan, alles met toetsenbord (mobiel en desktop)', async () => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
    const { ctx, page } = await nieuwePagina({ viewport });
    await page.goto(BASIS + '/', { waitUntil: 'networkidle' });
    const lijn = page.locator('[data-ochtend]');
    const vulling = () => lijn.evaluate((el) => parseFloat(getComputedStyle(el).getPropertyValue('--vulling')) || 0);
    eis((await vulling()) === 0, 'tijdlijn is al gevuld voordat je erbij bent');
    // muziek kiezen past stap 2 aan (en terug)
    const zingen = page.locator('#ochtend-zingen .ochtend-tekst');
    const algemeen = (await zingen.textContent()).trim();
    await page.getByRole('radio', { name: 'Band' }).check();
    eis(/band/i.test(await zingen.textContent()) && (await zingen.textContent()).trim() !== algemeen, 'muziekkeuze past de tekst niet aan');
    eis((await page.locator('#ochtend-zingen [data-muziek-tag]').textContent()).trim() === 'Band', 'label bij de stap ontbreekt');
    eis(/aangepast/.test(await page.locator('[data-ochtend-status]').textContent()), 'geen melding voor schermlezers');
    await page.getByRole('radio', { name: 'Weet ik nog niet' }).check();
    eis((await zingen.textContent()).trim() === algemeen, 'terug naar de algemene tekst lukt niet');
    eis(!(await page.locator('#ochtend-zingen [data-muziek-tag]').isVisible()), 'label blijft staan');
    // toetsenbord: pijltjes in de groep kiezen een andere optie
    await page.getByRole('radio', { name: 'Orgel' }).focus();
    await page.keyboard.press('ArrowRight');
    eis(await page.getByRole('radio', { name: 'Piano' }).isChecked(), 'kiezen met de pijltjes werkt niet');
    eis(/piano/i.test(await zingen.textContent()), 'pianotekst niet getoond');
    // gezelschap: alleen de passende tips
    await page.getByRole('radio', { name: 'Met kinderen' }).check();
    eis((await page.locator('.ochtend-tip:visible').count()) === 2, 'verwacht 2 tips (binnenkomen en koffie)');
    eis((await page.locator('.ochtend-tip[data-tip="kinderen"]:visible').count()) === 2, 'verkeerde tips zichtbaar');
    // uitklapper per stap
    const meer = page.locator('#ochtend-bidden .ochtend-meer');
    await meer.locator('summary').focus();
    await page.keyboard.press('Enter');
    eis(await meer.evaluate((d) => d.open), 'uitklapper opent niet met Enter');
    eis(/Dit hoeft niet/.test(await meer.textContent()), "'Wat hoeft niet' ontbreekt");
    // scrollen naar het eind vult de lijn helemaal
    await page.locator('#ochtend-eind').scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(800);
    eis((await vulling()) === 1, `tijdlijn niet vol aan het eind (${await vulling()})`);
    eis((await page.locator('#ochtend-eind a[href="/kerken/"]').textContent()).includes('Kies een kerk'), 'eindstap zonder knop naar de kerken');
    // de getekende zaal volgt de ochtend en je keuzes
    const zaal = page.locator('[data-ochtend-scene] svg');
    eis(await page.locator('[data-ochtend-scene]').isVisible(), 'getekende zaal niet zichtbaar');
    eis((await zaal.getAttribute('data-stap')) === 'eind', `zaal volgt het scrollen niet (${await zaal.getAttribute('data-stap')})`);
    eis((await zaal.getAttribute('data-muziek')) === 'piano' && (await zaal.getAttribute('data-mee')) === 'kinderen', 'zaal volgt de keuzes niet');
    await page.locator('.scene-stip[data-naar="bidden"]').click();
    await page.waitForTimeout(300);
    eis((await zaal.getAttribute('data-stap')) === 'bidden', 'stip springt niet naar de stap');
    eis((await page.locator('.scene-stip[data-naar="bidden"]').getAttribute('aria-current')) === 'step', 'actieve stip niet gemarkeerd');
    eis((await page.locator('[data-scene-titel]').textContent()).trim() === 'Er wordt gebeden', 'titel onder de zaal klopt niet');
    await page.getByRole('radio', { name: 'Ik ga naar huis' }).check();
    eis((await zaal.getAttribute('data-na')) === 'huis' && (await page.locator('[data-na-antwoord]').isVisible()), "keuze 'naar huis' werkt niet");
    // niets bewaard
    eis((await page.evaluate(() => localStorage.length + sessionStorage.length)) === 0, 'keuze opgeslagen');
    await ctx.close();
  }
});

await scenario('Zwevende knop Vind een kerk: alleen op de telefoon, weg bij de opening en bij de kerkenlijst', async () => {
  const { ctx, page } = await nieuwePagina({ viewport: { width: 390, height: 844 } });
  await page.goto(BASIS + '/', { waitUntil: 'networkidle' });
  const knop = page.locator('[data-zweefknop]');
  eis(!(await knop.isVisible()), 'knop zichtbaar over de opening');
  await page.locator('#ochtend').evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + scrollY));
  await page.waitForTimeout(400);
  eis(await knop.isVisible(), 'knop niet zichtbaar halverwege de pagina');
  eis((await knop.getAttribute('href')) === '/kerken/', 'knop gaat niet naar de kerken');
  await page.locator('section.buurt h2').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  eis(!(await knop.isVisible()), 'knop blijft staan terwijl de kerken in beeld zijn');
  await ctx.close();
  const d = await nieuwePagina({ viewport: { width: 1280, height: 800 } });
  await d.page.goto(BASIS + '/', { waitUntil: 'networkidle' });
  await d.page.locator('#ochtend').evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + scrollY));
  await d.page.waitForTimeout(400);
  eis(!(await d.page.locator('[data-zweefknop]').isVisible()), 'zwevende knop op desktop');
  await d.ctx.close();
});

await scenario('Verdriet: de keuze verwijst ook naar een hulplijn met belbare link', async () => {
  const { ctx, page } = await nieuwePagina();
  await page.goto(BASIS + '/#gevoel-verdriet', { waitUntil: 'networkidle' });
  const v = page.locator('#gevoel-verdriet');
  eis(await v.evaluate((d) => d.open), 'direct openen via #gevoel-verdriet werkt niet');
  eis((await v.locator('a[href="tel:08000113"]').count()) === 1, 'geen tel-link 113');
  await ctx.close();
});

await scenario('Toetsenbord: overslaanlink, focus zichtbaar, keuzes met Enter en spatie', async () => {
  const { ctx, page } = await nieuwePagina({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASIS + '/', { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  const eerste = await page.evaluate(() => document.activeElement.textContent.trim());
  eis(eerste === 'Naar de inhoud', `eerste tabstop is '${eerste}'`);
  eis(await page.getByRole('link', { name: 'Naar de inhoud' }).isVisible(), 'overslaanlink niet zichtbaar bij focus');
  await page.keyboard.press('Enter');
  eis(await page.evaluate(() => document.activeElement.id === 'inhoud' || location.hash === '#inhoud'), 'focus niet naar inhoud');
  await page.locator('#gevoel-zoekend summary').focus();
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
  eis(outline !== 'none', 'geen zichtbare focus');
  await page.keyboard.press('Enter');
  eis(await page.locator('#gevoel-zoekend').evaluate((d) => d.open), 'Enter opent keuze niet');
  await page.keyboard.press('Space');
  eis(!(await page.locator('#gevoel-zoekend').evaluate((d) => d.open)), 'spatie sluit keuze niet');
  await ctx.close();
});

await scenario('Mobiel menu: openen, navigeren, Escape sluit en focus keert terug', async () => {
  const { ctx, page } = await nieuwePagina({ ...devices['iPhone SE'] });
  await page.goto(BASIS + '/', { waitUntil: 'networkidle' });
  const knop = page.getByRole('button', { name: 'Menu' });
  eis(await knop.isVisible(), 'menuknop niet zichtbaar');
  eis(!(await page.locator('#hoofdmenu').isVisible()), 'menu al open');
  await knop.click();
  eis((await knop.getAttribute('aria-expanded')) === 'true', 'aria-expanded niet true');
  eis(await page.locator('#hoofdmenu').isVisible(), 'menu niet zichtbaar na openen');
  await page.screenshot({ path: path.join(UIT, 'mobiel-menu.png') });
  await page.keyboard.press('Escape');
  eis((await knop.getAttribute('aria-expanded')) === 'false', 'Escape sluit niet');
  eis(await page.evaluate(() => document.activeElement.classList.contains('menuknop')), 'focus niet terug op knop');
  await knop.click();
  await page.getByRole('navigation', { name: 'Hoofdmenu' }).getByRole('link', { name: 'Voor het eerst' }).click();
  await page.waitForURL(/\/voor-het-eerst\/$/);
  eis((await page.locator('#hoofdmenu a[href="/voor-het-eerst/"]').getAttribute('aria-current')) === 'page', 'aria-current ontbreekt');
  eis(!(await page.locator('#hoofdmenu').isVisible()), 'menu blijft open na navigeren');
  await ctx.close();
});

await scenario('Oudere bezoeker: tekst 200% vergroot op 1280 px blijft leesbaar zonder horizontaal scrollen', async () => {
  const { ctx, page } = await nieuwePagina({ viewport: { width: 1280, height: 900 } });
  for (const pad of ['/', '/kerken/', '/samen-naar-de-kerk/']) {
    await page.goto(BASIS + pad, { waitUntil: 'networkidle' });
    await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
    await page.waitForTimeout(100);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    eis(sw <= 1280, `${pad}: horizontaal scrollen bij 200% (${sw})`);
    const basis = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('main p')).fontSize));
    eis(basis >= 17, `${pad}: basistekst ${basis}px`);
  }
  await ctx.close();
});

await scenario('Kerk zoeken: filters op plaats, traditie en kenmerk, met melding en lege toestand', async () => {
  const { ctx, page } = await nieuwePagina({ ...devices['iPhone 13'] });
  await page.goto(BASIS + '/kerken/', { waitUntil: 'networkidle' });
  const zichtbaar = () => page.locator('[data-kerkenlijst] .kerkkaart:visible').count();
  const totaal = await zichtbaar();
  eis(totaal >= 8, `te weinig kerken (${totaal})`);
  const rk = page.getByRole('button', { name: 'Rooms-katholiek' });
  await rk.click();
  eis((await rk.getAttribute('aria-pressed')) === 'true', 'aria-pressed');
  const verwachtRk = await page.locator('[data-kerkenlijst] .kerkkaart[data-traditie="rooms-katholiek"]').count();
  eis((await zichtbaar()) === verwachtRk && verwachtRk > 0, `rk: ${await zichtbaar()} zichtbaar, verwacht ${verwachtRk}`);
  eis((await page.locator('[data-filter-uitkomst]').textContent()).includes(String(verwachtRk)), 'statusmelding klopt niet');
  // binnen een groep is het 'of': Rooms-katholiek of Evangelisch
  await page.getByRole('button', { name: 'Evangelisch' }).click();
  const verwachtOf = await page.locator('[data-kerkenlijst] .kerkkaart[data-traditie="rooms-katholiek"], [data-kerkenlijst] .kerkkaart[data-traditie="evangelisch"]').count();
  eis((await zichtbaar()) === verwachtOf, `of-filter: ${await zichtbaar()} i.p.v. ${verwachtOf}`);
  await page.getByRole('button', { name: 'Evangelisch' }).click();
  // tussen groepen is het 'en': Rooms-katholiek en Schalkwijk
  await page.getByRole('button', { name: 'Schalkwijk' }).click();
  const verwachtEn = await page.locator('[data-kerkenlijst] .kerkkaart[data-traditie="rooms-katholiek"][data-plaats="Schalkwijk"]').count();
  eis((await zichtbaar()) === verwachtEn, `en-filter: ${await zichtbaar()} i.p.v. ${verwachtEn}`);
  await page.getByRole('button', { name: 'Oppas voor de kleintjes' }).click();
  if ((await zichtbaar()) === 0) {
    eis(await page.locator('[data-geen-resultaat]').isVisible(), 'lege toestand niet zichtbaar');
    await page.screenshot({ path: path.join(UIT, 'mobiel-kerken-leeg.png') });
  }
  for (const n of ['Oppas voor de kleintjes', 'Schalkwijk', 'Rooms-katholiek']) await page.getByRole('button', { name: n }).click();
  eis((await zichtbaar()) === totaal, 'filters terugzetten herstelt niet alle kerken');
  await ctx.close();
});

await scenario('Geen fictieve of onbevestigde gegevens: elke kerk heeft een bron en controledatum', async () => {
  const { ctx, page } = await nieuwePagina();
  await page.goto(BASIS + '/kerken/', { waitUntil: 'networkidle' });
  const paden = await page.locator('[data-kerkenlijst] .kerkkaart-naam a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  eis(paden.length >= 8, `te weinig kerken (${paden.length})`);
  for (const pad of paden) {
    await page.goto(BASIS + pad, { waitUntil: 'domcontentloaded' });
    const k = page.locator('.kerk--pagina');
    const naam = await k.locator('.kerk-naam').textContent();
    eis(/gecontroleerd op \d{1,2} \w+ 20\d\d/i.test(await k.locator('.kerk-controle').textContent()), `${naam}: geen controledatum`);
    eis((await k.locator('.kerk-controle a').getAttribute('href')).startsWith('https://'), `${naam}: geen bronlink`);
    eis((await k.locator('.label-status').count()) === 0, `${naam}: deelnamestatus zichtbaar`);
    eis((await k.locator('a[href^="https://"]').first().getAttribute('href')) !== null, `${naam}: geen website`);
    eis(!/(?:^|\s)deelnemer(?:s)?(?:\s|$)/i.test(await k.textContent()), `${naam}: ten onrechte deelnemer`);
  }
  await page.goto(BASIS + '/kerken/', { waitUntil: 'networkidle' });
  for (const pad of ['/', '/kerken/', '/kerken/sionkerk/', '/over-ons/', '/samen-naar-de-kerk/', '/voor-het-eerst/']) {
    await page.goto(BASIS + pad, { waitUntil: 'domcontentloaded' });
    const t = await page.locator('body').textContent();
    eis(!/niet benaderd|doen \(nog\) niet mee/i.test(t), `${pad}: tekst 'nog niet benaderd' staat online`);
    eis(!/voorbereid|bezoek voorbereiden|bereid je (je )?voor|stap voor stap|wacht je (dan )?op/i.test(t), `${pad}: tekst over voorbereiden of een belofte van opvang`);
  }
  await page.goto(BASIS + '/kerken/', { waitUntil: 'domcontentloaded' });
  const tekst = await page.locator('main').textContent();
  eis(!/voorbeeldkerk|voorbeeldtijd|\bpartner\b/i.test(tekst), 'voorbeeld- of partnertekst gevonden');
  await page.goto(BASIS + '/activiteiten/', { waitUntil: 'networkidle' });
  const acts = page.locator('.act');
  eis((await acts.count()) > 0, 'geen activiteiten');
  for (let i = 0; i < (await acts.count()); i++) {
    eis((await acts.nth(i).locator('a.pijllink').getAttribute('href')).startsWith('https://'), 'activiteit zonder officiële aankondiging');
  }
  await ctx.close();
});

await scenario('Mattheüs 11:28: zichtbaar op de homepage, letterlijk citaat met bronvermelding (of gemarkeerde eigen weergave)', async () => {
  const { ctx, page } = await nieuwePagina({ viewport: { width: 390, height: 844 } });
  const bijbel = JSON.parse(await readFile(path.join(ROOT, 'content', 'site.json'), 'utf8')).bijbel;
  for (const pad of ['/', '/waarom-naar-de-kerk/', '/ontdek-het-geloof/']) {
    await page.goto(BASIS + pad, { waitUntil: 'networkidle' });
    const fig = page.locator('.bijbeltekst').first();
    const tekst = (await fig.textContent()).replace(/\s+/g, ' ');
    eis(tekst.includes('Mattheüs 11:28'), `${pad}: verwijzing Mattheüs 11:28 ontbreekt`);
    if (bijbel.weergave === 'citaat') {
      const citaat = (await fig.locator('blockquote').textContent()).replace(/\s+/g, ' ').trim();
      eis(citaat === bijbel.vertalingen[bijbel.citaat.vertaling].tekst, `${pad}: citaat wijkt af van de gecontroleerde tekst: ${citaat}`);
      eis(tekst.includes('© 2021 Nederlands-Vlaams Bijbelgenootschap'), `${pad}: copyrightvermelding ontbreekt`);
      eis(/lees verder op debijbel\.nl/.test(tekst), `${pad}: 'lees verder op debijbel.nl' ontbreekt`);
    } else {
      eis(/vrij weergegeven/i.test(tekst) && /geen Bijbelvertaling/i.test(tekst), `${pad}: niet gemarkeerd als eigen weergave`);
      eis(!tekst.includes('©'), `${pad}: copyrightvermelding bij een eigen weergave`);
    }
    eis((await fig.locator('a').getAttribute('href')).startsWith('https://www.debijbel.nl/'), `${pad}: verwijzing naar debijbel.nl ontbreekt`);
  }
  // op de homepage: een eigen plek direct onder de opening, niet in een uitklapper
  await page.goto(BASIS + '/', { waitUntil: 'networkidle' });
  const blok = page.locator('section.uitnodiging');
  eis((await blok.count()) === 1, 'homepage: sectie met Mattheüs 11:28 ontbreekt');
  eis(await blok.locator('blockquote').isVisible(), 'homepage: de tekst is niet zichtbaar');
  const volgorde = await page.evaluate(() => [...document.querySelectorAll('main > section')].map((s) => s.className.split(' ')[0]));
  eis(volgorde.indexOf('uitnodiging') === 1, `homepage: tekst staat niet direct onder de opening (${volgorde.slice(0, 4).join(', ')})`);
  eis(volgorde.indexOf('buurt') === 2, `homepage: kerkkaart staat niet direct na Mattheüs 11:28 (${volgorde.slice(0, 4).join(', ')})`);
  // de kaart is meteen zichtbaar, zonder klikken, op een telefoon binnen twee schermhoogtes na de opening
  const kaartTop = await page.locator('.buurt .kerkenkaart-beeld').first().evaluate((el) => el.getBoundingClientRect().top + scrollY);
  const heldEind = await page.locator('section.held').evaluate((el) => el.getBoundingClientRect().bottom + scrollY);
  eis(kaartTop - heldEind < 844 * 2, `homepage: kaart staat te ver weg (${Math.round(kaartTop - heldEind)} px na de opening)`);
  eis(await page.locator('.buurt a.kerkenkaart-punt').first().isVisible(), 'homepage: kaartpunten niet zichtbaar');
  eis((await page.locator('details .bijbeltekst').count()) === 0, 'homepage: tekst zit in een uitklapper');
  await ctx.close();
});

await scenario('Kerkkaartjes: één samenvatting per kerk, klik leidt naar de eigen kerkpagina met alle diensten (mobiel en desktop)', async () => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
    const { ctx, page } = await nieuwePagina({ viewport });
    // homepage: de kaart staat er, met per kerk een nummer, de naam en de vaste zondagsdiensten
    await page.goto(BASIS + '/', { waitUntil: 'networkidle' });
    const legenda = page.locator('.buurt .kerkenkaart-legenda a[href="/kerken/sionkerk/"]');
    eis(await legenda.isVisible(), 'homepage: Sionkerk staat niet bij de kaart');
    eis((await legenda.textContent()).replace(/\s+/g, ' ').includes('Zondag 09.30 en 16.15 uur'), `homepage Sionkerk: ${await legenda.textContent()}`);
    // niets dubbel: geen tweede kerkenlijst en geen details op de homepage
    eis((await page.locator('.buurt .kerkkaart').count()) === 0, 'homepage toont naast de kaart nog een kerkenlijst');
    eis((await page.locator('.kerk-feiten').count()) === 0, 'homepage toont kerkdetails');
    // klikken op het punt op de kaart leidt naar de juiste kerk
    const punt = page.locator('.buurt a.kerkenkaart-punt[href="/kerken/sionkerk/"]');
    await punt.scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    await punt.click();
    await page.waitForURL('**/kerken/sionkerk/');
    eis((await page.locator('h1').textContent()).trim() === 'Sionkerk', 'kerkpagina heeft niet de juiste kop');
    const vast = page.locator('.kerk-dienstgroep--regulier .kerk-tijden li');
    eis((await vast.count()) === 2, `Sionkerk: verwacht 2 vaste diensten, zie ${await vast.count()}`);
    const regels = (await vast.allTextContents()).map((t) => t.replace(/\s+/g, ' ').trim());
    eis(regels[0].startsWith('Zondag 09.30 uur Morgendienst'), `Sionkerk morgendienst: ${regels[0]}`);
    eis(regels[1].startsWith('Zondag 16.15 uur Middagdienst'), `Sionkerk middagdienst: ${regels[1]}`);
    for (const li of await vast.all()) eis(await li.locator('.kerk-tijd').isVisible(), 'diensttijd niet zichtbaar');
    eis(await page.locator('.kerk-rooster a').isVisible(), 'Sionkerk: verwijzing naar de actuele agenda ontbreekt');
    eis(await page.getByRole('link', { name: /Alle kerken/ }).isVisible(), 'geen weg terug naar het overzicht');
    // overzicht: kaart zonder dubbele namenlijst; elk kaartje draagt hetzelfde nummer als de kaart; de hele kaart is klikbaar
    await page.goto(BASIS + '/kerken/', { waitUntil: 'networkidle' });
    eis((await page.locator('.kerkenkaart-legenda').count()) === 0, 'overzicht toont de namen dubbel (lijst bij de kaart én kaartjes)');
    const nrKaart = (await page.locator('a.kerkenkaart-punt[href="/kerken/sionkerk/"] text').textContent()).trim();
    const kaartje = page.locator('[data-kerkenlijst] .kerkkaart[data-kerk="sionkerk"]');
    eis((await kaartje.locator('.kerkkaart-nr').textContent()).trim() === nrKaart, 'nummer op het kaartje wijkt af van de kaart');
    await kaartje.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    const vak = await kaartje.boundingBox();
    await page.mouse.click(vak.x + vak.width / 2, vak.y + vak.height - 12);
    await page.waitForURL('**/kerken/sionkerk/');
    // oude ankers (/kerken/#id) werken nog
    await page.goto(BASIS + '/kerken/#opstandingskerk', { waitUntil: 'networkidle' });
    eis((await page.locator('#opstandingskerk').count()) === 1, 'oud anker /kerken/#opstandingskerk werkt niet meer');
    eis((await page.locator('.kerk-feiten').count()) === 0, 'overzicht toont kerkdetails');
    await page.goto(BASIS + '/kerken/opstandingskerk/', { waitUntil: 'networkidle' });
    eis((await page.locator('.kerk-dienstgroep--bijzonder li').count()) >= 1, 'Opstandingskerk: maandelijkse vieringen niet apart getoond');
    await ctx.close();
  }
});

await scenario('Verwijzing naar Bijbelreis en Raadkoord onderaan elke pagina', async () => {
  const { ctx, page } = await nieuwePagina({ viewport: { width: 390, height: 844 } });
  for (const pad of ['/', '/kerken/', '/privacy/']) {
    await page.goto(BASIS + pad, { waitUntil: 'domcontentloaded' });
    const blok = page.locator('footer .voet-verwant');
    for (const [naam, url] of [['Bijbelreis', 'https://bijbelreis.nl/'], ['Raadkoord', 'https://raadkoord.nl/']]) {
      const a = blok.getByRole('link', { name: naam, exact: true });
      eis((await a.count()) === 1, `${pad}: link naar ${naam} ontbreekt`);
      eis((await a.getAttribute('href')) === url, `${pad}: ${naam} wijst naar ${await a.getAttribute('href')}`);
    }
  }
  await ctx.close();
});

await scenario('Eerlijke volgorde: de kerkenlijst wordt geschud (niet altijd dezelfde eerste kerk)', async () => {
  const eersten = new Set();
  for (let i = 0; i < 12 && eersten.size < 2; i++) {
    const { ctx, page } = await nieuwePagina();
    await page.goto(BASIS + '/kerken/', { waitUntil: 'domcontentloaded' });
    eersten.add(await page.locator('[data-kerkenlijst] .kerkkaart').first().getAttribute('id'));
    await ctx.close();
  }
  eis(eersten.size >= 2, 'altijd dezelfde kerk bovenaan');
});

await scenario('Komende zondag in je agenda: .ics-bestand met juiste dag en tijd', async () => {
  const { ctx, page } = await nieuwePagina({ acceptDownloads: true });
  await page.goto(BASIS + '/kerken/sionkerk/', { waitUntil: 'networkidle' });
  const knop = page.locator('[data-agenda]').first();
  const [download] = await Promise.all([page.waitForEvent('download'), knop.click()]);
  const tekst = await readFile(await download.path(), 'utf8');
  eis(/BEGIN:VEVENT/.test(tekst) && /SUMMARY:Kerkdienst · Sionkerk/.test(tekst), 'ics-inhoud');
  const m = tekst.match(/DTSTART:(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/);
  eis(m && m[4] === '09' && m[5] === '30', 'tijd niet 09:30');
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  eis(d.getDay() === 0, 'niet op een zondag');
  eis(d > new Date(), 'datum ligt in het verleden');
  eis(download.suggestedFilename().endsWith('.ics'), 'bestandsnaam');
  await ctx.close();
});

await scenario('Contact loopt via de kerk en de site toont geen formulier', async () => {
  const { ctx, page } = await nieuwePagina({ ...devices['iPhone 13'] });
  await page.goto(BASIS + '/samen-naar-de-kerk/', { waitUntil: 'networkidle' });
  eis((await page.locator('[data-contactformulier]').count()) === 0, 'contactformulier zichtbaar');
  await page.getByRole('link', { name: 'Naar de kerken en hun contactgegevens' }).click();
  await page.waitForURL('**/kerken/');
  await ctx.close();
});

await scenario('Bijzondere vieringen hebben een plek, tijd en officiële aankondiging', async () => {
  const { ctx, page } = await nieuwePagina({ viewport: { width: 390, height: 844 } });
  await page.goto(BASIS + '/', { waitUntil: 'networkidle' });
  const link = page.locator('main a[href="/activiteiten/#groep-vieringen"]');
  if (await link.count()) {
    await link.click();
    const groep = page.locator('section[aria-labelledby="groep-vieringen"]');
    for (const kaart of await groep.locator('article').all()) {
      eis((await kaart.locator('.act-meta span').count()) === 2, 'tijd of locatie ontbreekt');
      eis((await kaart.locator('time').getAttribute('datetime')).includes('T'), 'machineleesbare tijd ontbreekt');
      eis((await kaart.getByRole('link').getAttribute('href')).startsWith('https://'), 'officiële aankondiging ontbreekt');
    }
  }
  await ctx.close();
});

await scenario('Zonder JavaScript: alle inhoud, menu en uitklappers bruikbaar', async () => {
  const { ctx, page } = await nieuwePagina({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  await page.goto(BASIS + '/', { waitUntil: 'networkidle' });
  eis(await page.locator('#hoofdmenu').isVisible(), 'menu niet zichtbaar zonder JavaScript');
  eis(await page.locator('#hoofdmenu a[href="/kerken/"]').isVisible(), 'menu-links niet zichtbaar');
  eis(await page.getByText('Je mag gewoon komen.').isVisible(), 'onthul-inhoud verborgen zonder JS');
  await page.locator('#gevoel-moe summary').click();
  eis(await page.locator('#gevoel-moe').evaluate((d) => d.open), 'details werkt niet');
  // zondagochtend: gewone lijst met alle stappen, uitklappers werken, keuzes (die JS nodig hebben) verborgen
  eis((await page.locator('.ochtend-stap').count()) === 6, 'zondagochtend: niet alle stappen');
  for (const st of await page.locator('.ochtend-kop').all()) eis(await st.isVisible(), 'zondagochtend: stap niet zichtbaar zonder JS');
  eis(!(await page.locator('[data-ochtend-keuzes]').isVisible()), 'zondagochtend: keuzes zichtbaar zonder JS');
  eis(!(await page.locator('[data-ochtend-scene]').isVisible()), 'zondagochtend: tekening zonder JS zichtbaar');
  await page.locator('#ochtend-zingen summary').click();
  eis(await page.locator('#ochtend-zingen .ochtend-meer-inhoud').isVisible(), 'zondagochtend: uitklapper werkt niet zonder JS');
  await ctx.close();
});

await scenario('Minder beweging: woorden wisselen niet, merk en inhoud direct zichtbaar', async () => {
  const { ctx, page } = await nieuwePagina({ reducedMotion: 'reduce' });
  await page.goto(BASIS + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(150);
  const w1 = await page.locator('.wissel').textContent();
  await page.waitForTimeout(5000);
  eis(w1 === (await page.locator('.wissel').textContent()), 'woord wisselt ondanks minder beweging');
  eis(!(await page.locator('[data-pauze]').isVisible()), 'pauzeknop overbodig bij minder beweging');
  eis(await page.locator('.held-merk-svg').isVisible(), 'merk niet zichtbaar');
  const o = await page.locator('.niets-lijst li').first().evaluate((el) => getComputedStyle(el).opacity);
  eis(o === '1', `inhoud niet direct zichtbaar (opacity ${o})`);
  await ctx.close();
});

await scenario('Privacy: geen cookies, geen opslag, geen verzoeken naar andere domeinen', async () => {
  const { ctx, page } = await nieuwePagina();
  const hosts = new Set();
  page.on('request', (r) => hosts.add(new URL(r.url()).host));
  for (const pad of ['/', '/kerken/', '/samen-naar-de-kerk/', '/activiteiten/']) {
    await page.goto(BASIS + pad, { waitUntil: 'networkidle' });
  }
  await page.goto(BASIS + '/', { waitUntil: 'networkidle' });
  await page.locator('#gevoel-moe summary').click();
  const cookies = await ctx.cookies();
  eis(cookies.length === 0, `cookies: ${cookies.map((c) => c.name)}`);
  const opslag = await page.evaluate(() => localStorage.length + sessionStorage.length);
  eis(opslag === 0, 'web storage gebruikt');
  const eigen = new URL(BASIS).host;
  eis([...hosts].every((h) => h === eigen), `externe hosts: ${[...hosts].filter((h) => h !== eigen)}`);
  await ctx.close();
});

// ---------- 3. Schermafbeeldingen voor visuele beoordeling ----------
console.log('\nSchermafbeeldingen');
await scenario('Volledige pagina’s op telefoon (390) en desktop (1440) vastgelegd', async () => {
  for (const [naam, opties] of [['mobiel', { viewport: { width: 390, height: 844 } }], ['desktop', { viewport: { width: 1440, height: 900 } }]]) {
    const { ctx, page } = await nieuwePagina(opties);
    for (const pad of PAGINAS.slice(0, 10)) {
      await page.goto(BASIS + pad, { waitUntil: 'networkidle' });
      await alleOnthullen(page);
      await page.waitForTimeout(2200);
      const bestand = `${naam}-${pad.replace(/\//g, '') || 'home'}.png`;
      await page.screenshot({ path: path.join(UIT, bestand), fullPage: true });
    }
    await ctx.close();
  }
});

await browser.close();
server.close();

console.log(`\n${geslaagd} geslaagd, ${fouten.length} mislukt.`);
if (fouten.length) {
  console.log(`\nMislukt:\n- ${fouten.join('\n- ')}`);
  process.exit(1);
}
