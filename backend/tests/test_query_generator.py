"""Tests for QueryGenerator - query generation strategies."""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from services.query_generator import QueryGenerator


class TestQueryGenerator:

    def setup_method(self):
        self.generator = QueryGenerator()

    def test_empty_keywords_returns_empty(self):
        result = self.generator.generate([])
        assert result == []

    def test_basic_generation(self):
        keywords = [
            {'word': '深度学习', 'count': 10, 'weight': 1.0},
            {'word': '神经网络', 'count': 8, 'weight': 0.8},
            {'word': '图像识别', 'count': 6, 'weight': 0.6},
            {'word': '卷积', 'count': 5, 'weight': 0.5},
            {'word': '训练', 'count': 4, 'weight': 0.4},
        ]
        result = self.generator.generate(keywords)
        assert len(result) > 0
        for r in result:
            assert 'id' in r
            assert 'strategy' in r
            assert 'queryText' in r
            assert 'targetDbs' in r
            assert 'priority' in r
            assert 'editable' in r
            assert r['targetDbs'][0] in ('cnipa', 'espacenet', 'google')
            assert 1 <= r['priority'] <= 5

    def test_generation_with_ipc(self):
        keywords = [
            {'word': '人脸识别', 'count': 10, 'weight': 1.0},
            {'word': '特征提取', 'count': 8, 'weight': 0.8},
            {'word': '摄像头', 'count': 6, 'weight': 0.6},
        ]
        ipc_codes = [
            {'code': 'G06K9/00', 'description': '识别', 'score': 0.8},
        ]
        result = self.generator.generate(keywords, ipc_codes)
        # Should include IPC-first and IPC queries
        assert len(result) > 0
        strategies = [r['strategy'] for r in result]
        ipc_related = [s for s in strategies if 'IPC' in s]
        assert len(ipc_related) > 0

    def test_all_strategies_present_with_good_data(self):
        keywords = [
            {'word': '数据加密', 'count': 15, 'weight': 1.0},
            {'word': '区块链', 'count': 12, 'weight': 0.8},
            {'word': '共识算法', 'count': 10, 'weight': 0.67},
            {'word': '智能合约', 'count': 8, 'weight': 0.53},
            {'word': '分布式', 'count': 7, 'weight': 0.47},
        ]
        ipc_codes = [
            {'code': 'H04L9/00', 'description': '加密', 'score': 0.9},
            {'code': 'G06F21/00', 'description': '安全', 'score': 0.7},
            {'code': 'H04L29/00', 'description': '网络', 'score': 0.5},
        ]
        result = self.generator.generate(keywords, ipc_codes)
        strategies = set(r['strategy'].split(':')[0].strip() for r in result)
        assert len(result) > 0
        # Should have multiple strategy types
        assert len(strategies) >= 2

    def test_priority_order(self):
        keywords = [
            {'word': 'A', 'count': 10, 'weight': 1.0},
            {'word': 'B', 'count': 9, 'weight': 0.9},
            {'word': 'C', 'count': 8, 'weight': 0.8},
            {'word': 'D', 'count': 7, 'weight': 0.7},
            {'word': 'E', 'count': 6, 'weight': 0.6},
        ]
        ipc_codes = [
            {'code': 'G06F1/00', 'description': '测试', 'score': 0.9},
        ]
        result = self.generator.generate(keywords, ipc_codes)
        priorities = [r['priority'] for r in result]
        assert sorted(priorities) == priorities  # non-decreasing order
        assert len(priorities) > 0
        # With IPC, should have priority 1 queries
        assert 1 in priorities

    def test_get_broad_ipc(self):
        assert QueryGenerator._get_broad_ipc('G06K9/00') == 'G06K'
        assert QueryGenerator._get_broad_ipc('H04L9/00') == 'H04L'
        assert QueryGenerator._get_broad_ipc('G06K') == 'G06K'
        assert QueryGenerator._get_broad_ipc('AB') is None

    def test_google_format_uses_quotes(self):
        keywords = [
            {'word': 'testA', 'count': 5, 'weight': 1.0},
            {'word': 'testB', 'count': 4, 'weight': 0.8},
            {'word': 'testC', 'count': 3, 'weight': 0.6},
        ]
        result = self.generator.generate(keywords)
        google_queries = [r for r in result if 'google' in r['targetDbs']]
        assert len(google_queries) > 0
        # Google queries should use double quotes around terms
        for q in google_queries:
            assert '"' in q['queryText']

    def test_less_than_two_keywords_no_synonym_no_or(self):
        keywords = [
            {'word': 'single', 'count': 10, 'weight': 1.0},
        ]
        result = self.generator.generate(keywords)
        strategies = [r['strategy'] for r in result]
        assert all('同义词' not in s and 'OR' not in s for s in strategies)
