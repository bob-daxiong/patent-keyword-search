import io
import os
import sys
import base64
from pathlib import Path

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
import numpy as np
from wordcloud import WordCloud


def _find_cjk_font() -> str | None:
    """Find a CJK-capable font on the system or in the bundled data."""
    # 1. Check bundled font in data directory
    bundle_fonts = []
    for base in [getattr(sys, '_MEIPASS', ''), os.path.dirname(os.path.dirname(__file__))]:
        if base:
            data_dir = Path(base) / 'data'
            if data_dir.exists():
                bundle_fonts.extend(data_dir.glob('*.ttf'))
                bundle_fonts.extend(data_dir.glob('*.ttc'))
                bundle_fonts.extend(data_dir.glob('*.otf'))
    for f in bundle_fonts:
        return str(f)

    # 2. Check common Windows Chinese fonts
    if sys.platform == 'win32':
        windir = os.environ.get('WINDIR', r'C:\Windows')
        win_fonts = [
            os.path.join(windir, 'Fonts', 'msyh.ttc'),   # Microsoft YaHei
            os.path.join(windir, 'Fonts', 'msyhbd.ttc'),  # Microsoft YaHei Bold
            os.path.join(windir, 'Fonts', 'simhei.ttf'),   # SimHei
            os.path.join(windir, 'Fonts', 'simsun.ttc'),   # SimSun
            os.path.join(windir, 'Fonts', 'simfang.ttf'),  # FangSong
            os.path.join(windir, 'Fonts', 'simkai.ttf'),   # KaiTi
        ]
        for f in win_fonts:
            if os.path.exists(f):
                return f

    # 3. Use matplotlib font manager to find any CJK font
    for font in fm.fontManager.ttflist:
        if any(cjk in font.name.lower() for cjk in ['yahei', 'simhei', 'simsun', 'cjk', 'noto sans sc', 'wenquanyi', 'wqy', 'songti', 'heiti', 'fang', 'kai']):
            return font.fname

    # 4. Fallback: scan system font directories
    font_dirs = ['/usr/share/fonts', '/usr/local/share/fonts', os.path.expanduser('~/.fonts')]
    for d in font_dirs:
        for root, _, files in os.walk(d):
            for f in files:
                if f.endswith(('.ttf', '.ttc', '.otf')):
                    return os.path.join(root, f)

    return None


def generate_wordcloud_image(keywords: list[dict], width: int = 900, height: int = 500) -> str:
    freq_dict = {}
    for kw in keywords:
        freq_dict[kw['word']] = kw['weight'] * 100

    if not freq_dict:
        return ''

    font_path = _find_cjk_font()

    x, y = np.ogrid[:height, :width]
    mask = ((x - height / 2) ** 2) / (height / 2) ** 2 + \
           ((y - width / 2) ** 2) / (width / 2) ** 2 <= 1.0
    mask = 255 - (mask * 255).astype(np.uint8)

    def color_func(word, font_size, position, orientation, random_state=None, **kwargs):
        colors = ['#06b6d4', '#22d3ee', '#0891b2', '#0e7490',
                  '#67e8f9', '#a5f3fc', '#155e75', '#164e63']
        return colors[hash(word) % len(colors)]

    wc = WordCloud(
        width=width,
        height=height,
        background_color=None,
        mode='RGBA',
        font_path=font_path,
        mask=mask,
        max_words=80,
        relative_scaling=0.4,
        max_font_size=120,
        min_font_size=14,
        prefer_horizontal=0.75,
        color_func=color_func,
        margin=10,
        random_state=42,
    )
    wc.generate_from_frequencies(freq_dict)

    fig, ax = plt.subplots(figsize=(width / 100, height / 100), dpi=150)
    ax.imshow(wc, interpolation='bilinear')
    ax.axis('off')
    fig.patch.set_alpha(0)
    plt.tight_layout(pad=0)

    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', pad_inches=0, transparent=True)
    plt.close(fig)
    buf.seek(0)
    return base64.b64encode(buf.read()).decode('utf-8')
