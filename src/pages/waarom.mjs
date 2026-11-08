import { html, raw } from '../lib/html.mjs';
import { paginaKop, bijbeltekst } from '../lib/onderdelen.mjs';

export const pagina = {
  pad: '/waarom-naar-de-kerk/',
  titel: 'Waarom naar de kerk?',
  omschrijving: 'Waarom gaan mensen naar de kerk? Wie is Jezus, wat geloven christenen, wat is genade, wat is bidden en wat als je twijfelt? Korte, eerlijke antwoorden.'
};

const VRAGEN = [
  {
    id: 'waarom',
    vraag: 'Waarom gaan mensen naar de kerk?',
    tekst: [
      'Niet omdat het moet, en ook niet omdat kerkgangers betere mensen zijn. Christenen komen samen omdat ze geloven dat God er is, dat Hij spreekt en dat Hij mensen wil ontmoeten.',
      'In de kerk luisteren ze samen naar de Bijbel, zingen ze, bidden ze en dragen ze elkaar. Je kunt alleen geloven, maar niet lang. De kerk is een gemeenschap van mensen die Jezus willen volgen, met elkaar, week na week.'
    ]
  },
  {
    id: 'jezus',
    vraag: 'Wie is Jezus?',
    tekst: [
      'Jezus van Nazaret leefde zo’n tweeduizend jaar geleden in Israël. Hij genas zieken, zocht mensen op die buiten de boot vielen en sprak over God als een Vader die op zijn kinderen wacht.',
      'Christenen geloven dat Jezus meer is dan een goed mens: Hij is Gods Zoon. In Hem kwam God zelf naar ons toe. Hij stierf aan het kruis en stond op de derde dag op uit de dood. Hij leeft, en Hij nodigt nog steeds mensen uit om Hem te volgen.'
    ]
  },
  {
    id: 'geloven',
    vraag: 'Wat geloven christenen?',
    tekst: [
      'Dat er één God is: Vader, Zoon en Heilige Geest. Dat God de wereld en de mensen heeft gemaakt en van ze houdt. Dat er veel stuk is, in de wereld en in onszelf. En dat God dat niet zo laat.',
      'Door Jezus is er vergeving en een nieuw begin. De Heilige Geest helpt mensen geloven en verandert hun leven. En er is hoop: op een toekomst waarin God alles nieuw maakt.'
    ],
    link: ['/ontdek-het-geloof/', 'Lees meer over het christelijk geloof']
  },
  {
    id: 'bijbel',
    vraag: 'Waarom is de Bijbel belangrijk?',
    tekst: [
      'De Bijbel is eigenlijk een hele boekenkast: geschiedenis, gedichten, wijsheid, brieven en de verhalen over Jezus, geschreven over een periode van meer dan duizend jaar.',
      'Christenen geloven dat God daarin spreekt. Daarom lezen ze de Bijbel, in de kerk en thuis, om God te leren kennen en te ontdekken hoe je met Hem leeft. Wil je beginnen? Lees het evangelie van Marcus: kort, en het hele verhaal van Jezus.'
    ]
  },
  {
    id: 'genade',
    vraag: 'Wat betekent genade?',
    tekst: [
      'Genade betekent: iets krijgen wat je niet verdient. Je hoeft niet eerst je leven op orde te brengen voordat God van je houdt. Vergeving en een nieuw begin zijn een geschenk.',
      'Dat is misschien wel het hart van het christelijk geloof. Het verklaart ook waarom een kerk geen plek is voor mensen die het voor elkaar hebben, maar voor mensen die weten dat ze God nodig hebben.'
    ]
  },
  {
    id: 'bidden',
    vraag: 'Wat is bidden?',
    tekst: [
      'Bidden is praten met God. Dat kan hardop of in stilte, met eigen woorden of met woorden die anderen al eeuwen bidden, zoals het Onzevader. Je mag Hem danken, je zorgen bij Hem brengen of gewoon vertellen hoe het met je gaat.',
      'Je hoeft er geen speciale woorden voor te kennen. In de kerk wordt hardop gebeden; je kunt meebidden of gewoon stil zijn.'
    ]
  },
  {
    id: 'twijfel',
    vraag: 'Wat als ik twijfel?',
    tekst: [
      'Dan ben je in goed gezelschap. In de Bijbel staan mensen die klagen, vragen en met God worstelen. Een vader vertelde Jezus ooit dat hij geloofde, maar ook hulp nodig had bij zijn ongeloof (Marcus 9). Jezus stuurde hem niet weg.',
      'Je hoeft niet zeker te weten wat je gelooft om te komen. Veel mensen ontdekken pas onderweg wat geloven is. Twijfel mag je meenemen, ook naar de kerk.'
    ]
  }
];

export function inhoud(ctx) {
  const { site } = ctx;
  return html`
${paginaKop({
  boven: 'Waarom naar de kerk?',
  titel: 'Eerlijke vragen verdienen een <em>eerlijk</em> antwoord.',
  lead: 'Wat er in de kerk gebeurt, wie Jezus is en wat christenen geloven, in gewone woorden. Zonder dat je het met alles eens hoeft te zijn.',
  lijnNaam: 'lezen'
})}

<nav class="inhoudsopgave" aria-label="Op deze pagina">
  <ol>${VRAGEN.map((v) => html`<li><a href="#${v.id}">${v.vraag}</a></li>`)}</ol>
</nav>

<section class="waarom" aria-label="Vragen en antwoorden">
  <div class="waarom-lijst">
    ${VRAGEN.map(
      (v) => html`<article class="waarom-item onthul" id="${v.id}" aria-labelledby="${v.id}-kop" tabindex="-1">
        <h2 class="kop-2" id="${v.id}-kop">${v.vraag}</h2>
        <div class="waarom-tekst">${v.tekst.map((t) => html`<p>${t}</p>`)}${v.link ? html`<p><a class="pijllink" href="${v.link[0]}">${v.link[1]}</a></p>` : ''}</div>
      </article>`
    )}
  </div>
</section>

<section class="vers-blok" aria-label="Een woord van Jezus">
  <div class="vers-blok-binnen">${bijbeltekst(site)}</div>
</section>

<section class="doorvragen" aria-labelledby="doorvragen-kop">
  <div class="doorvragen-binnen">
    <h2 class="kop-2" id="doorvragen-kop">Verder ontdekken?</h2>
    <p class="lead">Kom een keer kijken in een kerk, of praat verder bij een kennismakingsavond.</p>
    <p class="knoppen"><a class="knop knop--vol" href="/kerken/">Ontdek de kerken</a> <a class="knop" href="/activiteiten/">Activiteiten</a></p>
  </div>
</section>
`;
}

export function jsonld() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: VRAGEN.map((v) => ({ '@type': 'Question', name: v.vraag, acceptedAnswer: { '@type': 'Answer', text: v.tekst.join(' ') } }))
  };
}
