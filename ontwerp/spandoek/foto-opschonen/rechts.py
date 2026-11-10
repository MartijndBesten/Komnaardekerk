# Rechterdeel (waar het busje stond) opnieuw opbouwen uit gemeten lijnen.
# gebruik: rechts.py in.png uit.png
import sys, cv2, numpy as np
rng = np.random.default_rng(7)
foto = cv2.imread(sys.argv[1]).astype(np.float32)
m = cv2.imread('masker.png', 0); m[:, :1200] = 0
m[574:602, 1278:1312] = 255; m[560:602, 1574:1600] = 255
H, W = m.shape
ys, xs = np.mgrid[0:H, 0:W].astype(np.float32)

def lijn(punten):
    px, py = zip(*punten)
    return lambda x: np.interp(x, px, py)

# bronlijnen (links van het busje, x 1165..1304)
L1s = lambda x: 488.0 - 0.0657 * (x - 1160)      # gras / zandstrook
L2s = lambda x: 500.0 - 0.0957 * (x - 1160)      # stoeprand / asfalt
L3s = lambda x: 532.0 - 0.1430 * (x - 1160)      # asfalt / vluchtheuvel
L4 = 570.0                                        # onderkant stoeprand vluchtheuvel
# doellijnen (achter het busje)
L1d = lijn([(1304, 478.5), (1380, 472), (1430, 461.5), (1477, 448.5), (1510, 438)])
L2d = lijn([(1304, 486.2), (1380, 480), (1430, 469), (1477, 456.5), (1515, 444)])
L3d = lijn([(1304, 511.4), (1470, 487.7)])

A, Bx = 1304.0, 1250.0                             # spiegelas en linkergrens van de bron
def pingpong(x, lo=Bx, hi=A):
    t = (x - hi) % (2 * (hi - lo))
    return np.where(t < (hi - lo), hi - t, lo + (t - (hi - lo)))
xsb = pingpong(xs)                                 # bron-x per doelpixel
xsb_breed = pingpong(xs, 1168.0, A)

def neem(mx, my):
    return cv2.remap(foto, mx.astype(np.float32), my.astype(np.float32), cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)

# 1. glad asfalt als ondergrond: vlak door asfaltpunten rond het gat + korrel
ring = cv2.dilate(m, np.ones((31, 31), np.uint8)) > 0
ring &= m == 0
mx_, mn_ = foto.max(2), foto.min(2); gem = foto.mean(2)
asfalt = ring & (mx_ - mn_ < 16) & (gem > 80) & (gem < 150)
P = np.c_[np.ones(asfalt.sum()), xs[asfalt], ys[asfalt]]
coef = np.linalg.lstsq(P, foto[asfalt], rcond=None)[0]
basis = coef[0] + xs[..., None] * coef[1] + ys[..., None] * coef[2]
korrel = cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 0.9)
grof = cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 6)
basis = basis + (korrel / korrel.std() * 2.2 + grof / grof.std() * 1.6)[..., None]
uit = basis.copy()

def leg(laag, gewicht):
    global uit
    g = np.clip(gewicht, 0, 1)[..., None]
    uit = laag * g + uit * (1 - g)

zacht = lambda d, b=1.2: np.clip(d / b + 0.5, 0, 1)   # zachte rand rond afstand 0

# 2. verre weg met stippellijnen (tussen L2d en L3d), dooft uit naar rechts
l2, l3 = L2d(xs), L3d(xs)
v = (ys - l2) / np.maximum(l3 - l2, 1)
weg = neem(xsb_breed, L2s(xsb_breed) + v * (L3s(xsb_breed) - L2s(xsb_breed)))
leg(weg, zacht(ys - l2) * zacht(l3 - ys) * np.clip((1476 - xs) / 40, 0, 1))

# 3. zandstrook met stoeprand (L1d..L2d) en gras erboven
l1 = L1d(xs)
v = (ys - l1) / np.maximum(l2 - l1, 1)
strook = neem(xsb_breed, L1s(xsb_breed) + v * (L2s(xsb_breed) - L1s(xsb_breed)))
leg(strook, zacht(ys - l1) * zacht(l2 - ys + 1))
gras = neem(xsb_breed, L1s(xsb_breed) - (l1 - ys))
leg(gras, zacht(l1 - ys))

