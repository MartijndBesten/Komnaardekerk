#!/usr/bin/env python3
"""Uitsneden voor ronde 6. Alleen snijden en schalen; geen bewerking. Bronnen en licenties: foto/BRONNEN.md."""
from pathlib import Path
from PIL import Image
H = Path(__file__).parent
BRON = H / 'foto' / 'bron'
OUD = H.parent / 'fotos' / 'bron'
def snij(pad, box, naam, breedtes, q=82):
    im = Image.open(pad).convert('RGB'); w, h = im.size
    s = im.crop((int(box[0]*w), int(box[1]*h), int(box[2]*w), int(box[3]*h)))
    for b in breedtes:
        if b > s.width: b = s.width
        t = s.resize((b, round(s.height*b/s.width)), Image.LANCZOS)
        t.save(H / 'foto' / f'{naam}-{b}.webp', 'WEBP', quality=q, method=6); print(naam, t.size)
# Pleinkerk interieur (RCE 1960): staand voor de hero, liggend voor 'De eerste keer'
snij(BRON / 'pleinkerk-interieur-rce.jpg', (0.10, 0.0, 0.73, 1.0), 'interieur-staand', (600, 900, 1200))
snij(BRON / 'pleinkerk-interieur-rce.jpg', (0.0, 0.05, 1.0, 0.80), 'interieur-breed', (960, 1600, 1920))
# Pleinkerk in het weiland (kleur)
snij(BRON / 'pleinkerk-weiland.jpg', (0.0, 0.18, 1.0, 0.92), 'weiland-breed', (960, 1600, 1920))
# O.L.V. Houten van binnen: alleen raam en bogen, zonder personen
snij(BRON / 'olv-houten-interieur.jpg', (0.02, 0.0, 0.40, 0.37), 'olv-bogen', (600, 730))
# O.L.V. Houten van buiten en de open deur van de Pleinkerk (bestaande bronnen)
snij(OUD / 'rk-houten.jpg', (0.12, 0.0, 0.55, 0.92), 'olv-toren', (600, 1000))
snij(OUD / 'pleinkerk-deur.jpg', (0.40, 0.0, 0.985, 1.0), 'pleinkerk-deur', (560,))
# O.L.V. ten Hemelopneming ’t Goy: beschilderd gewelf met kruisbeeld (geen personen)
snij(BRON / 'olv-tgoy-gewelf.jpg', (0.18, 0.0, 0.82, 1.0), 'tgoy-gewelf', (600, 900))
# Pleinkerk in het weiland, smal en staand: lucht boven de toren (voor de spitsboog in de hero)
snij(BRON / 'pleinkerk-weiland.jpg', (0.385, 0.02, 0.615, 0.93), 'weiland-smal', (400, 441))
