import { html } from '../lib/html.mjs';
import { paginaKop } from '../lib/onderdelen.mjs';

export const pagina = {
  pad: '/over-ons/',
  titel: 'Over deze site',
  omschrijving: 'Waarom Kom naar de kerk. bestaat en waar de informatie op de site vandaan komt.'
};

export function inhoud({ fotos }) {
  return html`
${paginaKop({
  boven: 'Over deze site',
  titel: 'Makkelijker een kerk <em>binnenlopen</em>.',
  lead: 'Kom naar de kerk. helpt je een kerk in Houten of een dorp in de buurt te vinden. Je leest hier ook over Jezus en het christelijk geloof.',
  beeld: fotos.toren
})}

<section class="tekstpagina" aria-labelledby="status">
  <div class="tekstpagina-binnen">
    <h2 class="kop-2" id="status">Waar komt de informatie vandaan?</h2>
    <p>We gebruiken openbare informatie van de kerken zelf. Bij elk adres en elke activiteit staat een link naar de bron. Voor wijzigingen en vragen kun je terecht op de website van de kerk.</p>
  </div>
</section>
`;
}
