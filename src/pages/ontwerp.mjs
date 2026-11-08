import { html, raw } from '../lib/html.mjs';
import { paginaKop, foto } from '../lib/onderdelen.mjs';
import { lijn } from '../lib/lijnen.mjs';

// Alleen in conceptmodus (scripts/build.mjs slaat deze pagina over in productie).
export const pagina = {
  pad: '/ontwerp/',
  titel: 'Ontwerp en merk (concept)',
  omschrijving: 'Logoconcepten, beeldtaal en toepassingen van Kom naar de kerk. Werkdocument, geen onderdeel van de publieke site.',
  alleenConcept: true,
  sitemap: false
};

const CONCEPTEN = [
  {
    id: 'a',
    naam: 'A · De open deur',
    beeld: '/merk/concepten/a-beeldmerk.svg',
    logo: '/merk/concepten/a-open-deur.svg',
    idee: 'Een rondboog (kerkportaal) met een deur op een kier. Door de spleet valt licht naar buiten, als een baan over de grond. Het beeldmerk vertelt het hele verhaal: de deur staat open, het licht reikt tot waar jij staat.',
    scores: [5, 5, 4, 4, 5, 5, 5]
  },
  {
    id: 'b',
    naam: 'B · Portaal',
    beeld: '/merk/concepten/b-beeldmerk.svg',
    logo: '/merk/concepten/b-portaal.svg',
    idee: 'Drie geneste bogen, zoals de archivolten van een romaans portaal: meerdere kerken, één ingang. Licht in de kern. Elegant en architectonisch, maar abstracter, en op 16 px lopen de lijnen dicht.',
    scores: [4, 3, 3, 4, 4, 5, 3]
  },
  {
    id: 'c',
    naam: 'C · De punt is een deur',
    beeld: '/merk/concepten/c-monogram.svg',
    logo: '/merk/concepten/c-de-punt.svg',
    idee: 'Woordmerk-gedreven: de punt achter ‘kerk.’ is een kleine verlichte deur. De zin wordt een uitnodiging met een open einde. Als los merk een monogram ‘K.’. Sterk in tekst, zwakker als zelfstandig symbool.',
    scores: [3, 4, 5, 5, 4, 5, 4]
  }
];
const CRITERIA = ['Herkenbaarheid', 'Warmte', 'Toepasbaarheid', 'Onderscheidend', 'Past bij het initiatief', 'Voor meerdere kerken samen', 'Overtuigt niet-kerkelijke bezoekers'];

const VARIANTEN = [
  ['logo-horizontaal.svg', 'Volledig logo, horizontaal', 'licht'],
  ['logo-staand.svg', 'Compact / staand', 'licht'],
  ['beeldmerk.svg', 'Alleen beeldmerk', 'licht'],
  ['woordmerk.svg', 'Alleen woordmerk', 'licht'],
  ['logo-horizontaal-donker.svg', 'Donkere toepassing', 'donker'],
  ['logo-horizontaal-zwart.svg', 'Zwart (1 kleur)', 'wit'],
  ['logo-horizontaal-wit.svg', 'Wit (1 kleur, negatief)', 'mos'],
  ['icoon.svg', 'App-icoon / favicon', 'licht']
];

