"""Tests for IPCPredictor with mock IPC index data."""

import sys
import os
import json
import tempfile
from unittest.mock import patch
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from services.ipc_predictor import IPCPredictor


SAMPLE_IPC = [
    {'code': 'G06N3/08', 'desc': '神经网络,深度学习,学习算法'},
    {'code': 'G06K9/00', 'desc': '图像识别,目标检测,模式识别'},
    {'code': 'H04L9/00', 'desc': '加密算法,网络安全,数据安全保护'},
    {'code': 'G06F21/00', 'desc': '计算机安全,访问控制,身份验证'},
    {'code': 'A61B5/00', 'desc': '医学诊断,生理测量,体征检测'},
]


def _create_index(entries):
    fd, path = tempfile.mkstemp(suffix='.json', prefix='ipc_test_')
    with os.fdopen(fd, 'w', encoding='utf-8') as f:
        json.dump(entries, f, ensure_ascii=False)
    return path


class TestIPCPredictor:

    def test_predict_exact_match(self):
        test_path = _create_index(SAMPLE_IPC)
        with patch('services.ipc_predictor.IPC_INDEX_PATH', test_path):
            predictor = IPCPredictor()
            results = predictor.predict(['神经网络', '深度学习'])
            assert len(results) > 0
            assert results[0]['code'] == 'G06N3/08'

    def test_predict_single_match(self):
        test_path = _create_index(SAMPLE_IPC)
        with patch('services.ipc_predictor.IPC_INDEX_PATH', test_path):
            predictor = IPCPredictor()
            results = predictor.predict(['图像识别'])
            assert len(results) > 0
            assert any(r['code'] == 'G06K9/00' for r in results)

    def test_predict_empty_keywords(self):
        predictor = IPCPredictor()
        predictor.ipc_entries = SAMPLE_IPC
        results = predictor.predict([])
        assert results == []

    def test_predict_empty_index(self):
        predictor = IPCPredictor()
        predictor.ipc_entries = []
        results = predictor.predict(['test'])
        assert results == []

    def test_predict_score_range(self):
        test_path = _create_index(SAMPLE_IPC)
        with patch('services.ipc_predictor.IPC_INDEX_PATH', test_path):
            predictor = IPCPredictor()
            results = predictor.predict(['加密', '安全', '访问控制'])
            assert len(results) > 0
            for r in results:
                assert 0 <= r['score'] <= 1.0

    def test_predict_limit_top_n(self):
        test_path = _create_index(SAMPLE_IPC)
        with patch('services.ipc_predictor.IPC_INDEX_PATH', test_path):
            predictor = IPCPredictor()
            results = predictor.predict(['数据', '学习', '识别', '安全', '诊断'], top_n=3)
            assert len(results) <= 3

    def test_predict_partial_match(self):
        test_path = _create_index(SAMPLE_IPC)
        with patch('services.ipc_predictor.IPC_INDEX_PATH', test_path):
            predictor = IPCPredictor()
            results = predictor.predict(['网络安全'])
            assert len(results) > 0
            assert any(r['code'] == 'H04L9/00' for r in results)

    def test_predict_scores_descending(self):
        test_path = _create_index(SAMPLE_IPC)
        with patch('services.ipc_predictor.IPC_INDEX_PATH', test_path):
            predictor = IPCPredictor()
            results = predictor.predict(['深度学习', '神经网络', '图像识别', '安全'])
            assert len(results) > 0
            for i in range(len(results) - 1):
                assert results[i]['score'] >= results[i + 1]['score']

    def test_cleanup(self):
        test_path = _create_index(SAMPLE_IPC)
        with patch('services.ipc_predictor.IPC_INDEX_PATH', test_path):
            predictor = IPCPredictor()
            results = predictor.predict(['神经网络'])
            assert len(results) > 0
        # File should still exist after context exit (we clean up manually if needed)
        if os.path.exists(test_path):
            os.unlink(test_path)
