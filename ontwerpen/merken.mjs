// Ronde 5 (issue #131): drie merken voor 'Kom naar de kerk.' — vlak, zonder gloed of verloop,
// werkt in één kleur en in kleur, van favicon tot spandoek.
//
//   A Portaal     — romaans portaal met drie terugwijkende bogen (archivolten) en een deur
//                   die op een kier staat: een smalle baan licht valt naar buiten.
//   B Kruisvenster — typografisch merk; de punt achter 'kerk' is een rondboogvenster
//                   waarvan de roeden een kruis vormen. Los te gebruiken als icoon.
//   C Ontmoeting  — twee eenvoudige deuren die elkaar overlappen. Waar ze elkaar raken,
//                   ontstaat een spitsboog: de vorm van een kerkdeur. Waar mensen
//                   samenkomen, ontstaat de kerk.

import { readFileSync } from 'node:fs';

const r2 = (n) => Math.round(n * 100) / 100;
const WOORD = JSON.parse(readFileSync(new URL('../voorstellen/merk/newsreader.json', import.meta.url), 'utf8'));
const ARCHIVO = JSON.parse(readFileSync(new URL('./merk/archivo-b.json', import.meta.url), 'utf8'));
const ATKINSON = JSON.parse(readFileSync(new URL('./merk/atkinson-c.json', import.meta.url), 'utf8'));

export const PALET = {
  A: {
    naam: 'Portaal',
    kleuren: [['Kalk', '#F2EFE9'], ['Leisteen', '#1E2A2F'], ['Baksteen', '#8E3B2A'], ['Daglicht', '#EADFC8'], ['Mos', '#55624F']],
    inkt: '#1E2A2F', papier: '#F2EFE9', licht: '#EADFC8', accent: '#8E3B2A'
  },
  B: {
    naam: 'Kruisvenster',
    kleuren: [['Papier', '#FAFAF8'], ['Inkt', '#101820'], ['Grafiet', '#4A525C'], ['Hemelsblauw', '#5B8DC9'], ['Ochtend', '#E6EEF7']],
    inkt: '#101820', papier: '#FAFAF8', licht: '#5B8DC9', accent: '#2F5F99'
  },
  C: {
    naam: 'Ontmoeting',
    kleuren: [['Linnen', '#FBF8F4'], ['Avond', '#1F2140'], ['Klei', '#C2603F'], ['Zee', '#2E6E78'], ['Licht', '#FBE9DA']],
    inkt: '#1F2140', papier: '#FBF8F4', licht: '#FBE9DA', links: '#C2603F', rechts: '#2E6E78'
  }
};

// ---------- A: portaal ----------
// rondboog met inzet d binnen een vak van 100 breed; bodem op y=140
function boog(d, bodem = 140) {
  const r = 50 - d;
  const ys = 50; // aanzet van de boog
  return `M${d} ${bodem}V${ys}A${r} ${r} 0 0 1 ${100 - d} ${ys}V${bodem}Z`;
}
export function portaal({ inkt = PALET.A.inkt, papier = PALET.A.papier, licht = null, deur = null, klein = false } = {}) {
  const lichtKleur = licht || papier;
  const deurKleur = deur || inkt;
  if (klein) {
    return `<path fill="${inkt}" d="${boog(0)}"/><path fill="${papier}" d="${boog(10)}"/><path fill="${deurKleur}" d="${boog(15)}"/><path fill="${lichtKleur}" d="M51 22H57V140H51Z"/>`;
  }
  // twee archivolten (terugwijkende bogen) rond de deur
  const ringen = [[0, inkt], [5, papier], [9, inkt], [13.5, papier]]
    .map(([d, k]) => `<path fill="${k}" d="${boog(d)}"/>`)
    .join('');
  const dDeur = 16;
  const deurVorm = `<path fill="${deurKleur}" d="${boog(dDeur)}"/>`;
  // de rechter vleugel staat op een kier: een rechte baan licht over de hele hoogte
  const kier = `<path fill="${lichtKleur}" d="M50.6 ${dDeur + 3}H55.4L56.4 140H50.6Z"/>`;
  // dorpel; het licht valt als een smalle waaier op de grond voor de deur
  const drempel = `<path fill="${inkt}" d="M-6 142H106V146H-6Z"/><path fill="${lichtKleur}" d="M50.6 142H56.4L68 146H47Z"/>`;
  const sluitsteen = `<path fill="${papier}" d="M48.8 0.4H51.2L50.9 4.6H49.1Z"/>`;
  return `${ringen}${sluitsteen}${deurVorm}${kier}${drempel}`;
}

