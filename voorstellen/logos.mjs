// Drie logorichtingen voor 'Kom naar de kerk.' — alle beeldmerken als geometrie uit code.
// Elk beeldmerk heeft een 'groot' detailniveau (spandoek, poster, website) en een 'klein'
// niveau (favicon, app-icoon, stempel): fijne stralen verdwijnen klein, de vorm blijft.
//
//   1 Stralenkrans  — tientallen taps toelopende stralen rond een lichtbron, met een kruis
//                     dat pas bij tweede blik opvalt (vier langere hoofdstralen).
//   2 Roosvenster   — een gotisch roosvenster met licht erdoorheen: glas in verloop van warm
//                     wit naar baksteen, lood-tracering, en stralen die naar buiten vallen.
//   3 De ster       — de ster die de wijzen de weg wees: geslepen vierpuntster met lange
//                     onderpunt, gloed, stralenbundel en verspreide sterretjes. Hemels, wegwijzend.

import { readFileSync } from 'node:fs';

const lees = (f) => JSON.parse(readFileSync(new URL(`./merk/${f}`, import.meta.url), 'utf8'));
const WOORD = { newsreader: lees('newsreader.json'), archivo: lees('archivo.json'), instrument: lees('instrument.json') };

const r2 = (n) => Math.round(n * 100) / 100;
const pol = (r, deg) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [r2(r * Math.cos(a)), r2(r * Math.sin(a))];
};
// taps toelopende straal (wig) van r0 naar r1, basisbreedte w
function straal(r0, r1, deg, w) {
  const d = ((w / 2 / r0) * 180) / Math.PI;
  const [ax, ay] = pol(r0, deg - d);
  const [bx, by] = pol(r0, deg + d);
  const [cx, cy] = pol(r1, deg);
  return `M${ax} ${ay}L${cx} ${cy}L${bx} ${by}Z`;
}

export const PALETTEN = {
  1: {
    naam: 'Stralenkrans',
    kleuren: [
      ['Warm wit', '#F8F7F3'],
      ['Diepgroen', '#29463E'],
      ['Saliegroen', '#82978C'],
      ['Zacht terracotta', '#B77763'],
      ['Antraciet', '#25312F']
    ],
    licht: { tekst: '#25312F', straal: '#29463E', kruis: '#29463E', kern: '#B77763', kernLicht: '#F3D9CC', fijn: '#82978C', vlak: '#F8F7F3', gloed: '#B77763', gloedSterkte: 0.22 },
    donker: { tekst: '#F8F7F3', straal: '#D5E2DA', kruis: '#F8F7F3', kern: '#D99A85', kernLicht: '#FFF6EE', fijn: '#A9BCB1', vlak: '#29463E', gloed: '#F3E3D3', gloedSterkte: 0.32 }
  },
  2: {
    naam: 'Roosvenster',
    kleuren: [
      ['Kalksteen', '#F4F1EA'],
      ['Antraciet', '#25312F'],
      ['Zacht terracotta', '#B77763'],
      ['Baksteen', '#8E4E3D'],
      ['Saliegroen', '#82978C']
    ],
    licht: { tekst: '#25312F', lijn: '#B77763', ring: '#25312F', lood: '#25312F', kern: '#8E4E3D', hart: '#FBF3EA', fijn: '#82978C', glas: ['#FFF7EC', '#F0CDBB', '#C98A74', '#8E4E3D'], glasKoel: '#C4D3CA', glasKoelSterkte: 0.85, oculus: '#82978C', straal: '#B77763', gloed: '#E7B9A6', gloedSterkte: 0.45 },
    donker: { tekst: '#F4F1EA', lijn: '#E0A792', ring: '#F4F1EA', lood: '#25312F', kern: '#8E4E3D', hart: '#FFF7EC', fijn: '#9DB0A5', glas: ['#FFF9F0', '#F4D3C1', '#D08F78', '#8E4E3D'], glasKoel: '#C9D8CF', glasKoelSterkte: 0.85, oculus: '#B9C9BF', straal: '#F0C9B8', gloed: '#E7B9A6', gloedSterkte: 0.35 }
  },
  3: {
    naam: 'De ster',
    kleuren: [
      ['Avondhemel', '#1F2B3B'],
      ['Diepe nacht', '#141C27'],
      ['Saliegroen', '#82978C'],
      ['Dageraad', '#D9A493'],
      ['Warm wit', '#F8F7F3']
    ],
    licht: { tekst: '#1F2B3B', ster: '#1F2B3B', facet: '#3A4D66', straal: '#82978C', gloed: '#D9A493', gloedLijn: '#D9A493', gloedSterkte: 0.4, fijn: '#82978C' },
    donker: { tekst: '#F8F7F3', ster: '#F8F7F3', facet: '#EBD3C6', straal: '#E7C1B2', gloed: '#F2D3C4', gloedLijn: '#D9A493', gloedSterkte: 0.38, fijn: '#C9D4CD' }
  }
};

