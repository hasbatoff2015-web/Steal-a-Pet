"""One-time source PNG crop/audit tool. Not imported by game runtime."""

from __future__ import annotations

import json
import re
import shutil
import subprocess
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public" / "assets"
SOURCE = ROOT / "art" / "source" / "generated_originals"
AUDIT_JSON = ROOT / "docs" / "asset-bounds-audit.json"
AUDIT_MD = ROOT / "docs" / "ASSET_BOUNDS_AUDIT.md"
ALPHA_THRESHOLD = 16
PADDING = 12


def meaningful_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    alpha = image.getchannel("A")
    thresholded = alpha.point(lambda value: 255 if value >= ALPHA_THRESHOLD else 0)
    bbox = thresholded.getbbox()
    if bbox is None:
        raise ValueError("PNG contains no meaningful visible pixels")
    return bbox


def main() -> None:
    originals = sorted(SOURCE.rglob("*.png")) if SOURCE.exists() else sorted(PUBLIC.rglob("*.png"))
    records: list[dict[str, object]] = []
    for path in originals:
        relative = path.relative_to(SOURCE if SOURCE.exists() else PUBLIC)
        source_path = SOURCE / relative
        runtime_path = PUBLIC / relative
        source_path.parent.mkdir(parents=True, exist_ok=True)
        if not source_path.exists():
            shutil.copy2(path, source_path)
        runtime_path.parent.mkdir(parents=True, exist_ok=True)

        with Image.open(source_path).convert("RGBA") as image:
            left, top, right, bottom = meaningful_bbox(image)
            crop_left = max(0, left - PADDING)
            crop_top = max(0, top - PADDING)
            crop_right = min(image.width, right + PADDING)
            crop_bottom = min(image.height, bottom + PADDING)
            cropped = image.crop((crop_left, crop_top, crop_right, crop_bottom))
            cropped.save(runtime_path, optimize=True)
            records.append({
                "id": relative.with_suffix("").as_posix(),
                "sourcePath": source_path.relative_to(ROOT).as_posix(),
                "runtimePath": runtime_path.relative_to(ROOT).as_posix(),
                "canvas": [image.width, image.height],
                "visibleBounds": [left, top, right, bottom],
                "visibleSize": [right - left, bottom - top],
                "visibleWidthRatio": round((right - left) / image.width, 4),
                "visibleHeightRatio": round((bottom - top) / image.height, 4),
                "runtimeSize": [cropped.width, cropped.height],
                "padding": PADDING,
                "alphaThreshold": ALPHA_THRESHOLD,
                "bottomAnchorInRuntime": [
                    round(((left + right) / 2 - crop_left) / cropped.width, 4),
                    round((bottom - crop_top) / cropped.height, 4),
                ],
            })

    AUDIT_JSON.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    write_markdown(records)
    print(f"Processed {len(records)} PNG files")


def manifest_sizes(text: str) -> dict[str, tuple[float, float]]:
    pattern = re.compile(
        r"path:\s*'(/assets/[^']+)'[^}]*?displayWidth:\s*([\d.]+),\s*displayHeight:\s*([\d.]+)",
        re.DOTALL,
    )
    return {path.removeprefix('/assets/'): (float(width), float(height)) for path, width, height in pattern.findall(text)}


def write_markdown(records: list[dict[str, object]]) -> None:
    old_manifest = subprocess.check_output(
        ["git", "-c", f"safe.directory={ROOT.as_posix()}", "show", "HEAD:src/game/assets/assetManifest.ts"],
        cwd=ROOT,
        text=True,
        encoding="utf-8",
    )
    current_manifest = (ROOT / "src/game/assets/assetManifest.ts").read_text(encoding="utf-8")
    old_sizes = manifest_sizes(old_manifest)
    new_sizes = manifest_sizes(current_manifest)
    lines = [
        "# Аудит границ production-ассетов",
        "",
        f"Порог alpha: `{ALPHA_THRESHOLD}`. Безопасный padding runtime-crop: `{PADDING} px`. Исходники сохранены в `art/source/generated_originals/`, обрезанные runtime-файлы находятся в `public/assets/`.",
        "",
        "Visible bounds включают связанный с объектом мягкий shadow, но игнорируют alpha ниже порога. Crop симметрично добавляет padding; поэтому рекомендуемый runtime origin — центр по X и нижняя видимая опора по Y.",
        "",
        "| Asset id | Canvas | Visible bounds | W ratio | H ratio | Stage 7A display | Stage 7A visible estimate | Runtime crop | Stage 7B target | Recommended origin/offset |",
        "|---|---:|---:|---:|---:|---:|---:|---:|---:|---|",
    ]
    for record in records:
        relative = str(record["id"]) + ".png"
        canvas_w, canvas_h = record["canvas"]  # type: ignore[misc]
        left, top, right, bottom = record["visibleBounds"]  # type: ignore[misc]
        runtime_w, runtime_h = record["runtimeSize"]  # type: ignore[misc]
        old_w, old_h = old_sizes.get(relative, (0.0, 0.0))
        new_w, new_h = new_sizes.get(relative, (old_w, old_h))
        visible_w = old_w * float(record["visibleWidthRatio"])
        visible_h = old_h * float(record["visibleHeightRatio"])
        anchor_x, anchor_y = record["bottomAnchorInRuntime"]  # type: ignore[misc]
        lines.append(
            f"| `{record['id']}` | {canvas_w}×{canvas_h} | {left},{top}–{right},{bottom} | "
            f"{float(record['visibleWidthRatio']):.1%} | {float(record['visibleHeightRatio']):.1%} | "
            f"{old_w:g}×{old_h:g} | {visible_w:.0f}×{visible_h:.0f} | {runtime_w}×{runtime_h} | "
            f"{new_w:g}×{new_h:g} | `{anchor_x:.3f}, {anchor_y:.3f}` / `0,0` |"
        )
    lines.extend([
        "",
        "## Вывод",
        "",
        "Runtime crop удаляет прозрачные поля без ресемплинга и изменения цвета. Scale рассчитывается по одной целевой оси с сохранением aspect ratio; PNG больше не растягивается под collider. Отдельный JSON с машинными данными находится в `docs/asset-bounds-audit.json`.",
        "",
    ])
    AUDIT_MD.write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    main()
