// Beeldmerk 'De open deur': een boogvormige deuropening (kerkportaal) waarvan de deur
// op een kier staat, met licht dat naar buiten op de grond valt. Geen kruis: het
// christelijke zit in de vorm van het portaal en in het licht dat naar buiten valt.

export const KLEUR = {
  inkt: '#1E2721',
  licht: '#E3A63F',
  lichtZacht: '#F0CF8C',
  papier: '#F5EFE4',
  mos: '#4C5B44',
  deur: '#4C5B44'
};

// viewBox 0 0 56 72. Boog: middelpunt (28,28), straal 14, dorpel op y=58.
export function beeldmerk({ titel = null, klasse = 'beeldmerk', kleuren = KLEUR, lichtvloer = true } = {}) {
  const t = titel ? `<title>${titel}</title>` : '';
  const aria = titel ? 'role="img"' : 'aria-hidden="true" focusable="false"';
  const vloer = lichtvloer
    ? `<path class="bm-vloer" d="M14 58 H34 L47 71 H3 Z" fill="${kleuren.lichtZacht}"/>`
    : '';
  return `<svg class="${klasse}" viewBox="0 0 56 72" xmlns="http://www.w3.org/2000/svg" ${aria}>${t}${vloer}<path class="bm-licht" d="M14 58 V28 A14 14 0 0 1 42 28 V58 Z" fill="${kleuren.licht}"/><path class="bm-deur" d="M34 58 V15.35 A14 14 0 0 1 42 28 V58 Z" fill="${kleuren.deur}"/><path class="bm-kozijn" d="M14 58 V28 A14 14 0 0 1 42 28 V58" fill="none" stroke="${kleuren.inkt}" stroke-width="3" stroke-linejoin="round"/><path class="bm-dorpel" d="M9 58.5 H47" stroke="${kleuren.inkt}" stroke-width="3" stroke-linecap="round"/></svg>`;
}

// Favicon: zelfde vorm, zwaarder, zonder vloer, op papierkleurige tegel.
export function favicon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${KLEUR.papier}"/><g transform="translate(8 2) scale(0.857)"><path d="M14 58 V28 A14 14 0 0 1 42 28 V58 Z" fill="${KLEUR.licht}"/><path d="M34 58 V15.35 A14 14 0 0 1 42 28 V58 Z" fill="${KLEUR.deur}"/><path d="M14 58 V28 A14 14 0 0 1 42 28 V58" fill="none" stroke="${KLEUR.inkt}" stroke-width="4" stroke-linejoin="round"/><path d="M8 59 H48" stroke="${KLEUR.inkt}" stroke-width="4" stroke-linecap="round"/></g></svg>`;
}

// Woordmerk als HTML (echte tekst: toegankelijk en scherp). Voor losse logobestanden
// zie scripts/merk.mjs (rendert PNG's vanuit de webfont).
export function woordmerkHtml() {
  return `<span class="woordmerk"><span class="woordmerk-naam">kom naar de kerk</span><span class="woordmerk-plaats">Houten</span></span>`;
}
