import { html, raw } from '../lib/html.mjs';
import { faqLijst, kerkKaart, bijbeltekst, samenGaanTeaser } from '../lib/onderdelen.mjs';
import { beeldmerkInhoud, vlakSvg, VIEWBOX } from '../lib/logo.mjs';

export const pagina = {
  pad: '/',
  titel: null,
  omschrijving: null
};

const KORT = [
  ['Wat is dit?', 'Een uitnodiging om Jezus en de kerk te leren kennen. Van christenen uit Houten en omgeving.'],
  ['Voor wie?', 'Voor iedereen. Ook als je nooit in een kerk komt, of al lang niet meer. Ook als je twijfelt.'],
  ['Wat vind je hier?', 'Wie Jezus is. Wat er in een kerkdienst gebeurt. En welke kerken er bij jou in de buurt zijn.'],
  ['Waar kun je heen?', 'Naar een kerkdienst op zondag. Of eerst naar een avond met eten en gesprek, zoals Alpha.']
];

const STAPPEN = [
  ['Je komt binnen', 'Bij de deur staat vaak iemand die je begroet. Ga zitten waar je wilt. De teksten en liederen staan op een scherm of in een boekje.'],
  ['Er wordt gezongen', 'Met orgel, piano of een band: dat verschilt per kerk. Meezingen mag, luisteren ook.'],
  ['Er wordt gelezen en uitgelegd', 'Iemand leest uit de Bijbel. De voorganger legt uit wat die tekst betekent voor ons leven nu. Dat heet de preek.'],
  ['Er wordt gebeden', 'Voor de stad, voor de wereld, voor mensen die ziek zijn of verdriet hebben. Je mag je ogen sluiten of gewoon stil zijn.'],
  ['En daarna: koffie', 'In veel kerken blijven mensen na afloop nog even. Je mag aanschuiven, of gewoon naar huis gaan.']
];

const NIETS = [
  'Je hoeft niet eerst je leven op orde te hebben.',
  'Je hoeft niet alles te begrijpen.',
  'Je hoeft niet zeker te weten wat je gelooft.',
  'Je hoeft de liederen niet te kennen.',
  'Je hoeft je niet netjes aan te kleden.'
];

const BIJBEL = 'https://www.debijbel.nl/bijbel/NBV21/';

function woordKeuze(w, site) {
  const hulp = w.hulp === 'hulplijnen'
    ? html`<p class="keuze-hulp">Gaat het echt niet goed met je? Praat met je huisarts. Of bel ${site.hulplijnen[0].naam}: <a href="tel:${site.hulplijnen[0].tel}">${site.hulplijnen[0].nummer}</a> (gratis, dag en nacht).</p>`
    : w.hulp ? html`<p class="keuze-hulp">${w.hulp}</p>` : '';
  return html`<details class="keuze" name="gevoel" id="gevoel-${w.id}">
    <summary class="keuze-kop"><span class="keuze-label">${w.woord}?</span><span class="plusje" aria-hidden="true"></span></summary>
    <div class="keuze-antwoord">
      <p class="keuze-herkenning">${w.herkenning}</p>
      <blockquote class="keuze-hoop"><p>${w.hoop}</p><footer>${w.bijbel} · <a href="${BIJBEL}${w.code}" rel="noopener">lees het in de Bijbel</a></footer></blockquote>
      <p>${w.kerk}</p>
      ${hulp}
      <p class="keuze-watnu">Wat wil je nu doen?</p>
      <ul class="keuze-stappen" role="list">
        <li><a class="knop knop--vol" href="/ontdek-het-geloof/">Ontdek Jezus</a></li>
        <li><a class="knop" href="/voor-het-eerst/">Wat gebeurt er in de kerk?</a></li>
        <li><a class="knop" href="/kerken/">Vind een kerk</a></li>
      </ul>
      ${w.extra ? html`<p><a class="pijllink pijllink--sterk" href="${w.extra.href}">${w.extra.tekst}</a></p>` : ''}
    </div>
  </details>`;
}