export function inhoud(ctx) {
  const { fotos } = ctx;
  const ster = (n) => '●'.repeat(n) + '○'.repeat(5 - n);
  return html`
${paginaKop({
  boven: 'Werkdocument · concept',
  titel: 'Ontwerp en <em>merk</em>',
  lead: 'Drie logorichtingen, de gekozen richting met alle varianten, de beeldtaal en toepassingen. Bedoeld om met de kerken te bespreken; geen onderdeel van de publieke site.',
  lijnNaam: 'portaal'
})}

<section class="ow" aria-labelledby="ow-concepten">
  <div class="ow-binnen">
    <h2 class="kop-2" id="ow-concepten">Drie logoconcepten</h2>
    <div class="ow-concepten">
      ${CONCEPTEN.map(
        (c) => html`<article class="ow-concept${c.id === 'a' ? ' ow-concept--gekozen' : ''}">
          <div class="ow-concept-beeld"><img src="${c.beeld}" alt="Beeldmerk ${c.naam}" width="100" height="120"></div>
          <h3 class="kop-3">${c.naam}${c.id === 'a' ? html` <span class="label-status label-status--deelnemer">gekozen, met de punt uit C</span>` : ''}</h3>
          <img class="ow-concept-logo" src="${c.logo}" alt="Logo ${c.naam}" width="400" height="60">
          <p>${c.idee}</p>
        </article>`
      )}
    </div>

    <h3 class="kop-3 ow-sub">Gebruikstoets</h3>
    <div class="tabel-scroll" tabindex="0" role="region" aria-label="Gebruikstoets van de drie logoconcepten">
      <table class="ow-tabel">
        <thead><tr><th scope="col">Criterium</th>${CONCEPTEN.map((c) => html`<th scope="col">${c.naam}</th>`)}</tr></thead>
        <tbody>${CRITERIA.map((k, i) => html`<tr><th scope="row">${k}</th>${CONCEPTEN.map((c) => html`<td><span aria-hidden="true">${ster(c.scores[i])}</span><span class="sr">${c.scores[i]} van 5</span></td>`)}</tr>`)}</tbody>
      </table>
    </div>
    <div class="ow-keuze">
      <h3 class="kop-3">Keuze: A, met de punt-deur uit C</h3>
      <p>De open deur is het sterkst als zelfstandig symbool: herkenbaar zonder tekst, warm, en het werkt van favicon tot gevelbanner. Uit concept C nemen we de punt over: achter ‘kerk.’ staat een kleine verlichte deur, zodat woordmerk en beeldmerk hetzelfde verhaal vertellen. Portaal (B) is mooi als ornament en vormtaal; de geneste bogen keren terug in de lijnillustraties.</p>
      <p>Getoetst en aangepast: een gouden boog op een donker vlak las als grafsteen. Daarom staat de deur altijd op een kier, met een donker deurblad en een lichtspleet, en wordt de boog nooit als massieve vorm op donker gebruikt. Er is geen kruis: het christelijke karakter zit in het kerkportaal, het licht en de woorden.</p>
    </div>
  </div>
</section>

<section class="ow ow--zand" aria-labelledby="ow-varianten">
  <div class="ow-binnen">
    <h2 class="kop-2" id="ow-varianten">Logovarianten</h2>
    <ul class="ow-varianten">
      ${VARIANTEN.map(([f, t, bg]) => html`<li class="ow-variant ow-variant--${bg}"><img src="/merk/logo/${f}" alt="" loading="lazy"><span>${t}</span></li>`)}
    </ul>
    <p class="klein">Alle bestanden staan als SVG (letters als paden) en PNG in <code>/merk/logo/</code>. Kleinste gebruiksmaat: beeldmerk 16 px (favicon), volledig logo 120 px breed.</p>
    <div class="ow-klein" aria-label="Maattest">
      <img src="/merk/logo/icoon.svg" width="16" height="16" alt="Favicon op 16 pixels">
      <img src="/merk/logo/icoon.svg" width="32" height="32" alt="Favicon op 32 pixels">
      <img src="/merk/logo/icoon.svg" width="64" height="64" alt="Icoon op 64 pixels">
      <img src="/merk/logo/logo-horizontaal.svg" width="120" height="15" alt="Logo op 120 pixels breed">
    </div>
  </div>
</section>

<section class="ow" aria-labelledby="ow-richtingen">
  <div class="ow-binnen">
    <h2 class="kop-2" id="ow-richtingen">Drie visuele richtingen</h2>
    <div class="ow-richtingen">
      <article class="ow-richting">
        <div class="ow-richting-beeld">${foto(fotos.held, { klasse: 'boog', bijschrift: false, sizes: '30vw' })}</div>
        <h3 class="kop-3">1 · De open deur en natuurlijk licht</h3>
        <p>Echte deuren, drempels en lichtval, altijd in de boogvorm. Warm hout, zon op steen. Het beeld vertelt: binnenkomen mag. Sterkste richting voor de hero en het merk.</p>
      </article>
      <article class="ow-richting">
        <div class="ow-richting-beeld ow-richting-beeld--leeg">${raw(lijn('samen'))}<p class="klein">Beeld volgt: echte ontmoetingen in Houten, met toestemming</p></div>
        <h3 class="kop-3">2 · Ontmoeting en gastvrijheid</h3>
        <p>Handen om een koffiekop, een gedekte tafel, iemand die de deur openhoudt. Van opzij of van achteren, niet geposeerd. Alleen echte gemeenteleden en bezoekers met toestemming; tot die tijd lijnillustraties in plaats van stockmensen.</p>
      </article>
      <article class="ow-richting">
        <div class="ow-richting-beeld">${foto(fotos.toren, { klasse: 'boog', bijschrift: false, sizes: '30vw' })}</div>
        <h3 class="kop-3">3 · Architectuur, lichtval en typografie</h3>
        <p>Torens, bogen en ruimte, gecombineerd met grote redactionele koppen in Newsreader en veel lucht. Rustig en tijdloos, voor paginakoppen en drukwerk.</p>
      </article>
    </div>
    <div class="ow-keuze">
      <h3 class="kop-3">Samengevoegd</h3>
      <p>De open deur (1) is het merk en de hero; architectuur en typografie (3) dragen de paginakoppen; ontmoeting (2) komt in lijnillustraties tot er echte foto’s met toestemming zijn. Fotostijl: daglicht, warm, ongeposeerd, geen gevouwen handen of stockgezinnen, nooit AI-mensen als ‘echte’ bezoekers. Alle foto’s van kerken komen nu van Wikimedia Commons, met naamsvermelding.</p>
    </div>
  </div>
</section>

<section class="ow ow--zand" aria-labelledby="ow-toepassing">
  <div class="ow-binnen">
    <h2 class="kop-2" id="ow-toepassing">Toepassingen</h2>
    <div class="ow-toepassingen">
      <figure class="tp tp-kaartje">
        <div class="tp-kaartje-voor"><img src="/merk/logo/logo-staand.svg" alt="" width="140" height="110"></div>
        <div class="tp-kaartje-achter"><p class="tp-kop">Er is plek voor jou.</p><p>komnaardekerk.nu</p></div>
        <figcaption>Visitekaartje (85 × 55 mm), voor- en achterkant</figcaption>
      </figure>
      <figure class="tp tp-uitnodiging">
        <div class="tp-uitnodiging-blad">
          <img src="/merk/logo/beeldmerk.svg" alt="" width="48" height="58">
          <p class="tp-kop">Kom gerust een keer binnen.</p>
          <p>Zondag in een van de kerken in Houten. Je hoeft niets te kunnen of te weten.</p>
          <p class="tp-url">komnaardekerk.nu</p>
        </div>
        <figcaption>Uitnodigingskaart (A6)</figcaption>
      </figure>
      <figure class="tp tp-poster">
        <div class="tp-poster-blad">
          ${foto(fotos.held, { klasse: 'boog tp-poster-foto', bijschrift: false, sizes: '20vw' })}
          <p class="tp-kop">Er is plek voor <em>jou.</em></p>
          <img src="/merk/logo/logo-horizontaal.svg" alt="" width="160" height="20">
        </div>
        <figcaption>Poster (A3)</figcaption>
      </figure>
      <figure class="tp tp-social">
        <div class="tp-social-blad">
          <p class="tp-kop">Je hoeft niet zeker te weten wat je gelooft.</p>
          <p class="tp-kop tp-kop--licht">Je mag gewoon komen.</p>
          <img src="/merk/logo/logo-horizontaal-donker.svg" alt="" width="160" height="20">
        </div>
        <figcaption>Social-post (1:1)</figcaption>
      </figure>
    </div>
  </div>
</section>

<section class="ow" aria-labelledby="ow-kleur">
  <div class="ow-binnen">
    <h2 class="kop-2" id="ow-kleur">Kleur en letter</h2>
    <ul class="ow-kleuren">
      <li><span class="staal staal--papier"></span>Papier <code>#F5EFE4</code></li>
      <li><span class="staal staal--zand"></span>Zand <code>#ECE2D0</code></li>
      <li><span class="staal staal--inkt"></span>Inkt <code>#1E2721</code></li>
      <li><span class="staal staal--mos"></span>Mos <code>#4C5B44</code></li>
      <li><span class="staal staal--klei"></span>Klei <code>#9C4325</code></li>
      <li><span class="staal staal--licht"></span>Licht <code>#E3A63F</code></li>
    </ul>
    <p class="ow-letter-kop">Newsreader: <em>koppen en woordmerk</em></p>
    <p class="ow-letter-tekst">Atkinson Hyperlegible Next: lopende tekst, ontworpen voor slechtzienden.</p>
  </div>
</section>
`;
}
