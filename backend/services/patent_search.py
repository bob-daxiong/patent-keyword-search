from urllib.parse import quote


class PatentSearchAdapter:

    def build_search_urls(self, query_text: str, databases: list[str]) -> list[dict]:
        urls = []
        for db in databases:
            url = self._build_url(db, query_text)
            if url:
                urls.append({
                    'database': db,
                    'label': self._get_label(db),
                    'url': url,
                })
        return urls

    def _build_url(self, db: str, query_text: str) -> str:
        encoded = quote(query_text, safe='')
        if db == 'google':
            return f'https://patents.google.com/?q={encoded}&language=ZH'
        elif db == 'espacenet':
            return f'https://worldwide.espacenet.com/patent/search?q={encoded}'
        elif db == 'cnipa':
            return f'http://pss-system.cponline.cnipa.gov.cn/conventionalSearch'
        return ''

    def _get_label(self, db: str) -> str:
        labels = {
            'google': 'Google Patents',
            'espacenet': 'Espacenet (欧洲专利局)',
            'cnipa': '中国专利公布公告',
        }
        return labels.get(db, db)

    async def fetch_google_patents_results(self, query_text: str, max_results: int = 15) -> list[dict]:
        encoded = quote(query_text, safe='')
        url = f'https://patents.google.com/?q={encoded}&language=ZH'
        return [{
            'title': f'Google Patents 检索: {query_text[:60]}{"..." if len(query_text) > 60 else ""}',
            'patentNumber': '',
            'abstract': 'Google Patents 屏蔽了自动化抓取，请点击右侧"查看原文"按钮在新标签中查看完整检索结果。',
            'applicant': '',
            'filingDate': '',
            'url': url,
        }]
