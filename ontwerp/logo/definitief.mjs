// HET RAAKPUNT — definitief logo van 'Kom naar de kerk.' (ronde 12)
// God reikt van boven, de mens van onder. Waar ze elkaar bijna raken, breekt hemels licht door.
//
// Exports: beeldmerk (kleur, gelaagd licht), beeldmerkVlak (klein, geen verlopen), beeldmerkMono (één kleur),
// favicon, logoHorizontaal, logoStaand, KLEUR. Woordmerk in Newsreader; de punt is een gouden lichtpunt.
// Gebruik: node ontwerp/logo/exporteer.mjs → ontwerp/logo/definitief/*.svg|png

import { readFileSync } from 'node:fs';

export const KLEUR = {
  nacht: '#2A1B1E', ivoor: '#FBF6EA', papier: '#FBF7F0',
  god: '#7A2E3B', godLicht: '#C97E8A', mens: '#C9733F', mensLicht: '#EAA978',
  wit: '#FFFBF0', licht: '#FFE9A8', goud: '#F0C24E', goudDiep: '#D9A032', amber: '#E0903A'
};
const K = KLEUR;
const r2 = (n) => Math.round(n * 100) / 100;
const pol = (cx, cy, rad, deg) => { const a = ((deg - 90) * Math.PI) / 180; return [r2(cx + rad * Math.cos(a)), r2(cy + rad * Math.sin(a))]; };
const ruis = (i) => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };
let uid = 0;

// ---------- armen: taps toelopend, van schouder (w0) naar vingertop (w1) ----------
// cirkelboog door P0 (schouder) en P1 (top) met straal R, middelpunt aan de 'binnenkant' (sweep 1 in schermcoördinaten)
function armPad(P0, P1, R, w0, w1) {
  const [x0, y0] = P0, [x1, y1] = P1;
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  const dx = x1 - x0, dy = y1 - y0, d = Math.hypot(dx, dy);
  const h = Math.sqrt(R * R - (d / 2) ** 2);
  // sweep=1: middelpunt rechts van de richting P0→P1 (schermcoördinaten, y omlaag)
  const cx = mx - (dy / d) * h, cy = my + (dx / d) * h;
  const a0 = Math.atan2(y0 - cy, x0 - cx), a1raw = Math.atan2(y1 - cy, x1 - cx);
  let a1 = a1raw; while (a1 < a0) a1 += Math.PI * 2; // met de klok mee van a0 naar a1
  const n = 28, buiten = [], binnen = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = a0 + (a1 - a0) * t;
    const w = w0 + (w1 - w0) * (t * t * (3 - 2 * t));
    buiten.push([r2(cx + (R + w / 2) * Math.cos(a)), r2(cy + (R + w / 2) * Math.sin(a))]);
    binnen.push([r2(cx + (R - w / 2) * Math.cos(a)), r2(cy + (R - w / 2) * Math.sin(a))]);
  }
  const L = (p) => p.join(' ');
  // ronde kop bij de top en ronde schouder: halve cirkels met straal w/2
  return `M${L(buiten[0])}` + buiten.slice(1).map((p) => `L${L(p)}`).join('')
    + `A${w1 / 2} ${w1 / 2} 0 0 1 ${L(binnen[n])}` + binnen.slice(0, n).reverse().map((p) => `L${L(p)}`).join('')
    + `A${w0 / 2} ${w0 / 2} 0 0 1 ${L(buiten[0])}Z`;
}
function armen({ god, mens, kier = 15, w0 = 12.5, w1 = 7.5 }) {
  const h = kier / 2;
  return `<path d="${armPad([8, 108], [60 - h, 60], 52, w0, w1)}" fill="${mens}"/>`
    + `<path d="${armPad([112, 12], [60 + h, 60], 52, w0, w1)}" fill="${god}"/>`;
}
function straal(cx, cy, r0, r1, deg, w) {
  const d = ((w / 2 / r0) * 180) / Math.PI;
  const [ax, ay] = pol(cx, cy, r0, deg - d), [bx, by] = pol(cx, cy, r0, deg + d), [tx, ty] = pol(cx, cy, r1, deg);
  return `M${ax} ${ay}L${tx} ${ty}L${bx} ${by}Z`;
}

