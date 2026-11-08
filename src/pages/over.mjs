import { html } from '../lib/html.mjs';
import { paginaKop } from '../lib/onderdelen.mjs';

export const pagina = {
  pad: '/over/',
  titel: 'Over dit initiatief',
  omschrijving: 'Kom naar de kerk is een gezamenlijke uitnodiging van christelijke kerken in Houten. Waarom we dit samen doen, en hoe jouw kerk kan meedoen.'
};

const UITGANGSPUNTEN = [
  ['We nodigen uit. We werven niet.', 'Niemand wordt ingeschreven of lid gemaakt. Je bepaalt zelf of en wanneer je komt, en of je terugkomt.'],
  ['Geen kerk staat voorop.', 'Alle deelnemende kerken staan gelijkwaardig op deze site, in een wisselende volgorde. We vergelijken en beoordelen niet.'],
  ['We beloven alleen wat we waarmaken.', 'Wat hier staat over tijden, kinderen en contactpersonen komt van de kerken zelf. Alleen als ze het echt geregeld hebben.'],
  ['Je gegevens zijn van jou.', 'Deze site gebruikt geen cookies en geen tracking. We vragen alleen gegevens als je zelf contact zoekt, en niet meer dan nodig.']
];

export function inhoud(ctx) {
  const { site, kerken } = ctx;
  const deelnemers = kerken.kerken;
  return html`
${paginaKop({
  boven: 'Over dit initiatief',
  titel: 'Kerken in Houten die samen <em>één</em> uitnodiging doen.',
  lead: 'Veel mensen in Houten lopen of fietsen elke week langs een kerk, zonder er ooit binnen te zijn geweest. Met deze site willen we de drempel wat lager maken.'
})}

<section class="over" aria-labelledby="waarom-samen">
  <div class="over-binnen">
    <div class="over-tekst">
      <h2 class="kop-2" id="waarom-samen">Waarom samen?</h2>
      <p>Omdat het niet gaat om onze kerk, maar om jou. De kerken in ${site.plaats} verschillen in vorm en traditie, maar delen het geloof in God de Vader, in Jezus Christus en in de heilige Geest. En ze delen de overtuiging dat iedereen welkom is bij God.</p>
      <p>Daarom doen we deze uitnodiging samen. Welke deur je ook kiest: je komt bij mensen die blij zijn dat je er bent.</p>
    </div>
    <ul class="uitgangspunten">
      ${UITGANGSPUNTEN.map(([k, t]) => html`<li><h3 class="kop-4">${k}</h3><p>${t}</p></li>`)}
    </ul>
  </div>
</section>

<section class="deelnemers" aria-labelledby="deelnemers-kop">
  <div class="deelnemers-binnen">
    <h2 class="kop-2" id="deelnemers-kop">Wie doen er mee?</h2>
    <ul class="deelnemerslijst">
      ${deelnemers.map((k) => html`<li><a href="/kerken/#${k.id}">${k.naam}</a>${k.voorbeeld ? html` <span class="label-voorbeeld label-voorbeeld--klein">voorbeeld</span>` : ''}</li>`)}
    </ul>
  </div>
</section>

<section class="meedoen" aria-labelledby="meedoen">
  <div class="meedoen-binnen">
    <h2 class="kop-2" id="meedoen" tabindex="-1">Kan onze kerk meedoen?</h2>
    <p>Graag. Elke christelijke kerk in ${site.plaats} die deze uitnodiging wil delen, is welkom. Wat we van je vragen:</p>
    <ul class="vinklijst">
      <li>dat je de uitgangspunten hierboven onderschrijft;</li>
      <li>dat je eigen gegevens actueel houdt: tijden, sfeer, kinderen, toegankelijkheid;</li>
      <li>dat er iemand is die nieuwe bezoekers welkom heet, en zo mogelijk iemand die op een contactverzoek reageert;</li>
      <li>dat je toestemming geeft voor publicatie van de gegevens die je aanlevert.</li>
    </ul>
    ${site.contact.emailInitiatief
      ? html`<p>Neem contact op via <a href="mailto:${site.contact.emailInitiatief}">${site.contact.emailInitiatief}</a>.</p>`
      : html`<p class="label-voorbeeld">Contactadres voor kerken volgt.</p>`}
  </div>
</section>
`;
}
