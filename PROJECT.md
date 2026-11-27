# PROJECT

project_name: Kom naar de kerk. — gezamenlijke uitnodiging van christelijke kerken in Houten en omgeving
slug: komnaardekerk
owner: Martijn
created: 2026-11-08
updated: 2026-11-15 (verhuisd naar eigen repository)
repository: MartijndBesten/komnaardekerk (eigen repository sinds 15-11-2026; daarvoor de map `komnaardekerk/` in MartijndBesten/martijn-ai-workbench, branch `claude/kom-naar-kerk-website-e9e7sq`)

## Scope-gate (werkwijze/01 §0)

status: bevestigd
bevestigd_door_martijn: 2026-11-08, volledige opdracht in de Claude Code-sessie (geen TRILUX-project; de TRILUX-scope-gate is niet van toepassing)

- Klantvraag: ontwerp en bouw een warme, toegankelijke website voor komnaardekerk.nl, gericht op inwoners van Houten zonder (actieve) kerkelijke band.
- Aangeleverde informatie: uitgebreide opdracht met doelgroepen, paginastructuur, conceptcopy, ontwerpprincipes en technische eisen.
- Gevraagde deliverable: volledig werkend eerste concept met eigen visuele identiteit, Nederlandse content en sterke mobiele ervaring.
- Onduidelijk: deelnemende kerken, verantwoordelijke organisatie, opvolging contactverzoeken, Bijbelvertaling/rechten, hosting → `VRAGEN.md` V-001 t/m V-007.

## Opdracht v2 (2026-11-08)

Van eerste concept naar een hoogwaardige, werkende site voor een missionair initiatief: beoogd domein **komnaardekerk.nu**, preview op **komnaardekerk.martijndenbesten.com**. Jezus Christus staat centraal. Onderzoek van de kerken en missionaire initiatieven, een gezamenlijke geloofsbasis (geïnspireerd op de Sionkerk, niet exclusief gereformeerd), drie logoconcepten met één uitgewerkte richting, fotografie, een opzet om kerken uit te nodigen en een lanceerlijst. Geen kosten, domeinregistraties, DNS-wijzigingen of externe toezeggingen zonder akkoord.

## Doel

Iemand zonder kerkelijke achtergrond laten voelen: *misschien is er ook voor mij een plek*, en de stap naar een eerste kerkbezoek concreet kleiner maken. Geen website óver kerken.

## Scope

### Wel

- Pagina's: Home, Voor het eerst, Kerken in Houten, Wat geloof je eigenlijk?, Even praten?, Over, Privacy (+ bedankt/fout/404).
- Woordmerk en beeldmerk ('De open deur'), kleuren, typografie, merkbestanden.
- Beheerbare inhoud in JSON, build met controles, publicatiepoort, contact-Worker (fail-closed), tests.

### Niet

- Publicatie/uitrol (geen opdracht).
- Echte kerkgegevens, contactpersonen, getuigenissen of foto's (niet aangeleverd; nooit verzinnen).
- CMS, accounts, nieuwsbrief, agenda/nieuws.

## Randvoorwaarden

- Alleen kerken die echt meedoen en toestemming gaven; demo-inhoud overal zichtbaar als voorbeeld.
- WCAG 2.2 AA als doel; mobile-first; AVG: geen cookies/tracking, minimale gegevens, uitdrukkelijke toestemming (art. 9).
- Christelijke identiteit expliciet, zonder kerkelijke strijdpunten op de homepage.

## Besluiten (genomen door Claude, te bevestigen waar in VRAGEN genoemd)

1. **Statische site zonder framework** i.p.v. Next.js: zes inhoudspagina's, vrijwilligersbeheer, maximale snelheid, geen updatelast (B97-recept).
2. **Hosting-doel Cloudflare Workers** met static assets + één Worker voor `/api/contact`; mail via Email Routing (V-005).
3. **Geen stockfoto's**: boogvormige beeldvlakken met 'Foto volgt' en een fotografiebriefing (V-007).
4. **Contactformulier in voorbeeldmodus**: zichtbaar, verstuurt niets, zegt dat eerlijk; productiepoort blokkeert deze stand (V-004).
5. **Kerkvolgorde wordt per bezoek geschud** voor gelijkwaardigheid.
6. **Hulplijnen** (113, De Luisterlijn) bij 'verdriet' en op 'Even praten': verantwoordelijkheid bij een site die eenzame en verdrietige mensen aanspreekt.

