"""Split logo-mark-light.png into animation layers: letters, top, dashes."""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

src = Path(__file__).resolve().parents[1] / 'public' / 'brand' / 'logo-mark-light.png'
out_dir = Path(__file__).resolve().parents[1] / 'public' / 'brand' / 'mark-layers'
out_dir.mkdir(exist_ok=True)

im = Image.open(src).convert('RGBA')
arr = np.asarray(im).copy()
r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]

orange = (a > 40) & (r > 180) & (g < 140) & (b < 100)
white = (a > 40) & (r > 200) & (g > 200) & (b > 200)

white_u8 = (white * 255).astype(np.uint8)
white_img = Image.fromarray(white_u8, mode='L')

# Thin strokes vanish under strong erosion; letters survive.
thick_core = np.asarray(white_img.filter(ImageFilter.MinFilter(17))) > 0
thick = (
    np.asarray(
        Image.fromarray((thick_core * 255).astype(np.uint8)).filter(
            ImageFilter.MaxFilter(17)
        )
    )
    > 0
)
dashes = white & ~thick

# Center crease (fold axis) always belongs to dashes layer.
fold_x = 602
band = 18
dashes[:, fold_x - band : fold_x + band + 1] |= white[
    :, fold_x - band : fold_x + band + 1
]
letters = white & ~dashes

# Slightly thicken dashes for cleaner render at display size.
dashes = (
    np.asarray(
        Image.fromarray((dashes * 255).astype(np.uint8)).filter(
            ImageFilter.MaxFilter(3)
        )
    )
    > 0
) & ~orange

left = letters.copy()
left[:, fold_x:] = False
right = letters.copy()
right[:, : fold_x + 1] = False


def save_layer(mask, name, use_source_color=True, fill=None):
    out = np.zeros_like(arr)
    if use_source_color:
        out[mask] = arr[mask]
    else:
        out[mask] = fill
    Image.fromarray(out, 'RGBA').save(out_dir / name)
    print(name, int(mask.sum()))


# Оранжевый верх — две прямоугольные створки (в изометрии параллелограммы).
# Режем не по диагонали ромба (треугольники), а через середины сторон.
# Углы ромба (из маски): T/R/B/L.
_t = np.array([601.0, 0.0])
_r = np.array([1167.0, 325.0])
_b = np.array([602.0, 651.0])
_l = np.array([41.0, 326.0])
_m_tl = (_t + _l) / 2
_m_br = (_b + _r) / 2
_seam = _m_br - _m_tl
_oy, _ox = np.where(orange)
_cross = (_ox - _m_tl[0]) * _seam[1] - (_oy - _m_tl[1]) * _seam[0]
orange_l = np.zeros_like(orange)
orange_r = np.zeros_like(orange)
orange_l[_oy[_cross < 0], _ox[_cross < 0]] = True
orange_r[_oy[_cross >= 0], _ox[_cross >= 0]] = True
orange_l &= orange
orange_r &= orange

save_layer(orange, 'top.png')
save_layer(orange_l, 'top-left.png')
save_layer(orange_r, 'top-right.png')
save_layer(left, 'letter-b.png')
save_layer(right, 'letter-k.png')
save_layer(dashes, 'dashes.png')

comp = np.zeros_like(arr)
comp[orange] = arr[orange]
comp[left] = arr[left]
comp[right] = arr[right]
comp[dashes] = arr[dashes]
Image.fromarray(comp, 'RGBA').save(out_dir / '_preview.png')
print('wrote', out_dir)
