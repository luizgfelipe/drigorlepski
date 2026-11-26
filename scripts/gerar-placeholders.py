#!/usr/bin/env python3
"""
Gera imagens provisórias (placeholders) em src/assets/ e public/images com os MESMOS nomes e proporções
das imagens finais. Assim o layout já fica correto antes de os arquivos reais chegarem.

Para trocar: basta sobrescrever o arquivo com a imagem real (mesmo nome).
O script NÃO sobrescreve imagens que já existem (a não ser com --force).

Uso:  python3 scripts/gerar-placeholders.py [--force]
Requer: Pillow (pip install pillow)
"""
import os
import sys

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.join(os.path.dirname(__file__), '..')
FORCE = '--force' in sys.argv

# (arquivo, largura, altura, estilo)
#  estilo: light = cinza claro | dark = azul-marinho | teal = gradiente do topo das páginas internas
#          transparent = fundo transparente (logos) | icon = quadrado escuro
ASSETS = [
    ('src/assets/images/logo.png', 1098, 323, 'transparent'),
    ('src/assets/images/home-hero-bg.png', 1920, 1080, 'dark'),
    ('src/assets/images/home-bio.png', 625, 755, 'light'),
    ('src/assets/images/hospital-einstein.png', 883, 277, 'light'),
    ('src/assets/images/hospital-vila-santa-catarina.png', 883, 249, 'light'),
    ('src/assets/images/icon-figado.png', 295, 278, 'icon'),
    ('src/assets/images/icon-intestino.png', 290, 276, 'icon'),
    ('src/assets/images/icon-pancreas.png', 295, 276, 'icon'),
    ('src/assets/images/icon-multivisceral.png', 293, 278, 'icon'),
    ('src/assets/images/cirurgia-hepato-bilio-pancreatica.png', 494, 477, 'light'),
    ('src/assets/images/cirurgia-aparelho-digestivo.png', 494, 477, 'light'),
    ('src/assets/images/review-avatar.png', 72, 72, 'dark'),
    ('src/assets/images/cta-doctor.png', 777, 553, 'light'),
    ('src/assets/images/salvatore.png', 986, 156, 'transparent'),
    ('src/assets/images/hero-transplantes-bg.png', 1920, 400, 'teal'),
    ('src/assets/images/hero-cirurgias-bg.png', 1920, 400, 'teal'),
    ('src/assets/images/transplante-figado.png', 1200, 800, 'light'),
    ('src/assets/images/transplante-intestino.png', 1200, 800, 'light'),
    ('src/assets/images/transplante-pancreas.png', 1200, 800, 'light'),
    ('src/assets/images/sobre-hero.png', 599, 732, 'light'),
    ('src/assets/images/sobre-fotos.png', 622, 853, 'light'),
    ('src/assets/images/video-apresentacao-capa.jpg', 1080, 1920, 'dark'),
    ('src/assets/images/video-hepato-bilio-pancreatica-capa.jpg', 1080, 1920, 'dark'),
    ('public/images/og-image.png', 1200, 630, 'dark'),
    ('src/assets/blog/istockphoto_1474957957.png', 1287, 410, 'light'),
    ('src/assets/blog/adobestock_572577392.png', 1302, 410, 'light'),
    ('src/assets/blog/shutterstock_1024477424.png', 2057, 748, 'light'),
    ('public/favicon.png', 64, 64, 'icon'),
]


def font(size):
    for path in (
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
        '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
        'C:/Windows/Fonts/arialbd.ttf',
    ):
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def make(path, w, h, style):
    full = os.path.join(ROOT, path)
    if os.path.exists(full) and not FORCE:
        return False
    os.makedirs(os.path.dirname(full), exist_ok=True)

    if style == 'transparent':
        im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        fg = (255, 255, 255, 220)
    elif style == 'dark':
        im = Image.new('RGB', (w, h), (32, 51, 75))
        fg = (145, 192, 146)
    elif style == 'icon':
        im = Image.new('RGB', (w, h), (23, 45, 74))
        fg = (255, 255, 255)
    elif style == 'teal':
        im = Image.new('RGB', (w, h))
        d = ImageDraw.Draw(im)
        for x in range(w):  # gradiente horizontal aproximado do original
            t = x / max(w - 1, 1)
            r = int(43 + (74 - 43) * t)
            g = int(103 + (148 - 103) * t)
            b = int(103 + (126 - 103) * t)
            d.line([(x, 0), (x, h)], fill=(r, g, b))
        fg = (255, 255, 255)
    else:
        im = Image.new('RGB', (w, h), (214, 222, 232))
        fg = (76, 117, 171)

    d = ImageDraw.Draw(im)
    if style not in ('teal', 'transparent'):
        d.rectangle([0, 0, w - 1, h - 1], outline=fg, width=max(1, min(w, h) // 120))

    label = f'{os.path.basename(path)}\n{w}×{h}'
    size = max(10, min(w // 14, h // 6, 48))
    f = font(size)
    box = d.multiline_textbbox((0, 0), label, font=f, align='center')
    tw, th = box[2] - box[0], box[3] - box[1]
    d.multiline_text(((w - tw) / 2, (h - th) / 2), label, font=f, fill=fg, align='center')

    if full.endswith('.jpg'):
        im.convert('RGB').save(full, quality=80)
    else:
        im.save(full, optimize=True)
    return True


if __name__ == '__main__':
    created = sum(make(*a) for a in ASSETS)
    print(f'{created} placeholder(s) criado(s) ({len(ASSETS) - created} já existiam).')
