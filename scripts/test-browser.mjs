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
import { maakServer, verzonden } from './serve.mjs';

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

const PAGINAS = ['/', '/voor-het-eerst/', '/kerken/', '/geloof/', '/even-praten/', '/over/', '/privacy/', '/even-praten/bedankt/', '/even-praten/niet-gelukt/'];
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
const serverAan = maakServer({ contactAan: true, bundel });
await new Promise((r) => server.listen(0, r));
await new Promise((r) => serverAan.listen(0, r));
const BASIS = extern || `http://localhost:${server.address().port}`;
const BASIS_AAN = `http://localhost:${serverAan.address().port}`;

const browser = await chromium.launch();

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
    eis((await page.locator('h1').count()) === 1, 'niet precies één h1');
    const csp = resp.headers()['content-security-policy'] || '';
    eis(extern || csp.includes("script-src 'self'"), 'CSP-header ontbreekt');
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
  for (const naam of ['Ik wil eens komen kijken', 'Wat kan ik verwachten?']) {
    const knop = page.getByRole('link', { name: naam });
    const box = await knop.boundingBox();
    eis(box && box.y + box.height <= 844 + 20, `'${naam}' niet in beeld zonder scrollen (y=${box?.y})`);
    eis(box.height >= 44, `'${naam}' te klein om te tikken (${box.height}px)`);
  }
  await page.screenshot({ path: path.join(UIT, 'mobiel-eerste-scherm.png') });
  await ctx.close();
});

