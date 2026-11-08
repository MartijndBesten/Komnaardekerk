import { html } from '../lib/html.mjs';
import { faqLijst, paginaKop, bijbeltekst } from '../lib/onderdelen.mjs';

export const pagina = {
  pad: '/ontdek-het-geloof/',
  titel: 'Ontdek het geloof',
  omschrijving: 'Het evangelie van Jezus Christus, in begrijpelijke woorden: wie God is, wat Jezus deed, wat genade betekent en hoe je met God kunt leven. Plus de gezamenlijke geloofsbasis van de kerken.'
};

// Het evangelie als verhaal in vijf bewegingen.
const VERHAAL = [
  {
    kop: 'God heeft je gemaakt en kent je',
    tekst: [
      'Het christelijk geloof begint niet bij wat wij doen, maar bij wie God is. Hij heeft de wereld gemaakt, en jou. Je bent geen toeval. Je bent gewild en gekend, nog voordat je iets hebt gepresteerd.',
      'De Bijbel vertelt dat God de mens maakte om met Hem te leven: in vrede met God, met elkaar en met de wereld.'
    ]
  },
  {
    kop: 'Er is iets kapot',
    tekst: [
      'Iedereen weet het eigenlijk: zo is het niet bedoeld. Er is pijn, onrecht en eenzaamheid. En als we eerlijk zijn, ook in onszelf: dingen die we doen en laten waar we spijt van hebben, en die we zelf niet goed kunnen maken.',
      'De Bijbel noemt dat zonde: leven zonder God, losgeraakt van de bron. Het maakt ons leven en onze relaties stuk.'
    ]
  },
  {
    kop: 'God komt ons zoeken in Jezus',
    tekst: [
      'God laat het daar niet bij. In Jezus Christus kwam Hij zelf naar ons toe. Jezus leefde zoals God het bedoeld heeft: vol liefde, waarheid en trouw. Hij zocht mensen op die verloren waren.',
      'Aan het kruis droeg Hij wat ons van God scheidt. Op de derde dag stond Hij op uit de dood. Daarmee opende Hij de weg terug naar God, voor iedereen.'
    ]
  },
  {
    kop: 'Genade: een geschenk',
    tekst: [
      'Vergeving en een nieuw leven kun je niet verdienen. Je kunt het alleen aannemen, zoals je een cadeau aanneemt. Dat noemen christenen genade. Geloven is: op Jezus vertrouwen, en met Hem verder gaan.',
      'De Heilige Geest, God die dichtbij is, helpt daarbij. Hij geeft geloof, troost en kracht, en verandert mensen van binnenuit.'
    ]
  },
  {
    kop: 'Een nieuw begin, en hoop',
    tekst: [
      'Wie Jezus volgt, leert God liefhebben en de mensen om zich heen. Dat doe je niet alleen: daarvoor is de kerk, de gemeenschap van mensen die samen onderweg zijn.',
      'En er is hoop die verder reikt dan dit leven. Christenen verwachten dat Jezus terugkomt en dat God alles nieuw maakt, zonder dood, verdriet en pijn.'
    ]
  }
];

const VRAGEN = [
  {
    vraag: 'Bestaat God eigenlijk?',
    antwoord: [
      'Dat kun je niet bewijzen zoals een rekensom, en ook niet weerleggen. Christenen geloven dat God zich laat kennen: in de schepping, in de Bijbel en vooral in Jezus.',
      'Veel gelovigen vertellen dat ze God niet eerst begrepen, maar wel leerden kennen. Je kunt het zelf onderzoeken: lees een evangelie, kom luisteren, of doe mee aan een kennismakingscursus.'
    ]
  },
  {
    vraag: 'Waarom laat God lijden toe?',
    antwoord: [
      'Misschien wel de moeilijkste vraag die er is. Er is geen antwoord dat alle pijn wegneemt, en wie dat belooft, neemt je verdriet niet serieus.',
      'Wat christenen wel geloven: God staat niet aan de zijlijn. In Jezus heeft Hij zelf pijn, verlatenheid en de dood gedragen. En de Bijbel belooft een toekomst waarin God alle tranen afwist.'
    ]
  },
  {
    vraag: 'Moet ik eerst geloven voordat ik naar de kerk mag?',
    antwoord: ['Nee. De kerk is er juist ook voor mensen die zoeken. Kom, luister en kijk. Wat je ermee doet, is aan jou.']
  },
  {
    vraag: 'Hoe word je christen?',
    antwoord: [
      'Door Jezus te gaan volgen: Hem te vertrouwen en met Hem te leven. Dat begint vaak klein, met een eerlijk gebed of een goed gesprek, en groeit in de gemeenschap van de kerk.',
      'Wil je erover praten? In Houten zijn er kennismakingscursussen en gespreksgroepen. Kijk bij Activiteiten, of vraag het in een kerk.'
    ]
  },
  {
    vraag: 'Waarom zijn er zoveel verschillende kerken?',
    antwoord: [
      'In tweeduizend jaar zijn christenen op verschillende manieren gaan samenkomen: rooms-katholiek, protestants, reformatorisch, evangelisch. Ze verschillen in liturgie, muziek, de sacramenten, de doop en de manier van kerk-zijn. Die verschillen zijn echt, en worden niet weggepoetst.',
      'Wat deze kerken verbindt, is het belangrijkste: het geloof in God de Vader, de Zoon en de Heilige Geest, en in Jezus Christus als Heer en Verlosser.'
    ]
  }
];

