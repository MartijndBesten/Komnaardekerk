import { esc, render } from './html.mjs';
import { beeldmerk, woordmerkHtml } from './merk.mjs';

export const NAVIGATIE = [
  { pad: '/voor-het-eerst/', tekst: 'Voor het eerst' },
  { pad: '/kerken/', tekst: 'Kerken in Houten' },
  { pad: '/geloof/', tekst: 'Wat geloof je eigenlijk?' },
  { pad: '/even-praten/', tekst: 'Even praten?' },
  { pad: '/over/', tekst: 'Over' }
];

function navLinks(pad, klasse) {
  return NAVIGATIE.map((n) => {
    const actief = pad === n.pad || (n.pad !== '/' && pad.startsWith(n.pad));
    return `<li><a class="${klasse}" href="${n.pad}"${actief ? ' aria-current="page"' : ''}>${esc(n.tekst)}</a></li>`;
  }).join('');
}

export function layout(ctx, pagina, inhoud) {
  const { site, pad, versie } = ctx;
  const titel = pagina.titel ? `${pagina.titel} · ${site.naam}` : `${site.naam} · Een open uitnodiging van de kerken in ${site.plaats}`;
  const omschrijving = pagina.omschrijving || site.omschrijving;
  const canonical = site.domein + pad;
  const concept = site.modus !== 'productie';
  const jsonld = pagina.jsonld
    ? `<script type="application/ld+json">${JSON.stringify(pagina.jsonld).replace(/</g, '\\u003c')}</script>`
    : '';
  const thema = pagina.thema ? ` data-thema="${esc(pagina.thema)}"` : '';

  return `<!doctype html>
<html lang="nl" class="geen-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titel)}</title>
<meta name="description" content="${esc(omschrijving)}">
${pagina.bestand === '404.html' ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${esc(canonical)}">`}
<meta name="theme-color" content="#F5EFE4">
<meta property="og:type" content="website">
<meta property="og:locale" content="nl_NL">
<meta property="og:site_name" content="${esc(site.naam)}">
<meta property="og:title" content="${esc(pagina.titel || 'Er is plek voor jou.')}">
<meta property="og:description" content="${esc(omschrijving)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(site.domein)}/merk/deelbeeld.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Kom naar de kerk: een open deur met licht dat naar buiten valt. Er is plek voor jou.">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/merk/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/merk/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/fonts/newsreader-opsz-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/atkinson-next.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/site.css?v=${versie.css}">
<script src="/js/site.js?v=${versie.js}" defer></script>
${jsonld}
</head>
<body${thema}>
<a class="overslaan" href="#inhoud">Naar de inhoud</a>
<header class="kop">
  ${concept ? `<p class="conceptbalk"><strong>Concept</strong> · Deze site is nog niet gepubliceerd. Kerken, tijden en contactgegevens zijn voorbeelden.</p>` : ''}
  <div class="kop-binnen">
    <a class="merk-link" href="/" aria-label="${esc(site.naam)}, naar de startpagina">${beeldmerk({ klasse: 'beeldmerk kop-beeldmerk' })}${woordmerkHtml()}</a>
    <nav class="hoofdnav" aria-label="Hoofdmenu">
      <button class="menuknop" type="button" aria-expanded="false" aria-controls="hoofdmenu"><span class="menuknop-tekst">Menu</span><span class="menuknop-streepjes" aria-hidden="true"></span></button>
      <ul id="hoofdmenu" class="hoofdmenu">${navLinks(pad, 'hoofdmenu-link')}</ul>
    </nav>
  </div>
</header>
<main id="inhoud" tabindex="-1">
${render(inhoud)}
</main>
<footer class="voet">
  <div class="voet-binnen">
    <div class="voet-merk">
      ${beeldmerk({ klasse: 'beeldmerk voet-beeldmerk' })}
      <p class="voet-zin">Een gezamenlijke uitnodiging van christelijke kerken in ${esc(site.plaats)}.</p>
      <p class="voet-klein">Geen cookies. Geen tracking. Je hoeft je nergens voor aan te melden.</p>
    </div>
    <nav class="voet-nav" aria-label="Onderaan de pagina">
      <ul>
        <li><a href="/">Home</a></li>
        ${navLinks(pad, '')}
        <li><a href="/privacy/">Privacy</a></li>
      </ul>
    </nav>
  </div>
  <p class="voet-onder">${concept ? 'Conceptversie · ' : ''}komnaardekerk.nl</p>
</footer>
</body>
</html>
`;
}
