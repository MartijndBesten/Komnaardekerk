# Claude Code-instructies — Kom naar de kerk.

Website van **Kom naar de kerk.**: een uitnodiging van christenen uit Houten, Schalkwijk en ’t Goy om Jezus en de kerk te leren kennen. Beoogd domein: komnaardekerk.nu. Preview: https://komnaardekerk.martijndenbesten.com.

Tot 15 november 2026 stond dit project in de map `komnaardekerk/` van `MartijndBesten/martijn-ai-workbench`. De algemene werkafspraken van Martijn blijven gelden; die staan op `main` van die repository (`CLAUDE.md`, `werkwijze/`, `bibliotheek/BOUWSTENEN.md`).

## Bij elke opdracht

1. Lees `PROJECT.md`, daarna `HANDOFF.md`, daarna `VRAGEN.md`. Verwerk vragen met status `beantwoord` en zet ze op `verwerkt`.
2. Voer alleen de gevraagde opdracht uit. Een vraag of besluit van Martijn nodig? Voeg een genummerde vraag toe aan `VRAGEN.md` en verwijs ernaar in `HANDOFF.md`.
3. Werk na afloop `HANDOFF.md` bij: status, datum, wat gedaan is, gewijzigde bestanden, open vragen, volgende stap.
4. Controleer de diff op secrets en persoonsgegevens. Commit met expliciete bestandsselectie en push.

## Vaste afspraken voor deze site

- Verzin nooit gegevens. Kerkgegevens (tijden, adressen, contact) alleen van de eigen website van de kerk, met bron en controledatum in `content/kerken.json`.
- Noem een kerk nooit partner of deelnemer zonder haar toestemming. Publiceer geen geloofsinstemming namens een kerk.
- Geen cookies, geen tracking, geen opslag van keuzes of gevoelens van bezoekers.
- De site is nooit een vervanging voor professionele hulp; verwijs bij zware onderwerpen naar huisarts of hulplijn.
- Geen verzonnen foto’s of AI-personen als echte bezoekers. Foto’s van herkenbare mensen alleen met hun toestemming.
- Bijbeltekst Mattheüs 11:28 staat vast op de homepage (NBV21, letterlijk, met copyrightvermelding en ‘lees verder op debijbel.nl’). Vóór de lancering: toestemming van het NBG.
- Teksten in helder Nederlands, maximaal B2.
- Denckh alleen als bescheiden makervermelding onderaan, met het officiële signatuurlogo (hash wordt in de build gecontroleerd). Nooit in het logo.
- Geen kosten, domeinregistraties, DNS-wijzigingen of externe toezeggingen zonder akkoord van Martijn. De preview pas bijwerken als Martijn daarom vraagt.

## Bouwen, testen en uitrollen

```bash
npm ci                                   # alleen axe-core (voor de browsertests)
node scripts/build.mjs                   # content + src -> dist/
node scripts/build.mjs --check           # controles; dist/ moet actueel zijn
node --test test/*.test.mjs              # unit
node scripts/test-browser.mjs            # eindgebruikersscenario's in Chromium (mobiel en desktop, axe)
node scripts/bundel.mjs                  # Worker-bundel in .uitrol/
node scripts/uitrol-preview.mjs komnaardekerk.martijndenbesten.com   # alleen op verzoek van Martijn
TEST_BASE_URL=https://komnaardekerk.martijndenbesten.com node scripts/test-browser.mjs   # livecontrole
```

Test als eindgebruiker (zie de teststraat in de workbench): echte scenario’s, mobiel en desktop, en rapporteer eerlijk wat niet getest is. `dist/` staat in git; commit het na elke build.
