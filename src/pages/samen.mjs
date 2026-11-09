import { html } from '../lib/html.mjs';
import { paginaKop, hulplijnen } from '../lib/onderdelen.mjs';
import { raw } from '../lib/html.mjs';

export const pagina = {
  pad: '/samen-naar-de-kerk/',
  titel: 'Samen naar de kerk',
  omschrijving: 'Een eerste kerkbezoek voorbereiden: kies een kerk, neem iemand mee, kom op tijd. Praktische tips en contact met de kerken in Houten.'
};

const STAPPEN = [
  ['Kies een kerk en een tijd', 'Bekijk de kerken in Houten en de dorpen. Let op de tijd van de dienst, en of er iets is voor je kinderen.'],
  ['Neem iemand mee', 'Een vriend, een buurvrouw, je partner of je kind. Samen binnenlopen is makkelijker. Kerken zijn gewend aan nieuwe gezichten.'],
  ['Kijk eventueel eerst online', 'Veel kerken zenden hun diensten uit. Zo zie je alvast hoe het eruitziet.'],
  ['Kom tien minuten eerder', 'Dan heb je rustig de tijd om een plek te zoeken. Achterin is prima.'],
  ['Zeg gerust dat het je eerste keer is', 'Tegen iemand bij de deur. Dan helpen mensen je graag op weg. Hoeft niet, mag wel.'],
  ['Blijf voor de koffie, of niet', 'Na de dienst kun je een praatje maken of de voorganger iets vragen. Naar huis gaan mag ook.']
];

function formulier(ctx) {
  const { site, kerken } = ctx;
  const status = site.contact.status;
  if (status === 'uit') {
    return html`<div class="formulier-uit">
      <p>Een contactformulier komt hier zodra de kerken de opvolging samen hebben geregeld. Tot die tijd kun je rechtstreeks contact opnemen met een van de <a href="/kerken/">kerken in ${site.plaats}</a>. Bij elke kerk staat wie je kunt bellen of mailen.</p>
    </div>`;
  }
  const form = html`<form class="formulier" action="/api/contact" method="post" novalidate data-contactformulier data-status="${status}">
    ${status === 'voorbeeld'
      ? html`<p class="formulier-voorbeeld" role="note"><strong>Voorbeeld.</strong> Dit formulier verstuurt nog niets. Het gaat pas aan als de kerken de opvolging echt hebben geregeld.</p>`
      : ''}
    <div class="foutoverzicht" data-foutoverzicht tabindex="-1" hidden>
      <h3 class="kop-4">Nog niet helemaal compleet</h3>
      <ul></ul>
    </div>

    <fieldset class="veld veld--keuze">
      <legend>Waar kunnen we je mee helpen?</legend>
      <label class="keuzerondje"><input type="radio" name="soort" value="samen" checked> <span>Ik wil graag samen naar een kerk</span></label>
      <label class="keuzerondje"><input type="radio" name="soort" value="gesprek"> <span>Ik wil graag een keer praten</span></label>
      <label class="keuzerondje"><input type="radio" name="soort" value="vraag"> <span>Ik heb een vraag</span></label>
    </fieldset>

    <div class="veld">
      <label for="voornaam">Je voornaam</label>
      <input id="voornaam" name="voornaam" type="text" autocomplete="given-name" maxlength="60" required aria-describedby="voornaam-fout">
      <p class="veld-fout" id="voornaam-fout" hidden></p>
    </div>

    <fieldset class="veld veld--groep" aria-describedby="bereik-uitleg bereik-fout">
      <legend>Hoe kunnen we je bereiken?</legend>
      <p class="veld-uitleg" id="bereik-uitleg">Vul er minstens één in. We gebruiken het alleen om jou terug te bellen of te mailen.</p>
      <div class="veld">
        <label for="email">E-mailadres</label>
        <input id="email" name="email" type="email" autocomplete="email" inputmode="email" maxlength="120">
      </div>
      <div class="veld">
        <label for="telefoon">Telefoonnummer</label>
        <input id="telefoon" name="telefoon" type="tel" autocomplete="tel" inputmode="tel" maxlength="20">
      </div>
      <p class="veld-fout" id="bereik-fout" hidden></p>
    </fieldset>

    <div class="veld">
      <label for="kerk">Heb je al een kerk in gedachten? <span class="optioneel">(mag leeg blijven)</span></label>
      <select id="kerk" name="kerk">
        <option value="">Maakt niet uit, denk met me mee</option>
        ${kerken.kerken.map((k) => html`<option value="${k.id}">${k.naam}${k.voorbeeld ? ' (voorbeeld)' : ''}</option>`)}
      </select>
    </div>

    <div class="veld">
      <label for="bericht">Wil je nog iets kwijt? <span class="optioneel">(mag leeg blijven)</span></label>
      <textarea id="bericht" name="bericht" rows="4" maxlength="600" aria-describedby="bericht-uitleg"></textarea>
      <p class="veld-uitleg" id="bericht-uitleg">Bijvoorbeeld wanneer je het best bereikbaar bent. Persoonlijke dingen bespreek je liever in het gesprek zelf.</p>
    </div>

    <div class="veld veld--vinkje">
      <label class="vinkje"><input type="checkbox" name="toestemming" value="ja" required aria-describedby="toestemming-fout"> <span>Ik geef toestemming dat mijn gegevens worden gebruikt om contact met mij op te nemen, zoals beschreven in de <a href="/privacy/">privacyverklaring</a>. Ik kan die toestemming altijd intrekken.</span></label>
      <p class="veld-fout" id="toestemming-fout" hidden></p>
    </div>

    <div class="honing" aria-hidden="true">
      <label for="website">Laat dit veld leeg</label>
      <input id="website" name="website" type="text" tabindex="-1" autocomplete="off">
    </div>
    <input type="hidden" name="t" value="" data-starttijd>

    <p><button class="knop knop--vol" type="submit">Verstuur</button></p>
    <p class="klein">Je ontvangt geen nieuwsbrief en je wordt nergens ingeschreven. Iemand neemt ${site.contact.reactietermijn} persoonlijk contact met je op.</p>
  </form>
  <div class="bedankt" data-bedankt tabindex="-1" hidden>
    <h3 class="kop-3">Dank je wel<span data-bedankt-naam></span>.</h3>
    <p data-bedankt-tekst>Iemand neemt ${site.contact.reactietermijn} contact met je op.</p>
  </div>`;
  if (status === 'voorbeeld') {
    return html`<details class="voorbeeldformulier" id="voorbeeldformulier">
      <summary class="voorbeeldformulier-kop">Bekijk hoe het contactformulier eruit gaat zien <span class="klein">(voorbeeld, verstuurt niets)</span></summary>
      ${form}
    </details>`;
  }
  return form;
}

