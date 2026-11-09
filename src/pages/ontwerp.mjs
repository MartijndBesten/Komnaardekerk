import { html, raw } from '../lib/html.mjs';
import { paginaKop } from '../lib/onderdelen.mjs';
import { KLEUREN } from '../lib/logo.mjs';

// Alleen in conceptmodus (scripts/build.mjs slaat deze pagina over in productie).
export const pagina = {
  pad: '/ontwerp/',
  titel: 'Ontwerp en merk (concept)',
  omschrijving: 'Het logo Het raakpunt, de kleuren en de letters van Kom naar de kerk. Werkdocument, geen onderdeel van de publieke site.',
  alleenConcept: true,
  sitemap: false
};

const VERSIES = [
  ['beeldmerk-donker.svg', 'Beeldmerk in kleur, op donker', 'donker'],
  ['beeldmerk.svg', 'Beeldmerk in kleur, op licht', 'licht'],
  ['logo-horizontaal-stralend-donker.svg', 'Liggend logo, stralend, op donker', 'donker'],
  ['logo-horizontaal.svg', 'Liggend logo, vlak (voor klein gebruik, zoals de kop van deze site)', 'licht'],
  ['logo-staand-donker.svg', 'Staand logo, op donker', 'donker'],
  ['beeldmerk-vlak.svg', 'Vlak beeldmerk (16 tot 48 px)', 'licht'],
  ['beeldmerk-zwart.svg', 'Eén kleur, zwart (spandoek, borduurwerk, stempel)', 'wit'],
  ['beeldmerk-wit.svg', 'Eén kleur, wit', 'nacht'],
  ['beeldmerk-kerst-donker.svg', 'Kerst: met losse sterretjes, alleen in de kersttijd', 'donker'],
  ['icoon.svg', 'App-icoon en favicon', 'licht']
];

const KLEURLIJST = [
  ['Warm donker', KLEUREN.nacht, 'donkere achtergrond, tekst'],
  ['Ivoor', KLEUREN.ivoor, 'tekst op donker'],
  ['Papier', KLEUREN.papier, 'lichte achtergrond'],
  ['Wijnrood (God)', KLEUREN.god, 'de bovenste arm, knoppen'],
  ['Terracotta (mens)', KLEUREN.mens, 'de onderste arm, accenten'],
  ['Licht', KLEUREN.licht, 'stralen en gloed'],
  ['Goud', KLEUREN.goud, 'stralen; als punt en tekst de diepe variant ' + KLEUREN.goudDiep]
];

export function inhoud() {
  return html`
${paginaKop({
  boven: 'Werkdocument · concept',
  titel: 'Ontwerp en <em>merk</em>',
  lead: 'Het logo, de kleuren en de letters van Kom naar de kerk. Bedoeld om met de kerken te bespreken; geen onderdeel van de publieke site.'
})}

<section class="ow" aria-labelledby="ow-verhaal">
  <div class="ow-binnen">
    <h2 class="kop-2" id="ow-verhaal">Het raakpunt</h2>
    <p class="lead">Naar <em>De schepping van Adam</em> van Michelangelo: God reikt van boven, de mens van onder. Ze raken elkaar bijna. In de kier breekt hemels licht door.</p>
    <p>De bovenste arm is wijnrood: God. De onderste is terracotta: de mens, die in de Bijbel uit aarde wordt gemaakt. Het licht ertussen bestaat uit een gloed, brede bundels, een krans van fijne stralen en lange hoofdstralen, iets sterker omhoog dan omlaag: de hemel gaat open. Geen kruis en geen gebouw. De ontmoeting zelf is het beeld. De punt achter ‘kerk’ is een gouden lichtpunt.</p>
    <p>Het logo ontstond in twaalf rondes. Eerdere richtingen (een open deur, een portaal, twee bogen die elkaar overlappen) vielen af omdat ze te simpel waren, als vlag lazen of klein als grafsteen. De geschiedenis staat in <code>HANDOFF.md</code> en <code>docs/LOGO.md</code>.</p>
  </div>
</section>

<section class="ow ow--versies" aria-labelledby="ow-versies">
  <div class="ow-binnen">
    <h2 class="kop-2" id="ow-versies">Versies</h2>
    <p class="lead">De kleurversie met gelaagd licht vanaf ongeveer 48 pixels. Daaronder, en in één kleur, de vlakke versie.</p>
    <ul class="ow-varianten">
      ${VERSIES.map(([b, naam, vlak]) => html`<li class="ow-variant ow-variant--${vlak}"><img src="/merk/logo/${b}" alt="" width="240" height="120"><span>${naam}</span></li>`)}
    </ul>
    <p class="klein">Bestanden: <code>/merk/logo/</code>. Eén bron: <code>src/lib/logo.mjs</code>, gemaakt met <code>node scripts/merk.mjs</code>.</p>
  </div>
</section>

<section class="ow" aria-labelledby="ow-kleur">
  <div class="ow-binnen">
    <h2 class="kop-2" id="ow-kleur">Kleuren en letters</h2>
    <ul class="ow-kleuren">
      ${KLEURLIJST.map(([naam, hex, waar]) => html`<li class="ow-kleur"><span class="ow-staal ow-staal--${hex.slice(1).toLowerCase()}" aria-hidden="true"></span><strong>${naam}</strong> <code>${hex}</code><br><span class="klein">${waar}</span></li>`)}
    </ul>
    <p>Koppen en het woordmerk: <strong>Newsreader</strong>, een klassieke letter met optische maten. Lopende tekst: <strong>Atkinson Hyperlegible Next</strong>, ontworpen voor goede leesbaarheid. Beide onder de SIL Open Font License en zelf gehost.</p>
    <h3 class="kop-3">Regels</h3>
    <ul class="ow-regels">
      <li>Minimaal 16 pixels hoog (vlak of één kleur); de stralende versie vanaf ongeveer 48 pixels.</li>
      <li>Vrije ruimte rondom: minstens de dikte van een arm.</li>
      <li>Niet draaien of spiegelen: God boven, mens onder. Geen andere kleuren, geen extra schaduw.</li>
      <li>De twee armen blijven altijd zichtbaar; het licht staat nooit alleen.</li>
      <li>Denckh.nl staat nooit in het logo, alleen als makervermelding onderaan de site.</li>
    </ul>
  </div>
</section>
`;
}