// unieke id's voor verlopen, ook als meerdere logo's inline op één pagina staan
let teller = 0;
const uid = (p) => `${p}${++teller}`;
// deterministische 'ruis' voor variatie in straallengtes (geen Math.random: build moet herhaalbaar zijn)
const ruis = (i) => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

// ---------- 1 Stralenkrans ----------
function stralenkrans(k, detail) {
  const groot = detail === 'groot';
  const g = uid('sk');
  const defs = `<defs><radialGradient id="${g}h"><stop offset="0" stop-color="${k.gloed}" stop-opacity="${k.gloedSterkte}"/><stop offset="0.45" stop-color="${k.gloed}" stop-opacity="${k.gloedSterkte * 0.35}"/><stop offset="1" stop-color="${k.gloed}" stop-opacity="0"/></radialGradient><radialGradient id="${g}k"><stop offset="0" stop-color="${k.kernLicht}"/><stop offset="1" stop-color="${k.kern}"/></radialGradient></defs>`;
  if (!groot) {
    let fijn = '';
    for (let i = 0; i < 24; i++) {
      const deg = 15 * i;
      if (deg % 90 === 0) continue;
      fijn += straal(25, deg % 45 === 0 ? 66 : 54, deg, 5);
    }
    const kruis = [straal(16, 88, 0, 12), straal(16, 98, 180, 12), straal(16, 74, 90, 12), straal(16, 74, 270, 12)].join('');
    return `${defs}<path fill="${k.straal}" d="${fijn}"/><path fill="${k.kruis}" d="${kruis}"/><circle r="19" fill="none" stroke="${k.kruis}" stroke-width="3.4"/><circle r="12.5" fill="url(#${g}k)"/>`;
  }
  // laag 1: haarfijne stralen met wisselende lengte (lichtnevel)
  let haar = '';
  for (let i = 0; i < 180; i++) {
    const deg = 2 * i + 1;
    haar += straal(24, 44 + ruis(i) * 40, deg, 0.7);
  }
  // laag 2: middelste stralen in een ritme (lang-kort-middel-kort)
  let mid = '';
  for (let i = 0; i < 64; i++) {
    const deg = (360 / 64) * i;
    if (deg % 90 === 0) continue;
    const lang = i % 8 === 4 ? 80 : i % 4 === 2 ? 68 : i % 2 ? 50 : 60;
    mid += straal(24, lang, deg, i % 2 ? 1.5 : 2.4);
  }
  // laag 3: diagonalen geven de krans een tweede, zachtere kruisvorm (ster van acht)
  const diag = [45, 135, 225, 315].map((d) => straal(20, 64, d, 6)).join('');
  // hoofdstralen: Latijns kruis (onder langer)
  const kruis = [straal(15, 88, 0, 9), straal(15, 99, 180, 9), straal(15, 72, 90, 9), straal(15, 72, 270, 9)].join('');
  // kruis met lichte middennerf: tweede tint maakt het minder 'plat getekend'
  const nerf = [straal(15, 84, 0, 2.2), straal(15, 95, 180, 2.2), straal(15, 68, 90, 2.2), straal(15, 68, 270, 2.2)].join('');
  // stralenkrans van stippen (aureool) en verspreide lichtjes
  const aureool = Array.from({ length: 72 }, (_, i) => {
    const [x, y] = pol(88, i * 5 + 2.5);
    return `<circle cx="${x}" cy="${y}" r="${i % 3 ? 0.55 : 0.95}"/>`;
  }).join('');
  const lichtjes = Array.from({ length: 16 }, (_, i) => {
    const [x, y] = pol(70 + ruis(i + 50) * 24, i * 22.5 + 11.25 + ruis(i + 9) * 8);
    return `<circle cx="${x}" cy="${y}" r="${0.8 + ruis(i + 3) * 1}"/>`;
  }).join('');
  const kernring = Array.from({ length: 24 }, (_, i) => {
    const [x, y] = pol(21.5, i * 15);
    return `<circle cx="${x}" cy="${y}" r="0.9"/>`;
  }).join('');
  return `${defs}<circle r="98" fill="url(#${g}h)"/><g fill="${k.fijn}" opacity="0.75"><path d="${haar}"/></g><g fill="${k.straal}" opacity="0.92"><path d="${mid}"/></g><path fill="${k.straal}" opacity="0.55" d="${diag}"/><g fill="${k.fijn}">${aureool}${lichtjes}</g><path fill="${k.kruis}" d="${kruis}"/><path fill="${k.kernLicht}" opacity="0.55" d="${nerf}"/><circle r="17" fill="${k.vlak}"/><circle r="17" fill="none" stroke="${k.kruis}" stroke-width="1.4"/><g fill="${k.kruis}">${kernring}</g><circle r="11.5" fill="url(#${g}k)"/>`;
}

