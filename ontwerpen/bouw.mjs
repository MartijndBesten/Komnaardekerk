#!/usr/bin/env node
// Ronde 5 (issue #131): drie ontwerpconcepten voor de homepage van 'Kom naar de kerk.'
// Los van de echte site (src/, content/, dist/ en de live preview blijven ongewijzigd).
//
//   node ontwerpen/bouw.mjs && node ontwerpen/serve.mjs 8792   → http://localhost:8792/
//
// Per concept: /a/ (homepage) en /a/<woord>/ (spandoekadres; werkt zonder JavaScript).

import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { merk, logoA, logoB, logoC, PALET } from './merken.mjs';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HIER, '..');
const UIT = path.join(HIER, 'dist');
const json = (p) => JSON.parse(readFileSync(path.join(ROOT, p), 'utf8'));
const W = json('ontwerpen/woorden.json').woorden;
const SITE = json('content/site.json');
const KERKEN = json('content/kerken.json').kerken;
const PREVIEW = SITE.preview;
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const CONCEPT = {
  a: { naam: 'Portaal', sub: 'Licht door echte architectuur', kleur: PALET.A.inkt },
  b: { naam: 'Kruisvenster', sub: 'Een uitnodiging in letters', kleur: PALET.B.inkt },
  c: { naam: 'Ontmoeting', sub: 'Symbool en mensen', kleur: PALET.C.inkt }
};
const FOTO = {
  'toren-staand': { breedtes: [640, 1000, 1400], alt: 'De toren van de Pleinkerk boven de daken van Houten, onder een wijde lucht met wolken.', credit: 'Jan Dijkstra', bron: 'https://commons.wikimedia.org/wiki/File:Houten_NH_kerk_vanuit_het_weiland.jpg' },
  'toren-band': { breedtes: [960, 1600, 2400], alt: 'Weiland aan de rand van Houten met de toren van de Pleinkerk tussen de bomen.', credit: 'Jan Dijkstra', bron: '' },
  'rk-staand': { breedtes: [640, 1000, 1400], alt: 'De spitse toren van de Onze Lieve Vrouw ten Hemelopnemingkerk in Houten tegen een blauwe lucht.', credit: 'Jan Dijkstra', bron: '' },
  'deur-licht': { breedtes: [420, 560], alt: 'Een openstaande houten kerkdeur van de Pleinkerk. Binnen valt licht door gekleurd glas.', credit: 'IdsVanHouten', bron: '' }
};
// bronpagina's en makers uit content/fotos.json overnemen (geen verzonnen bronnen)
const FJ = json('content/fotos.json');
FOTO['toren-staand'].bron = FOTO['toren-band'].bron = FJ.toren.bron;
FOTO['rk-staand'].bron = FJ['rk-houten'].bron;
FOTO['deur-licht'].bron = FJ.held.bron;

function foto(sleutel, { klasse = '', sizes = '100vw', laden = 'lazy' } = {}) {
  const f = FOTO[sleutel];
  const srcset = f.breedtes.map((b) => `/gedeeld/foto/${sleutel}-${b}.webp ${b}w`).join(', ');
  return `<img class="${klasse}" src="/gedeeld/foto/${sleutel}-${f.breedtes[1] || f.breedtes[0]}.webp" srcset="${srcset}" sizes="${sizes}" alt="${esc(f.alt)}" loading="${laden}" decoding="async">`;
}
const credit = (sleutel) => `Foto: ${esc(FOTO[sleutel].credit)}, <a href="${esc(FOTO[sleutel].bron)}">CC BY-SA 4.0</a>`;

// ---------- onderdelen ----------
const tijdNL = (t) => `${String(Number(t.slice(0, 2)))}.${t.slice(3)} uur`;
const DAG = { zondag: 'Zondag', maandag: 'Maandag', dinsdag: 'Dinsdag', woensdag: 'Woensdag', donderdag: 'Donderdag', vrijdag: 'Vrijdag', zaterdag: 'Zaterdag' };
const SOORT = { protestants: 'Protestants', reformatorisch: 'Protestants (reformatorisch)', evangelisch: 'Evangelisch', 'rooms-katholiek': 'Rooms-katholiek' };

