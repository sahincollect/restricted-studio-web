#!/usr/bin/env python3
"""
Deterministic 2:1 dimetric isometric square-pixel builder for scripts.png and vehicles.png,
matching the Restricted Studio Kış Noir sprite palette (#080808 / #A50000 / #FFB84D / #F0F0F0).
"""

from __future__ import annotations

from pathlib import Path
from PIL import Image

OUT_DIR = Path(r"C:\Users\yesah\OneDrive\Desktop\restricted-studio-web\public\assets\town")

TRANSPARENT = (0, 0, 0, 0)
OUTLINE = (7, 7, 10, 255)
OBSIDIAN_DARK = (16, 17, 22, 255)
OBSIDIAN_MID = (26, 28, 36, 255)
OBSIDIAN_LITE = (40, 43, 55, 255)
SLATE_HI = (62, 67, 84, 255)
BRICK_LEFT = (30, 32, 42, 255)
BRICK_MORTAR_L = (19, 20, 26, 255)
BRICK_RIGHT = (22, 23, 30, 255)
BRICK_MORTAR_R = (14, 15, 19, 255)

SNOW_TOP = (242, 246, 252, 255)
SNOW_MID = (212, 224, 240, 255)
SNOW_FROST = (168, 212, 248, 255)

CRIMSON_DARK = (118, 8, 12, 255)
CRIMSON_MID = (165, 12, 18, 255)
CRIMSON_BRIGHT = (226, 36, 42, 255)

AMBER_DEEP = (158, 92, 20, 255)
AMBER_MID = (242, 170, 58, 255)
AMBER_BRIGHT = (255, 224, 138, 255)

CODE_GREEN = (91, 232, 130, 255)
FROST_GLOW = (150, 222, 255, 255)


class SquareIsoCanvas:
    def __init__(self, width: int = 240, height: int = 240, cx: int = 120, cy: int = 136) -> None:
        self.width = width
        self.height = height
        self.cx = cx
        self.cy = cy
        self.img = Image.new("RGBA", (width, height), TRANSPARENT)
        self.px = self.img.load()

    def put_px(self, x: int, y: int, color: tuple[int, int, int, int]) -> None:
        if 0 <= x < self.width and 0 <= y < self.height and color[3] > 0:
            self.px[x, y] = color

    def iso(self, u: int, v: int, z: int) -> tuple[int, int]:
        # Each logical step spans 2px wide x 1px slope on square pixel grid (+u down-right, +v down-left, +z up by 2px)
        return (self.cx + (u - v) * 2, self.cy + (u + v) - z * 2)

    def fill_top(self, u0: int, u1: int, v0: int, v1: int, z: int, color_fn) -> None:
        for u in range(u0, u1):
            for v in range(v0, v1):
                sx, sy = self.iso(u, v, z)
                c = color_fn(u, v)
                self.put_px(sx, sy, c)
                self.put_px(sx + 1, sy, c)
                self.put_px(sx, sy + 1, c)
                self.put_px(sx + 1, sy + 1, c)

    def fill_sw_face(self, v_fixed: int, u0: int, u1: int, z0: int, z1: int, color_fn) -> None:
        for u in range(u0, u1):
            for z in range(z0, z1):
                sx, sy = self.iso(u, v_fixed, z)
                c = color_fn(u, z)
                self.put_px(sx, sy, c)
                self.put_px(sx + 1, sy, c)
                self.put_px(sx, sy + 1, c)
                self.put_px(sx + 1, sy + 1, c)

    def fill_se_face(self, u_fixed: int, v0: int, v1: int, z0: int, z1: int, color_fn) -> None:
        for v in range(v0, v1):
            for z in range(z0, z1):
                sx, sy = self.iso(u_fixed, v, z)
                c = color_fn(v, z)
                self.put_px(sx, sy, c)
                self.put_px(sx + 1, sy, c)
                self.put_px(sx, sy + 1, c)
                self.put_px(sx + 1, sy + 1, c)

    def box(self, u0: int, u1: int, v0: int, v1: int, z0: int, z1: int, top_fn, sw_fn, se_fn) -> None:
        self.fill_sw_face(v1 - 1, u0, u1, z0, z1, sw_fn)
        self.fill_se_face(u1 - 1, v0, v1, z0, z1, se_fn)
        self.fill_top(u0, u1, v0, v1, z1 - 1, top_fn)

    def export_crisp(self, scale: int = 3, padding: int = 4) -> Image.Image:
        out = Image.new("RGBA", (self.width, self.height), TRANSPARENT)
        opx = out.load()
        for y in range(self.height):
            for x in range(self.width):
                if self.px[x, y][3] > 0:
                    opx[x, y] = self.px[x, y]
                else:
                    for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                        if 0 <= nx < self.width and 0 <= ny < self.height and self.px[nx, ny][3] > 0:
                            opx[x, y] = OUTLINE
                            break

        bbox = out.getbbox()
        assert bbox is not None
        cropped = out.crop(bbox)
        scaled = cropped.resize((cropped.width * scale, cropped.height * scale), Image.Resampling.NEAREST)
        padded = Image.new("RGBA", (scaled.width + padding * 2, scaled.height + padding * 2), TRANSPARENT)
        padded.paste(scaled, (padding, padding))
        return padded


