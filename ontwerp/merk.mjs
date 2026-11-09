// Ronde 6 — het merk van 'Kom naar de kerk.': 'Doorgang'.
// Combineert de kerkarchitectuur van ontwerp A (een romaans portaal met een terugwijkende boog)
// met de christelijke herkenbaarheid en de stevige letter van ontwerp B (het kruis, Archivo smal en zwaar).
//
// GEKOZEN: 'Spitsboog' (onderaan): een gotisch portaal waarvan de deuren openstaan; binnen, in het licht, het kruis.
// Getoetst en afgevallen: 'Kruisdeur' en 'Open deur' met rondboog — een ronde boog met een kruis leest klein als grafsteen.
// Het beeldmerk 'Open deur': een romaans portaal waarvan de deuren openstaan. Binnen, in het licht,
// staat het kruis. Je kijkt naar binnen en ziet waar het om draait. De opengezwaaide deuren maken het
// silhouet breder aan de voet, zodat het leest als doorgang en niet als grafsteen (risico bij een boog met kruis).
// De eerdere variant 'Kruisdeur' (licht door de kieren van een gesloten deur) staat er nog als beeldmerkKruisdeur.
// Volledig vlak: geen foto, geen verloop, geen gloed. Werkt in één kleur en in drie detailniveaus.

import { readFileSync } from 'node:fs';

const ARCHIVO = JSON.parse(readFileSync(new URL('./merk/archivo.json', import.meta.url), 'utf8'));

export const KLEUR = {
  kalk: '#F4F1EB', inkt: '#16212B', leisteen: '#2C4A66', baksteen: '#9C4430', daglicht: '#EFE6D6', hemel: '#DCE6EF'
};
export const PALET = [
  ['Kalk', KLEUR.kalk, 'achtergrond, papier'],
  ['Inkt', KLEUR.inkt, 'tekst, beeldmerk'],
  ['Leisteen', KLEUR.leisteen, 'diepte, donkere vlakken'],
  ['Baksteen', KLEUR.baksteen, 'knoppen, punt in het logo'],
  ['Daglicht', KLEUR.daglicht, 'warme vlakken'],
  ['Hemel', KLEUR.hemel, 'koele vlakken']
];

// rondboog met inzet d in een vak van 100 breed; aanzet op y=50, bodem op y=140
const boog = (d) => `M${d} 140V50A${50 - d} ${50 - d} 0 0 1 ${100 - d} 50V140Z`;

// detail: 'groot' (vanaf ± 64 px), 'midden' (32–64 px), 'klein' (favicon, 16–32 px)
// Rollen: kader (portaal en drempel), voeg (ruimte tussen de bogen), deur, licht (het kruis en de lichtval).
// Positief (licht vlak): kader = deur = inkt, voeg = licht = achtergrond.
// Negatief (donker vlak): kader = licht = licht, voeg = deur = achtergrond. De deur blijft donker, het kruis licht.
export function doorgang({ inkt = KLEUR.inkt, licht = KLEUR.kalk, detail = 'groot', negatief = false, achtergrond = KLEUR.inkt } = {}) {
  const kader = negatief ? licht : inkt;
  const voeg = negatief ? achtergrond : licht;
  const deur = negatief ? achtergrond : inkt;
  const lk = negatief ? licht : licht;
  if (detail === 'klein') {
    return `<path fill="${kader}" d="${boog(0)}"/>${negatief ? `<path fill="${deur}" d="${boog(9)}"/>` : ''}<path fill="${lk}" d="M44.5 20H55.5V140H44.5ZM20 51H80V62H20Z"/>`;
  }
  if (detail === 'midden') {
    return `<path fill="${kader}" d="${boog(0)}"/><path fill="${voeg}" d="${boog(7)}"/><path fill="${kader}" d="${boog(11.5)}"/>${negatief ? `<path fill="${deur}" d="${boog(14)}"/>` : ''}`
      + `<path fill="${lk}" d="M46.5 27H53.5V140H46.5ZM25 52H75V59H25Z"/>`
      + `<path fill="${kader}" d="M-4 143H104V148H-4Z"/><path fill="${lk}" d="M46.5 143H53.5L56.5 148H43.5Z"/>`;
  }
  // groot: portaal met een terugwijkende boog, deur, lichtkruis en drempel met lichtval
  return `<path fill="${kader}" d="${boog(0)}"/><path fill="${voeg}" d="${boog(4.5)}"/><path fill="${kader}" d="${boog(7.5)}"/><path fill="${voeg}" d="${boog(11)}"/><path fill="${deur}" d="${boog(13.5)}"/>`
    + `<path fill="${lk}" d="M47.4 27.5H52.6V140H47.4ZM25 53H75V58.2H25Z"/>`
    + `<path fill="${voeg}" d="M48.6 0.5H51.4L51 4H49Z"/>`
    + `<path fill="${kader}" d="M-5 142.5H105V147.5H-5Z"/><path fill="${lk}" d="M47.4 142.5H52.6L57.5 147.5H42.5Z"/>`;
}