// ---------- B: kruisvenster ----------
// rondboogvenster 60 breed, 100 hoog; roeden vormen een Latijns kruis (dwarsbalk hoog)
export function kruisvenster({ inkt = PALET.B.inkt, licht = null, papier = PALET.B.papier, kader = true } = {}) {
  const w = 60, h = 100, r = 30, g = 5; // g = breedte van de roede (het licht)
  const venster = `M0 ${h}V${r}A${r} ${r} 0 0 1 ${w} ${r}V${h}Z`;
  const yDwars = 38;
  const kruis = `M${w / 2 - g / 2} 8H${w / 2 + g / 2}V${yDwars - g / 2}H${w - 6}V${yDwars + g / 2}H${w / 2 + g / 2}V${h - 6}H${w / 2 - g / 2}V${yDwars + g / 2}H6V${yDwars - g / 2}H${w / 2 - g / 2}Z`;
  const rand = kader ? `<path fill="none" stroke="${inkt}" stroke-width="2" d="M-6 ${h + 6}V${r}A${r + 6} ${r + 6} 0 0 1 ${w + 6} ${r}V${h + 6}Z"/>` : '';
  return `${rand}<path fill="${inkt}" d="${venster}"/><path fill="${licht || papier}" d="${kruis}"/>`;
}

// ---------- C: ontmoeting ----------
// twee rondboogdeuren (breed 60, hoog 100) die 30 overlappen; de overlap is een spitsboog
export function ontmoeting({ links = PALET.C.links, rechts = PALET.C.rechts, midden = PALET.C.licht, mono = null } = {}) {
  const deur = (x) => `M${x} 120V30A30 30 0 0 1 ${x + 60} 30V120Z`;
  // overlap: x 30..60; bovenkant = snijpunt van twee bogen (middens 30 en 60, r 30): spits op x=45, y=30-25.98
  const overlap = `M30 120V30A30 30 0 0 1 45 ${r2(30 - 25.98)}A30 30 0 0 1 60 30V120Z`;
  if (mono) return `<path fill="${mono}" d="${deur(0)}"/><path fill="${mono}" d="${deur(30)}"/><path fill="${midden}" d="${overlap}"/>`;
  return `<path fill="${links}" d="${deur(0)}"/><path fill="${rechts}" d="${deur(30)}"/><path fill="${midden}" d="${overlap}"/>`;
}

const VB = { A: '-8 -2 116 149', B: '-8 -8 76 116', C: '-2 -2 94 124' };
export function merk(c, opties = {}) {
  const { titel = 'Kom naar de kerk.', klasse = '' } = opties;
  const aria = titel ? `role="img" aria-label="${titel}"` : 'aria-hidden="true" focusable="false"';
  const inhoud = c === 'A' ? portaal(opties) : c === 'B' ? kruisvenster(opties) : ontmoeting(opties);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VB[c]}" ${klasse ? `class="${klasse}"` : ''} ${aria}>${inhoud}</svg>`;
}

