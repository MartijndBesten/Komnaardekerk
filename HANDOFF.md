# HANDOFF

status: verhuisd naar de eigen repository MartijndBesten/komnaardekerk (15-11-2026); preview live op commit 8182ecb7 (workbench), livecontrole 32/32 groen
next_actor: martijn
updated: 2026-11-15 (Claude Code-cloudsessie, verhuizing naar eigen repository)

## Verhuizing (2026-11-15): eigen repository

**Vraag Martijn:** de website los van de workbench, in een eigen repository (‘Komnaardekerk repo is er’).

**Gedaan:**
- `MartijndBesten/komnaardekerk` gevuld met de volledige geschiedenis van de map `komnaardekerk/` uit de workbench (`git subtree split`, 29 commits, ongeveer 23 MB). De bestanden staan nu in de root; paden in de oudere rondes hieronder die met `komnaardekerk/` beginnen, gelden dus zonder dat voorvoegsel.
- `PROJECT.md`, `HANDOFF.md` en `VRAGEN.md` meegenomen (stonden in de root van de workbench-branch), plus een eigen `CLAUDE.md` met de werkafspraken voor deze repository.
- Vanuit deze repository gecontroleerd: `npm ci`, build en `--check` groen, unit 19/19, browser 35/35, Worker-bundel gemaakt. Niet opnieuw uitgerold: de live preview (`8182ecb7` uit de workbench) heeft dezelfde inhoud.

**Workbench:** de branch `claude/kom-naar-kerk-website-e9e7sq` blijft staan als archief, met een verwijzing naar deze repository. `PROJECTS.md` op de workbench wordt alleen door ChatGPT bijgewerkt; de nieuwe plek moet daar nog worden vastgelegd.

**Volgende stap:** Martijn: open vragen in `VRAGEN.md` (V-019 foto’s; toestemming NBG vóór de lancering). Een volgende uitrol gebeurt vanuit deze repository.

## Ronde 16 (2026-11-15): geloveninhouten.nl bekeken

**Vraag Martijn:** ‘Dit is die andere website, kijk wat hierop staat of je er iets van kunt gebruiken. Ik heb toestemming.’

**Wat er staat (WordPress/Elementor, gepubliceerd 29-08-2025, laatst gewijzigd 24-09-2026):** één pagina met 6 kerken (Sionkerk, Opstandingskerk, EGH, De Lichtboog, Eskol-kerk, Het Kruispunt): diensttijden, adres, link naar website en livestream, per kerk een foto; een flyer ‘Activiteitenmarkt 5 september Het Rond — Geloof, Hoop en Liefde — bezoek de stand van de Houtense kerken — gratis Bijbel’; contactadres missionair@hervormdhouten.nl. Verder alleen de standaardpost ‘Hallo wereld’.

**Vergelijking:** alle zes kerken staan al op onze site, met dezelfde adressen en livestreams. Onze tijden zijn vollediger en actueler; bij Eskol staat daar ‘10.00 en 17.00’, terwijl het eigen rooster een wisselende tweede dienst toont (zie ronde 15). Pleinkerk, de drie RK-kerken en De Rivier ontbreken daar.

**Bruikbaar:** vooral de 6 foto’s (echte mensen in echte kerken; precies wat ontbreekt, V-015). Niet overgenomen: wacht op V-019 (toestemming van de mensen op de foto’s en de fotografen, kinderen, kwaliteit). Niets aan de site gewijzigd.

**Antwoord Martijn (15-11):** geloveninhouten.nl gaat offline; de vraag over de verhouding tussen de sites vervalt. **Open:** V-019 vraag 1 (toestemming foto’s). De foto’s zijn niet in de repository opgeslagen. **Volgende stap:** wil Martijn de foto’s gebruiken, dan de originelen bij de kerken opvragen (met toestemming van de mensen erop) voordat de site verdwijnt.

**Aanvulling 15-11 (vraag Martijn: van wie is geloofinhouten.nl, die is gehackt):** twee verschillende domeinen.
- geloofinhouten.nl: geregistreerd op 18-06-2026 bij Dynadot LLC (VS), houder afgeschermd (‘REDACTED FOR PRIVACY’), achter Cloudflare; stuurt elke bezoeker door naar `kpk-gg.id` (waarschijnlijk een spamsite; niet bezocht). Niet gehackt maar door een onbekende geregistreerd. Route: misbruikmelding bij Dynadot, Cloudflare en SIDN.
- geloveninhouten.nl: geregistreerd op 18-07-2025 via Hostnet B.V., houder afgeschermd; bij de controle van 15-11 geen tekenen van een hack in de pagina. Het contactadres op de site is missionair@hervormdhouten.nl; offline halen kan de houder via zijn Hostnet-account.
- Bron: SIDN-RDAP (rdap.sidn.nl), 15-11-2026. Netwerk van de cloudomgeving ‘Raadkoord’ uitgebreid met rdap.sidn.nl en (www.)geloofinhouten.nl (met akkoord); web.archive.org is geweigerd, dus de geschiedenis van geloofinhouten.nl vóór juni 2026 is niet bekeken.

**Verwijzing naar Bijbelreis en Raadkoord (vraag Martijn, 15-11):** onderaan elke pagina een blok ‘Ook ontdekken’ met Bijbelreis (bijbelreis.nl, atlas voor kinderen en ouders) en Raadkoord (raadkoord.nl, samen christelijke liederen raden); gegevens in `content/site.json` (`verwant`). Alleen links, geen samenwerking of gegevensuitwisseling. Nieuw browserscenario; 35/35 groen, 19/19 unit. **Live gezet** op 15-11 na ‘Zet live’ van Martijn: `/versie.json` meldt `8182ecb7` (schoon), livecontrole 32/32 groen, beide links aanwezig. Herstelpunt `.uitrol/vorige-versie.multipart`. Toelichting: ‘Raadkoord’ is ook de naam van de cloudomgeving van deze sessie (netwerkinstellingen); dat heeft niets met de website Raadkoord te maken. Netwerk uitgebreid met (www.)bijbelreis.nl (met akkoord) om de site te kunnen lezen.

## Ronde 15 (2026-11-14): alle kerkdiensten en Mattheüs 11:28

**Opdracht Martijn:** alle reguliere diensten tonen (niet alleen de ochtenddienst), onderscheid tussen vaste, maandelijkse/bijzondere en wisselende diensten, alleen bevestigde gegevens; Mattheüs 11:28 behouden op een zichtbare plek op de homepage, als gemarkeerde parafrase tot vertaling en rechten rond zijn; daarna: eigen repository.

