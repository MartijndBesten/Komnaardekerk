import { html } from '../lib/html.mjs';
import { paginaKop } from '../lib/onderdelen.mjs';

export const pagina = {
  pad: '/activiteiten/',
  titel: 'Activiteiten',
  omschrijving: 'Bekijk bijzondere vieringen, maaltijden en andere activiteiten bij kerken in Houten en omgeving.'
};

export const GROEPEN = [
  ['vieringen', 'Bijzondere vieringen'],
  ['geloof', 'Kennismaken met het geloof'],
  ['ontmoeten', 'Samen eten en ontmoeten'],
  ['gezin', 'Voor kinderen en gezinnen'],
  ['stilte', 'Stilte en gebed'],
  ['jongeren', 'Voor jongeren']
];

const tijdNL = new Intl.DateTimeFormat('nl-NL', {
  timeZone: 'Europe/Amsterdam', dateStyle: 'full', timeStyle: 'short'
});

export function inhoud({ initiatieven }) {
  const actueel = initiatieven.initiatieven.filter((i) => i.actueel && i.groep);
  const groepen = GROEPEN.filter(([groep]) => actueel.some((i) => i.groep === groep));
  return html`
${paginaKop({
  boven: 'Activiteiten',
  titel: 'Wat is er <em>te doen</em>?',
  lead: 'Van een viering met kerst tot samen eten of praten over het geloof. Kijk bij de organisator voor wijzigingen en om te zien of je je moet aanmelden.',
  lijnNaam: 'koffie'
})}
<section class="activiteiten" aria-label="Activiteiten">
  <div class="activiteiten-binnen">
    ${groepen.length ? '' : html`<p>Er staan geen activiteiten in dit overzicht. Bekijk <a href="/kerken/">de agenda’s van de kerken</a> voor meer informatie.</p>`}
    ${groepen.map(([groep, kop]) => html`<section class="act-groep" aria-labelledby="groep-${groep}">
      <div class="act-groep-kop"><h2 class="kop-2" id="groep-${groep}">${kop}</h2></div>
      <div class="act-lijst">
        ${actueel.filter((i) => i.groep === groep).map((i) => html`<article class="act" id="${i.id}">
          <h3 class="kop-3">${i.naam}</h3>
          <p class="act-meta"><span>${i.start ? html`<time datetime="${i.start}">${tijdNL.format(new Date(i.start))}</time>` : i.wanneer}</span>${i.waar ? html`<span>${i.waar}</span>` : ''}</p>
          <p>${i.omschrijving}</p>
          ${i.doelgroep ? html`<p>Voor ${i.doelgroep}</p>` : ''}
          <p class="act-org">${i.organisatorNaam}</p>
          <p><a class="pijllink" href="${i.bron}" rel="noopener">Bekijk de aankondiging<span class="sr"> van ${i.naam}</span></a></p>
        </article>`)}
      </div>
    </section>`)}
  </div>
</section>`;
}
