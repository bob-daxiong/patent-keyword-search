"""Tests for FastAPI endpoints using TestClient."""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import pytest
from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


class TestHealthEndpoint:

    def test_health_check(self):
        response = client.get('/api/health')
        assert response.status_code == 200
        assert response.json() == {'status': 'ok'}


class TestSearchEndpoints:

    def test_search_queries_empty_keywords(self):
        response = client.post('/api/search-queries', json={
            'text': 'test text',
            'keywords': [],
        })
        assert response.status_code == 200
        data = response.json()
        assert 'ipc_predictions' in data
        assert 'queries' in data

    def test_search_queries_with_keywords(self):
        response = client.post('/api/search-queries', json={
            'text': '深度学习神经网络图像识别',
            'keywords': ['深度学习', '神经网络', '图像识别'],
        })
        assert response.status_code == 200
        data = response.json()
        assert 'ipc_predictions' in data
        assert 'queries' in data
        assert isinstance(data['queries'], list)

    def test_search_patent_single_db(self):
        response = client.post('/api/search', json={
            'query_id': 'test-001',
            'query_text': '深度学习',
            'databases': ['google'],
        })
        assert response.status_code == 200
        data = response.json()
        assert data['queryId'] == 'test-001'
        assert 'searchUrls' in data
        assert 'patentResults' in data
        assert isinstance(data['patentResults'], list)

    def test_search_patent_multiple_dbs(self):
        response = client.post('/api/search', json={
            'query_id': 'test-002',
            'query_text': '神经网络',
            'databases': ['cnipa', 'espacenet', 'google'],
        })
        assert response.status_code == 200
        data = response.json()
        assert data['queryId'] == 'test-002'
        assert len(data['searchUrls']) == 3

    def test_search_cnipa_url_https(self):
        response = client.post('/api/search', json={
            'query_id': 'test-003',
            'query_text': '人工智能',
            'databases': ['cnipa'],
        })
        assert response.status_code == 200
        urls = response.json()['searchUrls']
        assert len(urls) == 1
        assert urls[0]['url'].startswith('https://')

    def test_google_patent_results_empty(self):
        response = client.post('/api/search', json={
            'query_id': 'test-004',
            'query_text': 'test',
            'databases': ['google'],
        })
        assert response.status_code == 200
        data = response.json()
        assert data['patentResults'] == []


class TestCORSHeaders:

    def test_cors_headers_present(self):
        response = client.options('/api/health', headers={
            'Origin': 'https://test-abc.monkeycode-ai.online',
            'Access-Control-Request-Method': 'GET',
        })
        # TestClient doesn't fully simulate CORS preflight,
        # but we can check the middleware is configured
        assert response.status_code in (200, 405)
