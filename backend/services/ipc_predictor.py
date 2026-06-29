import json

from config import IPC_INDEX_PATH


class IPCPredictor:

    def __init__(self):
        self.ipc_entries: list[dict] = []
        self._load_ipc_index()

    def _load_ipc_index(self) -> None:
        try:
            with open(IPC_INDEX_PATH, 'r', encoding='utf-8') as f:
                self.ipc_entries = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            self.ipc_entries = []

    def predict(self, keywords: list[str], top_n: int = 5) -> list[dict]:
        if not self.ipc_entries or not keywords:
            return []

        scores: list[dict] = []
        keywords_lower = [kw.lower() for kw in keywords]

        for entry in self.ipc_entries:
            desc = entry.get('description', '').lower()
            score = 0
            for kw in keywords_lower:
                if kw in desc:
                    score += 1
                entry_keywords = desc.replace('、', ',').replace('，', ',').split(',')
                for entry_kw in entry_keywords:
                    entry_kw = entry_kw.strip()
                    if entry_kw and len(entry_kw) > 1 and entry_kw in kw:
                        score += 0.5
            if score > 0:
                scores.append({
                    'code': entry['code'],
                    'description': entry.get('description', ''),
                    'score': round(score / len(keywords), 4)
                })

        scores.sort(key=lambda x: x['score'], reverse=True)
        return scores[:top_n]
