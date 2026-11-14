#!/usr/bin/env python3
"""
Deterministic border flood-fill alpha keyer and crisp cropper for isometric pixel sprites.
Removes connected exterior dark background pixels without erasing dark interior shadows.
"""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path
import sys
import tempfile

from PIL import Image


def extract_transparent_sprite(
    img: Image.Image,
    threshold: int = 20,
    fringe_margin: int = 12,
    padding: int = 4,
    target_max_width: int = 512,
) -> Image.Image:
    rgba = img.convert("RGBA")
    w, h = rgba.size
    pixels = rgba.load()
    if pixels is None or w == 0 or h == 0:
        raise ValueError("Empty input image")

    bg_mask = bytearray(w * h)
    queue: deque[tuple[int, int]] = deque()

    def is_bg_candidate(px: tuple[int, int, int, int], limit: int) -> bool:
        return px[0] <= limit and px[1] <= limit and px[2] <= limit

    # Seed flood-fill from every outer image perimeter pixel matching dark background.
    for x in range(w):
        for y in (0, h - 1):
            idx = y * w + x
            if not bg_mask[idx] and is_bg_candidate(pixels[x, y], threshold):
                bg_mask[idx] = 1
                queue.append((x, y))

    for y in range(h):
        for x in (0, w - 1):
            idx = y * w + x
            if not bg_mask[idx] and is_bg_candidate(pixels[x, y], threshold):
                bg_mask[idx] = 1
                queue.append((x, y))

    while queue:
        cx, cy = queue.popleft()
        for nx, ny in ((cx - 1, cy), (cx + 1, cy), (cx, cy - 1), (cx, cy + 1)):
            if 0 <= nx < w and 0 <= ny < h:
                nidx = ny * w + nx
                if not bg_mask[nidx] and is_bg_candidate(pixels[nx, ny], threshold):
                    bg_mask[nidx] = 1
                    queue.append((nx, ny))

    # Zero out connected exterior void pixels; soften immediate dark fringe pixels gently.
    for y in range(h):
        for x in range(w):
            idx = y * w + x
            r, g, b, _ = pixels[x, y]
            if bg_mask[idx]:
                pixels[x, y] = (0, 0, 0, 0)
                continue

            touches_bg = False
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if 0 <= nx < w and 0 <= ny < h and bg_mask[ny * w + nx]:
                    touches_bg = True
                    break

            if touches_bg:
                peak = max(r, g, b)
                if peak <= threshold + fringe_margin:
                    ratio = max(0.0, min(1.0, (peak - threshold * 0.6) / max(1, fringe_margin)))
                    pixels[x, y] = (r, g, b, int(round(255 * ratio)))

    bbox = rgba.getbbox()
    if bbox is None:
        raise ValueError("Flood-fill removed entire image; lower --threshold.")

    cropped = rgba.crop(bbox)
    cw, ch = cropped.size
    if target_max_width > 0 and cw > target_max_width:
        scale = target_max_width / cw
        new_w = target_max_width
        new_h = max(1, int(round(ch * scale)))
        cropped = cropped.resize((new_w, new_h), Image.Resampling.NEAREST)
        cw, ch = cropped.size

    padded = Image.new("RGBA", (cw + padding * 2, ch + padding * 2), (0, 0, 0, 0))
    padded.paste(cropped, (padding, padding))
    return padded


def process_sprite(
    input_path: Path,
    output_path: Path,
    threshold: int = 20,
    target_max_width: int = 512,
) -> tuple[int, int]:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(input_path) as src:
        result = extract_transparent_sprite(
            src,
            threshold=threshold,
            target_max_width=target_max_width,
        )
        result.save(output_path, format="PNG", optimize=True)
        return result.size


def run_self_test() -> int:
    # Build synthetic 24x24 frame: outer #040404 background, white perimeter wall (#F0F0F0),
    # and protected #050505 interior dark shadow pocket inside the wall.
    synth = Image.new("RGB", (24, 24), (4, 4, 4))
    px = synth.load()
    assert px is not None
    for x in range(6, 18):
        for y in range(6, 18):
            if x in (6, 17) or y in (6, 17):
                px[x, y] = (240, 240, 240)
            else:
                px[x, y] = (5, 5, 5)

    with tempfile.TemporaryDirectory() as tmp:
        in_p = Path(tmp) / "in.png"
        out_p = Path(tmp) / "out.png"
        synth.save(in_p)
        w, h = process_sprite(in_p, out_p, threshold=18, target_max_width=512)
        with Image.open(out_p) as out_img:
            out_px = out_img.load()
            assert out_px is not None
            assert (w, h) == (20, 20), f"Expected 12x12 sprite + 4px padding = 20x20, got {(w, h)}"
            assert out_px[0, 0][3] == 0, "Expected exterior border to be transparent"
            assert out_px[10, 10][3] == 255, "Expected interior dark window to remain opaque"
            assert out_px[4, 4] == (240, 240, 240, 255), "Expected wall pixel to preserve full alpha"

    print("SELF-TEST PASS")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Extract transparent isometric pixel sprites.")
    parser.add_argument("--self-test", action="store_true", help="Run synthetic unit check")
    parser.add_argument("--input", type=Path, help="Input raster image path")
    parser.add_argument("--output", type=Path, help="Output RGBA PNG path")
    parser.add_argument("--threshold", type=int, default=20, help="Dark void flood-fill max channel value")
    parser.add_argument("--max-width", type=int, default=512, help="Max cropped sprite width in pixels")
    args = parser.parse_args()

    if args.self_test:
        return run_self_test()

    if not args.input or not args.output:
        parser.error("--input and --output are required unless --self-test is passed")

    size = process_sprite(
        args.input,
        args.output,
        threshold=args.threshold,
        target_max_width=args.max_width,
    )
    print(f"OK {args.output} ({size[0]}x{size[1]})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
