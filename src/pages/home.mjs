import { html, raw, alinea } from '../lib/html.mjs';
import { boog, faqLijst, hulplijnen, kerkCompact, bijbeltekst, samenGaan } from '../lib/onderdelen.mjs';

export const pagina = {
  pad: '/',
  titel: null,
  omschrijving: null
};

const STAPPEN = [
  ['Je komt binnen', 'Bij de deur staat vaak iemand die je begroet. Ga zitten waar je wilt. De teksten en liederen staan op een scherm of in een boekje.'],
  ['Er wordt gezongen', 'Met orgel, piano of een band: dat verschilt per kerk. Meezingen mag, luisteren ook.'],
  ['Er wordt gelezen en uitgelegd', 'Iemand leest een stuk uit de Bijbel. De voorganger vertelt wat die tekst kan betekenen voor het leven van nu. Dat heet de preek.'],
  ['Er wordt gebeden', 'Voor de stad, voor de wereld, voor mensen die ziek zijn of verdriet hebben. Je mag je ogen sluiten of gewoon stil zijn.'],
  ['En dan: koffie', 'In de meeste kerken blijven mensen na afloop nog even. Je mag aanschuiven, of gewoon naar huis gaan.']
];

const NIETS = [
  'Je hoeft je niet netjes aan te kleden.',
  'Je hoeft de liederen niet te kennen.',
  'Je hoeft niet te weten wanneer je moet staan of zitten.',
  'Je hoeft niets te geven.',
  'Je hoeft niet zeker te weten of God bestaat.'
];

export function inhoud(ctx) {
  const { site, kerken, gevoelens, vragen } = ctx;
  const concept = site.modus !== 'productie';
  const homeVragen = vragen.vragen.filter((v) => v.home);

  return html`
<section class="held" aria-labelledby="held-kop">
  <div class="held-binnen">
    <div class="held-tekst">
      <p class="bovenregel onthul">Een uitnodiging van de kerken in ${site.plaats}</p>
      <h1 class="held-kop onthul" id="held-kop">Er is plek <span class="nieuwe-regel">voor <em>jou.</em></span></h1>
      <p class="lead held-lead onthul">Of je nu zoekt naar rust, hoop, geloof of gewoon een plek waar je welkom bent: de kerken in ${site.plaats} zetten graag hun deur voor je open.</p>
      <p class="knoppen onthul">
        <a class="knop knop--vol" href="/kerken/">Ik wil eens komen kijken</a>
        <a class="knop" href="/voor-het-eerst/">Wat kan ik verwachten?</a>
      </p>
      <p class="held-klein onthul">Geen lidmaatschap, geen verplichtingen. Je hoeft je nergens voor aan te melden.</p>
    </div>
    <div class="held-deur" aria-hidden="true">
      <div class="deur">
        <span class="deur-licht"></span>
        <span class="deur-straal"></span>
        <span class="deur-blad"></span>
        <span class="deur-kozijn"></span>
      </div>
      <span class="deur-vloer"></span>
    </div>
  </div>
</section>

<section class="gevoel" aria-labelledby="gevoel-kop">
  <div class="gevoel-binnen">
    <div class="gevoel-intro">
      <h2 class="kop-2" id="gevoel-kop">Hoe gaat het eigenlijk met je?</h2>
      <div class="misschien">
        <p>Misschien ben je moe van alles wat moet.</p>
        <p>Misschien voel je je alleen, ook als er mensen om je heen zijn.</p>
        <p>Misschien draag je verdriet of zorgen mee waar je met niemand over praat.</p>
        <p>Of misschien vraag je je gewoon af wat er achter die kerkdeuren gebeurt.</p>
      </div>
      <p class="gevoel-uitleg">Kies wat het dichtst in de buurt komt. Wat je hier aanklikt, blijft op je eigen scherm; we slaan niets op.</p>
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

<section class="niets" aria-labelledby="niets-kop">
  <div class="niets-binnen">
    <h2 class="sr" id="niets-kop">Je hoeft niets</h2>
    <ul class="niets-lijst">
      ${NIETS.map((r) => html`<li class="onthul">${r}</li>`)}
    </ul>
    <p class="niets-slot onthul">Je mag gewoon <em>komen.</em></p>
    <p class="niets-klein onthul">Kijk wat de mensen om je heen doen, of blijf rustig zitten. Je bent er niet om iets goed te doen. Je bent er welkom.</p>
  </div>
</section>

<section class="waarom" aria-labelledby="waarom-kop">
  <div class="waarom-binnen">
    <div class="waarom-tekst">
      <p class="bovenregel">Waarom we je uitnodigen</p>
      <h2 class="kop-2" id="waarom-kop">Omdat God niet wacht tot je leven op orde is.</h2>
      <p>Jezus at met mensen die door anderen werden gemeden. Hij nodigde juist mensen uit die moe waren, die zich schaamden, die vastzaten. Hij bood vergeving en een nieuw begin. Dat noemen christenen genade: je hoeft het niet te verdienen.</p>
      <p>Wij zijn geen betere mensen. We zijn mensen die bij Hem rust en hoop hebben gevonden. Die plek delen we graag.</p>
      <p><a class="pijllink" href="/geloof/">Wat geloven christenen eigenlijk?</a></p>
    </div>
    ${bijbeltekst(site, { klasse: 'waarom-vers' })}
  </div>
</section>

<section class="dienst" aria-labelledby="dienst-kop">
  <div class="dienst-binnen">
    <div class="sectiekop">
      <p class="bovenregel">Hoe ziet een kerkdienst eruit?</p>
      <h2 class="kop-2" id="dienst-kop">Een zondagochtend, ongeveer zo.</h2>
      <p class="lead">Elke kerk doet het net even anders, maar dit kom je bijna overal tegen. Een dienst duurt meestal een uur tot anderhalf uur.</p>
    </div>
    <ol class="stappen">
      ${STAPPEN.map(([kop, tekst], i) => html`<li class="stap onthul"><span class="stap-nr" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><h3 class="stap-kop">${kop}</h3><p>${tekst}</p></li>`)}
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
      <p class="bovenregel">Een kerk bij jou in de buurt</p>
      <h2 class="kop-2" id="buurt-kop">Welke deur past bij jou?</h2>
      <p class="lead">De ene kerk is stil en eeuwenoud, de andere heeft een band en veel kinderen. Ze delen hetzelfde geloof en dezelfde uitnodiging.</p>
    </div>
    <ul class="kerken-kort" data-schud>
      ${kerken.kerken.map((k) => kerkCompact(k))}
    </ul>
    <p class="buurt-voet"><a class="knop knop--vol" href="/kerken/">Bekijk alle kerken in ${site.plaats}</a></p>
    <p class="klein buurt-eerlijk">De volgorde wisselt bij elk bezoek, zodat geen kerk vooraan staat.</p>
  </div>
</section>

${samenGaan({ concept })}

<section class="slot" aria-labelledby="slot-kop">
  <div class="slot-binnen">
    <h2 class="slot-kop" id="slot-kop">Misschien is er ook voor jou een plek.</h2>
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
