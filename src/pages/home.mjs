import { html, raw, esc } from '../lib/html.mjs';
import { faqLijst, kerkKaart, bijbeltekst, samenGaanTeaser } from '../lib/onderdelen.mjs';
import { beeldmerkInhoud, vlakSvg, VIEWBOX } from '../lib/logo.mjs';
import { zondagScene } from '../lib/zondag-scene.mjs';

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

// Een zondagochtend, ongeveer zo. Tijden zijn bewust ‘ongeveer’ en relatief: elke kerk begint op een eigen tijd.
// NIEUWE TEKST (27-11-2026, ter controle door Martijn): tijd, kan, hoeft, muziek en tips.
const STAPPEN = [
  {
    id: 'binnen', tijd: 'Een paar minuten van tevoren', kop: 'Je komt binnen',
    tekst: 'Bij de deur staat vaak iemand die je begroet. Ga zitten waar je wilt. De teksten en liederen staan op een scherm of in een boekje.',
    kan: 'Je jas ophangen. Een boekje pakken als dat er ligt. Gaan zitten waar je wilt: achterin is prima.',
    hoeft: 'Je hoeft je niet aan te melden en niets te betalen. Je hoeft niemand te kennen.',
    tips: {
      alleen: 'Zeg bij de deur gerust dat je voor het eerst bent. Dan helpt iemand je op weg.',
      samen: 'Spreek af waar je elkaar ziet, bijvoorbeeld bij de ingang. Dan ga je samen naar binnen.',
      kinderen: 'Veel kerken hebben oppas voor kleine kinderen of iets voor de grotere. Op de pagina van elke kerk zie je wat er is.'
    }
  },
  {
    id: 'zingen', tijd: 'Het begin', kop: 'Er wordt gezongen',
    tekst: 'Met orgel, piano of een band: dat verschilt per kerk. Meezingen mag, luisteren ook.',
    muziek: {
      orgel: 'Met een orgel zing je vaak psalmen en liederen uit een boek of van het scherm. Meezingen mag, luisteren ook.',
      piano: 'Met een piano klinkt het vaak wat rustiger. De woorden staan meestal op een scherm. Meezingen mag, luisteren ook.',
      band: 'Met een band zijn het vaak nieuwere liederen, met de tekst op een scherm. Sommige mensen staan, anderen blijven zitten. Allebei is goed.'
    },
    kan: 'Meezingen, of gewoon luisteren en de tekst meelezen.',
    hoeft: 'Je hoeft de liederen niet te kennen. Je hoeft ook niet mooi te zingen.'
  },
  {
    id: 'lezen', tijd: 'Na ongeveer een kwartier', kop: 'Er wordt gelezen en uitgelegd',
    tekst: 'Iemand leest uit de Bijbel. De voorganger legt uit wat die tekst betekent voor ons leven nu. Dat heet de preek.',
    kan: 'Luisteren en meelezen, in een Bijbel of op het scherm. Onthouden wat je raakt.',
    hoeft: 'Je hoeft niet alles te begrijpen. Je hoeft het ook niet overal mee eens te zijn.'
  },
  {
    id: 'bidden', tijd: 'Tegen het eind', kop: 'Er wordt gebeden',
    tekst: 'Voor de stad, voor de wereld, voor mensen die ziek zijn of verdriet hebben. Je mag je ogen sluiten of gewoon stil zijn.',
    kan: 'Je ogen dichtdoen, of gewoon stil zijn. In stilte zelf iets tegen God zeggen.',
    hoeft: 'Je hoeft niet hardop te bidden. Gaat er een collectezak of schaal rond? Geven mag, doorgeven is ook goed.'
  },
  {
    id: 'koffie', tijd: 'Na ongeveer een uur tot anderhalf uur', kop: 'En daarna: koffie',
    tekst: 'In veel kerken blijven mensen na afloop nog even. Je mag aanschuiven, of gewoon naar huis gaan.',
    kan: 'Een kop koffie of thee pakken en even blijven. Een vraag stellen aan wie naast je staat.',
    hoeft: 'Je hoeft niet te blijven. Meteen naar huis gaan is ook goed.',
    tips: {
      alleen: 'Wil je blijven? Ga gewoon bij iemand staan. Mensen vinden het fijn als je er bent.',
      samen: 'Even napraten bij de koffie, of samen weer naar huis: allebei goed.',
      kinderen: 'Kinderen mogen gewoon mee naar de koffie. Vaak is er ook iets te drinken voor ze.'
    }
  }
];
const MUZIEK = [['orgel', 'Orgel'], ['piano', 'Piano'], ['band', 'Band'], ['weet-niet', 'Weet ik nog niet']];
const GEZELSCHAP = [['alleen', 'Alleen'], ['samen', 'Met iemand anders'], ['kinderen', 'Met kinderen']];

