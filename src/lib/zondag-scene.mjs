// Een zondagochtend als getekende kerkzaal, gezien vanaf de achterste rij.
// ‘Jij’ is goud (het licht uit het logo) en loopt de ochtend mee: binnenkomen, zitten, zingen, luisteren,
// stil zijn, koffie, en de deur weer uit. Met je keuzes (muziek, met wie je komt, blijven of naar huis)
// verandert het beeld. Alles gebeurt met CSS-klassen op het <svg>; het script zet alleen data-attributen.
// Het beeld is decoratief (aria-hidden): de tekst ernaast vertelt hetzelfde.

const r = (n) => Math.round(n * 10) / 10;

// iemand die zit: hoofd en schouders boven de bank
function zittend(x, y, s, kleur, extra = '') {
  return `<g class="mens${extra}"><circle cx="${r(x)}" cy="${r(y - 17 * s)}" r="${r(5.4 * s)}" fill="${kleur}"/><path d="M${r(x - 9 * s)} ${r(y + 2)}Q${r(x - 9 * s)} ${r(y - 10 * s)} ${r(x)} ${r(y - 10 * s)}Q${r(x + 9 * s)} ${r(y - 10 * s)} ${r(x + 9 * s)} ${r(y + 2)}Z" fill="${kleur}"/></g>`;
}
// iemand die staat, met de voeten op (0,0)
function staand(kleur, s = 1, rand = '') {
  const st = rand ? ` stroke="${rand}" stroke-width="1.2"` : '';
  return `<g transform="scale(${s})"><circle cx="0" cy="-31" r="6"${st} fill="${kleur}"/><path d="M-8 0V-14Q-8 -23 0 -23Q8 -23 8 -14V0Z"${st} fill="${kleur}"/></g>`;
}

const KLEUREN = ['#7a2e3b', '#c9733f', '#5a4a4d', '#a64f2e', '#8c6b5e', '#b48a74', '#6b3a45'];
const RIJEN = [
  { y: 170, x1: 92, x2: 292, s: 0.62, mensen: [110, 135, 185, 228, 270] },
  { y: 193, x1: 72, x2: 310, s: 0.74, mensen: [92, 150, 176, 240, 290] },
  { y: 217, x1: 50, x2: 328, s: 0.87, mensen: [70, 98, 200, 228, 300] },
  { y: 243, x1: 26, x2: 346, s: 1, mensen: [48, 120, 150, 250] }
];