export function inhoud(ctx) {
  const { site } = ctx;
  return html`
${paginaKop({
  boven: 'Samen naar de kerk',
  titel: 'Een eerste bezoek, <em>stap voor stap</em>.',
  lead: 'Voor het eerst een kerk binnenlopen is een stap. Met een beetje voorbereiding, en misschien iemand naast je, wordt hij een stuk kleiner.',
  lijnNaam: 'samen'
})}

<section class="voorbereiden" aria-labelledby="voorbereiden-kop">
  <div class="voorbereiden-binnen">
    <h2 class="kop-2" id="voorbereiden-kop">Zo bereid je je voor</h2>
    <ol class="route-lijst">
      ${STAPPEN.map(([kop, tekst], i) => html`<li class="route-stap onthul"><span class="stap-nr" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><div><h3 class="kop-3">${kop}</h3><p>${tekst}</p></div></li>`)}
    </ol>
    <p class="knoppen"><a class="knop knop--vol" href="/kerken/">Kies een kerk</a> <a class="knop" href="/voor-het-eerst/">Wat gebeurt er in een dienst?</a></p>
  </div>
</section>

<section class="praten" aria-labelledby="contact-kop">
  <div class="praten-binnen">
    <div class="praten-uitleg">
      
      <h2 class="kop-2" id="contact-kop">Liever eerst iemand spreken?</h2>
      <p>Elke kerk heeft een eigen website met contactgegevens. Je kunt de kerk van je keuze gewoon mailen of bellen met je vraag, of vragen of iemand je bij de deur wil opwachten.</p>
      <p><a class="pijllink pijllink--sterk" href="/kerken/">Naar de kerken en hun contactgegevens</a></p>
      <h3 class="kop-3" id="samen">Persoonlijk contact via deze website</h3>
      <p>We willen het straks mogelijk maken om via deze site te vragen of iemand met je mee wil gaan of een keer met je wil praten. Dat zetten we pas aan als er echt mensen klaarstaan om je verzoek op te volgen, en als duidelijk is wie er verantwoordelijk is voor je gegevens.</p>
    </div>
    <div class="praten-formulier">
      ${formulier(ctx)}
    </div>
  </div>
</section>

<section class="anders" aria-labelledby="anders-kop">
  <div class="anders-binnen">
    <div>
      <h2 class="kop-3" id="anders-kop">Ben je nieuwsgierig, maar nog niet toe aan een dienst?</h2>
      <p>Er zijn ook laagdrempelige plekken om kennis te maken: een maaltijd, een cursus, een avond met vragen.</p>
      <p><a class="pijllink pijllink--sterk" href="/activiteiten/">Bekijk de activiteiten</a></p>
    </div>
    ${hulplijnen(site)}
  </div>
</section>
`;
}
