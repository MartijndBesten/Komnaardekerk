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
import { icoonSvg } from '../src/lib/logo.mjs';
import * as home from '../src/pages/home.mjs';
import * as waarom from '../src/pages/waarom.mjs';
import * as voorHetEerst from '../src/pages/voor-het-eerst.mjs';
import * as kerkenPagina from '../src/pages/kerken.mjs';
import * as ontdek from '../src/pages/ontdek.mjs';
import * as activiteiten from '../src/pages/activiteiten.mjs';
import * as samen from '../src/pages/samen.mjs';
import * as overOns from '../src/pages/over-ons.mjs';
import * as privacy from '../src/pages/privacy.mjs';
import * as ontwerp from '../src/pages/ontwerp.mjs';
import { bedankt, nietGelukt, nietGevonden } from '../src/pages/extra.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const args = new Set(process.argv.slice(2));
const CHECK = args.has('--check');
const PRODUCTIE = args.has('--productie');

const PAGINAS = [home, waarom, voorHetEerst, kerkenPagina, ontdek, activiteiten, samen, overOns, privacy, ontwerp, bedankt, nietGelukt, nietGevonden];

// Officiële Denckh-signatuur (byte-identiek aan MartijndBesten/denckh public/brand, regel DENCKH_MERKVERMELDING.md, B61).
const DENCKH_HASH = {
  'merk/denckh/denckh-logo-signature.svg': 'b8322458ef7f5b654da730d3c8cd02428eaa5e469e6aedd73479136a7eb1712f',
  'merk/denckh/denckh-logo-signature-light.svg': '20bbb812a15920f38e15fcec68aad74de930197b33ae33a22fd7557ac4c09b97'
};
const STATUSSEN = new Set(['kandidaat', 'belangstelling', 'deelnemer']);
const TRADITIES = new Set(['rooms-katholiek', 'protestants', 'reformatorisch', 'evangelisch', 'anders']);
const GROEPEN = new Set(['geloof', 'ontmoeten', 'gezin', 'stilte', 'jongeren']);
const MAX_LEEFTIJD_DAGEN = 90; // productie: gegevens mogen niet ouder zijn

const KENMERKEN = new Set(['kinderen', 'oppas', 'middag', 'online']);
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
const ISO = /^\d{4}-\d{2}-\d{2}$/;
function dagenOud(iso, nu = new Date()) {
  return Math.floor((nu - new Date(iso + 'T12:00:00Z')) / 86400000);
}

