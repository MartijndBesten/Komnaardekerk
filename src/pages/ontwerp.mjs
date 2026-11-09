import { html } from '../lib/html.mjs';
import { paginaKop } from '../lib/onderdelen.mjs';

// Alleen in conceptmodus (scripts/build.mjs slaat deze pagina over in productie).
// Technische details (versies, kleuren, letters, regels) staan in docs/LOGO.md.
export const pagina = {
  pad: '/ontwerp/',
  titel: 'Ontwerp en merk (concept)',
  omschrijving: 'Wat het logo Het raakpunt van Kom naar de kerk betekent. Werkdocument, geen onderdeel van de publieke site.',
  alleenConcept: true,
  sitemap: false
};

export function inhoud() {
  return html`
${paginaKop({
  boven: 'Werkdocument · concept',
  titel: 'Ontwerp en <em>merk</em>',
  lead: 'Wat het logo van Kom naar de kerk betekent. Bedoeld om met de kerken te bespreken; geen onderdeel van de publieke site.'
})}

<section class="ow" aria-labelledby="ow-verhaal">
  <div class="ow-binnen">
    <figure class="ow-beeld"><img src="/merk/logo/beeldmerk-donker.svg" alt="Het logo: een wijnrode arm van boven en een terracotta arm van onder, met stralend licht in de kier ertussen" width="272" height="312"></figure>
    <h2 class="kop-2" id="ow-verhaal">Het raakpunt</h2>
    <p class="lead">Naar <em>De schepping van Adam</em> van Michelangelo: God reikt van boven, de mens van onder. Ze raken elkaar bijna. In de kier breekt hemels licht door.</p>
    <p>De bovenste arm is wijnrood: God. De onderste is terracotta: de mens, die in de Bijbel uit aarde wordt gemaakt. Het licht ertussen bestaat uit een gloed, brede bundels, een krans van fijne stralen en lange hoofdstralen, iets sterker omhoog dan omlaag: de hemel gaat open. Geen kruis en geen gebouw. De ontmoeting zelf is het beeld. De punt achter ‘kerk’ is een gouden lichtpunt.</p>
  </div>
</section>
`;
}
