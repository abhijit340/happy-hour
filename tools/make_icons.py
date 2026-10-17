"""Generate the app's icons: a clock face whose "remaining" wedge is a happy-hour orange,
on dark ink.

Run from the project root:  python tools/make_icons.py
Writes icons/icon-192.png, icons/icon-512.png, icons/icon-512-maskable.png,
icons/apple-touch-icon.png and icons/icon.svg.
"""
from pathlib import Path

from PIL import Image, ImageDraw

INK = (27, 31, 29, 255)        # #1b1f1d
PAPER = (244, 245, 242, 255)   # #f4f5f2
ORANGE = (234, 108, 46, 255)   # warm happy-hour orange
OUT = Path(__file__).resolve().parent.parent / "icons"
SCALE = 4


def draw(size: int, mode: str) -> Image.Image:
    s = size * SCALE
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if mode in ("maskable", "apple"):
        d.rectangle([0, 0, s, s], fill=INK)
        k = 0.56 if mode == "maskable" else 0.66
    else:
        d.rounded_rectangle([0, 0, s - 1, s - 1], radius=s * 0.22, fill=INK)
        k = 0.68
    r = s * k / 2
    cx = cy = s / 2
    box = [cx - r, cy - r, cx + r, cy + r]
    d.ellipse(box, fill=PAPER)
    # Wedge: 12 o'clock to 4 o'clock (the time left), like a draining timer.
    d.pieslice([cx - r * 0.86, cy - r * 0.86, cx + r * 0.86, cy + r * 0.86], start=-90, end=30, fill=ORANGE)
    # Hands
    w = max(2, int(s * 0.03))
    d.line([cx, cy, cx, cy - r * 0.72], fill=INK, width=w)
    d.line([cx, cy, cx + r * 0.5, cy + r * 0.29], fill=INK, width=w)
    d.ellipse([cx - w, cy - w, cx + w, cy + w], fill=INK)
    return img.resize((size, size), Image.LANCZOS)


def main() -> None:
    OUT.mkdir(exist_ok=True)
    draw(192, "plain").save(OUT / "icon-192.png")
    draw(512, "plain").save(OUT / "icon-512.png")
    draw(512, "maskable").save(OUT / "icon-512-maskable.png")
    draw(180, "apple").convert("RGB").save(OUT / "apple-touch-icon.png")
    (OUT / "icon.svg").write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'
        '<rect width="100" height="100" rx="22" fill="#1b1f1d"/>'
        '<circle cx="50" cy="50" r="34" fill="#f4f5f2"/>'
        '<path d="M50 50 L50 20.8 A29.2 29.2 0 0 1 75.3 64.6 Z" fill="#ea6c2e"/>'
        '<path d="M50 50 V25.5 M50 50 L67 59.9" stroke="#1b1f1d" stroke-width="3.2" stroke-linecap="round"/>'
        '<circle cx="50" cy="50" r="3" fill="#1b1f1d"/></svg>\n', encoding="utf-8")
    print("icons written to", OUT)


if __name__ == "__main__":
    main()
