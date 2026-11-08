#!/usr/bin/env node
// Bouwt komnaardekerk.nl: content/ + src/ → dist/. Geen npm-pakketten nodig.
//
//   node scripts/build.mjs              bouwen + controles
//   node scripts/build.mjs --check      bouwen in het geheugen en vergelijken met dist/ (CI/poort)
//   node scripts/build.mjs --productie  extra publicatiepoort: weigert concept- en voorbeeldinhoud
//
// Recept volgens bouwsteen B97 (statische site met publicatiepoort), zelf geschreven.

import { readFile, writeFile, mkdir, readdir, rm, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { layout } from '../src/lib/layout.mjs';
import { render } from '../src/lib/html.mjs';
import { favicon } from '../src/lib/merk.mjs';
import * as home from '../src/pages/home.mjs';
import * as voorHetEerst from '../src/pages/voor-het-eerst.mjs';
import * as kerkenPagina from '../src/pages/kerken.mjs';
import * as geloof from '../src/pages/geloof.mjs';
import * as evenPraten from '../src/pages/even-praten.mjs';
import * as over from '../src/pages/over.mjs';
import * as privacy from '../src/pages/privacy.mjs';
import { bedankt, nietGelukt, nietGevonden } from '../src/pages/extra.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const args = new Set(process.argv.slice(2));
const CHECK = args.has('--check');
const PRODUCTIE = args.has('--productie');

const PAGINAS = [home, voorHetEerst, kerkenPagina, geloof, evenPraten, over, privacy, bedankt, nietGelukt, nietGevonden];

const KENMERKEN = new Set(['kinderen', 'oppas', 'rolstoel', 'ringleiding', 'orgel', 'band', 'stilte', 'middag', 'avond', 'koffie']);
const DAGEN = new Set(['zondag', 'zaterdag', 'vrijdag', 'donderdag', 'woensdag', 'dinsdag', 'maandag']);

// Woorden die nooit live mogen. Hoofdletterongevoelig, op zichtbare tekst en attributen.
const VERBODEN = [/lorem ipsum/i, /\bTODO\b/, /\bFIXME\b/, /\bxxx\b/i, /example\.(com|org)/i, /\bplaceholder\b/i, /undefined/, /\[object Object\]/, /\bNaN\b/];

async function json(naam) {
  return JSON.parse(await readFile(path.join(ROOT, 'content', naam), 'utf8'));
}

function sha(buf, len = 10) {
  return createHash('sha256').update(buf).digest('hex').slice(0, len);
}

async function lijstBestanden(dir, basis = dir) {
  const uit = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) uit.push(...(await lijstBestanden(p, basis)));
    else uit.push(path.relative(basis, p).split(path.sep).join('/'));
  }
  return uit.sort();
}

