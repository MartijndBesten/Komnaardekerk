# VRAGEN

Dit bestand is het vaste vraag-en-antwoordkanaal tussen Martijn, ChatGPT/Codex en Claude Code.

## Werkwijze

- Voeg alleen vragen toe die een beslissing, ontbrekende bron of bevestiging van Martijn nodig hebben.
- Eén vraag per item met een uniek nummer: `V-001`, `V-002`, enzovoort.
- Gebruik status `open`, `beantwoord` of `verwerkt`.
- Claude zet nieuwe vragen op `open`.
- ChatGPT/Codex of Martijn vult het antwoord in en zet de status op `beantwoord`.
- Claude verwerkt het antwoord in het project, noteert waar dat is gedaan en zet de status op `verwerkt`.
- Verwijder oude vragen niet; ze vormen samen een beknopt beslisspoor.
- Algemene voortgang en volgende actor blijven uitsluitend in `HANDOFF.md`.

## Open vragen

### V-001 — Welke kerken doen mee, met welke gegevens?

status: open
gesteld_door: claude
datum: 2026-11-08

**Vraag**

Welke kerken in Houten doen daadwerkelijk mee en hebben schriftelijk toestemming gegeven voor publicatie? Lever per kerk: naam, adres + postcode, tijden van de diensten, korte sfeeromschrijving (door de kerk zelf geschreven), kinderen, toegankelijkheid, website, contactpersoon voor nieuwe bezoekers (naam + telefoon/e-mail, mét toestemming van die persoon), of de kerk 'samen gaan' kan opvangen, en één echte foto met beschrijving.

**Waarom nodig**

Nu staan er vier duidelijk gemarkeerde voorbeeldkerken. Echte gegevens mogen niet verzonnen worden; de productiepoort (`npm run poort`) weigert publicatie zolang er voorbeeldkerken in `content/kerken.json` staan.

**Antwoord**

Deels (opdracht 2026-11-08): Martijn gaf een startlijst van 14 kandidaten en vroeg ze te onderzoeken. Welke kerken echt meedoen is nog niet bekend; er is nog niemand benaderd.

**Verwerkt in**

Onderzoek 2026-11-08: 11 kerken op hun eigen website gecontroleerd, 3 nog te verifiëren (`docs/KERKEN-OVERZICHT.md`). Alle kerken staan op status `kandidaat`; de voorbeeldkerken zijn verwijderd. De productieversie toont alleen kerken met status `deelnemer` en toestemming. Vraag blijft `open` voor de echte deelname.

### V-002 — Wie is verantwoordelijk (afzender, AVG, contactadres)?

status: open
gesteld_door: claude
datum: 2026-11-08

**Vraag**

Welke organisatie is de afzender en verwerkingsverantwoordelijke van komnaardekerk.nl (bijv. een stichting, een van de kerken namens allen, of de Raad van Kerken Houten)? Wat is het contactadres voor bezoekers en voor kerken die willen meedoen? Wie is eigenaar van het domein?

**Waarom nodig**

De privacyverklaring en de pagina 'Over' kunnen niet af zonder verantwoordelijke en contactadres (`site.json`: `verwerkingsverantwoordelijke`, `contact.emailInitiatief`). De publicatiepoort controleert dit.

**Antwoord**

Nog niet beantwoord.

**Verwerkt in**

Nog niet verwerkt.

### V-003 — Bijbeltekst: vertaling, exacte tekst en citeerrecht

status: verwerkt
gesteld_door: claude
datum: 2026-11-08

**Vraag**

Mattheüs/Matteüs 11:28 staat nu in de NBV21-weergave uit de opdracht ("Kom naar Mij, … dan zal Ik jullie rust geven.") met bronvermelding © Nederlands-Vlaams Bijbelgenootschap 2021. Wil iemand de exacte NBV21-tekst (hoofdletters Mij/Ik) en de citeerregels van het NBG controleren, of kiezen we een andere vertaling?

**Waarom nodig**