# gebogen witte streep: van (1407,606) onderaan naar (1527,460) bovenaan, sluit aan op de bestaande lijnstukken
tt = np.linspace(0, 1, 500)[:, None]
P0, P1, P2, P3 = [np.array(p, np.float32) for p in ((1407, 606), (1434, 558), (1485, 477), (1527, 460))]
bez = (1 - tt) ** 3 * P0 + 3 * (1 - tt) ** 2 * tt * P1 + 3 * (1 - tt) * tt ** 2 * P2 + tt ** 3 * P3
raak = np.gradient(bez, axis=0); raak /= np.linalg.norm(raak, axis=1, keepdims=True)
cx0, cy0, cx1, cy1 = 1290, 440, 1600, 612
gx, gy = xs[cy0:cy1, cx0:cx1], ys[cy0:cy1, cx0:cx1]
d2 = (gx[..., None] - bez[:, 0]) ** 2 + (gy[..., None] - bez[:, 1]) ** 2
ix = d2.argmin(-1)
afst = np.sqrt(d2.min(-1))
teken = np.sign((gx - bez[ix, 0]) * raak[ix, 1] - (gy - bez[ix, 1]) * raak[ix, 0])  # + = links van de streep
SD = np.full((H, W), -999, np.float32); SD[cy0:cy1, cx0:cx1] = afst * teken      # links positief
T = np.zeros((H, W), np.float32); T[cy0:cy1, cx0:cx1] = ix / 499.0

# 4. vluchtheuvel: bovenrand L3d, onderrand L4, rechterrand evenwijdig aan de witte streep, hoeken afgerond
d_in = np.minimum.reduce([ys - l3, L4 - ys, SD - 20])
l3s = L3s(xsb)
bestrating = neem(xsb, l3s + 5 + np.clip((ys - l3 - 5) / np.maximum(L4 - 12 - l3 - 5, 1), 0, 1) * (L4 - 12 - l3s - 5))
bovenrand = neem(xsb, l3s + (ys - l3))
onderrand = neem(xsb, ys)
eiland = np.where((ys - l3 < 5)[..., None], bovenrand, np.where((L4 - ys < 12)[..., None], onderrand, bestrating))
rond = cv2.GaussianBlur((d_in > 0).astype(np.float32), (0, 0), 4)
rond = np.where(xs > 1380, rond, (d_in > 0).astype(np.float32))
a_eiland = cv2.GaussianBlur((rond > 0.5).astype(np.float32), (0, 0), 0.8)
rand_kleur = foto[563:567, 1255:1300].reshape(-1, 3).mean(0)
binnen = cv2.erode((rond > 0.5).astype(np.uint8), np.ones((9, 9), np.uint8))
randzone = (rond > 0.5) & (binnen == 0) & (ys - l3 > 4) & (L4 - ys > 6) & (xs > 1380)
eiland = np.where(randzone[..., None], rand_kleur * 1.04 + korrel[..., None] * 3, eiland)
eiland = np.where((xs > 1380)[..., None], cv2.GaussianBlur(eiland, (0, 0), 0.6), eiland)
leg(eiland, a_eiland * (SD > -900))

# 5. witte streep (rechts massief, links een lichtere geribbelde baan), versmalt naar boven
br = 10.0 * (1 - T) ** 1.6 + 2.2
wit = np.array([232, 234, 236], np.float32)
bereik = (SD > -900) & (ys > 456)
leg(np.broadcast_to(wit, uit.shape), zacht(br / 2 - np.abs(SD - br / 2), 0.8) * bereik * (0.96 - 0.2 * T))
bb = 15 * (1 - T) ** 1.5
ribbel = 0.30 + 0.12 * np.sin(ys * 1.9)
leg(np.broadcast_to(wit, uit.shape), zacht(bb / 2 - np.abs(SD - br - 1.5 - bb / 2), 0.8) * bereik * ribbel * (1 - T))

# 6. rechterberm: kopie langs de richting van de stoeprand
kant = (xs - 1558) * 42 - (ys - 470) * 26          # > 0: rechts van de bermrand
berm = neem(xs + 15, ys + 24)
leg(berm, zacht(kant / 49.4 + 7, 1.5) * (xs > 1540) * (ys < 556))

# samenvoegen met zachte maskerrand
g = cv2.GaussianBlur(m, (0, 0), 1.6).astype(np.float32)[..., None] / 255
res = np.clip(uit * g + foto * (1 - g), 0, 255).astype(np.uint8)
cv2.imwrite(sys.argv[2], res)
z = res[430:630, 720:1620]; cv2.imwrite('zoom-na.png', cv2.resize(z, (1800, 400), interpolation=cv2.INTER_LANCZOS4))
cv2.imwrite('r-na.png', cv2.resize(res[440:620, 1260:1600], (1360, 720), interpolation=cv2.INTER_LANCZOS4))