**Kerkdiensten**
- `content/kerken.json`: elke dienst heeft nu `naam`, `toelichting`, `soort` (`regulier` | `wisselend` | `bijzonder`); `omschrijving` en `agenda` zijn vervallen (geen dubbele gegevens: de agendaknop volgt uit `soort`). Nieuw per kerk: `rooster.url` (actuele agenda) waar die afwijkt van de website. De build controleert soort, naam en dubbele diensten.
- Kerkenpagina: per kerk drie groepen (‘Elke week’, ‘Wisselende tijden’, ‘Maandelijks of bijzonder’) en altijd de regel ‘Tijden kunnen afwijken … Bekijk de actuele agenda’. Homepage: per kerk alle vaste zondagsdiensten (‘Zondag 09.30 en 16.15 uur’). Er zijn geen aparte pagina’s per kerk; elke kerk is een blok op `/kerken/`.
- Alle 11 kerken op 14-11-2026 op de eigen website gecontroleerd (bronnen per kerk in `kerken.json`, eerste bron = de pagina met de diensttijden). Bevestigd zonder wijziging: Sionkerk (9.30 en 16.15), Opstandingskerk, De Lichtboog (9.30 en 11.30), Het Kruispunt (10.00 en 16.30), EGH, De Rivier, Schalkwijk, ’t Goy.
- Gecorrigeerd: **Eskol-kerk** (tweede dienst stond vast op 17.00 uur; het rooster laat elke zondag een tweede dienst op wisselende tijd zien, 16.00 tot 19.00 uur → `wisselend`, kenmerk ‘middag’ toegevoegd); **O.L.V. Houten** (dinsdag 19.00 uur is niet wekelijks → `wisselend`; meditatieve viering = tweede zaterdag van de maand; Taizégebed woensdag 18.45 uur toegevoegd, niet wekelijks); **Pleinkerk** (‘soms 9.30 uur’ geschrapt: staat niet meer op de site); **Opstandingskerk** (verlopen datum bij de peuterviering weg; vesper op woensdag 19.30 uur in advent en Veertigdagentijd toegevoegd); **De Rivier** (gebedsavond is wekelijks, zonder tijd op de site).
- Niet bevestigd, dus niet opgenomen: zomertijd De Lichtboog (site spreekt zichzelf tegen: 10.00 of 10.30 uur); ‘in de regel 17.00 uur’ bij Eskol (bij eigen controle niet teruggevonden).

**Mattheüs 11:28**
- Eigen sectie direct onder de opening van de homepage (`section.uitnodiging`), groot en rustig, met het beeldmerk erboven. Ook nog op ‘Waarom naar de kerk?’ en ‘Het geloof’.
- Tekst: na de keuze van Martijn voor de NBV21 (14-11) het letterlijke citaat ‘Kom allen bij Mij, jullie die vermoeid zijn en onder lasten gebukt gaan, Ik zal jullie rust geven.’ met ‘NBV21 © 2021 Nederlands-Vlaams Bijbelgenootschap’ en ‘lees verder op debijbel.nl’. Terug naar de eigen weergave kan met `bijbel.weergave: parafrase`. Schrijfwijze overal ‘Mattheüs’ (de NBV21 zelf schrijft ‘Matteüs’).
- **Gevonden fout:** de tekst die als ‘NBV21 ©’ op de site stond, was niet de NBV21-tekst. Exacte NBV21- en HSV-tekst zijn gecontroleerd en staan in `content/site.json` (`bijbel.vertalingen`). Keuze en toestemming: V-003. De productiepoort blijft dicht tot `bijbel.gecontroleerd: true`.
- ‘Wie is Jezus?’ op de homepage is daardoor opnieuw ingedeeld (kop links, tekst rechts); inhoud ongewijzigd.

**Tests (14-11-2026):** build + `--check` groen; `node --test` 19/19; `node scripts/test-browser.mjs` 34/34 (twee nieuwe scenario’s: alle kerkdiensten op mobiel en desktop; Mattheüs 11:28 zichtbaar en gemarkeerd); `TEST_BUNDEL=1` 34/34 (de bundel voor de preview werkt). Schermafbeeldingen op 390 en 1280 px bekeken.
**Uitrol (akkoord Martijn, 14-11-2026: ‘Ja bijwerken’):** preview bijgewerkt via `scripts/uitrol-preview.mjs`; alleen het Worker-script vervangen, geen DNS-wijziging; herstelpunt `.uitrol/vorige-versie.multipart`. `/versie.json` meldt `84976e07` (schoon). Livecontrole `TEST_BASE_URL=… node scripts/test-browser.mjs`: **31/31** (de 3 formulierscenario’s met de nep-mailserver draaien alleen lokaal). Niet getest: Safari/Firefox, schermlezer.

**Eigen repository (V-018):** Claude mag in deze sessie geen repository aanmaken. Voorbereid en getest: `git subtree split --prefix=komnaardekerk` levert een losse geschiedenis (25 commits) met alleen de websitemap. Na het aanmaken van een lege repository door Martijn: die geschiedenis pushen, `PROJECT.md`/`HANDOFF.md`/`VRAGEN.md` en een eigen `CLAUDE.md` toevoegen, de uitrol vanuit de nieuwe repository testen. Let op: `ontwerpen/` en `voorstellen/` (oude ontwerprondes) gaan mee tenzij Martijn ze wil achterlaten.

**Bouwstenenbibliotheek:** geen nieuwe of gewijzigde bouwstenen in deze ronde.

**Open:** V-018 (Martijn maakt de repository aan; daarna zet Claude de website over), toestemming NBG vóór de lancering (LANCERING.md), V-013, V-005 en de overige open vragen. V-003 verwerkt (NBV21).

**Volgende stap:** Martijn maakt de lege repository aan en koppelt die aan Claude; daarna overzetten en de uitrol vanuit de nieuwe repository testen.

## Ronde 14 (2026-11-10): spandoek op de gevel, beter gemaakt

**Vraag Martijn:** ‘Iemand had al een voorbeeld gemaakt. Maak jij het spandoek op de kerk eens beter’ (voorbeeldfoto met ‘Vermoeid?! KOMNAARDEKERK.NU’ in de lichtbak).