const VB = '-6 -1 112 150';
export function beeldmerkKruisdeur({ titel = 'Kom naar de kerk.', klasse = '', ...o } = {}) {
  const aria = titel ? `role="img" aria-label="${titel}"` : 'aria-hidden="true" focusable="false"';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VB}"${klasse ? ` class="${klasse}"` : ''} ${aria}>${doorgang(o)}</svg>`;
}

export function favicon({ maat = null } = {}) {
  const m = maat ? ` width="${maat}" height="${maat}"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"${m} role="img" aria-label="Kom naar de kerk."><rect width="120" height="120" rx="24" fill="${KLEUR.inkt}"/><g transform="translate(14 7) scale(0.77)">${spitsboog({ licht: KLEUR.kalk, achtergrond: KLEUR.inkt, negatief: true, detail: 'klein' })}</g></svg>`;
}

// woordmerk 'Kom naar de kerk.' in Archivo 800, breedte 76; de punt is een baksteenrood blokje
function woord(tekst, kleur, punt) {
  const delen = tekst.split(' ');
  const upm = ARCHIVO.Kom.upm;
  const spatie = upm * 0.24;
  let x = 0;
  let svg = '';
  delen.forEach((d, i) => {
    const w = ARCHIVO[d];
    svg += `<path transform="translate(${Math.round(x)} 0)" fill="${kleur}" d="${w.d}"/>`;
    x += w.breedte + (i < delen.length - 1 ? spatie : 0);
  });
  if (punt) svg += `<rect x="${Math.round(x + 30)}" y="-118" width="118" height="118" fill="${punt}"/>`;
  return { svg, breedte: x + (punt ? 160 : 0), upm, kap: ARCHIVO.Kom.kapHoogte || 700 };
}

export function logo({ inkt = KLEUR.inkt, licht = KLEUR.kalk, punt = KLEUR.baksteen, klasse = 'logo', detail = 'midden', titel = 'Kom naar de kerk.', negatief = false, achtergrond = KLEUR.inkt } = {}) {
  const t = woord('Kom naar de kerk', inkt, punt);
  const mh = t.kap * 1.7; // beeldmerk iets hoger dan de kapitaalhoogte van twee regels
  const s = mh / 147;
  const gat = t.kap * 0.36;
  const x = 120 * s + gat;
  const breedte = x + t.breedte;
  const top = -mh + t.kap * 0.2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${Math.round(top)} ${Math.ceil(breedte)} ${Math.ceil(mh)}" class="${klasse}" role="img" aria-label="${titel}"><g transform="translate(0 ${top - 2 * s}) scale(${s})">${spitsboog({ inkt, licht, detail, negatief, achtergrond })}</g><g transform="translate(${x} 0)">${t.svg}</g></svg>`;
}

export function logoStaand({ inkt = KLEUR.inkt, licht = KLEUR.kalk, punt = KLEUR.baksteen, klasse = 'logo-staand' } = {}) {
  const a = woord('Kom naar', inkt, null);
  const b = woord('de kerk', inkt, punt);
  const lh = a.kap * 1.28;
  const mh = a.kap * 3.0; const s = mh / 147;
  const breedte = Math.max(a.breedte, b.breedte, 120 * s);
  const y1 = mh + a.kap * 1.45;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.ceil(breedte)} ${Math.ceil(y1 + lh + a.kap * 0.25)}" class="${klasse}" role="img" aria-label="Kom naar de kerk."><g transform="translate(0 ${-2 * s}) scale(${s})">${spitsboog({ inkt, licht, detail: 'groot' })}</g><g transform="translate(0 ${y1})">${a.svg}</g><g transform="translate(0 ${y1 + lh})">${b.svg}</g></svg>`;
}

