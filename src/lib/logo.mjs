// Logosysteem 'Kom naar de kerk.' — alle varianten als SVG uit code.
// Woordmerkpaden: merk/bron/woordmerk-*.json (gemaakt met scripts/merk_paden.py uit Newsreader, OFL).
// Concepten:
//   A  'De open deur'        — boogvormige deuropening, deur op een kier, licht valt naar buiten
//   B  'Portaal'             — drie geneste bogen (meerdere kerken, één ingang), licht in de kern
//   C  'De punt is een deur' — woordmerk-gedreven: de punt achter 'kerk.' is een kleine verlichte deur
// Gekozen richting: A + C (zie docs/MERK.md).

import { readFileSync } from 'node:fs';

const W500 = JSON.parse(readFileSync(new URL('../../merk/bron/woordmerk-500.json', import.meta.url), 'utf8'));
const W400 = JSON.parse(readFileSync(new URL('../../merk/bron/woordmerk-400.json', import.meta.url), 'utf8'));

export const KLEUREN = {
  inkt: '#1E2721',
  papier: '#F5EFE4',
  licht: '#E3A63F',
  lichtZacht: '#F0CF8C',
  mos: '#4C5B44',
  klei: '#9C4325'
};

// Kleurschema's: kleur (op licht), donker (op inkt), zwart (1 kleur), wit (1 kleur, negatief)
export const SCHEMA = {
  kleur: { tekst: KLEUREN.inkt, kozijn: KLEUREN.inkt, licht: KLEUREN.licht, vloer: KLEUREN.lichtZacht, deur: KLEUREN.mos, punt: KLEUREN.licht },
  donker: { tekst: KLEUREN.papier, kozijn: KLEUREN.papier, licht: KLEUREN.licht, vloer: '#8a6a3a', deur: KLEUREN.mos, punt: KLEUREN.licht },
  zwart: { tekst: '#000', kozijn: '#000', licht: 'none', vloer: 'none', deur: '#000', punt: '#000' },
  wit: { tekst: '#fff', kozijn: '#fff', licht: 'none', vloer: 'none', deur: '#fff', punt: '#fff' }
};

// ---------- beeldmerken (kader 0 0 100 120, dorpel op y=100) ----------
function boog(cx, top, b, onder) {
  // rondboog: halve cirkel boven, rechte zijden tot 'onder'
  const r = b / 2;
  return `M${cx - r} ${onder} V${top + r} A${r} ${r} 0 0 1 ${cx + r} ${top + r} V${onder}`;
}

export function merkA(s = SCHEMA.kleur) {
  // Rondboog (kozijn) met een deurblad op een kier: door de spleet valt licht naar buiten,
  // als een baan over de grond. Leest als 'open deur', niet als boog of grafsteen.
  const een = s.licht === 'none';
  const kozijn = `${boog(50, 10, 60, 100)} Z`; // buitenmaat
  const opening = `${boog(50, 16, 48, 100)} Z`; // binnenmaat
  const spleet = 'M57 100 L64.5 20.9 A24 24 0 0 1 74 40 V100 Z';
  const blad = 'M26 100 V40 A24 24 0 0 1 64.5 20.9 L57 100 Z';
  return [
    een ? '' : `<path d="M57 100 H74 L99 120 H38 Z" fill="${s.vloer}"/>`,
    // 1 kleur: de spleet is een uitsparing (evenodd), zodat elke ondergrond erdoor zichtbaar is.
    een ? `<path d="${kozijn} ${spleet}" fill-rule="evenodd" fill="${s.kozijn}"/>` : `<path d="${kozijn}" fill="${s.kozijn}"/><path d="${opening}" fill="${s.deur}"/><path d="${spleet}" fill="${s.licht}"/>`,
    een ? '' : `<path d="${blad}" fill="${s.deur}"/>`
  ].join('');
}

export function merkB(s = SCHEMA.kleur) {
  const een = s.licht === 'none';
  return [
    een ? '' : `<path d="M36 104 H64 L80 120 H20 Z" fill="${s.vloer}"/>`,
    een ? '' : `<path d="${boog(50, 40, 28, 100)} Z" fill="${s.licht}"/>`,
    `<path d="${boog(50, 40, 28, 100)}" fill="none" stroke="${s.kozijn}" stroke-width="5"/>`,
    `<path d="${boog(50, 26, 50, 100)}" fill="none" stroke="${s.kozijn}" stroke-width="5"/>`,
    `<path d="${boog(50, 12, 72, 100)}" fill="none" stroke="${s.kozijn}" stroke-width="5"/>`,
    `<path d="M10 102.5 H90" stroke="${s.kozijn}" stroke-width="5" stroke-linecap="round"/>`
  ].join('');
}

// De 'punt-deur': klein boogje (breedte 1, hoogte 1.45) — gebruikt als punt achter 'kerk.' en als minimaal merk.
export function puntDeur(x, y, b, kleur) {
  const r = b / 2;
  const h = b * 1.55;
  return `<path d="M${x} ${y} V${y - h + r} A${r} ${r} 0 0 1 ${x + b} ${y - h + r} V${y} Z" fill="${kleur}"/>`;
}

export function merkC(s = SCHEMA.kleur) {
  // Monogram 'K.' — de K uit het woordmerk met de punt-deur, op een rustig vlak.
  const k = W500['K'];
  const sc = 0.034; // letter-eenheden → kader
  const vlak = s.kozijn === '#fff' || s.kozijn === KLEUREN.papier ? KLEUREN.inkt : KLEUREN.papier;
  const letter = s.licht === 'none' ? s.kozijn : (vlak === KLEUREN.papier ? KLEUREN.inkt : KLEUREN.papier);
  return [
    s.licht === 'none' ? '' : `<rect x="0" y="10" width="100" height="100" rx="22" fill="${vlak}"/>`,
    `<g transform="translate(17 83) scale(${sc})"><path d="${k.d}" fill="${letter}"/>${puntDeur(1600, 0, 330, s.licht === 'none' ? s.kozijn : s.punt)}</g>`
  ].join('');
}