def masonry_sw(u: int, z: int) -> tuple[int, int, int, int]:
    if z % 2 == 0 and (u + (z // 2)) % 3 == 0:
        return BRICK_MORTAR_L
    if z % 4 == 0:
        return BRICK_MORTAR_L
    return BRICK_LEFT


def masonry_se(v: int, z: int) -> tuple[int, int, int, int]:
    if z % 2 == 0 and (v + (z // 2)) % 3 == 0:
        return BRICK_MORTAR_R
    if z % 4 == 0:
        return BRICK_MORTAR_R
    return BRICK_RIGHT


def build_scripts_shop() -> None:
    c = SquareIsoCanvas(width=240, height=240, cx=120, cy=148)

    # Dark concrete base curb + frost snow edge
    c.box(
        0, 26, 0, 24, 0, 2,
        lambda u, v: SNOW_MID if (u in (0, 25) or v in (0, 23)) else OBSIDIAN_DARK,
        lambda u, z: SLATE_HI if z == 1 else OBSIDIAN_DARK,
        lambda v, z: OBSIDIAN_LITE if z == 1 else (12, 13, 17, 255),
    )

    # Main 2-story dark masonry storefront building
    c.box(
        1, 25, 1, 23, 2, 22,
        lambda u, v: OBSIDIAN_MID,
        masonry_sw,
        masonry_se,
    )

    # Parapet concrete border + bright white snow flat roof cap
    c.box(
        0, 26, 0, 24, 22, 24,
        lambda u, v: SNOW_MID if (u in (0, 25) or v in (0, 23)) else SNOW_TOP,
        lambda u, z: SNOW_TOP if z == 23 else (SNOW_FROST if u % 5 == 0 else SLATE_HI),
        lambda v, z: SNOW_MID if z == 23 else OBSIDIAN_LITE,
    )

    # Rooftop chilled HVAC server condenser unit
    c.box(
        5, 12, 5, 12, 24, 28,
        lambda u, v: SNOW_TOP if (u < 11 and v < 11) else SNOW_MID,
        lambda u, z: CRIMSON_BRIGHT if (u == 10 and z == 26) else (OBSIDIAN_LITE if z % 2 == 1 else OBSIDIAN_DARK),
        lambda v, z: OBSIDIAN_MID if z % 2 == 1 else OBSIDIAN_DARK,
    )

    # Second floor twin tungsten amber shop windows on SW wall (v=22)
    for win_u in (4, 14):
        c.fill_sw_face(
            22, win_u, win_u + 7, 15, 20,
            lambda u, z, base=win_u: (
                SLATE_HI if (u in (base, base + 6) or z in (15, 19))
                else (SNOW_TOP if z == 15 else (
                    AMBER_BRIGHT if (z in (17, 18) and base + 1 <= u <= base + 4) else AMBER_MID
                ))
            ),
        )

    # Second floor frost-cyan code monitor strip window on SE wall (u=24)
    c.fill_se_face(
        24, 6, 17, 16, 19,
        lambda v, z: (
            SLATE_HI if v in (6, 16)
            else (FROST_GLOW if v in (8, 9, 12, 13, 14) else OBSIDIAN_DARK)
        ),
    )

    # Ground-floor wide cyber-terminal showcase display glass on SW wall (v=22, z: 3..9)
    c.fill_sw_face(
        22, 3, 22, 3, 10,
        lambda u, z: (
            SLATE_HI if (u in (3, 21) or z in (3, 9))
            else (
                AMBER_DEEP if (u == 12 or z == 4)
                else (
                    CODE_GREEN if (z in (6, 7) and u in (6, 7, 8, 16, 17))
                    else (
                        FROST_GLOW if (z == 8 and u in (5, 7, 15, 17, 18))
                        else (AMBER_BRIGHT if 5 <= z <= 8 else AMBER_MID)
                    )
                )
            )
        ),
    )

    # Ground-floor armored side entry door & crimson keypad on SE wall (u=24)
    c.fill_se_face(
        24, 8, 16, 2, 10,
        lambda v, z: (
            SLATE_HI if (v in (8, 15) or z == 9)
            else (AMBER_BRIGHT if (v == 11 and z in (6, 7)) else OBSIDIAN_DARK)
        ),
    )
    c.fill_se_face(
        24, 5, 7, 6, 8,
        lambda v, z: CRIMSON_BRIGHT if (v == 5 and z == 7) else OBSIDIAN_LITE,
    )

    # Stepped angled crimson storefront awning dusted cleanly with top snow (z: 10..13)
    for step in range(4):
        z_lvl = 13 - step
        v_pos = 22 + step
        c.fill_top(
            2, 23, v_pos, v_pos + 1, z_lvl,
            lambda u, v, s=step: (
                SNOW_TOP if s == 0
                else (CRIMSON_BRIGHT if (u // 2) % 2 == 0 else CRIMSON_DARK)
            ),
        )
        c.fill_sw_face(
            v_pos, 2, 23, z_lvl - 1, z_lvl,
            lambda u, z, s=step: (
                SNOW_MID if s == 0
                else (CRIMSON_MID if (u // 2) % 2 == 0 else CRIMSON_DARK)
            ),
        )

    out = c.export_crisp(scale=3, padding=4)
    out.save(OUT_DIR / "scripts.png", format="PNG", optimize=True)
    print(f"OK {OUT_DIR / 'scripts.png'} ({out.width}x{out.height})")


def build_vehicles_garage() -> None:
    c = SquareIsoCanvas(width=240, height=240, cx=116, cy=156)

    # Wide concrete apron plinth with crisp snow trim along front edge
    c.box(
        0, 30, 0, 24, 0, 2,
        lambda u, v: SNOW_TOP if (v >= 22 and u % 5 != 0) else (36, 39, 48, 255),
        lambda u, z: SLATE_HI if z == 1 else OBSIDIAN_DARK,
        lambda v, z: OBSIDIAN_LITE if z == 1 else (12, 13, 17, 255),
    )

    # Main brutalist wide low-slung concrete & ribbed steel garage bay
    c.box(
        1, 29, 1, 21, 2, 15,
        lambda u, v: OBSIDIAN_MID,
        lambda u, z: (SLATE_HI if u in (2, 23, 27) or z == 14 else masonry_sw(u, z)),
        lambda v, z: (OBSIDIAN_LITE if v in (2, 19) or z == 14 else masonry_se(v, z)),
    )

    # Crisp flat overhanging snow roof cap (edge shadow + solid clean white cap)
    c.box(
        0, 30, 0, 22, 15, 17,
        lambda u, v: SNOW_MID if (u in (0, 29) or v in (0, 21)) else SNOW_TOP,
        lambda u, z: (
            CRIMSON_BRIGHT if (u in (26, 27) and z == 15)
            else (SNOW_TOP if z == 16 else SLATE_HI)
        ),
        lambda v, z: SNOW_MID if z == 16 else OBSIDIAN_LITE,
    )

    # Rooftop snow-topped exhaust unit (clean raised box)
    c.box(
        19, 25, 5, 11, 17, 21,
        lambda u, v: SNOW_TOP if (u < 24 and v < 10) else SNOW_MID,
        lambda u, z: OBSIDIAN_LITE if z % 2 == 0 else OBSIDIAN_DARK,
        lambda v, z: OBSIDIAN_MID if z % 2 == 0 else OBSIDIAN_DARK,
    )

    # Open wide garage bay (u: 4..21, z: 3..12 on v=20)
    c.fill_sw_face(
        20, 4, 21, 3, 13,
        lambda u, z: (
            AMBER_BRIGHT if (z == 10 and 6 <= u <= 18)
            else (AMBER_DEEP if (z == 3 and 5 <= u <= 19) else (12, 12, 16, 255))
        ),
    )

    # Sleek pixel coupe rear silhouette inside garage bay
    def car_pixel(u: int, z: int) -> tuple[int, int, int, int] | None:
        if z == 4 and u in (7, 8, 16, 17):
            return (10, 10, 14, 255)
        if z == 4 and 9 <= u <= 15:
            return (24, 26, 34, 255)
        if z in (5, 6) and 6 <= u <= 18:
            if z == 6 and u in (7, 8, 9, 15, 16, 17):
                return CRIMSON_BRIGHT if u in (8, 16) else CRIMSON_MID
            return (42, 46, 58, 255)
        if z == 7 and 7 <= u <= 17:
            return SLATE_HI if u in (7, 17) else OBSIDIAN_MID
        if z in (8, 9) and 9 <= u <= 15:
            if z == 9:
                return OBSIDIAN_LITE
            return FROST_GLOW if u in (10, 11, 13, 14) else (34, 48, 66, 255)
        return None

    for u in range(6, 19):
        for z in range(4, 10):
            col = car_pixel(u, z)
            if col is not None:
                sx, sy = c.iso(u, 20, z)
                c.put_px(sx, sy, col)
                c.put_px(sx + 1, sy, col)
                c.put_px(sx, sy + 1, col)
                c.put_px(sx + 1, sy + 1, col)

    # Upper rolled metallic shutter slats + crimson safety stripe
    c.fill_sw_face(
        20, 4, 21, 10, 13,
        lambda u, z: (
            CRIMSON_MID if z == 10
            else (SLATE_HI if z % 2 == 0 else OBSIDIAN_MID)
        ),
    )

    # Side office steel door + warm sconce on SE wall (u=28)
    c.fill_se_face(
        28, 7, 14, 2, 10,
        lambda v, z: (
            SLATE_HI if (v in (7, 13) or z == 9)
            else (AMBER_BRIGHT if (v == 10 and z in (6, 7)) else OBSIDIAN_DARK)
        ),
    )
    c.fill_se_face(
        28, 9, 12, 11, 12,
        lambda v, z: AMBER_MID if v == 10 else SLATE_HI,
    )

    # Stacked winter tires + crimson bollard at right corner (u: 24..27, v: 21..23)
    c.box(
        24, 27, 21, 24, 2, 6,
        lambda u, v: SNOW_TOP if (u == 25 and v == 22) else OBSIDIAN_MID,
        lambda u, z: CRIMSON_BRIGHT if z == 5 else (OBSIDIAN_LITE if z % 2 == 0 else OBSIDIAN_DARK),
        lambda v, z: OBSIDIAN_MID if z % 2 == 0 else OBSIDIAN_DARK,
    )

    out = c.export_crisp(scale=3, padding=4)
    out.save(OUT_DIR / "vehicles.png", format="PNG", optimize=True)
    print(f"OK {OUT_DIR / 'vehicles.png'} ({out.width}x{out.height})")


if __name__ == "__main__":
    build_scripts_shop()
    build_vehicles_garage()
