#!/usr/bin/env python3
"""Turn data/mobile-icon.png into the app's icons.

The source art is a rounded black square with a white margin around it. iOS
applies its own squircle mask on top, so shipping it as-is gives you a white
frame around a double-rounded square. This crops to the artwork, repaints the
leftover white corners black, and writes the sizes Next.js expects.

    python3 data/make-icons.py

Requires Pillow. Re-run after replacing mobile-icon.png.
"""

import pathlib
from PIL import Image

HERE = pathlib.Path(__file__).parent
APP = HERE.parent / "app" / "src" / "app"
PUBLIC = HERE.parent / "app" / "public"
SRC = HERE / "mobile-icon.png"


def is_white(c):
    r, g, b = c[:3]
    return r > 235 and g > 235 and b > 235


def main():
    src = Image.open(SRC).convert("RGB")
    w, h = src.size
    px = src.load()

    xs = [x for x in range(w) if any(not is_white(px[x, y]) for y in range(0, h, 3))]
    ys = [y for y in range(h) if any(not is_white(px[x, y]) for x in range(0, w, 3))]
    im = src.crop((xs[0], ys[0], xs[-1] + 1, ys[-1] + 1))

    ip = im.load()
    black = ip[im.size[0] // 2, 8]  # top edge, inside the rounded rect
    for y in range(im.size[1]):
        for x in range(im.size[0]):
            if is_white(ip[x, y]):
                ip[x, y] = black

    side = max(im.size)
    if im.size != (side, side):
        sq = Image.new("RGB", (side, side), black)
        sq.paste(im, ((side - im.size[0]) // 2, (side - im.size[1]) // 2))
        im = sq

    im.resize((512, 512), Image.LANCZOS).save(APP / "icon.png")
    im.resize((180, 180), Image.LANCZOS).save(APP / "apple-icon.png")
    # Chrome wants a 192 as well before it will treat the app as installable.
    PUBLIC.mkdir(parents=True, exist_ok=True)
    im.resize((192, 192), Image.LANCZOS).save(PUBLIC / "icon-192.png")
    # Turbopack's ICO decoder rejects non-RGBA PNGs inside an .ico.
    im.convert("RGBA").resize((64, 64), Image.LANCZOS).save(
        APP / "favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)]
    )
    print(f"wrote icon.png, apple-icon.png, favicon.ico to {APP}")
    print(f"wrote icon-192.png to {PUBLIC}")


if __name__ == "__main__":
    main()
