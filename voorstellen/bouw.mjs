#!/usr/bin/env node
// Bouwt het klikbare prototype van de drie ontwerprichtingen naar voorstellen/dist/.
// Los van de echte site: src/, content/ en dist/ van de live conceptpreview blijven onaangeroerd.
//
//   node voorstellen/bouw.mjs
//   node voorstellen/serve.mjs 8790     → http://localhost:8790/
//
// Per richting: /rN/ (home), /rN/<woord>/ (spandoek-URL, werkt zonder JavaScript),
// /rN/kijk-binnen/ en /rN/eerste-bezoek/. Niets wordt opgeslagen of verstuurd.

import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { beeldmerk, logoHorizontaal, PALETTEN } from './logos.mjs';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HIER, '..');
const UIT = path.join(HIER, 'dist');
const json = (p) => JSON.parse(readFileSync(path.join(ROOT, p), 'utf8'));

const LV = json('voorstellen/levensvragen.json');
const SITE = json('content/site.json');
const KERKEN = json('content/kerken.json').kerken;
const FOTOS = json('content/fotos.json');
// liggende uitsnede van dezelfde Commons-foto, alleen voor het prototype (voorstellen/fotos_voorstel.py)
FOTOS['toren-breed'] = { ...FOTOS.toren, src: '/foto/toren-breed.webp', breedtes: [960, 1600, 2400], eigen: true };
const PREVIEW = SITE.preview;

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------- richtingen ----------
const RICHTINGEN = {
  1: {
    naam: 'Stralenkrans',
    ondertitel: 'Warm licht, diepgroen, klassieke letter',
    woordStijl: (w) => `${w}?`,
    hero: 'toren-breed',
    themaKleur: '#29463E'
  },
  2: {
    naam: 'Roosvenster',
    ondertitel: 'Kalksteen, terracotta, architectonische kapitalen',
    woordStijl: (w) => `${w.toUpperCase()}?`,
    hero: 'rk-houten',
    themaKleur: '#25312F'
  },
  3: {
    naam: 'De ster',
    ondertitel: 'Avondhemel, dageraad, zachte schreefletter',
    woordStijl: (w) => `${w.toLowerCase()}?`,
    hero: 'toren',
    themaKleur: '#1F2B3B'
  }
};
const CAMPAGNE = ['moe', 'alleen', 'zoekend', 'nieuwsgierig'];
const woordVan = (id) => LV.woorden.find((w) => w.id === id);

// ---------- onderdelen ----------
function fotoTag(sleutel, { klasse = '', sizes = '100vw', laden = 'lazy' } = {}) {
  const f = FOTOS[sleutel];
  const basis = f.src.replace('/foto/', '/gedeeld/foto/').replace('.webp', '');
  const srcset = f.breedtes.map((b) => `${basis}-${b}.webp ${b}w`).join(', ');
  const max = f.breedtes[f.breedtes.length - 1];
  return `<img class="${klasse}" src="${basis}-${max}.webp" srcset="${srcset}" sizes="${sizes}" alt="${esc(f.alt)}" loading="${laden}" decoding="async">`;
}
function fotoCredit(sleutel) {
  const f = FOTOS[sleutel];
  return `Foto: ${esc(f.bijschrift)}, ${esc(f.credit)}, <a href="${esc(f.bron)}">${esc(f.licentie)}</a>`;
}

function conceptbalk(r, pad) {
  const andere = [1, 2, 3]
    .map((n) => (n === r ? `<span aria-current="page">${n} ${RICHTINGEN[n].naam}</span>` : `<a href="/r${n}${pad}">${n} ${RICHTINGEN[n].naam}</a>`))
    .join('');
  return `<div class="conceptbalk" role="region" aria-label="Ontwerpvoorstel"><p><strong>Ontwerpvoorstel</strong>, niet gepubliceerd. Richting:</p><nav aria-label="Richtingen">${andere}</nav><a class="terug" href="/">Overzicht</a></div>`;
}

