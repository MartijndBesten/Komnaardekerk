#!/usr/bin/env python3
"""Impressie: spandoek (MOE?) op de gevel van de Sionkerk. Alleen intern: de foto komt van
hervormdhouten.nl en mag niet zonder toestemming worden gepubliceerd (VRAGEN). Uitvoer in intern/."""
from pathlib import Path
from PIL import Image, ImageFilter, ImageEnhance

HIER = Path(__file__).parent
foto = Image.open(HIER / 'intern' / 'sionkerk.jpg').convert('RGB')
# vlak van de rode bakstenen bovenbouw, rechts van de belettering (in pixels van de 1920-foto)
X, Y, B = 872, 262, 330
for r in (1, 2, 3):
    doek = Image.open(HIER / 'mockups' / f'spandoek-r{r}-moe.png').convert('RGB')
    H = round(B / 3)
    doek = doek.resize((B, H), Image.LANCZOS)
    # licht van links (zon), iets minder verzadigd: drukwerk in daglicht
    doek = ImageEnhance.Color(doek).enhance(0.92)
    verloop = Image.linear_gradient('L').rotate(90).resize((B, H))
    doek = Image.composite(doek, ImageEnhance.Brightness(doek).enhance(0.9), verloop)
    beeld = foto.copy()
    schaduw = Image.new('RGBA', (B + 16, H + 16), (0, 0, 0, 0))
    schaduw.paste((0, 0, 0, 110), (8, 8, B + 8, H + 8))
    schaduw = schaduw.filter(ImageFilter.GaussianBlur(4))
    beeld.paste(schaduw, (X - 4, Y - 2), schaduw)
    beeld.paste(doek, (X, Y))
    # bevestigingsogen in de hoeken
    for (ox, oy) in ((4, 4), (B - 8, 4), (4, H - 8), (B - 8, H - 8)):
        beeld.paste((200, 200, 200), (X + ox, Y + oy, X + ox + 4, Y + oy + 4))
    beeld.save(HIER / 'intern' / f'sionkerk-spandoek-r{r}.jpg', quality=88)
    uit = beeld.crop((330, 0, 1650, 738))
    uit.save(HIER / 'intern' / f'sionkerk-spandoek-r{r}-uitsnede.jpg', quality=88)
    print('✓ intern/sionkerk-spandoek-r%d.jpg' % r)