De NBV21 is auteursrechtelijk beschermd. **Aanvulling 2026-11-08:** de citeerregels zijn nu gelezen (bijbelgenootschap.nl/voorwaarden-citeren-bijbelvertalingen): digitaal maximaal 100 verzen per week zonder toestemming bij *niet-commercieel gebruik op beperkte schaal*, met copyrightvermelding en een verwijzing 'lees verder op debijbel.nl' (beide staan nu op de site). Voor *missionair gebruik op uitgebreide schaal* is vooraf toestemming nodig. Die categorie lijkt op dit initiatief van toepassing. **Beslissing nodig: vragen we het NBG om toestemming, of kiezen we een andere vertaling?** De exacte NBV21-tekst (hoofdletters Mij/Ik) kon ik niet controleren, omdat debijbel.nl geautomatiseerde toegang blokkeert. De publicatiepoort blokkeert tot `bijbel.gecontroleerd: true`.

**Aanvulling 2026-11-14 (opdracht Martijn: Mattheüs 11:28 blijft op de homepage; tot de rechten rond zijn een gemarkeerde parafrase):**

- De tekst die tot nu toe als ‘NBV21’ op de site stond ("Kom naar Mij, … dan zal Ik jullie rust geven.") **was niet de NBV21-tekst**. Hij is van de site gehaald.
- Gecontroleerd op debijbel.nl (14-11-2026):
  - NBV21, Matteüs 11:28: "Kom allen bij Mij, jullie die vermoeid zijn en onder lasten gebukt gaan, Ik zal jullie rust geven." © 2021 Nederlands-Vlaams Bijbelgenootschap.
  - HSV, Mattheüs 11:28: "Kom naar Mij toe, allen die vermoeid en belast zijn, en Ik zal u rust geven." © Stichting HSV en Royal Jongbloed 2010-2017.
- NBG-voorwaarden opnieuw gelezen (ongewijzigd): missionair gebruik op uitgebreide schaal vraagt vooraf toestemming. De voorwaarden van de HSV zijn **niet** gecontroleerd (herzienestatenvertaling.nl was vanuit de cloudsessie niet bereikbaar).
- Op de site staat nu een eigen weergave, gemarkeerd als ‘vrij weergegeven naar Mattheüs 11:28 · eigen weergave, geen Bijbelvertaling’, met een link naar debijbel.nl. De gecontroleerde teksten staan klaar in `content/site.json` (`bijbel.vertalingen`).

**Beslissing nodig van Martijn:** welke vertaling wordt het (NBV21 of HSV; de schrijfwijze ‘Mattheüs’ is die van de HSV), en wie vraagt de rechthebbende om toestemming? Daarna zet Claude `bijbel.weergave` op `citaat`.

**Antwoord**

Martijn, 14 november 2026: ‘Vind ik nu even prima, de NBV21.’

**Verwerkt in**

`content/site.json` (`bijbel.weergave: citaat`, letterlijke NBV21-tekst met copyrightvermelding en ‘lees verder op debijbel.nl’), `src/lib/onderdelen.mjs`, `src/pages/home.mjs` (14-11-2026). Nog te doen vóór de lancering: het NBG om toestemming vragen voor missionair gebruik op uitgebreide schaal (staat in `docs/LANCERING.md`; de productiepoort blijft dicht tot `bijbel.gecontroleerd: true`). Let op: de NBV21 schrijft zelf ‘Matteüs’; de site gebruikt op verzoek van Martijn ‘Mattheüs’.

### V-004 — Opvolging contactverzoeken: wie, hoe snel, hoe lang bewaren?

status: open
gesteld_door: claude
datum: 2026-11-08

**Vraag**

Wie ontvangt de contactverzoeken ('samen gaan', 'gesprek', 'vraag'), wie verdeelt ze over de kerken, binnen welke termijn wordt gereageerd (nu: "binnen een paar dagen"), en na hoeveel tijd worden verzoeken verwijderd?

**Waarom nodig**

Het formulier staat in voorbeeldmodus en verstuurt niets. Het mag pas aan als de opvolging echt geregeld is (opdracht §4). Omdat een verzoek belangstelling voor geloof laat zien, gaat het om bijzondere persoonsgegevens (art. 9 AVG): uitdrukkelijke toestemming (zit erin), minimale ontvangers en een vaste bewaartermijn zijn nodig.

