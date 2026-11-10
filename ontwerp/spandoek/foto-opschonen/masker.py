import sys
from PIL import Image, ImageDraw, ImageFilter
foto = Image.open(sys.argv[1]).convert('RGB')
m = Image.new('L', foto.size, 0)
d = ImageDraw.Draw(m)
POLY = [
    [(765,512),(772,498),(795,488),(812,476),(818,476),(885,483),(935,492),(980,518),(1042,536),(1054,565),(1052,588),(1020,602),(785,602),(765,580)],
    [(905,482),(918,468),(985,467),(1000,473),(1010,469),(1060,469),(1084,490),(1084,526),(1070,530),(905,530)],
    [(1308,470),(1318,459),(1500,459),(1560,468),(1578,498),(1578,588),(1560,597),(1325,597),(1308,572)],
]
for p in POLY: d.polygon(p, fill=255)
m = m.filter(ImageFilter.MaxFilter(9))
m.save('masker.png')
rood = Image.new('RGB', foto.size, (255, 0, 0))
Image.composite(Image.blend(foto, rood, 0.45), foto, m).crop((720,430,1620,630)).resize((1800,400)).save('masker-controle.png')
