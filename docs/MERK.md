# Merk 'Kom naar de kerk.'

Werkdocument met beelden: `/ontwerp/` op de conceptsite. Alle logobestanden worden gegenereerd uit `src/lib/logo.mjs` met `npm run merk`. Het woordmerk bestaat uit letterpaden (Newsreader, OFL), gemaakt met `scripts/merk_paden.py`.

## Drie concepten

| | A · De open deur | B · Portaal | C · De punt is een deur |
|---|---|---|---|
| Idee | Rondboog met deur op een kier; licht valt door de spleet naar buiten over de grond | Drie geneste bogen: meerdere kerken, één ingang | De punt achter ‘kerk.’ is een kleine verlichte deur; los merk: monogram ‘K.’ |
| Sterk | Herkenbaar zonder tekst, warm, vertelt het hele verhaal | Elegant, architectonisch, ‘samen’ | Typografisch, subtiel, sterk in tekstregels |
| Zwak | Kerkportaal-vorm kan klassiek ogen als hij zwaar wordt | Op 16 px lopen lijnen dicht; leest ook als ‘regenboog’ of ‘wifi’ | Als los symbool weinig zeggingskracht |

Gebruikstoets (1–5): zie de tabel op `/ontwerp/`.

## Keuze: A, met de punt-deur uit C

- **Beeldmerk:** rondboog (kozijn, inkt), deurblad op een kier (mos), lichtspleet en lichtbaan (goud). Geen kruis: het christelijke zit in het kerkportaal, het licht en de woorden.
- **Woordmerk:** ‘Kom naar de kerk.’ in zinsopbouw (hoofdletter + punt): een uitnodiging die ook een uitspraak is. De punt is een kleine verlichte deur. Kleine letters overal voelde zachter maar minder betrouwbaar; hoofdletters te formeel.
- **Getoetst en aangepast:** een gouden boog op een donker vlak las als grafsteen. Daarom altijd de deur op een kier, nooit een massieve boog op donker.
- **Portaal (B)** leeft voort in de lijnillustraties en de dubbele boog rond de heldfoto.

## Varianten (`src/static/merk/logo/`)

| Bestand | Gebruik |
|---|---|
| `logo-horizontaal(-donker/-zwart/-wit).svg` | standaard, kop van de site, briefpapier |
| `logo-staand(…).svg` | compact: voet, poster, social-profiel |
| `beeldmerk(…).svg` | zonder tekst: stempel, sticker, watermerk |
| `woordmerk(…).svg` | als het beeldmerk al elders staat |
| `icoon.svg`, `icoon-512.png`, `favicon-32.png`, `apple-touch-icon.png` | app-icoon en favicon |
| `logo-horizontaal-1600.png` | voor programma's zonder SVG |

Zwart en wit zijn echte 1-kleurversies: de lichtspleet is een uitsparing, geschikt voor stempel, gravure en vinyl (fysieke snijproef niet gedaan).

**Kleinste maat:** beeldmerk 16 px / 5 mm; horizontaal logo 120 px / 30 mm breed. **Vrije ruimte:** rondom minstens de breedte van de deuropening.

**Niet doen:** het merk vervormen of draaien; de deur dicht tekenen; het goud als tekstkleur op licht papier gebruiken (te weinig contrast); de boog massief op donker zetten; een kruis toevoegen.

## Kleuren

| Naam | Hex | Gebruik |
|---|---|---|
| Papier | `#F5EFE4` | achtergrond |
| Zand / zand-diep | `#ECE2D0` / `#E0D1B7` | afwisselende vlakken |
| Licht-zacht | `#F8E6BF` | ‘Je hoeft niets’-vlak |
| Inkt | `#1E2721` | tekst, kozijn, knoppen |
| Mos | `#4C5B44` | deurblad, bovenregels |
| Klei | `#9C4325` | cursieve accenten, links, focus |
| Licht | `#E3A63F` | licht in merk en illustraties (niet voor tekst) |

## Letters

Newsreader (koppen, woordmerk; alleen gewicht 400 en cursief) en Atkinson Hyperlegible Next (tekst; ontworpen voor slechtzienden). Beide SIL OFL, zelf gehost.

## Beeldtaal

Drie richtingen onderzocht: (1) open deur en natuurlijk licht, (2) ontmoeting en gastvrijheid, (3) architectuur, lichtval en redactionele typografie. Samengevoegd: (1) draagt merk en hero, (3) de paginakoppen, (2) komt via lijnillustraties tot er echte foto's met toestemming zijn. Zie docs/FOTOGRAFIE.md.

## Drukwerk en sociale media

Toepassingen staan als voorbeeld op `/ontwerp/`: visitekaartje (85×55), uitnodigingskaart (A6), poster (A3) en social-post (1:1). Het merk werkt op al deze formaten. Voor drukwerk: kleuren omzetten naar CMYK/Pantone en een drukproef maken (niet gedaan).

## Makersvermelding

In de voet: ‘Concept en realisatie door’ + het officiële Denckh-signatuurlogo (byte-identiek aan `MartijndBesten/denckh` `public/brand/`, bewaakt met een hash in de build), link naar https://denckh.nl. Geen onderdeel van het logo.
