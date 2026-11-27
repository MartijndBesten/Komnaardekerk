import { esc, html, raw, alinea } from './html.mjs';
import { vlakSvg } from './logo.mjs';
const merkje = () => vlakSvg({ donker: false, titel: '', klasse: 'merkje' });

const MAANDEN = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
export function datum(iso) {
  if (!iso) return '';
  const [j, m, d] = iso.split('-').map(Number);
  return `${d} ${MAANDEN[m - 1]} ${j}`;
}

// Responsieve foto (webp in twee breedtes, zie scripts/fotos.mjs). foto = { src, alt, credit, licentie, bron, w, h }
export function foto(f, { klasse = '', sizes = '(min-width: 60rem) 40vw, 100vw', laden = 'lazy', bijschrift = true } = {}) {
  if (!f) return '';
  const basis = f.src.replace(/\.webp$/, '');
  const credit = bijschrift && f.credit
    ? html`<figcaption class="foto-credit">${f.bijschrift ? html`<span class="foto-bijschrift">${f.bijschrift}</span> ` : ''}Foto: ${f.credit}, <a href="${f.bron}" rel="noopener">${f.licentie}</a>${f.conceptbeeld ? ' · conceptbeeld' : ''}</figcaption>`
    : '';
  const breedtes = f.breedtes || [640, 960, 1600];
  const standaard = breedtes.includes(960) ? 960 : breedtes[breedtes.length - 1];
  const srcset = breedtes.map((b) => `${basis}-${b}.webp ${b}w`).join(', ');
  return html`<figure class="foto ${klasse}"><img src="${basis}-${standaard}.webp" srcset="${srcset}" sizes="${sizes}" width="${f.w || 960}" height="${f.h || 1280}" alt="${f.alt || ''}" loading="${laden}" decoding="async"${laden === 'eager' ? raw(' fetchpriority="high"') : ''}>${credit}</figure>`;
}

// Boogvormig beeldvlak. Met foto: foto in de boog. Zonder: warm licht + 'Foto volgt' (concept).
export function boog({ foto: f = null, briefing = '', concept = true, klasse = '', sizes } = {}) {
  if (f) return foto(f, { klasse: `boog ${klasse}`, sizes });
  const verborgen = concept && briefing ? '' : raw(' aria-hidden="true"');
  return html`<figure class="boog boog--licht ${klasse}"${verborgen}>
    <span class="boog-binnen" aria-hidden="true"><span class="boog-straal"></span></span>
    ${concept && briefing ? html`<figcaption class="boog-briefing"><span>Foto volgt</span> ${briefing}</figcaption>` : ''}
  </figure>`;
}

export function faqLijst(vragen, naam = 'vraag') {
  return html`<div class="vragenlijst">
    ${vragen.map(
      (v) => html`<details class="vraag" name="${naam}">
        <summary class="vraag-kop"><span>${v.vraag}</span><span class="plusje" aria-hidden="true"></span></summary>
        <div class="vraag-antwoord">${alinea(v.antwoord)}</div>
      </details>`
    )}
  </div>`;
}

export function hulplijnen(site, { kop = 'Heb je nú iemand nodig?' } = {}) {
  return html`<section class="hulplijnen" aria-labelledby="hulp-kop">
    <h2 class="hulplijnen-kop" id="hulp-kop">${kop}</h2>
    <p>Als het zo zwaar is dat je niet meer weet hoe je verder moet: praat er vandaag nog over met iemand.</p>
    <ul>
      ${site.hulplijnen.map(
        (h) => html`<li><strong>${h.naam}</strong>: bel <a href="tel:${h.tel}">${h.nummer}</a>, ${h.uitleg}. <a href="${h.web}" rel="noopener">Website</a></li>`
      )}
    </ul>
    <p class="klein">Bij direct gevaar: bel 112.</p>
  </section>`;
}

const DAG = { zondag: 'Zondag', zaterdag: 'Zaterdag', vrijdag: 'Vrijdag', donderdag: 'Donderdag', woensdag: 'Woensdag', dinsdag: 'Dinsdag', maandag: 'Maandag' };

const STATUS = {
  kandidaat: null, // besluit Martijn 27-11: geen label 'nog niet benaderd' online
  belangstelling: null,
  deelnemer: null
};

