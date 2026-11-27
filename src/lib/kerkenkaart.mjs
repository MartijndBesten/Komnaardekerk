import { readFileSync } from 'node:fs';
import { html } from './html.mjs';

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

export function kerkenkaart(kerken) {
  const geplaatsteKerken = new Map(kerken.map((kerk) => [kerk.id, kerk]));
  const ids = kaarten.flatMap((kaart) => kaart.punten.map(([id]) => id));
  const nummers = new Map(ids.filter((id) => geplaatsteKerken.has(id)).map((id, index) => [id, index + 1]));
  if (!nummers.size) return '';
  return html`
<section class="kerkenkaart" aria-labelledby="kaart-kop">
  <h2 class="kop-2" id="kaart-kop">Kerken op de kaart</h2>
  <p>Kies een kerk om het adres en de tijden van de diensten te zien.</p>
  <div class="kerkenkaart-panelen">
    ${kaarten.map(({ id, titel, breedte, hoogte, punten }) => {
      const zichtbaar = punten.filter(([kerkId]) => nummers.has(kerkId));
      if (!zichtbaar.length) return '';
      const schaalHoogte = 100 * hoogte / breedte;
      return html`<section aria-labelledby="kaart-${id}">
        <h3 class="kop-3" id="kaart-${id}">${titel}</h3>
        <svg class="kerkenkaart-beeld" viewBox="0 0 100 ${schaalHoogte}" aria-hidden="true" focusable="false">
          <image href="/foto/kaart-${id}.webp" width="100" height="${schaalHoogte}"/>
          ${zichtbaar.map(([kerkId, x, percentageY]) => {
            const y = percentageY * schaalHoogte / 100;
            const [dx, dy] = labelVerschuiving[kerkId] || [0, 0];
            return html`<g class="kerkenkaart-punt">
              ${dx || dy ? html`<line x1="${x}" y1="${y}" x2="${x + dx}" y2="${y + dy}"/><circle cx="${x}" cy="${y}" r="0.85"/>` : ''}
              <circle cx="${x + dx}" cy="${y + dy}" r="3.15"/>
              <text x="${x + dx}" y="${y + dy}" dy=".35em">${nummers.get(kerkId)}</text>
            </g>`;
          })}
        </svg>
        <ul class="kerkenkaart-legenda">
          ${zichtbaar.map(([kerkId]) => html`<li><a href="#${kerkId}"><span class="kerkenkaart-nummer">${nummers.get(kerkId)}</span> ${geplaatsteKerken.get(kerkId).naam}</a></li>`)}
        </ul>
      </section>`;
    })}
  </div>
  <p class="klein"><a href="https://www.pdok.nl/datasets/-/article/basisregistratie-topografie-brt-achtergrondkaart" rel="noopener">Kaart: Kadaster en PDOK</a></p>
</section>`;
}