function controleerInhoud({ site, kerken, woorden, vragen, initiatieven, fotos, geloofsbasis }, fouten) {
  if (!['concept', 'productie'].includes(site.modus)) fouten.push(`site.modus moet 'concept' of 'productie' zijn, niet '${site.modus}'`);
  if (!['uit', 'voorbeeld', 'aan'].includes(site.contact?.status)) fouten.push('site.contact.status moet uit, voorbeeld of aan zijn');
  const ids = new Set();
  for (const k of kerken.kerken) {
    const w = `kerk '${k.id}'`;
    if (!/^[a-z0-9-]+$/.test(k.id || '')) fouten.push(`${w}: id alleen kleine letters, cijfers en streepjes`);
    if (ids.has(k.id)) fouten.push(`${w}: dubbel id`);
    ids.add(k.id);
    for (const veld of ['naam', 'plaats', 'website', 'traditie']) if (!k[veld]) fouten.push(`${w}: ${veld} ontbreekt`);
    if (k.traditie && !TRADITIES.has(k.traditie)) fouten.push(`${w}: onbekende traditie '${k.traditie}'`);
    for (const m of k.kenmerken || []) if (!KENMERKEN.has(m)) fouten.push(`${w}: onbekend kenmerk '${m}'`);
    for (const d of k.diensten || []) {
      if (!DAGEN.has(d.dag)) fouten.push(`${w}: onbekende dag '${d.dag}'`);
      if (d.tijd && !/^([01]\d|2[0-3]):[0-5]\d$/.test(d.tijd)) fouten.push(`${w}: tijd '${d.tijd}' moet uu:mm zijn`);
      if (!['regulier', 'wisselend', 'bijzonder'].includes(d.soort)) fouten.push(`${w}: dienst zonder soort (regulier, wisselend of bijzonder)`);
      if (!d.naam) fouten.push(`${w}: dienst zonder naam`);
      if (d.soort === 'regulier' && !d.tijd && !d.toelichting) fouten.push(`${w}: een reguliere dienst zonder tijd heeft een toelichting nodig`);
      if ('omschrijving' in d || 'agenda' in d) fouten.push(`${w}: gebruik naam/toelichting/soort in plaats van omschrijving/agenda`);
    }
    const dubbel = (k.diensten || []).map((d) => `${d.dag} ${d.tijd} ${d.soort}`).filter((x, i, a) => a.indexOf(x) !== i);
    if (dubbel.length) fouten.push(`${w}: dubbele dienst (${dubbel[0]})`);
    if (k.rooster && !/^https:\/\//.test(k.rooster.url || '')) fouten.push(`${w}: rooster.url moet met https:// beginnen`);
    if (k.website && !/^https:\/\//.test(k.website)) fouten.push(`${w}: website moet met https:// beginnen`);
    if (!STATUSSEN.has(k.deelname?.status)) fouten.push(`${w}: deelname.status moet kandidaat, belangstelling of deelnemer zijn`);
    if (k.deelname?.status !== 'deelnemer' && /\bpartner\b/i.test(JSON.stringify(k))) fouten.push(`${w}: 'partner' zonder deelname`);
    if (!ISO.test(k.gecontroleerd || '')) fouten.push(`${w}: gecontroleerd moet een datum (JJJJ-MM-DD) zijn`);
    if (!k.bronnen?.length) fouten.push(`${w}: geen bronnen`);
    if (k.foto && !fotos[k.foto]) fouten.push(`${w}: onbekende foto '${k.foto}'`);
    for (const c of k.contactpersonen || []) if (!c.toestemming) fouten.push(`${w}: contactpersoon zonder toestemming`);
    if (/voorbeeld(kerk|tijd)/i.test(JSON.stringify(k))) fouten.push(`${w}: bevat nog voorbeeldinhoud`);
  }
  for (const i of initiatieven.initiatieven) {
    const w = `initiatief '${i.id}'`;
    if (i.groep && !GROEPEN.has(i.groep)) fouten.push(`${w}: onbekende groep '${i.groep}'`);
    if (i.groep && (!i.bron || !ISO.test(i.gecontroleerd || ''))) fouten.push(`${w}: bron en controledatum verplicht`);
    for (const o of i.organisatoren || []) if (i.groep && !ids.has(o)) fouten.push(`${w}: organisator '${o}' staat niet in kerken.json`);
  }
  for (const [sleutel, f] of Object.entries(fotos)) {
    if (sleutel.startsWith('_')) continue;
    for (const veld of ['src', 'alt', 'credit', 'licentie', 'bron', 'w', 'h']) if (!f[veld]) fouten.push(`foto '${sleutel}': ${veld} ontbreekt`);
  }
  if (!geloofsbasis.artikelen?.length) fouten.push('geloofsbasis zonder artikelen');
  if (!(woorden.woorden?.length >= 6)) fouten.push('woorden.json: minstens zes woorden');
  for (const w of woorden.woorden || []) {
    for (const veld of ['id', 'woord', 'herkenning', 'hoop', 'bijbel', 'code', 'kerk']) if (!w[veld]) fouten.push(`woord '${w.id || '?'}': ${veld} ontbreekt`);
    if (w.bijbel && !/^vrij naar /.test(w.bijbel)) fouten.push(`woord '${w.id}': Bijbeltekst moet 'vrij naar …' zijn zolang het NBG geen toestemming gaf (V-003)`);
  }
  if (!woorden.woorden.some((w) => w.wissel)) fouten.push('woorden.json: geen woorden gemarkeerd voor de wisseling (wissel: true)');
  for (const v of vragen.vragen) if (!v.vraag || !v.antwoord?.length) fouten.push(`vraag zonder tekst of antwoord: ${v.vraag}`);
}

// Productie toont alleen deelnemers met toestemming, en weigert verouderde of onbevestigde inhoud.
function publicatiepoort({ site, kerken, initiatieven, fotos, geloofsbasis }, fouten) {
  if (site.modus !== 'productie') fouten.push("site.modus staat nog op 'concept'");
  const deelnemers = kerken.kerken.filter((k) => k.deelname?.status === 'deelnemer' && k.deelname?.toestemmingPublicatie);
  if (!deelnemers.length) fouten.push('geen enkele deelnemende kerk met toestemming voor publicatie');
  for (const k of deelnemers) if (dagenOud(k.gecontroleerd) > MAX_LEEFTIJD_DAGEN) fouten.push(`kerk '${k.id}': gegevens ouder dan ${MAX_LEEFTIJD_DAGEN} dagen`);
  for (const i of initiatieven.initiatieven.filter((x) => x.groep && x.actueel)) {
    if (dagenOud(i.gecontroleerd) > 60) fouten.push(`initiatief '${i.id}': gegevens ouder dan 60 dagen`);
  }
  if (!site.bijbel.gecontroleerd) fouten.push('Bijbeltekst en citeerrechten nog niet gecontroleerd (bijbel.gecontroleerd)');
  if (geloofsbasis.status !== 'vastgesteld') fouten.push("gezamenlijke geloofsbasis is nog een concept (geloofsbasis.status)");
  if (site.contact.status === 'voorbeeld') fouten.push("contactformulier staat op 'voorbeeld': zet op 'aan' (opvolging geregeld) of 'uit'");
  if (!site.verwerkingsverantwoordelijke) fouten.push('verwerkingsverantwoordelijke voor de privacyverklaring ontbreekt');
  if (!site.contact.emailInitiatief) fouten.push('contactadres van het initiatief ontbreekt');
  for (const [s, f] of Object.entries(fotos)) if (!s.startsWith('_') && f.conceptbeeld) fouten.push(`foto '${s}' is een conceptbeeld`);
}

// Wat de productieversie mag tonen: alleen deelnemers met toestemming en hun activiteiten.
function publiekeSelectie(content) {
  if (content.site.modus !== 'productie') return content;
  const ok = (k) => k.deelname?.status === 'deelnemer' && k.deelname?.toestemmingPublicatie;
  const kerken = content.kerken.kerken.filter(ok);
  const ids = new Set(kerken.map((k) => k.id));
  return {
    ...content,
    kerken: { ...content.kerken, kerken, teVerifieren: [] },
    initiatieven: { ...content.initiatieven, initiatieven: content.initiatieven.initiatieven.filter((i) => (i.organisatoren || []).every((o) => ids.has(o))) }
  };
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
  // afbeeldingen (src en srcset) moeten bestaan
  for (const f of paginas) {
    const h = bestanden[f].toString('utf8');
    for (const m of h.matchAll(/<img\b[^>]*>/gi)) {
      const a = attrs(m[0]);
      const bronnen = [a.src, ...(a.srcset || '').split(',').map((x) => x.trim().split(/\s+/)[0])].filter(Boolean);
      for (const b of bronnen) if (b.startsWith('/') && !(b.slice(1).split('?')[0] in bestanden)) fouten.push(`${f}: ontbrekende afbeelding ${b}`);
    }
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
  const ruw = {
    site: await json('site.json'),
    kerken: await json('kerken.json'),
    woorden: await json('woorden.json'),
    vragen: await json('vragen.json'),
    initiatieven: await json('initiatieven.json'),
    fotos: await json('fotos.json'),
    geloofsbasis: await json('geloofsbasis.json')
  };
  const fouten = [];
  controleerInhoud(ruw, fouten);
  if (PRODUCTIE) publicatiepoort(ruw, fouten);
  const content = publiekeSelectie(ruw);
  // verrijken: foto-objecten en namen van organisatoren
  const kerkNaam = Object.fromEntries(ruw.kerken.kerken.map((k) => [k.id, k.naam]));
  content.kerken = { ...content.kerken, kerken: content.kerken.kerken.map((k) => ({ ...k, foto: k.foto ? content.fotos[k.foto] : null })) };
  content.initiatieven = {
    ...content.initiatieven,
    initiatieven: content.initiatieven.initiatieven.map((i) => ({ ...i, organisatorNaam: (i.organisatoren || []).map((o) => kerkNaam[o] || o).join(' en ') }))
  };

  const bestanden = {};
  const statisch = path.join(ROOT, 'src', 'static');
  for (const rel of await lijstBestanden(statisch)) bestanden[rel] = await readFile(path.join(statisch, rel));
  bestanden['favicon.svg'] = Buffer.from(icoonSvg({ concept: 'A' }));
  for (const [rel, hash] of Object.entries(DENCKH_HASH)) {
    if (!bestanden[rel] || createHash('sha256').update(bestanden[rel]).digest('hex') !== hash) fouten.push(`${rel}: niet byte-identiek aan het officiële Denckh-logo`);
  }

  const versie = { css: sha(bestanden['css/site.css']), js: sha(bestanden['js/site.js']) };
  const concept = content.site.modus !== 'productie';

  const sitemap = [];
  const htmlPaden = [];
  for (const mod of PAGINAS) {
    const pagina = { ...mod.pagina };
    if (pagina.alleenConcept && !concept) continue;
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