function logo(c, schema = 'licht') {
  if (c === 'a') return schema === 'donker' ? logoA({ inkt: PALET.A.papier, papier: PALET.A.inkt, licht: PALET.A.licht, deur: PALET.A.inkt }) : logoA();
  if (c === 'b') return schema === 'donker' ? logoB({ inkt: PALET.B.papier, papier: PALET.B.inkt }) : logoB();
  return schema === 'donker' ? logoC({ inkt: PALET.C.papier }) : logoC();
}

function conceptbalk(c, pad) {
  const links = ['a', 'b', 'c'].map((x) => (x === c ? `<span aria-current="page">${x.toUpperCase()} ${CONCEPT[x].naam}</span>` : `<a href="/${x}${pad}">${x.toUpperCase()} ${CONCEPT[x].naam}</a>`)).join('');
  return `<div class="conceptbalk" role="region" aria-label="Ontwerpvoorstel"><p><strong>Ontwerp</strong>, niet gepubliceerd.</p><nav aria-label="Concepten">${links}</nav></div>`;
}

function kop(c, thuis) {
  const h = thuis ? '' : `/${c}/`;
  return `<header class="kop"><a class="kop-logo" href="/${c}/">${logo(c)}</a><nav aria-label="Hoofdmenu"><ul role="list"><li><a href="${h}#jezus">Wie is Jezus?</a></li><li><a href="${h}#kerkdienst">In de kerk</a></li><li><a href="${h}#kerken">Kerken</a></li></ul></nav></header>`;
}

function voet(c) {
  return `<footer class="voet"><div class="binnen voet-raster">
<div class="voet-merk">${logo(c, 'donker')}</div>
<div class="voet-tekst"><p>Dit is een ontwerp. De kerken in Houten hebben hier nog niet mee ingestemd.</p><p>Wat je op deze site kiest, blijft op je eigen scherm. We bewaren niets en sturen niets door.</p></div>
<p class="maker"><a href="https://denckh.nl">Concept en realisatie door <img src="/gedeeld/denckh-logo-signature-light.svg" width="72" height="22" alt="Denckh.nl"></a></p>
</div></footer>`;
}

function pagina(c, { titel, pad, inhoud, beschrijving, thuis = true }) {
  return `<!doctype html>
<html lang="nl" data-concept="${c}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${esc(titel)}</title>
<meta name="description" content="${esc(beschrijving)}">
<meta name="theme-color" content="${CONCEPT[c].kleur}">
<link rel="icon" href="/gedeeld/icoon-${c}.svg" type="image/svg+xml">
<link rel="stylesheet" href="/gedeeld/basis.css">
<link rel="stylesheet" href="/gedeeld/${c}.css">
<script src="/gedeeld/woorden.js" defer></script>
</head>
<body>
<a class="overslaan" href="#inhoud">Naar de inhoud</a>
${conceptbalk(c, pad)}
${kop(c, thuis)}
<main id="inhoud">
${inhoud}
</main>
${voet(c)}
</body>
</html>
`;
}

// ---------- woorden ----------
const bijbelLink = (code) => `https://www.debijbel.nl/bijbel/NBV21/${code}`;
function hulp(w) {
  if (!w.hulp) return '';
  if (w.hulp === 'hulplijnen') return `<p class="hulp">Gaat het echt niet goed met je? Praat met je huisarts. Of bel <a href="tel:08000113">113: 0800-0113</a> (gratis, dag en nacht) of <a href="tel:0880767000">De Luisterlijn: 088 0767 000</a>.</p>`;
  return `<p class="hulp">${esc(w.hulp)}</p>`;
}
function stappen(c, thuis) {
  const h = thuis ? '' : `/${c}/`;
  return `<ul class="stappen" role="list"><li><a class="knop" href="${h}#jezus">Ontdek Jezus</a></li><li><a class="knop knop-2" href="${h}#kerkdienst">Wat gebeurt er in de kerk?</a></li><li><a class="knop knop-2" href="${h}#kerken">Vind een kerk</a></li></ul>`;
}
function paneel(c, w, { los = false } = {}) {
  const h = los ? 'h1' : 'h3';
  return `<article class="paneel" ${los ? '' : `id="paneel-${w.id}" hidden`} aria-labelledby="kop-${w.id}">
<${h} id="kop-${w.id}" class="paneel-kop" tabindex="-1">${esc(w.woord)}?</${h}>
<p class="herkenning">${esc(w.herkenning)}</p>
<div class="hoop"><p>${esc(w.hoop)}</p><p class="bron">${esc(w.bijbel)} · <a href="${bijbelLink(w.code)}">Lees het in de Bijbel</a></p></div>
<p class="in-kerk">${esc(w.kerk)}</p>
${hulp(w)}
<h${los ? 2 : 4} class="wat-nu">Wat wil je nu doen?</h${los ? 2 : 4}>
${stappen(c, !los)}
${los ? '' : '<p class="ander"><button type="button" class="tekstknop" data-sluit>Kies een ander woord</button></p>'}
</article>`;
}
function woordveld(c, { actief = null, panelen = true, thuis = true } = {}) {
  return `<section class="woordveld" id="woorden" aria-labelledby="woorden-kop"><div class="binnen">
<h2 id="woorden-kop">Wat houdt je bezig?</h2>
<p class="intro">Kies een woord. Je leest een korte tekst, en wat je daarna kunt doen.</p>
<ul class="woorden" role="list">${W.map((w) => `<li><a class="woord" href="/${c}/${w.id}/" data-woord="${w.id}"${w.id === actief ? ' aria-current="page"' : ''}>${esc(w.woord)}?</a></li>`).join('')}</ul>
${panelen ? `<div class="panelen">${W.map((w) => paneel(c, w)).join('')}</div>` : ''}
<p class="altijd-hulp">Gaat het echt niet goed met je? Zoek dan ook hulp. Bel je huisarts, of <a href="tel:08000113">113: 0800-0113</a> (gratis, dag en nacht).</p>
</div></section>`;
}

