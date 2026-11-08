import { html } from '../lib/html.mjs';
import { paginaKop, hulplijnen } from '../lib/onderdelen.mjs';

// Kleine pagina's: bevestiging na het formulier zonder JavaScript, foutpagina, 404.

export const bedankt = {
  pagina: { pad: '/samen-naar-de-kerk/bedankt/', titel: 'Dank je wel', omschrijving: 'Je bericht is verstuurd.', sitemap: false },
  inhoud: (ctx) => html`
${paginaKop({ boven: 'Verstuurd', titel: 'Dank je <em>wel.</em>', lead: `Je bericht is aangekomen. Iemand neemt ${ctx.site.contact.reactietermijn} persoonlijk contact met je op.` })}
<section class="tekstpagina"><div class="tekstpagina-binnen">
  <p>Ondertussen kun je alvast lezen <a href="/voor-het-eerst/">hoe een kerkdienst gaat</a>, of <a href="/kerken/">de kerken bekijken</a>.</p>
</div></section>`
};

export const nietGelukt = {
  pagina: { pad: '/samen-naar-de-kerk/niet-gelukt/', titel: 'Niet gelukt', omschrijving: 'Je bericht kon niet worden verstuurd.', sitemap: false },
  inhoud: (ctx) => html`
${paginaKop({ boven: 'Niet gelukt', titel: 'Dat ging helaas <em>mis.</em>', lead: 'Je bericht is niet verstuurd. Misschien ontbrak er iets, of was er een storing.' })}
<section class="tekstpagina"><div class="tekstpagina-binnen">
  <p><a class="knop knop--vol" href="/samen-naar-de-kerk/">Probeer het opnieuw</a></p>
  <p>Lukt het niet? Neem dan rechtstreeks contact op met een van de <a href="/kerken/">kerken</a>.</p>
  ${hulplijnen(ctx.site)}
</div></section>`
};

export const nietGevonden = {
  pagina: { pad: '/404.html', titel: 'Pagina niet gevonden', omschrijving: 'Deze pagina bestaat niet (meer).', sitemap: false, bestand: '404.html' },
  inhoud: () => html`
${paginaKop({ boven: 'Niet gevonden', titel: 'Deze deur zit <em>dicht.</em>', lead: 'De pagina die je zoekt bestaat niet (meer). De andere deuren staan wel open.' })}
<section class="tekstpagina"><div class="tekstpagina-binnen">
  <p><a class="knop knop--vol" href="/">Naar de startpagina</a> <a class="knop" href="/kerken/">Kerken in Houten</a></p>
</div></section>`
};