// ---------- beeldmerk: gelaagd hemels licht ----------
export function beeldmerkInhoud({ donker = true, sterkte = 1, kerst = false } = {}) {
  const id = `rp${++uid}`;
  const god = donker ? K.godLicht : K.god, mens = donker ? K.mensLicht : K.mens;
  const gloedKleur = donker ? K.goud : K.amber;
  const defs = `<defs><radialGradient id="${id}g"><stop offset="0" stop-color="${K.wit}"/><stop offset=".18" stop-color="${K.licht}" stop-opacity=".95"/><stop offset=".45" stop-color="${gloedKleur}" stop-opacity="${donker ? 0.55 : 0.33}"/><stop offset="1" stop-color="${gloedKleur}" stop-opacity="0"/></radialGradient><radialGradient id="${id}k"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="${K.wit}"/><stop offset="1" stop-color="${K.licht}"/></radialGradient></defs>`;
  const gloed = `<circle cx="60" cy="60" r="${r2(58 * sterkte)}" fill="url(#${id}g)"/>`;
  // brede bundels: boven iets langer dan onder (de hemel gaat open)
  let bundels = '';
  for (const [basis, f] of [[0, 1.08], [180, 0.92]]) {
    [-26, -13, 0, 13, 26].forEach((d, i) => {
      bundels += `<path d="${straal(60, 60, 6, 6 + [40, 52, 62, 52, 40][i] * sterkte * f, basis + d, [5, 6.5, 8, 6.5, 5][i])}" fill="${K.licht}" opacity="${[0.28, 0.4, 0.55, 0.4, 0.28][i]}"/>`;
    });
  }
  let krans = '';
  for (let i = 0; i < 72; i++) {
    const deg = 5 * i + 2.5;
    const open = Math.abs(Math.cos((deg * Math.PI) / 180));
    const boven = Math.cos((deg * Math.PI) / 180) > 0 ? 1.08 : 0.94;
    const lang = (10 + 30 * open + ruis(i) * 14) * sterkte * boven;
    krans += `<path d="${straal(60, 60, 8, 8 + lang, deg, 0.7 + 0.9 * open)}" fill="${i % 3 ? K.licht : K.goud}" opacity="${r2(0.55 + 0.4 * open)}"/>`;
  }
  let hoofd = '';
  for (const [basis, lens] of [[0, [62, 76, 62]], [180, [52, 62, 52]]]) {
    [-9, 0, 9].forEach((d, i) => { hoofd += `<path d="${straal(60, 60, 8, 8 + lens[i] * sterkte, basis + d, 1.6)}" fill="${K.wit}" opacity=".9"/>`; });
  }
  const kern = `<circle cx="60" cy="60" r="${r2(11 * Math.sqrt(sterkte))}" fill="${K.licht}" opacity=".55"/><circle cx="60" cy="60" r="6.5" fill="url(#${id}k)"/>`;
  const sterretjes = !kerst ? '' : [[22, 24, 1.6], [96, 20, 1.2], [104, 92, 1.5], [18, 96, 1.1], [60, 6, 1.3], [60, 114, 1.0]]
    .map(([x, y, s]) => `<path transform="translate(${x} ${y}) scale(${s})" fill="${K.wit}" opacity=".9" d="M0 -3.2C.4 -1 1 -.4 3.2 0C1 .4 .4 1 0 3.2C-.4 1 -1 .4 -3.2 0C-1 -.4 -.4 -1 0 -3.2Z"/>`).join('');
  return `${defs}${gloed}${bundels}${krans}${hoofd}${armen({ god, mens })}${kern}${sterretjes}`;
}
export const VB = '-8 -20 136 156';
export const beeldmerk = (o = {}) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VB}" role="img" aria-label="Kom naar de kerk.">${beeldmerkInhoud(o)}</svg>`;

