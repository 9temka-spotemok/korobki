"""Собирает src/data/pantone.js из Pantone Color Bridge Coated (как на colorscheme.ru)."""
from __future__ import annotations

import colorsys
import json
import re
import urllib.request
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "data" / "pantone.js"
CACHE = ROOT / "scripts" / "pantone-p-color-bridge-coated.json"
SOURCE_PAGE = "https://colorscheme.ru/pantone-colors.html"
SOURCE_DATA = (
    "https://raw.githubusercontent.com/GreatWizard/colorly/master/json/"
    "pantone-p-color-bridge-coated.json"
)

FAMILY_ORDER = [
    ("yellow", "Жёлтый"),
    ("orange", "Оранжевый"),
    ("red", "Красный"),
    ("pink", "Розовый"),
    ("purple", "Фиолетовый"),
    ("blue", "Синий"),
    ("cyan", "Голубой"),
    ("green", "Зелёный"),
    ("brown", "Коричневый"),
    ("gray", "Серый"),
]


def fetch_json(url: str) -> list | dict:
    req = urllib.request.Request(url, headers={"User-Agent": "BaltkartonBot/1.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


def normalize_code(name: str) -> str:
    code = name.replace("PANTONE ", "").replace("Pantone ", "").strip()
    code = re.sub(r"\s+CP$", " C", code)
    code = re.sub(r"\s+PC$", " C", code)
    return code


def hsl(hx: str) -> tuple[float, float, float]:
    h = hx.lstrip("#")
    r, g, b = (int(h[i : i + 2], 16) / 255.0 for i in (0, 2, 4))
    hh, ll, ss = colorsys.rgb_to_hls(r, g, b)
    return hh * 360.0, ss, ll


def in_hue_range(hue: float, start: float, end: float) -> bool:
    if start <= end:
        return start <= hue < end
    return hue >= start or hue < end


def family_id(hx: str) -> str:
    h, s, l = hsl(hx)
    if s < 0.12 or (s < 0.18 and 0.18 < l < 0.82):
        return "gray"
    if s < 0.48 and l < 0.48 and in_hue_range(h, 10, 55):
        return "brown"
    checks = [
        ("red", 345, 18),
        ("orange", 18, 45),
        ("yellow", 45, 75),
        ("green", 75, 165),
        ("cyan", 165, 200),
        ("blue", 200, 260),
        ("purple", 260, 300),
        ("pink", 300, 345),
    ]
    for fid, a, b in checks:
        if in_hue_range(h, a, b):
            return fid
    return "gray"


def load_colors(data: list | dict) -> list[dict]:
    items = data if isinstance(data, list) else list(data.values())
    colors = []
    for entry in items:
        if not isinstance(entry, dict):
            continue
        hx = entry.get("hex")
        name = entry.get("name") or entry.get("code") or entry.get("label")
        if not hx or not name:
            continue
        if not str(hx).startswith("#"):
            hx = f"#{hx}"
        colors.append({"code": normalize_code(str(name)), "hex": str(hx).upper()})
    return list({c["code"]: c for c in colors}.values())


def build_families(colors: list[dict]) -> list[dict]:
    buckets: dict[str, list[dict]] = defaultdict(list)
    for c in colors:
        buckets[family_id(c["hex"])].append(c)

    label = dict(FAMILY_ORDER)
    families = []
    for fid, _ in FAMILY_ORDER:
        shades = buckets.get(fid, [])
        if not shades:
            continue
        shades.sort(key=lambda c: hsl(c["hex"])[2], reverse=True)
        mid = shades[len(shades) // 2]
        families.append(
            {
                "id": fid,
                "label": label[fid],
                "hex": mid["hex"],
                "shades": shades,
            }
        )
    return families


def main() -> None:
    if CACHE.exists():
        data = json.loads(CACHE.read_text(encoding="utf-8"))
    else:
        data = fetch_json(SOURCE_DATA)
        CACHE.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")

    colors = load_colors(data)
    if len(colors) < 50:
        raise SystemExit(f"Too few colors: {len(colors)}")

    families = build_families(colors)
    default_family = next(
        (f["id"] for f in families if f["id"] == "orange"), families[0]["id"]
    )

    js = f"""/** Pantone Color Bridge Coated — экранные RGB для демо на print.html.
 * Каталог как на {SOURCE_PAGE} (Color Bridge Coated Process).
 * Данные: {SOURCE_DATA}
 * Семейства по оттенку; внутри семьи — светлый → тёмный для ползунка.
 */
export const pantoneSource = {json.dumps(SOURCE_PAGE)};
export const pantoneDefaultFamily = {json.dumps(default_family)};
export const pantoneFamilies = {json.dumps(families, ensure_ascii=False, indent=2)};

export const pantoneSwatches = pantoneFamilies.flatMap((family) =>
  family.shades.map((shade) => ({{
    code: shade.code,
    hex: shade.hex,
    family: family.id,
  }})),
);
"""
    OUT.write_text(js, encoding="utf-8")
    total = sum(len(f["shades"]) for f in families)
    print(f"wrote {OUT} colors={len(colors)} families={len(families)} shades={total}")


if __name__ == "__main__":
    main()
