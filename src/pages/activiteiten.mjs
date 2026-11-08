import { html } from '../lib/html.mjs';
import { paginaKop, datum, statusLabel } from '../lib/onderdelen.mjs';

export const pagina = {
  pad: '/activiteiten/',
  titel: 'Activiteiten',
  omschrijving: 'Kennismaken met het christelijk geloof in Houten: Alpha, Messy Church, open maaltijden, Bijbelavonden en meer. Alleen actuele activiteiten van de kerken zelf.'
};

// Indeling naar wat een bezoeker zoekt (niet naar organisatie).
export const GROEPEN = [
  ['geloof', 'Kennismaken met het geloof', 'Avonden en cursussen waar je al je vragen mag stellen.'],
  ['ontmoeten', 'Samen eten en ontmoeten', 'Aanschuiven aan tafel of binnenlopen voor koffie: kennismaken zonder programma.'],
  ['gezin', 'Met kinderen', 'Kerk op maat van kinderen en hun ouders.'],
  ['stilte', 'Stilte en gebed', 'Even tot rust komen, met muziek, stilte en gebed.'],
  ['jongeren', 'Voor jongeren', 'Een eigen plek voor tieners en jongeren.']
];

export function inhoud(ctx) {
  const { site, initiatieven, kerken } = ctx;
  const concept = site.modus !== 'productie';
  const kerkNaam = Object.fromEntries(kerken.kerken.map((k) => [k.id, k.naam]));
  const actueel = initiatieven.initiatieven.filter((i) => i.actueel && i.groep);
  return html`
${paginaKop({
  boven: 'Activiteiten',
  titel: 'Liever eerst <em>kennismaken</em>?',
  lead: 'Niet iedereen begint met een kerkdienst. Op deze plekken in Houten kun je in je eigen tempo ontdekken wat het christelijk geloof is.',
  lijnNaam: 'koffie'
})}

<section class="activiteiten" aria-label="Activiteiten">
  <div class="activiteiten-binnen">
    ${concept
      ? html`<div class="melding" role="note"><p><strong>Concept.</strong> Deze activiteiten worden georganiseerd door de kerken zelf en staan hier op basis van hun eigen websites. Ze zijn (nog) niet verbonden aan dit initiatief. Kijk voor de actuele data altijd op de website van de organisator.</p></div>`
      : ''}
    ${GROEPEN.map(([g, kop, uitleg]) => {
      const items = actueel.filter((i) => i.groep === g);
      if (!items.length) return '';
      return html`<section class="act-groep" aria-labelledby="groep-${g}">
        <div class="act-groep-kop"><h2 class="kop-2" id="groep-${g}">${kop}</h2><p>${uitleg}</p></div>
        <div class="act-lijst">
          ${items.map(
            (i) => html`<article class="act" id="${i.id}">
              ${statusLabel(i)}
              <h3 class="kop-3">${i.naam}</h3>
              <p class="act-meta"><span>${i.wanneer}</span>${i.waar ? html`<span>${i.waar}</span>` : ''}</p>
              <p>${i.omschrijving}</p>
              <p class="act-org">Door ${i.organisatoren.map((o) => kerkNaam[o] || o).join(' en ')}${i.website ? html` · <a href="${i.website}" rel="noopener">Meer informatie<span class="sr"> over ${i.naam}</span></a>` : ''}</p>
              <p class="kerk-controle">Gecontroleerd op ${datum(i.gecontroleerd)} · <a href="${i.bron}" rel="noopener">bron</a></p>
            </article>`
          )}
        </div>
      </section>`;
    })}
  </div>
</section>

<section class="ontbreekt" aria-labelledby="mis-kop">
  <div class="ontbreekt-binnen">
    <h2 class="kop-3" id="mis-kop">Mis je een activiteit?</h2>
    <p>We nemen alleen activiteiten op die rechtstreeks met kerk-zijn en het delen van het christelijk geloof te maken hebben, en die actueel zijn. Organiseert jouw kerk iets wat hier past? Lees <a href="/over-ons/#meedoen">hoe je kunt meedoen</a>.</p>
  </div>
</section>
`;
}
