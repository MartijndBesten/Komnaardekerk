import { html } from '../lib/html.mjs';
import { paginaKop, hulplijnen, boog } from '../lib/onderdelen.mjs';

export const pagina = {
  pad: '/even-praten/',
  titel: 'Even praten?',
  omschrijving: 'Even praten over geloof, over de kerk of over wat je bezighoudt? Of liever samen naar een kerk in Houten? Laat het weten, zonder verplichtingen.'
};

function formulier(ctx) {
  const { site, kerken } = ctx;
  const status = site.contact.status;
  if (status === 'uit') {
    return html`<div class="formulier-uit">
      <p>Een contactformulier komt hier zodra de kerken de opvolging samen hebben geregeld. Tot die tijd kun je rechtstreeks contact opnemen met een van de <a href="/kerken/">kerken in ${site.plaats}</a>. Bij elke kerk staat wie je kunt bellen of mailen.</p>
    </div>`;
  }
  return html`<form class="formulier" action="/api/contact" method="post" novalidate data-contactformulier data-status="${status}">
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
}

export function inhoud(ctx) {
  const { site } = ctx;
  const concept = site.modus !== 'productie';
  return html`
${paginaKop({
  boven: 'Even praten?',
  titel: 'Soms wil je eerst gewoon even <em>iemand</em> spreken.',
  lead: 'Over de kerk, over geloof of over wat je bezighoudt. Zonder verplichtingen: je hoeft er niets voor te doen en je zit nergens aan vast.'
})}

<section class="praten" aria-labelledby="samen">
  <div class="praten-binnen">
    <div class="praten-uitleg">
      <h2 class="kop-2" id="samen" tabindex="-1">Samen gaan</h2>
      <p>Vind je het spannend om alleen een kerk binnen te lopen? Dan kan iemand van die kerk je bij de deur opwachten, naast je komen zitten en na afloop koffie met je drinken.</p>
      <p>Je spreekt samen een zondag af. Het is geen kennismakingsgesprek en je hoeft niets uit te leggen.</p>
      <h2 class="kop-3">Een gesprek</h2>
      <p>Liever eerst praten? Over het leven, over geloof, over iets wat je dwarszit. Iemand belt je, of jullie spreken af voor een kop koffie. Wat je vertelt, blijft tussen jullie.</p>
      ${boog({ briefing: 'twee mensen in gesprek aan een keukentafel of op een bankje, ongeposeerd', concept, klasse: 'boog--klein praten-boog' })}
    </div>
    <div class="praten-formulier">
      <h2 class="kop-3" id="formulier-kop">Laat het ons weten</h2>
      ${formulier(ctx)}
    </div>
  </div>
</section>

<section class="anders" aria-labelledby="anders-kop">
  <div class="anders-binnen">
    <div>
      <h2 class="kop-3" id="anders-kop">Liever direct contact met een kerk?</h2>
      <p>Bij elke kerk staat een website en, waar de kerk dat heeft geregeld, iemand die je als nieuwe bezoeker kunt bellen of mailen.</p>
      <p><a class="pijllink pijllink--sterk" href="/kerken/">Naar de kerken in ${site.plaats}</a></p>
    </div>
    ${hulplijnen(site)}
  </div>
</section>
`;
}