// ---------- 2 Roosvenster ----------
function blad(hw0, r0, hw1, r1, rTop) {
  // spitsboog die naar buiten wijst (in lokale coördinaten richting -y)
  const R = hw1 * 2;
  return `M${-hw0} ${-r0}L${-hw1} ${-r1}A${R} ${R} 0 0 1 0 ${-rTop}A${R} ${R} 0 0 1 ${hw1} ${-r1}L${hw0} ${-r0}Z`;
}
function roosvenster(k, detail) {
  const groot = detail === 'groot';
  const g = uid('rv');
  const R = groot ? 80 : 90; // straal van het venster; daarbuiten het licht
  const f = R / 95;
  const n = groot ? 12 : 8;
  const sw = groot ? 1.25 : 4.2;
  const defs = `<defs><radialGradient id="${g}g"><stop offset="0" stop-color="${k.glas[0]}"/><stop offset="0.38" stop-color="${k.glas[1]}"/><stop offset="0.78" stop-color="${k.glas[2]}"/><stop offset="1" stop-color="${k.glas[3]}"/></radialGradient><radialGradient id="${g}h"><stop offset="0.7" stop-color="${k.gloed}" stop-opacity="${k.gloedSterkte}"/><stop offset="1" stop-color="${k.gloed}" stop-opacity="0"/></radialGradient></defs>`;
  let bladen = '';
  let glasBlauw = '';
  let oculi = '';
  let binnen = '';
  for (let i = 0; i < n; i++) {
    const deg = (360 / n) * i;
    const vorm = blad((groot ? 6 : 9) * f, 32 * f, (groot ? 11.5 : 17) * f, 64 * f, 84 * f);
    bladen += `<path transform="rotate(${deg})" d="${vorm}"/>`;
    if (i % 2 === 0) glasBlauw += `<path transform="rotate(${deg})" d="${vorm}"/>`;
    if (groot) {
      // binnenste tracering: een kleinere spitsboog en een oculus in ieder blad
      binnen += `<path transform="rotate(${deg})" d="${blad(3 * f, 38 * f, 6.5 * f, 58 * f, 70 * f)}"/>`;
      const [x, y] = pol(75 * f, deg);
      binnen += `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(4.4 * f)}"/>`;
      const [ox, oy] = pol(84 * f, deg + 180 / n);
      oculi += `<circle cx="${r2(ox)}" cy="${r2(oy)}" r="${r2(5.6 * f)}"/>`;
      const [px, py] = pol(46 * f, deg + 180 / n);
      oculi += `<circle cx="${r2(px)}" cy="${r2(py)}" r="${r2(2.8 * f)}"/>`;
    }
  }
  const vierpas = [0, 90, 180, 270].map((d) => {
    const [x, y] = pol(8 * f * (groot ? 1 : 1.15), d);
    return `<circle cx="${x}" cy="${y}" r="${r2(8 * f * (groot ? 1 : 1.15))}"/>`;
  }).join('');
  // licht dat door het venster naar buiten valt
  let licht = '';
  if (groot) {
    for (let i = 0; i < 120; i++) {
      const deg = 3 * i + 1.5;
      const lang = i % 10 === 0 ? 99 : i % 5 === 0 ? 95 : i % 2 ? 88 : 91;
      licht += straal(R + 3, lang, deg, i % 5 === 0 ? 1.3 : 0.6);
    }
  }
  return `${defs}${groot ? `<circle r="99" fill="url(#${g}h)"/><path fill="${k.straal}" d="${licht}"/>` : ''}<circle r="${R}" fill="url(#${g}g)"/><g fill="${k.glasKoel}" opacity="${k.glasKoelSterkte}">${glasBlauw}</g><g fill="${k.oculus}" opacity="0.9">${oculi}</g><g fill="none" stroke="${k.lood}" stroke-width="${sw}" stroke-linejoin="round">${bladen}${oculi.replace(/<circle/g, '<circle')}${binnen}</g><circle r="${r2(29 * f)}" fill="${k.hart}" stroke="${k.lood}" stroke-width="${groot ? 1.8 : 4.5}"/><g fill="${k.kern}">${vierpas}</g><circle r="${R}" fill="none" stroke="${k.ring}" stroke-width="${groot ? 3.6 : 7.5}"/>${groot ? `<circle r="${R - 6}" fill="none" stroke="${k.lood}" stroke-width="1"/>` : ''}`;
}

