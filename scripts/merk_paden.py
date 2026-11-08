#!/usr/bin/env python3
"""Zet tekst om in SVG-paden (woordmerk als vector, onafhankelijk van geïnstalleerde fonts).

Recept bouwsteen B74: letters uit het lettertype als paden, met kerning via HarfBuzz.
Vereist: pip install fonttools brotli uharfbuzz

  python3 scripts/merk_paden.py <variabele-font.woff2> <uit.json> wght=500 opsz=72 "Kom naar de kerk" ...

Uitvoer: JSON {tekst: {d, breedte, ascender, descender, xHoogte, kapHoogte, upm}} in font-eenheden,
basislijn op y=0 en y omlaag positief (SVG-richting).
"""
import io, json, sys

import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

bron, uit, *rest = sys.argv[1:]
assen = {k: float(v) for k, v in (a.split('=') for a in rest if '=' in a)}
teksten = [a for a in rest if '=' not in a]

font = TTFont(bron)
if 'fvar' in font:
    font = instantiateVariableFont(font, assen)
buf = io.BytesIO()
font.flavor = None
font.save(buf)
data = buf.getvalue()
font = TTFont(io.BytesIO(data))
glyphset = font.getGlyphSet()
order = font.getGlyphOrder()
upm = font['head'].unitsPerEm
os2 = font['OS/2']

hbfont = hb.Font(hb.Face(data))
resultaat = {}
for tekst in teksten:
    b = hb.Buffer()
    b.add_str(tekst)
    b.guess_segment_properties()
    hb.shape(hbfont, b, {'kern': True, 'liga': True})
    pen = SVGPathPen(glyphset)
    x = 0
    for info, pos in zip(b.glyph_infos, b.glyph_positions):
        naam = order[info.codepoint]
        # spiegel y (font: y omhoog) naar SVG (y omlaag)
        tp = TransformPen(pen, (1, 0, 0, -1, x + pos.x_offset, -pos.y_offset))
        glyphset[naam].draw(tp)
        x += pos.x_advance
    resultaat[tekst] = {
        'd': pen.getCommands(),
        'breedte': x,
        'ascender': os2.sTypoAscender,
        'descender': os2.sTypoDescender,
        'xHoogte': getattr(os2, 'sxHeight', 0),
        'kapHoogte': getattr(os2, 'sCapHeight', 0),
        'upm': upm,
    }
json.dump(resultaat, open(uit, 'w'), indent=1)
print('✓', uit, ', '.join(f"{t!r}: {v['breedte']}" for t, v in resultaat.items()))