export function inhoud(ctx) {
  const { site, kerken, woorden, vragen, initiatieven } = ctx;
  const homeVragen = vragen.vragen.filter((v) => v.home);
  const actief = initiatieven.initiatieven.filter((i) => i.actueel).slice(0, 3);
  const wissel = woorden.woorden.filter((w) => w.wissel).map((w) => ({ id: w.id, w: `${w.woord}?` }));
  const eerste = wissel[0];

  return html`
<section class="held" aria-labelledby="held-kop">
  <div class="held-binnen">
    <div class="held-tekst">
      <p class="bovenregel held-boven onthul">Houten · Schalkwijk · ’t Goy</p>
      <div class="wissel-blok onthul">
        <p class="wissel-regel"><a class="wissel" href="#gevoel-${eerste.id}" data-woord="${eerste.id}" data-woorden="${JSON.stringify(wissel)}">${eerste.w}</a></p>
        <p class="wissel-knoppen" hidden><button type="button" class="tekstknop" data-ander>Ander woord</button><button type="button" class="tekstknop" data-pauze aria-pressed="false">Pauze</button></p>
      </div>
      <h1 class="held-kop onthul" id="held-kop">Kom naar de kerk. <em>Er is plek voor jou.</em></h1>
      <p class="lead held-lead onthul">Een uitnodiging van christenen uit Houten en omgeving. Je hoeft niets te weten en niets te kunnen. Kom zoals je bent.</p>
      <p class="knoppen onthul">
        <a class="knop knop--licht" href="/kerken/">Vind een kerk</a>
        <a class="knop knop--omlijnd" href="#gevoel">Wat houdt je bezig?</a>
      </p>
    </div>
    <div class="held-merk" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" class="held-merk-svg" focusable="false">${raw(beeldmerkInhoud({ donker: true, sterkte: 1.15 }))}</svg>
    </div>
  </div>
</section>

<section class="uitnodiging" aria-label="Een uitnodiging van Jezus">
  <div class="uitnodiging-binnen onthul">
    <span class="uitnodiging-merk" aria-hidden="true">${raw(vlakSvg({ donker: false, titel: '' }))}</span>
    ${bijbeltekst(site, { klasse: 'uitnodiging-vers' })}
  </div>
</section>

<section class="kort" aria-labelledby="kort-kop">
  <div class="kort-binnen">
    <h2 class="sr" id="kort-kop">In het kort</h2>
    <dl class="kort-lijst">
      ${KORT.map(([v, a]) => html`<div class="kort-item onthul"><dt>${v}</dt><dd>${a}</dd></div>`)}
    </dl>
  </div>
</section>

<section class="gevoel" id="gevoel" aria-labelledby="gevoel-kop">
  <div class="gevoel-binnen">
    <div class="gevoel-intro">
      <p class="bovenregel">Kies wat bij je past</p>
      <h2 class="kop-2" id="gevoel-kop">Wat houdt je bezig?</h2>
      <p class="gevoel-tekst">Kies een woord. Je leest een korte tekst, iets over de hoop van Jezus, en wat je daarna kunt doen.</p>
      <p class="gevoel-uitleg">Wat je hier kiest, blijft op je eigen scherm. We bewaren niets.</p>
    </div>
    <div class="gevoel-keuzes">
      ${woorden.woorden.map((w) => woordKeuze(w, site))}
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

<section class="kern" aria-labelledby="kern-kop">
  <div class="kern-binnen">
    <div class="kern-kop">
      <p class="bovenregel">Waar het om draait</p>
      <h2 class="kop-2" id="kern-kop">Wie is <em>Jezus?</em></h2>
    </div>
    <div class="kern-tekst">
      <p>Jezus zocht mensen op die anderen links lieten liggen. Hij at met ze, en vertelde over God als een vader die op je wacht. Hij stierf aan het kruis en stond op uit de dood.</p>
      <p>Christenen geloven dat Hij leeft, en dat je bij Hem mag komen. Dat noemen ze genade: je hoeft het niet te verdienen. De kerk is de plek waar mensen Hem samen leren kennen. Er is plek voor wie erbij wil komen.</p>
      <p class="knoppen"><a class="knop knop--vol" href="/ontdek-het-geloof/">Lees wie Jezus is</a> <a class="pijllink" href="/waarom-naar-de-kerk/">Waarom naar de kerk?</a></p>
    </div>
  </div>
</section>

<section class="dienst" aria-labelledby="dienst-kop">
  <div class="dienst-binnen">
    <div class="sectiekop">
      <p class="bovenregel">Wat gebeurt er in de kerk?</p>
      <h2 class="kop-2" id="dienst-kop">Een zondagochtend, ongeveer zo.</h2>
      <p class="lead">Elke kerk doet het net even anders, maar dit kom je bijna overal tegen. Een dienst duurt meestal een uur tot anderhalf uur.</p>
    </div>
    <ol class="stappen">
      ${STAPPEN.map(([kop, tekst], i) => html`<li class="stap onthul"><span class="stap-nr">Stap ${i + 1}</span><h3 class="stap-kop">${kop}</h3><p>${tekst}</p></li>`)}
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
      <p class="bovenregel">Waar kun je heen?</p>
      <h2 class="kop-2" id="buurt-kop">Kerken bij jou in de buurt</h2>
      <p class="lead">Elf kerken in Houten, Schalkwijk en ’t Goy. Protestants, evangelisch en katholiek. Ze geloven in dezelfde Heer en hebben dezelfde uitnodiging. Kies er gewoon één.</p>
    </div>
    <ul class="kerkkaarten" data-schud>
      ${kerken.kerken.map((k) => kerkKaart(k, { kop: 'h3' }))}
    </ul>
    <p class="buurt-voet"><a class="knop knop--vol" href="/kerken/">Zoek op plaats en traditie</a></p>
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
    <h2 class="slot-kop" id="slot-kop">Er is plek voor jou.</h2>
    <p class="lead">Je hoeft niet te weten waar je uitkomt. Je kunt gewoon beginnen met een keer te komen.</p>
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