// ---------- secties ----------
const WISSEL = W.filter((w) => w.wissel).map((w) => ({ id: w.id, w: `${w.woord}?` }));
function wissel(c) {
  const eerste = WISSEL[0];
  return `<div class="wissel-blok"><p class="wissel-regel"><a class="wissel" href="/${c}/${eerste.id}/" data-woord="${eerste.id}" data-woorden="${esc(JSON.stringify(WISSEL))}">${esc(eerste.w)}</a></p><p class="wissel-knoppen" hidden><button type="button" class="tekstknop" data-ander>Ander woord</button><button type="button" class="tekstknop" data-pauze aria-pressed="false">Pauze</button></p></div>`;
}
const HERO_TEKST = `<h1>Kom naar de kerk.<span class="h1-2">Er is plek voor jou.</span></h1>
<p class="hero-zin">Een uitnodiging van christenen uit Houten, Schalkwijk en ’t Goy. Je hoeft niets te weten en niets te kunnen.</p>
<p class="hero-knoppen"><a class="knop" href="#woorden">Wat houdt je bezig?</a> <a class="knop knop-2" href="#kerken">Vind een kerk</a></p>`;

function hero(c) {
  if (c === 'a') {
    return `<section class="hero"><div class="binnen hero-raster">
<div class="hero-tekst">${wissel(c)}${HERO_TEKST}</div>
<figure class="boog">${foto('toren-staand', { laden: 'eager', sizes: '(min-width: 60rem) 34rem, 88vw' })}<figcaption>De Pleinkerk in Houten. ${credit('toren-staand')}</figcaption></figure>
</div></section>`;
  }
  if (c === 'b') {
    return `<section class="hero"><div class="binnen">
<p class="plaats">Houten · Schalkwijk · ’t Goy</p>
${wissel(c)}
<div class="hero-raster"><div class="hero-tekst">${HERO_TEKST}</div>
<figure class="venster-foto">${foto('rk-staand', { laden: 'eager', sizes: '(min-width: 60rem) 22rem, 70vw' })}<svg class="venster-lijn" viewBox="0 0 100 160" preserveAspectRatio="none" aria-hidden="true"><path d="M6 160V50A44 44 0 0 1 94 50V160"/></svg><figcaption>O.L.V. ten Hemelopneming, Houten. ${credit('rk-staand')}</figcaption></figure></div>
</div></section>`;
  }
  return `<section class="hero"><div class="binnen hero-raster">
<div class="hero-merk" aria-hidden="true">${merk('C', { titel: '' })}</div>
<div class="hero-tekst">${wissel(c)}${HERO_TEKST}</div>
</div></section>`;
}

function kort() {
  const items = [
    ['Wat is dit?', 'Een uitnodiging om de kerk en Jezus te leren kennen. Van christenen uit Houten en omgeving.'],
    ['Voor wie?', 'Voor iedereen. Ook als je nooit in een kerk komt, of al lang niet meer.'],
    ['Wat kun je hier doen?', 'Lees wie Jezus is. Kijk wat er in een kerkdienst gebeurt. En vind een kerk bij jou in de buurt.']
  ];
  return `<section class="kort" aria-label="In het kort"><div class="binnen"><dl class="kort-lijst">${items.map(([v, a]) => `<div><dt>${v}</dt><dd>${a}</dd></div>`).join('')}</dl></div></section>`;
}