function zondagochtend() {
  const keuze = (naam, legenda, opties) => html`<fieldset class="ochtend-keuze">
      <legend>${legenda}</legend>
      <div class="ochtend-chips">${opties.map(([w, l]) => html`<label class="chip"><input type="radio" name="${naam}" value="${w}"> <span>${l}</span></label>`)}</div>
    </fieldset>`;
  const stippen = [...STAPPEN.map((st) => [st.id, st.kop]), ['eind', 'Probeer het een keer']];
  return html`<div class="ochtend-raam"><div class="ochtend-zijkant"><div class="ochtend-keuzes" data-ochtend-keuzes hidden>
      <p class="ochtend-uitleg">Maak het persoonlijk. Je keuze blijft op je eigen scherm.</p>
      ${keuze('muziek', 'Hoe wordt er gezongen in de kerk die je kiest?', MUZIEK)}
      ${keuze('gezelschap', 'Hoe kom je?', GEZELSCHAP)}
      <p class="sr" role="status" data-ochtend-status></p>
    </div>
    <figure class="ochtend-scene" data-ochtend-scene hidden>
      ${raw(zondagScene())}
      <figcaption class="scene-onder">
        <span class="scene-titel" aria-hidden="true" data-scene-titel>${STAPPEN[0].kop}</span>
        <span class="scene-stippen" role="group" aria-label="Spring naar een moment van de ochtend">${stippen.map(([id, kop], i) => html`<button type="button" class="scene-stip" data-naar="${id}" aria-label="Stap ${i + 1}: ${kop}"${i === 0 ? raw(' aria-current="step"') : ''}></button>`)}</span>
      </figcaption>
    </figure>
    </div>
    <ol class="ochtend" data-ochtend>
      ${STAPPEN.map((st, i) => html`<li class="ochtend-stap" id="ochtend-${st.id}">
        <span class="ochtend-punt" aria-hidden="true"></span>
        <p class="ochtend-tijd"><span class="sr">Stap ${i + 1}, </span>${st.tijd}</p>
        <h3 class="ochtend-kop">${st.kop}${st.muziek ? html` <span class="ochtend-tag" data-muziek-tag hidden></span>` : ''}</h3>
        <p class="ochtend-tekst"${st.muziek ? raw(` data-muziek-tekst data-standaard="${esc(st.tekst)}" data-orgel="${esc(st.muziek.orgel)}" data-piano="${esc(st.muziek.piano)}" data-band="${esc(st.muziek.band)}"`) : ''}>${st.tekst}</p>
        ${st.tips ? html`${Object.entries(st.tips).map(([w, t]) => html`<p class="ochtend-tip" data-tip="${w}" hidden>${t}${w === 'samen' && st.id === 'binnen' ? html` Ken je niemand? <a href="/samen-naar-de-kerk/">Ga samen met iemand van de kerk</a>.` : ''}</p>`)}` : ''}
        ${st.id === 'koffie' ? html`<fieldset class="ochtend-keuze ochtend-na" data-na-keuze hidden>
          <legend>En jij?</legend>
          <div class="ochtend-chips"><label class="chip"><input type="radio" name="na" value="blijf"> <span>Ik blijf even</span></label><label class="chip"><input type="radio" name="na" value="huis"> <span>Ik ga naar huis</span></label></div>
          <p class="ochtend-na-antwoord" data-na-antwoord hidden>Allebei is goed.</p>
        </fieldset>` : ''}
        <details class="ochtend-meer">
          <summary>Wat kan ik doen? Wat hoeft niet?</summary>
          <div class="ochtend-meer-inhoud">
            <p><strong>Dit kan:</strong> ${st.kan}</p>
            <p><strong>Dit hoeft niet:</strong> ${st.hoeft}</p>
          </div>
        </details>
      </li>`)}
      <li class="ochtend-stap ochtend-eind" id="ochtend-eind">
        <span class="ochtend-punt" aria-hidden="true"></span>
        <p class="ochtend-tijd">En dan?</p>
        <h3 class="ochtend-kop">Probeer het een keer</h3>
        <p class="ochtend-tekst">Je weet nu ongeveer hoe het gaat. De rest ontdek je gewoon.</p>
        <p class="knoppen"><a class="knop knop--vol" href="/kerken/">Kies een kerk voor komende zondag</a> <a class="pijllink" href="/voor-het-eerst/">Meer over een eerste keer</a></p>
      </li>
    </ol></div>`;
}

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
      <p class="lead">Elke kerk doet het net even anders, maar dit kom je bijna overal tegen. Een dienst duurt meestal een uur tot anderhalf uur. De tijden hieronder zijn ongeveer.</p>
    </div>
    ${zondagochtend()}
    <div class="dienst-vragen">
      <h3 class="kop-3">Wat mensen vaak willen weten</h3>
      ${faqLijst(homeVragen, 'homevraag')}
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
    <p class="klein buurt-eerlijk">De volgorde wisselt bij elk bezoek, zodat geen kerk vooraan staat.</p>
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

<a class="zweefknop" href="/kerken/" data-zweefknop hidden>Vind een kerk</a>

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
