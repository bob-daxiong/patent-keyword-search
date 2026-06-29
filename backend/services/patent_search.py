import asyncio
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
        try:
            from playwright.async_api import async_playwright
        except ImportError:
            return []

        encoded = quote(query_text, safe='')
        url = f'https://patents.google.com/?q={encoded}&language=ZH'

        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True, args=[
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                ])
                page = await browser.new_page()
                await page.goto(url, timeout=30000, wait_until='networkidle')
                await page.wait_for_timeout(2000)

                results = await page.evaluate('''() => {
                    const items = [];
                    const resultElements = document.querySelectorAll('search-result-item, .result, [data-result]');
                    if (resultElements.length > 0) {
                        resultElements.forEach((el, i) => {
                            if (i >= 15) return;
                            const titleEl = el.querySelector('h3, .title, [class*="title"] a, a[href*="/patent/"]');
                            const numberEl = el.querySelector('[class*="number"], [class*="patent"], .publication-number');
                            const abstractEl = el.querySelector('[class*="abstract"], [class*="snippet"], .description, p');
                            const assigneeEl = el.querySelector('[class*="assignee"], [class*="applicant"], [class*="company"]');
                            const dateEl = el.querySelector('[class*="date"], [class*="filed"], time');
                            const linkEl = el.querySelector('a[href*="/patent/"]');
                            if (titleEl && linkEl) {
                                items.push({
                                    title: titleEl.textContent.trim(),
                                    patentNumber: numberEl ? numberEl.textContent.trim() : '',
                                    abstract: abstractEl ? abstractEl.textContent.trim().substring(0, 300) : '',
                                    applicant: assigneeEl ? assigneeEl.textContent.trim() : '',
                                    filingDate: dateEl ? dateEl.textContent.trim() : '',
                                    url: linkEl.href || '',
                                });
                            }
                        });
                    }
                    return items;
                }''')

                await browser.close()

                if not results:
                    return [{
                        'title': '请点击下方链接在 Google Patents 中查看完整结果',
                        'patentNumber': '',
                        'abstract': f'检索式: {query_text}',
                        'applicant': '',
                        'filingDate': '',
                        'url': url,
                    }]

                return results
        except Exception:
            return []