function kop(r, actief) {
  const items = [
    ['/', 'Start'],
    ['/kijk-binnen/', 'Kijk eens binnen'],
    ['/eerste-bezoek/', 'Eerste kerkbezoek'],
    ['/#goede-nieuws', 'Wie is Jezus?']
  ];
  return `<header class="kop"><a class="kop-logo" href="/r${r}/">${logoHorizontaal(r, { schema: 'licht', detail: 'klein', klasse: 'logo' })}</a><nav aria-label="Hoofdmenu"><ul>${items
    .map(([h, t]) => `<li><a href="/r${r}${h}"${actief === h ? ' aria-current="page"' : ''}>${t}</a></li>`)
    .join('')}</ul></nav></header>`;
}

function voet(r) {
  return `<footer class="voet"><div class="voet-binnen"><div class="voet-merk">${beeldmerk(r, { schema: 'donker', titel: '' })}<p><strong>Kom naar de kerk.</strong><br>Een uitnodiging namens kerken in ${esc(SITE.regio)}.</p></div><div><p class="klein">Dit is een ontwerpvoorstel. Er doen nog geen kerken officieel mee; kerkgegevens komen van de eigen websites van de kerken en zijn nog niet met hen afgestemd.</p><p class="klein">Wat je op deze site kiest, blijft in je eigen browser. We bewaren en versturen niets.</p></div><p class="maker"><a href="https://denckh.nl">Concept en realisatie door <img src="/gedeeld/denckh-logo-signature-light.svg" width="72" height="22" alt="Denckh."></a></p></div></footer>`;
}

function pagina(r, { titel, pad, actief, inhoud, beschrijving = SITE.omschrijving }) {
  return `<!doctype html>
<html lang="nl" data-richting="${r}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${esc(titel)}</title>
<meta name="description" content="${esc(beschrijving)}">
<meta name="theme-color" content="${RICHTINGEN[r].themaKleur}">
<link rel="stylesheet" href="/gedeeld/proto.css">
<script src="/gedeeld/proto.js" defer></script>
</head>
<body>
<a class="overslaan" href="#inhoud">Naar de inhoud</a>
${conceptbalk(r, pad)}
${kop(r, actief)}
<main id="inhoud">
${inhoud}
</main>
${voet(r)}
</body>
</html>
`;
}

// ---------- levensvragen ----------
function hulpBlok(w) {
  if (!w.hulp) return '';
  if (w.hulp === 'hulplijnen') {
    return `<aside class="hulp" aria-label="Hulp nodig?"><p><strong>Gaat het echt niet meer?</strong> Een kerk vervangt geen professionele hulp. Praat met je huisarts, of bel:</p><ul>${SITE.hulplijnen
      .map((h) => `<li><a href="tel:${h.tel}">${esc(h.naam)}: ${esc(h.nummer)}</a> <span>${esc(h.uitleg)}</span></li>`)
      .join('')}</ul></aside>`;
  }
  return `<aside class="hulp" aria-label="Goed om te weten"><p>${esc(w.hulp)}</p></aside>`;
}
function stapHref(r, doel) {
  return {
    binnen: `/r${r}/kijk-binnen/`,
    eerste: `/r${r}/eerste-bezoek/`,
    samen: `${PREVIEW}/samen-naar-de-kerk/`,
    ontdek: `${PREVIEW}/activiteiten/`,
    evangelie: `/r${r}/#goede-nieuws`
  }[doel];
}
function paneel(r, w, { kopNiveau = 2, los = false } = {}) {
  const h = `h${kopNiveau}`;
  return `<article class="paneel" ${los ? '' : `id="paneel-${w.id}" hidden`} aria-labelledby="kop-${w.id}">
<${h} id="kop-${w.id}" class="paneel-kop" tabindex="-1">${esc(RICHTINGEN[r].woordStijl(w.woord))}</${h}>
<div class="paneel-raster">
<div class="herkenning">${w.herkenning.map((t) => `<p>${esc(t)}</p>`).join('')}</div>
<figure class="bijbel"><span class="bijbel-merk" aria-hidden="true">${beeldmerk(r, { schema: r === 3 ? 'donker' : 'licht', detail: 'klein', titel: '' })}</span><blockquote><p>${esc(w.bijbel.vrij)}</p></blockquote><figcaption>${esc(w.bijbel.plaats)}, vrij weergegeven. <a href="${LV.bijbelLink}${w.bijbel.code}">Lees de tekst op debijbel.nl</a></figcaption></figure>
<div class="jezus"><p class="label">Jezus nodigt je uit</p><p>${esc(w.jezus)}</p></div>
<p class="stap"><a class="knop" href="${stapHref(r, w.stap.doel)}">${esc(w.stap.tekst)}<span aria-hidden="true"> →</span></a></p>
${hulpBlok(w)}
</div>
${los ? '' : `<p class="ander"><button type="button" class="link-knop" data-terug>Kies een ander woord</button></p>`}
</article>`;
}

