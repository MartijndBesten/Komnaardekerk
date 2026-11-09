# Ontwerp ‘Open deur’ (ronde 6): logo en website

> **Vervangen door ronde 7, ‘Ontmoeting’: zie `ONTWERP-ONTMOETING.md`.** Pagina’s, teksten en ‘Na bevestiging’ hieronder gelden nog.

Status: **uitgewerkt voorstel, wacht op bevestiging (VRAGEN V-016).** Live preview, `src/`, `content/` en `dist/` zijn ongewijzigd.
Presentatie (privé): https://claude.ai/artifact/Sgpu5aAttrnsBmJbMF2zx4
Spandoeken vallen buiten deze opdracht (worden door iemand anders gemaakt).

## Keuze

Combinatie van ontwerp B (smalle, zware letter Archivo; het kruis) en ontwerp A (kerkportaal, echt daglicht in foto’s). C valt af (symbool leest als M, te subtiel christelijk, vraagt foto’s van mensen die er nog niet zijn).

## Merk (`ontwerp/merk.mjs`)

- Beeldmerk: gotisch portaal met een terugwijkende boog; de deuren staan open; binnen, in het licht, het kruis. Vlak, één kleur, positief en negatief, detailniveaus groot / midden / klein (favicon).
- Afgevallen en gedocumenteerd: ‘Kruisdeur’ en ‘Open deur’ met rondboog — een ronde boog met een kruis leest klein als grafsteen.
- Woordmerk: ‘Kom naar de kerk.’ in Archivo 800 (breedte 76), woord voor woord gezet met ruimere woordafstand; punt in baksteenrood.
- Kleuren: kalk #F4F1EB, inkt #16212B, leisteen #2C4A66, baksteen #9C4430, daglicht #EFE6D6, hemel #DCE6EF. Geen geel.
- Letters: Archivo (koppen, woorden), Newsreader cursief (de warme stem, Bijbelteksten), Atkinson Hyperlegible Next (lopende tekst). Allemaal SIL OFL.

## Website (`ontwerp/`)

| Pagina | Inhoud |
|---|---|
| `/` | hero met rustig wisselend woord + foto in spitsboog; ‘In het kort’ (wat is dit, voor wie, wat vind je, waar kun je heen); 11 woorden met paneel (herkenning, hoop + Bijbeltekst, drie stappen, hulp); Wie is Jezus?; Wat gebeurt er in de kerk?; kerken |
| `/<woord>/` | elk woord als eigen pagina (spandoekadres, werkt zonder JavaScript) |
| `/wie-is-jezus/` | goed nieuws in vijf stappen, de Bijbel, wat christenen samen geloven (Apostolische Geloofsbelijdenis; geen akkoord van kerken geclaimd), Alpha of een kerkdienst |
| `/de-eerste-keer/` | stap voor stap, protestants/evangelisch en katholiek (tabbladen), vragen, kerkwoorden |
| `/kerken/` | 11 kerken, eerstvolgende dienst, route, agenda, filters op feiten |
| `/over/` | status (ontwerp, geen deelnemers), geloof, privacy, hulp, makers |

Animaties: woord vervaagt en schuift (0,7 s), hero-foto komt zacht in beeld, boog wordt getekend, blokken verschijnen bij scrollen. Alles uit bij ‘minder beweging’ en zonder JavaScript zichtbaar.

```bash
python3 ontwerp/fotos.py                 # uitsneden uit ontwerp/foto/bron (Commons, CC BY-SA 4.0)
node ontwerp/bouw.mjs && node ontwerp/serve.mjs 8794
node ontwerp/test.mjs                    # 15/15
```

## Foto’s en rechten

Zie `ontwerp/foto/BRONNEN.md`. Alles Wikimedia Commons, CC BY-SA 4.0, met maker; geen herkenbare personen. Open: fotograaf van de RCE-interieurfoto controleren; eigen kleurenfoto’s binnen met daglicht (V-015).

## Na bevestiging

Ontwerp overzetten naar `src/` en `content/` (woorden → `content/`, merk → `scripts/merk.mjs`/`src/static/merk/`, CSS/JS → `src/static/`), bestaande 19 unit- en 32 browsertests aanpassen en uitbreiden met de scenario’s uit `ontwerp/test.mjs`, CSP controleren (mask-image en fonts zijn eigen bestanden), bundelen en de preview vervangen.