await scenario('Moeder die uitgeput is (mobiel): kiest "Ik ben moe", leest, wisselt naar "alleen", gaat naar samen gaan', async () => {
  const { ctx, page } = await nieuwePagina({ ...devices['Pixel 7'] });
  await page.goto(BASIS + '/', { waitUntil: 'networkidle' });
  const moe = page.locator('#gevoel-moe');
  await moe.locator('summary').click();
  eis(await moe.evaluate((d) => d.open), 'moe niet open');
  eis(await moe.getByText('Een kerkdienst is een uur waarin niemand iets van je vraagt.').isVisible(), 'tekst niet zichtbaar');
  const alleen = page.locator('#gevoel-alleen');
  await alleen.locator('summary').click();
  eis(await alleen.evaluate((d) => d.open), 'alleen niet open');
  eis(!(await moe.evaluate((d) => d.open)), 'vorige keuze bleef open (niet exclusief)');
  await page.screenshot({ path: path.join(UIT, 'mobiel-keuze-alleen.png') });
  await alleen.getByRole('link', { name: /Ga samen/ }).click();
  await page.waitForURL(/\/even-praten\/#samen$/);
  eis(await page.getByRole('heading', { name: 'Samen gaan' }).isVisible(), 'kop samen gaan niet zichtbaar');
  eis(page._fouten.length === 0, page._fouten.join('\n'));
  await ctx.close();
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
  await page.locator('#gevoel-rust summary').focus();
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
  eis(outline !== 'none', 'geen zichtbare focus');
  await page.keyboard.press('Enter');
  eis(await page.locator('#gevoel-rust').evaluate((d) => d.open), 'Enter opent keuze niet');
  await page.keyboard.press('Space');
  eis(!(await page.locator('#gevoel-rust').evaluate((d) => d.open)), 'spatie sluit keuze niet');
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
  for (const pad of ['/', '/kerken/', '/even-praten/']) {
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

await scenario('Kerk zoeken: filters tonen alleen passende kerken, met melding en lege toestand', async () => {
  const { ctx, page } = await nieuwePagina({ ...devices['iPhone 13'] });
  await page.goto(BASIS + '/kerken/', { waitUntil: 'networkidle' });
  const zichtbaar = () => page.locator('.kerk:visible').count();
  const totaal = await zichtbaar();
  eis(totaal >= 2, `te weinig kerken (${totaal})`);
  const band = page.getByRole('button', { name: 'Band en nieuwe liederen' });
  await band.click();
  eis((await band.getAttribute('aria-pressed')) === 'true', 'aria-pressed');
  const metBand = await zichtbaar();
  const verwacht = await page.locator('.kerk[data-kenmerken~="band"]').count();
  eis(metBand === verwacht && metBand < totaal, `band: ${metBand} zichtbaar, verwacht ${verwacht}`);
  eis((await page.locator('[data-filter-uitkomst]').textContent()).includes(String(metBand)), 'statusmelding klopt niet');
  await page.getByRole('button', { name: 'Stilte en vaste gebeden' }).click();
  eis((await zichtbaar()) === 0, 'combinatie zou leeg moeten zijn');
  eis(await page.locator('[data-geen-resultaat]').isVisible(), 'lege toestand niet zichtbaar');
  await page.screenshot({ path: path.join(UIT, 'mobiel-kerken-leeg.png') });
  await page.getByRole('button', { name: 'Stilte en vaste gebeden' }).click();
  await band.click();
  eis((await zichtbaar()) === totaal, 'filters terugzetten herstelt niet alle kerken');
  await ctx.close();
});

await scenario('Eerlijke volgorde: de kerkenlijst wordt geschud (niet altijd dezelfde eerste kerk)', async () => {
  const eersten = new Set();
  for (let i = 0; i < 12 && eersten.size < 2; i++) {
    const { ctx, page } = await nieuwePagina();
    await page.goto(BASIS + '/kerken/', { waitUntil: 'domcontentloaded' });
    eersten.add(await page.locator('.kerk').first().getAttribute('id'));
    await ctx.close();
  }
  eis(eersten.size >= 2, 'altijd dezelfde kerk bovenaan');
});

await scenario('Komende zondag in je agenda: .ics-bestand met juiste dag en tijd', async () => {
  const { ctx, page } = await nieuwePagina({ acceptDownloads: true });
  await page.goto(BASIS + '/kerken/', { waitUntil: 'networkidle' });
  const knop = page.locator('.kerk#voorbeeld-a [data-agenda]').first();
  const [download] = await Promise.all([page.waitForEvent('download'), knop.click()]);
  const tekst = await readFile(await download.path(), 'utf8');
  eis(/BEGIN:VEVENT/.test(tekst) && /SUMMARY:Kerkdienst · Voorbeeldkerk A/.test(tekst), 'ics-inhoud');
  const m = tekst.match(/DTSTART:(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/);
  eis(m && m[4] === '10' && m[5] === '00', 'tijd niet 10:00');
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  eis(d.getDay() === 0, 'niet op een zondag');
  eis(d > new Date(), 'datum ligt in het verleden');
  eis(download.suggestedFilename().endsWith('.ics'), 'bestandsnaam');
  await ctx.close();
});

await scenario('Formulier (voorbeeldmodus): fouten tonen, herstellen en een eerlijke bevestiging dat er niets is verstuurd', async () => {
  const { ctx, page } = await nieuwePagina({ ...devices['iPhone 13'] });
  await page.goto(BASIS + '/even-praten/?kerk=voorbeeld-b', { waitUntil: 'networkidle' });
  eis((await page.locator('#kerk').inputValue()) === 'voorbeeld-b', 'kerk uit de link niet voorgeselecteerd');
  await page.getByRole('button', { name: 'Verstuur' }).click();
  const overzicht = page.locator('[data-foutoverzicht]');
  eis(await overzicht.isVisible(), 'geen foutoverzicht');
  eis(await page.evaluate(() => document.activeElement.hasAttribute('data-foutoverzicht')), 'focus niet op foutoverzicht');
  eis((await page.locator('#voornaam').getAttribute('aria-invalid')) === 'true', 'voornaam niet als fout gemarkeerd');
  await page.screenshot({ path: path.join(UIT, 'mobiel-formulier-fouten.png'), fullPage: false });
  await page.getByLabel('Je voornaam').fill('Sanne');
  await page.getByLabel('E-mailadres').fill('sanne@');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Verstuur' }).click();
  eis((await page.locator('#bereik-fout').textContent()).includes('lijkt niet te kloppen'), 'e-mailfout niet gemeld');
  await page.getByLabel('E-mailadres').fill('');
  await page.getByLabel('Telefoonnummer').fill('06 12345678');
  await page.getByRole('button', { name: 'Verstuur' }).click();
  const bedankt = page.locator('[data-bedankt]');
  eis(await bedankt.isVisible(), 'geen bevestiging');
  eis((await bedankt.textContent()).includes('er is niets verstuurd'), 'bevestiging zegt niet eerlijk dat er niets is verstuurd');
  eis((await bedankt.textContent()).includes('Sanne'), 'naam niet in bevestiging');
  await page.screenshot({ path: path.join(UIT, 'mobiel-formulier-bedankt.png') });
  eis(page._fouten.length === 0, page._fouten.join('\n'));
  await ctx.close();
});

if (!extern) {
  await scenario('Formulier (aan): verzoek komt aan als precies één mail, zonder dubbel versturen', async () => {
    verzonden.length = 0;
    const { ctx, page } = await nieuwePagina({ viewport: { width: 1280, height: 900 } });
    await page.goto(BASIS_AAN + '/even-praten/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.querySelector('[data-contactformulier]').setAttribute('data-status', 'aan'));
    await page.getByLabel('Ik wil graag een keer praten').check();
    await page.getByLabel('Je voornaam').fill('Kees');
    await page.getByLabel('Telefoonnummer').fill('030 1234567');
    await page.getByRole('checkbox').check();
    await page.waitForTimeout(3200); // minimale invultijd
    const knop = page.getByRole('button', { name: 'Verstuur' });
    await knop.click();
    await knop.click({ timeout: 500 }).catch(() => {}); // dubbelklik
    await page.locator('[data-bedankt]').waitFor({ state: 'visible' });
    eis(verzonden.length === 1, `${verzonden.length} mails verstuurd`);
    eis(verzonden[0].raw.includes('Content-Type: text/plain; charset=UTF-8'), 'mailopbouw');
    await ctx.close();
  });

  await scenario('Formulier zonder JavaScript: gewone verzending eindigt op een bedankpagina', async () => {
    verzonden.length = 0;
    const { ctx, page } = await nieuwePagina({ javaScriptEnabled: false });
    await page.goto(BASIS_AAN + '/even-praten/', { waitUntil: 'networkidle' });
    await page.getByLabel('Je voornaam').fill('Wim');
    await page.getByLabel('E-mailadres').fill('wim@test.invalid');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Verstuur' }).click();
    await page.waitForURL(/\/even-praten\/bedankt\/$/);
    eis(verzonden.length === 1, `${verzonden.length} mails`);
    await ctx.close();
  });

  await scenario('Formulier uit (serverkant): verzending wordt geweigerd en de bezoeker krijgt een nette foutmelding', async () => {
    const { ctx, page } = await nieuwePagina();
    await page.goto(BASIS + '/even-praten/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.querySelector('[data-contactformulier]').setAttribute('data-status', 'aan'));
    await page.getByLabel('Je voornaam').fill('Test');
    await page.getByLabel('E-mailadres').fill('test@test.invalid');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Verstuur' }).click();
    await page.locator('[data-foutoverzicht]').waitFor({ state: 'visible' });
    eis((await page.locator('[data-foutoverzicht]').textContent()).includes('nog niet actief'), 'melding');
    eis(await page.getByRole('button', { name: 'Verstuur' }).isEnabled(), 'knop blijft uitgeschakeld');
    await ctx.close();
  });
}

await scenario('Zonder JavaScript: alle inhoud, menu en uitklappers bruikbaar', async () => {
  const { ctx, page } = await nieuwePagina({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  await page.goto(BASIS + '/', { waitUntil: 'networkidle' });
  eis(await page.getByRole('link', { name: 'Kerken in Houten' }).first().isVisible(), 'menu-links niet zichtbaar');
  eis(await page.getByText('Je mag gewoon').isVisible(), 'onthul-inhoud verborgen zonder JS');
  await page.locator('#gevoel-moe summary').click();
  eis(await page.locator('#gevoel-moe').evaluate((d) => d.open), 'details werkt niet');
  await ctx.close();
});

await scenario('Minder beweging: deur staat direct open, inhoud direct zichtbaar', async () => {
  const { ctx, page } = await nieuwePagina({ reducedMotion: 'reduce' });
  await page.goto(BASIS + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(150);
  const t = await page.locator('.deur-blad').evaluate((el) => getComputedStyle(el).transform);
  eis(t !== 'none' && !t.startsWith('matrix(1, 0, 0, 1'), `deur niet open: ${t}`);
  const o = await page.locator('.niets-lijst li').first().evaluate((el) => getComputedStyle(el).opacity);
  eis(o === '1', `inhoud niet direct zichtbaar (opacity ${o})`);
  await ctx.close();
});

await scenario('Privacy: geen cookies, geen opslag, geen verzoeken naar andere domeinen', async () => {
  const { ctx, page } = await nieuwePagina();
  const hosts = new Set();
  page.on('request', (r) => hosts.add(new URL(r.url()).host));
  for (const pad of ['/', '/kerken/', '/even-praten/']) {
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
    for (const pad of PAGINAS.slice(0, 7)) {
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
serverAan.close();

console.log(`\n${geslaagd} geslaagd, ${fouten.length} mislukt.`);
if (fouten.length) {
  console.log(`\nMislukt:\n- ${fouten.join('\n- ')}`);
  process.exit(1);
}
