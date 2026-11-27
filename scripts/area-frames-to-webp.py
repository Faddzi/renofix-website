# Converts the PNG frames from scripts/render-area-frames.mjs into the WebP files the area
# pages load: 1280 px wide for landscape screens (w-*), 720 px for portrait screens (t-*).
# usage: python3 scripts/area-frames-to-webp.py <frames dir> public/images/areas
import os, sys
from PIL import Image
src = sys.argv[1]; dst = sys.argv[2]
for slug in ['interior-design-mumbai', 'interior-design-thane', 'interior-design-navi-mumbai']:
    out = os.path.join(dst, slug); os.makedirs(out, exist_ok=True)
    tot = 0
    for k, w in [('w', 1280), ('t', 720)]:
        for i in range(16):
            im = Image.open(os.path.join(src, slug, f'{k}-{i}.png')).convert('RGB')
            h = round(im.height * w / im.width)
            im = im.resize((w, h), Image.LANCZOS)
            p = os.path.join(out, f'{k}-{i}.webp')
            im.save(p, 'WEBP', quality=66, method=6)
            tot += os.path.getsize(p)
    print(slug, tot // 1024, 'KB')
