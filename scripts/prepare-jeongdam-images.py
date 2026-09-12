from pathlib import Path

from PIL import Image, ImageOps


SOURCE_DIR = Path(r"C:\Users\0000\Desktop\픽픽")
OUTPUT_DIR = Path(__file__).resolve().parents[1] / "public" / "images" / "jeongdam"

IMAGES = {
    "KakaoTalk_20260911_011108265.jpg": "building-stairs.webp",
    "KakaoTalk_20260911_011108265_01.jpg": "b1-exit-6.webp",
    "KakaoTalk_20260911_011108265_02.jpg": "corridor.webp",
    "KakaoTalk_20260911_011108265_06.jpg": "restaurant-sign.webp",
    "KakaoTalk_20260911_011108265_07.jpg": "restaurant-entrance.webp",
    "KakaoTalk_20260911_011108265_04.jpg": "interior-buffet.webp",
}


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for source_name, output_name in IMAGES.items():
        source_path = SOURCE_DIR / source_name
        output_path = OUTPUT_DIR / output_name

        with Image.open(source_path) as source:
            image = ImageOps.exif_transpose(source).convert("RGB")
            image.thumbnail((1800, 1800), Image.Resampling.LANCZOS)
            image.save(output_path, "WEBP", quality=80, method=6)
            print(f"{source_path.name} -> {output_path.name} ({image.width}x{image.height})")


if __name__ == "__main__":
    main()
