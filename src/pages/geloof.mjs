import { html } from '../lib/html.mjs';
import { faqLijst, paginaKop, bijbeltekst } from '../lib/onderdelen.mjs';

export const pagina = {
  pad: '/geloof/',
  titel: 'Wat geloof je eigenlijk?',
  omschrijving: 'Waar geloven christenen in? Een eerlijke, toegankelijke kennismaking met God, Jezus, genade en twijfel. Zonder dat je het met alles eens hoeft te zijn.'
};

const DELEN = [
  {
    kop: 'Het begint bij God',
    tekst: [
      'Christenen geloven dat de wereld niet toevallig is, maar gewild. Dat er een God is die alles heeft gemaakt en die van mensen houdt. Geen verre kracht, maar Iemand die jou kent, ook als jij Hem (nog) niet kent.'
    ]
  },
  {
    kop: 'Jezus',
    tekst: [
      'Zo’n tweeduizend jaar geleden leefde in Israël Jezus van Nazaret. Hij genas zieken, at met mensen met wie niemand wilde eten, en vertelde verhalen over Gods liefde die mensen tot vandaag raken.',
      'Christenen geloven dat God in Jezus zelf mens werd. Wie wil weten wie God is, kan dus het best naar Jezus kijken.'
    ]
  },
  {
    kop: 'Het kruis en het lege graf',
    tekst: [
      'Jezus werd gekruisigd. Christenen geloven dat Hij daar op zich nam wat tussen God en mensen in staat: alles wat we fout doen en niet meer kunnen goedmaken.',
      'Op de derde dag stond Hij op uit de dood. Daarom is Pasen het grootste feest van de kerk. De dood heeft niet het laatste woord, en een nieuw begin is mogelijk.'
    ]
  },
  {
    kop: 'Genade: je hoeft het niet te verdienen',
    tekst: [
      'Vergeving en een nieuw begin zijn geen beloning voor wie het goed doet. Het is een geschenk. Daarom is de kerk geen club van mensen die het voor elkaar hebben. Eerder een plek voor mensen die weten dat ze dat niet altijd hebben.'
    ]
  },
  {
    kop: 'Leven met God',
    tekst: [
      'Geloven is meer dan iets voor waar aannemen. Het is een manier van leven: bidden (gewoon praten met God), de Bijbel lezen, samenkomen, en omzien naar je buren en naar wie het moeilijk heeft. Christenen geloven dat de heilige Geest, Gods aanwezigheid in ons leven, daarbij helpt.'
    ]
  },
  {
    kop: 'En als je twijfelt?',
    tekst: [
      'Twijfel hoort erbij. In de Bijbel staan mensen die klagen, vragen en met God worstelen. Je hoeft niet eerst zeker te zijn voordat je mag komen. Veel mensen ontdekken pas onderweg wat ze geloven.'
    ]
  }
];

const VRAGEN = [
  {
    vraag: 'Bestaat God eigenlijk?',
    antwoord: [
      'Dat kun je niet bewijzen zoals je een rekensom bewijst, en ook niet weerleggen. Christenen geloven dat God zich laat kennen: in de schepping, in de Bijbel en vooral in Jezus.',
      'Veel gelovigen vertellen dat ze God niet eerst begrepen, maar wel leerden kennen. Je kunt het zelf onderzoeken: lees eens een stuk uit de Bijbel, of kom luisteren.'
    ]
  },
  {
    vraag: 'Waarom laat God lijden toe?',
    antwoord: [
      'Misschien wel de moeilijkste vraag die er is. Er is geen antwoord dat alle pijn wegneemt, en wie dat belooft, neemt je verdriet niet serieus.',
      'Wat christenen wel geloven: God staat niet aan de zijlijn. In Jezus heeft Hij zelf pijn, verlatenheid en de dood doorgemaakt. En de Bijbel belooft een toekomst waarin God alle tranen afwist.'
    ]
  },
  {
    vraag: 'Is de Bijbel niet gewoon een oud boek?',
    antwoord: [
      'Het is een oud boek, of eigenlijk een hele boekenkast: verhalen, gedichten, wijsheid, brieven en geschiedenis, geschreven over een periode van meer dan duizend jaar. Christenen geloven dat God erdoor spreekt.',
      'Wil je beginnen? Lees het evangelie van Marcus. Het is kort en vertelt het verhaal van Jezus van begin tot eind.'
    ]
  },
  {
    vraag: 'Moet ik eerst geloven voordat ik naar de kerk mag?',
    antwoord: ['Nee. De kerk is er juist ook voor mensen die zoeken. Kom, luister en kijk. Wat je ermee doet, is aan jou.']
  },
  {
    vraag: 'Hoe word je christen?',
    antwoord: [
      'Door Jezus te gaan volgen: Hem te vertrouwen en met Hem te leven. Dat begint vaak klein, met een eerlijk gebed of een goed gesprek.',
      'Veel kerken hebben gespreksgroepen of cursussen voor mensen die meer willen weten. Vraag ernaar bij een kerk, of via ‘Even praten’.'
    ]
  },
  {
    vraag: 'Waarom zijn christenen het niet altijd met elkaar eens?',
    antwoord: [
      'Omdat het mensen zijn. Over sommige vragen denken kerken verschillend. Over de kern zijn ze het eens: God houdt van mensen, en in Jezus is er vergeving en een nieuw begin.'
    ]
  }
];

export function inhoud(ctx) {
  const { site } = ctx;
  return html`
${paginaKop({
  boven: 'Wat geloof je eigenlijk?',
  titel: 'Een eerlijke vraag. Hier is een eerlijk <em>antwoord.</em>',
  lead: 'Wat christenen geloven, in gewone woorden. Je hoeft het niet met alles eens te zijn om verder te lezen, of om een keer te komen.'
})}

<section class="geloof" aria-label="Wat christenen geloven">
  <div class="geloof-binnen">
    ${DELEN.map(
      (d, i) => html`<article class="geloof-deel onthul" aria-labelledby="geloof-${i}">
        <h2 class="kop-2" id="geloof-${i}">${d.kop}</h2>
        <div class="geloof-tekst">${d.tekst.map((t) => html`<p>${t}</p>`)}</div>
      </article>`
    )}
  </div>
</section>

<section class="vers-blok" aria-label="Een woord van Jezus">
  <div class="vers-blok-binnen">${bijbeltekst(site)}</div>
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
    <h2 class="kop-2" id="doorvragen-kop">Liever even doorpraten?</h2>
    <p class="lead">Met iemand die niet gaat preken, maar luistert en eerlijk antwoord geeft.</p>
    <p class="knoppen"><a class="knop knop--vol" href="/even-praten/">Even praten</a> <a class="knop" href="/kerken/">Een dienst bezoeken</a></p>
  </div>
</section>
`;
}
