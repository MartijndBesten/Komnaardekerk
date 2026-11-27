import { readFileSync } from 'node:fs';
import { html, raw } from './html.mjs';
import { dienstenKort } from './onderdelen.mjs';

const kaarten = JSON.parse(readFileSync(new URL('./kerkenkaart-data.json', import.meta.url), 'utf8'));

// Kleine verschuivingen geven dicht bij elkaar gelegen adressen elk een leesbaar nummer.
const labelVerschuiving = {
  pleinkerk: [-4, -3],
  'olv-houten': [3, 3],
  opstandingskerk: [-2, -2],
  'evangelie-gemeente-houten': [1, 2]
};

export function heeftKaartpunten(kerken) {
  return kerken.some((kerk) => kaarten.some((kaart) => kaart.punten.some(([id]) => id === kerk.id)));
}

// Vaste nummers per kerk (volgorde van de kaartgegevens), zodat kaart, lijst en kaartjes hetzelfde nummer tonen.
export function kaartNummers(kerken) {
  const ids = new Set(kerken.map((k) => k.id));
  const volgorde = kaarten.flatMap((kaart) => kaart.punten.map(([id]) => id)).filter((id) => ids.has(id));
  return new Map(volgorde.map((id, index) => [id, index + 1]));
}

// De kaart. Elk punt is een link naar de pagina van die kerk (/kerken/<id>/).
// legenda: true toont onder elke kaart de genummerde namen (homepage); op /kerken/ dragen de kaartjes het nummer.
// Geen gebruiksaanwijzing bij de kaart (besluit Martijn 27-11: dat begrijpt iedereen). kop: null = geen zichtbare kop.
export function kerkenkaart(kerken, { legenda = true, kop = null, kopNiveau = 2 } = {}) {
  const geplaatsteKerken = new Map(kerken.map((kerk) => [kerk.id, kerk]));
  const nummers = kaartNummers(kerken);
  if (!nummers.size) return '';
  const k = (n, attrs, inhoud) => `<h${n} ${attrs}>${inhoud}</h${n}>`;
  return html`
<section class="kerkenkaart" id="kaart" ${raw(kop ? 'aria-labelledby="kaart-kop"' : 'aria-label="Kaart met de kerken"')}>
  ${kop ? raw(k(kopNiveau, `class="kop-${kopNiveau}" id="kaart-kop"`, kop)) : ''}
  <div class="kerkenkaart-panelen">
    ${kaarten.map(({ id, titel, breedte, hoogte, punten }) => {
      const zichtbaar = punten.filter(([kerkId]) => nummers.has(kerkId));
      if (!zichtbaar.length) return '';
      const schaalHoogte = 100 * hoogte / breedte;
      return html`<section class="kerkenkaart-paneel" aria-labelledby="kaart-${id}">
        ${raw(k(kopNiveau + 1, `class="kop-3" id="kaart-${id}"`, titel))}
        <svg class="kerkenkaart-beeld" viewBox="0 0 100 ${schaalHoogte}" role="group" aria-label="Kaart van ${titel} met de kerken">
          <image href="/foto/kaart-${id}.webp" width="100" height="${schaalHoogte}"/>
          ${zichtbaar.map(([kerkId, x, percentageY]) => {
            const y = percentageY * schaalHoogte / 100;
            const [dx, dy] = labelVerschuiving[kerkId] || [0, 0];
            const kerk = geplaatsteKerken.get(kerkId);
            return html`<a class="kerkenkaart-punt" href="/kerken/${kerkId}/" aria-label="${nummers.get(kerkId)}. ${kerk.naam}">
              ${dx || dy ? html`<line x1="${x}" y1="${y}" x2="${x + dx}" y2="${y + dy}"/><circle cx="${x}" cy="${y}" r="0.85"/>` : ''}
              <circle class="kerkenkaart-stip" cx="${x + dx}" cy="${y + dy}" r="3.7"/>
              <text x="${x + dx}" y="${y + dy}" dy=".35em" aria-hidden="true">${nummers.get(kerkId)}</text>
            </a>`;
          })}
        </svg>
        ${legenda
          ? html`<ul class="kerkenkaart-legenda">
          ${zichtbaar.map(([kerkId]) => html`<li><a href="/kerken/${kerkId}/"><span class="kerkenkaart-nummer" aria-hidden="true">${nummers.get(kerkId)}</span> <span class="kerkenkaart-naam">${geplaatsteKerken.get(kerkId).naam}<span class="kerkenkaart-tijd">${dienstenKort(geplaatsteKerken.get(kerkId))}</span></span></a></li>`)}
        </ul>`
          : ''}
      </section>`;
    })}
  </div>
  <p class="klein"><a href="https://www.pdok.nl/datasets/-/article/basisregistratie-topografie-brt-achtergrondkaart" rel="noopener">Kaart: Kadaster en PDOK</a></p>
</section>`;
}