export function statusLabel(item) {
  const s = item.deelname?.status || 'kandidaat';
  return STATUS[s] ? html`<p class="label-status label-status--${s}">${STATUS[s]}</p>` : '';
}

// Diensten per soort (content/kerken.json): 'regulier' = elke week, 'wisselend' = dag of tijd wisselt (rooster nodig),
// 'bijzonder' = maandelijks of een paar keer per jaar. Alles wordt getoond; alleen de vaste diensten krijgen een agendaknop.
const uur = (t) => `${t.replace(':', '.')} uur`;
const DIENSTSOORTEN = [
  ['regulier', 'Elke week'],
  ['wisselend', 'Wisselende tijden'],
  ['bijzonder', 'Maandelijks of bijzonder']
];
const roosterVan = (kerk) => kerk.rooster?.url || kerk.website;

function diensten(kerk, { kop = 'h4' } = {}) {
  const rooster = roosterVan(kerk);
  const actueel = rooster
    ? html`<p class="kerk-rooster">Tijden kunnen afwijken, bijvoorbeeld op feestdagen. <a href="${rooster}" rel="noopener">Bekijk de actuele agenda<span class="sr"> van ${kerk.naam}</span></a>.</p>`
    : '';
  if (!kerk.diensten?.length) return html`<p class="kerk-leeg">Zie de website van de kerk voor de tijden.</p>${actueel}`;
  const adres = [kerk.adres, kerk.postcode, kerk.plaats].filter(Boolean).join(', ');
  const dkop = kop;
  return html`<div class="kerk-diensten">${DIENSTSOORTEN.map(([soort, titel]) => {
    const lijst = kerk.diensten.filter((d) => (d.soort || 'regulier') === soort);
    if (!lijst.length) return '';
    return html`<div class="kerk-dienstgroep kerk-dienstgroep--${soort}">
      ${raw(`<${dkop} class="kerk-dienstkop">`)}${titel}${raw(`</${dkop}>`)}
      <ul class="kerk-tijden">${lijst.map(
        (d) => html`<li><span class="kerk-tijd">${DAG[d.dag] || d.dag}${d.tijd ? ` ${uur(d.tijd)}` : ''}</span>${d.naam ? html` <span class="kerk-dienstnaam">${d.naam}</span>` : ''}${d.toelichting ? html` <span class="kerk-tijd-uitleg">${d.toelichting}</span>` : ''}
          ${soort === 'regulier' && d.tijd ? html`<button type="button" class="tekstknop agenda-knop" hidden data-agenda data-kerk="${kerk.naam}" data-dag="${d.dag}" data-tijd="${d.tijd}" data-adres="${adres}">Zet in mijn agenda</button>` : ''}</li>`
      )}</ul>
    </div>`;
  })}</div>${actueel}`;
}

// Korte regel voor de homepage: alle vaste zondagsdiensten, bijvoorbeeld 'Zondag 09.30 en 16.15 uur'.
export function dienstenKort(kerk) {
  const vast = (kerk.diensten || []).filter((d) => (d.soort || 'regulier') === 'regulier' && d.tijd);
  const zondag = vast.filter((d) => d.dag === 'zondag');
  const kies = zondag.length ? zondag : vast.slice(0, 1);
  if (!kies.length) return (kerk.diensten || []).length ? 'Wisselende tijden · zie de agenda' : 'Tijden: zie website';
  const tijden = kies.map((d) => d.tijd.replace(':', '.'));
  const rij = tijden.length > 1 ? `${tijden.slice(0, -1).join(', ')} en ${tijden[tijden.length - 1]}` : tijden[0];
  const wisselt = (kerk.diensten || []).some((d) => d.soort === 'wisselend' && d.wekelijks);
  return `${DAG[kies[0].dag] || kies[0].dag} ${rij} uur${wisselt ? ' · tweede dienst op wisselende tijd' : ''}`;
}

function routeLink(kerk) {
  if (!kerk.adres) return '';
  const q = encodeURIComponent([kerk.adres, kerk.postcode, kerk.plaats].filter(Boolean).join(', '));
  return html`<a class="pijllink" href="https://www.openstreetmap.org/search?query=${q}" rel="noopener">Route<span class="sr"> naar ${kerk.naam} (OpenStreetMap)</span></a>`;
}

