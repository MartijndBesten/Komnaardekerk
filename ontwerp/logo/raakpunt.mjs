// Ronde 10 — het gekozen logo: HET RAAKPUNT, in warme kleuren.
// Naar de Schepping van Adam: God reikt van boven, de mens van onder. Waar ze elkaar bijna raken,
// breekt licht door. Geen kruis. Warm palet: wijnrood (God), terracotta (mens), goud en ivoor (licht).
//
// Opbouw: twee taps toelopende armen die het vlak vullen; in de kier een kern van licht met stralen
// die alleen dwars op de armen vallen (in de twee open sectoren), zodat ze de armen nooit kruisen.

const r = (n) => Math.round(n * 100) / 100;
export const WARM = {
  nacht: '#2A1B1E', ivoor: '#F8F1E4', papier: '#FBF7F0',
  god: '#7A2E3B', godLicht: '#C47A86',
  mens: '#C9733F', mensLicht: '#E8A878',
  licht: '#F6D98A', lichtDiep: '#F0B64A', goud: '#D9A85A', goudDonker: '#A97B2E'
};
const W = WARM;
const pol = (cx, cy, rad, deg) => { const a = ((deg - 90) * Math.PI) / 180; return [r(cx + rad * Math.cos(a)), r(cy + rad * Math.sin(a))]; };
let uid = 0;

// De twee armen als zware bogen met ronde einden: de mens van linksonder, God van rechtsboven.
// De vingertoppen staan op één horizontale lijn, aan weerszijden van het raakpunt (60,60).
function armen({ god, mens, dik = 10, kier = 14 }) {
  const h = kier / 2;
  return `<path d="M8 108A52 52 0 0 1 ${60 - h} 60" fill="none" stroke="${mens}" stroke-width="${dik}" stroke-linecap="round"/>`
    + `<path d="M112 12A52 52 0 0 1 ${60 + h} 60" fill="none" stroke="${god}" stroke-width="${dik}" stroke-linecap="round"/>`;
}

// stralen uit het raakpunt in twee open sectoren (dwars op de armen), van kort naar lang, dik naar dun
function stralenkrans({ kleur, kleur2, cx = 60, cy = 60, basis = 9 }) {
  const uit = [];
  for (const centrum of [0, 180]) {
    const lengtes = [12, 20, 28, 36, 28, 20, 12];
    lengtes.forEach((l, i) => {
      const d = centrum + (i - 3) * 12;
      const [x0, y0] = pol(cx, cy, basis, d);
      const [x1, y1] = pol(cx, cy, basis + l, d);
      const w = 2.6 - Math.abs(i - 3) * 0.5;
      uit.push(`<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="${i % 2 ? kleur2 : kleur}" stroke-width="${w}" stroke-linecap="round"/>`);
    });
  }
  return uit.join('');
}

// 1 DOORBRAAK — licht breekt in twee brede waaiers uit de kier, dwars op de armen
export function doorbraak({ donker = true } = {}) {
  const god = donker ? W.godLicht : W.god, mens = donker ? W.mensLicht : W.mens;
  return stralenkrans({ kleur: donker ? W.licht : W.lichtDiep, kleur2: donker ? W.goud : W.goudDonker })
    + armen({ god, mens })
    + `<circle cx="60" cy="60" r="4.2" fill="${donker ? W.ivoor : W.lichtDiep}"/>`;
}

// 2 KERN — geen stralen; één grote, zachte kern van licht die achter de vingertoppen gloeit (vlakke ringen)
export function kern({ donker = true } = {}) {
  const god = donker ? W.godLicht : W.god, mens = donker ? W.mensLicht : W.mens;
  const l1 = donker ? W.ivoor : W.lichtDiep, l2 = donker ? W.licht : W.goud, l3 = donker ? W.goud : W.goudDonker;
  return `<circle cx="60" cy="60" r="24" fill="${l3}" opacity="${donker ? 0.3 : 0.2}"/><circle cx="60" cy="60" r="16" fill="${l2}" opacity="${donker ? 0.55 : 0.4}"/><circle cx="60" cy="60" r="7.5" fill="${l1}"/>`
    + armen({ god, mens, kier: 18 });
}

// 3 OPGAAND — het licht stijgt uit de kier omhoog, als een zuil met een stralende kop: de hemel gaat open
export function opgaand({ donker = true } = {}) {
  const god = donker ? W.godLicht : W.god, mens = donker ? W.mensLicht : W.mens;
  const l = donker ? W.licht : W.lichtDiep, g = donker ? W.goud : W.goudDonker;
  const stralen = [-30, -20, -10, 0, 10, 20, 30].map((d, i) => {
    const len = [16, 26, 36, 46, 36, 26, 16][i];
    const [x0, y0] = pol(60, 60, 10, d);
    const [x1, y1] = pol(60, 60, 8 + len, d);
    return `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="${i % 2 ? g : l}" stroke-width="${2.4 - Math.abs(i - 3) * 0.4}" stroke-linecap="round"/>`;
  }).join('');
  return stralen + armen({ god, mens }) + `<circle cx="60" cy="60" r="4.6" fill="${donker ? W.ivoor : W.lichtDiep}"/>`;
}

export const VARIANTEN = [
  { id: 'doorbraak', naam: 'Doorbraak', vb: '0 0 120 120', f: doorbraak, uitleg: 'Het licht breekt in twee brede waaiers uit de kier, dwars op de armen. Gericht en stralend, zonder vuurwerk: de stralen kruisen de armen nooit.' },
  { id: 'kern', naam: 'Kern', vb: '0 0 120 120', f: kern, uitleg: 'Geen stralen, maar een zachte kern van licht achter de vingertoppen. Het rustigst en het meest volwassen; klein het sterkst.' },
  { id: 'opgaand', naam: 'Opgaand', vb: '0 0 120 120', f: opgaand, uitleg: 'Het licht stijgt uit het raakpunt omhoog: de hemel gaat open. Het meest ‘stralend’ en het meest hoopvol.' }
];
export const svg = (v, donker) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${v.vb}" role="img" aria-label="Kom naar de kerk. ${v.naam}">${v.f({ donker })}</svg>`;
