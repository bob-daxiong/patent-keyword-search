"""TextRank-based keyword extraction with position weighting.

Algorithm:
1. Tokenize text with jieba, filter stopwords and short tokens
2. Build word co-occurrence graph (sliding window of 3)
3. Apply position weighting to co-occurrence edges (front-loaded text = higher weight)
4. Run iterative PageRank until convergence
5. Return top-N keywords with normalized scores
"""

import re
from collections import Counter, defaultdict

import jieba

from config import STOPWORDS_PATH, PATENT_TERMS_PATH


class KeywordExtractor:

    def __init__(self):
        self.stopwords: set[str] = set()
        self._load_stopwords()
        self._load_patent_dict()

    def _load_stopwords(self) -> None:
        try:
            with open(STOPWORDS_PATH, 'r', encoding='utf-8') as f:
                self.stopwords = {line.strip() for line in f if line.strip()}
        except FileNotFoundError:
            pass

    def _load_patent_dict(self) -> None:
        try:
            jieba.load_userdict(PATENT_TERMS_PATH)
        except FileNotFoundError:
            pass

    def _tokenize(self, text: str) -> list[str]:
        words = jieba.lcut(text)
        result = []
        for w in words:
            w = w.strip()
            if len(w) < 2:
                continue
            if w in self.stopwords:
                continue
            if re.match(r'^[\d\.\-\+/]+$', w):
                continue
            result.append(w)
        return result

    def extract(self, text: str, top_n: int = 30) -> list[dict]:
        """Extract top-N keywords using TextRank with position weighting."""
        # Split into sentences for position weighting
        sentences = re.split(r'[。！？；\n]+', text)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 5]

        if not sentences:
            return []

        total_sentences = len(sentences)

        # Build word sequence with position-weighted co-occurrence
        # We track word positions to apply window-based co-occurrence
        word_positions: list[tuple[str, int, float]] = []
        global_pos = 0

        for sent_idx, sentence in enumerate(sentences):
            tokens = self._tokenize(sentence)
            # Position weight: front-loaded text matters more
            if sent_idx < max(1, total_sentences * 0.10):
                pos_weight = 3.0
            elif sent_idx < max(1, total_sentences * 0.30):
                pos_weight = 2.0
            else:
                pos_weight = 1.0

            for token in tokens:
                word_positions.append((token, global_pos, pos_weight))
                global_pos += 1

        if not word_positions:
            return []

        # Build co-occurrence graph with sliding window
        # graph[word_a][word_b] = cumulative co-occurrence weight
        window = 3
        graph: dict[str, dict[str, float]] = defaultdict(lambda: defaultdict(float))

        for i, (word_i, pos_i, w_i) in enumerate(word_positions):
            # Look ahead within window
            for j in range(i + 1, min(i + window + 1, len(word_positions))):
                word_j, pos_j, w_j = word_positions[j]
                if word_i == word_j:
                    continue
                # Edge weight = average of both words' position weights
                edge_weight = (w_i + w_j) / 2.0
                graph[word_i][word_j] += edge_weight
                graph[word_j][word_i] += edge_weight

        # TextRank PageRank iteration
        words = list(graph.keys())
        n = len(words)
        if n == 0:
            return []

        # Initialize scores uniformly
        scores = {w: 1.0 for w in words}
        damping = 0.85
        threshold = 0.0001
        max_iter = 100

        for _ in range(max_iter):
            max_diff = 0.0
            new_scores = {}

            for word_i in words:
                neighbor_sum = 0.0
                for word_j, edge_w in graph[word_i].items():
                    out_sum = sum(graph[word_j].values())
                    if out_sum > 0:
                        neighbor_sum += (edge_w / out_sum) * scores[word_j]

                new_score = (1.0 - damping) + damping * neighbor_sum
                new_scores[word_i] = new_score
                max_diff = max(max_diff, abs(new_score - scores[word_i]))

            scores = new_scores
            if max_diff < threshold:
                break

        # Sort by score descending
        ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        max_score = ranked[0][1] if ranked else 1.0

        # Also count word frequency
        word_counter = Counter(w for w, _, _ in word_positions)

        result = []
        for word, score in ranked[:top_n]:
            result.append({
                'word': word,
                'count': word_counter.get(word, 0),
                'weight': round(score / max_score, 4) if max_score > 0 else 0.0,
            })

        return result
