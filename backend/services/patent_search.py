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
            return f'https://pss-system.cponline.cnipa.gov.cn/conventionalSearch?search={encoded}'
        return ''

    def _get_label(self, db: str) -> str:
        labels = {
            'google': 'Google Patents',
            'espacenet': 'Espacenet (欧洲专利局)',
            'cnipa': '中国专利公布公告',
        }
        return labels.get(db, db)

    async def fetch_google_patents_results(self, query_text: str, max_results: int = 15) -> list[dict]:
        """
        Google Patents blocks headless browser scraping.
        Return empty list so the frontend displays a guidance message
        instead of fake patent data.
        """
        return []
