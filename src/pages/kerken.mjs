import { html } from '../lib/html.mjs';
import { kerkItem, paginaKop } from '../lib/onderdelen.mjs';

export const pagina = {
  pad: '/kerken/',
  titel: 'Kerken in Houten',
  omschrijving: 'De kerken in Houten die samen deze uitnodiging doen: tijden van de diensten, adres, sfeer, wat er is voor kinderen en wie je kunt spreken als je nieuw bent.'
};

const FILTERS = [
  ['kinderen', 'Iets voor kinderen'],
  ['oppas', 'Oppas voor de kleintjes'],
  ['rolstoel', 'Drempelvrij'],
  ['ringleiding', 'Ringleiding'],
  ['orgel', 'Orgel en bekende liederen'],
  ['band', 'Band en nieuwe liederen'],
  ['stilte', 'Stilte en vaste gebeden'],
  ['middag', 'Middag- of avonddienst']
];

export function inhoud(ctx) {
  const { site, kerken } = ctx;
  const concept = site.modus !== 'productie';
  const aanwezig = new Set(kerken.kerken.flatMap((k) => k.kenmerken || []));
  const filters = FILTERS.filter(([k]) => aanwezig.has(k));
  return html`
${paginaKop({
  boven: 'Kerken in Houten',
  titel: 'Elke kerk heeft een eigen sfeer. De deur staat <em>overal</em> open.',
  lead: 'De ene kerk is stil en eeuwenoud, de andere heeft een band en veel kinderen. Hieronder vind je per kerk wanneer je welkom bent, hoe het er ongeveer aan toegaat en wie je kunt spreken.'
})}

<section class="kerkenlijst" aria-labelledby="lijst-kop">
  <div class="kerkenlijst-binnen">
    <h2 class="sr" id="lijst-kop">Alle kerken</h2>
    ${filters.length
      ? html`<div class="filter" data-filter hidden>
          <p class="filter-kop" id="filter-kop">Waar let je op? <span class="klein">Kies zoveel je wilt.</span></p>
          <ul class="filter-knoppen" aria-labelledby="filter-kop">
            ${filters.map(([k, t]) => html`<li><button type="button" class="filterknop" aria-pressed="false" data-kenmerk="${k}">${t}</button></li>`)}
          </ul>
          <p class="filter-uitkomst" role="status" aria-live="polite" data-filter-uitkomst></p>
        </div>`
      : ''}
    <div class="kerken" data-schud>
      ${kerken.kerken.map((k) => kerkItem(k, { concept }))}
    </div>
    <p class="geen-resultaat" data-geen-resultaat hidden>Geen kerk past bij al deze keuzes. Haal er eentje weg, of <a href="/even-praten/">vraag ons om mee te denken</a>.</p>
    <p class="klein kerken-eerlijk">De volgorde wisselt bij elk bezoek, zodat geen kerk vooraan staat. Alle gegevens komen van de kerken zelf.</p>
  </div>
</section>

<section class="ontbreekt" aria-labelledby="ontbreekt-kop">
  <div class="ontbreekt-binnen">
    <h2 class="kop-3" id="ontbreekt-kop">Staat jouw kerk er niet bij?</h2>
    <p>Op deze site staan alleen kerken die zelf meedoen aan deze uitnodiging. Wil jouw kerk ook meedoen? Lees <a href="/over/#meedoen">hoe dat werkt</a>.</p>
  </div>
</section>
`;
}

export function jsonld(ctx) {
  // Alleen echte, deelnemende kerken met een adres krijgen gestructureerde gegevens.
  const echt = ctx.kerken.kerken.filter((k) => !k.voorbeeld && k.adres);
  if (!echt.length) return null;
  return {
    '@context': 'https://schema.org',
    '@graph': echt.map((k) => ({
      '@type': 'Church',
      name: k.naam,
      url: k.website || undefined,
      address: { '@type': 'PostalAddress', streetAddress: k.adres, postalCode: k.postcode || undefined, addressLocality: 'Houten', addressCountry: 'NL' },
      geo: k.geo ? { '@type': 'GeoCoordinates', latitude: k.geo.lat, longitude: k.geo.lon } : undefined
    }))
  };
}