**Gedaan:** `ontwerp/spandoek/spandoek.mjs` maakt het spandoek in de huisstijl van Het raakpunt, 5,6:1 (de verhouding van het bord in de voorbeeldfoto), in een donkere en een lichte versie: ‘Moe?’ (Newsreader, iets aangedikt voor afstand) → stralend beeldmerk → ‘komnaardekerk.nu’ (Atkinson, ‘.nu’ in goud/terracotta). `montage.py` zet het in een voorbeeldfoto (foto en montage niet in git: herkomst en rechten onbekend). Na opmerking van Martijn (bord stak boven het dak uit en was geen rechthoek in perspectief): de montage gebruikt nu de vier gemeten hoekpunten van het voorbeeldbord. Advies bijgesteld: op dit gebouw overdag de lichte versie (valt meer op boven de donkere laagbouw); de donkere alleen als de bak ’s avonds verlicht is.

**Teksten van de bedenker van het voorbeeld (vraag Martijn):** `node ontwerp/spandoek/spandoek.mjs 'Vermoeid?!' 'KOMNAARDEKERK.NU'` maakt de versie met zijn woorden en zijn indeling (woord boven, adres eronder, beeldmerk rechts), in de huisstijl: `spandoek-vermoeid-{donker,licht}.png`. Welke tekst het wordt (‘Vermoeid?!’ of ‘Moe?’) is nog niet gekozen.

**Auto’s uit de foto (vraag Martijn):** met `ontwerp/spandoek/foto-opschonen/` (maskers + weg, berm en vluchtheuvel opnieuw opgebouwd uit gemeten lijnen; geen AI-model, een gedownload model werd door de veiligheidscontrole van de sessie geweigerd). Resultaat alleen als impressie aan Martijn gestuurd, niet in git.

**Let op (niet opgelost, besluit Martijn):** komnaardekerk.nu is nog niet geregistreerd en de site is nog concept (V-005): niets laten drukken voordat domein en productiesite er zijn. Toestemming van de kerk en mogelijk een vergunning voor gevelreclame bij de gemeente zijn niet gecontroleerd. Het definitieve drukbestand (vector-PDF op ware grootte, met afloop) pas als de maat van de lichtbak bekend is. Eigen adres per woord (/moe/) hangt aan V-013.

## Ronde 13 (2026-11-09): logo definitief, website in de nieuwe stijl

**Akkoord Martijn:** ‘Top. Ga nu door.’ Het logo ‘Het raakpunt’ is definitief (docs/LOGO.md).

**Gedaan in de echte site:**
- `src/lib/logo.mjs` vervangen door het nieuwe merk (stralend, vlak, één kleur, liggend, staand, woordmerk, icoon); `scripts/merk.mjs` maakt 20 SVG’s, favicon/app-icoon/PNG’s en een nieuw deelbeeld (og:image). Oude concepten (`src/static/merk/concepten/`) en lijnillustraties (`src/lib/lijnen.mjs`) verwijderd; waar decoratie nodig is staat het vlakke beeldmerk.
- `content/woorden.json` (11 woorden, B2, met Bijbelgedachte ‘vrij naar …’, uitleg over de kerk, hulp waar nodig en een eigen vervolgstap) vervangt `content/gevoelens.json`. Build controleert velden en eist ‘vrij naar’ zolang V-003 open is.
- Homepage: warm donkere hero met het stralende merk en een rustig wisselend woord (pauze, ander woord, stil bij focus en bij minder beweging; klik opent de keuze), ‘In het kort’ (wat is dit, voor wie, wat vind je, waar kun je heen), ‘Wat houdt je bezig?’ met 11 uitklapbare woorden en drie vaste vervolgstappen (Ontdek Jezus, Wat gebeurt er in de kerk?, Vind een kerk), Je hoeft niets, Wie is Jezus?, kerkdienst, kerken, activiteiten, samen, slot.
- Stijl: tokens op het warme palet (papier, warm donker, wijnrood, terracotta, goud alleen in het licht); knoppen wijnrood; bogen vervangen door een zachte hoek; `/ontwerp/` herschreven rond het nieuwe merk. Overige pagina’s ongewijzigd in inhoud.
- Docs: `docs/LOGO.md` (definitief), `docs/MERK.md` (geschiedenis), README.

**Tests:** build + `--check` groen; `node --test` 19/19; `node scripts/test-browser.mjs` **33/33** (nieuw scenario voor de wisselende woorden; ‘minder beweging’ test nu de stilstand); `TEST_BUNDEL=1` zie hieronder. Gevonden en hersteld: contrast van stapnummers en het label ‘voorbeeld’ (terracotta → donkerder), tekstknoppen in de hero onzichtbaar (kleur), `dd`-inspringing, axe scande midden in de woordovergang (test pauzeert nu eerst).
**Niet getest:** Safari/Firefox, echte schermlezer, lezers uit de doelgroep.

**Uitrol (met toestemming van Martijn, 2026-11-09):** preview vervangen via `node scripts/bundel.mjs && node scripts/uitrol-preview.mjs komnaardekerk.martijndenbesten.com`. Alleen het Worker-script is vervangen; het subdomein was al gekoppeld, dus geen DNS-wijziging. Herstelpunt van de vorige versie: `.uitrol/vorige-versie.multipart`.

**Livecontrole:** `/versie.json` meldt commit `1924213a` (schoon). `TEST_BASE_URL=https://komnaardekerk.martijndenbesten.com node scripts/test-browser.mjs`: **30/30** (12 pagina’s × 6 breedtes met axe, 404, alle scenario’s; de 3 formulierscenario’s met de nep-mailserver draaien alleen lokaal en waren daar groen). Headers: `noindex`, `no-transform`, strikte CSP. Merkbestanden, favicon en deelbeeld geven 200.
Gevonden bij de livecontrole en hersteld: het deelbeeld (`.jpg`) werd als `application/octet-stream` geserveerd; JPEG/WebP toegevoegd aan de bestandstypen van de Worker en de lokale server (commit `1924213a`), opnieuw uitgerold en gecontroleerd (`image/jpeg`).
**Bekend, bewust niet gewijzigd:** `og:image` en canonical wijzen naar `komnaardekerk.nu` (het beoogde domein). Zolang dat domein niet bestaat, toont een gedeelde previewlink geen afbeelding. Wordt vanzelf goed bij de lancering (V-005).

**Open:** V-003 (NBG: letterlijke Bijbelteksten), V-013 (telling per spandoekadres), V-015 (Martijn vraagt toestemming voor foto’s). V-017 verwerkt.

