import { html } from '../lib/html.mjs';
import { paginaKop } from '../lib/onderdelen.mjs';

export const pagina = {
  pad: '/over-ons/',
  titel: 'Over ons',
  omschrijving: 'Kom naar de kerk. is een gezamenlijke uitnodiging in ontwikkeling, vanuit christelijke kerken in Houten en de omliggende dorpen. Waarom, hoe, en hoe kerken kunnen meedoen.'
};

const UITGANGSPUNTEN = [
  ['Jezus Christus staat centraal.', 'Niet de kerkorganisatie, maar Hem willen we laten zien. De kerk is een gemeenschap van mensen die Hem willen volgen.'],
  ['We nodigen uit. We werven niet.', 'Niemand wordt ingeschreven of lid gemaakt. Je bepaalt zelf of en wanneer je komt, en waar.'],
  ['Geen kerk staat voorop.', 'Alle kerken staan gelijkwaardig op deze site, in een wisselende volgorde. We vergelijken en beoordelen niet.'],
  ['Verschillen mogen er zijn.', 'Kerken verschillen in traditie, sacramenten, liturgie en geloofsbeleving. Die verschillen poetsen we niet weg.'],
  ['We beloven alleen wat we waarmaken.', 'Wat hier staat, komt van de kerken zelf en is gecontroleerd. Persoonlijk contact bieden we pas aan als het echt geregeld is.'],
  ['Je gegevens zijn van jou.', 'Geen cookies, geen tracking. Belangstelling voor geloof is persoonlijk; daar gaan we zorgvuldig mee om.']
];

const STAPPEN_MEEDOEN = [
  ['Kennismaken', 'Een gesprek met de kerkenraad, het parochiebestuur of de oudsten over het doel en de uitgangspunten van Kom naar de kerk.'],
  ['De geloofsbasis bespreken', 'De gezamenlijke geloofstekst is een concept. Deelnemende kerken bespreken hem samen en stellen hem vast. Een kerk doet pas mee als zij de gezamenlijke kern onderschrijft.'],
  ['Gegevens aanleveren en toestemming geven', 'De kerk controleert haar eigen gegevens (tijden, kinderwerk, toegankelijkheid, contact), levert eventueel een foto aan waarvoor toestemming is, en geeft schriftelijk toestemming voor publicatie.'],
  ['Een aanspreekpunt aanwijzen', 'Iemand die nieuwe bezoekers welkom heet, de gegevens actueel houdt en, als het contactformulier aangaat, verzoeken opvolgt.'],
  ['Vermelden als deelnemer', 'Pas daarna staat de kerk hier als deelnemer, en noemen we haar zo.']
];

export function inhoud(ctx) {
  const { site, kerken, fotos } = ctx;
  const concept = site.modus !== 'productie';
  const deelnemers = kerken.kerken.filter((k) => k.deelname?.status === 'deelnemer');
  const belangstelling = kerken.kerken.filter((k) => k.deelname?.status === 'belangstelling');
  return html`
${paginaKop({
  boven: 'Over ons',
  titel: 'Een gezamenlijke uitnodiging, <em>in ontwikkeling</em>.',
  lead: 'Kom naar de kerk. is bedoeld als een uitnodiging namens verschillende christelijke kerken in Houten en de omliggende dorpen, die elkaar vinden in hun geloof in Jezus Christus.',
  beeld: fotos.toren
})}

<section class="over" aria-labelledby="waarom-samen">
  <div class="over-binnen">
    <div class="over-tekst">
      <h2 class="kop-2" id="waarom-samen">Waarom samen?</h2>
      <p>Veel mensen in Houten lopen of fietsen elke week langs een kerk, zonder er ooit binnen te zijn geweest. Ze hebben vragen over het leven, verlangen naar rust of verbinding, of zijn gewoon nieuwsgierig. Wij willen de drempel lager maken.</p>
      <p>Het gaat ons niet om onze kerk, maar om Jezus Christus en om jou. Daarom willen we deze uitnodiging samen doen. Welke deur je ook kiest: je komt bij mensen die blij zijn dat je er bent.</p>
    </div>
    <ul class="uitgangspunten">
      ${UITGANGSPUNTEN.map(([k, t]) => html`<li><h3 class="kop-4">${k}</h3><p>${t}</p></li>`)}
    </ul>
  </div>
</section>

<section class="status" aria-labelledby="status" id="status-blok">
  <div class="status-binnen">
    <h2 class="kop-2" id="status" tabindex="-1">Waar staan we nu?</h2>
    <dl class="status-lijst">
      ${deelnemers.length ? html`<div><dt>Deelnemende kerken</dt><dd>${deelnemers.map((k) => k.naam).join(', ')}</dd></div>` : ''}
      ${belangstelling.length ? html`<div><dt>Belangstelling getoond</dt><dd>${belangstelling.map((k) => k.naam).join(', ')}</dd></div>` : ''}
      <div><dt>Organisatie</dt><dd>${site.verwerkingsverantwoordelijke ? site.verwerkingsverantwoordelijke.naam : 'Nog niet formeel georganiseerd. Er is nog geen stichting of samenwerkingsverband dat verantwoordelijk is.'}</dd></div>
      <div><dt>Geloofsbasis</dt><dd>Een eerste concept, nog niet besproken met de kerken. <a href="/ontdek-het-geloof/#geloofsbasis">Lees het concept</a>.</dd></div>
      <div><dt>Persoonlijk contact via de site</dt><dd>${site.contact.status === 'aan' ? 'Actief.' : 'Nog niet actief. Neem contact op met een kerk via haar eigen website.'}</dd></div>
    </dl>
    ${concept ? html`<p class="klein">Kerken en activiteiten staan erop met openbare informatie van hun eigen websites.</p>` : ''}
  </div>
</section>

<section class="meedoen" aria-labelledby="meedoen">
  <div class="meedoen-binnen">
    <h2 class="kop-2" id="meedoen" tabindex="-1">Kan onze kerk meedoen?</h2>
    <p>Graag. Elke christelijke kerk in Houten en de omliggende dorpen die de gezamenlijke christelijke kern onderschrijft, is welkom: rooms-katholiek, protestants, reformatorisch of evangelisch. Zo werkt het:</p>
    <ol class="route-lijst">
      ${STAPPEN_MEEDOEN.map(([kop, tekst], i) => html`<li class="route-stap"><span class="stap-nr" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><div><h3 class="kop-3">${kop}</h3><p>${tekst}</p></div></li>`)}
    </ol>
    ${site.contact.emailInitiatief
      ? html`<p>Neem contact op via <a href="mailto:${site.contact.emailInitiatief}">${site.contact.emailInitiatief}</a>.</p>`
      : html`<p class="label-status label-status--kandidaat">Contactadres voor kerken volgt</p>`}
  </div>
</section>
`;
}