function mensen(c) {
  if (c !== 'c') return '';
  const plekken = [
    ['Na de dienst', 'Mensen bij de koffie, in gesprek. Gewoon, niet geposeerd.'],
    ['De deur', 'Iemand die de deur openhoudt voor een bezoeker.'],
    ['Samen aan tafel', 'Een maaltijd in de kerk, zoals Eet je mee in de Sionkerk.']
  ];
  return `<section class="mensen" aria-labelledby="mensen-kop"><div class="binnen"><h2 id="mensen-kop">Hier komen echte mensen</h2><p class="intro">In dit ontwerp horen foto’s van mensen uit de kerken in Houten. Die maken we pas als ze daar zelf ja op zeggen. Tot die tijd staat hier wat er komt.</p><ul class="mensen-lijst" role="list">${plekken.map(([k, t]) => `<li><div class="plek" aria-hidden="true">${merk('C', { titel: '', mono: '#E9E3DA', midden: '#F6F1EA' })}</div><p><strong>${k}</strong><br>${t}</p></li>`).join('')}</ul></div></section>`;
}

function jezus() {
  const punten = [
    ['Hij zocht mensen op', 'Jezus leefde 2000 jaar geleden in Israël. Hij ging om met mensen die anderen links lieten liggen. Hij vertelde over God als een vader die op je wacht.'],
    ['Hij stierf voor ons', 'Jezus werd gekruisigd. Christenen geloven dat Hij dat deed voor ons. Zo kan God ons vergeven wat we fout hebben gedaan.'],
    ['Hij stond op', 'Drie dagen later stond Hij op uit de dood. Daarom geloven christenen dat de dood niet het laatste woord heeft.'],
    ['Je mag bij Hem komen', 'Jezus leeft. Je kunt Hem leren kennen door de Bijbel te lezen, door te bidden en door samen te komen met andere christenen. Dat is de kerk.']
  ];
  return `<section class="jezus" id="jezus" aria-labelledby="jezus-kop"><div class="binnen"><h2 id="jezus-kop">Wie is Jezus?</h2><ol class="punten" role="list">${punten.map(([k, t]) => `<li><h3>${k}</h3><p>${t}</p></li>`).join('')}</ol><p><a class="tekstlink" href="${PREVIEW}/ontdek-het-geloof/">Meer over wat christenen geloven</a></p></div></section>`;
}

function kerkdienst() {
  const punten = [
    'Je bent welkom zoals je bent. Gewone kleren zijn prima.',
    'Een dienst duurt meestal een uur tot anderhalf uur.',
    'Er wordt gezongen, gebeden en voorgelezen uit de Bijbel. Daarna legt iemand uit wat die tekst betekent.',
    'Je hoeft niets mee te doen en niets te geven. Kijken en luisteren is genoeg.',
    'Na afloop is er vaak koffie. Blijf even, of ga gewoon naar huis.'
  ];
  return `<section class="kerkdienst" id="kerkdienst" aria-labelledby="dienst-kop"><div class="binnen"><h2 id="dienst-kop">Wat gebeurt er in de kerk?</h2><ul class="dienst-lijst" role="list">${punten.map((p) => `<li>${p}</li>`).join('')}</ul><p class="noot">Elke kerk is anders. In een katholieke kerk heet de dienst de mis. Het brood (de communie) is daar voor katholieken. Je mag gewoon blijven zitten.</p></div></section>`;
}