function woordveld(r, { actiefId = null, metPanelen = true } = {}) {
  const groepen = LV.groepen
    .map(
      (g) => `<div class="woordgroep"><h3>${esc(g.naam)}</h3><ul role="list">${LV.woorden
        .filter((w) => w.groep === g.id)
        .map((w) => `<li><a class="woord" href="/r${r}/${w.id}/" data-woord="${w.id}"${w.id === actiefId ? ' aria-current="page"' : ''}>${esc(w.woord)}</a></li>`)
        .join('')}</ul></div>`
    )
    .join('');
  return `<section class="woordveld" id="wat-houdt-jou-bezig" aria-labelledby="wv-kop">
<div class="sectie-binnen">
<h2 id="wv-kop">Wat houdt jou bezig?</h2>
<p class="inleiding">Kies een woord dat bij je past. Je krijgt een korte gedachte, iets uit de Bijbel en een kleine volgende stap. Wat je kiest, blijft op je eigen scherm.</p>
<div class="woorden">${groepen}</div>
${metPanelen ? `<div class="panelen" aria-live="polite">${LV.woorden.map((w) => paneel(r, w)).join('')}</div>` : ''}
</div>
</section>`;
}

// ---------- secties ----------
function hero(r) {
  const woorden = CAMPAGNE.map((id) => RICHTINGEN[r].woordStijl(woordVan(id).woord));
  const wissel = `<p class="vraagwoord" aria-hidden="true"><span class="wissel" data-woorden="${esc(JSON.stringify(woorden))}">${esc(woorden[0])}</span></p>`;
  const pauze = `<button type="button" class="pauze" hidden aria-pressed="false">Pauzeer de wisselende woorden</button>`;
  const tekst = `<h1><span class="sr">Moe, alleen, zoekend of nieuwsgierig? </span>Kom naar de kerk. <span class="h1-zin">Er is plek voor jou.</span></h1><p class="hero-zin">Kerken in Houten, Schalkwijk en ’t Goy nodigen je uit om Jezus Christus te leren kennen. Je hoeft niets te weten en niets te kunnen.</p><p class="hero-knoppen"><a class="knop" href="#wat-houdt-jou-bezig">Wat houdt jou bezig?</a> <a class="knop knop-licht" href="/r${r}/eerste-bezoek/">Vind een kerk</a></p>`;
  if (r === 1) {
    return `<section class="hero hero-1"><div class="hero-foto">${fotoTag('toren-breed', { laden: 'eager' })}</div><div class="hero-licht" aria-hidden="true">${beeldmerk(1, { schema: 'donker', titel: '' })}</div><div class="hero-tekst">${wissel}${tekst}${pauze}</div><p class="credit">${fotoCredit('toren-breed')}</p></section>`;
  }
  if (r === 2) {
    return `<section class="hero hero-2"><div class="hero-tekst">${wissel}${tekst}${pauze}</div><div class="hero-foto">${fotoTag('rk-houten', { laden: 'eager', sizes: '(min-width: 60rem) 50vw, 100vw' })}<span class="hero-roos" aria-hidden="true">${beeldmerk(2, { schema: 'licht', titel: '' })}</span></div><p class="credit">${fotoCredit('rk-houten')}</p></section>`;
  }
  return `<section class="hero hero-3"><div class="hero-foto">${fotoTag('toren-breed', { laden: 'eager' })}</div><div class="hero-ster" aria-hidden="true">${beeldmerk(3, { schema: 'donker', titel: '' })}</div><div class="hero-tekst">${wissel}${tekst}${pauze}</div><p class="credit">${fotoCredit('toren-breed')}</p></section>`;
}

