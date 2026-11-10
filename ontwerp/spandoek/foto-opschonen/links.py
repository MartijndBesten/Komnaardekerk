# Linkerdeel (witte auto en de twee auto's erachter) opnieuw opbouwen uit gemeten lijnen.
# gebruik: links.py in.jpg uit.png
import sys, cv2, numpy as np
rng = np.random.default_rng(11)
foto = cv2.imread(sys.argv[1]).astype(np.float32)
m = cv2.imread('masker.png', 0); m[:, 1200:] = 0
m[584:604, 735:790] = 255; m[584:606, 1030:1075] = 255   # schaduwresten
H, W = m.shape
ys, xs = np.mgrid[0:H, 0:W].astype(np.float32)
lijn = lambda p: (lambda x: np.interp(x, *zip(*p)))
zacht = lambda d, b=1.2: np.clip(d / b + 0.5, 0, 1)
def neem(mx, my):
    return cv2.remap(foto, mx.astype(np.float32), my.astype(np.float32), cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)

# gras / zandstrook / stoeprand / asfalt: links gemeten (bron) en rechts doorgetrokken (doel)
G = lijn([(440, 514), (600, 513), (761, 511), (1090, 492), (1180, 487)])       # bovenkant zandstrook
K = lijn([(440, 544), (600, 542), (761, 534), (1090, 501.5), (1180, 497)])     # bovenkant stoeprand
Aa = lijn([(440, 549), (600, 547), (761, 539), (1090, 504), (1180, 499.5)])    # bovenkant asfalt
SP = 761.0
xb = np.clip(2 * SP - xs, 436, SP)                                              # gespiegelde bron-x

# 1. glad asfalt: vlak door asfaltpunten rond het gat + korrel
ring = (cv2.dilate(m, np.ones((31, 31), np.uint8)) > 0) & (m == 0)
mx_, mn_, gem = foto.max(2), foto.min(2), foto.mean(2)
asfalt = ring & (mx_ - mn_ < 16) & (gem > 80) & (gem < 150) & (ys > Aa(xs) + 3)
P = np.c_[np.ones(asfalt.sum()), xs[asfalt], ys[asfalt]]
coef = np.linalg.lstsq(P, foto[asfalt], rcond=None)[0]
uit = coef[0] + xs[..., None] * coef[1] + ys[..., None] * coef[2]
korrel = cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 0.9)
grof = cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 6)
uit = uit + (korrel / korrel.std() * 2.2 + grof / grof.std() * 1.6)[..., None]

def leg(laag, gewicht):
    global uit
    g = np.clip(gewicht, 0, 1)[..., None]
    uit = laag * g + uit * (1 - g)

# 2. stippellijnen: drie lijnen die aansluiten op de zichtbare stukken links en rechts
wit = np.array([226, 228, 230], np.float32)
LIJNEN = [  # (x0, y0, x1, y1, begin van eerste streep, streeplengte, tussenruimte, dikte links, dikte rechts)
    (761, 551.0, 1090, 518.0, 751, 22, 21, 2.4, 1.6),
    (765, 569.0, 1069, 528.0, 765, 26, 24, 2.7, 1.7),
    (765, 607.0, 1053, 548.0, 756, 33, 27, 3.6, 2.0),
]
for x0, y0, x1, y1, start, lang, gat, d0, d1 in LIJNEN:
    t = np.clip((xs - x0) / (x1 - x0), 0, 1)
    yl = y0 + (y1 - y0) * (xs - x0) / (x1 - x0)
    dik = d0 + (d1 - d0) * t
    schaal = 1 - 0.35 * t                                   # verder weg: kortere strepen
    # fase langs de lijn met krimpende periode
    s = (xs - start) / schaal
    fase = np.mod(s, lang + gat)
    streep = zacht(np.minimum(fase, lang - fase), 2.2)
    slijt = 0.74 + 0.10 * np.sin(s * 0.11 + y0)                # ongelijk gesleten, zoals de echte strepen
    leg(np.broadcast_to(wit, uit.shape), zacht(dik / 2 - np.abs(ys - yl), 1.1) * streep * (xs >= start) * (xs <= x1) * slijt)

# 3. stoeprand, zandstrook en gras: gespiegeld uit het stuk links, langs de doorgetrokken lijnen
g_d, k_d, a_d = G(xs), K(xs), Aa(xs)
g_s, k_s, a_s = G(xb), K(xb), Aa(xb)
rand = neem(xb, k_s + (ys - k_d) / np.maximum(a_d - k_d, 1) * (a_s - k_s))
leg(rand, zacht(ys - k_d) * zacht(a_d - ys + 0.5))
strook = neem(xb, g_s + (ys - g_d) / np.maximum(k_d - g_d, 1) * (k_s - g_s))
leg(strook, zacht(ys - g_d) * zacht(k_d - ys + 0.5))
leg(neem(xb, g_s - (g_d - ys)), zacht(g_d - ys))

g = cv2.GaussianBlur(m, (0, 0), 1.6).astype(np.float32)[..., None] / 255
res = np.clip(uit * g + foto * (1 - g), 0, 255).astype(np.uint8)
cv2.imwrite(sys.argv[2], res)
cv2.imwrite('l-na.png', cv2.resize(res[440:620, 700:1150], (1350, 540), interpolation=cv2.INTER_LANCZOS4))
