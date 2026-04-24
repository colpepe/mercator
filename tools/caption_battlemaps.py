#!/usr/bin/env python3
"""
caption_battlemaps.py — Auto-caption battlemap images for LoRA training.

Steps:
  1. Runs WD14 tagger (via kohya_ss sd-scripts) to generate raw tags
  2. Strips tags that imply perspective, 3D, or non-map content
  3. Prepends trigger word + base battlemap tags
  4. Writes final captions as .txt files alongside each image

Usage:
  python caption_battlemaps.py --images ./dataset/img/10_battlemap \
                                --kohya ~/kohya_ss \
                                --trigger bmap

  # Dry run (preview captions without writing):
  python caption_battlemaps.py --images ./dataset/img/10_battlemap --dry-run
"""

import argparse
import subprocess
import sys
import os
from pathlib import Path

# Tags that imply 3D, perspective, or non-battlemap content — strip these
STRIP_TAGS = {
    "perspective",
    "depth_of_field",
    "isometric",
    "3d",
    "three-dimensional",
    "vanishing_point",
    "foreshortening",
    "horizon",
    "horizon_line",
    "low_angle",
    "high_angle",
    "dutch_angle",
    "fisheye",
    "panorama",
    "wide_shot",
    "close-up",
    "portrait",
    "face",
    "person",
    "people",
    "human",
    "character",
    "figure",
    "token",
    "miniature",
    "photo",
    "photograph",
    "realistic_photo",
    "watermark",
    "text",
    "signature",
    "border",
    "frame",
    "white_border",
}

# Always prepended before WD14 tags
BASE_TAGS = [
    "top down view",
    "2d battlemap",
    "orthographic projection",
    "directly overhead",
    "flat",
    "no perspective",
    "tabletop rpg",
    "grid map",
]


def run_wd14_tagger(images_dir: Path, kohya_dir: Path, threshold: float):
    """Run kohya_ss WD14 tagger on the image directory."""
    tagger_script = kohya_dir / "finetune" / "tag_images_by_wd14_tagger.py"
    if not tagger_script.exists():
        print(f"ERROR: WD14 tagger not found at {tagger_script}")
        print("Make sure --kohya points to your kohya_ss directory.")
        sys.exit(1)

    print(f"Running WD14 tagger on {images_dir} ...")
    cmd = [
        sys.executable,
        str(tagger_script),
        str(images_dir),
        "--thresh", str(threshold),
        "--batch_size", "4",
        "--recursive",
    ]
    result = subprocess.run(cmd, cwd=kohya_dir)
    if result.returncode != 0:
        print("ERROR: WD14 tagger failed.")
        sys.exit(1)
    print("Tagging complete.\n")


def clean_tags(raw: str, trigger: str) -> str:
    """Strip bad tags, prepend trigger word and base tags."""
    tags = [t.strip().lower().replace(" ", "_") for t in raw.split(",") if t.strip()]
    filtered = [t for t in tags if t not in STRIP_TAGS]

    # Build final tag list: trigger → base tags → filtered WD14 tags
    final = [trigger] + BASE_TAGS + filtered

    # Deduplicate while preserving order
    seen = set()
    deduped = []
    for t in final:
        if t not in seen:
            seen.add(t)
            deduped.append(t)

    return ", ".join(deduped)


def process_captions(images_dir: Path, trigger: str, dry_run: bool):
    """Read existing .txt files, clean them, write back."""
    txt_files = list(images_dir.glob("*.txt"))
    if not txt_files:
        print("No .txt caption files found. Run without --skip-tagger first.")
        return

    print(f"Processing {len(txt_files)} caption files...\n")
    for txt_path in sorted(txt_files):
        raw = txt_path.read_text(encoding="utf-8").strip()
        cleaned = clean_tags(raw, trigger)

        if dry_run:
            print(f"[DRY RUN] {txt_path.name}")
            print(f"  BEFORE: {raw[:120]}...")
            print(f"  AFTER:  {cleaned[:120]}...\n")
        else:
            txt_path.write_text(cleaned, encoding="utf-8")
            print(f"  Updated: {txt_path.name}")

    if not dry_run:
        print(f"\nDone. {len(txt_files)} captions written.")


def main():
    parser = argparse.ArgumentParser(description="Caption battlemap images for LoRA training.")
    parser.add_argument("--images", required=True, type=Path, help="Path to image folder (e.g. dataset/img/10_battlemap)")
    parser.add_argument("--kohya", type=Path, default=Path.home() / "kohya_ss", help="Path to kohya_ss directory")
    parser.add_argument("--trigger", default="bmap", help="Trigger word to prepend (default: bmap)")
    parser.add_argument("--thresh", type=float, default=0.35, help="WD14 confidence threshold (default: 0.35)")
    parser.add_argument("--skip-tagger", action="store_true", help="Skip WD14 tagging, just clean existing .txt files")
    parser.add_argument("--dry-run", action="store_true", help="Preview captions without writing files")
    args = parser.parse_args()

    images_dir = args.images.resolve()
    if not images_dir.exists():
        print(f"ERROR: Image directory not found: {images_dir}")
        sys.exit(1)

    if not args.skip_tagger and not args.dry_run:
        run_wd14_tagger(images_dir, args.kohya.resolve(), args.thresh)

    process_captions(images_dir, args.trigger, args.dry_run)


if __name__ == "__main__":
    main()
