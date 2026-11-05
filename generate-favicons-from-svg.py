import os
import shutil
from PIL import Image

SVG_SOURCE = "/home/next/next projects/inventory-v2-web-demo/public/favicon.svg"
MASTER_PNG = "/home/next/next projects/nextchallengesite/public/favicon.png"
PUBLIC_DIR = "/home/next/next projects/nextchallengesite/public"
FAVICONS_DIR = "/home/next/next projects/nextchallengesite/favicons"

def generate_all():
    im = Image.open(MASTER_PNG).convert("RGBA")
    print(f"Master PNG loaded: {im.size}, mode: {im.mode}")

    os.makedirs(PUBLIC_DIR, exist_ok=True)
    os.makedirs(FAVICONS_DIR, exist_ok=True)

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

    for fname, size in sizes.items():
        if size == im.size:
            resized = im.copy()
        else:
            resized = im.resize(size, Image.Resampling.LANCZOS)
        
        pub_p = os.path.join(PUBLIC_DIR, fname)
        resized.save(pub_p, format="PNG", optimize=True)
        fav_p = os.path.join(FAVICONS_DIR, fname)
        resized.save(fav_p, format="PNG", optimize=True)
        print(f"Saved {fname} ({size[0]}x{size[1]})")

    # Generate multi-resolution ICO: 16x16, 32x32, 48x48
    ico_sizes = [(16, 16), (32, 32), (48, 48)]
    ico_imgs = [im.resize(s, Image.Resampling.LANCZOS) for s in ico_sizes]
    
    pub_ico = os.path.join(PUBLIC_DIR, "favicon.ico")
    ico_imgs[0].save(pub_ico, format="ICO", sizes=ico_sizes)
    fav_ico = os.path.join(FAVICONS_DIR, "favicon.ico")
    ico_imgs[0].save(fav_ico, format="ICO", sizes=ico_sizes)
    print("Saved multi-size favicon.ico")

    # Copy raw vector SVG directly from inventory-v2-web-demo
    pub_svg = os.path.join(PUBLIC_DIR, "favicon.svg")
    fav_svg = os.path.join(FAVICONS_DIR, "favicon.svg")
    shutil.copyfile(SVG_SOURCE, pub_svg)
    shutil.copyfile(SVG_SOURCE, fav_svg)
    print("Copied authentic vector favicon.svg from inventory-v2-web-demo")

    print("\nAll favicon formats generated successfully!")

if __name__ == "__main__":
    generate_all()
