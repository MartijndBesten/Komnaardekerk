import { html } from '../lib/html.mjs';
import { kerkenkaart, kaartNummers } from '../lib/kerkenkaart.mjs';
import { kerkKaart, kerkDetail, paginaKop } from '../lib/onderdelen.mjs';

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
  ['ochtend', 'Dienst op zondagochtend'],
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
  const nummers = kaartNummers(lijst);
  return html`
${paginaKop({
  boven: 'Kerken in Houten',
  titel: 'Vind een <em>kerk</em> bij jou in de buurt.',
  lead: 'Rooms-katholiek, protestants, reformatorisch, evangelisch: de kerken verschillen in vorm en traditie. Kies een kerk op de kaart of in de lijst voor de tijden, het adres en hoe je contact legt.',
  beeld: fotos.dorp
})}

${kerkenkaart(lijst, { legenda: false, tekst: 'Tik op een nummer. Hetzelfde nummer staat op het kaartje in de lijst hieronder.' })}

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
    <ul class="kerkkaarten" data-schud data-kerkenlijst>
      ${lijst.map((k) => kerkKaart(k, { kop: 'h3', nummer: nummers.get(k.id) }))}
    </ul>
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

// Eén pagina per kerk: /kerken/<id>/. Alle details staan alleen hier; de kaartjes vatten samen.
export function paginas(content) {
  const concept = content.site.modus === 'concept';
  return content.kerken.kerken.map((kerk) => ({
    pagina: {
      pad: `/kerken/${kerk.id}/`,
      titel: `${kerk.naam}, ${kerk.plaats}`,
      omschrijving: `${kerk.naam} in ${kerk.plaats}: wanneer de diensten zijn, waar de kerk staat, wat er is voor kinderen en hoe je contact legt.`
    },
    inhoud: (ctx) => html`
<nav class="kruimel" aria-label="Kruimelpad"><div class="kruimel-binnen"><a href="/kerken/">← Alle kerken</a></div></nav>
<section class="kerkpagina">
  <div class="kerkpagina-binnen">
    ${kerkDetail(kerk, { concept })}
  </div>
</section>
<section class="kerkpagina-verder" aria-labelledby="verder-kop">
  <div class="kerkpagina-verder-binnen">
    <h2 class="kop-3" id="verder-kop">Liever niet alleen?</h2>
    <p>Je kunt ook met iemand samen gaan. Iemand van de kerk wacht je dan op of zit naast je.</p>
    <p class="knoppen"><a class="knop knop--vol" href="/samen-naar-de-kerk/?kerk=${kerk.id}">Samen gaan</a> <a class="pijllink" href="/voor-het-eerst/">Wat gebeurt er in een dienst?</a></p>
  </div>
</section>`,
    jsonld: () => (kerk.deelname?.status === 'deelnemer' && kerk.deelname?.toestemmingPublicatie && kerk.adres
      ? { '@context': 'https://schema.org', '@type': 'Church', name: kerk.naam, url: kerk.website || undefined,
          address: { '@type': 'PostalAddress', streetAddress: kerk.adres, postalCode: kerk.postcode || undefined, addressLocality: kerk.plaats, addressCountry: 'NL' } }
      : null)
  }));
}
