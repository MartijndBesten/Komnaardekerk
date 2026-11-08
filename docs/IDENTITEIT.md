# Visuele identiteit 'De open deur'

## Idee

Je loopt langs een kerk. De deur staat op een kier en er valt warm licht naar buiten, op de stoep, tot aan jouw voeten. Dat is de hele boodschap van de site in één beeld: *de deur staat open, en het licht reikt tot waar jij staat.*

- **Beeldmerk**: een rondboog (de vorm van een kerkportaal, niet van een logo-kruis), de deur op een kier, licht dat op de grond naar buiten valt. Christelijk herkenbaar door vorm en licht, zonder alles uit te leggen.
- **Woordmerk**: `kom naar de kerk` in kleine letters, Newsreader, met `HOUTEN` als ondertitel. Kleine letters: een uitnodiging, geen bevel.
- **Beweging**: op de homepage gaat de deur bij het laden langzaam open en valt het licht naar buiten (uit bij 'minder beweging').
- **Boogvorm als beeldkader**: alle foto's staan in dezelfde boog. Zo wordt elke foto een doorkijkje.

## Kleuren

| Naam | Hex | Gebruik |
|---|---|---|
| Papier | `#F5EFE4` | achtergrond |
| Zand / zand-diep | `#ECE2D0` / `#E0D1B7` | afwisselende secties |
| Inkt | `#1E2721` | tekst, knoppen, kozijn |
| Mos | `#4C5B44` | deur, bovenregels |
| Klei | `#9C4325` | accent: cursieve woorden, linkonderstreping, focus |
| Licht | `#E3A63F` / `#F0CF8C` | alleen decoratief licht (nooit voor tekst op papier) |
| Nacht | `#1B231E` | donkere secties ('Je hoeft niets', voet) |

Contrast: alle tekstkleuren halen WCAG AA op hun achtergrond (automatisch getest met axe).

## Letters

- **Newsreader** (Production Type, SIL OFL) voor koppen: redactioneel, warm, met optische maten. Alleen gewicht 400 en cursief; nadruk via cursief in klei, niet via vet.
- **Atkinson Hyperlegible Next** (Braille Institute, SIL OFL) voor tekst: ontworpen voor slechtzienden. Een bewuste keuze voor oudere bezoekers; de cijfer-nul met streep hoort daarbij.
- Beide zelf gehost en verkleind (geen verzoeken naar Google).

## Bestanden

`src/static/merk/`: `beeldmerk.svg`, `beeldmerk-licht.svg` (op donker), `beeldmerk-512.png`, `logo-liggend.png`, `deelbeeld.png` (social), `apple-touch-icon.png`, `favicon-32.png`. Alles wordt gegenereerd uit `src/lib/merk.mjs` met `npm run merk`.

## Status

Concept. Het merk is door mij ontworpen voor deze site; niet getoetst bij de kerken of bij doelgroepbezoekers.
