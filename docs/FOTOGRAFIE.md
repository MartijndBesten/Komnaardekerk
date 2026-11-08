# Fotografiebriefing komnaardekerk.nl

Het ontwerp toont foto's in een **boogvorm** (de vorm van een kerkdeur). Tot er echte foto's zijn, staat er warm licht met de aanduiding 'Foto volgt'. Er worden bewust geen stockfoto's gebruikt.

## Wat we zoeken

- **Echte mensen uit Houten**, in echte momenten: binnenkomen, koffie na de dienst, iemand die een ander begroet, een kind op de oppas, iemand alleen in een bank in de stilte.
- **Licht**: ochtendlicht door ramen, een open deur van binnenuit gefotografeerd, licht op een vloer of bank.
- **Ruimtes**: het interieur en de ingang van elke deelnemende kerk, zoals een nieuwe bezoeker die ziet.
- **Rustige compositie**: veel ruimte, niet te vol, liefst staand formaat (3:4) zodat het in de boog past. Het bovenste kwart valt in de boogronding weg.

## Wat we níet willen

- Gevouwen handen, perfecte gezinnen, lachende modellen die in de lens kijken.
- Stockfoto's of AI-beelden die doen alsof ze in Houten zijn gemaakt.
- Herkenbare personen zonder hun toestemming (schriftelijk, met doel 'komnaardekerk.nl'). Kinderen alleen met toestemming van ouders, liefst onherkenbaar.

## Per kerk

1 staande foto (interieur of ingang, mét mensen als dat kan), minimaal 1200 × 1600 px, plus een korte beschrijving voor slechtzienden (`fotoAlt`), bijvoorbeeld: "Ochtendlicht valt door de hoge ramen op de lege achterste banken."

## Algemeen (homepage, 'Samen gaan', 'Even praten')

- Twee mensen bij een kerkdeur, van achteren of opzij.
- Twee mensen in gesprek aan een keukentafel of op een bankje, ongeposeerd.
- Een interieur in ochtendlicht met een paar mensen op de achterste rij.

## Technisch

Lever JPEG of WebP; de site verkleint niet automatisch. Zet bestanden in `src/static/foto/` en verwijs ernaar in `content/kerken.json` (`"foto": "/foto/<naam>.webp"`). Maak ze vóór plaatsing maximaal 1200 px breed (± 150–250 kB) en verwijder locatiegegevens (EXIF/GPS).
