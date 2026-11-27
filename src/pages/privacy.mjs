import { html } from '../lib/html.mjs';
import { paginaKop } from '../lib/onderdelen.mjs';

export const pagina = {
  pad: '/privacy/',
  titel: 'Privacy',
  omschrijving: 'Hoe Kom naar de kerk. omgaat met je gegevens als je de site bezoekt.'
};

export function inhoud(ctx) {
  const { site } = ctx;
  const vv = site.verwerkingsverantwoordelijke;
  return html`
${paginaKop({
  boven: 'Privacy',
  titel: 'Kort gezegd: we willen zo <em>weinig</em> mogelijk van je weten.',
  lead: 'Deze site gebruikt geen cookies, geen advertentienetwerken en geen bezoekersstatistieken die jou volgen.'
})}

<section class="tekstpagina" aria-label="Privacyverklaring">
  <div class="tekstpagina-binnen">
    ${vv ? html`<h2 class="kop-3">Wie is verantwoordelijk?</h2><p>${vv.naam}, ${vv.adres}. Contact: ${vv.email}.</p>` : ''}

    <h2 class="kop-3">Bezoek aan de site</h2>
    <p>We plaatsen geen cookies en gebruiken geen tracking. Lettertypen en afbeeldingen komen van onze eigen site, niet van externe diensten. Onze hostingpartij verwerkt technisch noodzakelijke gegevens (zoals je IP-adres) om de site te kunnen tonen en te beschermen tegen misbruik. Die gebruiken wij niet om je te volgen.</p>
    <p>De keuzes die je op de homepage maakt (‘Hoe gaat het eigenlijk met je?’) blijven in je eigen browser. Ze worden niet opgeslagen of verstuurd.</p>

    ${site.contact.status === 'aan' ? html`<h2 class="kop-3">Als je het contactformulier invult</h2>
    <p>We vragen alleen wat nodig is om contact met je op te nemen: je voornaam, een e-mailadres of telefoonnummer, en wat je wilt (samen gaan, een gesprek of een vraag). Een bericht en een voorkeurskerk zijn niet verplicht.</p>
    <p>Omdat je met je verzoek iets laat zien over je belangstelling voor geloof, gaan we daar extra zorgvuldig mee om. We gebruiken je gegevens alleen met je uitdrukkelijke toestemming, en alleen om contact met je op te nemen. Je kunt die toestemming altijd intrekken.</p>
    <p>Je verzoek wordt niet in een database op deze site bewaard. Het wordt per e-mail doorgestuurd naar de contactpersoon van het initiatief, die het doorgeeft aan iemand van de kerk die je kiest (of die het best bij je vraag past). Na afhandeling wordt je verzoek verwijderd, uiterlijk na een termijn die we hier vóór publicatie vastleggen.</p>
    <p>We sturen je geen nieuwsbrief, we schrijven je nergens in en we geven je gegevens niet aan anderen.</p>

    ` : ''}

    ${vv ? html`<h2 class="kop-3">Je rechten</h2>
    <p>Je mag altijd vragen welke gegevens we van je hebben, ze laten verbeteren of laten verwijderen. Neem daarvoor contact op met de verantwoordelijke hierboven. Ben je niet tevreden over hoe we met je gegevens omgaan, dan kun je een klacht indienen bij de Autoriteit Persoonsgegevens.</p>` : ''}

    <h2 class="kop-3">Contact met een kerk</h2>
    <p>Via dit overzicht kun je doorklikken naar de kerk die je wilt bezoeken. Als je die kerk mailt of belt, ontvangt de kerk je bericht rechtstreeks.</p>

    <h2 class="kop-3">Links naar andere sites</h2>
    <p>Klik je door naar de website van een kerk of naar een kaart, dan gelden de privacyregels van die site.</p>
  </div>
</section>
`;
}