function goedNieuws(r) {
  const zinnen = [
    ['God kent jou', 'God heeft de wereld gemaakt, en jou ook. Hij kent je bij naam en wil met je leven.'],
    ['Er is iets misgegaan', 'Mensen keren zich van God af. Dat zie je in de wereld, en eerlijk gezegd ook in onszelf.'],
    ['God kwam zelf', 'In Jezus Christus kwam God naar ons toe. Hij stierf aan het kruis en stond op uit de dood, zodat wij vergeving en nieuw leven krijgen.'],
    ['Kom en zie', 'Jezus nodigt je uit om Hem te leren kennen. Je hoeft niet eerst alles te begrijpen. De kerk is de plek waar je Hem samen met anderen ontmoet.']
  ];
  return `<section class="goed-nieuws" id="goede-nieuws" aria-labelledby="gn-kop"><div class="sectie-binnen"><h2 id="gn-kop">Wie is Jezus, en waarom de kerk?</h2><p class="inleiding">Het christelijk geloof in vier zinnen. Alle kerken die meedoen, belijden dit samen.</p><ol class="vier" role="list">${zinnen
    .map(([k, t], i) => `<li><span class="nr" aria-hidden="true">${i + 1}</span><h3>${k}</h3><p>${t}</p></li>`)
    .join('')}</ol><p><a class="tekstlink" href="${PREVIEW}/ontdek-het-geloof/">Meer over wat christenen geloven</a></p></div></section>`;
}

function route(r) {
  const stappen = ['Je ziet een vraag op het spandoek', 'Je herkent iets', 'Je leest wat Jezus zegt', 'Je kijkt rustig binnen', 'Je kiest een kerk en een tijd', 'Je gaat, alleen of samen'];
  return `<section class="route" aria-labelledby="rt-kop"><div class="sectie-binnen"><h2 id="rt-kop">Zo klein kan de eerste stap zijn</h2><ol class="route-lijst" role="list">${stappen.map((s) => `<li>${s}</li>`).join('')}</ol><div class="route-knoppen"><a class="kaart-link" href="/r${r}/kijk-binnen/"><span class="kl-titel">Kijk eens binnen</span><span>Stap voor stap door een kerkdienst, met een woordenlijst.</span></a><a class="kaart-link" href="/r${r}/eerste-bezoek/"><span class="kl-titel">Mijn eerste kerkbezoek</span><span>Kies op praktische punten en zie wanneer de volgende dienst is.</span></a></div></div></section>`;
}

