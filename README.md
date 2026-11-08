# komnaardekerk.nl

Een open uitnodiging van de kerken in Houten. Statische website (geen framework, geen CMS, geen cookies) met één kleine Cloudflare Worker voor het contactformulier.

**Status: concept.** Kerken, tijden en contactpersonen zijn gemarkeerde voorbeelden. Niet gepubliceerd. Open punten: `../VRAGEN.md`.

## Waarom geen Next.js?

Zes inhoudspagina's die zelden veranderen, door vrijwilligers te onderhouden. Een build zonder npm-pakketten (`node scripts/build.mjs`) levert kale HTML/CSS (± 390 kB totaal, waarvan 115 kB lettertypen), heeft geen framework-updates nodig en draait overal waar Node 22 staat. Zelfde recept als bouwsteen B97 (statische site met publicatiepoort). Wordt de site groter (agenda per kerk, meerdere beheerders zonder Git), dan is een headless CMS of Next.js een logische volgende stap.

## Mappen

| Map | Inhoud |
|---|---|
| `content/` | **Hier pas je teksten en kerken aan**: `kerken.json`, `site.json`, `gevoelens.json` (zes keuzes), `vragen.json` |
| `src/pages/` | Pagina's (tekst + opbouw) |
| `src/lib/` | Layout, onderdelen, beeldmerk |
| `src/static/` | CSS, JS, lettertypen, merkbestanden |
| `worker/` | Cloudflare Worker: `/api/contact` |
| `scripts/` | `build.mjs` (bouwen + controles), `serve.mjs` (lokale server), `test-browser.mjs`, `merk.mjs` |
| `test/` | Unit-tests (formulier, publicatiepoort met mutaties) |
| `dist/` | Gegenereerde site. Nooit met de hand wijzigen; altijd samen met `src/`/`content/` committen |
| `docs/` | Identiteit en fotografiebriefing |

## Een kerk toevoegen of wijzigen

1. Open `content/kerken.json` en kopieer een blok. Zet `"voorbeeld": false`.
2. Vul alleen in wat de kerk zelf heeft aangeleverd en waarvoor toestemming is. Onbekend = `null`.
3. `node scripts/build.mjs` → de build weigert bijvoorbeeld een tijd als `10 uur` (moet `10:00`), dubbele id's of het woord 'voorbeeld' bij een echte kerk.
4. Kijk lokaal: `node scripts/serve.mjs` → http://localhost:8787

## Controles en tests

```bash
npm install                       # alleen axe-core voor de toegankelijkheidstest
node scripts/build.mjs --check    # dist/ actueel + controles (links, ankers, aria, CSP, verboden tekst)
node --test test/*.test.mjs       # formulierlogica, Worker, publicatiepoort + 9 mutaties
node scripts/test-browser.mjs     # eindgebruikerstests in Chromium (Playwright), axe, 320–1440 px
npm run poort                     # publicatiepoort: weigert zolang er conceptinhoud is
```

De browsertest schrijft schermafbeeldingen naar `test-resultaten/` (niet in Git). Tegen een live site: `TEST_BASE_URL=https://komnaardekerk.nl node scripts/test-browser.mjs`.

## Contactformulier aanzetten

Het formulier heeft drie standen in `content/site.json` → `contact.status`:

- `voorbeeld` (nu): formulier zichtbaar, verstuurt niets, zegt dat ook eerlijk.
- `uit`: geen formulier, alleen verwijzing naar de kerken.
- `aan`: verstuurt naar `/api/contact`.

Aan zetten alleen als de opvolging geregeld is (VRAGEN V-004), daarna:

1. Cloudflare Email Routing aan op het domein, bestemmingsadres van de coördinator verifiëren.
2. In `wrangler.jsonc`: `send_email`-binding `MAIL` met dat adres, `MAIL_VAN`, `MAIL_AAN`, `CONTACT_AAN: "ja"` en de `ratelimits`-binding.
3. `contact.status` op `aan`, privacyverklaring aanvullen (verantwoordelijke, bewaartermijn).

De Worker is fail-closed: zonder `CONTACT_AAN=ja` én mailconfiguratie geeft hij 503. Er wordt niets opgeslagen of gelogd behalve een fout-id.

## Uitrollen (nog niet gedaan)

Doel: Cloudflare Workers met static assets (`wrangler.jsonc`). Vanuit een Claude Code-cloudsessie kunnen statische assets niet worden geüpload (bouwsteen B99): uitrollen lokaal met `npx wrangler deploy` of via Workers Builds gekoppeld aan de repository. Vóór livegang: `npm run poort` moet slagen, daarna de browsertest tegen het echte domein. Op `*.workers.dev` staat `X-Robots-Tag: noindex`; in conceptmodus staat de hele site op noindex (via `_headers`, niet in de HTML).

## Privacy en beveiliging

- Geen cookies, geen localStorage, geen analytics, geen externe verzoeken (getest).
- Lettertypen zelf gehost. Strikte CSP zonder inline scripts of stijlen (door de build bewaakt).
- Contactverzoek = mogelijk bijzonder persoonsgegeven (belangstelling voor geloof): uitdrukkelijke toestemming, minimale velden, geen opslag op de site.

## Licenties

Newsreader en Atkinson Hyperlegible Next: SIL Open Font License 1.1 (zie `src/static/fonts/`), verkleind tot Latijnse tekens en vaste gewichten.
