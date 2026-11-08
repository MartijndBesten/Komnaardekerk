// Lijnillustraties in de vormtaal van het merk: rondbogen, rustige lijn (2px bij 64px), ronde uiteinden.
// Decoratief (aria-hidden). Kleur via currentColor; het 'licht' via var(--licht) in CSS.

const OMHULSEL = (inhoud) =>
  `<svg class="lijn" viewBox="0 0 64 64" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inhoud}</svg>`;

export const LIJNEN = {
  // binnenkomen: boog met deur op een kier en lichtbaan
  deur: OMHULSEL('<path d="M18 54V26a14 14 0 0 1 28 0v28"/><path d="M34 54l3-38" /><path class="lijn-licht" d="M34 54h12l8 6H30z" fill="currentColor" stroke="none"/><path d="M12 54h40"/>'),
  // zingen: drie golvende lijnen onder een boog
  zingen: OMHULSEL('<path d="M14 40c6-6 12 6 18 0s12 6 18 0"/><path d="M14 48c6-6 12 6 18 0s12 6 18 0"/><path d="M20 30a12 12 0 0 1 24 0" /><circle class="lijn-licht" cx="32" cy="18" r="3" fill="currentColor" stroke="none"/>'),
  // lezen: open boek
  lezen: OMHULSEL('<path d="M32 22c-6-4-14-5-20-4v30c6-1 14 0 20 4 6-4 14-5 20-4V18c-6-1-14 0-20 4z"/><path d="M32 22v30"/><path class="lijn-licht" d="M32 12v4" /><path d="M26 10l2 4M38 10l-2 4"/>'),
  // bidden: kaars met vlam
  bidden: OMHULSEL('<path d="M26 56V30h12v26"/><path d="M22 56h20"/><path class="lijn-licht" d="M32 14c4 4 4 8 0 10-4-2-4-6 0-10z" fill="currentColor" stroke="none"/><path d="M32 24v6"/>'),
  // koffie: kop met damp
  koffie: OMHULSEL('<path d="M16 32h26v8a12 12 0 0 1-12 12h-2A12 12 0 0 1 16 40z"/><path d="M42 36h4a5 5 0 0 1 0 10h-4"/><path d="M12 56h36"/><path class="lijn-licht" d="M24 16c-2 3 2 5 0 8M32 14c-2 3 2 5 0 8"/>'),
  // samen: twee bogen naast elkaar (twee mensen / twee deuren)
  samen: OMHULSEL('<path d="M12 54V34a9 9 0 0 1 18 0v20"/><path d="M34 54V34a9 9 0 0 1 18 0v20"/><path d="M8 54h48"/><circle class="lijn-licht" cx="32" cy="16" r="3" fill="currentColor" stroke="none"/>'),
  // boog/portaal (ornament)
  portaal: OMHULSEL('<path d="M14 56V30a18 18 0 0 1 36 0v26"/><path d="M22 56V32a10 10 0 0 1 20 0v24"/><path d="M8 56h48"/>')
};

export function lijn(naam, klasse = '') {
  const svg = LIJNEN[naam];
  return klasse ? svg.replace('class="lijn"', `class="lijn ${klasse}"`) : svg;
}
