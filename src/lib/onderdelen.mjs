import { esc, html, raw, alinea } from './html.mjs';
import { beeldmerk } from './merk.mjs';

// Boogvormig beeldvlak (de vorm van een kerkdeur). Zonder foto: warm licht met een
// duidelijke 'foto volgt'-aanduiding in conceptmodus. Nooit stockbeeld als 'echt'.
export function boog({ foto = null, alt = '', briefing = '', concept = true, klasse = '', deur = false } = {}) {
  if (foto) {
    return html`<figure class="boog ${klasse}"><img src="${foto}" alt="${alt}" loading="lazy" decoding="async"></figure>`;
  }
  const verborgen = concept && briefing ? '' : raw(' aria-hidden="true"');
  return html`<figure class="boog boog--licht ${klasse}"${verborgen}>
    <span class="boog-binnen" aria-hidden="true"><span class="boog-straal"></span>${deur ? raw('<span class="boog-deur"></span>') : ''}</span>
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

function diensten(kerk) {
  if (!kerk.diensten?.length) return html`<p class="kerk-leeg">Tijden volgen.</p>`;
  return html`<ul class="kerk-tijden">${kerk.diensten.map(
    (d) => html`<li><span class="kerk-tijd">${DAG[d.dag] || d.dag} ${d.tijd ? `${d.tijd} uur` : ''}</span>${d.omschrijving ? html` <span class="kerk-tijd-uitleg">${d.omschrijving}</span>` : ''}
      ${d.tijd ? html`<button type="button" class="tekstknop agenda-knop" hidden data-agenda data-kerk="${kerk.naam}" data-dag="${d.dag}" data-tijd="${d.tijd}" data-adres="${[kerk.adres, kerk.postcode, 'Houten'].filter(Boolean).join(', ')}">Zet in mijn agenda</button>` : ''}</li>`
  )}</ul>`;
}

function routeLink(kerk) {
  if (!kerk.adres) return '';
  const bestemming = encodeURIComponent([kerk.adres, kerk.postcode, 'Houten'].filter(Boolean).join(', '));
  return html`<a class="pijllink" href="https://www.openstreetmap.org/search?query=${bestemming}" rel="noopener">Bekijk op de kaart<span class="sr"> (${kerk.naam}, opent OpenStreetMap)</span></a>`;
}

export function kerkItem(kerk, { concept = true, kop = 'h3' } = {}) {
  const kenmerken = (kerk.kenmerken || []).join(' ');
  return html`<article class="kerk" id="${kerk.id}" data-kenmerken="${kenmerken}">
    <div class="kerk-beeld">${boog({ foto: kerk.foto, alt: kerk.fotoAlt || '', briefing: concept ? 'van deze kerk: interieur of ingang, met echte mensen' : '', concept })}</div>
    <div class="kerk-tekst">
      ${kerk.voorbeeld ? html`<p class="label-voorbeeld">Voorbeeld · geen echte kerk</p>` : ''}
      ${raw(`<${kop} class="kerk-naam">${esc(kerk.naam)}</${kop}>`)}
      ${kerk.traditie ? html`<p class="kerk-traditie">${kerk.traditie}</p>` : ''}
      ${diensten(kerk)}
      <p class="kerk-sfeer">${kerk.sfeer}</p>
      <dl class="kerk-feiten">
        <div><dt>Adres</dt><dd>${kerk.adres ? `${kerk.adres}${kerk.postcode ? ', ' + kerk.postcode : ''} Houten` : 'Volgt'}${kerk.wijk && kerk.wijk !== 'Wijk volgt' ? html` <span class="kerk-wijk">(${kerk.wijk})</span>` : ''}</dd></div>
        <div><dt>Kinderen</dt><dd>${kerk.kinderen || 'Vraag het de kerk.'}</dd></div>
        <div><dt>Toegankelijkheid</dt><dd>${kerk.toegankelijkheid || 'Vraag het de kerk.'}</dd></div>
        <div><dt>Voor nieuwe bezoekers</dt><dd>${
          kerk.contact
            ? html`${kerk.contact.naam}${kerk.contact.telefoon ? html`, <a href="tel:${kerk.contact.telefoon.replace(/\s/g, '')}">${kerk.contact.telefoon}</a>` : ''}${kerk.contact.email ? html`, <a href="mailto:${kerk.contact.email}">${kerk.contact.email}</a>` : ''}`
            : 'Contactpersoon volgt.'
        }</dd></div>
      </dl>
      <p class="kerk-links">
        ${kerk.website ? html`<a class="pijllink" href="${kerk.website}" rel="noopener">Website van de kerk<span class="sr"> ${kerk.naam}</span></a>` : ''}
        ${routeLink(kerk)}
        ${kerk.samenGaan ? html`<a class="pijllink" href="/even-praten/?kerk=${kerk.id}#samen">Samen gaan<span class="sr"> naar ${kerk.naam}</span></a>` : ''}
      </p>
    </div>
  </article>`;
}

export function kerkCompact(kerk) {
  const eerste = kerk.diensten?.[0];
  return html`<li class="kerk-kort" data-kerk="${kerk.id}">
    <a href="/kerken/#${kerk.id}">
      <span class="kerk-kort-naam">${kerk.naam}</span>
      <span class="kerk-kort-meta">${eerste?.tijd ? `${DAG[eerste.dag] || eerste.dag} ${eerste.tijd} uur` : 'Tijden volgen'}${kerk.voorbeeld ? ' · voorbeeld' : ''}</span>
      <span class="kerk-kort-sfeer">${kerk.traditie || ''}</span>
    </a>
  </li>`;
}

export function bijbeltekst(site, { klasse = '' } = {}) {
  const b = site.bijbel;
  return html`<figure class="bijbeltekst ${klasse}">
    <blockquote><p>${b.tekst}</p></blockquote>
    <figcaption>Jezus, in ${b.bron} <span class="bijbel-vertaling">(${b.vertaling}, ${b.rechten})</span></figcaption>
  </figure>`;
}

export function samenGaan({ concept }) {
  return html`<section class="samen" aria-labelledby="samen-kop">
    <div class="samen-binnen">
      <div class="samen-beeld">${boog({ briefing: 'twee mensen bij een kerkdeur, van achteren of opzij; geen poses', concept, klasse: 'boog--klein' })}</div>
      <div class="samen-tekst">
        <p class="bovenregel">Zullen we samen gaan?</p>
        <h2 id="samen-kop" class="kop-2">Vind je het spannend om alleen te komen?</h2>
        <p class="lead">Dat snappen we. Iemand van de kerk kan je bij de deur opwachten, naast je komen zitten en na afloop een kop koffie met je drinken. Je spreekt gewoon samen een zondag af.</p>
        <p><a class="knop knop--vol" href="/even-praten/#samen">Ik wil graag samen gaan</a></p>
      </div>
    </div>
  </section>`;
}

export function paginaKop({ boven, titel, lead, id = 'pagina-kop' }) {
  return html`<header class="paginakop">
    <div class="paginakop-binnen">
      ${boven ? html`<p class="bovenregel">${boven}</p>` : ''}
      <h1 class="kop-1" id="${id}">${raw(titel)}</h1>
      ${lead ? html`<p class="lead">${lead}</p>` : ''}
    </div>
    <div class="paginakop-licht" aria-hidden="true">${raw(beeldmerk({ klasse: 'beeldmerk paginakop-merk' }))}</div>
  </header>`;
}
