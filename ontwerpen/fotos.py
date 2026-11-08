#!/usr/bin/env python3
"""Uitsneden voor ronde 5, uit de bestaande Commons-bronnen (fotos/bron, CC BY-SA 4.0). Alleen snijden en schalen."""
from pathlib import Path
from PIL import Image
H = Path(__file__).parent
B = H.parent / 'fotos' / 'bron'
def snij(bron, box, naam, breedtes):
    im = Image.open(B / bron).convert('RGB'); w, h = im.size
    s = im.crop((int(box[0]*w), int(box[1]*h), int(box[2]*w), int(box[3]*h)))
    for b in breedtes:
        if b > s.width: continue
        t = s.resize((b, round(s.height*b/s.width)), Image.LANCZOS)
        t.save(H / 'foto' / f'{naam}-{b}.webp', 'WEBP', quality=82, method=6); print(naam, b, t.size)
snij('toren-weiland.jpg', (0.285, 0.2, 0.715, 1.0), 'toren-staand', (640, 1000, 1400))   # toren in de lucht, staand
snij('toren-weiland.jpg', (0.0, 0.42, 1.0, 0.98), 'toren-band', (960, 1600, 2400))      # brede band: weiland en toren
snij('rk-houten.jpg', (0.12, 0.0, 0.55, 0.92), 'rk-staand', (640, 1000, 1400))         # spits van O.L.V. Houten
snij('pleinkerk-deur.jpg', (0.40, 0.0, 0.985, 1.0), 'deur-licht', (420, 560))           # open deur Pleinkerk, licht door glas
snij('oude-dorp.jpg', (0.30, 0.0, 0.85, 1.0), 'oude-dorp', (500, 700))
