# Ontwerpronde 5 (issue #131): drie concepten

Status: **voorstel, niet gekozen, niet gepubliceerd.** Live preview, `src/`, `content/` en `dist/` zijn ongewijzigd.
Presentatie (privé): https://claude.ai/artifact/MRh7d7gtvXw4JFsu5zwUHa
Vervangt de richtingen uit ronde 4 (`voorstellen/`, te veel gloed en stralen: ‘AI-uitstraling’).

## Concepten

| | A Portaal | B Kruisvenster | C Ontmoeting |
|---|---|---|---|
| Idee | romaans portaal, deur op een kier, licht over de drempel | typografie; punt achter ‘kerk’ is een rondboogvenster met kruis | twee deuren overlappen; de overlap is een spitsboog (kerkdeur) |
| Beeld | echte foto’s van Houtense kerken in rondboog-uitsnede | veel wit, venster als dunne lijn over de foto | symbool, plekken voor echte foto’s van mensen (met toestemming) |
| Letter | Newsreader + Atkinson Hyperlegible Next | Archivo smal/zwaar + Atkinson | Atkinson Hyperlegible Next |
| Kleur | kalk, leisteen, baksteen, daglicht, mos | papier, inkt, grafiet, hemelsblauw, ochtend | linnen, avond, klei, zee, licht |

Advies: **A**, met foto’s van binnen in de kerken (met toestemming) en een spandoektest op ware grootte. Keuze: VRAGEN V-014.

## Studio-onderzoek

- EIGA (Aartsbisdom Keulen): open kruis, vier vormen naar één midden, kleuren uit het kerkelijk jaar. Gelezen op eiga.design.
- Studio Mayra & Sam (In de Elleboog): monumentale typografie uit de kerkarchitectuur, echt beeld als basis. Gelezen op mayra-sam.com.
- Mainstudio: inhoud eerst, typografie leidt. Gelezen op mainstudio.com/about.
- Studio Hendriksen (Oude Kerk): **niet bereikbaar** (certificaatfout studiohendriksen.com); alleen de omschrijving uit het issue gebruikt.
- Mandelo (GZB): case-pagina stuurt door naar het algemene portfolio; **niet gelezen**, alleen de omschrijving uit het issue.

## Bestanden

| Wat | Bestand |
|---|---|
| Merken, woordmerken, favicons | `ontwerpen/merken.mjs`, `ontwerpen/merk/*.json` (letterpaden) |
| Teksten (B2) en woordbeoordeling | `ontwerpen/woorden.json` |
| Homepage + woordpagina’s per concept | `ontwerpen/bouw.mjs`, `ontwerpen/stijl/` → `ontwerpen/dist/` (niet in git) |
| Foto-uitsneden (Commons, CC BY-SA 4.0) | `ontwerpen/fotos.py` → `ontwerpen/foto/` |
| Spandoek MOE? per concept | `ontwerpen/spandoek.mjs` → `ontwerpen/spandoek/*.webp`; montage `ontwerpen/montage.py` → `ontwerpen/intern/` (niet in git) |
| Tests | `ontwerpen/test.mjs` |

```bash
node ontwerpen/bouw.mjs && node ontwerpen/serve.mjs 8792   # http://localhost:8792/a/ /b/ /c/
node ontwerpen/test.mjs                                    # 19/19
```

## Fotorechten (open)

- Gebruikt: vier Commons-foto’s uit Houten (CC BY-SA 4.0, met maker).
- Nog niet gebruikt, wel gevonden: o.a. ‘Interieur naar het oosten - Houten - 20117560 - RCE.jpg’ (Pleinkerk, RCE, CC BY-SA 4.0), Pleinkerk 07/09 en O.L.V. Houten/’t Goy (IdsVanHouten, CC BY-SA 4.0). Wikimedia weigerde downloads vanuit de cloudsessie.
- Geen foto’s van mensen; alleen met toestemming (concept C toont plaatshouders).
- Sionkerk-foto (hervormdhouten.nl): alleen interne montage, V-011.