// ---------- kijk eens binnen ----------
const DIENST = {
  protestants: {
    naam: 'Protestants of evangelisch',
    duur: 'Meestal 1 tot 1,5 uur.',
    foto: 'held',
    stappen: [
      ['Binnenkomen', 'Bij de deur geeft iemand je een hand, soms met een liturgie of een liedboek.', 'Ga zitten waar je wilt. Achterin is prima.'],
      ['Begin van de dienst', 'De voorganger opent de dienst, vaak met een groet in Gods naam.', 'Luisteren. Staan als anderen staan mag, maar hoeft niet.'],
      ['Zingen', 'Psalmen en liederen, met orgel, piano of een band. De tekst staat op een scherm of in het boek.', 'Meezingen of luisteren. Allebei goed.'],
      ['Gebed', 'Iemand bidt hardop, voor de kerk, het dorp, de wereld en mensen die het moeilijk hebben.', 'Ogen dicht of open. Je mag in stilte meebidden.'],
      ['Bijbellezing', 'Een gedeelte uit de Bijbel wordt voorgelezen.', 'Meelezen op het scherm of in een kerkbijbel.'],
      ['Preek', 'De voorganger legt de Bijbeltekst uit en vertelt wat die nu betekent. Vaak 20 tot 40 minuten.', 'Luisteren. Vragen kun je na afloop stellen.'],
      ['Collecte', 'Er wordt geld ingezameld voor de kerk en goede doelen, met een zak, schaal of app.', 'Je hoeft niets te geven.'],
      ['Zegen', 'Aan het eind wordt Gods zegen uitgesproken over iedereen.', 'Blijven zitten of staan, zoals anderen doen.'],
      ['Koffie', 'Na afloop drinken mensen samen koffie of thee.', 'Blijf even, of ga gewoon naar huis.']
    ],
    noot: 'Soms viert de kerk het avondmaal, met brood en wijn of druivensap. Wie meedoet, verschilt per kerk. Twijfel je? Blijf rustig zitten of vraag het je buurman.'
  },
  katholiek: {
    naam: 'Rooms-katholiek',
    duur: 'Een mis duurt meestal ongeveer een uur.',
    foto: 'rk-houten',
    stappen: [
      ['Binnenkomen', 'Bij de ingang staat wijwater. Veel mensen maken daarmee een kruisteken.', 'Dat hoeft niet. Ga zitten waar je wilt.'],
      ['Opening', 'Een lied, een begroeting en een moment om God om ontferming te vragen: ‘Heer, ontferm U’.', 'Luisteren, of meezeggen als de tekst er staat.'],
      ['Lezingen', 'Lezingen uit de Bijbel en een psalm. Voor het evangelie gaat iedereen staan.', 'Meestaan mag, blijven zitten ook.'],
      ['Preek', 'De priester of diaken legt de lezingen uit. Meestal korter dan in een protestantse dienst.', 'Luisteren.'],
      ['Geloofsbelijdenis en voorbede', 'Samen wordt uitgesproken wat de kerk gelooft, daarna wordt gebeden voor de wereld en voor mensen in nood.', 'Luisteren of meelezen.'],
      ['Eucharistie', 'Over brood en wijn wordt het grote dankgebed gebeden. Daarna gaan mensen naar voren voor de communie.', 'De communie is voor katholieken. Je mag blijven zitten, of naar voren gaan met je armen gekruist voor een zegen.'],
      ['Zegen en slotlied', 'De priester zegent iedereen en de mis wordt afgesloten met een lied.', 'Blijven zitten of staan, zoals anderen doen.']
    ],
    noot: 'Na afloop is er soms koffie. Vraag gerust iemand wat je niet begrijpt.'
  }
};
const WOORDENLIJST = [
  ['Amen', 'Betekent ‘zo is het’ of ‘zo zij het’. Wordt gezegd na een gebed.'],
  ['Avondmaal', 'Protestantse viering met brood en wijn, ter herinnering aan de laatste maaltijd van Jezus.'],
  ['Collecte', 'Inzameling van geld tijdens de dienst. Geven is vrijwillig.'],
  ['Communie', 'In de katholieke mis: het ontvangen van het brood (de hostie).'],
  ['Eucharistie', 'Katholieke naam voor de viering van brood en wijn. Betekent ‘dankzegging’.'],
  ['Kruisteken', 'Een gebaar van voorhoofd naar borst en schouders: een kort gebed met je lichaam.'],
  ['Liturgie', 'De vaste volgorde van de dienst, vaak op papier of op een scherm.'],
  ['Preek', 'Uitleg van een Bijbeltekst door de voorganger. In de katholieke kerk: homilie.'],
  ['Psalm', 'Een van de 150 liederen uit de Bijbel. Al eeuwen gezongen door joden en christenen.'],
  ['Voorganger', 'Wie de dienst leidt: dominee, predikant, pastor, priester of een gemeentelid.'],
  ['Zegen', 'Woorden aan het eind waarmee Gods goedheid aan iedereen wordt toegezegd.']
];
function kijkBinnen(r) {
  const tab = (sleutel, d) => `<section class="dienst" id="dienst-${sleutel}" aria-labelledby="dk-${sleutel}"><h2 id="dk-${sleutel}" class="dienst-kop">${d.naam}</h2><p class="duur">${d.duur}</p><figure class="dienst-foto">${fotoTag(d.foto, { sizes: '(min-width: 60rem) 40vw, 100vw' })}<figcaption>${fotoCredit(d.foto)}</figcaption></figure><ol class="stappen" role="list">${d.stappen
    .map(([k, wat, jij], i) => `<li class="stap-item"><p class="stap-nr">Stap ${i + 1} van ${d.stappen.length}</p><h3>${k}</h3><p>${wat}</p><p class="jij"><strong>Jij:</strong> ${jij}</p></li>`)
    .join('')}</ol><p class="noot">${d.noot}</p></section>`;
  return `<section class="pagina-kop"><div class="sectie-binnen"><h1>Kijk eens binnen</h1><p class="inleiding">Hoe gaat een kerkdienst eigenlijk? Loop er stap voor stap doorheen, zodat je weet wat je kunt verwachten.</p><p class="disclaimer"><strong>Elke kerk is anders.</strong> Dit is een algemeen beeld. Muziek, lengte en gewoonten verschillen per kerk. Bij de kerken vind je wat er bij hen anders is.</p></div></section>
<div class="sectie-binnen binnen">
<div class="tabs" hidden><div role="tablist" aria-label="Soort kerk"><button type="button" role="tab" id="tab-protestants" aria-controls="dienst-protestants" aria-selected="true">Protestants of evangelisch</button><button type="button" role="tab" id="tab-katholiek" aria-controls="dienst-katholiek" aria-selected="false" tabindex="-1">Rooms-katholiek</button></div></div>
${tab('protestants', DIENST.protestants)}
${tab('katholiek', DIENST.katholiek)}
<p class="foto-volgt">Foto’s van binnen volgen, met toestemming van de kerken en zonder herkenbare kerkgangers.</p>
<section class="woordenlijst" aria-labelledby="wl-kop"><h2 id="wl-kop">Woordenlijst</h2><dl>${WOORDENLIJST.map(([t, b]) => `<div><dt>${t}</dt><dd>${b}</dd></div>`).join('')}</dl></section>
<p><a class="knop" href="/r${r}/eerste-bezoek/">Kies een kerk voor je eerste bezoek</a></p>
</div>`;
}

