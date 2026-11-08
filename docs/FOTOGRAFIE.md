# Fotografie

## Nu op de site (allemaal echte foto's uit Houten, met licentie)

| Foto | Gebruik | Maker | Licentie |
|---|---|---|---|
| Open deur van de Pleinkerk | hero, deelbeeld, ontwerppagina | IdsVanHouten | CC BY-SA 4.0 |
| Het Oude Dorp met de toren van de Pleinkerk | kop ‘Kerken’ | Jan Dijkstra | CC BY-SA 4.0 |
| Kerktoren boven de weilanden | kop ‘Over ons’, kaart Pleinkerk | Jan Dijkstra | CC BY-SA 4.0 |
| O.L.V. ten Hemelopnemingkerk | kaart RK Houten | Jan Dijkstra | CC BY-SA 4.0 |

Bron, licentie en uitsnede staan in `content/fotos.json`; de naamsvermelding staat bij elke foto. Herkenbare personen zijn bewust vermeden: een CC-licentie dekt het portretrecht niet. Er zijn geen stockfoto's of AI-beelden gebruikt.

**Aandachtspunten:**

- **Gelijkwaardigheid:** de hero toont de Pleinkerk. Zolang niet alle kerken een eigen foto hebben, ligt de nadruk visueel op één kerk. Liefst per kerk een foto, en een hero die wisselt of geen herkenbare kerk toont.
- **Resolutie:** de heldfoto is nu 543 px breed, omdat Wikimedia downloads van grotere versies met een rate-limit weigerde. Haal vóór de lancering de originele 3264 px-versie op (`fotos/bron/pleinkerk-deur.jpg` vervangen, daarna `python3 scripts/fotos.py`).

## Fotostijl

Daglicht, warm en ongeposeerd, met ruimte. Deuren, drempels, lichtval, handen om een kop koffie, iemand die de deur openhoudt: van opzij of van achteren. Liefst staand 3:4, voor de boogvorm. Het bovenste kwart valt in de boogronding weg.

**Niet:** gevouwen handen, stockgezinnen, lachende modellen in de lens, AI-mensen als ‘echte’ bezoekers, herkenbare personen zonder schriftelijke toestemming, kinderen zonder toestemming van de ouders.

## Toevoegen

1. Zet het origineel in `fotos/bron/` en voeg een regel toe aan `content/fotos.json`: bestand, uitsnede, alt-tekst, maker, licentie en bron.
2. `python3 scripts/fotos.py` maakt WebP in de beschikbare breedtes (640, 960 en 1600 px) en verwijdert EXIF en GPS.
3. Koppel de foto aan een kerk: `"foto": "<sleutel>"` in `content/kerken.json`.
