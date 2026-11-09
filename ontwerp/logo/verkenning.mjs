// Logoverkenning ronde 8 — 'Ontmoeting tussen God en mens', zonder kruis, nieuwe kleuren, spectaculairder.
// Alleen het logo; de website volgt later. Elke richting heeft een donkere en een lichte versie.

const r = (n) => Math.round(n * 100) / 100;
let id = 0;
const boogPad = (cx, w, bodem = 120, top = 30) => `M${r(cx - w / 2)} ${bodem}V${top}A${w / 2} ${w / 2} 0 0 1 ${r(cx + w / 2)} ${top}V${bodem}`;

// 1 LICHTSPEL — twee bogen van gekleurd licht die over elkaar vallen; waar ze elkaar raken wordt het lichter (zoals licht dat optelt).
export function lichtspel({ donker = true } = {}) {
  const A = ['#2E4BFF', '#5B7CFF', '#A9B9FF'];   // God: diep, helder hemelsblauw
  const B = ['#FF3D6E', '#FF7A59', '#FFC2A1'];   // mens: roze-rood naar warm perzik
  const blend = donker ? 'screen' : 'multiply';
  const kleur = (lijst) => (donker ? lijst : lijst.slice().reverse());
  const groep = (cx, lijst) => [60, 42, 24].map((w, i) => `<path d="${boogPad(cx, w)}Z" fill="${kleur(lijst)[i]}" style="mix-blend-mode:${blend}"/>`).join('');
  return `<g style="isolation:isolate">${groep(30, A)}${groep(60, B)}</g>`;
}

// 2 WEEFSEL — twee bogen uit tientallen fijne lijnen; waar ze elkaar kruisen ontstaat een glinsterend weefsel.
export function weefsel({ donker = true } = {}) {
  const lijnen = (cx, kleur) => Array.from({ length: 11 }, (_, i) => `<path d="${boogPad(cx, 60 - i * 5.2)}" fill="none" stroke="${kleur}" stroke-width="1.5"/>`).join('');
  return donker ? `${lijnen(30, '#6FE3FF')}${lijnen(60, '#FF8FD0')}` : `${lijnen(30, '#1D5BD8')}${lijnen(60, '#D6246E')}`;
}

// 3 BIJNA — naar de Schepping van Adam: twee bogen reiken naar elkaar; in de kleine ruimte tussen hen ontstaat licht.
export function bijna({ donker = true } = {}) {
  const god = donker ? '#7C8CFF' : '#3A3FD9';
  const mens = donker ? '#FF9A6B' : '#E4572E';
  const licht = donker ? '#FFF1D6' : '#F2A65A';
  const sw = 13;
  // God reikt van boven (rechts), de mens van onder (links)
  return `<path d="M8 104A52 52 0 0 1 52 52" fill="none" stroke="${mens}" stroke-width="${sw}" stroke-linecap="round"/>`
    + `<path d="M112 16A52 52 0 0 1 68 68" fill="none" stroke="${god}" stroke-width="${sw}" stroke-linecap="round"/>`
    + `<path d="M60 49A13 13 0 0 1 60 71A13 13 0 0 1 60 49Z" fill="${licht}" transform="rotate(45 60 60)"/>`;
}

// 4 DAGERAAD — een poort waarin het licht in banden opkomt: van diep violet aan de rand naar helder licht in het midden.
export function dageraad({ donker = true } = {}) {
  const banden = donker
    ? ['#3A1C71', '#7A2A8C', '#C2387F', '#F0636B', '#FF9E6D', '#FFD9B0', '#FFF6EA']
    : ['#3A1C71', '#7A2A8C', '#C2387F', '#F0636B', '#FF9E6D', '#FFD9B0', '#FFF6EA'];
  const n = banden.length;
  // geneste spitsbogen: echte offset van een spitsboog van 72 breed
  const spits = (d) => {
    const x0 = 9, x1 = 81, R = x1 - x0, rr = R - d, xm = 45, ys = 50;
    const h = Math.sqrt(rr * rr - (xm - x0) ** 2);
    return `M${r(x0 + d)} 120V${ys}A${r(rr)} ${r(rr)} 0 0 1 ${xm} ${r(ys - h)}A${r(rr)} ${r(rr)} 0 0 1 ${r(x1 - d)} ${ys}V120Z`;
  };
  return banden.map((k, i) => `<path d="${spits(i * 4.6)}" fill="${k}"/>`).join('');
}

// 5 TWEE IN ÉÉN — twee bogen die samen één nieuwe vorm maken: het lege midden is de deur van licht.
export function tweeInEen({ donker = true } = {}) {
  const god = donker ? '#57D2C8' : '#0E8C82';
  const mens = donker ? '#FF7EB3' : '#D63A7A';
  const licht = donker ? '#FFF4E3' : '#FFE3B8';
  const lens = 'M30 120V30A30 30 0 0 1 45 4.02A30 30 0 0 1 60 30V120Z';
  return `<path d="M0 120V30A30 30 0 0 1 60 30V120H44V40A14 14 0 0 0 16 40V120Z" fill="${god}"/>`
    + `<path d="M30 120V30A30 30 0 0 1 90 30V120H74V40A14 14 0 0 0 46 40V120Z" fill="${mens}" style="mix-blend-mode:${donker ? 'screen' : 'multiply'}"/>`
    + `<path d="${lens}" fill="${licht}" opacity="${donker ? 0.92 : 0.8}"/>`;
}

export const RICHTINGEN = [
  { id: 'lichtspel', naam: 'Lichtspel', vb: '-2 -2 94 124', f: lichtspel, uitleg: 'Twee bogen van gekleurd licht vallen over elkaar. Waar God en mens elkaar raken, telt het licht op en wordt het helderder. Zoals licht door gekleurd glas. Werkt het mooist op donker: op licht wordt het midden juist donkerder.' },
  { id: 'weefsel', naam: 'Weefsel', vb: '-2 -2 94 124', f: weefsel, uitleg: 'Twee bogen uit fijne lijnen. Waar ze elkaar kruisen, ontstaat een glinsterend weefsel: verbonden, niet los te maken.' },
  { id: 'bijna', naam: 'Bijna', vb: '0 8 120 104', f: bijna, uitleg: 'Naar de Schepping van Adam van Michelangelo: twee bogen reiken naar elkaar, God van boven, de mens van onder. In de kleine ruimte ertussen ontstaat licht.' },
  { id: 'dageraad', naam: 'Dageraad', vb: '5 -2 80 124', f: dageraad, uitleg: 'Een poort waarin het licht opkomt, in banden van diep violet naar helder licht. De deur gaat open en het wordt dag.' },
  { id: 'tweeineen', naam: 'Twee in één', vb: '-2 -2 94 124', f: tweeInEen, uitleg: 'Twee bogen maken samen één nieuwe vorm. Het midden, waar ze elkaar raken, is een deur van licht.' }
];
export const svg = (rr, donker, klasse = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${rr.vb}"${klasse ? ` class="${klasse}"` : ''} role="img" aria-label="${rr.naam}">${rr.f({ donker })}</svg>`;