// ---------- eerste kerkbezoek ----------
const TRADITIE = { protestants: 'Protestants', reformatorisch: 'Protestants (reformatorisch)', evangelisch: 'Evangelisch', 'rooms-katholiek': 'Rooms-katholiek' };
const DAGEN = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
function eersteBezoek(r) {
  const kaarten = KERKEN.map((k) => {
    const diensten = k.diensten.filter((d) => d.tijd && DAGEN.includes(d.dag));
    const kenm = new Set(k.kenmerken);
    if (diensten.some((d) => d.tijd >= '12:00')) kenm.add('middag');
    const adres = `${k.adres}, ${k.postcode} ${k.plaats}`;
    const data = JSON.stringify(diensten.map((d) => ({ dag: d.dag, tijd: d.tijd, wat: d.omschrijving || 'Dienst', agenda: d.agenda !== false })));
    return `<li class="kerk" data-traditie="${k.traditie}" data-plaats="${esc(k.plaats)}" data-kenmerken="${[...kenm].join(' ')}" data-diensten="${esc(data)}" data-naam="${esc(k.naam)}" data-adres="${esc(adres)}">
<h3>${esc(k.naam)}</h3>
<p class="kerk-meta">${TRADITIE[k.traditie] || esc(k.traditie)} · ${esc(k.plaats)}</p>
<p class="status">Nog niet benaderd · gegevens van de eigen website, gecontroleerd 8 november 2026</p>
<p class="volgende" data-volgende>${diensten.length ? diensten.map((d) => `${d.dag.replace(/^./, (c) => c.toUpperCase())} ${d.tijd}`).join(' · ') : 'Tijden: zie de website van de kerk'}</p>
<ul class="kerk-feiten" role="list">${k.kenmerken.includes('kinderen') ? '<li>Kinderwerk</li>' : ''}${k.kenmerken.includes('oppas') ? '<li>Oppas</li>' : ''}${k.kenmerken.includes('online') ? '<li>Ook online</li>' : ''}</ul>
<p class="kerk-acties"><a href="https://www.openstreetmap.org/search?query=${encodeURIComponent(adres)}">Route naar ${esc(k.adres)}</a> <a href="${esc(k.website)}">Website</a> <span data-agenda></span></p>
</li>`;
  }).join('');
  const vink = (v, t) => `<label><input type="checkbox" name="wens" value="${v}"> ${t}</label>`;
  return `<section class="pagina-kop"><div class="sectie-binnen"><h1>Mijn eerste kerkbezoek</h1><p class="inleiding">Kies op praktische punten. Je ziet alleen kerken die daarbij passen, met de eerstvolgende dienst en de route.</p><p class="disclaimer"><strong>Voorbeeld.</strong> Geen van deze kerken is al benaderd; dit laat zien hoe het werkt. Controleer tijden altijd op de website van de kerk.</p></div></section>
<div class="sectie-binnen bezoek">
<form class="filters" action="#" aria-labelledby="fl-kop" hidden>
<h2 id="fl-kop">Wat is voor jou handig?</h2>
<fieldset><legend>Ik zoek</legend>${vink('kinderen', 'iets voor mijn kinderen')}${vink('oppas', 'oppas voor de kleintjes')}${vink('middag', 'een dienst ’s middags of ’s avonds')}${vink('online', 'eerst online meekijken')}</fieldset>
<fieldset><legend>Soort kerk</legend><label><input type="radio" name="traditie" value="" checked> Maakt niet uit</label><label><input type="radio" name="traditie" value="protestants"> Protestants</label><label><input type="radio" name="traditie" value="evangelisch"> Evangelisch</label><label><input type="radio" name="traditie" value="rooms-katholiek"> Rooms-katholiek</label></fieldset>
<fieldset><legend>Plaats</legend><label><input type="radio" name="plaats" value="" checked> Alle</label><label><input type="radio" name="plaats" value="Houten"> Houten</label><label><input type="radio" name="plaats" value="Schalkwijk"> Schalkwijk</label><label><input type="radio" name="plaats" value="’t Goy"> ’t Goy</label></fieldset>
</form>
<p class="aantal" aria-live="polite" data-aantal>${KERKEN.length} kerken</p>
<ul class="kerken" role="list">${kaarten}</ul>
<p class="klein">De volgorde wisselt per bezoek, zodat geen kerk steeds bovenaan staat. Wil je liever niet alleen gaan? <a href="${PREVIEW}/samen-naar-de-kerk/">Iemand gaat met je mee.</a></p>
</div>`;
}

