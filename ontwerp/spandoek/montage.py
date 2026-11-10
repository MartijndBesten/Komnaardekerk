#!/usr/bin/env python3
"""Impressie: het spandoek in de lichtbak op de gevel, in een voorbeeldfoto (1600 x 888).
Gebruik: python3 montage.py <foto.jpg> <uitmap>
De foto zelf blijft buiten git (herkomst en rechten onbekend); alleen dit script staat in de repo."""
import sys
from pathlib import Path
from PIL import Image, ImageFilter, ImageDraw, ImageFont

HIER = Path(__file__).parent
foto = Image.open(sys.argv[1]).convert('RGB')
UIT = Path(sys.argv[2]); UIT.mkdir(parents=True, exist_ok=True)
S = 4  # op 4x resolutie samenstellen, daarna terugschalen: scherpere randen
X0, Y0, X1, Y1 = 494, 292, 662, 328  # buitenkant van de lichtbak in de foto

def montage(doekpad):
    groot = foto.resize((foto.width * S, foto.height * S), Image.LANCZOS)
    b, h = (X1 - X0) * S, (Y1 - Y0) * S
    rand = 3 * S // 2
    lijst = Image.new('RGB', (b, h), (62, 60, 58))
    doek = Image.open(doekpad).convert('RGB').resize((b - 2 * rand, h - 2 * rand), Image.LANCZOS)
    lijst.paste(doek, (rand, rand))
    groot.paste(lijst, (X0 * S, Y0 * S))
    beeld = groot.resize(foto.size, Image.LANCZOS)
    # zachtheid van de foto overnemen
    vlak = (X0 - 2, Y0 - 2, X1 + 2, Y1 + 2)
    beeld.paste(beeld.crop(vlak).filter(ImageFilter.GaussianBlur(0.35)), vlak[:2])
    return beeld

uit = {}
for v in ('donker', 'licht'):
    beeld = montage(HIER / f'spandoek-moe-{v}.png')
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
