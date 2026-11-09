// Ronde 11 — HET RAAKPUNT, hemels stralend. Het licht tussen God en mens is de hoofdzaak.
// Lagen (van achter naar voor): zachte gloed (verloop) · brede lichtbundels · dichte krans van fijne stralen
// · witgouden kern · de twee armen, die in het licht staan. Alles vanuit het raakpunt (60,60).
// Voor klein gebruik (favicon) is er een vlakke versie zonder verlopen.

const r = (n) => Math.round(n * 100) / 100;
export const WARM = {
  nacht: '#2A1B1E', ivoor: '#FBF6EA', papier: '#FBF7F0',
  god: '#7A2E3B', godLicht: '#C97E8A', mens: '#C9733F', mensLicht: '#EAA978',
  wit: '#FFFBF0', licht: '#FFE9A8', goud: '#F0C24E', goudDiep: '#D9A032', amber: '#E0903A'
};
const W = WARM;
const pol = (cx, cy, rad, deg) => { const a = ((deg - 90) * Math.PI) / 180; return [r(cx + rad * Math.cos(a)), r(cy + rad * Math.sin(a))]; };
let uid = 0;
// deterministische variatie (geen Math.random: elke build gelijk)
const ruis = (i) => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };

function armen({ god, mens, dik = 10, kier = 16 }) {
  const h = kier / 2;
  return `<path d="M8 108A52 52 0 0 1 ${60 - h} 60" fill="none" stroke="${mens}" stroke-width="${dik}" stroke-linecap="round"/>`
    + `<path d="M112 12A52 52 0 0 1 ${60 + h} 60" fill="none" stroke="${god}" stroke-width="${dik}" stroke-linecap="round"/>`;
}

// taps toelopende straal (driehoek) van r0 naar r1
function straal(cx, cy, r0, r1, deg, w) {
  const d = ((w / 2 / r0) * 180) / Math.PI;
  const [ax, ay] = pol(cx, cy, r0, deg - d), [bx, by] = pol(cx, cy, r0, deg + d), [tx, ty] = pol(cx, cy, r1, deg);
  return `M${ax} ${ay}L${tx} ${ty}L${bx} ${by}Z`;
}

// Het volle, hemelse licht. `sterkte` 1 = hero; op donker én licht.
// `kerst: true` voegt losse sterretjes toe (alleen in de kersttijd); standaard uit.
export function hemels({ donker = true, sterkte = 1, kerst = false } = {}) {
  const id = `h${++uid}`;
  const god = donker ? W.godLicht : W.god, mens = donker ? W.mensLicht : W.mens;
  const gloedKleur = donker ? W.goud : W.amber;
  const defs = `<defs>
<radialGradient id="${id}g"><stop offset="0" stop-color="${W.wit}" stop-opacity="1"/><stop offset=".18" stop-color="${W.licht}" stop-opacity=".95"/><stop offset=".45" stop-color="${gloedKleur}" stop-opacity="${donker ? 0.55 : 0.35}"/><stop offset="1" stop-color="${gloedKleur}" stop-opacity="0"/></radialGradient>
<radialGradient id="${id}k"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="${W.wit}"/><stop offset="1" stop-color="${W.licht}"/></radialGradient>
<linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${W.licht}" stop-opacity=".95"/><stop offset="1" stop-color="${W.licht}" stop-opacity="0"/></linearGradient>
</defs>`;
  // 1 gloed
  const gloed = `<circle cx="60" cy="60" r="${58 * sterkte}" fill="url(#${id}g)"/>`;
  // 2 brede bundels: lange, zachte lichtbanen in de open sectoren (boven en onder), gespiegeld
  let bundels = '';
  for (const basis of [0, 180]) {
    [-26, -13, 0, 13, 26].forEach((d, i) => {
      const lang = [40, 52, 62, 52, 40][i] * sterkte;
      bundels += `<path d="${straal(60, 60, 6, 6 + lang, basis + d, [5, 6.5, 8, 6.5, 5][i])}" fill="${W.licht}" opacity="${[0.28, 0.4, 0.55, 0.4, 0.28][i]}"/>`;
    });
  }
  // 3 dichte krans van fijne stralen, rondom, langer in de open sectoren
  let krans = '';
  const n = 72;
  for (let i = 0; i < n; i++) {
    const deg = (360 / n) * i + 2.5;
    const open = Math.abs(Math.cos((deg * Math.PI) / 180)); // 1 boven/onder, 0 links/rechts
    const lang = (10 + 30 * open + ruis(i) * 14) * sterkte;
    const w = 0.7 + 0.9 * open;
    krans += `<path d="${straal(60, 60, 8, 8 + lang, deg, w)}" fill="${i % 3 ? W.licht : W.goud}" opacity="${0.55 + 0.4 * open}"/>`;
  }
  // 4 lange hoofdstralen boven en onder: de hemel gaat open
  let hoofd = '';
  for (const basis of [0, 180]) {
    [-9, 0, 9].forEach((d, i) => {
      hoofd += `<path d="${straal(60, 60, 8, 8 + [58, 70, 58][i] * sterkte, basis + d, 1.6)}" fill="${W.wit}" opacity=".9"/>`;
    });
  }
  // 5 kern
  const kern = `<circle cx="60" cy="60" r="${11 * Math.sqrt(sterkte)}" fill="${W.licht}" opacity=".55"/><circle cx="60" cy="60" r="${6.5}" fill="url(#${id}k)"/>`;
  // sterretjes van licht, verspreid: alleen met kerst
  const sterretjes = !kerst ? '' : [[22, 24, 1.6], [96, 20, 1.2], [104, 92, 1.5], [18, 96, 1.1], [60, 8, 1.3], [60, 113, 1.0]]
    .map(([x, y, s]) => `<path transform="translate(${x} ${y}) scale(${s})" fill="${W.wit}" opacity=".9" d="M0 -3.2C.4 -1 1 -.4 3.2 0C1 .4 .4 1 0 3.2C-.4 1 -1 .4 -3.2 0C-1 -.4 -.4 -1 0 -3.2Z"/>`).join('');
  return `${defs}${gloed}${bundels}${krans}${hoofd}${armen({ god, mens })}${kern}${sterretjes}`;
}

// Vlakke versie voor klein gebruik: geen verlopen, acht stralen, duidelijke kern
export function hemelsKlein({ donker = true } = {}) {
  const god = donker ? W.godLicht : W.god, mens = donker ? W.mensLicht : W.mens;
  let s = '';
  for (const basis of [0, 180]) for (const d of [-22, 0, 22]) s += `<path d="${straal(60, 60, 9, 9 + (d ? 26 : 38), basis + d, d ? 3.2 : 4)}" fill="${donker ? W.licht : W.goudDiep}"/>`;
  return `<circle cx="60" cy="60" r="22" fill="${donker ? W.goud : W.licht}" opacity="${donker ? 0.35 : 0.6}"/>${s}${armen({ god, mens, dik: 13, kier: 20 })}<circle cx="60" cy="60" r="7" fill="${donker ? W.wit : W.goudDiep}"/>`;
}

export const svg = (f, o, vb = '-6 -14 132 148') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="Kom naar de kerk.">${f(o)}</svg>`;
