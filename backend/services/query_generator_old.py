import uuid

from services.synonym_dict import get_synonyms


class QueryGenerator:

    def __init__(self, ipc_predictor=None):
        self.ipc_predictor = ipc_predictor

    def generate(self, keywords: list[dict], ipc_codes: list[dict] | None = None) -> list[dict]:
        if not keywords:
            return []

        keyword_words = [k['word'] for k in keywords]
        queries: list[dict] = []

        queries.extend(self._generate_ipc_first_queries(keyword_words, ipc_codes))
        queries.extend(self._generate_synonym_queries(keyword_words, ipc_codes))
        queries.extend(self._generate_core_queries(keyword_words, ipc_codes))
        queries.extend(self._generate_ipc_queries(keyword_words, ipc_codes))
        queries.extend(self._generate_or_queries(keyword_words, ipc_codes))
        queries.extend(self._generate_broad_queries(keyword_words, ipc_codes))

        return queries

    def _generate_ipc_first_queries(
        self, keywords: list[str], ipc_codes: list[dict] | None
    ) -> list[dict]:
        if not ipc_codes or len(keywords) < 2:
            return []

        queries = []
        top_words = keywords[:4]
        top_ipcs = ipc_codes[:3]

        for ipc in top_ipcs:
            base_code = ipc['code']
            broad_code = self._get_broad_ipc(base_code)

            for db_name, fmt in self._get_db_formats().items():
                if db_name == 'google':
                    kw_part = ' '.join(f'"{t}"' for t in top_words)
                    if broad_code and broad_code != base_code:
                        ipc_prefix = f'{base_code} OR {broad_code}'
                    else:
                        ipc_prefix = base_code
                    query_text = f'{ipc_prefix} {kw_part}'
                elif db_name == 'espacenet':
                    kw_part = '(' + ' AND '.join(top_words) + ')'
                    if broad_code and broad_code != base_code:
                        ipc_prefix = f'({base_code} OR {broad_code})'
                    else:
                        ipc_prefix = base_code
                    query_text = f'{ipc_prefix} AND {kw_part}'
                else:
                    kw_part = '(' + ') AND ('.join(top_words) + ')'
                    if broad_code and broad_code != base_code:
                        ipc_prefix = f'({base_code} OR {broad_code})'
                    else:
                        ipc_prefix = base_code
                    query_text = f'{ipc_prefix} AND ({kw_part})'

                broad_label = f'/{broad_code}' if broad_code else ''
                queries.append({
                    'id': str(uuid.uuid4()),
                    'strategy': f'IPC优先: {ipc["code"]}{broad_label}',
                    'queryText': query_text,
                    'targetDbs': [db_name],
                    'ipcCodes': [ipc['code']] + ([broad_code] if broad_code else []),
                    'editable': True,
                    'priority': 1,
                })

            narrow_words = top_words[:2]
            for db_name, fmt in self._get_db_formats().items():
                if db_name == 'google':
                    kw_part = ' '.join(f'"{t}"' for t in narrow_words)
                    query_text = f'{ipc["code"]} {kw_part}'
                elif db_name == 'espacenet':
                    kw_part = '(' + ' AND '.join(narrow_words) + ')'
                    query_text = f'{ipc["code"]} AND {kw_part}'
                else:
                    kw_part = '(' + ') AND ('.join(narrow_words) + ')'
                    query_text = f'{ipc["code"]} AND ({kw_part})'

                queries.append({
                    'id': str(uuid.uuid4()),
                    'strategy': f'IPC精准: {ipc["code"]} + 核心2词',
                    'queryText': query_text,
                    'targetDbs': [db_name],
                    'ipcCodes': [ipc['code']],
                    'editable': True,
                    'priority': 1,
                })

        return queries

    def _generate_synonym_queries(
        self, keywords: list[str], ipc_codes: list[dict] | None
    ) -> list[dict]:
        if len(keywords) < 2:
            return []

        queries = []
        top_keys = keywords[:5]
        groups: list[tuple[str, list[str]]] = []

        for kw in top_keys:
            syns = get_synonyms(kw, max_count=3)
            group = [kw] + syns[:2]
            groups.append((kw, group))

        if len(groups) < 2:
            return []

        for db_name, fmt in self._get_db_formats().items():
            or_terms = []
            for _, group in groups:
                if len(group) >= 2:
                    or_terms.append(fmt['or'](group))
                else:
                    or_terms.append(f'"{group[0]}"' if db_name == 'google' else group[0])

            combined = fmt['and'](or_terms) if db_name == 'google' else fmt['and'](or_terms)
            queries.append({
                'id': str(uuid.uuid4()),
                'strategy': f'同义词扩展 ({len(groups)}词组)',
                'queryText': combined,
                'targetDbs': [db_name],
                'ipcCodes': [ipc['code'] for ipc in (ipc_codes or [])[:3]],
                'editable': True,
                'priority': 2,
            })

        for db_name, fmt in self._get_db_formats().items():
            top3 = keywords[:3]
            syn_groups = []
            for kw in top3:
                syns = get_synonyms(kw, max_count=2)
                syn_groups.append([kw] + syns[:1])

            or_exprs = []
            for g in syn_groups:
                if len(g) >= 2:
                    or_exprs.append(fmt['or'](g))
                else:
                    or_exprs.append(f'"{g[0]}"' if db_name == 'google' else g[0])

            combined = fmt['and'](or_exprs)
            queries.append({
                'id': str(uuid.uuid4()),
                'strategy': f'同义词扩展 (核心3词)',
                'queryText': combined,
                'targetDbs': [db_name],
                'ipcCodes': [ipc['code'] for ipc in (ipc_codes or [])[:3]],
                'editable': True,
                'priority': 2,
            })

        return queries

    def _generate_core_queries(
        self, keywords: list[str], ipc_codes: list[dict] | None
    ) -> list[dict]:
        queries = []
        top3 = keywords[:3]
        top5 = keywords[:5] if len(keywords) >= 5 else keywords

        for db_name, fmt in self._get_db_formats().items():
            if len(top3) >= 3:
                queries.append({
                    'id': str(uuid.uuid4()),
                    'strategy': f'核心词AND ({len(top3)}词)',
                    'queryText': fmt['and'](top3),
                    'targetDbs': [db_name],
                    'ipcCodes': [ipc['code'] for ipc in (ipc_codes or [])[:3]],
                    'editable': True,
                    'priority': 3,
                })

            if len(top5) >= 5:
                queries.append({
                    'id': str(uuid.uuid4()),
                    'strategy': f'核心词AND ({len(top5)}词)',
                    'queryText': fmt['and'](top5),
                    'targetDbs': [db_name],
                    'ipcCodes': [ipc['code'] for ipc in (ipc_codes or [])[:3]],
                    'editable': True,
                    'priority': 3,
                })

        return queries

    def _generate_or_queries(
        self, keywords: list[str], ipc_codes: list[dict] | None
    ) -> list[dict]:
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
                'editable': True,
                'priority': 4,
            })

        return queries

    def _generate_broad_queries(
        self, keywords: list[str], ipc_codes: list[dict] | None
    ) -> list[dict]:
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
                'editable': True,
                'priority': 5,
            })

        return queries

    def _generate_ipc_queries(
        self, keywords: list[str], ipc_codes: list[dict] | None
    ) -> list[dict]:
        if not ipc_codes or len(keywords) < 2:
            return []

        queries = []
        top_words = keywords[:3]
        for ipc in ipc_codes[:2]:
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
                    'editable': True,
                    'priority': 3,
                })

        return queries

    @staticmethod
    def _get_broad_ipc(code: str) -> str | None:
        """获取上位 IPC，如 G06N3/08 -> G06N"""
        if '/' in code:
            section = code.split('/')[0]
            if len(section) >= 4:
                return section[:4] if len(section) > 4 else section
        if len(code) >= 4:
            return code[:4]
        return None

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