function kerken(c) {
  const perPlaats = {};
  for (const k of KERKEN) (perPlaats[k.plaats] ||= []).push(k);
  const kaart = (k) => {
    const d = k.diensten.filter((x) => x.tijd && DAG[x.dag]);
    const zondag = d.filter((x) => x.dag === 'zondag').map((x) => tijdNL(x.tijd));
    const anders = d.filter((x) => x.dag !== 'zondag').map((x) => `${DAG[x.dag].toLowerCase()} ${tijdNL(x.tijd)}`);
    const tijden = zondag.length ? `Zondag ${zondag.join(' en ')}` : 'Tijden: zie de website';
    const adres = `${k.adres}, ${k.postcode} ${k.plaats}`;
    return `<li class="kerk"><h3>${esc(k.naam)}</h3><p class="soort">${SOORT[k.traditie] || esc(k.traditie)}</p><p class="tijd">${tijden}${anders.length ? `<span>Ook ${anders.join(', ')}</span>` : ''}</p><p class="adres">${esc(k.adres)}</p><p class="kerk-links"><a href="https://www.openstreetmap.org/search?query=${encodeURIComponent(adres)}">Route</a> <a href="${esc(k.website)}">Website</a></p></li>`;
  };
  const volgorde = ['Houten', 'Schalkwijk', ...Object.keys(perPlaats).filter((p) => !['Houten', 'Schalkwijk'].includes(p))];
  return `<section class="kerken" id="kerken" aria-labelledby="kerken-kop"><div class="binnen"><h2 id="kerken-kop">Vind een kerk</h2><p class="intro">Kerken in Houten, Schalkwijk en ’t Goy. De tijden komen van hun eigen websites (8 november 2026). Kijk voor de zekerheid nog even op hun site.</p><p class="let-op">Dit is een ontwerp. We hebben deze kerken nog niet gevraagd om mee te doen.</p>${volgorde
    .filter((p) => perPlaats[p])
    .map((p) => `<h3 class="plaatsnaam">${p.replace("'", "’")}</h3><ul class="kerk-lijst" role="list">${perPlaats[p].sort((a, b) => a.naam.localeCompare(b.naam, 'nl')).map(kaart).join('')}</ul>`)
    .join('')}</div></section>`;
}

// ---------- bouwen ----------
rmSync(UIT, { recursive: true, force: true });
const schrijf = (rel, s) => { const p = path.join(UIT, rel); mkdirSync(path.dirname(p), { recursive: true }); writeFileSync(p, s); };
const kopieer = (van, naar) => { mkdirSync(path.dirname(path.join(UIT, naar)), { recursive: true }); copyFileSync(path.join(ROOT, van), path.join(UIT, naar)); };
for (const f of ['archivo', 'atkinson-next', 'newsreader-opsz-normal', 'newsreader-opsz-italic']) kopieer(`voorstellen/fonts/${f}.woff2`, `gedeeld/fonts/${f}.woff2`);
for (const f of readdirSync(path.join(HIER, 'foto'))) kopieer(`ontwerpen/foto/${f}`, `gedeeld/foto/${f}`);
for (const f of ['basis.css', 'a.css', 'b.css', 'c.css', 'woorden.js']) kopieer(`ontwerpen/stijl/${f}`, `gedeeld/${f}`);
kopieer('src/static/merk/denckh/denckh-logo-signature-light.svg', 'gedeeld/denckh-logo-signature-light.svg');
const { icoon } = await import('./merken.mjs');
for (const c of ['a', 'b', 'c']) schrijf(`gedeeld/icoon-${c}.svg`, icoon(c.toUpperCase()));

schrijf('index.html', `<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Kom naar de kerk. Drie ontwerpen</title><link rel="stylesheet" href="/gedeeld/basis.css"></head><body><main class="binnen overzicht"><h1>Kom naar de kerk. Drie ontwerpen</h1><ul role="list">${['a', 'b', 'c'].map((c) => `<li><a href="/${c}/">${c.toUpperCase()}. ${CONCEPT[c].naam}: ${CONCEPT[c].sub}</a></li>`).join('')}</ul></main></body></html>`);

for (const c of ['a', 'b', 'c']) {
  schrijf(`${c}/index.html`, pagina(c, { titel: 'Kom naar de kerk. Er is plek voor jou.', pad: '/', beschrijving: SITE.omschrijving, inhoud: `${hero(c)}${kort()}${woordveld(c)}${mensen(c)}${jezus()}${kerkdienst()}${kerken(c)}` }));
  for (const w of W) {
    schrijf(`${c}/${w.id}/index.html`, pagina(c, { titel: `${w.woord}? · Kom naar de kerk.`, pad: `/${w.id}/`, thuis: false, beschrijving: w.herkenning, inhoud: `<section class="woordpagina"><div class="binnen"><p class="terug"><a href="/${c}/">Kom naar de kerk.</a></p>${paneel(c, w, { los: true })}</div></section>${woordveld(c, { actief: w.id, panelen: false, thuis: false })}` }));
  }
}
console.log(`✓ ontwerpen: ${UIT} (3 concepten × ${1 + W.length} pagina's)`);