// favicon/app-icoon (vierkant, eigen achtergrond)
export function icoon(c, { maat = 64 } = {}) {
  const p = PALET[c];
  if (c === 'A') return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${maat}" height="${maat}" role="img" aria-label="Kom naar de kerk."><rect width="120" height="120" rx="22" fill="${p.inkt}"/><g transform="translate(30 17) scale(0.6)">${portaal({ inkt: p.papier, papier: p.inkt, licht: p.licht, klein: true })}</g></svg>`;
  if (c === 'B') return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${maat}" height="${maat}" role="img" aria-label="Kom naar de kerk."><rect width="120" height="120" rx="22" fill="${p.papier}"/><g transform="translate(36 14) scale(0.8)">${kruisvenster({ inkt: p.inkt, papier: p.papier, kader: false })}</g></svg>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${maat}" height="${maat}" role="img" aria-label="Kom naar de kerk."><rect width="120" height="120" rx="22" fill="${p.inkt}"/><g transform="translate(24 12) scale(0.8)">${ontmoeting({})}</g></svg>`;
}

// ---------- woordmerken ----------
// A: Newsreader, rustig, met merk links
export function logoA({ inkt = PALET.A.inkt, papier = PALET.A.papier, licht = null, klasse = 'logo' } = {}) {
  const w = WOORD['Kom naar de kerk'];
  const s = 1; const mh = w.upm * 1.45; const sm = mh / 151;
  const gat = w.upm * 0.32;
  const tekstX = 116 * sm + gat;
  const yBasis = mh * 0.9;
  const punt = `<circle cx="${tekstX + w.breedte + 130}" cy="${yBasis - 105}" r="105" fill="${PALET.A.accent}"/>`;
  const breedte = tekstX + w.breedte + 300;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.ceil(breedte)} ${Math.ceil(mh)}" class="${klasse}" role="img" aria-label="Kom naar de kerk."><g transform="translate(${8 * sm} ${2 * sm}) scale(${sm})">${portaal({ inkt, papier, licht })}</g><path transform="translate(${tekstX} ${yBasis}) scale(${s})" fill="${inkt}" d="${w.d}"/>${punt}</svg>`;
}
// B: Archivo, smal en zwaar, kleine letters; de punt is het venster
export function logoB({ inkt = PALET.B.inkt, papier = PALET.B.papier, licht = null, klasse = 'logo' } = {}) {
  const w = ARCHIVO['kom naar de kerk'];
  const hoogte = w.upm * 0.78;
  const vh = (w.xHoogte || w.upm * 0.52) * 1.02; const sv = vh / 100;
  const x = w.breedte + w.upm * 0.1;
  const breedte = x + 60 * sv + 10;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${-hoogte} ${Math.ceil(breedte)} ${Math.ceil(hoogte * 1.08)}" class="${klasse}" role="img" aria-label="Kom naar de kerk."><path fill="${inkt}" d="${w.d}"/><g transform="translate(${x} ${-vh}) scale(${sv})">${kruisvenster({ inkt: PALET.B.accent, papier, licht, kader: false })}</g></svg>`;
}
// C: Atkinson Hyperlegible Next, vriendelijk en goed leesbaar; merk links
export function logoC({ inkt = PALET.C.inkt, mono = null, klasse = 'logo' } = {}) {
  const w = ATKINSON['Kom naar de kerk'];
  const mh = w.upm * 1.05; const sm = mh / 124;
  const gat = w.upm * 0.26;
  const x = 94 * sm + gat;
  const y = mh * 0.86;
  const punt = `<circle cx="${x + w.breedte + 95}" cy="${y - 70}" r="70" fill="${mono || PALET.C.links}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.ceil(x + w.breedte + 190)} ${Math.ceil(mh)}" class="${klasse}" role="img" aria-label="Kom naar de kerk."><g transform="translate(${2 * sm} ${2 * sm}) scale(${sm})">${ontmoeting(mono ? { mono, midden: '#FBF8F4' } : {})}</g><path transform="translate(${x} ${y})" fill="${inkt}" d="${w.d}"/>${punt}</svg>`;
}
export { WOORD, ARCHIVO, ATKINSON };