**Antwoord**

Nog niet beantwoord.

**Verwerkt in**

Nog niet verwerkt.

### V-005 — Hosting en publicatie

status: open
gesteld_door: claude
datum: 2026-11-08

**Vraag**

Akkoord met Cloudflare Workers (static assets + één kleine Worker voor het formulier, mail via Cloudflare Email Routing naar één geverifieerd adres)? Waar staat het domein komnaardekerk.nl geregistreerd en wie beheert de DNS en mail? Moet er een (niet-geïndexeerde) previewversie online komen voor de kerken?

**Waarom nodig**

Er is niets gepubliceerd (geen opdracht). Uitrol vanuit een cloudsessie kan statische assets niet uploaden (B99); dat moet lokaal of via Workers Builds. Domein/DNS/mail-wijzigingen alleen met toestemming van de eigenaar (B98).

**Aanvulling 2026-11-08:** het beoogde domein is nu **komnaardekerk.nu**. Een DNS-controle gaf NXDOMAIN: het domein staat niet in de .nu-zone en is vrijwel zeker nog vrij. Er is niets geregistreerd. **komnaardekerk.nl is wél geregistreerd** (bij Wix, zonder gepubliceerde site). Beslissing nodig: wie registreert komnaardekerk.nu (kosten, houder), en willen we navragen wie komnaardekerk.nl bezit?

**Antwoord**

Deels (2026-11-08): Martijn: "Koppel de website aan martijndenbesten.com". Uitgevoerd als preview op het subdomein komnaardekerk.martijndenbesten.com (de hoofdsite op martijndenbesten.com is ongemoeid gelaten). Open blijft: definitieve hosting/domein komnaardekerk.nl, DNS en mail.

**Verwerkt in**

`README.md` (Preview), `HANDOFF.md`. Status blijft `open` voor het deel komnaardekerk.nl.

### V-006 — Gezamenlijke geloofsbasis en eventuele makersvermelding

status: open
gesteld_door: claude
datum: 2026-11-08

**Vraag**

(a) Klopt de formulering op 'Over' dat de deelnemende kerken "het geloof in God de Vader, in Jezus Christus en in de heilige Geest" delen, en is dat ook de voorwaarde om mee te doen? (b) Wil je een makersvermelding ('Ontwikkeld door Denckh') in de voet, of juist niet bij een kerkelijk initiatief?

**Waarom nodig**

(a) Dit bepaalt welke kerken kunnen aansluiten en moet door de kerken zelf gedragen worden. (b) Merkregel `bibliotheek/DENCKH_MERKVERMELDING.md` geldt alleen als er een credit komt; nu staat er geen.

**Antwoord**

(b) Beantwoord 2026-11-08: ‘Concept en realisatie door Denckh.nl’ in de footer, gelinkt aan https://denckh.nl, niet in het logo. (a) Martijn: geloofsinhoud van de Sionkerk als inspiratie, maar niet exclusief gereformeerd; kerken moeten de gezamenlijke christelijke kern onderschrijven. Een conceptgeloofstekst opstellen die de kerken later bespreken.

**Verwerkt in**

(b) Footer met het officiële signatuurlogo (`src/lib/layout.mjs`, hash bewaakt in `scripts/build.mjs`). (a) `content/geloofsbasis.json` en `docs/GELOOFSBASIS.md`, concept 0.1; de productiepoort weigert tot `status: vastgesteld`. De vaststelling door de kerken blijft open, daarom blijft deze vraag `open`.

### V-007 — Fotografie

status: open
gesteld_door: claude
datum: 2026-11-08

**Vraag**

Komt er een fotograaf (of fotografen per kerk) voor echte foto's volgens `docs/FOTOGRAFIE.md`, met toestemming van herkenbare personen?

**Waarom nodig**

De opdracht vraagt authentieke foto's en geen stockbeelden. Ik heb bewust geen stockfoto's gebruikt; alle beeldvlakken tonen nu warm licht met de aanduiding 'Foto volgt'. Zonder echte foto's oogt de site in de praktijk kaler dan bedoeld.

**Antwoord**

Nog niet beantwoord.

**Verwerkt in**