## Besluiten v2 (Claude, ter bevestiging)

7. **Alle onderzochte kerken staan in het concept als `kandidaat`** met openbare gegevens van hun eigen website, duidelijk gemarkeerd als ‘nog niet benaderd’. De productieversie toont alleen `deelnemer` met toestemming (afgedwongen in de build).
8. **Activiteiten:** alleen actuele, gecontroleerde activiteiten met een directe kerkelijke of missionaire verbinding. Algemene welzijnsorganisaties blijven buiten de afbakening.
9. **Logo:** na twaalf ontwerprondes gekozen door Martijn: ‘Het raakpunt’ (God en mens reiken naar elkaar; waar ze elkaar bijna raken breekt licht door). Zie docs/LOGO.md; geschiedenis in docs/MERK.md.
10. **Foto's:** echte foto's uit Houten via Wikimedia Commons (CC BY-SA) in plaats van stockbeelden. Geen herkenbare personen.
11. **Footer:** ‘Concept en realisatie door’ met het officiële Denckh-signatuurlogo.
12. **Preview** als één Worker-script met ingebedde bestanden (static-assets-upload werkt niet vanuit de cloud, B99), op het bestaande subdomein.

## Bouwstenen (bibliotheek/BOUWSTENEN.md, versie 39)

- **B97** (statische site met publicatiepoort): recept gevolgd en zelf geïmplementeerd (bronrepo tclp-website is privé/klant, geen licentie, niet gekopieerd): `src/ → dist/`, `--check`, verboden inhoud, dode links/ankers, aria, CSP zonder inline, noindex alleen via `_headers`, browsertest met lokale Cloudflare-nabootsing.
- **B36** (sitemap, robots, metadata): sitemap, robots, canonical, OG, JSON-LD (WebSite, FAQPage, Church alleen voor echte kerken).
- **B38** (visuele controle): Playwright-screenshots + consolefouten, uitgebreid met axe-core.
- **B106** (publieke voordeur op één Worker, misbruikrem per IP): idee overgenomen voor `run_worker_first: ["/api/*"]` en de rate-limit-binding; geen code.
- **B35** (formuliervalidatie): patroon (server valideert alles, NL-meldingen per veld); geen zod, om de Worker zonder dependencies te houden.
- **B71** (foto-upload zonder EXIF): niet nodig; alleen in fotografiebriefing genoemd (EXIF/GPS verwijderen).
- **B61/DENCKH_MERKVERMELDING**: v2 toegepast, met het officiële signatuurlogo als lokaal bestand en hashbewaking in de build.
- **B74** (logofamilie uit een lettertype): recept gevolgd, in Python (fonttools + HarfBuzz) in plaats van opentype.js.
- **B99**: uitrolbeperking cloudsessie meegenomen in README.

## Bronnen

- Opdracht van Martijn (sessie 2026-11-08).
- Lettertypen: Newsreader en Atkinson Hyperlegible Next via npm (@fontsource-variable), SIL OFL 1.1.
- Cloudflare-documentatie (Workers static assets `_headers`, `run_worker_first`) via de Cloudflare-documentatietool.
- NBG-citeerregels: **niet bereikbaar** vanuit de sessie (netwerkbeleid) → V-003.

## Definition of done (concept)

- [x] Alle pagina's gebouwd, navigatie, mobiel en desktop.
- [x] Identiteit (woord- en beeldmerk) en merkbestanden.
- [x] Build-controles, publicatiepoort en tests groen (zie HANDOFF).
- [ ] Echte kerken, verantwoordelijke, Bijbelrechten, opvolging formulier, foto's (VRAGEN).
- [ ] Publicatie (aparte opdracht).

## Besluit 27-11-2026

De kerken blijven op de site met openbare informatie van hun eigen websites, ook zonder dat ze zijn benaderd. Teksten als ‘nog niet benaderd’ staan niet online. Nooit ‘partner’ of ‘deelnemer’ zonder toestemming (zie V-021 voor de productieversie).
