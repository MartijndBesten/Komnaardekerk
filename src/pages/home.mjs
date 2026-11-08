import { html, raw, alinea } from '../lib/html.mjs';
import { faqLijst, kerkCompact, bijbeltekst, samenGaanTeaser, foto, datum } from '../lib/onderdelen.mjs';
import { lijn } from '../lib/lijnen.mjs';

export const pagina = {
  pad: '/',
  titel: null,
  omschrijving: null
};

const STAPPEN = [
  ['deur', 'Je komt binnen', 'Bij de deur staat vaak iemand die je begroet. Ga zitten waar je wilt. De teksten en liederen staan op een scherm of in een boekje.'],
  ['zingen', 'Er wordt gezongen', 'Met orgel, piano of een band: dat verschilt per kerk. Meezingen mag, luisteren ook.'],
  ['lezen', 'Er wordt gelezen en uitgelegd', 'Iemand leest uit de Bijbel. De voorganger legt uit wat die tekst betekent voor ons leven nu. Dat heet de preek.'],
  ['bidden', 'Er wordt gebeden', 'Voor de stad, voor de wereld, voor mensen die ziek zijn of verdriet hebben. Je mag je ogen sluiten of gewoon stil zijn.'],
  ['koffie', 'En daarna: koffie', 'In veel kerken blijven mensen na afloop nog even. Je mag aanschuiven, of gewoon naar huis gaan.']
];

const NIETS = [
  'Je hoeft niet eerst je leven op orde te hebben.',
  'Je hoeft niet alles te begrijpen.',
  'Je hoeft niet zeker te weten wat je gelooft.',
  'Je hoeft de liederen niet te kennen.',
  'Je hoeft je niet netjes aan te kleden.'
];