// ---------- overzicht ----------
function overzicht() {
  const kaart = (n) => `<li><a href="/r${n}/"><span class="ov-merk">${beeldmerk(n, { schema: 'licht', titel: '' })}</span><span class="ov-naam">${n}. ${RICHTINGEN[n].naam}</span><span>${RICHTINGEN[n].ondertitel}</span></a></li>`;
  return `<!doctype html><html lang="nl" data-richting="0"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Kom naar de kerk. Drie ontwerprichtingen</title><link rel="stylesheet" href="/gedeeld/proto.css"></head><body><main id="inhoud" class="overzicht"><h1>Kom naar de kerk.<br><span>Drie ontwerprichtingen, klikbaar prototype</span></h1><p>Niet gepubliceerd. De live conceptpreview is ongewijzigd. Spandoek-adressen werken ook hier, bijvoorbeeld <a href="/r1/moe/">/moe/</a>.</p><ul class="ov" role="list">${[1, 2, 3].map(kaart).join('')}</ul></main></body></html>`;
}

// ---------- bouwen ----------
rmSync(UIT, { recursive: true, force: true });
const schrijf = (rel, inhoud) => {
  const p = path.join(UIT, rel);
  mkdirSync(path.dirname(p), { recursive: true });
  writeFileSync(p, inhoud);
};
const kopieer = (van, naar) => {
  mkdirSync(path.dirname(path.join(UIT, naar)), { recursive: true });
  copyFileSync(path.join(ROOT, van), path.join(UIT, naar));
};