// ---------- 3 De ster ----------
function sterVorm(boven, onder, zij, taille = 0.075) {
  const t = Math.max(boven, zij) * taille;
  return `M0 ${-boven}C${t} ${-boven * 0.22} ${zij * 0.45} ${-t} ${zij} 0C${zij * 0.45} ${t} ${t} ${onder * 0.22} 0 ${onder}C${-t} ${onder * 0.22} ${-zij * 0.45} ${t} ${-zij} 0C${-zij * 0.45} ${-t} ${-t} ${-boven * 0.22} 0 ${-boven}Z`;
}
// facetten: kwadranten rechtsboven en linksonder in een tweede tint (geslepen, niet plat)
function sterFacet(boven, onder, zij, taille = 0.075) {
  const t = Math.max(boven, zij) * taille;
  return `M0 0L0 ${-boven}C${t} ${-boven * 0.22} ${zij * 0.45} ${-t} ${zij} 0ZM0 0L0 ${onder}C${-t} ${onder * 0.22} ${-zij * 0.45} ${t} ${-zij} 0Z`;
}
function ster(k, detail) {
  const groot = detail === 'groot';
  const g = uid('st');
  const defs = `<defs><radialGradient id="${g}h"><stop offset="0" stop-color="${k.gloed}" stop-opacity="${k.gloedSterkte}"/><stop offset="0.35" stop-color="${k.gloed}" stop-opacity="${k.gloedSterkte * 0.4}"/><stop offset="1" stop-color="${k.gloed}" stop-opacity="0"/></radialGradient></defs>`;
  const [B, O, Z] = groot ? [90, 99, 44] : [92, 98, 54];
  const tal = groot ? 0.07 : 0.11;
  if (!groot) {
    return `${defs}<path fill="${k.ster}" transform="rotate(45)" opacity="0.6" d="${sterVorm(42, 42, 42, 0.17)}"/><path fill="${k.ster}" d="${sterVorm(B, O, Z, tal)}"/><path fill="${k.facet}" d="${sterFacet(B, O, Z, tal)}"/>`;
  }
  // stralenbundel: haarfijne stralen met wisselende lengte, langer langs de diagonalen
  let haar = '';
  for (let i = 0; i < 144; i++) {
    const deg = 2.5 * i + 1.25;
    const diag = Math.abs(Math.sin((deg * Math.PI) / 90)); // 1 op de diagonalen
    haar += straal(12, 30 + diag * 34 + ruis(i) * 18, deg, 0.6);
  }
  let mid = '';
  for (let i = 0; i < 16; i++) {
    const deg = 22.5 * i + 11.25;
    mid += straal(12, i % 2 ? 50 : 58, deg, 1.8);
  }
  const sterretjes = [[-72, -64, 3.4], [76, -50, 2.6], [-60, 68, 2.4], [68, 72, 3.2], [-88, 6, 1.8], [90, 16, 2], [-30, -88, 1.5], [38, 88, 1.4]]
    .map(([x, y, s]) => `<path transform="translate(${x} ${y})" d="${sterVorm(s * 2.4, s * 2.4, s * 1.5, 0.2)}"/>`)
    .join('');
  const stof = Array.from({ length: 22 }, (_, i) => {
    const [x, y] = pol(52 + ruis(i + 30) * 44, i * 16.36 + ruis(i + 4) * 9);
    return `<circle cx="${x}" cy="${y}" r="${0.5 + ruis(i + 12) * 0.8}"/>`;
  }).join('');
  return `${defs}<circle r="99" fill="url(#${g}h)"/><circle r="40" fill="none" stroke="${k.gloedLijn}" stroke-width="0.6" opacity="0.7"/><circle r="27" fill="none" stroke="${k.gloedLijn}" stroke-width="0.4" opacity="0.6"/><g fill="${k.straal}" opacity="0.8"><path d="${haar}"/></g><path fill="${k.straal}" opacity="0.9" d="${mid}"/><path fill="${k.ster}" transform="rotate(45)" opacity="0.5" d="${sterVorm(36, 36, 36, 0.15)}"/><path fill="${k.facet}" transform="rotate(45)" opacity="0.5" d="${sterFacet(36, 36, 36, 0.15)}"/><path fill="${k.ster}" d="${sterVorm(B, O, Z, tal)}"/><path fill="${k.facet}" d="${sterFacet(B, O, Z, tal)}"/><g fill="${k.fijn}">${sterretjes}${stof}</g>`;
}