export function zondagScene() {
  let i = 0;
  const kleur = () => KLEUREN[i++ % KLEUREN.length];
  const rijen = RIJEN.map(
    (rij) =>
      rij.mensen.map((x) => zittend(x, rij.y, rij.s, kleur())).join('') +
      `<rect class="bank" x="${rij.x1}" y="${rij.y}" width="${rij.x2 - rij.x1}" height="${r(7 * rij.s)}" rx="2"/>`
  );
  // jij (en wie er meekomt) zittend op de achterste rij, rechts aan het pad
  const zitJij = zittend(328, 243, 1, '#f0c24e', ' jij-zit');
  const zitSamen = zittend(306, 243, 1, '#e2a06a', ' samen-zit');
  const zitKind = zittend(308, 243, 0.72, '#e2a06a', ' kind-zit');
  const muzieknoten = [0, 1, 2].map((n) => `<text class="noot noot-${n}" x="${118 + n * 16}" y="150">♪</text>`).join('');
  const stoom = [0, 1, 2].map((n) => `<path class="stoom stoom-${n}" d="M${236 + n * 14} 196q-3 -5 0 -9t0 -9"/>`).join('');

  return `<svg class="zondag" viewBox="0 0 400 260" aria-hidden="true" focusable="false" data-stap="binnen">
  <defs>
    <linearGradient id="zs-licht" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".9"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></linearGradient>
    <radialGradient id="zs-gloed"><stop offset="0" stop-color="#fff6d8"/><stop offset=".5" stop-color="#ffe9a8" stop-opacity=".7"/><stop offset="1" stop-color="#f0c24e" stop-opacity="0"/></radialGradient>
  </defs>
  <rect class="muur" width="400" height="152"/>
  <path class="vloer" d="M0 152H400V260H0Z"/>
  <path class="raam" d="M188 104V44Q200 22 212 44V104Z"/>
  <path class="stralen" d="M188 104L150 260H250L212 104Z" fill="url(#zs-licht)"/>
  <g class="scherm"><rect x="58" y="42" width="96" height="54" rx="3"/>
    <g class="scherm-welkom"><circle cx="106" cy="69" r="11" fill="url(#zs-gloed)"/></g>
    <g class="scherm-lied"><path d="M70 56h60M70 64h48M70 76h62M70 84h40"/></g>
    <g class="scherm-tekst"><path d="M70 58h70M70 65h70M70 72h64M70 79h70M70 86h50"/></g>
  </g>
  <g class="orgel"><rect x="12" y="92" width="7" height="60" rx="2"/><rect x="22" y="80" width="7" height="72" rx="2"/><rect x="32" y="70" width="7" height="82" rx="2"/><rect x="42" y="80" width="7" height="72" rx="2"/><rect x="52" y="92" width="7" height="60" rx="2"/></g>
  <g class="piano"><rect x="100" y="138" width="44" height="16" rx="2"/><path d="M103 141h38"/></g>
  <g class="band"><g transform="translate(112 160)">${staand('#5a4a4d', 0.6)}</g><g transform="translate(140 160)">${staand('#a64f2e', 0.6)}</g><path class="gitaar" d="M106 150l14 -6"/><circle class="drum" cx="128" cy="154" r="6"/></g>
  ${muzieknoten}
  <g class="lessenaar"><path d="M256 152V126H284V152Z"/><path class="boek" d="M258 124l12 -4l12 4l-12 3Z"/><circle class="boek-gloed" cx="270" cy="121" r="16" fill="url(#zs-gloed)"/></g>
  <g class="voorganger" transform="translate(270 126)">${staand('#2a1b1e', 0.62)}</g>
  <g class="spreken"><path d="M290 102q8 -4 0 -8M296 106q12 -8 0 -16"/></g>
  <g class="deur"><path class="deur-licht" d="M372 250V172H398V250Z" fill="url(#zs-gloed)"/><path class="deur-kozijn" d="M372 250V172H398"/></g>
  <g class="begroeter" transform="translate(358 248)">${staand('#7a2e3b', 0.95)}<g class="welkom"><rect x="-44" y="-62" width="40" height="16" rx="8"/><text x="-24" y="-51" text-anchor="middle">welkom!</text></g><g class="totziens"><rect x="-50" y="-62" width="46" height="16" rx="8"/><text x="-27" y="-51" text-anchor="middle">tot ziens!</text></g></g>
  <g class="zaal">${rijen.join('')}</g>
  ${zitSamen}${zitKind}${zitJij}
  <g class="stilte"><rect width="400" height="260"/><circle cx="150" cy="190" r="22" fill="url(#zs-gloed)"/><circle cx="240" cy="210" r="18" fill="url(#zs-gloed)"/><circle cx="328" cy="222" r="20" fill="url(#zs-gloed)"/></g>
  <g class="koffie"><rect class="tafel" x="214" y="198" width="74" height="8" rx="3"/><path class="tafel-poot" d="M222 206v22M280 206v22"/><g class="kopjes"><rect x="232" y="190" width="8" height="8" rx="2"/><rect x="246" y="190" width="8" height="8" rx="2"/><rect x="260" y="190" width="8" height="8" rx="2"/></g>${stoom}
    <g transform="translate(200 236)">${staand('#7a2e3b', 0.9)}</g><g transform="translate(300 238)">${staand('#5a4a4d', 0.92)}</g><g transform="translate(120 230)">${staand('#c9733f', 0.85)}</g><g transform="translate(140 232)">${staand('#8c6b5e', 0.85)}</g><g transform="translate(70 238)">${staand('#a64f2e', 0.9)}</g></g>
  <g class="loper samen-loopt">${staand('#e2a06a', 1)}</g>
  <g class="loper kind-loopt">${staand('#e2a06a', 0.7)}</g>
  <g class="loper jij-loopt">${staand('#f0c24e', 1, '#d9a032')}<text class="jij-label" x="0" y="-44" text-anchor="middle">jij</text></g>
</svg>`;
}