export function inhoud(ctx) {
  const { site, kerken, gevoelens, vragen, fotos, initiatieven } = ctx;
  const homeVragen = vragen.vragen.filter((v) => v.home);
  const held = fotos.held;
  const actief = initiatieven.initiatieven.filter((i) => i.actueel).slice(0, 3);

  return html`
<section class="held" aria-labelledby="held-kop">
  <div class="held-binnen">
    <div class="held-tekst">
      <p class="bovenregel onthul">Een uitnodiging van christelijke kerken in Houten</p>
      <h1 class="held-kop onthul" id="held-kop">Er is plek <span class="nieuwe-regel">voor <em>jou.</em></span></h1>
      <div class="held-misschien onthul">
        <p>Misschien heb je vragen over het leven.</p>
        <p>Misschien verlang je naar rust.</p>
        <p>Misschien ben je benieuwd naar God.</p>
        <p>Misschien wil je gewoon eens binnenlopen.</p>
      </div>
      <p class="lead held-lead onthul">Wat je reden ook is: je bent welkom.</p>
      <p class="knoppen onthul">
        <a class="knop knop--vol" href="/kerken/">Ontdek de kerken</a>
        <a class="knop" href="/voor-het-eerst/">Wat kan ik verwachten?</a>
      </p>
    </div>
    <div class="held-beeld">
      <div class="held-boog">
        ${foto(held, { klasse: 'held-foto', laden: 'eager', sizes: '(min-width: 56rem) 34vw, 78vw', bijschrift: false })}
        <span class="held-deurblad" aria-hidden="true"></span>
      </div>
      <span class="held-vloer" aria-hidden="true"></span>
      <p class="foto-credit held-credit">${held.bijschrift}. Foto: ${held.credit}, <a href="${held.bron}" rel="noopener">${held.licentie}</a></p>
    </div>
  </div>
</section>

<section class="niets" aria-labelledby="niets-kop">
  <div class="niets-binnen">
    <h2 class="sr" id="niets-kop">Je hoeft niets</h2>
    <ul class="niets-lijst">
      ${NIETS.map((r) => html`<li class="onthul">${r}</li>`)}
    </ul>
    <p class="niets-slot onthul">Je mag gewoon <em>komen.</em></p>
  </div>
</section>

<section class="gevoel" aria-labelledby="gevoel-kop">
  <div class="gevoel-binnen">
    <div class="gevoel-intro">
      <h2 class="kop-2" id="gevoel-kop">Hoe gaat het eigenlijk met je?</h2>
      <p class="gevoel-tekst">Mensen komen om allerlei redenen voor het eerst naar de kerk. Kies wat het dichtst in de buurt komt van wat jij voelt.</p>
      <p class="gevoel-uitleg">Wat je hier aanklikt, blijft op je eigen scherm. We slaan niets op.</p>
    </div>
    <div class="gevoel-keuzes">
      ${gevoelens.keuzes.map(
        (g) => html`<details class="keuze" name="gevoel" id="gevoel-${g.id}">
          <summary class="keuze-kop"><span class="keuze-label">${g.label}</span><span class="plusje" aria-hidden="true"></span></summary>
          <div class="keuze-antwoord">
            ${alinea(g.tekst)}
            <p><a class="pijllink pijllink--sterk" href="${g.actie.href}">${g.actie.tekst}</a></p>
            ${g.hulplijn ? html`<p class="keuze-hulp">Is het zo zwaar dat je niet meer weet hoe verder? Bel of chat anoniem met ${site.hulplijnen[0].naam}: <a href="tel:${site.hulplijnen[0].tel}">${site.hulplijnen[0].nummer}</a> (gratis, dag en nacht).</p>` : ''}
          </div>
        </details>`
      )}
    </div>
  </div>
</section>

<section class="kern" aria-labelledby="kern-kop">
  <div class="kern-binnen">
    <div class="kern-tekst">
      <p class="bovenregel">Waar het om gaat</p>
      <h2 class="kop-2" id="kern-kop">Niet de kerk staat centraal. <em>Jezus Christus</em> staat centraal.</h2>
      <p>Christenen geloven dat God niet wacht tot jij je leven op orde hebt. In Jezus kwam Hij zelf naar ons toe. Jezus at met mensen die door anderen werden gemeden, nodigde mensen uit die moe waren en bood vergeving en een nieuw begin. Hij stierf aan het kruis en stond op uit de dood.</p>
      <p>Dat noemen christenen genade: je hoeft het niet te verdienen. De kerk is daarom geen club van mensen die het voor elkaar hebben, maar een gemeenschap van mensen die Jezus willen volgen. En er is plek voor wie erbij wil komen.</p>
      <p class="knoppen"><a class="knop" href="/ontdek-het-geloof/">Ontdek het geloof</a> <a class="pijllink" href="/waarom-naar-de-kerk/">Waarom naar de kerk?</a></p>
    </div>
    ${bijbeltekst(site, { klasse: 'kern-vers' })}
  </div>
</section>

<section class="dienst" aria-labelledby="dienst-kop">
  <div class="dienst-binnen">
    <div class="sectiekop">
      <p class="bovenregel">Wat kun je verwachten?</p>
      <h2 class="kop-2" id="dienst-kop">Een zondagochtend, ongeveer zo.</h2>
      <p class="lead">Elke kerk doet het net even anders, maar dit kom je bijna overal tegen. Een dienst duurt meestal een uur tot anderhalf uur.</p>
    </div>
    <ol class="stappen">
      ${STAPPEN.map(([l, kop, tekst], i) => html`<li class="stap onthul">${raw(lijn(l, 'stap-lijn'))}<span class="stap-nr">Stap ${i + 1}</span><h3 class="stap-kop">${kop}</h3><p>${tekst}</p></li>`)}
    </ol>
    <div class="dienst-vragen">
      <h3 class="kop-3">Wat mensen vaak willen weten</h3>
      ${faqLijst(homeVragen, 'homevraag')}
      <p><a class="pijllink pijllink--sterk" href="/voor-het-eerst/">Alles over een eerste bezoek</a></p>
    </div>
  </div>
</section>

<section class="buurt" aria-labelledby="buurt-kop">
  <div class="buurt-binnen">
    <div class="sectiekop">
      <p class="bovenregel">Kerken in Houten en de dorpen</p>
      <h2 class="kop-2" id="buurt-kop">Welke deur past bij jou?</h2>
      <p class="lead">De ene kerk is eeuwenoud en ingetogen, de andere jong en informeel. Ze geloven in dezelfde Heer en hebben dezelfde uitnodiging.</p>
    </div>
    <ul class="kerken-kort" data-schud>
      ${kerken.kerken.map((k) => kerkCompact(k))}
    </ul>
    <p class="buurt-voet"><a class="knop knop--vol" href="/kerken/">Bekijk alle kerken</a></p>
    <p class="klein buurt-eerlijk">De volgorde wisselt bij elk bezoek, zodat geen kerk vooraan staat.${site.modus !== 'productie' ? ' Concept: de kerken zijn nog niet benaderd en doen (nog) niet mee.' : ''}</p>
  </div>
</section>

${actief.length
  ? html`<section class="ontdek" aria-labelledby="ontdek-kop">
  <div class="ontdek-binnen">
    <div class="sectiekop">
      <p class="bovenregel">Verder ontdekken</p>
      <h2 class="kop-2" id="ontdek-kop">Liever eerst praten dan een kerkdienst?</h2>
      <p class="lead">Er zijn plekken in Houten waar je in je eigen tempo kunt kennismaken met het christelijk geloof.</p>
    </div>
    <ul class="activiteiten-kort">
      ${actief.map((a) => html`<li><a href="/activiteiten/#${a.id}"><span class="act-naam">${a.naam}</span><span class="act-wanneer">${a.wanneer}</span><span class="act-org">${a.organisatorNaam}</span></a></li>`)}
    </ul>
    <p><a class="pijllink pijllink--sterk" href="/activiteiten/">Alle activiteiten</a></p>
  </div>
</section>`
  : ''}

${samenGaanTeaser()}

<section class="slot" aria-labelledby="slot-kop">
  <div class="slot-binnen">
    <div class="slot-lijn" aria-hidden="true">${raw(lijn('deur'))}</div>
    <h2 class="slot-kop" id="slot-kop">De deur staat open.</h2>
    <p class="lead">Je hoeft niet te weten waar je uitkomt. Je kunt gewoon beginnen met binnenlopen.</p>
    <p class="knoppen"><a class="knop knop--vol" href="/kerken/">Kies een kerk voor komende zondag</a></p>
  </div>
</section>
`;
}

export function jsonld(ctx) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: ctx.site.naam,
    url: ctx.site.domein + '/',
    inLanguage: 'nl-NL',
    description: ctx.site.omschrijving
  };
}