const MERKEN = { A: merkA, B: merkB, C: merkC };

// ---------- woordmerk ----------
// 'Kom naar de kerk' in paden + eigen punt (gewone punt of punt-deur).
function woord(tekst, gewicht = 500) {
  const bron = gewicht === 400 ? W400 : W500;
  return bron[tekst];
}

export function woordmerk({ s = SCHEMA.kleur, punt = 'deur', regels = 1, gewicht = 500 } = {}) {
  // Geeft { svg-inhoud, breedte, hoogte } in eenheden van de letter (upm 2000), basislijn regel 1 op y=asc.
  const asc = 1500;
  const regelafstand = 2150;
  const delen = regels === 1 ? ['Kom naar de kerk'] : ['Kom naar', 'de kerk'];
  let inhoud = '';
  let breedte = 0;
  delen.forEach((t, i) => {
    const w = woord(t, gewicht);
    const y = asc + i * regelafstand;
    inhoud += `<path transform="translate(0 ${y})" d="${w.d}" fill="${s.tekst}"/>`;
    let eind = w.breedte;
    if (i === delen.length - 1) {
      // punt na 'kerk'
      if (punt === 'deur') {
        inhoud += puntDeur(eind + 60, y, 300, s.punt);
        eind += 60 + 300;
      } else if (punt === 'gewoon') {
        inhoud += `<circle cx="${eind + 150}" cy="${y - 110}" r="110" fill="${s.tekst}"/>`;
        eind += 260;
      }
    }
    breedte = Math.max(breedte, eind);
  });
  const hoogte = asc + (delen.length - 1) * regelafstand + 560;
  return { inhoud, breedte, hoogte };
}

// ---------- samengestelde logo's ----------
function svg(vb, inhoud, titel) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="${titel}"><title>${titel}</title>${inhoud}</svg>`;
}

const TITEL = 'Kom naar de kerk.';

export function beeldmerkSvg(concept = 'A', schema = 'kleur') {
  return svg('0 0 100 120', MERKEN[concept](SCHEMA[schema]), TITEL);
}

export function woordmerkSvg({ schema = 'kleur', punt = 'deur', regels = 1, gewicht = 500 } = {}) {
  const w = woordmerk({ s: SCHEMA[schema], punt, regels, gewicht });
  return svg(`0 0 ${Math.ceil(w.breedte)} ${w.hoogte}`, w.inhoud, TITEL);
}

// Horizontaal: beeldmerk links, woordmerk rechts (beeldmerkhoogte ≈ 1,9 × kaphoogte).
export function horizontaalSvg({ concept = 'A', schema = 'kleur', punt = 'deur', gewicht = 500 } = {}) {
  const s = SCHEMA[schema];
  const w = woordmerk({ s, punt, gewicht });
  const mh = 2400; // merkhoogte in letter-eenheden
  const schaal = mh / 120;
  const mb = 100 * schaal;
  const gat = 520;
  const y0 = -120; // merk iets boven de kapregel
  const merk = `<g transform="translate(0 ${y0}) scale(${schaal})">${MERKEN[concept](s)}</g>`;
  const tekst = `<g transform="translate(${mb + gat} ${(mh + y0 - w.hoogte) / 2 + 380})">${w.inhoud}</g>`;
  return svg(`0 ${y0} ${Math.ceil(mb + gat + w.breedte)} ${mh}`, merk + tekst, TITEL);
}

// Compact/staand: beeldmerk boven, woordmerk in twee regels eronder, gecentreerd.
export function staandSvg({ concept = 'A', schema = 'kleur', punt = 'deur' } = {}) {
  const s = SCHEMA[schema];
  const w = woordmerk({ s, punt, regels: 2 });
  const mh = 3600;
  const schaal = mh / 120;
  const mb = 100 * schaal;
  const breedte = Math.max(w.breedte, mb);
  const merk = `<g transform="translate(${(breedte - mb) / 2} 0) scale(${schaal})">${MERKEN[concept](s)}</g>`;
  const tekst = `<g transform="translate(${(breedte - w.breedte) / 2} ${mh + 300})">${w.inhoud}</g>`;
  return svg(`0 0 ${Math.ceil(breedte)} ${mh + 300 + w.hoogte}`, merk + tekst, TITEL);
}

// App-icoon / favicon: beeldmerk op een vlak met ruime marge.
export function icoonSvg({ concept = 'A', achtergrond = KLEUREN.papier, schema = 'kleur', rond = 22 } = {}) {
  if (concept === 'C') return svg('0 0 100 120', merkC(SCHEMA[schema]), TITEL).replace('viewBox="0 0 100 120"', 'viewBox="-10 0 120 120"');
  return svg(
    '0 0 120 120',
    `<rect width="120" height="120" rx="${rond}" fill="${achtergrond}"/><g transform="translate(17 6) scale(0.86)">${MERKEN[concept](SCHEMA[schema])}</g>`,
    TITEL
  );
}

// Voor in de HTML-kop van de site (beeldmerk A, compact, decoratief).
export function kopMerk(klasse = 'beeldmerk') {
  return `<svg class="${klasse}" viewBox="0 0 100 120" aria-hidden="true" focusable="false">${merkA(SCHEMA.kleur).replace(/fill="#1E2721"/g, 'fill="currentColor"').replace(/stroke="#1E2721"/g, 'stroke="currentColor"')}</svg>`;
}