for (const f of ['archivo', 'atkinson-next', 'instrument-serif-normal', 'instrument-serif-italic', 'newsreader-opsz-normal', 'newsreader-opsz-italic']) kopieer(`voorstellen/fonts/${f}.woff2`, `gedeeld/fonts/${f}.woff2`);
for (const [, f] of Object.entries(FOTOS)) {
  if (!f?.src) continue;
  for (const b of f.breedtes) {
    const naam = path.basename(f.src, '.webp') + `-${b}.webp`;
    kopieer(f.eigen ? `voorstellen/foto/${naam}` : `src/static/foto/${naam}`, `gedeeld/foto/${naam}`);
  }
}
kopieer('src/static/merk/denckh/denckh-logo-signature-light.svg', 'gedeeld/denckh-logo-signature-light.svg');
kopieer('voorstellen/proto.css', 'gedeeld/proto.css');
kopieer('voorstellen/proto.js', 'gedeeld/proto.js');
schrijf('index.html', overzicht());

for (const r of [1, 2, 3]) {
  const titel = 'Kom naar de kerk. Er is plek voor jou.';
  schrijf(`r${r}/index.html`, pagina(r, { titel, pad: '/', actief: '/', inhoud: `${hero(r)}${woordveld(r)}${goedNieuws(r)}${route(r)}` }));
  schrijf(`r${r}/kijk-binnen/index.html`, pagina(r, { titel: 'Kijk eens binnen · Kom naar de kerk.', pad: '/kijk-binnen/', actief: '/kijk-binnen/', inhoud: kijkBinnen(r) }));
  schrijf(`r${r}/eerste-bezoek/index.html`, pagina(r, { titel: 'Mijn eerste kerkbezoek · Kom naar de kerk.', pad: '/eerste-bezoek/', actief: '/eerste-bezoek/', inhoud: eersteBezoek(r) }));
  for (const w of LV.woorden) {
    const inhoud = `<section class="woordpagina"><div class="sectie-binnen"><p class="kruimel"><a href="/r${r}/">Kom naar de kerk.</a></p>${paneel(r, w, { kopNiveau: 1, los: true })}</div></section>${woordveld(r, { actiefId: w.id, metPanelen: false })}`;
    schrijf(`r${r}/${w.id}/index.html`, pagina(r, { titel: `${w.woord}? · Kom naar de kerk.`, pad: `/${w.id}/`, actief: null, inhoud, beschrijving: w.herkenning.join(' ') }));
  }
}
console.log(`✓ prototype: ${UIT} (3 richtingen × ${3 + LV.woorden.length} pagina's)`);