export function inhoud(ctx) {
  const { site, geloofsbasis: g } = ctx;
  const concept = g.status !== 'vastgesteld';
  return html`
${paginaKop({
  boven: 'Ontdek het geloof',
  titel: 'Het goede nieuws, in <em>gewone</em> woorden.',
  lead: 'Waar het christelijk geloof om draait: wie God is, wat Jezus deed en wat dat voor jou kan betekenen. Lees het in je eigen tempo.',
  lijnNaam: 'deur'
})}

<section class="verhaal" aria-label="Het evangelie">
  <ol class="verhaal-lijst">
    ${VERHAAL.map(
      (d, i) => html`<li class="verhaal-deel onthul">
        <span class="verhaal-nr" aria-hidden="true">${['I', 'II', 'III', 'IV', 'V'][i]}</span>
        <h2 class="kop-2">${d.kop}</h2>
        <div class="verhaal-tekst">${d.tekst.map((t) => html`<p>${t}</p>`)}</div>
      </li>`
    )}
  </ol>
</section>

<section class="vers-blok" aria-label="Een woord van Jezus">
  <div class="vers-blok-binnen">${bijbeltekst(site)}</div>
</section>

<section class="basis" aria-labelledby="basis-kop" id="geloofsbasis">
  <div class="basis-binnen">
    <div class="basis-intro">
      <p class="bovenregel">Wat ons verbindt</p>
      <h2 class="kop-2" id="basis-kop">Gezamenlijke geloofsbasis</h2>
      ${concept ? html`<p class="label-status label-status--kandidaat">Concept ${g.versie} · ter bespreking, door geen enkele kerk goedgekeurd</p>` : ''}
      <p>${g.inleiding}</p>
      <p class="klein">${g.wortels}</p>
    </div>
    <dl class="basis-lijst">
      ${g.artikelen.map((a) => html`<div class="basis-artikel"><dt>${a.kop}</dt><dd>${a.tekst}</dd></div>`)}
    </dl>
    <div class="basis-verschil">
      <h3 class="kop-3">En de verschillen?</h3>
      <p>${g.verschillen}</p>
    </div>
  </div>
</section>

<section class="vragenblok" aria-labelledby="geloofsvragen-kop">
  <div class="vragenblok-binnen">
    <div class="sectiekop">
      <h2 class="kop-2" id="geloofsvragen-kop">Vragen die mensen stellen</h2>
      <p class="lead">Korte antwoorden op grote vragen. Praten is beter dan lezen: in elke kerk is wel iemand die er graag over doorpraat.</p>
    </div>
    ${faqLijst(VRAGEN, 'geloofsvraag')}
  </div>
</section>

<section class="doorvragen" aria-labelledby="doorvragen-kop">
  <div class="doorvragen-binnen">
    <h2 class="kop-2" id="doorvragen-kop">Een volgende stap?</h2>
    <p class="lead">Lees eens een evangelie, bezoek een kerkdienst of doe mee aan een avond waar je al je vragen mag stellen.</p>
    <p class="knoppen"><a class="knop knop--vol" href="/activiteiten/">Kennismaken met het geloof</a> <a class="knop" href="/kerken/">Een kerk bezoeken</a></p>
  </div>
</section>
`;
}