Tussenoplossing 2026-11-08: vier echte foto's van Houtense kerken en het Oude Dorp van Wikimedia Commons (CC BY-SA 4.0, met naamsvermelding), waaronder de open deur van de Pleinkerk als hero (`docs/FOTOGRAFIE.md`). Openstaand: per kerk een eigen foto met toestemming, en een hero die niet één kerk centraal zet.

### V-008 — PROEF! en de eerste gesprekken

status: open
gesteld_door: claude
datum: 2026-11-08

**Vraag**

Wie benadert de kerken en PROEF!, en in welke volgorde? Wil je PROEF! (via de relatie rond Raadkoord) als eerste vragen mee te denken, zonder het als deelnemer te noemen? Zie het voorstel in `docs/KERKEN-UITNODIGEN.md`.

**Waarom nodig**

Pas na echte gesprekken en schriftelijke toestemming mag een kerk als deelnemer op de site. Ik doe geen externe toezeggingen.

**Antwoord**

Nog niet beantwoord.

**Verwerkt in**

Nog niet verwerkt.

### V-009 — Nog te verifiëren gemeenschappen

status: open
gesteld_door: claude
datum: 2026-11-08

**Vraag**

Ken jij contactpersonen of actuele websites van de Hervormde gemeente Schalkwijk, de Hervormde gemeente ’t Waal en Honswijk, de Sudanese Gospel Mission en het Moluks Kerkelijk Centrum in Houten?

**Waarom nodig**

Hun websites waren onbereikbaar of niet te vinden (verkeerd certificaat, vervallen domein). Ze staan nu alleen als ‘nog niet gecontroleerd’ op de kerkenpagina, zonder gegevens.

**Antwoord**

Nog niet beantwoord.

**Verwerkt in**

Nog niet verwerkt.

### V-010 — Welke ontwerprichting?

status: vervallen (vervangen door V-014, ontwerpronde 5)
gesteld_door: claude
datum: 2026-11-08

**Vraag**

