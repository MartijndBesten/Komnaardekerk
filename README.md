# Kom naar de kerk.

Een informatief overzicht van kerken en kerkelijke activiteiten in Houten en omgeving. De bestaande preview staat op **https://komnaardekerk.martijndenbesten.com** (noindex). Het beoogde hoofddomein is **komnaardekerk.nu**.

## Inhoud beheren (zonder code)

| Bestand | Wat |
|---|---|
| `content/kerken.json` | kerken: gegevens, diensten, kenmerken, **deelnamestatus**, bronnen, controledatum, foto |
| `content/initiatieven.json` | missionaire activiteiten; `groep` bepaalt of en waar ze op de site komen |
| `content/geloofsbasis.json` | gezamenlijke geloofstekst (status `concept` tot vastgesteld) |
| `content/fotos.json` | foto's met maker, licentie, bron en uitsnede |
| `content/site.json` | algemene instellingen, Bijbeltekst, contactformulier, hulplijnen |
| `content/woorden.json`, `content/vragen.json` | de woorden op de homepage (‘Wat houdt je bezig?’), met Bijbelgedachte en vervolgstappen; praktische vragen |

In modus `overzicht` staan gecontroleerde openbare bezoekgegevens zonder deelnamelabel. Modus `productie` toont deelnemers met toestemming en heeft een aparte publicatiepoort. Zie [de wekelijkse broncontrole](docs/MONITORING.md) voor de verwerking van agenda’s en de uitrol.

## Mappen

| Map | Inhoud |
|---|---|
| `src/pages/` | pagina's: home, waarom-naar-de-kerk, voor-het-eerst, kerken, ontdek-het-geloof, activiteiten, samen-naar-de-kerk, over-ons, privacy, ontwerp (alleen concept) |
| `src/lib/` | layout, onderdelen, `logo.mjs` (het merk ‘Het raakpunt’: alle versies als SVG uit code) |
| `src/static/` | CSS, JS, lettertypen, foto's (webp), merk (`merk/logo/`, `merk/concepten/`, `merk/denckh/`) |
| `merk/bron/` | woordmerk als letterpaden (gemaakt met `scripts/merk_paden.py`) |
| `ontwerp/`, `ontwerpen/`, `voorstellen/` | ontwerprondes 4–12 (voorstellen en logoverkenning); het definitieve logo staat in `src/lib/logo.mjs` |
| `fotos/bron/` | originele foto's (Wikimedia Commons, CC BY-SA) |
| `worker/` | Cloudflare Worker: `/api/contact` (fail-closed), bundel-Worker voor de preview |
| `scripts/` | build, merk, fotos, overzicht, bundel, uitrol-preview, serve, test-browser, controleer-links |
| `docs/` | LOGO (definitief merk), MERK (geschiedenis), FOTOGRAFIE, GELOOFSBASIS, KERKEN-OVERZICHT, INITIATIEVEN, KERKEN-UITNODIGEN, LANCERING, onderzoek/ |
| `dist/` | gegenereerde site; nooit met de hand wijzigen, altijd mee committen |

## Bouwen en testen

```bash
npm install                              # alleen axe-core (toegankelijkheidstest)
node scripts/build.mjs                   # bouwen + controles
node scripts/build.mjs --check           # dist/ actueel? (CI/poort)
npm run poort                            # productiepoort: weigert zolang er conceptinhoud is
node --test test/*.test.mjs              # formulier, Worker, headers, publicatiepoort en agenda
node scripts/test-browser.mjs            # eindgebruikersscenario's in Chromium en axe, 320–1440 px
node scripts/controleer-links.mjs        # externe links
```

Merk en foto's opnieuw maken: `node scripts/merk.mjs` (Playwright), `python3 scripts/fotos.py` (Pillow), woordmerkpaden `python3 scripts/merk_paden.py` (fonttools, uharfbuzz).

## Preview bijwerken

```bash
node scripts/bundel.mjs                                  # dist/ + Worker → één script (geen static-assets-upload nodig)
TEST_BUNDEL=1 node scripts/test-browser.mjs              # zelfde suite tegen de bundel
node scripts/uitrol-preview.mjs komnaardekerk.martijndenbesten.com
TEST_BASE_URL=https://komnaardekerk.martijndenbesten.com node scripts/test-browser.mjs
```

Het subdomein hangt aan de Worker `komnaardekerk-preview`. Bijwerken wijzigt alleen het script, geen DNS. Het script stopt als het domein aan een andere Worker hangt en bewaart de vorige versie (`.uitrol/vorige-versie.multipart`). HTML krijgt `Cache-Control: no-transform`, zodat Cloudflare op deze zone geen Web Analytics inspuit.

## Contactformulier

Drie standen in `content/site.json` → `contact.status`: `voorbeeld` (interne demonstratie), `uit` (actuele instelling), `aan`. Pas aanzetten als er een verantwoordelijke organisatie is en de opvolging geregeld is (VRAGEN V-002, V-004); daarna Email Routing + `send_email`-binding, `CONTACT_AAN=ja` en een rate-limit (`wrangler.jsonc`). De Worker is fail-closed.

## Rechten

- Lettertypen Newsreader en Atkinson Hyperlegible Next: SIL OFL 1.1.
- Foto's: Wikimedia Commons, CC BY-SA 4.0; naamsvermelding bij elke foto.
- Bijbeltekst: Mattheüs 11:28 in eigen woorden, met verwijzing naar debijbel.nl. Het letterlijke NBV21-citaat is voorbereid met bron- en rechtenvermelding. Toestemming voor de formele lancering blijft open in VRAGEN V-003.
- Denckh-signatuurlogo: officieel bestand uit `MartijndBesten/denckh`, byte-identiek (hash in de build).
