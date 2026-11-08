#!/usr/bin/env python3
"""Impressie: spandoek per concept op de gevel van de Sionkerk. Alleen intern: de foto komt van
hervormdhouten.nl en mag niet zonder toestemming worden gepubliceerd (VRAGEN V-011). Uitvoer in intern/."""
from pathlib import Path
from PIL import Image, ImageFilter, ImageEnhance

HIER = Path(__file__).parent
foto = Image.open(HIER.parent / 'voorstellen' / 'intern' / 'sionkerk.jpg').convert('RGB')
(HIER / 'intern').mkdir(exist_ok=True)
X, Y, B = 872, 262, 330  # rode bovenbouw, rechts van de belettering (pixels in de 1920-foto)
for c in 'abc':
    doek = Image.open(HIER / 'spandoek' / f'spandoek-{c}.png').convert('RGB')
    H = round(B / 3)
    doek = ImageEnhance.Color(doek.resize((B, H), Image.LANCZOS)).enhance(0.94)
    verloop = Image.linear_gradient('L').rotate(90).resize((B, H))
    doek = Image.composite(doek, ImageEnhance.Brightness(doek).enhance(0.9), verloop)
    beeld = foto.copy()
    schaduw = Image.new('RGBA', (B + 16, H + 16), (0, 0, 0, 0))
    schaduw.paste((0, 0, 0, 110), (8, 8, B + 8, H + 8))
    schaduw = schaduw.filter(ImageFilter.GaussianBlur(4))
    beeld.paste(schaduw, (X - 4, Y - 2), schaduw)
    beeld.paste(doek, (X, Y))
    for ox, oy in ((4, 4), (B - 8, 4), (4, H - 8), (B - 8, H - 8)):
        beeld.paste((200, 200, 200), (X + ox, Y + oy, X + ox + 4, Y + oy + 4))
    beeld.crop((330, 0, 1650, 738)).save(HIER / 'intern' / f'sionkerk-{c}.jpg', quality=88)
    beeld.crop((700, 180, 1300, 470)).resize((1200, 580), Image.LANCZOS).save(HIER / 'intern' / f'sionkerk-{c}-detail.jpg', quality=88)
    print('✓ intern/sionkerk-%s.jpg' % c)
