import { html } from '../lib/html.mjs';
import { kerkItem, paginaKop } from '../lib/onderdelen.mjs';

export const pagina = {
  pad: '/kerken/',
  titel: 'Kerken in Houten',
  omschrijving: 'Christelijke kerken in Houten, Schalkwijk, ’t Goy en Tull en ’t Waal: tijden van de diensten, adres, wat er is voor kinderen, en hoe je contact legt. Gegevens van de eigen websites.'
};

const TRADITIES = [
  ['rooms-katholiek', 'Rooms-katholiek'],
  ['protestants', 'Protestants'],
  ['reformatorisch', 'Reformatorisch'],
  ['evangelisch', 'Evangelisch']
];
const KENMERKEN = [
  ['kinderen', 'Programma voor kinderen'],
  ['oppas', 'Oppas voor de kleintjes'],
  ['middag', 'Ook een middag- of avonddienst'],
  ['online', 'Eerst online meekijken']
];

export function inhoud(ctx) {
  const { kerken, fotos } = ctx;
  const lijst = kerken.kerken;
  const plaatsen = [...new Set(lijst.map((k) => k.plaats))];
  const tradities = TRADITIES.filter(([t]) => lijst.some((k) => k.traditie === t));
  return html`
${paginaKop({
  boven: 'Kerken in Houten',
  titel: 'Vind een <em>kerk</em> bij jou in de buurt.',
  lead: 'Rooms-katholiek, protestants, reformatorisch, evangelisch: de kerken verschillen in vorm en traditie. Hieronder vind je per kerk wanneer je welkom bent en hoe je contact legt.',
  beeld: fotos.dorp
})}

<section class="kerkenlijst" aria-labelledby="lijst-kop">
  <div class="kerkenlijst-binnen">
    <p>De informatie komt van de kerken zelf. Bekijk hun agenda voor wijzigingen en diensten op feestdagen.</p>
    <h2 class="sr" id="lijst-kop">Alle kerken</h2>
    <div class="filter" data-filter hidden>
      <div class="filter-groep">
        <p class="filter-kop" id="filter-plaats">Waar?</p>
        <ul class="filter-knoppen" aria-labelledby="filter-plaats">
          ${plaatsen.map((p) => html`<li><button type="button" class="filterknop" aria-pressed="false" data-groep="plaats" data-waarde="${p}">${p}</button></li>`)}
        </ul>
      </div>
      <div class="filter-groep">
        <p class="filter-kop" id="filter-traditie">Welke traditie?</p>
        <ul class="filter-knoppen" aria-labelledby="filter-traditie">
          ${tradities.map(([t, l]) => html`<li><button type="button" class="filterknop" aria-pressed="false" data-groep="traditie" data-waarde="${t}">${l}</button></li>`)}
        </ul>
      </div>
      <div class="filter-groep">
        <p class="filter-kop" id="filter-kenmerk">Waar let je op?</p>
        <ul class="filter-knoppen" aria-labelledby="filter-kenmerk">
          ${KENMERKEN.map(([k, l]) => html`<li><button type="button" class="filterknop" aria-pressed="false" data-groep="kenmerk" data-waarde="${k}">${l}</button></li>`)}
        </ul>
      </div>
      <p class="filter-uitkomst" role="status" aria-live="polite" data-filter-uitkomst></p>
    </div>
    <div class="kerken" data-schud>
      ${lijst.map((k) => kerkItem(k))}
    </div>
    <p class="geen-resultaat" data-geen-resultaat hidden>Geen kerk past bij al deze keuzes. Haal er eentje weg.</p>
    <p class="klein kerken-eerlijk">De volgorde wisselt bij elk bezoek, zodat geen kerk vooraan staat. De traditie is een grove indeling om je op weg te helpen; elke kerk vertelt op haar eigen website wie zij is.</p>
  </div>
</section>

`;
}

export function jsonld(ctx) {
  // Alleen deelnemende kerken met toestemming krijgen gestructureerde gegevens.
  const echt = ctx.kerken.kerken.filter((k) => k.deelname?.status === 'deelnemer' && k.deelname?.toestemmingPublicatie && k.adres);
  if (!echt.length) return null;
  return {
    '@context': 'https://schema.org',
    '@graph': echt.map((k) => ({
      '@type': 'Church',
      name: k.naam,
      url: k.website || undefined,
      address: { '@type': 'PostalAddress', streetAddress: k.adres, postalCode: k.postcode || undefined, addressLocality: k.plaats, addressCountry: 'NL' }
    }))
  };
}
