from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageFilter, ImageOps


SOURCE_FILES = {
    "KakaoTalk_20260820_165357083_10.jpg": "building-exterior.webp",
    "KakaoTalk_20260820_165357083_09.jpg": "parking-entrance.webp",
    "KakaoTalk_20260820_165357083_08.jpg": "building-stairs.webp",
    "KakaoTalk_20260820_165357083_07.jpg": "b1-directory.webp",
    "KakaoTalk_20260820_165357083_04.jpg": "restaurant-entrance.webp",
    "KakaoTalk_20260820_165357083.jpg": "today-menu-board.webp",
    "KakaoTalk_20260820_165357083_02.jpg": "ticket-payment.webp",
    "KakaoTalk_20260820_165357083_03.jpg": "interior-buffet.webp",
    "KakaoTalk_20260820_165357083_01.jpg": "interior-line.webp",
    "KakaoTalk_20260820_165357083_06.jpg": "free-egg.webp",
    "KakaoTalk_20260820_165357083_05.jpg": "barley-tea.webp",
}


def prepare(source_dir: Path, output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)

    for source_name, output_name in SOURCE_FILES.items():
        image = ImageOps.exif_transpose(Image.open(source_dir / source_name)).convert("RGB")

        if source_name.endswith("_02.jpg"):
            private_area = (1350, 2020, 2800, 2440)
            blurred = image.crop(private_area).filter(ImageFilter.GaussianBlur(radius=24))
            image.paste(blurred, private_area)

        if image.width > 1800:
            height = round(image.height * 1800 / image.width)
            image = image.resize((1800, height), Image.Resampling.LANCZOS)

        image.save(output_dir / output_name, "WEBP", quality=80, method=6)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("usage: prepare-schmaus-images.py SOURCE_DIR OUTPUT_DIR")
    prepare(Path(sys.argv[1]), Path(sys.argv[2]))