const MERKEN = { 1: stralenkrans, 2: roosvenster, 3: ster };

export function beeldmerk(richting, { schema = 'licht', detail = 'groot', klasse = '', titel = 'Kom naar de kerk.' } = {}) {
  const k = PALETTEN[richting][schema];
  const aria = titel ? `role="img" aria-label="${titel}"` : 'aria-hidden="true" focusable="false"';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-100 -100 200 200" ${klasse ? `class="${klasse}"` : ''} ${aria}>${MERKEN[richting](k, detail)}</svg>`;
}

// ---------- woordmerken ----------
const TEKST = {
  1: { font: 'newsreader', regel: 'Kom naar de kerk', regels: ['Kom naar', 'de kerk'], asc: 1500, lh: 2050, punt: 'punt', schaal: 1 },
  2: { font: 'archivo', regel: 'KOM NAAR DE KERK', regels: ['KOM NAAR', 'DE KERK'], asc: 1500, lh: 1500, punt: 'blok', schaal: 1 },
  3: { font: 'instrument', regel: 'kom naar de kerk', regels: ['kom naar', 'de kerk'], asc: 760, lh: 900, punt: 'ster', schaal: 1 }
};

function punt(richting, x, y, k) {
  const t = TEKST[richting];
  if (t.punt === 'punt') return { svg: `<circle cx="${x + 160}" cy="${y - 118}" r="118" fill="${k.kern}"/>`, b: 300 };
  if (t.punt === 'blok') return { svg: `<rect x="${x + 70}" y="${y - 260}" width="260" height="260" fill="${k.lijn}"/>`, b: 340 };
  // ster als punt: kleine vierpuntige ster op de basislijn
  return { svg: `<path transform="translate(${x + 110} ${y - 95}) scale(1.25)" fill="${k.gloed}" d="${sterVorm(80, 80, 46, 0.12)}"/>`, b: 200 };
}

