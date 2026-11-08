#!/usr/bin/env python3
"""Liggende uitsneden voor het prototype (de site zelf gebruikt staande uitsneden, zie scripts/fotos.py).
Bron: fotos/bron/toren-weiland.jpg (Jan Dijkstra, CC BY-SA 4.0, Wikimedia Commons). Alleen schalen en snijden."""
from pathlib import Path
from PIL import Image

HIER = Path(__file__).parent
BRON = HIER.parent / 'fotos' / 'bron' / 'toren-weiland.jpg'
im = Image.open(BRON).convert('RGB')
w, h = im.size
snede = im.crop((0, int(h * 0.2), int(w * 0.8), h))  # toren op ca. 62% van de breedte
for b in (960, 1600, 2400):
    s = snede.resize((b, round(snede.height * b / snede.width)), Image.LANCZOS)
    s.save(HIER / 'foto' / f'toren-breed-{b}.webp', 'WEBP', quality=80, method=6)
    print('✓', f'toren-breed-{b}.webp', s.size)