export const TRADITIE_LABEL = {
  'rooms-katholiek': 'Katholiek',
  protestants: 'Protestants',
  reformatorisch: 'Reformatorisch',
  evangelisch: 'Evangelisch'
};
const KENMERK_LABEL = { kinderen: 'Iets voor kinderen', oppas: 'Oppas', online: 'Ook online' };

// Afgeleide kenmerken voor het filter: een vaste dienst op zondagochtend (voor 12.00 uur).
export function filterKenmerken(kerk) {
  const k = new Set(kerk.kenmerken || []);
  if ((kerk.diensten || []).some((d) => d.soort === 'regulier' && d.dag === 'zondag' && d.tijd && d.tijd < '12:00')) k.add('ochtend');
  return [...k].sort().join(' ');
}

// Kerkkaartje: één samenvatting per kerk, op de homepage en op /kerken/. De hele kaart is klikbaar
// (de link zit op de naam; een ::after-laag vergroot het klikvlak) en leidt naar de eigen pagina van de kerk.
export function kerkKaart(kerk, { kop = 'h3' } = {}) {
  const extra = (kerk.kenmerken || []).filter((k) => KENMERK_LABEL[k]).map((k) => KENMERK_LABEL[k]);
  return html`<li class="kerkkaart" id="${kerk.id}" data-kerk="${kerk.id}" data-kenmerken="${filterKenmerken(kerk)}" data-plaats="${kerk.plaats}" data-traditie="${kerk.traditie}">
    <p class="kerkkaart-plaats">${[kerk.plaats, TRADITIE_LABEL[kerk.traditie] || kerk.traditie].filter(Boolean).join(' · ')}</p>
    ${raw(`<${kop} class="kerkkaart-naam">`)}<a href="/kerken/${kerk.id}/">${kerk.naam}</a>${raw(`</${kop}>`)}
    <p class="kerkkaart-tijden">${dienstenKort(kerk)}</p>
    ${extra.length ? html`<p class="kerkkaart-extra">${extra.join(' · ')}</p>` : ''}
    <p class="kerkkaart-meer" aria-hidden="true">Tijden, adres en contact</p>
  </li>`;
}

// Alles over één kerk, op /kerken/<id>/.
export function kerkDetail(kerk, { concept = true } = {}) {
  const c = kerk.contactroute;
  // Alleen een beeld als er een echte foto is (besluit Martijn 15-11: geen foto's zoeken); anders tekst over de volle breedte.
  return html`<article class="kerk kerk--pagina${kerk.foto ? '' : ' kerk--zonder-beeld'}">
    ${kerk.foto ? html`<div class="kerk-beeld">${boog({ foto: kerk.foto, concept, sizes: '(min-width: 56rem) 28vw, 80vw' })}</div>` : ''}
    <div class="kerk-tekst">
      ${statusLabel(kerk)}
      <h1 class="kerk-naam" id="pagina-kop">${kerk.naam}</h1>
      <p class="kerk-traditie">${[kerk.verband || kerk.kerkverband, kerk.plaats].filter(Boolean).join(' · ')}</p>
      <h2 class="kerk-sectiekop">Kerkdiensten</h2>
      ${diensten(kerk, { kop: 'h3' })}
      ${kerk.zelfomschrijving?.tekst
        ? html`<blockquote class="kerk-citaat"><p>${kerk.zelfomschrijving.tekst}</p><footer>Zo omschrijft de gemeente zichzelf · <a href="${kerk.zelfomschrijving.bron}" rel="noopener">bron</a></footer></blockquote>`
        : ''}
      ${kerk.verwachten ? html`<p class="kerk-sfeer">${kerk.verwachten}</p>` : ''}
      <h2 class="kerk-sectiekop">Praktisch</h2>
      <dl class="kerk-feiten">
        <div><dt>Adres</dt><dd>${kerk.adres ? `${kerk.adres}, ${kerk.postcode ? kerk.postcode + ' ' : ''}${kerk.plaats}` : 'Zie website'}</dd></div>
        <div><dt>Kinderen</dt><dd>${kerk.kinderen || 'Niet vermeld op de website.'}</dd></div>
        ${kerk.toegankelijkheid ? html`<div><dt>Toegankelijkheid</dt><dd>${kerk.toegankelijkheid}</dd></div>` : ''}
        ${kerk.livestream ? html`<div><dt>Eerst online kijken?</dt><dd><a href="${kerk.livestream}" rel="noopener">Diensten online</a></dd></div>` : ''}
        <div><dt>Eerste contact</dt><dd>${
          c?.soort === 'email' ? html`<a href="mailto:${c.waarde}">${c.waarde}</a>` : c?.soort === 'formulier' ? html`<a href="${c.waarde}" rel="noopener">Contact via de website</a>` : c?.soort === 'telefoon' ? html`<a href="tel:${c.waarde.replace(/\s/g, '')}">${c.waarde}</a>` : 'Via de website'
        }</dd></div>
      </dl>
      <p class="kerk-links">
        ${kerk.website ? html`<a class="pijllink" href="${kerk.website}" rel="noopener">Website<span class="sr"> van ${kerk.naam}</span></a>` : ''}
        ${routeLink(kerk)}
      </p>
      <p class="kerk-controle">Gegevens gecontroleerd op ${datum(kerk.gecontroleerd)}${kerk.bronnen?.length ? html` · <a href="${kerk.bronnen[0].url}" rel="noopener">bron</a>` : ''}.</p>
    </div>
  </article>`;
}