// ---------- variant 'Open deur': de deuren staan open, binnen in het licht staat het kruis ----------
// Silhouet wijkt onderaan uit door de opengezwaaide deuren: leest als doorgang, niet als grafsteen.
const boogX = (x0, x1, top = 50, bodem = 140) => { const r = (x1 - x0) / 2; return `M${x0} ${bodem}V${top}A${r} ${r} 0 0 1 ${x1} ${top}V${bodem}Z`; };
export function opendeur({ inkt = KLEUR.inkt, licht = KLEUR.kalk, detail = 'groot', negatief = false, achtergrond = KLEUR.inkt } = {}) {
  const kader = negatief ? licht : inkt;
  const binnen = negatief ? licht : licht;
  const kruis = negatief ? achtergrond : inkt;
  const voeg = negatief ? achtergrond : licht;
  const vleugels = (b) => `<path fill="${kader}" d="M22 52L${22 - b} ${58}V145L22 ${141}Z"/><path fill="${kader}" d="M98 52L${98 + b} ${58}V145L98 ${141}Z"/>`;
  if (detail === 'klein') {
    return `<path fill="${kader}" d="${boogX(18, 102)}"/><path fill="${binnen}" d="${boogX(32, 88, 52)}"/>${vleugels(14).replace(/22/g, '18').replace(/98/g, '102')}<path fill="${kruis}" d="M54.5 40H65.5V128H54.5ZM42 60H78V71H42Z"/>`;
  }
  const ring = detail === 'groot' ? `<path fill="${voeg}" d="${boogX(25.5, 94.5)}"/><path fill="${kader}" d="${boogX(28, 92)}"/>` : `<path fill="${voeg}" d="${boogX(26.5, 93.5)}"/><path fill="${kader}" d="${boogX(29.5, 90.5)}"/>`;
  const panelen = detail === 'groot' ? `<path fill="${voeg}" d="M13 62.5L18 59.8V136L13 138Z"/><path fill="${voeg}" d="M107 62.5L102 59.8V136L107 138Z"/>` : '';
  const k = detail === 'groot' ? 'M57 40H63V126H57ZM45 60H75V66H45Z' : 'M56 40H64V126H56ZM44 59.5H76V67.5H44Z';
  return `<path fill="${kader}" d="${boogX(22, 98)}"/>${ring}<path fill="${binnen}" d="${boogX(32, 88)}"/>${vleugels(15)}${panelen}<path fill="${kruis}" d="${k}"/><path fill="${kader}" d="M2 143H118V147.5H2Z"/>`;
}
export function beeldmerkRond({ titel = 'Kom naar de kerk.', klasse = '', ...o } = {}) {
  const aria = titel ? `role="img" aria-label="${titel}"` : 'aria-hidden="true" focusable="false"';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 8 120 141"${klasse ? ` class="${klasse}"` : ''} ${aria}>${opendeur(o)}</svg>`;
}

// ---------- variant 'Spitsboog': gotisch portaal, deuren open, kruis binnen ----------
// echte offset van een spitsboog: middelpunten blijven gelijk, straal en zijkanten schuiven d naar binnen
function spits(x0, x1, d, ys = 62, bodem = 140) {
  const R = x1 - x0; const r = R - d;
  const xm = (x0 + x1) / 2;
  const h = Math.sqrt(r * r - (xm - x0) ** 2);
  const ytop = ys - h;
  return `M${x0 + d} ${bodem}V${ys}A${r} ${r} 0 0 1 ${xm} ${ytop.toFixed(2)}A${r} ${r} 0 0 1 ${x1 - d} ${ys}V${bodem}Z`;
}
export function spitsboog({ inkt = KLEUR.inkt, licht = KLEUR.kalk, detail = 'groot', negatief = false, achtergrond = KLEUR.inkt } = {}) {
  const kader = negatief ? licht : inkt;
  const voeg = negatief ? achtergrond : licht;
  const binnen = licht;
  const kruis = negatief ? achtergrond : inkt;
  const X0 = 26, X1 = 94;
  const vleugels = (b, x0 = X0, x1 = X1) => `<path fill="${kader}" d="M${x0} 66L${x0 - b} 73V146L${x0} 141Z"/><path fill="${kader}" d="M${x1} 66L${x1 + b} 73V146L${x1} 141Z"/>`;
  if (detail === 'klein') {
    return `<path fill="${kader}" d="${spits(20, 100, 0)}"/><path fill="${binnen}" d="${spits(20, 100, 13)}"/>${vleugels(14, 20, 100)}<path fill="${kruis}" d="M54.5 50H65.5V130H54.5ZM43 69H77V80H43Z"/>`;
  }
  const ringen = detail === 'groot'
    ? `<path fill="${voeg}" d="${spits(X0, X1, 3.6)}"/><path fill="${kader}" d="${spits(X0, X1, 6.4)}"/>`
    : `<path fill="${voeg}" d="${spits(X0, X1, 4.5)}"/><path fill="${kader}" d="${spits(X0, X1, 8)}"/>`;
  const panelen = detail === 'groot' ? `<path fill="${voeg}" d="M16.5 77L21.5 74.8V138L16.5 140Z"/><path fill="${voeg}" d="M103.5 77L98.5 74.8V138L103.5 140Z"/>` : '';
  const k = detail === 'groot' ? 'M57 47H63V128H57ZM46.5 68H73.5V74H46.5Z' : 'M56 47H64V128H56ZM45 67H75V75H45Z';
  return `<path fill="${kader}" d="${spits(X0, X1, 0)}"/>${ringen}<path fill="${binnen}" d="${spits(X0, X1, 10.5)}"/>${vleugels(16)}${panelen}<path fill="${kruis}" d="${k}"/><path fill="${kader}" d="M4 143H116V147.5H4Z"/>`;
}
export function beeldmerk({ titel = 'Kom naar de kerk.', klasse = '', ...o } = {}) {
  const aria = titel ? `role="img" aria-label="${titel}"` : 'aria-hidden="true" focusable="false"';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 2 120 147"${klasse ? ` class="${klasse}"` : ''} ${aria}>${spitsboog(o)}</svg>`;
}
