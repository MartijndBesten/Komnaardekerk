#!/usr/bin/env python3
"""Maakt webp-foto's (640/960/1600 breed) uit fotos/bron/ volgens content/fotos.json.
Snijdt bij volgens 'snede', verwijdert alle metadata (EXIF/GPS) en vult w/h in fotos.json aan.
Vereist: pip install pillow
  python3 scripts/fotos.py
"""
import json, os
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
pad = os.path.join(ROOT, 'content', 'fotos.json')
data = json.load(open(pad, encoding='utf-8'))
uit = os.path.join(ROOT, 'src', 'static', 'foto')
os.makedirs(uit, exist_ok=True)

for sleutel, f in data.items():
    if sleutel.startswith('_'):
        continue
    img = ImageOps.exif_transpose(Image.open(os.path.join(ROOT, 'fotos', 'bron', f['bestand']))).convert('RGB')
    w, h = img.size
    l, b, r, o = f.get('snede', [0, 0, 1, 1])
    img = img.crop((round(l * w), round(b * h), round(r * w), round(o * h)))
    basis = f['src'][len('/foto/'):-len('.webp')]
    # Oude varianten van deze foto opruimen; alleen breedtes maken die de bron echt heeft.
    for oud in os.listdir(uit):
        if oud.startswith(basis + '-') and oud.endswith('.webp'):
            os.remove(os.path.join(uit, oud))
    breedtes = [b for b in (640, 960, 1600) if b <= img.width] or [img.width]
    for breedte in breedtes:
        doel = img if img.width == breedte else img.resize((breedte, round(img.height * breedte / img.width)), Image.LANCZOS)
        doel.save(os.path.join(uit, f'{basis}-{breedte}.webp'), 'WEBP', quality=80, method=6)
    f['breedtes'] = breedtes
    f['w'] = breedtes[-1] if breedtes[-1] < 960 else 960
    f['h'] = round(img.height * f['w'] / img.width)
    print(f"✓ {sleutel}: {img.width}x{img.height} → {basis}-{breedtes}.webp")

json.dump(data, open(pad, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(pad, 'a').write('\n')
