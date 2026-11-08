# Ontwerpvoorstel ronde 4: drie richtingen

Status: **voorstel, niet gekozen, niet gepubliceerd.** De live preview en `dist/` zijn ongewijzigd.
Presentatie (privé): https://claude.ai/artifact/GuJLnsCB6djkUm2EMU3PKU

## Wat er ligt

| Onderdeel | Bestand |
|---|---|
| Drie beeldmerken, woordmerken, paletten | `voorstellen/logos.mjs` (geometrie uit code, woordmerken als letterpaden in `voorstellen/merk/`) |
| Levensvragen + woordbeoordeling | `voorstellen/levensvragen.json` |
| Klikbaar prototype, drie stijlen | `voorstellen/bouw.mjs`, `proto.css`, `proto.js` → `voorstellen/dist/` (niet in git) |
| Tests prototype | `voorstellen/test-prototype.mjs` (31 scenario's) |
| Spandoeken, kaart, poster | `voorstellen/mockups.mjs` → `voorstellen/mockups/*.webp` |
| Montage Sionkerk | `voorstellen/montage.py` → `voorstellen/intern/` (niet in git, foto niet vrij) |
| Liggende fotouitsnede | `voorstellen/fotos_voorstel.py` → `voorstellen/foto/` |

```bash
node voorstellen/bouw.mjs && node voorstellen/serve.mjs 8790   # http://localhost:8790/
node voorstellen/test-prototype.mjs                            # 31/31
node voorstellen/mockups.mjs && python3 voorstellen/montage.py
```

## De richtingen

| | 1 Stralenkrans | 2 Roosvenster | 3 De ster |
|---|---|---|---|
| Beeld | stralenkrans, kruis in de hoofdstralen | roosvenster met licht door glas | geslepen vierpuntster, gloed, sterretjes |
| Kleur | warm wit, diepgroen, salie, terracotta, antraciet | kalksteen, antraciet, terracotta, baksteen, salie | avondhemel, diepe nacht, salie, dageraad, warm wit |
| Letter | Newsreader (schreef) | Archivo smal, kapitalen | Instrument Serif, kleine letters |
| Sterk | expliciet christelijk, stralend | sterkste spandoek op afstand | hemels, neutraal tussen tradities, werkt klein |
| Risico | leest als monstrans (katholiek) | minst hemels, ‘gebouw’ in plaats van Jezus; zwak klein | kerstsfeer; ‘AI-sparkle’-associatie |

Geen geel of oker als hoofdkleur. Denckh staat alleen in de footer van de website (officieel signatuurlogo), niet op spandoek, kaart of poster.

## Advies (keuze ligt bij Martijn, V-010)

Richting 3, De ster: ster als licht en richting (geen kerstster), spandoek op ware grootte testen op 30–50 m, en eventueel de spandoekletter van richting 2 lenen. Merk voorleggen aan een reformatorische en een katholieke voorganger.

## Woorden

Spandoek: MOE?, ALLEEN?, ZOEKEND?, NIEUWSGIERIG? (reserve: ONRUST?, TWIJFELS?, VASTGELOPEN?; seizoen: DANKBAAR?, OPNIEUW?).
Alleen website: Verdriet, Bang, Baan kwijt, Gescheiden, Iemand verloren, Ziek, Gelukkig, Meer weten.
Niet gebruiken: Eenzaam, Depressief/Burn-out, Verslaafd, Schuldig/Zondaar, Verloren, Wanhopig/Kapot. Onderbouwing per woord in `levensvragen.json`.

## Grenzen die het prototype bewaakt

- Niets wordt opgeslagen of verstuurd (test controleert localStorage, sessionStorage, cookies en externe verzoeken).
- Werkt zonder JavaScript: elk woord heeft een eigen pagina (spandoekadres, bijv. `/moe/`).
- Bij zware woorden: grens ‘geen vervanging van professionele hulp’ + 113 en De Luisterlijn.
- Bijbelgedachten vrij weergegeven met vindplaats en link naar debijbel.nl, tot het NBG toestemming geeft (V-003).
- Kerken als ‘nog niet benaderd’, filters alleen op feiten, volgorde per bezoek geschud.
