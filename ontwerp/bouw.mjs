#!/usr/bin/env node
// Ronde 6 — het uitgewerkte ontwerp 'Open deur' voor Kom naar de kerk.
// Combineert de letter en het kruis van ontwerp B met de architectuur en het daglicht van ontwerp A.
// Los van de echte site: src/, content/, dist/ en de live preview blijven ongewijzigd tot de keuze is bevestigd.
//
//   node ontwerp/bouw.mjs && node ontwerp/serve.mjs 8794   → http://localhost:8794/

import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logoC, faviconC, merkC, ontmoetingFoto, LICHT } from './merk.mjs';
const KLEUR = { kalk: LICHT.papier, inkt: LICHT.inkt };

const HIER = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HIER, '..');
const UIT = path.join(HIER, 'dist');
const json = (p) => JSON.parse(readFileSync(path.join(ROOT, p), 'utf8'));
const W = json('ontwerp/woorden.json').woorden;
const SITE = json('content/site.json');
const KERKEN = json('content/kerken.json').kerken;
const INIT = json('content/initiatieven.json').initiatieven;
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ALPHA = INIT.find((i) => i.id === 'alpha-houten-najaar-2026');

// ---------- foto's (Wikimedia Commons, CC BY-SA 4.0) ----------
const FOTO = {
  'interieur-staand': { b: [600, 900, 1200], alt: 'De Pleinkerk in Houten van binnen. Daglicht valt door hoge ramen op lege houten banken.', maker: 'Rijksdienst voor het Cultureel Erfgoed, 1960', bron: 'https://commons.wikimedia.org/wiki/File:Interieur_naar_het_oosten_-_Houten_-_20117560_-_RCE.jpg' },
  'interieur-breed': { b: [960, 1600, 1920], alt: 'Het middenpad van de Pleinkerk in Houten, met banken aan beide kanten en licht door de ramen.', maker: 'Rijksdienst voor het Cultureel Erfgoed, 1960', bron: 'https://commons.wikimedia.org/wiki/File:Interieur_naar_het_oosten_-_Houten_-_20117560_-_RCE.jpg' },
  'weiland-breed': { b: [960, 1600, 1920], alt: 'De toren van de Pleinkerk boven de bomen van Houten, gezien vanuit het weiland, onder een wijde lucht.', maker: 'Jan Dijkstra', bron: 'https://commons.wikimedia.org/wiki/File:De_Nederlands_Hervormde_kerk_in_Houten.jpg' },
  'olv-bogen': { b: [600, 730], alt: 'Spitsbogen en een hoog glas-in-loodraam in de Onze Lieve Vrouw ten Hemelopnemingkerk in Houten.', maker: 'IdsVanHouten', bron: 'https://commons.wikimedia.org/wiki/File:HOUTEN_O.L.V._TEN_HEMELOPNEMING_01.jpg' },
  'olv-toren': { b: [600, 1000], alt: 'De spitse toren van de Onze Lieve Vrouw ten Hemelopnemingkerk in Houten tegen een blauwe lucht.', maker: 'Jan Dijkstra', bron: json('content/fotos.json')['rk-houten'].bron },
  'tgoy-gewelf': { b: [600, 900], alt: 'Het beschilderde gewelf van de Onze Lieve Vrouw ten Hemelopnemingkerk in ’t Goy, met in het midden een kruisbeeld.', maker: 'IdsVanHouten', bron: 'https://commons.wikimedia.org/wiki/File:%27T_GOY_O.L.V_TEN_HEMELOPNEMING_01.jpg' },
  'weiland-smal': { b: [400, 441], alt: 'De toren van de Pleinkerk onder een wijde, lichte lucht.', maker: 'Jan Dijkstra', bron: 'https://commons.wikimedia.org/wiki/File:De_Nederlands_Hervormde_kerk_in_Houten.jpg' },
  'pleinkerk-deur': { b: [560], alt: 'De openstaande houten deur van de Pleinkerk. Binnen valt licht door gekleurd glas.', maker: 'IdsVanHouten', bron: json('content/fotos.json').held.bron }
};
function foto(k, { sizes = '100vw', laden = 'lazy', klasse = '' } = {}) {
  const f = FOTO[k];
  const srcset = f.b.map((b) => `/gedeeld/foto/${k}-${b}.webp ${b}w`).join(', ');
  return `<img${klasse ? ` class="${klasse}"` : ''} src="/gedeeld/foto/${k}-${f.b[Math.min(1, f.b.length - 1)]}.webp" srcset="${srcset}" sizes="${sizes}" alt="${esc(f.alt)}" loading="${laden}" decoding="async">`;
}
const credit = (k) => `Foto: ${esc(FOTO[k].maker)}, <a href="${esc(FOTO[k].bron)}">CC BY-SA 4.0</a>`;