// ---------- vlak (klein gebruik): acht stralen, kern, geen verlopen ----------
export function vlakInhoud({ donker = true } = {}) {
  const god = donker ? K.godLicht : K.god, mens = donker ? K.mensLicht : K.mens;
  let s = '';
  for (const [basis, f] of [[0, 1.1], [180, 0.9]]) for (const d of [-22, 0, 22]) s += `<path d="${straal(60, 60, 9, 9 + (d ? 26 : 38) * f, basis + d, d ? 3.2 : 4)}" fill="${donker ? K.licht : K.goudDiep}"/>`;
  return `<circle cx="60" cy="60" r="22" fill="${donker ? K.goud : K.licht}" opacity="${donker ? 0.35 : 0.6}"/>${s}${armen({ god, mens, kier: 20, w0: 14, w1: 10 })}<circle cx="60" cy="60" r="7" fill="${donker ? K.wit : K.goudDiep}"/>`;
}
export const beeldmerkVlak = (o = {}) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="Kom naar de kerk.">${vlakInhoud(o)}</svg>`;

// ---------- één kleur ----------
export function monoInhoud({ kleur = K.nacht } = {}) {
  let s = '';
  for (const [basis, f] of [[0, 1.1], [180, 0.9]]) for (const d of [-32, -16, 0, 16, 32]) {
    const midden = d === 0, buiten = Math.abs(d) === 32;
    s += `<path d="${straal(60, 60, 11, 11 + (midden ? 40 : buiten ? 22 : 30) * f, basis + d, midden ? 5 : buiten ? 3.4 : 4.2)}" fill="${kleur}"/>`;
  }
  return `${s}${armen({ god: kleur, mens: kleur, kier: 22, w0: 14, w1: 10 })}<circle cx="60" cy="60" r="6.5" fill="${kleur}"/>`;
}
export const beeldmerkMono = (o = {}) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="Kom naar de kerk.">${monoInhoud(o)}</svg>`;

export const favicon = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="Kom naar de kerk."><rect width="120" height="120" rx="26" fill="${K.nacht}"/><g transform="translate(6 6) scale(0.9)">${vlakInhoud({ donker: true })}</g></svg>`;

// ---------- woordmerk (Newsreader) ----------
const NR = JSON.parse(readFileSync(new URL('../../voorstellen/merk/newsreader.json', import.meta.url), 'utf8'));
function woord(tekst, kleur, punt) {
  const w = NR[tekst];
  const p = punt ? `<circle cx="${r2(w.breedte + 150)}" cy="-95" r="88" fill="${punt}"/>` : '';
  return { svg: `<path fill="${kleur}" d="${w.d}"/>${p}`, breedte: w.breedte + (punt ? 300 : 0), upm: w.upm };
}
export function logoHorizontaal({ donker = false, vlak = false } = {}) {
  const inkt = donker ? K.ivoor : K.nacht, punt = donker ? K.goud : K.goudDiep;
  const t = woord('Kom naar de kerk', inkt, punt);
  const kap = 1340, mh = kap * 2.1;
  const s = mh / 156, x = 136 * s + kap * 0.1;
  const breedte = x + t.breedte + 40, top = -kap * 1.46;
  const merk = vlak ? `<g transform="translate(${8 * s} ${top + 18 * s}) scale(${s})">${vlakInhoud({ donker })}</g>` : `<g transform="translate(0 ${top - 2 * s}) scale(${s})">${beeldmerkInhoud({ donker }).replace(/-8 -20 136 156/g, '')}</g>`;
  const g = vlak ? merk : `<g transform="translate(${8 * s} ${20 * s})">${merk}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${Math.round(top)} ${Math.ceil(breedte)} ${Math.ceil(mh)}" role="img" aria-label="Kom naar de kerk."><title>Kom naar de kerk.</title>${g}<g transform="translate(${r2(x)} 0)">${t.svg}</g></svg>`;
}
export function logoStaand({ donker = false } = {}) {
  const inkt = donker ? K.ivoor : K.nacht, punt = donker ? K.goud : K.goudDiep;
  const a = woord('Kom naar', inkt, null), b = woord('de kerk', inkt, punt);
  const kap = 1340, lh = kap * 1.3, mh = kap * 3.4, s = mh / 156;
  const breedte = Math.max(a.breedte, b.breedte, 136 * s);
  const y1 = mh + kap * 1.35;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.ceil(breedte)} ${Math.ceil(y1 + lh + kap * 0.85)}" role="img" aria-label="Kom naar de kerk."><title>Kom naar de kerk.</title><g transform="translate(${r2((breedte - 136 * s) / 2 + 8 * s)} ${20 * s}) scale(${s})">${beeldmerkInhoud({ donker })}</g><g transform="translate(${r2((breedte - a.breedte) / 2)} ${y1})">${a.svg}</g><g transform="translate(${r2((breedte - b.breedte) / 2)} ${y1 + lh})">${b.svg}</g></svg>`;
}
