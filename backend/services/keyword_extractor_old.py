import re
from collections import Counter

import jieba
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

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
        sentences = re.split(r'[。！？；\n]+', text)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 5]

        if not sentences:
            return []

        word_counter: Counter = Counter()
        tokenized_sentences: list[str] = []

        for sentence in sentences:
            tokens = self._tokenize(sentence)
            word_counter.update(tokens)
            tokenized_sentences.append(' '.join(tokens))

        if not tokenized_sentences:
            return []

        vectorizer = TfidfVectorizer(
            max_features=min(top_n * 3, 200),
            token_pattern=r'[^\s]+'
        )
        try:
            tfidf_matrix = vectorizer.fit_transform(tokenized_sentences)
        except ValueError:
            return self._fallback_extract(word_counter, top_n)

        feature_names = vectorizer.get_feature_names_out()
        tfidf_scores = np.asarray(tfidf_matrix.sum(axis=0)).flatten()

        keyword_scores = {}
        for i, word in enumerate(feature_names):
            if word in self.stopwords:
                continue
            if len(word) < 2:
                continue
            keyword_scores[word] = tfidf_scores[i]

        top_keywords = sorted(keyword_scores.items(), key=lambda x: x[1], reverse=True)
        max_score = top_keywords[0][1] if top_keywords else 1.0

        result = []
        for word, score in top_keywords[:top_n]:
            result.append({
                'word': word,
                'count': word_counter.get(word, 0),
                'weight': round(float(score / max_score), 4) if max_score > 0 else 0.0
            })

        return result

    def _fallback_extract(self, word_counter: Counter, top_n: int) -> list[dict]:
        most_common = word_counter.most_common(top_n)
        if not most_common:
            return []
        max_count = most_common[0][1]
        return [
            {
                'word': word,
                'count': count,
                'weight': round(count / max_count, 4)
            }
            for word, count in most_common
        ]
