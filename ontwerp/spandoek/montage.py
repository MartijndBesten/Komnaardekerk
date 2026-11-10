#!/usr/bin/env python3
"""Impressie: het spandoek in de lichtbak op de gevel, in een voorbeeldfoto (1600 x 888).
Gebruik: python3 montage.py <foto.jpg> <uitmap> [woord, standaard 'moe']
De foto zelf blijft buiten git (herkomst en rechten onbekend); alleen dit script staat in de repo."""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter, ImageDraw, ImageFont

HIER = Path(__file__).parent
foto = Image.open(sys.argv[1]).convert('RGB')
UIT = Path(sys.argv[2]); UIT.mkdir(parents=True, exist_ok=True)
WOORD = sys.argv[3] if len(sys.argv) > 3 else 'moe'
S = 4  # op 4x resolutie samenstellen, daarna terugschalen: scherpere randen
# Hoekpunten van het bord in de foto (linksboven, rechtsboven, rechtsonder, linksonder), gemeten aan het
# voorbeeldbord: de wand loopt schuin weg, dus het bord is in beeld geen rechte rechthoek.
HOEKEN = [(494.5, 298.5), (661.5, 292.5), (661.5, 326.2), (494.5, 329.6)]

def coeff(doel, bron):
    """Coëfficiënten voor Image.transform(PERSPECTIVE): doel (in de foto) -> bron (in het doek)."""
    A, B = [], []
    for (x, y), (u, v) in zip(doel, bron):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); B.append(u)
        A.append([0, 0, 0, x, y, 1, -v * x, -v * y]); B.append(v)
    return np.linalg.solve(np.array(A, float), np.array(B, float)).tolist()

def montage(doekpad):
    groot = foto.resize((foto.width * S, foto.height * S), Image.LANCZOS)
    doek = Image.open(doekpad).convert('RGB')
    rand = round(doek.height * 0.045)  # smalle lijst van de lichtbak
    bord = Image.new('RGB', (doek.width + 2 * rand, doek.height + 2 * rand), (62, 60, 58))
    bord.paste(doek, (rand, rand))
    doel = [(x * S, y * S) for x, y in HOEKEN]
    bron = [(0, 0), (bord.width, 0), (bord.width, bord.height), (0, bord.height)]
    c = coeff(doel, bron)
    laag = bord.transform(groot.size, Image.PERSPECTIVE, c, Image.BICUBIC)
    masker = Image.new('L', bord.size, 255).transform(groot.size, Image.PERSPECTIVE, c, Image.BICUBIC)
    groot.paste(laag, (0, 0), masker)
    beeld = groot.resize(foto.size, Image.LANCZOS)
    # zachtheid van de foto overnemen
    vlak = (490, 288, 666, 334)
    beeld.paste(beeld.crop(vlak).filter(ImageFilter.GaussianBlur(0.35)), vlak[:2])
    return beeld

uit = {}
for v in ('donker', 'licht'):
    beeld = montage(HIER / f'spandoek-{WOORD}-{v}.png')
    beeld.save(UIT / f'gevel-{v}.jpg', quality=90)
    uit[v] = beeld
    print('✓', UIT / f'gevel-{v}.jpg')

# Voor/na-detail: links het voorbeeld, rechts de nieuwe versies
kader = (430, 235, 760, 345)
f = 3
delen = [('Voorbeeld', foto), ('Nieuw, donker', uit['donker']), ('Nieuw, licht', uit['licht'])]
bw, bh = (kader[2] - kader[0]) * f, (kader[3] - kader[1]) * f
vel = Image.new('RGB', (bw, (bh + 60) * len(delen)), (250, 247, 240))
d = ImageDraw.Draw(vel)
try:
    letter = ImageFont.truetype('DejaVuSans-Bold.ttf', 30)
except OSError:
    letter = ImageFont.load_default()
for i, (naam, beeld) in enumerate(delen):
    y = i * (bh + 60)
    d.text((16, y + 14), naam, fill=(42, 27, 30), font=letter)
    vel.paste(beeld.crop(kader).resize((bw, bh), Image.LANCZOS), (0, y + 60))
vel.save(UIT / 'voor-na-detail.jpg', quality=90)
print('✓', UIT / 'voor-na-detail.jpg')