// ---------- vaste delen ----------
const NAV = [['/wie-is-jezus/', 'Wie is Jezus?'], ['/de-eerste-keer/', 'De eerste keer'], ['/kerken/', 'Kerken'], ['/over/', 'Over']];
function kop(actief) {
  return `<header class="kop"><div class="binnen kop-binnen">
<a class="kop-logo" href="/">${logoC({ detail: 'midden' })}</a>
<button type="button" class="menu-knop" aria-expanded="false" aria-controls="hoofdmenu" hidden>Menu</button>
<nav id="hoofdmenu" class="hoofdmenu" aria-label="Hoofdmenu"><ul role="list">${NAV.map(([h, t]) => `<li><a href="${h}"${h === actief ? ' aria-current="page"' : ''}>${t}</a></li>`).join('')}</ul></nav>
</div></header>`;
}
function voet() {
  return `<footer class="voet"><div class="binnen voet-raster">
<div class="voet-merk"><a href="/">${logoC({ inkt: LICHT.papier, merkOpties: { kruis: LICHT.papier } })}</a><p>Een uitnodiging van christenen in Houten, Schalkwijk en ’t Goy.</p></div>
<nav aria-label="Onderaan"><ul role="list">${NAV.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join('')}</ul></nav>
<div class="voet-hulp"><p><strong>Gaat het echt niet goed met je?</strong> Bel je huisarts, of 113 Zelfmoordpreventie: <a href="tel:08000113">0800-0113</a> (gratis, dag en nacht). Of praat met De Luisterlijn: <a href="tel:0880767000">088 0767 000</a>.</p></div>
</div>
<div class="binnen voet-onder"><p>Dit is een ontwerp. De kerken hebben hier nog niet mee ingestemd. We bewaren niets van wat je op deze site doet.</p><p class="maker"><a href="https://denckh.nl">Concept en realisatie door <img src="/gedeeld/denckh-logo-signature-light.svg" width="72" height="22" alt="Denckh.nl"></a></p></div>
</footer>`;
}
function pagina({ titel, beschrijving, actief = null, inhoud, klasse = '' }) {
  return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${esc(titel)}</title>
<meta name="description" content="${esc(beschrijving)}">
<meta name="theme-color" content="${LICHT.papier}">
<link rel="icon" href="/gedeeld/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/gedeeld/stijl.css">
<script src="/gedeeld/site.js" defer></script>
</head>
<body${klasse ? ` class="${klasse}"` : ''}>
<a class="overslaan" href="#inhoud">Naar de inhoud</a>
<div class="conceptbalk" role="region" aria-label="Ontwerp"><p><strong>Ontwerp</strong> voor Kom naar de kerk. Nog niet gepubliceerd.</p></div>
${kop(actief)}
<main id="inhoud">
${inhoud}
</main>
${voet()}
</body>
</html>
`;
}

// ---------- woorden ----------
const bijbel = (code) => `https://www.debijbel.nl/bijbel/NBV21/${code}`;
function hulp(w) {
  if (!w.hulp) return '';
  if (w.hulp === 'hulplijnen') return `<p class="hulp">Gaat het echt niet goed? Praat met je huisarts. Of bel 113: <a href="tel:08000113">0800-0113</a> (gratis, dag en nacht) of De Luisterlijn: <a href="tel:0880767000">088 0767 000</a>.</p>`;
  return `<p class="hulp">${esc(w.hulp)}</p>`;
}
const STAPPEN = `<ul class="stappen" role="list"><li><a class="knop" href="/wie-is-jezus/">Ontdek Jezus</a></li><li><a class="knop knop-lijn" href="/de-eerste-keer/">Wat gebeurt er in de kerk?</a></li><li><a class="knop knop-lijn" href="/kerken/">Vind een kerk</a></li></ul>`;
function paneel(w, { los = false } = {}) {
  const h = los ? 'h1' : 'h3';
  return `<article class="paneel"${los ? '' : ` id="paneel-${w.id}" hidden`} aria-labelledby="kop-${w.id}">
<div class="paneel-links"><${h} id="kop-${w.id}" class="paneel-kop" tabindex="-1">${esc(w.woord)}?</${h}>
<p class="herkenning">${esc(w.herkenning)}</p></div>
<div class="paneel-rechts">
<blockquote class="hoop"><p>${esc(w.hoop)}</p><footer>${esc(w.bijbel)} · <a href="${bijbel(w.code)}">lees het in de Bijbel</a></footer></blockquote>
<p class="in-kerk">${esc(w.kerk)}</p>
${hulp(w)}
<p class="wat-nu">Wat wil je nu doen?</p>
${STAPPEN}
${los ? '' : '<p class="ander"><button type="button" class="tekstknop" data-sluit>Kies een ander woord</button></p>'}
</div>
</article>`;
}
function woordveld({ actief = null, panelen = true, kopNiveau = 'h2' } = {}) {
  return `<section class="woordveld" id="woorden" aria-labelledby="woorden-kop"><div class="binnen">
<p class="bovenkop">Kies wat bij je past</p>
<${kopNiveau} id="woorden-kop">Wat houdt je bezig?</${kopNiveau}>
<ul class="woorden" role="list">${W.map((w) => `<li><a class="woord" href="/${w.id}/" data-woord="${w.id}"${w.id === actief ? ' aria-current="page"' : ''}>${esc(w.woord)}?</a></li>`).join('')}</ul>
${panelen ? `<div class="panelen">${W.map((w) => paneel(w)).join('')}</div>` : ''}
</div></section>`;
}

// ---------- homepage ----------
const WISSEL = W.filter((w) => w.wissel).map((w) => ({ id: w.id, w: `${w.woord}?` }));
function hero() {
  const e = WISSEL[0];
  return `<section class="hero"><div class="binnen hero-raster">
<div class="hero-tekst">
<p class="bovenkop">Houten · Schalkwijk · ’t Goy</p>
<div class="wissel-blok"><p class="wissel-regel"><a class="wissel" href="/${e.id}/" data-woord="${e.id}" data-woorden="${esc(JSON.stringify(WISSEL))}">${esc(e.w)}</a></p>
<p class="wissel-knoppen" hidden><button type="button" class="tekstknop" data-ander>Ander woord</button><button type="button" class="tekstknop" data-pauze aria-pressed="false">Pauze</button></p></div>
<h1>Kom naar de kerk. <em>Er is plek voor jou.</em></h1>
<p class="hero-zin">Een uitnodiging van christenen uit Houten en omgeving. Je hoeft niets te weten en niets te kunnen. Kom zoals je bent.</p>
<p class="knoppen"><a class="knop" href="/kerken/">Vind een kerk</a><a class="knop knop-lijn" href="#woorden">Wat houdt je bezig?</a></p>
</div>
<figure class="ontmoeting">
${ontmoetingFoto({ src: '/gedeeld/foto/weiland-smal-441.webp', alt: 'Twee deurbogen die elkaar raken. In de spitsboog daartussen: de lucht boven de toren van de Pleinkerk in Houten.' })}
<figcaption>Waar God en mens elkaar ontmoeten. ${credit('weiland-smal')}</figcaption>
</figure>
</div></section>`;
}
function welkom() {
  const v = [
    ['Wat is dit?', 'Een uitnodiging om Jezus en de kerk te leren kennen. Van christenen uit Houten en omgeving.'],
    ['Voor wie?', 'Voor iedereen. Ook als je nooit in een kerk komt, of al lang niet meer. Ook als je twijfelt.'],
    ['Wat vind je hier?', 'Wie Jezus is. Wat er in een kerkdienst gebeurt. En welke kerken er bij jou in de buurt zijn.'],
    ['Waar kun je heen?', 'Naar een kerkdienst op zondag. Of eerst naar een avond met eten en gesprek, zoals Alpha.']
  ];
  return `<section class="welkom" aria-labelledby="welkom-kop"><div class="binnen"><h2 id="welkom-kop" class="sr">In het kort</h2><dl class="welkom-lijst">${v.map(([a, b]) => `<div class="onthul"><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl></div></section>`;
}
function jezusBlok() {
  return `<section class="jezus-blok" aria-labelledby="jezus-kop"><div class="binnen jezus-raster">
<div class="onthul"><p class="bovenkop">Waar het om draait</p><h2 id="jezus-kop">Wie is Jezus?</h2>
<p class="groot">Jezus zocht mensen op die anderen links lieten liggen. Hij stierf aan het kruis en stond op uit de dood. Christenen geloven dat Hij leeft, en dat je bij Hem mag komen.</p>
<p><a class="knop knop-licht" href="/wie-is-jezus/">Lees wie Jezus is</a></p></div>
<blockquote class="citaat onthul"><p>‘Kom bij Mij, als je moe bent en veel te dragen hebt. Bij Mij vind je rust.’</p><footer>Jezus, vrij naar Matteüs 11:28 · <a href="${bijbel('MAT.11')}">lees het in de Bijbel</a></footer></blockquote>
</div></section>`;
}
function eersteKeerBlok() {
  return `<section class="eerste-blok" aria-labelledby="eerste-kop"><div class="binnen eerste-raster">
<figure class="foto-kader deur-foto onthul">${foto('pleinkerk-deur', { sizes: '(min-width: 62rem) 24rem, 80vw' })}<figcaption>De open deur van de Pleinkerk. ${credit('pleinkerk-deur')}</figcaption></figure>
<div class="onthul"><p class="bovenkop">Voor het eerst naar de kerk</p><h2 id="eerste-kop">Wat gebeurt er in de kerk?</h2>
<ul class="punten-lijst" role="list"><li>Je bent welkom zoals je bent. Gewone kleren zijn prima.</li><li>Er wordt gezongen, gebeden en voorgelezen uit de Bijbel.</li><li>Je hoeft niets mee te doen en niets te geven.</li><li>Na afloop is er vaak koffie.</li></ul>
<p><a class="knop knop-lijn" href="/de-eerste-keer/">Zo gaat een kerkdienst</a></p></div>
</div></section>`;
}
const DAG = { zondag: 'zondag', maandag: 'maandag', dinsdag: 'dinsdag', woensdag: 'woensdag', donderdag: 'donderdag', vrijdag: 'vrijdag', zaterdag: 'zaterdag' };
const tijdNL = (t) => `${Number(t.slice(0, 2))}.${t.slice(3)}`;
const SOORT = { protestants: 'Protestants', reformatorisch: 'Protestants', evangelisch: 'Evangelisch', 'rooms-katholiek': 'Rooms-katholiek' };
const plaatsNL = (p) => p.replace(/'/g, '’');
const lijstNL = (a) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} en ${a[a.length - 1]}`);
function kerkenBlok() {
  const rij = (k) => {
    const z = k.diensten.filter((d) => d.dag === 'zondag' && d.tijd).map((d) => d.tijd).sort().map(tijdNL);
    return `<li><span class="kb-naam">${esc(plaatsNL(k.naam))}</span><span class="kb-tijd">${z.length ? `zondag ${lijstNL(z)} uur` : 'zie website'}</span></li>`;
  };
  return `<section class="kerken-blok" aria-labelledby="kerken-kop"><div class="binnen">
<div class="onthul"><p class="bovenkop">Waar kun je heen?</p><h2 id="kerken-kop">Kerken bij jou in de buurt</h2>
<p class="intro">Elf kerken in Houten, Schalkwijk en ’t Goy. Protestants, evangelisch en katholiek. Kies er gewoon één.</p></div>
<ul class="kb-lijst onthul" role="list">${[...KERKEN].sort((a, b) => a.naam.localeCompare(b.naam, 'nl')).map(rij).join('')}</ul>
<p class="onthul"><a class="knop" href="/kerken/">Adres, tijden en route</a></p>
</div></section>`;
}

// ---------- Wie is Jezus? ----------
function wieIsJezus() {
  const stappen = [
    ['God kent je', 'God heeft de wereld gemaakt, en jou ook. Hij kent je en houdt van je.'],
    ['Wij gaan onze eigen weg', 'Mensen keren zich af van God. Dat zie je in de wereld. En eerlijk gezegd ook in onszelf.'],
    ['God kwam zelf', 'In Jezus werd God mens. Jezus zocht mensen op, genas zieken en vertelde over God als een vader die op je wacht.'],
    ['Het kruis en het lege graf', 'Jezus stierf aan het kruis, voor ons. Drie dagen later stond Hij op uit de dood. Daardoor kan God ons vergeven. Dat heet genade: je krijgt het, je hoeft het niet te verdienen.'],
    ['Je mag bij Hem horen', 'Jezus nodigt je uit om Hem te leren kennen. Dat doe je door te bidden, de Bijbel te lezen en samen te komen met andere christenen. Dat is de kerk.']
  ];
  const samen = [
    ['God', 'Er is één God: Vader, Zoon en Heilige Geest. Hij heeft alles gemaakt en houdt van mensen.'],
    ['Jezus Christus', 'Jezus is Gods Zoon. Hij werd mens, stierf aan het kruis en stond op uit de dood.'],
    ['Genade', 'Vergeving krijg je van God, als een cadeau. Niet omdat je het verdient.'],
    ['De Bijbel', 'In de Bijbel maakt God zich bekend. Daarom lezen christenen erin, alleen en samen.'],
    ['Hoop', 'Christenen verwachten dat Jezus terugkomt, en dat de dood niet het laatste woord heeft.']
  ];
  return `<section class="paginakop met-foto"><div class="paginakop-foto">${foto('weiland-breed', { laden: 'eager' })}</div><div class="binnen paginakop-tekst"><p class="bovenkop">Waar het om draait</p><h1>Wie is Jezus?</h1><p class="intro">Het christelijk geloof draait niet om regels, maar om een persoon: Jezus Christus. Hier lees je in het kort wie Hij is.</p><p class="credit">${credit('weiland-breed')}</p></div></section>
<section class="tekstsectie"><div class="binnen smal"><h2>Het goede nieuws in vijf stappen</h2><ol class="vijf" role="list">${stappen.map(([k, t]) => `<li class="onthul"><h3>${k}</h3><p>${t}</p></li>`).join('')}</ol></div></section>
<section class="tekstsectie donker"><div class="binnen smal"><h2>Wat staat er in de Bijbel?</h2><p class="groot">De Bijbel is een verzameling boeken, geschreven in ongeveer 1500 jaar. Het eerste deel gaat over God en het volk Israël. Het tweede deel gaat over Jezus en de eerste christenen.</p><p>Wil je zelf beginnen? Lees dan het verhaal van Marcus. Het is kort en je leest het in een avond.</p><p><a class="knop knop-licht" href="${bijbel('MRK.1')}">Lees Marcus op debijbel.nl</a></p></div></section>
<section class="tekstsectie"><div class="binnen smal"><h2>Wat christenen samen geloven</h2><p class="intro">Katholieken, protestanten en evangelischen verschillen in sommige dingen. Maar dit geloven ze samen. Het staat al eeuwen in de Apostolische Geloofsbelijdenis.</p><dl class="samen">${samen.map(([a, b]) => `<div class="onthul"><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl></div></section>
<section class="tekstsectie licht"><div class="binnen smal"><h2>Wil je meer weten?</h2><div class="keuzes">
<div class="keuze onthul"><h3>Praat erover bij een maaltijd</h3><p>Alpha Houten: elke woensdagavond om 18.30 uur in De Lichtboog. Je eet samen, luistert naar een korte inleiding en praat erover. Gratis, voor iedereen, gelovig of niet. Er starten een paar keer per jaar nieuwe groepen.</p><p><a href="${esc(ALPHA.website)}">Meer over Alpha</a></p></div>
<div class="keuze onthul"><h3>Ga een keer mee naar de kerk</h3><p>Elke zondag zijn er diensten in Houten, Schalkwijk en ’t Goy. Je mag gewoon binnenlopen.</p><p><a href="/kerken/">Vind een kerk</a></p></div>
</div></div></section>`;
}

// ---------- De eerste keer ----------
const DIENST = {
  protestants: {
    naam: 'Protestants of evangelisch', duur: 'Een dienst duurt meestal een uur tot anderhalf uur.', foto: 'pleinkerk-deur',
    stappen: [
      ['Binnenkomen', 'Bij de deur geeft iemand je een hand. Soms krijg je een papier met de liederen.', 'Ga zitten waar je wilt. Achterin is prima.'],
      ['Zingen', 'Er worden liederen en psalmen gezongen. De tekst staat op een scherm of in een boek.', 'Zing mee of luister. Allebei goed.'],
      ['Bidden', 'Iemand bidt hardop. Voor de kerk, het dorp, de wereld en voor mensen die het moeilijk hebben.', 'Doe je ogen dicht of houd ze open. Je mag in stilte meebidden.'],
      ['Uit de Bijbel lezen', 'Er wordt een stuk uit de Bijbel voorgelezen.', 'Lees mee op het scherm of luister gewoon.'],
      ['De preek', 'De dominee of voorganger legt uit wat de Bijbeltekst betekent voor nu. Dat duurt zo’n twintig minuten tot een half uur.', 'Luister. Vragen kun je na afloop stellen.'],
      ['De collecte', 'Er wordt geld ingezameld voor de kerk en voor goede doelen.', 'Je hoeft niets te geven.'],
      ['De zegen en koffie', 'Aan het eind wordt Gods zegen uitgesproken. Daarna drinken mensen vaak samen koffie.', 'Blijf even, of ga gewoon naar huis.']
    ],
    noot: 'Soms is er avondmaal, met brood en wijn of druivensap. Wie daaraan meedoet, verschilt per kerk. Twijfel je? Blijf gerust zitten.'
  },
  katholiek: {
    naam: 'Rooms-katholiek', duur: 'Een mis duurt meestal ongeveer een uur.', foto: 'tgoy-gewelf',
    stappen: [
      ['Binnenkomen', 'Bij de ingang staat wijwater. Veel mensen maken daarmee een kruisteken.', 'Dat hoeft niet. Ga zitten waar je wilt.'],
      ['Opening', 'Er wordt gezongen en gebeden. Samen vraagt men God om ontferming: ‘Heer, ontferm U.’', 'Luister, of zeg mee als de tekst er staat.'],
      ['Lezingen', 'Er worden stukken uit de Bijbel gelezen. Voor het evangelie gaat iedereen staan.', 'Ga mee staan, of blijf zitten.'],
      ['De preek', 'De priester legt de lezingen uit. Meestal is dat kort.', 'Luister.'],
      ['De eucharistie', 'De priester bidt over brood en wijn. Daarna gaan mensen naar voren voor de communie.', 'De communie is voor katholieken. Je mag blijven zitten. Of ga naar voren met je armen gekruist, dan krijg je een zegen.'],
      ['Zegen en slotlied', 'De priester zegent iedereen. De mis eindigt met een lied.', 'Doe mee zoals je wilt.']
    ],
    noot: 'Na afloop is er soms koffie. Vraag gerust iemand wat je niet begrijpt.'
  }
};
const VRAGEN = [
  ['Wat trek ik aan?', 'Wat je normaal ook draagt. Sommige mensen kleden zich wat netter, maar dat hoeft niet.'],
  ['Moet ik iets geven?', 'Nee. Er gaat een zak of schaal rond voor geld. Je mag die gewoon doorgeven.'],
  ['Mag ik mijn kinderen meenemen?', 'Ja. In veel kerken is er oppas voor kleine kinderen en iets voor oudere kinderen. Bij de kerken zie je waar.'],
  ['Wat als ik iets niet snap?', 'Dat is heel normaal. Vraag het na afloop gerust. Mensen vinden het meestal leuk om uit te leggen.'],
  ['Kan ik eerst online kijken?', 'Ja. Veel kerken zenden hun diensten uit. Bij de kerken staat welke.']
];
const LIJST = [
  ['Amen', '‘Zo is het.’ Dit zeg je aan het eind van een gebed.'],
  ['Avondmaal', 'Protestantse viering met brood en wijn, om Jezus te gedenken.'],
  ['Collecte', 'Inzameling van geld tijdens de dienst. Geven is vrijwillig.'],
  ['Communie', 'In de katholieke mis: het ontvangen van het brood.'],
  ['Eucharistie', 'De katholieke viering van brood en wijn. Het woord betekent ‘dank’.'],
  ['Preek', 'Uitleg over een stuk uit de Bijbel.'],
  ['Psalm', 'Een lied uit de Bijbel. Er zijn er honderdvijftig.'],
  ['Voorganger', 'Wie de dienst leidt: dominee, pastor, priester of een gemeentelid.'],
  ['Zegen', 'Aan het eind van de dienst: woorden waarmee Gods goedheid aan iedereen wordt toegezegd.']
];
function eersteKeer() {
  const deel = (k, d) => `<section class="dienst" id="dienst-${k}" aria-labelledby="dk-${k}"><h2 id="dk-${k}" class="dienst-kop">${d.naam}</h2><p class="duur">${d.duur}</p><div class="dienst-raster"><figure class="foto-kader">${foto(d.foto, { sizes: '(min-width: 62rem) 26rem, 100vw' })}<figcaption>${credit(d.foto)}</figcaption></figure><ol class="dienst-stappen" role="list">${d.stappen.map(([t, wat, jij], i) => `<li><span class="nr" aria-hidden="true">${i + 1}</span><div><h3>${t}</h3><p>${wat}</p><p class="jij"><strong>Jij:</strong> ${jij}</p></div></li>`).join('')}</ol></div><p class="noot">${d.noot}</p></section>`;
  return `<section class="paginakop met-foto"><div class="paginakop-foto">${foto('interieur-breed', { laden: 'eager' })}</div><div class="binnen paginakop-tekst"><p class="bovenkop">Voor het eerst naar de kerk</p><h1>De eerste keer</h1><p class="intro">Wat gebeurt er in een kerkdienst? En wat moet jij doen? Kort gezegd: niets. Hier lees je hoe het gaat.</p><p class="credit">${credit('interieur-breed')}</p></div></section>
<div class="binnen eerste">
<p class="let-op">Elke kerk is anders. Dit is een algemeen beeld. Muziek, lengte en gewoonten verschillen per kerk.</p>
<div class="tabs" hidden><div role="tablist" aria-label="Soort kerk"><button type="button" role="tab" id="tab-protestants" aria-controls="dienst-protestants" aria-selected="true">Protestants of evangelisch</button><button type="button" role="tab" id="tab-katholiek" aria-controls="dienst-katholiek" aria-selected="false" tabindex="-1">Rooms-katholiek</button></div></div>
${deel('protestants', DIENST.protestants)}
${deel('katholiek', DIENST.katholiek)}
<section class="vragen" aria-labelledby="vragen-kop"><h2 id="vragen-kop">Vragen die veel mensen hebben</h2><dl>${VRAGEN.map(([v, a]) => `<div class="onthul"><dt>${v}</dt><dd>${a}</dd></div>`).join('')}</dl></section>
<section class="woordenlijst" aria-labelledby="wl-kop"><h2 id="wl-kop">Kerkwoorden, kort uitgelegd</h2><dl>${LIJST.map(([t, b]) => `<div><dt>${t}</dt><dd>${b}</dd></div>`).join('')}</dl></section>
<p class="slot"><a class="knop" href="/kerken/">Kies een kerk</a></p>
</div>`;
}

// ---------- Kerken ----------
function kerken() {
  const DAGEN = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
  const kaart = (k) => {
    const d = k.diensten.filter((x) => x.tijd && DAGEN.includes(x.dag)).sort((a, b) => (DAGEN.indexOf(a.dag) - DAGEN.indexOf(b.dag)) || a.tijd.localeCompare(b.tijd));
    const kenm = new Set(k.kenmerken);
    if (d.some((x) => x.tijd >= '12:00')) kenm.add('middag');
    const adres = `${k.adres}, ${k.postcode} ${k.plaats}`;
    const data = JSON.stringify(d.map((x) => ({ dag: x.dag, tijd: x.tijd, wat: x.omschrijving || 'Kerkdienst', agenda: x.agenda !== false })));
    const tijden = d.length ? d.map((x) => `${DAG[x.dag]} ${tijdNL(x.tijd)} uur`).join(' · ') : 'Tijden: zie de website van de kerk';
    const soort = k.traditie === 'reformatorisch' ? 'Protestants' : SOORT[k.traditie];
    return `<li class="kerk" data-soort="${k.traditie === 'reformatorisch' ? 'protestants' : k.traditie}" data-plaats="${esc(k.plaats)}" data-kenmerken="${[...kenm].join(' ')}" data-diensten="${esc(data)}" data-naam="${esc(k.naam)}" data-adres="${esc(adres)}">
<h2 class="kerk-naam">${esc(plaatsNL(k.naam))}</h2><p class="kerk-soort">${soort} · ${esc(plaatsNL(k.plaats))}</p>
<p class="kerk-tijd" data-volgende>${tijden}</p>
<ul class="kerk-feiten" role="list">${kenm.has('kinderen') ? '<li>Iets voor kinderen</li>' : ''}${kenm.has('oppas') ? '<li>Oppas</li>' : ''}${kenm.has('online') ? '<li>Ook online</li>' : ''}</ul>
<p class="kerk-adres">${esc(k.adres)}, ${esc(plaatsNL(k.plaats))}</p>
<p class="kerk-links"><a href="https://www.openstreetmap.org/search?query=${encodeURIComponent(adres)}">Route</a><a href="${esc(k.website)}">Website</a><span data-agenda></span></p>
</li>`;
  };
  const vink = (v, t) => `<label><input type="checkbox" name="wens" value="${v}"> ${t}</label>`;
  const radio = (n, v, t, c = false) => `<label><input type="radio" name="${n}" value="${v}"${c ? ' checked' : ''}> ${t}</label>`;
  const lijst = [...KERKEN].sort((a, b) => a.naam.localeCompare(b.naam, 'nl'));
  return `<section class="paginakop met-foto"><div class="paginakop-foto">${foto('olv-toren', { laden: 'eager' })}</div><div class="binnen paginakop-tekst"><p class="bovenkop">Waar kun je heen?</p><h1>Kerken in Houten en omgeving</h1><p class="intro">Elf kerken. Kies er een die bij je past, of gewoon de dichtstbijzijnde. Je mag overal binnenlopen.</p><p class="credit">${credit('olv-toren')}</p></div></section>
<div class="binnen kerken-pagina">
<p class="let-op">Dit is een ontwerp. We hebben deze kerken nog niet gevraagd om mee te doen. De tijden komen van hun eigen websites (8 november 2026). Kijk voor de zekerheid nog even op hun site.</p>
<form class="filters" hidden aria-labelledby="filter-kop"><h2 id="filter-kop" class="filter-kop">Wat is voor jou handig?</h2>
<fieldset><legend>Ik zoek</legend>${vink('kinderen', 'iets voor kinderen')}${vink('oppas', 'oppas')}${vink('middag', 'een dienst later op de dag')}${vink('online', 'eerst online kijken')}</fieldset>
<fieldset><legend>Soort kerk</legend>${radio('soort', '', 'Maakt niet uit', true)}${radio('soort', 'protestants', 'Protestants')}${radio('soort', 'evangelisch', 'Evangelisch')}${radio('soort', 'rooms-katholiek', 'Rooms-katholiek')}</fieldset>
<fieldset><legend>Plaats</legend>${radio('plaats', '', 'Alle', true)}${radio('plaats', 'Houten', 'Houten')}${radio('plaats', 'Schalkwijk', 'Schalkwijk')}${radio('plaats', "'t Goy", '’t Goy')}</fieldset>
</form>
<p class="aantal" aria-live="polite" data-aantal>${lijst.length} kerken</p>
<ul class="kerk-lijst" role="list">${lijst.map(kaart).join('')}</ul>
</div>`;
}

// ---------- Over ----------
function over() {
  return `<section class="paginakop"><div class="binnen paginakop-tekst"><p class="bovenkop">Over deze site</p><h1>Wie zitten hierachter?</h1><p class="intro">Kom naar de kerk. is een idee van christenen in Houten. Het doel is simpel: mensen uitnodigen om Jezus en de kerk te leren kennen.</p></div></section>
<section class="tekstsectie"><div class="binnen smal">
<h2>Waar staat het nu?</h2><p>Dit is nog een ontwerp. De kerken op deze site doen nog niet officieel mee. We nemen pas een kerk op als die daar zelf ja op zegt. De gegevens komen nu van de eigen websites van de kerken.</p>
<h2>Wat wij geloven</h2><p>Jezus Christus staat centraal. Kerken die meedoen, delen het christelijk geloof zoals dat al eeuwen in de Apostolische Geloofsbelijdenis staat. Ze verschillen in andere dingen, en dat mag. <a href="/wie-is-jezus/">Lees wie Jezus is</a>.</p>
<h2>Je privacy</h2><p>Deze site gebruikt geen cookies en geen tracking. Wat je kiest of leest, blijft op je eigen scherm. We bewaren niets en sturen niets door.</p>
<h2>Hulp nodig?</h2><p>Een kerk is geen hulpverlening. Gaat het echt niet goed met je? Bel je huisarts. Of bel 113 Zelfmoordpreventie: <a href="tel:08000113">0800-0113</a> (gratis, dag en nacht). Voor een luisterend oor: De Luisterlijn, <a href="tel:0880767000">088 0767 000</a>.</p>
<h2>Gemaakt door</h2><p>Concept en ontwerp: <a href="https://denckh.nl">Denckh.nl</a>. Foto’s: Wikimedia Commons, met de naam van de maker bij elke foto.</p>
</div></section>`;
}

// ---------- bouwen ----------
rmSync(UIT, { recursive: true, force: true });
const schrijf = (rel, s) => { const p = path.join(UIT, rel); mkdirSync(path.dirname(p), { recursive: true }); writeFileSync(p, s); };
const kopieer = (van, naar) => { mkdirSync(path.dirname(path.join(UIT, naar)), { recursive: true }); copyFileSync(path.join(ROOT, van), path.join(UIT, naar)); };
for (const f of ['archivo', 'atkinson-next', 'newsreader-opsz-normal', 'newsreader-opsz-italic']) kopieer(`voorstellen/fonts/${f}.woff2`, `gedeeld/fonts/${f}.woff2`);
for (const f of readdirSync(path.join(HIER, 'foto'))) if (f.endsWith('.webp')) kopieer(`ontwerp/foto/${f}`, `gedeeld/foto/${f}`);
kopieer('ontwerp/stijl.css', 'gedeeld/stijl.css');
kopieer('ontwerp/site.js', 'gedeeld/site.js');
kopieer('ontwerp/spitsboog-masker.svg', 'gedeeld/spitsboog-masker.svg');
kopieer('src/static/merk/denckh/denckh-logo-signature-light.svg', 'gedeeld/denckh-logo-signature-light.svg');
schrijf('gedeeld/favicon.svg', faviconC());
schrijf('gedeeld/beeldmerk.svg', merkC());
schrijf('gedeeld/logo.svg', logoC({ detail: 'groot' }));

const OMS = 'Kom naar de kerk. Er is plek voor jou. Een uitnodiging van christenen uit Houten, Schalkwijk en ’t Goy om Jezus en de kerk te leren kennen.';
schrijf('index.html', pagina({ titel: 'Kom naar de kerk. Er is plek voor jou.', beschrijving: OMS, inhoud: `${hero()}${welkom()}${woordveld()}${jezusBlok()}${eersteKeerBlok()}${kerkenBlok()}`, klasse: 'thuis' }));
schrijf('wie-is-jezus/index.html', pagina({ titel: 'Wie is Jezus? · Kom naar de kerk.', beschrijving: 'Het christelijk geloof in het kort: wie Jezus is, wat er in de Bijbel staat en wat christenen samen geloven.', actief: '/wie-is-jezus/', inhoud: wieIsJezus() }));
schrijf('de-eerste-keer/index.html', pagina({ titel: 'De eerste keer · Kom naar de kerk.', beschrijving: 'Wat gebeurt er in een kerkdienst, en wat moet jij doen? Stap voor stap, voor protestantse, evangelische en katholieke kerken.', actief: '/de-eerste-keer/', inhoud: eersteKeer() }));
schrijf('kerken/index.html', pagina({ titel: 'Kerken · Kom naar de kerk.', beschrijving: 'Elf kerken in Houten, Schalkwijk en ’t Goy, met tijden, adres en route.', actief: '/kerken/', inhoud: kerken() }));
schrijf('over/index.html', pagina({ titel: 'Over · Kom naar de kerk.', beschrijving: 'Wie zitten achter Kom naar de kerk., wat we geloven en hoe we met je privacy omgaan.', actief: '/over/', inhoud: over() }));
for (const w of W) {
  schrijf(`${w.id}/index.html`, pagina({ titel: `${w.woord}? · Kom naar de kerk.`, beschrijving: w.herkenning, inhoud: `<section class="woordpagina"><div class="binnen"><p class="terug"><a href="/">Kom naar de kerk.</a></p>${paneel(w, { los: true })}</div></section>${woordveld({ actief: w.id, panelen: false })}` }));
}
console.log(`✓ ontwerp: ${UIT} (${5 + W.length} pagina's)`);
