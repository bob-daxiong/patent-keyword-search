"""Tests for PatentSearchAdapter - URL building and Google fetch behavior."""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from services.patent_search import PatentSearchAdapter


class TestPatentSearchAdapter:

    def setup_method(self):
        self.adapter = PatentSearchAdapter()

    def test_build_search_urls_all_databases(self):
        urls = self.adapter.build_search_urls('深度学习', ['cnipa', 'espacenet', 'google'])
        assert len(urls) == 3
        db_names = [u['database'] for u in urls]
        assert 'cnipa' in db_names
        assert 'espacenet' in db_names
        assert 'google' in db_names

    def test_build_search_urls_single_db(self):
        urls = self.adapter.build_search_urls('区块链', ['google'])
        assert len(urls) == 1
        assert urls[0]['database'] == 'google'
        assert 'patents.google.com' in urls[0]['url']
        assert '%E5%8C%BA%E5%9D%97%E9%93%BE' in urls[0]['url']

    def test_build_search_urls_empty_databases(self):
        urls = self.adapter.build_search_urls('test', [])
        assert urls == []

    def test_build_search_urls_unknown_db(self):
        urls = self.adapter.build_search_urls('test', ['unknown_db'])
        assert urls == []

    def test_cnipa_url_is_https(self):
        urls = self.adapter.build_search_urls('人工智能', ['cnipa'])
        assert len(urls) == 1
        assert urls[0]['url'].startswith('https://')
        assert 'conventionalSearch' in urls[0]['url']

    def test_cnipa_url_includes_query(self):
        urls = self.adapter.build_search_urls('神经网络', ['cnipa'])
        assert len(urls) == 1
        assert 'search=' in urls[0]['url']

    def test_espacenet_url_format(self):
        urls = self.adapter.build_search_urls('image recognition', ['espacenet'])
        assert len(urls) == 1
        assert 'worldwide.espacenet.com' in urls[0]['url']
        assert 'q=' in urls[0]['url']

    def test_fetch_google_patents_returns_empty(self):
        import asyncio
        results = asyncio.run(self.adapter.fetch_google_patents_results('test query'))
        assert results == []
        assert isinstance(results, list)

    def test_labels(self):
        urls = self.adapter.build_search_urls('test', ['cnipa', 'google', 'espacenet'])
        labels = {u['database']: u['label'] for u in urls}
        assert '中国专利公布公告' in labels['cnipa']
        assert 'Google Patents' in labels['google']
        assert 'Espacenet' in labels['espacenet']
