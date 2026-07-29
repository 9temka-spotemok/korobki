"""Rebuild horizontal wordmarks with tagline ПРОИЗВОДСТВО ГОФРОКАРТОНА."""

from __future__ import annotations

import os
from PIL import Image, ImageDraw, ImageFont

ORANGE = (255, 90, 31, 255)
WHITE = (255, 255, 255, 255)
GRAY = (90, 90, 96, 255)

BRAND_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'brand')
TITLE = 'БАЛТКАРТОН'
TAG = 'ПРОИЗВОДСТВО ГОФРОКАРТОНА'

TITLE_FONTS = [
    r'C:\Windows\Fonts\impact.ttf',
    r'C:\Windows\Fonts\arialbd.ttf',
]
TAG_FONTS = [
    r'C:\Windows\Fonts\arialbd.ttf',
    r'C:\Windows\Fonts\segoeuib.ttf',
]


def load_font(paths: list[str], size: int) -> ImageFont.ImageFont:
    for path in paths:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def mark_end_x(src: Image.Image) -> int:
    w, h = src.size
    px = src.load()
    densities = []
    for x in range(w):
        count = sum(1 for y in range(h) if px[x, y][3] > 40)
        densities.append(count)

    peak = max(densities[: w // 2] or [1])
    mark_end = 0
    seen_dense = False
    for x, density in enumerate(densities):
        if density > peak * 0.25:
            seen_dense = True
            mark_end = x
        elif seen_dense and x > w * 0.22 and density < peak * 0.05:
            mark_end = x
            break
    return min(w - 1, mark_end + 8)


def rebuild(src_name: str, tag_color: tuple[int, int, int, int], out_name: str) -> None:
    src_path = os.path.join(BRAND_DIR, src_name)
    src = Image.open(src_path).convert('RGBA')
    w, h = src.size
    cut = mark_end_x(src)
    mark = src.crop((0, 0, cut, h))

    title_font = load_font(TITLE_FONTS, 210)
    tag_font = load_font(TAG_FONTS, 72)

    probe = ImageDraw.Draw(Image.new('RGBA', (1, 1)))
    tb = probe.textbbox((0, 0), TITLE, font=title_font)
    title_w, title_h = tb[2] - tb[0], tb[3] - tb[1]
    gb = probe.textbbox((0, 0), TAG, font=tag_font)
    tag_w, tag_h = gb[2] - gb[0], gb[3] - gb[1]

    gap = 48
    canvas_w = cut + gap + max(title_w, tag_w) + 40
    out = Image.new('RGBA', (canvas_w, h), (0, 0, 0, 0))
    out.paste(mark, (0, 0), mark)

    draw = ImageDraw.Draw(out)
    block_h = title_h + 28 + tag_h
    y0 = (h - block_h) // 2 - 10
    x0 = cut + gap
    draw.text((x0 - tb[0], y0 - tb[1]), TITLE, font=title_font, fill=ORANGE)
    draw.text((x0 - gb[0], y0 + title_h + 28 - gb[1]), TAG, font=tag_font, fill=tag_color)

    out_path = os.path.join(BRAND_DIR, out_name)
    out.save(out_path, 'PNG')
    print(f'{out_name}: {out.size}, mark_end={cut}')


def main() -> None:
    rebuild('logo-horizontal-light.png', WHITE, 'logo-horizontal-light.png')
    rebuild('logo-horizontal-dark.png', GRAY, 'logo-horizontal-dark.png')


if __name__ == '__main__':
    main()
