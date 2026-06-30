import io
import base64

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
from wordcloud import WordCloud


def generate_wordcloud_image(keywords: list[dict], width: int = 900, height: int = 500) -> str:
    freq_dict = {}
    for kw in keywords:
        freq_dict[kw['word']] = kw['weight'] * 100

    if not freq_dict:
        return ''

    font_path = None
    import glob as _glob
    candidates = _glob.glob('/usr/share/fonts/**/*.ttc', recursive=True) + \
        _glob.glob('/usr/share/fonts/**/*.ttf', recursive=True) + \
        _glob.glob('/usr/share/fonts/**/*.otf', recursive=True)
    for candidate in candidates:
        font_path = candidate
        break

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