**Na afloop (Martijn):** `/ontwerp/` ingekort: alleen het logo en de uitleg; de zin over twaalf rondes, de versies, kleuren, letters en regels zijn eraf (staan nog in `docs/LOGO.md`). Lokaal 33/33, live 30/30, live commit `73ed337c`.

**Volgende stap:** Martijn bekijkt de preview op telefoon en desktop; daarna de open vragen (V-002, V-003, V-005, V-008) en de toestemming voor foto’s.

## Ronde 12 (2026-11-09): laatste perfectionering logo

**Opdracht Martijn:** ‘Laatste perfectionering graag!’
**Gedaan:** `ontwerp/logo/definitief.mjs` (taps toelopende armen via echte boogberekening, licht iets sterker omhoog, gouden lichtpunt als punt, woordmerk Newsreader liggend en staand, vlakke versie, één kleur, favicon, kerstoptie). `exporteer.mjs` schrijft 14 SVG’s + PNG’s naar `ontwerp/logo/definitief/` (plus favicon 32/16). Gebruiksregels: `docs/LOGO.md`. Presentatie: https://claude.ai/artifact/Lxn1GRCacpT8DW4ZctiBDQ (versie 6). Gecontroleerd: staand logo compleet, mono stevig, favicon leesbaar op 16 px.
**Volgende stap:** laatste akkoord van Martijn op het logo; daarna de website in deze stijl (merk en kleuren overnemen in `ontwerp/`, dan `src/`), tests, bundel, preview vervangen (V-017 vervangt dan ‘Ontmoeting’ door ‘Het raakpunt’).

## Ronde 11 (2026-11-09): Het raakpunt, hemels stralend

**Feedback Martijn:** ‘Veel meer licht ertussen! Echt hemels stralend. Trek alles uit de kast.’
**Gedaan:** `ontwerp/logo/raakpunt2.mjs`: `hemels()` met gelaagd licht vanuit het raakpunt (radiale gloed met verloop, brede bundels, krans van 72 fijne stralen met deterministische variatie, lange hoofdstralen, witgouden kern, sterretjes), armen in het licht; parameter `sterkte` (1 en 1,35 getoond). `hemelsKlein()` vlak zonder verlopen voor favicon/app-icoon. Presentatie: https://claude.ai/artifact/Lxn1GRCacpT8DW4ZctiBDQ (versie 4).
**Feedback Martijn (vervolg):** ‘Losse sterretjes niet (misschien alleen met kerst).’ Verwerkt: sterretjes standaard uit, optie `kerst: true` voor de kersttijd (apart blok in de presentatie, versie 5).
**Let op:** verlopen en detail vragen voor spandoek/borduurwerk/één kleur de vlakke versie; nog te maken in één kleur na akkoord.
**Volgende stap:** Martijn kiest sterkte en aanpassingen; daarna definitieve logobestanden (SVG kleur, vlak, mono, favicon, woordmerk) en dan pas de website.

## Ronde 10 (2026-11-09): Het raakpunt, warme kleuren

