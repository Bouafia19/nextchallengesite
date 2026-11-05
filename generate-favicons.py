import os
import base64
from PIL import Image

SOURCE_ICON = "/home/next/next projects/inventory-v2-web-demo/public/pallet.png"
NC_PUBLIC = "/home/next/next projects/nextchallengesite/public"
NC_FAVICONS = "/home/next/next projects/nextchallengesite/favicons"

def generate():
    im = Image.open(SOURCE_ICON).convert("RGBA")
    print(f"Source image loaded: {SOURCE_ICON}, size: {im.size}, mode: {im.mode}")

    # Ensure output directories exist
    os.makedirs(NC_PUBLIC, exist_ok=True)
    os.makedirs(NC_FAVICONS, exist_ok=True)

    sizes = {
        "favicon-16x16.png": (16, 16),
        "favicon-32x32.png": (32, 32),
        "apple-touch-icon.png": (180, 180),
        "android-chrome-192x192.png": (192, 192),
        "android-chrome-512x512.png": (512, 512),
        "icon-192x192.png": (192, 192),
        "icon-512x512.png": (512, 512),
        "favicon.png": (512, 512),
    }

    # Generate PNG files with LANCZOS high-quality resampling
    for fname, size in sizes.items():
        if size == im.size:
            resized = im.copy()
        else:
            resized = im.resize(size, Image.Resampling.LANCZOS)
        
        # Save in public/
        pub_path = os.path.join(NC_PUBLIC, fname)
        resized.save(pub_path, format="PNG", optimize=True)
        print(f"Saved {pub_path} ({size[0]}x{size[1]})")

        # Save in favicons/
        fav_path = os.path.join(NC_FAVICONS, fname)
        resized.save(fav_path, format="PNG", optimize=True)

    # Generate multi-resolution favicon.ico containing 16x16, 32x32, 48x48
    ico_sizes = [(16, 16), (32, 32), (48, 48)]
    ico_images = [im.resize(s, Image.Resampling.LANCZOS) for s in ico_sizes]
    
    pub_ico = os.path.join(NC_PUBLIC, "favicon.ico")
    ico_images[0].save(pub_ico, format="ICO", sizes=ico_sizes)
    print(f"Saved {pub_ico} (multi-size ICO: 16x16, 32x32, 48x48)")

    fav_ico = os.path.join(NC_FAVICONS, "favicon.ico")
    ico_images[0].save(fav_ico, format="ICO", sizes=ico_sizes)

    # Also update favicon.svg so any SVG-preferring browser gets the Inventory V2 icon
    with open(SOURCE_ICON, "rb") as f:
        png_b64 = base64.b64encode(f.read()).decode("ascii")

    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image href="data:image/png;base64,{png_b64}" width="512" height="512"/>
</svg>'''

    pub_svg = os.path.join(NC_PUBLIC, "favicon.svg")
    with open(pub_svg, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print(f"Saved {pub_svg} (SVG wrapper around Inventory V2 icon)")

    print("\nAll favicon assets generated successfully!")

if __name__ == "__main__":
    generate()