export function woordmerk(richting, { schema = 'licht', regels = 1 } = {}) {
  const t = TEKST[richting];
  const k = PALETTEN[richting][schema];
  const bron = WOORD[t.font];
  const delen = regels === 1 ? [t.regel] : t.regels;
  let inhoud = '';
  let breedte = 0;
  delen.forEach((r, i) => {
    const w = bron[r];
    const y = t.asc + i * t.lh;
    inhoud += `<path transform="translate(0 ${y})" d="${w.d}" fill="${k.tekst}"/>`;
    let eind = w.breedte;
    if (i === delen.length - 1) {
      const p = punt(richting, eind, y, k);
      inhoud += p.svg;
      eind += p.b;
    }
    breedte = Math.max(breedte, eind);
  });
  return { inhoud, breedte, hoogte: t.asc + (delen.length - 1) * t.lh + (richting === 3 ? 240 : 520), upm: bron[t.regel].upm };
}

export function woordmerkSvg(richting, opties = {}) {
  const w = woordmerk(richting, opties);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.ceil(w.breedte)} ${w.hoogte}" role="img" aria-label="Kom naar de kerk."><title>Kom naar de kerk.</title>${w.inhoud}</svg>`;
}

// Horizontaal: beeldmerk + woordmerk.
export function logoHorizontaal(richting, { schema = 'licht', detail = 'groot', klasse = '' } = {}) {
  const w = woordmerk(richting, { schema });
  const upm = w.upm;
  const mh = upm * 1.55; // hoogte beeldmerk in letter-eenheden
  const s = mh / 200;
  const gat = upm * 0.28;
  const yMid = w.hoogte * (richting === 3 ? 0.55 : 0.5);
  const merk = `<g transform="translate(${mh / 2} ${yMid}) scale(${s})">${MERKEN[richting](PALETTEN[richting][schema], detail)}</g>`;
  const tekst = `<g transform="translate(${mh + gat} 0)">${w.inhoud}</g>`;
  const hoogte = Math.max(w.hoogte, mh);
  const y0 = yMid - hoogte / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${r2(y0)} ${Math.ceil(mh + gat + w.breedte)} ${r2(hoogte)}" ${klasse ? `class="${klasse}"` : ''} role="img" aria-label="Kom naar de kerk."><title>Kom naar de kerk.</title>${merk}${tekst}</svg>`;
}

// Staand: beeldmerk boven, woordmerk in twee regels.
export function logoStaand(richting, { schema = 'licht', klasse = '' } = {}) {
  const w = woordmerk(richting, { schema, regels: 2 });
  const mh = w.upm * 2.6;
  const s = mh / 200;
  const breedte = Math.max(w.breedte, mh);
  const merk = `<g transform="translate(${breedte / 2} ${mh / 2}) scale(${s})">${MERKEN[richting](PALETTEN[richting][schema], 'groot')}</g>`;
  const tekst = `<g transform="translate(${(breedte - w.breedte) / 2} ${mh + w.upm * 0.25})">${w.inhoud}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.ceil(breedte)} ${Math.ceil(mh + w.upm * 0.25 + w.hoogte)}" ${klasse ? `class="${klasse}"` : ''} role="img" aria-label="Kom naar de kerk."><title>Kom naar de kerk.</title>${merk}${tekst}</svg>`;
}

export function icoon(richting, { schema = 'donker', achtergrond } = {}) {
  const bg = achtergrond || { 1: '#29463E', 2: '#25312F', 3: '#1F2B3B' }[richting];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="Kom naar de kerk."><rect width="120" height="120" rx="26" fill="${bg}"/><g transform="translate(60 60) scale(0.44)">${MERKEN[richting](PALETTEN[richting][schema], 'klein')}</g></svg>`;
}