**Keuze Martijn:** richting 3 (Het raakpunt) uit ronde 9, ‘alleen dan andere, warmere kleuren’.
**Gedaan:** `ontwerp/logo/raakpunt.mjs`: warm palet (donker #2A1B1E, ivoor, wijnrood #7A2E3B God, terracotta #C9733F mens, licht #F6D98A, goud #D9A85A); zwaardere armen die het vlak vullen; licht alleen in de open sectoren boven en onder de kier. Drie varianten: Doorbraak (twee waaiers), Kern (zachte lichtkern, geen stralen), Opgaand (advies: licht stijgt omhoog). Eerste poging met taps toelopende armen mislukte (bogen kwamen niet samen) en is vervangen door eenvoudige zware bogen. Verkenningspagina versie 3: https://claude.ai/artifact/Lxn1GRCacpT8DW4ZctiBDQ.
**Aandachtspunt:** op 16 px leest het gebaar als een krul; na de keuze een aparte kleine versie maken.
**Volgende stap:** Martijn kiest variant en eventuele aanpassing van kleur/dikte; daarna definitieve logobestanden (SVG kleur, mono, favicon, woordmerk).

## Ronde 9 (2026-11-09): logo volwassener, met stralend licht

**Feedback Martijn:** ‘Maak het volwassener. Stralend licht.’
**Gedaan:** drie richtingen in `ontwerp/logo/verkenning2.mjs`: Stralende ontmoeting, Opkomend licht (advies), Het raakpunt. Palet nacht #141A2E, ivoor, blauw #2B4A7A (God), aarde #8C4A32 (mens), licht, goud alleen in fijne stralen; woordmerk in Newsreader. Zelfde verkenningspagina, versie 2: https://claude.ai/artifact/Lxn1GRCacpT8DW4ZctiBDQ.
**Volgende stap:** Martijn kiest; daarna alleen het logo verder uitwerken.

## Ronde 8 (2026-11-09): alleen het logo

**Feedback Martijn op ronde 7:** geen kruis, andere kleuren, creatiever en veel spectaculairder; ‘je gaat veel te snel, we gaan eerst voor alleen het logo’. Foto’s: Martijn vraagt zelf toestemming (V-015 beantwoord).

**Gedaan:** vijf logorichtingen op ‘ontmoeting tussen God en mens’, zonder kruis, in nieuwe kleuren (`ontwerp/logo/verkenning.mjs`): Lichtspel (gekleurd licht dat optelt), Weefsel (fijne lijnen die kruisen), Bijna (naar de Schepping van Adam), Dageraad (poort met banden van violet naar licht), Twee in één (twee bogen, deur van licht). Op donker, licht, met woordmerk en favicon: https://claude.ai/artifact/Lxn1GRCacpT8DW4ZctiBDQ (privé).

**Bewust niet gedaan:** website niet aangepast, niets getest of gepubliceerd buiten de verkenning; ronde 7 (‘Ontmoeting’ met kruis) staat on hold.

**Volgende stap:** Martijn kiest of combineert een richting; daarna alleen het logo verder uitwerken.

## Ronde 7 (2026-11-09): ‘Ontmoeting’ verder uitgewerkt

**Opdracht:** ‘C is het beste. Ontmoeting tussen God en de mens… maar dan nog verder uitgewerkt… helder licht.’

**Gedaan (in `ontwerp/`):**
- Merk ‘Ontmoeting’ (`merk.mjs`): twee in elkaar grijpende deurbogen (God: zee, mens: klei), spitsboog van licht waar ze elkaar raken, kruis op het raakpunt, kleine lichtval; mono positief/negatief, favicon. Kleurvlakversies verworpen (lezen als vlag), hoog-laagvariant getoetst en verworpen.
- Website in de nieuwe stijl: helder papier, zee en klei, Atkinson Hyperlegible Next + Newsreader cursief; hero met groot merk en de lucht boven de Pleinkerk in de spitsboog. Pagina’s, teksten en interactie uit ronde 6 behouden.
- Presentatie: https://claude.ai/artifact/QbkU26ZvYVGJahNJLLYqz4. Samenvatting: `docs/ONTWERP-ONTMOETING.md`.

**Tests:** `node ontwerp/test.mjs` → **15/15 geslaagd** (zelfde scenario’s als ronde 6, nieuwe stijl). Bestaande site ongewijzigd.

**Open:** V-017 (akkoord om te bouwen), V-015 (eigen foto’s), V-003 (NBG), V-013 (telling). V-016 verwerkt.

**Volgende stap:** na ja op V-017 bouwt Claude ‘Ontmoeting’ in `src/` en `content/`, past de tests aan, bundelt en vervangt de preview.

## Ronde 6 (2026-11-09): logo en website afronden

**Opdracht:** verder vanuit ronde 5 (58c7108d) en issue #131. Spandoek valt buiten de opdracht (iemand anders). Focus op logo en website; A/B/C kritisch beoordelen en onderzoeken of de typografie en het kruis van B samengaan met de architectuur en het licht van A; niet automatisch A kiezen. Preview pas vervangen na bevestiging.

**Gedaan (in `ontwerp/`, los van de echte site):**
- Beoordeling A/B/C: A sterk in architectuur/licht maar beeldmerk leest als kast en is niet christelijk; B sterk in letter en kruis maar standaard kerkvenster en koel; C menselijk maar leest als M en vraagt foto’s van mensen. Combinatie B+A gekozen; C valt af.
- Merk ‘Open deur’ (`merk.mjs`): gotisch portaal, deuren open, binnen het kruis; vlak, mono, positief/negatief, drie detailniveaus, favicon; woordmerk Archivo 800 met ruimere woordafstand en baksteenrode punt. Twee varianten met rondboog afgevallen (lezen als grafsteen) en gedocumenteerd.
- Website: home, 11 woordpagina’s, Wie is Jezus?, De eerste keer (protestants/katholiek), Kerken (filters, eerstvolgende dienst, route, agenda), Over. Rustige animaties, mobiel menu, alles zonder JavaScript bruikbaar. Teksten op B2, geen deelname of geloofsinstemming van kerken geclaimd.
- Foto’s: nieuwe Commons-foto’s binnengehaald (Pleinkerk interieur RCE 1960, Pleinkerk weiland, O.L.V. Houten interieur alleen als uitsnede zonder personen, O.L.V. ’t Goy gewelf). Alles CC BY-SA 4.0, bronnen in `ontwerp/foto/BRONNEN.md`.
- Presentatie: https://claude.ai/artifact/Sgpu5aAttrnsBmJbMF2zx4 (privé). Samenvatting: `docs/ONTWERP-OPEN-DEUR.md`.

**Tests:** `node ontwerp/test.mjs` → **15/15 geslaagd** (Chromium): 7 pagina’s zonder overloop op 320/375/390/768/1024/1440 px, axe WCAG 2.2 AA op 390 en 1440, één h1, logo, Denckh.nl en 113 in de footer, alle afbeeldingen laden, geen consolefouten/opslag/externe verzoeken; homepage beantwoordt de vier kernvragen; wisselende woorden; woord kiezen met focus en drie stappen; mobiel menu; tabbladen; filters en agenda; zonder JavaScript; 11 woordpagina’s. Bestaande site: build `--check` en 19/19 unit-tests ongewijzigd groen.
**Hersteld tijdens testen:** dikke boog (vector-effect), menuknop op desktop, logo en menu op 320 px, tijden ongesorteerd, Alpha-tijd afgebroken, rechte apostrof in ’t Goy, claim ‘uit verschillende kerken’ verwijderd, dubbele foto op home.
**Niet getest:** Safari/Firefox, echte schermlezer, lezers uit de doelgroep.

**Open:** V-016 (bevestiging ontwerp), V-015 (eigen foto’s), V-003 (NBG), V-013 (telling). V-011 en V-012 vervallen (spandoek), V-014 verwerkt.

**Volgende stap:** na ja op V-016 bouwt Claude het ontwerp in `src/` en `content/` (zie ‘Na bevestiging’ in `docs/ONTWERP-OPEN-DEUR.md`), past de bestaande tests aan, bundelt en vervangt de preview.

## Ronde 5 (2026-11-08): issue #131 + volledige creatieve herontwerpronde

**Opdracht:** issue #131 (drie echt verschillende concepten zonder AI-uitstraling, studio-onderzoek, screenshots mobiel/desktop/spandoek Sionkerk, B2-teksten) samen met Martijns brief ‘volledige creatieve herontwerpronde’. Beide gelezen als één opdracht. Martijn: spandoeken nog niet allemaal uitwerken (‘de website moet gewoon kloppen’), dus per concept alleen MOE? op de Sionkerk plus een beoordeling van de woorden voor buiten.

**Gedaan (alles in `ontwerpen/`, los van de echte site):**
- Studio-onderzoek: EIGA, Mayra & Sam en Mainstudio gelezen; Studio Hendriksen (certificaatfout) en de GZB-case van Mandelo (doorverwijzing) niet bereikbaar. Hiervoor heb ik met jouw goedkeuring vijf studiodomeinen toegevoegd aan de netwerkinstellingen van omgeving ‘Raadkoord’.
- Drie merken, plat en schaalbaar met favicon (`merken.mjs`): A Portaal, B Kruisvenster, C Ontmoeting. Woordmerken als letterpaden.
- Homepage per concept met: wisselende woorden (één tegelijk, pauze bij hover/focus, knoppen ‘Ander woord’ en ‘Pauze’, stil bij minder beweging), ‘In het kort’ (wat is dit, voor wie, wat kun je doen), 11 woorden met paneel (herkenning, hoop met vrij weergegeven Bijbeltekst, wat je in de kerk kunt verwachten, hulp waar nodig, drie knoppen: Ontdek Jezus / Wat gebeurt er in de kerk? / Vind een kerk), Wie is Jezus?, Wat gebeurt er in de kerk?, alle 11 kerken met tijden en route, footer met Denckh.nl-signatuurlogo. Elk woord heeft een eigen adres (/moe/) dat zonder JavaScript werkt.
- Alle teksten herschreven op B2 en hardop nagelezen (`woorden.json`, `bouw.mjs`).
- Spandoek MOE? + komnaardekerk.nu per concept, montage op de Sionkerk (intern).
- Presentatie met vergelijking en advies (A): https://claude.ai/artifact/MRh7d7gtvXw4JFsu5zwUHa (privé). Samenvatting: `docs/ONTWERPEN-RONDE5.md`.

**Tests:** `node ontwerpen/test.mjs` → **19/19 geslaagd** (Chromium): geen overloop op 320/375/390/768/1440 px (ook per element), axe WCAG 2.2 AA op 390 en 1440, één h1, logo en Denckh-vermelding, geen consolefouten, geen opslag/cookies/externe verzoeken, wisselende woorden (vanzelf, stil bij focus, pauze, ander woord, minder beweging), woord kiezen met focusbeheer en drie vervolgstappen, werkt zonder JavaScript, 33 woordpagina’s. Hersteld tijdens testen: woord in B en C te breed op 320/390 px, kolom in C liep 2 px over op 768 px, ’t Goy ontbrak in de kerkenlijst, kleurverloop in C verwijderd.
**Niet getest:** Safari/Firefox, echte schermlezer, spandoek op ware grootte, lezers uit de doelgroep.

**Niet gedaan (bewust):** live preview niet vervangen (eerst keuze), geen kosten/domein/DNS, geen kerken benaderd, geen issue-reactie geplaatst. Ronde 4 (`voorstellen/`, V-010) is vervangen.

**Open:** V-014 (concept), V-015 (foto’s binnen en van mensen), V-011 (Sionkerk-foto), V-003 (NBG), V-013 (telling per spandoekadres).

**Volgende stap:** Martijn kiest (V-014). Daarna Claude: gekozen concept in `src/` en `content/` bouwen, bestaande 19 unit- en 32 browsertests uitbreiden, bundelen en de preview vervangen.

## Ronde 4 (2026-11-08): herontwerp huisstijl, logo, spandoekcampagne en interactie

**Opdracht:** drie echt verschillende richtingen (geen geel/oker, geen deur), spandoek MOE? aan de Sionkerk met varianten, woordbeoordeling, ‘Wat houdt jou bezig?’, ‘Kijk eens binnen’, ‘Mijn eerste kerkbezoek’, eerst voorstellen tonen en niet namens Martijn kiezen. Laatste feedback logo: meer stralen, hemelser, minder simpel getekend.

**Gedaan (alles in `voorstellen/`, los van de echte site):**
- Drie beeldmerken als geometrie uit code (`logos.mjs`): 1 Stralenkrans (kruis in de hoofdstralen), 2 Roosvenster (licht door glas, lood, stralen), 3 De ster (geslepen vierpuntster, gloed, sterretjes). Elk met licht/donker, liggend/staand logo, app-icoon, klein detailniveau voor 16–32 px. Woordmerken als letterpaden (Newsreader, Archivo, Instrument Serif; OFL).
- `levensvragen.json`: 17 woorden met herkenning, vrij weergegeven Bijbelgedachte met vindplaats en debijbel.nl-link, uitnodiging van Jezus, volgende stap, hulpnotitie; per woord spandoek ja/seizoen/nee met onderbouwing; lijst ‘niet gebruiken’.
- Klikbaar prototype in drie stijlen (`bouw.mjs`): hero met wisselend campagnewoord + pauzeknop, woordveld met paneel (zonder JS: eigen pagina per woord = spandoekadres), het goede nieuws in vier zinnen, Kijk eens binnen (protestants/katholiek, stap voor stap, woordenlijst, disclaimer), Mijn eerste kerkbezoek (feitelijke filters, eerstvolgende dienst, OSM-route, agendabestand). Geen opslag, geen analytics.
- Mockups (`mockups.mjs`): 12 spandoeken (4 woorden × 3), uitnodigingskaart voor/achter, poster A3. Montage op de Sionkerk-foto (`montage.py`) alleen intern.
- Presentatie met vergelijking, advies (richting 3, met voorwaarden), woordbeoordeling en evaluatie van de interactie: https://claude.ai/artifact/GuJLnsCB6djkUm2EMU3PKU (privé). Samenvatting: `docs/VOORSTELLEN.md`.
- `scripts/merk_paden.py`: werkt nu ook met lettertypen zonder variabele assen.

**Tests ronde 4:** `node voorstellen/test-prototype.mjs` → **31/31 geslaagd** (Chromium): axe WCAG 2.2 AA op 390 en 1440 px voor 5 pagina’s × 3 richtingen, geen horizontaal scrollen op 320 px, geen consolefouten, geen opslag/cookies/externe verzoeken, woordpaneel met focusbeheer, werkt zonder JavaScript, pauze en ‘minder beweging’, tabs met pijltjestoetsen, stappen, filters, ics-download, alle 51 spandoekadressen. Gevonden en hersteld: `hidden` werd overschreven door `display:grid`, toren niet zichtbaar in de hero (nieuwe liggende uitsnede), lettertypen laadden niet in mockups, lange woorden pasten niet op het spandoek.
**Niet getest:** Safari/Firefox, echte schermlezer, spandoek op ware grootte, lezing door mensen uit de doelgroep.

**Bouwstenen ronde 4:** geen bestaande CODE-bouwsteen voor campagnemockups of levensvragen; B74 (woordmerk uit lettertype) en B38 (visuele controle) hergebruikt. Kandidaat, nog geen kaart: ‘beeldmerk als geometrie uit code met detailniveau groot/klein’ en ‘mockups renderen via Playwright met tekst-passend-maken’. Pas opnemen na gebruik in de gekozen richting.

**Niet gedaan (bewust):** live preview, `dist/` en `content/` van de echte site niet gewijzigd; geen kosten, domein of DNS; geen kerk benaderd; de Sionkerk-foto niet gecommit of gepubliceerd.

**Open:** V-010 (richting), V-011 (foto Sionkerk), V-012 (woorden), V-013 (telling per spandoekadres), plus V-003 (NBG) voor letterlijke Bijbelteksten.

**Volgende stap:** Martijn kiest (V-010). Daarna Claude: gekozen richting doorvoeren in `src/` en `content/` (merk, homepage, levensvragen, kijk binnen, eerste bezoek), bestaande tests uitbreiden, bundelen en de preview bijwerken.

## Huidige stand (v2, live preview)

**Kom naar de kerk.** v2 staat in `` op branch `claude/kom-naar-kerk-website-e9e7sq`.

- **Live als preview:** https://komnaardekerk.martijndenbesten.com. Live draait commit `8182ecb7` (ronde 16), dezelfde commit die getest is (te zien op `/versie.json`).
- **Concept:** de hele site staat op noindex en heeft een duidelijke conceptbalk.
- **Contactformulier:** staat aan de serverkant uit.
- **Status:** dit is geen officieel initiatief. Geen enkele kerk is benaderd, en geen enkele kerk wordt partner of deelnemer genoemd.

## Huidige opdracht

1. v1: eerste concept. Afgerond.
2. Koppelen aan martijndenbesten.com. Afgerond, via een subdomein.
3. **v2** (2026-11-08): uitwerken tot een hoogwaardige site met onderzoek naar kerken en initiatieven, een geloofsbasis, drie logoconcepten, fotografie, een opzet om kerken uit te nodigen en een lanceerlijst. Uitgevoerd binnen de grenzen hieronder.

## Wat is gedaan (v2)

- **Kerkenonderzoek:**
  - 11 kerken gecontroleerd op hun eigen website (8-11-2026): Sionkerk, Pleinkerk, Opstandingskerk, De Lichtboog, Het Kruispunt, Eskol-kerk, Evangelie Gemeente Houten, O.L.V. Houten, De Rivier, H. Michaëlkerk Schalkwijk en O.L.V. ’t Goy.
  - Nog te verifiëren: Hervormd Schalkwijk, ’t Waal en Honswijk, Sudanese Gospel Mission en het Moluks Kerkelijk Centrum (V-009).
  - Overzicht in `docs/KERKEN-OVERZICHT.md`, ruwe gegevens in `docs/onderzoek/`.
- **Initiatieven:** 22 onderzocht. 16 zijn actueel en vallen binnen de afbakening; die staan op de site:
  - Alpha en Alpha Lunch;
  - PROEF!: inloop, jongerenavond, Messy Church en Happy Meal;
  - Eet je mee, Bijbellezen NU, Taizégebed, leeskring, Meer weten over geloven en Adventskring;
  - open maaltijd, koffieochtend, Kidskerk en KinderBijbelClub.
  - Overzicht in `docs/INITIATIEVEN.md`. PROEF! staat er niet als deelnemer bij.
- **Gegevensmodel:**
  - Per kerk: deelnamestatus (kandidaat, belangstelling of deelnemer), toestemming, bronnen, controledatum, contactpersonen (alleen met toestemming) en foto.
  - In productie toont de build alleen deelnemers met toestemming.
  - De productiebuild weigert:
    - gegevens die verouderd zijn (kerken na 90 dagen, activiteiten na 60 dagen);
    - het woord 'partner' bij een kerk die geen deelnemer is;
    - conceptbeelden;
    - een geloofsbasis die nog concept is;
    - een ongecontroleerde Bijbeltekst;
    - een formulier in voorbeeldmodus.
- **Pagina's:**
  - Home, met een nieuwe hero met een echte foto.
  - Waarom naar de kerk?
  - Voor het eerst.
  - Kerken, met filters op plaats, traditie en kenmerk.
  - Ontdek het geloof: het evangelie in vijf delen, de geloofsbasis en veelgestelde vragen.
  - Activiteiten.
  - Samen naar de kerk: voorbereiding, met het formulier ingeklapt als voorbeeld.
  - Over ons: status van het initiatief en hoe kerken kunnen meedoen.
  - Privacy.
  - Ontwerp: alleen zichtbaar in de conceptversie.
- **Geloofsbasis:** concept 0.1 in `docs/GELOOFSBASIS.md`. Geïnspireerd op de Sionkerk (genade, geloof, Christus, Schrift) en verankerd in de Apostolische Geloofsbelijdenis en de belijdenis van Nicea, zodat alle tradities zich erin kunnen herkennen.
- **Merk:**
  - Drie concepten met een gebruikstoets: open deur, portaal en punt-deur.
  - Gekozen: concept A, met de punt uit C. Een eerdere versie las als grafsteen en is aangepast.
  - Alle varianten als SVG met letterpaden, plus PNG's: horizontaal, staand, beeldmerk, woordmerk, donker, zwart, wit, icoon en favicon.
  - Lijnillustraties en voorbeeldtoepassingen (visitekaartje, uitnodiging, poster, social-post) op `/ontwerp/`. Toelichting in `docs/MERK.md`.
- **Fotografie:**
  - Vier echte foto's uit Houten via Wikimedia Commons, CC BY-SA 4.0 met naamsvermelding.
  - De hero is de openstaande deur van de Pleinkerk. Bij het laden zwaait er een getekend deurblad open dat de foto onthult.
  - Geen stockfoto's, geen AI-beelden en geen herkenbare personen.
- **Denckh:** in de voet "Concept en realisatie door" met het officiële signatuurlogo, gelinkt naar https://denckh.nl. Het logo is byte-identiek aan het origineel; de build controleert de hash.
- **Bijbeltekst:** de citeerregels van het NBG zijn gelezen en verwerkt (copyrightvermelding en "lees verder op debijbel.nl"). Toestemming voor missionair gebruik is nog een open besluit (V-003).
- **Domein:**
  - komnaardekerk.nu: DNS geeft NXDOMAIN, dus vrijwel zeker vrij. Er is niets geregistreerd.
  - komnaardekerk.nl: wél geregistreerd door een ander (Wix, geen gepubliceerde site).
- **Documenten:**
  - `KERKEN-UITNODIGEN.md`: volgorde van benaderen, conceptbrief en formulier voor gegevens en toestemming.
  - `LANCERING.md`: alles wat vóór de lancering geregeld moet zijn.
  - Verder `MERK.md`, `FOTOGRAFIE.md` en `GELOOFSBASIS.md`.

## Testresultaten (2026-11-08, cloudsessie, Node 22.23, Chromium)

| Laag | Commando | Resultaat |
|---|---|---|
| Build + controles | `node scripts/build.mjs --check` | **geslaagd** |
| Unit, Worker, poort | `node --test test/*.test.mjs` | **geslaagd** 19/19. Alle 13 mutaties gevangen; de productieversie toont alleen de deelnemer, zonder ontwerppagina en zonder volledige noindex |
| Productiepoort | `npm run poort` | **weigert terecht**: concept, geen deelnemers, Bijbeltekst, geloofsbasis, formulier, verantwoordelijke en contactadres nog open |
| Browser (dist) | `node scripts/test-browser.mjs` | **geslaagd** 32/32 |
| Browser (bundel) | `TEST_BUNDEL=1 …` | **geslaagd** 32/32 |
| **Live preview** | `TEST_BASE_URL=https://komnaardekerk.martijndenbesten.com …` | **geslaagd** 29/29. De 3 scenario's met een nagebootste mailserver draaien alleen lokaal |
| Externe links | `node scripts/controleer-links.mjs` | 41 in orde, 0 fout. 7 niet te controleren vanaf hier door netwerkbeleid of rate-limit: denckh.nl, 113.nl, deluisterlijn.nl, 3× kerkdienstgemist, 1× Commons |

Wat de browserscenario's dekken:
- 12 pagina's op breedtes van 320 tot 1440 px: geen horizontaal scrollen, geen console- of CSP-fouten, axe (WCAG 2.0–2.2 A/AA en best practices).
- Op elke pagina: noindex, conceptbalk, Denckh-vermelding, en alle afbeeldingen laden.
- Geen fictieve gegevens: elke kerk heeft een status, een bron en een controledatum.
- Filters: binnen een groep geldt "of", tussen groepen "en".
- Bijbelcitaat met bronvermelding en verwijzing naar debijbel.nl.
- Formulier in alle standen: voorbeeld, aan, zonder JavaScript en serverkant uit.
- Toetsenbord, menu, tekst op 200 %, minder beweging.
- Privacy: geen cookies, geen opslag, geen verzoeken naar andere domeinen.

Gevonden en hersteld tijdens het testen:
- Een lang e-mailadres maakte de pagina op 320 px te breed.
- De navigatie liep over bij tekst op 200 %.
- Schermlezerteksten in een tabel ontsnapten aan de scrollcontainer.
- Logo-SVG's zonder intrinsieke afmeting liepen buiten hun kader.
- Dubbele alt-tekst op de ontwerppagina.
- Filterkenmerken waren te ruim: "gezin" telde als kinderwerk en "crèche niet vermeld" als oppas.
- Diensten die niet wekelijks zijn, kregen een agendaknop.

**Niet getest of geblokkeerd:**
- Safari en Firefox: alleen Chromium is aanwezig, en een andere browser installeren mag in deze omgeving niet.
- Een echte schermlezer.
- Echte mailverzending: het formulier staat uit.
- Een gebruikerstest met mensen uit de doelgroep.
- Een drukproef van het logo.
- De heldfoto in hoge resolutie: Wikimedia gaf een rate-limit, dus de foto is nu 543 px breed (zie `LANCERING.md`).

## Gewijzigde en nieuwe bestanden (v2, hoofdlijnen)

``:
- `content/`: kerken, initiatieven, geloofsbasis, fotos, site.
- `src/pages/`: waarom, ontdek, activiteiten, samen, over-ons, ontwerp, kerken, home.
- `src/lib/`: logo, lijnen, layout, onderdelen.
- `src/static/`: css, js, `foto/`, `merk/logo/`, `merk/concepten/`, `merk/denckh/`.
- `merk/bron/` en `fotos/bron/`.
- `scripts/`: merk, merk_paden.py, fotos.py, overzicht, controleer-links, build, test-browser.
- `test/`, `docs/`, `dist/` en `README.md`.

In de root: `PROJECT.md`, `HANDOFF.md`, `VRAGEN.md`.

## Omgeving en uitrol

- **Preview bijgewerkt:** alleen het script van de Worker `komnaardekerk-preview`. Het subdomein bestond al, dus er is geen DNS gewijzigd.
- **Netwerkinstellingen:** voor het onderzoek heb ik met jouw goedkeuring hosts toegevoegd aan je persoonlijke cloudomgeving 'Raadkoord': kerkwebsites, Commons, bijbelgenootschap.nl, een zoekmachine en de preview. De zoekmachine gaf een botcontrole; die heb ik niet omzeild en de zoekmachine is niet gebruikt.
- **Niet gedaan:** geen domeinregistratie, geen DNS-wijziging, geen kosten, geen contact met kerken of met PROEF!.

## Open punten

- In `VRAGEN.md`: V-001, V-002, V-003, V-004, V-005, V-006 (vaststelling van de geloofsbasis), V-007, V-008, V-009, (ronde 4) V-013, (ronde 5) V-015 en V-003, V-013 en V-015 (beantwoord: Martijn vraagt zelf). V-010 t/m V-012 vervallen; V-014, V-016 en V-017 verwerkt. V-010, V-011 en V-012 vervallen; V-014 verwerkt.
- De volledige lijst voor de lancering staat in `docs/LANCERING.md`.

## Bouwstenenbibliotheek

Bron: `bibliotheek/BOUWSTENEN.md` op `main` (versie 39) en PR #130.

- **Hergebruikt:**
  - B97: statische site met publicatiepoort.
  - B36: sitemap, robots en metadata.
  - B38: visuele controle.
  - B61: officieel Denckh-logo met hashcontrole.
  - B74: logo uit een lettertype, hier in een Python-variant.
  - B99: uitrol vanuit de cloud.
  - B106: alleen als idee.
- **Gewijzigd:** B97 en B99, in PR #130. Die staat nog niet op main.
- **Kandidaat-nieuw, nu nog geen kaart:** twee patronen, die ik pas opneem na gebruik in een tweede project of na de lancering:
  - 'deelnamestatus + publieke selectie in de build': gegevens van derden pas tonen na hun toestemming;
  - de Python-variant van B74 met HarfBuzz-kerning.

## Volgende stap

1. **Martijn:** bekijk de preview en beantwoord de vragen. Minimaal nodig: V-002 (verantwoordelijke), V-003 (NBG), V-005 (domein) en V-008 (eerste gesprekken).
2. **Kerngroep:** vorm een kerngroep en voer de gesprekken met de kerken. De conceptbrief staat in `docs/KERKEN-UITNODIGEN.md`.
3. **Claude:** antwoorden verwerken, de heldfoto in hoge resolutie ophalen, en een kerk pas op `deelnemer` zetten na haar toestemming.