Kies je richting 1 (Stralenkrans), 2 (Roosvenster), 3 (De ster) of de combinatie van de ster met de spandoekletter van richting 2? Zie de presentatie (https://claude.ai/artifact/GuJLnsCB6djkUm2EMU3PKU) en `docs/VOORSTELLEN.md`.

**Waarom nodig**

Je hebt gevraagd geen keuze namens jou te maken en de live preview pas na jouw akkoord aan te passen. Pas na deze keuze bouw ik de echte site om (merk, homepage, levensvragen, kijk binnen, eerste bezoek) en werk ik de preview bij.

**Antwoord**

Nog niet beantwoord.

**Verwerkt in**

Nog niet verwerkt.

### V-011 — Foto van de Sionkerk

status: vervallen (spandoek valt buiten de opdracht, 9 november 2026)
gesteld_door: claude
datum: 2026-11-08

**Vraag**

Mag ik (of jij) de Hervormde Gemeente Houten vragen of de foto van de Sionkerk van hervormdhouten.nl voor de campagne gebruikt mag worden? Of laat je zelf een foto maken?

**Waarom nodig**

De spandoekmontage gebruikt die foto alleen intern (`voorstellen/intern/`, niet in git, niet gepubliceerd). Zonder toestemming of eigen foto kan de montage niet in openbaar materiaal.

**Antwoord**

Nog niet beantwoord.

**Verwerkt in**

Nog niet verwerkt.

### V-012 — Woorden voor spandoek en website

status: vervallen (spandoek valt buiten de opdracht; de website gebruikt de 11 woorden uit de opdracht, zie `ontwerp/woorden.json`)
gesteld_door: claude
datum: 2026-11-08

**Vraag**

Akkoord met de spandoekreeks MOE?, ALLEEN?, ZOEKEND?, NIEUWSGIERIG?, met de woorden die alleen op de website staan, en met de lijst ‘niet gebruiken’? En wil je op de homepage alle zeventien woorden of de geadviseerde negen?

**Waarom nodig**

De keuze bepaalt wat er gedrukt wordt en hoe het woordveld werkt. De beoordeling per woord staat in `voorstellen/levensvragen.json`.

**Antwoord**

Nog niet beantwoord.

**Verwerkt in**

Nog niet verwerkt.

### V-013 — Telling per spandoekadres

status: open
gesteld_door: claude
datum: 2026-11-08

**Vraag**

Wil je per spandoekadres (bijvoorbeeld /moe/) alleen een totaal aantal bezoeken zien, zonder IP-adressen, cookies of profielen? Of helemaal niets meten?

**Waarom nodig**

Je hebt bepaald dat keuzes en gevoelens niet worden opgeslagen of naar analytics gaan. Een totaaltelling per adres is het enige dat laat zien welk spandoek werkt; dat is jouw afweging, niet de mijne. Zonder antwoord meet ik niets.

**Antwoord**

Nog niet beantwoord.

**Verwerkt in**

Nog niet verwerkt.

### V-014 — Welk concept uit ontwerpronde 5?

status: verwerkt
gesteld_door: claude
datum: 2026-11-08

**Vraag**

Kies je concept A (Portaal), B (Kruisvenster) of C (Ontmoeting)? Zie de presentatie (https://claude.ai/artifact/MRh7d7gtvXw4JFsu5zwUHa) en `docs/ONTWERPEN-RONDE5.md`. Mijn advies is A.

**Waarom nodig**

Issue #131 en jouw opdracht vragen eerst de drie concepten te laten zien en de preview pas daarna te vervangen.

**Antwoord**

Martijn, 9 november 2026: spandoek valt buiten de opdracht. Voorkeur: de sterke typografie en christelijke herkenbaarheid van B combineren met de kerkarchitectuur en het natuurlijke licht van A; niet automatisch A kiezen.

**Verwerkt in**

Ontwerp ‘Open deur’ in `ontwerp/` en `docs/ONTWERP-OPEN-DEUR.md` (ronde 6). Bevestiging van dat ontwerp: V-016.

### V-015 — Foto’s van binnen en van mensen

status: beantwoord
gesteld_door: claude
datum: 2026-11-08

**Vraag**

Wie vraagt de kerken toestemming voor foto’s van binnen (licht, ramen, deuren) en eventueel van mensen? En mag ik daarvoor een fotolijst voor een fotograaf maken?

**Waarom nodig**

Alle drie de concepten worden pas echt sterk met eigen foto’s. Nu zijn er alleen vier buitenfoto’s van Wikimedia Commons. Foto’s van mensen gebruiken we alleen met hun toestemming.

**Antwoord**

Martijn, 9 november 2026: ‘Ik ga toestemming vragen. Laat dat even los.’ Martijn vraagt de kerken zelf om toestemming voor foto’s.

**Verwerkt in**

Nog niet verwerkt.

### V-016 — Is ‘Open deur’ het ontwerp?

status: verwerkt
gesteld_door: claude
datum: 2026-11-09

**Vraag**

Is het uitgewerkte ontwerp ‘Open deur’ (logo, kleuren, letters, alle pagina’s) het ontwerp dat ik in de echte site mag bouwen? Zie https://claude.ai/artifact/Sgpu5aAttrnsBmJbMF2zx4 en `docs/ONTWERP-OPEN-DEUR.md`.

**Waarom nodig**

Je hebt gevraagd de online preview pas te vervangen nadat de ontwerpkeuze is bevestigd.

**Antwoord**

Martijn, 9 november 2026: ‘C is het beste. Ontmoeting tussen God en de mens… maar dan nog verder uitgewerkt… helder licht.’

**Verwerkt in**

Ontwerp ‘Ontmoeting’ (ronde 7) in `ontwerp/` en `docs/ONTWERP-ONTMOETING.md`. Bevestiging daarvan: V-017.

### V-017 — Is ‘Ontmoeting’ zo goed?

status: verwerkt
gesteld_door: claude
datum: 2026-11-09

**Vraag**

Is het uitgewerkte ontwerp ‘Ontmoeting’ (logo, kleuren, alle pagina’s) zo goed om in de echte site te bouwen en de preview te vervangen? Zie https://claude.ai/artifact/QbkU26ZvYVGJahNJLLYqz4.

**Waarom nodig**

Je hebt gevraagd de online preview pas te vervangen nadat de ontwerpkeuze is bevestigd. De richting (C) is gekozen; dit is de uitgewerkte versie.

**Antwoord**

Martijn, 9 november 2026: na ronde 8–12 gekozen voor het logo ‘Het raakpunt’ (‘Top. Ga nu door’). Daarmee vervangt Het raakpunt het ontwerp ‘Ontmoeting’ uit ronde 7.

**Verwerkt in**

De echte site (`src/`, `content/woorden.json`, `scripts/merk.mjs`, `docs/LOGO.md`, `docs/MERK.md`), commit van ronde 13. De preview wordt vervangen zodra de uitrol is gedraaid (zie HANDOFF).

### V-018 — Eigen repository voor Kom naar de kerk

status: verwerkt
gesteld_door: claude
datum: 2026-11-14

**Vraag**

Je vroeg om de website ‘uit Raadkoord te halen’ en een eigen repository te maken. Wil je zelf een lege, besloten repository aanmaken (voorstel: `MartijndBesten/komnaardekerk`, zonder README) en die voor Claude vrijgeven? Daarna zet Claude de map `` met de volledige geschiedenis en de projectdocumenten erin over.

**Waarom nodig**

Een cloudsessie van Claude mag in deze opzet geen repositories aanmaken; dat kan alleen jij. ‘Raadkoord’ is overigens de naam van je cloudomgeving (netwerkinstellingen), niet de plek waar de code staat: de code staat in `martijn-ai-workbench` op de branch `claude/kom-naar-kerk-website-e9e7sq`. De overzetting is voorbereid en getest (zie HANDOFF, ronde 15). Volgens `CLAUDE.md` vult alleen ChatGPT `PROJECTS.md` aan; de verwijzing daar moet na de verhuizing dus via die route worden bijgewerkt.

**Antwoord**

Martijn, 14 november 2026: ‘Repo maak ik zelf.’

**Verwerkt in**

15-11-2026: `MartijndBesten/komnaardekerk` gevuld met de volledige geschiedenis van `komnaardekerk/` (29 commits) plus `PROJECT.md`, `HANDOFF.md`, `VRAGEN.md` en een eigen `CLAUDE.md`. Build en tests vanuit de nieuwe repository groen.

### V-019 — Foto’s en relatie met geloveninhouten.nl

status: open
gesteld_door: claude
datum: 2026-11-15

**Vraag**

1. Dekt jouw toestemming ook de foto’s van geloveninhouten.nl? Zo ja: van wie is die toestemming (de beheerder van die site, de kerken zelf?), en weten de mensen die herkenbaar op de foto’s staan ervan? Op twee foto’s staan vooral kinderen (Sionkerk-jeugd, Het Kruispunt).
2. Wat wordt de verhouding tussen de twee sites: geloveninhouten.nl laten doorverwijzen naar Kom naar de kerk, naar elkaar linken, of los houden?

**Waarom nodig**

Foto’s van herkenbare mensen, en zeker van kinderen, mogen onder de AVG alleen met hun toestemming (of die van de ouders) op een nieuwe site, en de fotograaf houdt het auteursrecht. Toestemming van de beheerder van een site dekt dat niet automatisch. Bruikbaarheid per foto: EGH (groep buiten, 2018), Eskol (collage met maaltijd), Het Kruispunt (koffie na de dienst), PKN Houten (gesprek in een kring) zijn goed bruikbaar voor de kerkkaarten; Sionkerk-jeugd alleen met toestemming van de ouders; De Lichtboog is een schermafbeelding van YouTube (met naam en knoppen in beeld) en dus niet bruikbaar. Twee sites met hetzelfde doel verdelen bezoekers en moeten allebei worden bijgehouden; de diensttijden op geloveninhouten.nl lopen al achter (Eskol-kerk).

**Antwoord**

Martijn, 15 november 2026, vraag 2: ‘Die andere site gaat offline.’ Daarmee vervalt de vraag over de verhouding tussen de twee sites. Vraag 1 (toestemming voor de foto’s) staat nog open; zonder antwoord worden de foto’s niet gebruikt.

**Verwerkt in**

Nog niet verwerkt.

## Beantwoorde en verwerkte vragen
