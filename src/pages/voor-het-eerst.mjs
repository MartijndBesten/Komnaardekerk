import { html } from '../lib/html.mjs';
import { faqLijst, paginaKop, samenGaan, boog } from '../lib/onderdelen.mjs';

export const pagina = {
  pad: '/voor-het-eerst/',
  titel: 'Voor het eerst naar de kerk',
  omschrijving: 'Voor het eerst naar een kerk in Houten? Lees hoe een kerkdienst gaat, wat je aantrekt, of het iets kost en of je gewoon achterin mag zitten.'
};

const ROUTE = [
  {
    kop: 'Vooraf',
    tekst: [
      'Kies een kerk en een tijd. Twijfel je? Kijk bij ‘Kerken in Houten’ wat bij je past, of vraag of iemand met je mee wil gaan.',
      'Trek aan wat je prettig vindt. Kom tien minuten vóór de tijd, dan heb je rustig de tijd om een plek te zoeken.'
    ]
  },
  {
    kop: 'Bij de deur',
    tekst: [
      'Vaak staat er iemand die je een hand geeft of goedemorgen zegt. Soms krijg je een liturgie mee: een blaadje of boekje met de volgorde van de dienst en de liedteksten.',
      'Zeg gerust dat het je eerste keer is. Dan helpen mensen je graag op weg. Hoeft niet, mag wel.'
    ]
  },
  {
    kop: 'Een plek zoeken',
    tekst: ['Ga zitten waar je wilt. Achterin is prima: daar zie je wat anderen doen en kun je makkelijk weg. Jassen houden veel mensen gewoon aan of leggen ze naast zich.']
  },
  {
    kop: 'De dienst',
    tekst: [
      'Er wordt gezongen, gebeden en uit de Bijbel gelezen. De voorganger houdt een preek: een uitleg van de Bijbeltekst voor het leven van nu, meestal tien tot dertig minuten.',
      'Als de mensen om je heen gaan staan, mag je meedoen of blijven zitten. Er gaat soms een collectezak of schaal rond. Geven is vrijwillig; je geeft hem gewoon door.',
      'Aan het eind klinkt de zegen: een korte, oude belofte dat God met je meegaat. Daarna is de dienst afgelopen.'
    ]
  },
  {
    kop: 'Na afloop',
    tekst: ['In veel kerken is er koffie of thee. Je mag blijven en een praatje maken, of rustig naar huis gaan. Wil je de voorganger iets vragen? Dat kan bijna altijd, gewoon na de dienst.']
  },
  {
    kop: 'En daarna?',
    tekst: ['Niets moet. Je kunt nog eens terugkomen, een andere kerk proberen of er een tijd niet aan denken. Je wordt niet ingeschreven en niemand belt je ongevraagd op.']
  }
];

const KERKTAAL = [
  ['Voorganger', 'Degene die de dienst leidt. Afhankelijk van de kerk heet dat een dominee, predikant, pastor, priester of oudste.'],
  ['Preek', 'De uitleg van een Bijbeltekst tijdens de dienst. In de katholieke kerk heet het homilie.'],
  ['Liturgie', 'De vaste volgorde van de dienst. Ook het blaadje met die volgorde en de liedteksten heet zo.'],
  ['Psalm', 'Een lied of gebed uit de Bijbel. Sommige zijn drieduizend jaar oud en worden nog steeds gezongen.'],
  ['Collecte', 'Het inzamelen van geld voor de kerk of voor goede doelen. Vrijwillig.'],
  ['Avondmaal, communie of eucharistie', 'Het delen van brood en wijn (of druivensap) om Jezus te gedenken. Elke kerk heeft eigen gewoonten over wie meedoet.'],
  ['Zegen', 'De korte woorden aan het eind van de dienst: God gaat met je mee.'],
  ['Amen', 'Betekent ‘zo is het’ of ‘zo zij het’. Je zegt het aan het eind van een gebed.'],
  ['Gemeente of parochie', 'De groep mensen die samen een kerk vormt. Het gebouw is de kerk; de mensen ook.']
];

export function inhoud(ctx) {
  const { site, vragen } = ctx;
  const concept = site.modus !== 'productie';
  return html`
${paginaKop({
  boven: 'Voor het eerst',
  titel: 'Ergens voor het eerst binnenlopen is <em>altijd</em> een beetje spannend.',
  lead: 'Hier lees je hoe een kerkdienst meestal gaat, zodat je weet wat je kunt verwachten. Geen kerktaal, geen verrassingen.'
})}

<section class="route" aria-labelledby="route-kop">
  <div class="route-binnen">
    <h2 class="kop-2" id="route-kop">Van de voordeur tot de koffie</h2>
    <ol class="route-lijst">
      ${ROUTE.map(
        (r, i) => html`<li class="route-stap onthul"><span class="stap-nr" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><div><h3 class="kop-3">${r.kop}</h3>${r.tekst.map((t) => html`<p>${t}</p>`)}</div></li>`
      )}
    </ol>
  </div>
</section>

<section class="vragenblok" aria-labelledby="vragen-kop">
  <div class="vragenblok-binnen">
    <div class="sectiekop">
      <h2 class="kop-2" id="vragen-kop">Vragen die je misschien hebt</h2>
      <p class="lead">Geen vraag is te klein. Deze horen we het vaakst.</p>
    </div>
    ${faqLijst(vragen.vragen, 'vraag')}
  </div>
</section>

<section class="kerktaal" aria-labelledby="kerktaal-kop">
  <div class="kerktaal-binnen">
    <div class="sectiekop">
      <p class="bovenregel">Kerktaal vertaald</p>
      <h2 class="kop-2" id="kerktaal-kop">Woorden die je kunt horen</h2>
      <p class="lead">Kerken hebben hun eigen woorden. Hier betekenen ze dit.</p>
    </div>
    <dl class="woorden">
      ${KERKTAAL.map(([w, b]) => html`<div class="woord"><dt>${w}</dt><dd>${b}</dd></div>`)}
    </dl>
  </div>
</section>

<section class="verschil" aria-labelledby="verschil-kop">
  <div class="verschil-binnen">
    <div>
      <h2 class="kop-2" id="verschil-kop">Waarom zijn er verschillende kerken?</h2>
      <p>In de loop van tweeduizend jaar zijn christenen op verschillende manieren gaan samenkomen. Daarom zijn er katholieke, protestantse, evangelische en andere kerken. Ze verschillen in muziek, in vorm en soms in opvattingen.</p>
      <p>Wat ze delen, is het belangrijkste: het geloof in God, in Jezus Christus en in de heilige Geest. Er is geen verkeerde kerk om mee te beginnen. Kies de deur waar je je bij voelt, en kijk gerust ook eens ergens anders.</p>
      <p><a class="knop knop--vol" href="/kerken/">Bekijk de kerken in ${site.plaats}</a></p>
    </div>
    ${boog({ briefing: 'interieur in ochtendlicht, een paar mensen op de achterste rij', concept, klasse: 'boog--klein' })}
  </div>
</section>

${samenGaan({ concept })}
`;
}

export function jsonld(ctx) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: ctx.vragen.vragen.map((v) => ({
      '@type': 'Question',
      name: v.vraag,
      acceptedAnswer: { '@type': 'Answer', text: v.antwoord.join(' ') }
    }))
  };
}
