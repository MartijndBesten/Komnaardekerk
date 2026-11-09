# Ontwerp ‘Ontmoeting’ (ronde 7): logo en website

Status: **uitgewerkt voorstel, wacht op bevestiging (VRAGEN V-017).** Live preview, `src/`, `content/` en `dist/` zijn ongewijzigd.
Presentatie (privé): https://claude.ai/artifact/QbkU26ZvYVGJahNJLLYqz4
Keuze Martijn (9 november 2026): ‘C is het beste. Ontmoeting tussen God en de mens, maar dan nog verder uitgewerkt, helder licht.’ Vervangt ‘Open deur’ (ronde 6, `docs/ONTWERP-OPEN-DEUR.md`).

## Merk (`ontwerp/merk.mjs`: `ontmoeting`, `merkC`, `logoC`, `faviconC`)

- Twee deurbogen als lijnen die in elkaar grijpen: links God (zee #2C7480: hemel, levend water), rechts de mens (klei #C8653F: Genesis 2:7).
- Waar ze elkaar raken: een spitsboog van licht (#FCE7CF), de vorm van een kerkdeur; groot ook een kleine lichtval naar buiten.
- Kruis op het raakpunt (in Jezus ontmoeten God en mens elkaar). Even hoog: God op ooghoogte.
- Vlak, geen verloop of gloed. Detailniveaus groot / midden / klein (favicon zonder kruis). Eén kleur: positief (lijnen) en negatief (licht gevuld; voorkeur).
- Getoetst en verworpen: kleurvlakken (lezen als vlag: blauw-wit-rood, groen-wit-oranje), hoog-laagvariant (scheve lichtvorm, kruis botst). Aandachtspunt: positief in één kleur kan aan ‘gouden bogen’ doen denken.
- Woordmerk: Atkinson Hyperlegible Next 760, punt in klei.

## Website

Dezelfde pagina’s, teksten en interactie als ronde 6 (zie `docs/ONTWERP-OPEN-DEUR.md`), in de nieuwe stijl:
- Hero: groot merk; in de spitsboog van licht de lucht boven de Pleinkerk (neutraal voor alle tradities); licht erachter gaat langzaam aan.
- Kleuren: papier #FCFAF6, avond #1F2140, zee, klei (tekst #A64F2E), licht, zee-zacht #E6F1F1. Wie is Jezus-blok in zee.
- Letters: Atkinson Hyperlegible Next (koppen en tekst), Newsreader cursief (warme stem, Bijbel).

```bash
python3 ontwerp/fotos.py && node ontwerp/bouw.mjs && node ontwerp/serve.mjs 8794
node ontwerp/test.mjs   # 15/15
```

## Na bevestiging

Zoals beschreven in `docs/ONTWERP-OPEN-DEUR.md` (‘Na bevestiging’): overzetten naar `src/` en `content/`, tests aanpassen en uitbreiden, bundelen, preview vervangen.
