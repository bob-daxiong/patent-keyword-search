import uuid


class QueryGenerator:

    def __init__(self, ipc_predictor=None):
        self.ipc_predictor = ipc_predictor

    def generate(self, keywords: list[dict], ipc_codes: list[dict] | None = None) -> list[dict]:
        if not keywords:
            return []

        keyword_words = [k['word'] for k in keywords]
        queries = []

        queries.extend(self._generate_core_queries(keyword_words, ipc_codes))
        queries.extend(self._generate_or_queries(keyword_words, ipc_codes))
        queries.extend(self._generate_broad_queries(keyword_words, ipc_codes))
        queries.extend(self._generate_ipc_queries(keyword_words, ipc_codes))

        return queries

    def _generate_core_queries(self, keywords: list[str], ipc_codes: list[dict] | None) -> list[dict]:
        """核心词 AND 组合: 权重最高的 3-5 个关键词用 AND 连接"""
        queries = []

        top3 = keywords[:3]
        top5 = keywords[:5] if len(keywords) >= 5 else keywords

        for db_name, fmt in self._get_db_formats().items():
            if len(top3) >= 3:
                queries.append({
                    'id': str(uuid.uuid4()),
                    'strategy': f'核心词AND组合 ({len(top3)}词)',
                    'queryText': fmt['and'](top3),
                    'targetDbs': [db_name],
                    'ipcCodes': [ipc['code'] for ipc in (ipc_codes or [])[:3]],
                    'editable': True
                })

            if len(top5) >= 5:
                queries.append({
                    'id': str(uuid.uuid4()),
                    'strategy': f'核心词AND组合 ({len(top5)}词)',
                    'queryText': fmt['and'](top5),
                    'targetDbs': [db_name],
                    'ipcCodes': [ipc['code'] for ipc in (ipc_codes or [])[:3]],
                    'editable': True
                })

        return queries

    def _generate_or_queries(self, keywords: list[str], ipc_codes: list[dict] | None) -> list[dict]:
        """扩展 OR 组合: 核心词之间 AND, 同义词之间 OR"""
        if len(keywords) < 3:
            return []

        half = max(len(keywords) // 3, 2)
        group1 = keywords[:half]
        group2 = keywords[half:half * 2] if len(keywords) >= half * 2 else keywords[half:]

        queries = []
        for db_name, fmt in self._get_db_formats().items():
            or1 = fmt['or'](group1)
            or2 = fmt['or'](group2)
            combined = fmt['and']([or1, or2]) if or2 else or1

            queries.append({
                'id': str(uuid.uuid4()),
                'strategy': '扩展OR组合',
                'queryText': combined,
                'targetDbs': [db_name],
                'ipcCodes': [ipc['code'] for ipc in (ipc_codes or [])[:3]],
                'editable': True
            })

        return queries

    def _generate_broad_queries(self, keywords: list[str], ipc_codes: list[dict] | None) -> list[dict]:
        """宽泛检索式: 仅用 2 个最核心词 AND"""
        if len(keywords) < 2:
            return []

        top2 = keywords[:2]
        queries = []
        for db_name, fmt in self._get_db_formats().items():
            queries.append({
                'id': str(uuid.uuid4()),
                'strategy': '宽泛检索 (2核心词)',
                'queryText': fmt['and'](top2),
                'targetDbs': [db_name],
                'ipcCodes': [ipc['code'] for ipc in (ipc_codes or [])[:3]],
                'editable': True
            })

        return queries

    def _generate_ipc_queries(self, keywords: list[str], ipc_codes: list[dict] | None) -> list[dict]:
        """IPC 分类号限定检索式"""
        if not ipc_codes or len(keywords) < 2:
            return []

        queries = []
        top_words = keywords[:3]
        for ipc in ipc_codes[:3]:
            for db_name, fmt in self._get_db_formats().items():
                kw_part = fmt['and'](top_words)
                if db_name == 'google':
                    ipc_query = f'{ipc["code"]} {kw_part}'
                elif db_name == 'espacenet':
                    ipc_query = f'{ipc["code"]} AND ({kw_part})'
                else:
                    ipc_query = f'{ipc["code"]} AND ({kw_part})'

                queries.append({
                    'id': str(uuid.uuid4()),
                    'strategy': f'IPC限定: {ipc["code"]}',
                    'queryText': ipc_query,
                    'targetDbs': [db_name],
                    'ipcCodes': [ipc['code']],
                    'editable': True
                })

        return queries

    @staticmethod
    def _get_db_formats() -> dict:
        return {
            'cnipa': {
                'and': lambda terms: '(' + ') AND ('.join(terms) + ')',
                'or': lambda terms: '(' + ' OR '.join(terms) + ')',
            },
            'espacenet': {
                'and': lambda terms: '(' + ' AND '.join(terms) + ')',
                'or': lambda terms: '(' + ' OR '.join(terms) + ')',
            },
            'google': {
                'and': lambda terms: ' '.join(f'"{t}"' for t in terms),
                'or': lambda terms: '(' + ' OR '.join(f'"{t}"' for t in terms) + ')',
            },
        }
