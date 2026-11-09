// Logoverkenning ronde 9 — volwassener, met stralend licht. Alleen het logo.
// Rustig, diep palet; fijne, precieze lijnen; stralen als lichte, ingetogen lijnen; klassieke letter (Newsreader).

const r = (n) => Math.round(n * 100) / 100;
let uid = 0;
export const PALET = {
  nacht: '#141A2E', ivoor: '#F7F1E4', papier: '#FBF8F2',
  god: '#2B4A7A', mens: '#8C4A32', licht: '#F3E3C3', goud: '#C9A46A', goudDonker: '#9A7438'
};
const P = PALET;
const pol = (cx, cy, rad, deg) => { const a = ((deg - 90) * Math.PI) / 180; return [r(cx + rad * Math.cos(a)), r(cy + rad * Math.sin(a))]; };
function stralen(cx, cy, { van = 0, tot = 360, stap = 7.5, r0 = 10, lang = [34, 24, 28, 20], breed = 0.9, kleur, opacity = 1 } = {}) {
  let d = '';
  let i = 0;
  for (let g = van; g <= tot; g += stap, i++) {
    const [x0, y0] = pol(cx, cy, r0, g);
    const [x1, y1] = pol(cx, cy, r0 + lang[i % lang.length], g);
    d += `M${x0} ${y0}L${x1} ${y1}`;
  }
  return `<path d="${d}" stroke="${kleur}" stroke-width="${breed}" stroke-linecap="round" fill="none" opacity="${opacity}"/>`;
}
const boog = (x) => `M${x} 120V30A30 30 0 0 1 ${x + 60} 30V120`;
const lens = 'M30 120V30A30 30 0 0 1 45 4.02A30 30 0 0 1 60 30V120Z';

// A — STRALENDE ONTMOETING: twee in elkaar grijpende bogen; uit hun ontmoeting straalt licht naar buiten.
export function stralendeOntmoeting({ donker = true } = {}) {
  const god = donker ? '#8FA9D6' : P.god;
  const mens = donker ? '#D9A07F' : P.mens;
  const licht = donker ? P.ivoor : P.licht;
  const straal = donker ? P.goud : P.goudDonker;
  const id = `so${++uid}`;
  // stralen rond het raakpunt, alleen buiten de bogen zichtbaar (achter de lijnen langs)
  return `<clipPath id="${id}"><path d="M-40 -60H130V120H-40Z"/></clipPath>`
    + `<g clip-path="url(#${id})">${stralen(45, 4, { van: -88, tot: 88, stap: 8, r0: 9, lang: [30, 19, 25, 15], breed: 1.1, kleur: straal, opacity: 0.9 })}</g>`
    + `<path d="${lens}" fill="${licht}"/>`
    + `<path d="${boog(30)}" fill="none" stroke="${mens}" stroke-width="4.6"/>`
    + `<path d="${boog(0)}" fill="none" stroke="${god}" stroke-width="4.6"/>`;
}

// B — OPKOMEND LICHT: een spitsboogpoort; vanuit de drempel stijgt een stralenbundel op en vult de poort.
export function opkomendLicht({ donker = true } = {}) {
  const rand = donker ? P.ivoor : P.nacht;
  const binnen = donker ? '#1F2A46' : P.licht;
  const straal = donker ? P.goud : P.goudDonker;
  const id = `ol${++uid}`;
  const spits = (d) => {
    const x0 = 6, x1 = 84, R = x1 - x0, rr = R - d, xm = 45, ys = 52;
    const h = Math.sqrt(rr * rr - (xm - x0) ** 2);
    return `M${r(x0 + d)} 120V${ys}A${r(rr)} ${r(rr)} 0 0 1 ${xm} ${r(ys - h)}A${r(rr)} ${r(rr)} 0 0 1 ${r(x1 - d)} ${ys}V120Z`;
  };
  return `<clipPath id="${id}"><path d="${spits(5)}"/></clipPath>`
    + `<path d="${spits(0)}" fill="${rand}"/><path d="${spits(2.4)}" fill="${donker ? P.nacht : P.papier}"/><path d="${spits(5)}" fill="${binnen}"/>`
    + `<g clip-path="url(#${id})">${stralen(45, 120, { van: -84, tot: 84, stap: 6, r0: 6, lang: [104, 80, 94, 70], breed: 0.9, kleur: straal })}</g>`
    + `<path d="M45 96A16 16 0 0 1 61 112V120H29V112A16 16 0 0 1 45 96Z" fill="${donker ? P.ivoor : P.goud}"/>`;
}

// C — HET RAAKPUNT: naar de Schepping van Adam. God reikt van boven, de mens van onder; waar ze bijna raken, straalt licht.
export function raakpunt({ donker = true } = {}) {
  const god = donker ? '#8FA9D6' : P.god;
  const mens = donker ? '#D9A07F' : P.mens;
  const straal = donker ? P.goud : P.goudDonker;
  const licht = donker ? P.ivoor : P.goud;
  return stralen(60, 60, { van: 0, tot: 352.5, stap: 7.5, r0: 9, lang: [16, 10, 13, 8], breed: 1, kleur: straal })
    + `<path d="M10 106A50 50 0 0 1 52 60" fill="none" stroke="${mens}" stroke-width="7" stroke-linecap="round"/>`
    + `<path d="M110 14A50 50 0 0 1 68 60" fill="none" stroke="${god}" stroke-width="7" stroke-linecap="round"/>`
    + `<circle cx="60" cy="60" r="3.6" fill="${licht}"/>`;
}

export const RICHTINGEN = [
  { id: 'stralende-ontmoeting', naam: 'Stralende ontmoeting', vb: '-14 -40 118 162', f: stralendeOntmoeting, uitleg: 'Twee bogen grijpen in elkaar: God en de mens. Waar ze elkaar raken, is licht, en dat licht straalt naar buiten. Fijne lijnen, een diep blauw en een warm aardebruin.' },
  { id: 'opkomend-licht', naam: 'Opkomend licht', vb: '2 -6 86 130', f: opkomendLicht, uitleg: 'Een kerkportaal. Vanaf de drempel stijgt licht op dat de hele poort vult, zoals de zon die opkomt. Rustig, symmetrisch en tijdloos.' },
  { id: 'raakpunt', naam: 'Het raakpunt', vb: '2 6 116 108', f: raakpunt, uitleg: 'Naar de Schepping van Adam: God reikt van boven, de mens van onder. Waar ze elkaar bijna raken, straalt licht. Het meest eigen en het meest ingetogen.' }
];
export const svg = (rr, donker) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${rr.vb}" role="img" aria-label="${rr.naam}">${rr.f({ donker })}</svg>`;
