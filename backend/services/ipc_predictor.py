"""IPC predictor using word-level Jaccard similarity.

Replaces naive substring matching with token-level comparison
to reduce false positives from common short words.
"""

import json
import re

import jieba

from config import IPC_INDEX_PATH


class IPCPredictor:

    def __init__(self):
        self.ipc_entries: list[dict] = []
        self._tokenized_entries: list[set[str]] = []
        self._load_ipc_index()

    def _load_ipc_index(self) -> None:
        try:
            with open(IPC_INDEX_PATH, 'r', encoding='utf-8') as f:
                self.ipc_entries = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            self.ipc_entries = []
            return

        # Pre-tokenize all IPC descriptions for fast Jaccard computation
        for entry in self.ipc_entries:
            desc = entry.get('desc', '')
            self._tokenized_entries.append(self._tokenize(desc))

    @staticmethod
    def _tokenize(text: str) -> set[str]:
        """Tokenize text into word set, filtering short tokens."""
        text = text.lower().replace('、', ',').replace('，', ',').replace(' ', ',')
        parts = re.split(r'[,;/]+', text)
        tokens: set[str] = set()
        for p in parts:
            p = p.strip()
            if len(p) >= 2:
                tokens.add(p)
            # Also add jieba tokenization for compound words
            for w in jieba.lcut(p):
                w = w.strip()
                if len(w) >= 2:
                    tokens.add(w)
        return tokens

    def predict(self, keywords: list[str], top_n: int = 5) -> list[dict]:
        if not self.ipc_entries or not keywords:
            return []

        # Tokenize input keywords
        keyword_set: set[str] = set()
        for kw in keywords:
            kw_lower = kw.lower().strip()
            if len(kw_lower) >= 2:
                keyword_set.add(kw_lower)
            # Also add jieba sub-tokens for compound matching
            for w in jieba.lcut(kw_lower):
                w = w.strip()
                if len(w) >= 2:
                    keyword_set.add(w)

        if not keyword_set:
            return []

        scores: list[dict] = []

        for idx, entry in enumerate(self.ipc_entries):
            entry_tokens = self._tokenized_entries[idx]

            # Jaccard similarity: |A ∩ B| / |A ∪ B|
            intersection = keyword_set & entry_tokens
            union = keyword_set | entry_tokens

            if not intersection:
                continue

            jaccard = len(intersection) / len(union) if union else 0.0

            if jaccard > 0:
                scores.append({
                    'code': entry['code'],
                    'description': entry.get('desc', ''),
                    'score': round(jaccard, 4),
                })

        # Sort by score descending
        scores.sort(key=lambda x: x['score'], reverse=True)
        return scores[:top_n]