// ---------- inhoudscontrole ----------
function controleerInhoud({ site, kerken, gevoelens, vragen }, fouten) {
  if (!['concept', 'productie'].includes(site.modus)) fouten.push(`site.modus moet 'concept' of 'productie' zijn, niet '${site.modus}'`);
  if (!['uit', 'voorbeeld', 'aan'].includes(site.contact?.status)) fouten.push('site.contact.status moet uit, voorbeeld of aan zijn');
  const ids = new Set();
  for (const k of kerken.kerken) {
    const w = `kerk '${k.id}'`;
    if (!/^[a-z0-9-]+$/.test(k.id || '')) fouten.push(`${w}: id alleen kleine letters, cijfers en streepjes`);
    if (ids.has(k.id)) fouten.push(`${w}: dubbel id`);
    ids.add(k.id);
    if (!k.naam) fouten.push(`${w}: naam ontbreekt`);
    if (!k.sfeer) fouten.push(`${w}: sfeer ontbreekt`);
    for (const m of k.kenmerken || []) if (!KENMERKEN.has(m)) fouten.push(`${w}: onbekend kenmerk '${m}'`);
    for (const d of k.diensten || []) {
      if (!DAGEN.has(d.dag)) fouten.push(`${w}: onbekende dag '${d.dag}'`);
      if (d.tijd && !/^([01]\d|2[0-3]):[0-5]\d$/.test(d.tijd)) fouten.push(`${w}: tijd '${d.tijd}' moet uu:mm zijn`);
    }
    for (const u of [k.website]) if (u && !/^https:\/\//.test(u)) fouten.push(`${w}: website moet met https:// beginnen`);
    if (k.foto && !k.fotoAlt) fouten.push(`${w}: foto zonder beschrijving (fotoAlt)`);
    if (!k.voorbeeld) {
      const tekst = JSON.stringify(k);
      if (/voorbeeld/i.test(tekst)) fouten.push(`${w}: echte kerk bevat nog het woord 'voorbeeld'`);
      if (!k.adres) fouten.push(`${w}: echte kerk zonder adres`);
    }
  }
  if (gevoelens.keuzes.length !== 6) fouten.push(`er horen 6 keuzes in gevoelens.json te staan (nu ${gevoelens.keuzes.length})`);
  for (const v of vragen.vragen) if (!v.vraag || !v.antwoord?.length) fouten.push(`vraag zonder tekst of antwoord: ${v.vraag}`);
}

function publicatiepoort({ site, kerken }, fouten) {
  if (site.modus !== 'productie') fouten.push("site.modus staat nog op 'concept'");
  const voorbeelden = kerken.kerken.filter((k) => k.voorbeeld);
  if (voorbeelden.length) fouten.push(`nog ${voorbeelden.length} voorbeeldkerk(en) in kerken.json`);
  if (!kerken.kerken.some((k) => !k.voorbeeld)) fouten.push('geen enkele echte, deelnemende kerk');
  if (!site.bijbel.gecontroleerd) fouten.push('Bijbeltekst en citeerrechten nog niet gecontroleerd (bijbel.gecontroleerd)');
  if (site.contact.status === 'voorbeeld') fouten.push("contactformulier staat op 'voorbeeld': zet op 'aan' (opvolging geregeld) of 'uit'");
  if (!site.verwerkingsverantwoordelijke) fouten.push('verwerkingsverantwoordelijke voor de privacyverklaring ontbreekt');
  if (!site.contact.emailInitiatief) fouten.push('contactadres van het initiatief ontbreekt');
}

// ---------- HTML-controle ----------
function attrs(tag) {
  const uit = {};
  for (const m of tag.matchAll(/([a-zA-Z:-]+)(?:="([^"]*)")?/g)) uit[m[1].toLowerCase()] = m[2] ?? '';
  return uit;
}

function controleerHtml(bestanden, fouten) {
  const paginas = Object.keys(bestanden).filter((f) => f.endsWith('.html'));
  const idsPerPagina = {};
  for (const f of paginas) {
    const h = bestanden[f].toString('utf8');
    const ids = [...h.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    const dubbel = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (dubbel.length) fouten.push(`${f}: dubbele id's ${[...new Set(dubbel)].join(', ')}`);
    idsPerPagina[f] = new Set(ids);
    if (/\son[a-z]+=/i.test(h)) fouten.push(`${f}: inline event-handler`);
    if (/\sstyle="/i.test(h)) fouten.push(`${f}: inline style (CSP)`);
    if (/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>/i.test(h)) fouten.push(`${f}: inline script (CSP)`);
    for (const m of h.matchAll(/<(?:script|img|link|iframe|source)\b[^>]*>/gi)) {
      const a = attrs(m[0]);
      const bron = a.src || (a.rel !== 'canonical' ? a.href : '') || '';
      if (/^(https?:)?\/\//.test(bron)) fouten.push(`${f}: externe bron ${bron}`);
    }
    for (const m of h.matchAll(/aria-(?:controls|labelledby|describedby)="([^"]+)"/g)) {
      for (const id of m[1].split(/\s+/)) if (!idsPerPagina[f].has(id)) fouten.push(`${f}: aria-verwijzing naar ontbrekend id '${id}'`);
    }
    for (const m of h.matchAll(/<img\b[^>]*>/gi)) if (!/\salt="/.test(m[0])) fouten.push(`${f}: img zonder alt`);
    const zichtbaar = h.replace(/<script[\s\S]*?<\/script>/gi, '');
    for (const re of VERBODEN) if (re.test(zichtbaar)) fouten.push(`${f}: verboden inhoud ${re}`);
    if (!/<html lang="nl"/.test(h)) fouten.push(`${f}: lang="nl" ontbreekt`);
    if ((h.match(/<h1\b/g) || []).length !== 1) fouten.push(`${f}: moet precies één h1 hebben`);
  }
  // links en ankers
  for (const f of paginas) {
    const h = bestanden[f].toString('utf8');
    for (const m of h.matchAll(/\shref="([^"]+)"/g)) {
      const href = m[1].replace(/&amp;/g, '&');
      if (/^(https?:|mailto:|tel:)/.test(href)) continue;
      if (href.startsWith('#')) {
        if (href.length > 1 && !idsPerPagina[f].has(href.slice(1))) fouten.push(`${f}: dood anker ${href}`);
        continue;
      }
      if (!href.startsWith('/')) { fouten.push(`${f}: relatieve link ${href}`); continue; }
      const [padQ, anker] = href.split('#');
      const pad = padQ.split('?')[0];
      if (/\.html$/.test(pad)) fouten.push(`${f}: link met .html (${href})`);
      let doel = pad.endsWith('/') ? `${pad.slice(1)}index.html` : pad.slice(1);
      if (!(doel in bestanden)) { fouten.push(`${f}: dode link ${href}`); continue; }
      if (anker && doel.endsWith('.html') && !idsPerPagina[doel]?.has(anker)) fouten.push(`${f}: dood anker ${href}`);
    }
  }
}

// ---------- bouwen ----------
async function bouw() {
  const content = {
    site: await json('site.json'),
    kerken: await json('kerken.json'),
    gevoelens: await json('gevoelens.json'),
    vragen: await json('vragen.json')
  };
  const fouten = [];
  controleerInhoud(content, fouten);
  if (PRODUCTIE) publicatiepoort(content, fouten);

  const bestanden = {};
  const statisch = path.join(ROOT, 'src', 'static');
  for (const rel of await lijstBestanden(statisch)) bestanden[rel] = await readFile(path.join(statisch, rel));
  bestanden['favicon.svg'] = Buffer.from(favicon());

  const versie = { css: sha(bestanden['css/site.css']), js: sha(bestanden['js/site.js']) };
  const concept = content.site.modus !== 'productie';

  const sitemap = [];
  const htmlPaden = [];
  for (const mod of PAGINAS) {
    const pagina = { ...mod.pagina };
    const ctx = { ...content, pad: pagina.pad, versie };
    if (mod.jsonld) pagina.jsonld = mod.jsonld(ctx);
    const uit = layout(ctx, pagina, mod.inhoud(ctx));
    const bestand = pagina.bestand || `${pagina.pad.slice(1)}index.html`;
    bestanden[bestand] = Buffer.from(uit);
    htmlPaden.push(pagina.bestand ? `/${pagina.bestand}` : pagina.pad);
    if (pagina.sitemap !== false) sitemap.push(content.site.domein + pagina.pad);
  }

  bestanden['sitemap.xml'] = Buffer.from(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`
  );
  bestanden['robots.txt'] = Buffer.from(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${content.site.domein}/sitemap.xml\n`);
  bestanden['site.webmanifest'] = Buffer.from(
    JSON.stringify(
      {
        name: content.site.naam,
        short_name: content.site.naam,
        lang: 'nl',
        start_url: '/',
        display: 'browser',
        background_color: '#F5EFE4',
        theme_color: '#F5EFE4',
        icons: [
          { src: '/favicon.svg', type: 'image/svg+xml', sizes: 'any' },
          { src: '/merk/apple-touch-icon.png', type: 'image/png', sizes: '180x180' }
        ]
      },
      null,
      2
    ) + '\n'
  );

  const sjabloon = await readFile(path.join(ROOT, 'src', 'headers.txt'), 'utf8');
  // no-transform op HTML: Cloudflare spuit dan geen Web Analytics-beacon of andere scripts in
  // (privacybelofte 'geen tracking'; les uit B97). CSS/JS/fonts blijven gecomprimeerd.
  const htmlRegels = htmlPaden.map((p) => `${p}\n  Cache-Control: no-cache, no-transform\n`).join('\n');
  bestanden['_headers'] = Buffer.from(
    sjabloon
      .replace('{{CONCEPT_NOINDEX}}', concept ? '/*\n  X-Robots-Tag: noindex\n' : '')
      .replace('{{HTML_NO_TRANSFORM}}', htmlRegels)
      .trimEnd() + '\n'
  );

  controleerHtml(bestanden, fouten);
  return { bestanden, fouten, content };
}

async function vergelijk(bestanden) {
  const verschillen = [];
  let bestaand = [];
  try {
    bestaand = await lijstBestanden(DIST);
  } catch {
    return ['dist/ bestaat niet'];
  }
  const nieuw = Object.keys(bestanden).sort();
  for (const f of nieuw) {
    if (!bestaand.includes(f)) { verschillen.push(`ontbreekt in dist/: ${f}`); continue; }
    const oud = await readFile(path.join(DIST, f));
    if (!oud.equals(bestanden[f])) verschillen.push(`verouderd in dist/: ${f}`);
  }
  for (const f of bestaand) if (!nieuw.includes(f)) verschillen.push(`overbodig in dist/: ${f}`);
  return verschillen;
}

const { bestanden, fouten } = await bouw();
if (fouten.length) {
  console.error(`✗ ${fouten.length} controle(s) mislukt:\n  - ${fouten.join('\n  - ')}`);
  process.exit(1);
}
if (CHECK) {
  const verschil = await vergelijk(bestanden);
  if (verschil.length) {
    console.error(`✗ dist/ is niet actueel (draai node scripts/build.mjs):\n  - ${verschil.join('\n  - ')}`);
    process.exit(1);
  }
  console.log(`✓ dist/ is actueel en alle controles zijn geslaagd (${Object.keys(bestanden).length} bestanden)${PRODUCTIE ? ', inclusief publicatiepoort' : ''}.`);
} else {
  await rm(DIST, { recursive: true, force: true });
  for (const [rel, buf] of Object.entries(bestanden)) {
    const doel = path.join(DIST, rel);
    await mkdir(path.dirname(doel), { recursive: true });
    await writeFile(doel, buf);
  }
  let totaal = 0;
  for (const b of Object.values(bestanden)) totaal += b.length;
  console.log(`✓ dist/ gebouwd: ${Object.keys(bestanden).length} bestanden, ${(totaal / 1024).toFixed(0)} kB${PRODUCTIE ? ', publicatiepoort geslaagd' : ''}.`);
}