// Mattheüs 11:28. Zolang vertaling en rechten niet rond zijn (VRAGEN V-003): een eigen weergave, duidelijk
// gemarkeerd als 'vrij weergegeven'. Met site.bijbel.weergave === 'citaat' volgt de letterlijke tekst met bronvermelding.
export function bijbeltekst(site, { klasse = '' } = {}) {
  const b = site.bijbel;
  const citaat = b.weergave === 'citaat' && b.citaat;
  return html`<figure class="bijbeltekst ${klasse}">
    <blockquote><p>${citaat ? citaat.tekst : b.parafrase}</p></blockquote>
    <figcaption>${citaat
      ? html`Jezus, in ${b.bron} <span class="bijbel-vertaling">${citaat.rechten} · <a href="${b.verderLezen}" rel="noopener">lees verder op debijbel.nl</a></span>`
      : html`Jezus · vrij weergegeven naar ${b.bron} <span class="bijbel-vertaling">Dit is een eigen weergave, geen Bijbelvertaling · <a href="${b.verderLezen}" rel="noopener">lees de tekst op debijbel.nl</a></span>`}</figcaption>
  </figure>`;
}

export function paginaKop({ boven, titel, lead, id = 'pagina-kop', beeld = null }) {
  return html`<header class="paginakop${beeld ? ' paginakop--beeld' : ''}">
    <div class="paginakop-binnen">
      <div class="paginakop-tekst">
        ${boven ? html`<p class="bovenregel">${boven}</p>` : ''}
        <h1 class="kop-1" id="${id}">${raw(titel)}</h1>
        ${lead ? html`<p class="lead">${lead}</p>` : ''}
      </div>
      ${beeld ? html`<div class="paginakop-beeld">${foto(beeld, { klasse: 'boog', laden: 'eager', sizes: '(min-width: 60rem) 30vw, 70vw' })}</div>` : html`<div class="paginakop-lijn" aria-hidden="true">${raw(merkje())}</div>`}
    </div>
  </header>`;
}

export function samenGaanTeaser() {
  return html`<section class="samen" aria-labelledby="samen-kop">
    <div class="samen-binnen">
      <div class="samen-lijn" aria-hidden="true">${raw(merkje())}</div>
      <div class="samen-tekst">
        <p class="bovenregel">Samen naar de kerk</p>
        <h2 id="samen-kop" class="kop-2">Vind je het spannend om alleen te gaan?</h2>
        <p class="lead">Dat snappen we. Lees hoe je een eerste bezoek voorbereidt, en neem gerust iemand mee: een vriend, een buurvrouw, je kind. Kerken zijn gewend aan nieuwe gezichten.</p>
        <p><a class="knop knop--vol" href="/samen-naar-de-kerk/">Een eerste bezoek voorbereiden</a></p>
      </div>
    </div>
  </section>`;
}
