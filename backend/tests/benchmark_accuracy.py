"""Accuracy benchmark: before vs after P0 fixes.

Compares keyword extraction quality, IPC prediction accuracy,
and query generation diversity between old and new implementations.
"""

import json
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Sample patent disclosure text (composite, representative of AI patent)
SAMPLE_TEXT = """
本发明涉及一种基于深度学习的图像识别方法及系统，属于计算机视觉和人工智能技术领域。

技术背景：传统的图像识别方法依赖于手工设计的特征提取器，如SIFT、HOG等，这些方法在复杂场景下识别准确率较低。近年来，卷积神经网络(CNN)在图像分类任务中取得了突破性进展，但现有模型参数量大、推理速度慢，难以在边缘设备上部署。

发明内容：本发明提出一种轻量级神经网络架构，通过引入深度可分离卷积和通道注意力机制，在保持较高识别精度的同时大幅降低计算复杂度。所述方法包括以下步骤：
S1、对输入图像进行预处理，包括尺寸归一化和数据增强；
S2、通过多尺度特征提取网络提取图像特征，所述特征提取网络包含3个深度可分离卷积层和2个注意力模块；
S3、将提取的特征输入分类器进行目标识别，输出分类结果及置信度；
S4、使用梯度下降算法对网络参数进行优化训练，损失函数采用交叉熵损失结合L2正则化项。

技术效果：与现有技术相比，本发明在ImageNet数据集上top-1准确率达到78.5%，模型参数量仅为MobileNetV2的60%，推理延迟降低40%，适合部署在移动终端和嵌入式设备上。本发明还支持迁移学习，可快速适配到医疗影像分析、工业缺陷检测、自动驾驶场景理解等应用场景。

具体实施方式：所述特征提取网络的第一深度可分离卷积层采用3x3卷积核，步长为2，输出通道数为32；第二深度可分离卷积层采用3x3卷积核，步长为1，输出通道数为64；第三深度可分离卷积层采用5x5卷积核，步长为2，输出通道数为128。注意力模块采用SE-Net结构的通道注意力，通过全局平均池化和全连接层学习各通道的重要性权重。

权利要求：
1. 一种基于深度学习的图像识别方法，其特征在于，包括以下步骤...
2. 如权利要求1所述的图像识别方法，其特征在于，所述特征提取网络采用深度可分离卷积...
3. 如权利要求1所述的图像识别方法，其特征在于，所述注意力模块为通道注意力机制...
4. 如权利要求1所述的图像识别方法，其特征在于，所述训练使用Adam优化器和学习率衰减策略...
5. 一种图像识别系统，包括处理器和存储器，用于执行权利要求1-4任一项所述的方法...
"""

# Expected ground truth for this text
EXPECTED_TOP_KEYWORDS = [
    '深度可分离卷积', '卷积神经网络', '图像识别', '注意力机制',
    '特征提取', '通道注意力', '深度学习', '神经网络',
    '梯度下降', '迁移学习',
]

EXPECTED_IPC_DOMAIN = 'G06'  # Computing/Image processing


def run_old_keyword_extraction():
    """Run old TF-IDF keyword extractor."""
    from services.keyword_extractor_old import KeywordExtractor as OldExtractor
    extractor = OldExtractor()
    return extractor.extract(SAMPLE_TEXT, top_n=30)


def run_new_keyword_extraction():
    """Run new TextRank keyword extractor."""
    from services.keyword_extractor import KeywordExtractor as NewExtractor
    extractor = NewExtractor()
    return extractor.extract(SAMPLE_TEXT, top_n=30)


def calculate_keyword_metrics(keywords, label):
    """Calculate keyword quality metrics."""
    top_words = [k['word'] for k in keywords[:10]]
    top_weights = [k['weight'] for k in keywords[:10]]

    # Coverage: how many expected keywords in top results
    hits = [w for w in top_words if w in EXPECTED_TOP_KEYWORDS]
    coverage = len(hits) / len(EXPECTED_TOP_KEYWORDS)

    # Weight discrimination: std/mean ratio - higher = better differentiation
    if len(top_weights) > 1:
        avg_w = sum(top_weights) / len(top_weights)
        if avg_w > 0:
            variance = sum((w - avg_w) ** 2 for w in top_weights) / len(top_weights)
            cv = (variance ** 0.5) / avg_w
        else:
            cv = 0
    else:
        cv = 0

    # Unique top words
    unique_ratio = len(set(top_words)) / len(top_words) if top_words else 0

    return {
        'label': label,
        'top_keywords': top_words,
        'coverage': round(coverage, 3),
        'weight_cv': round(cv, 3),
        'hits': hits,
        'top_weights': [round(w, 3) for w in top_weights],
    }


def run_old_ipc_prediction():
    """Run old substring-matching IPC predictor."""
    from services.ipc_predictor_old import IPCPredictor as OldIPC
    predictor = OldIPC()
    keywords = ['深度可分离卷积', '图像识别', '注意力机制', '迁移学习', '边缘设备']
    return predictor.predict(keywords, top_n=5)


def run_new_ipc_prediction():
    """Run new Jaccard-based IPC predictor."""
    from services.ipc_predictor import IPCPredictor as NewIPC
    predictor = NewIPC()
    keywords = ['深度可分离卷积', '图像识别', '注意力机制', '迁移学习', '边缘设备']
    return predictor.predict(keywords, top_n=5)


def calculate_ipc_metrics(predictions, label):
    """Calculate IPC prediction quality metrics."""
    top_codes = [p['code'] for p in predictions[:3]]
    top_scores = [p['score'] for p in predictions[:3]]
    top_descs = [p.get('description', '')[:40] for p in predictions[:3]]

    # Domain match: how many predicted IPCs start with expected domain
    domain_hits = sum(1 for c in top_codes if c.startswith(EXPECTED_IPC_DOMAIN))

    # Score decay: ratio of 1st to 3rd score - steeper = better discrimination
    if len(top_scores) >= 3 and top_scores[2] > 0:
        score_decay = top_scores[0] / top_scores[2]
    else:
        score_decay = 1.0

    return {
        'label': label,
        'top_codes': top_codes,
        'top_scores': [round(s, 4) for s in top_scores],
        'top_descs': top_descs,
        'domain_hits': domain_hits,
        'score_decay': round(score_decay, 2),
        'num_results': len(predictions),
    }


def run_old_query_generation():
    """Run old query generator (no weight differentiation)."""
    from services.query_generator_old import QueryGenerator as OldGen
    generator = OldGen()
    keywords = [
        {'word': '深度可分离卷积', 'count': 10, 'weight': 1.0},
        {'word': '图像识别', 'count': 8, 'weight': 0.8},
        {'word': '注意力机制', 'count': 6, 'weight': 0.6},
        {'word': '神经网络', 'count': 5, 'weight': 0.5},
        {'word': '预处理', 'count': 3, 'weight': 0.3},
        {'word': '数据增强', 'count': 2, 'weight': 0.2},
    ]
    ipc_codes = [
        {'code': 'G06K9/00', 'description': '图像识别', 'score': 0.8},
    ]
    return generator.generate(keywords, ipc_codes)


def run_new_query_generation():
    """Run new query generator (weight-driven)."""
    from services.query_generator import QueryGenerator as NewGen
    generator = NewGen()
    keywords = [
        {'word': '深度可分离卷积', 'count': 10, 'weight': 1.0},
        {'word': '图像识别', 'count': 8, 'weight': 0.8},
        {'word': '注意力机制', 'count': 6, 'weight': 0.6},
        {'word': '神经网络', 'count': 5, 'weight': 0.5},
        {'word': '预处理', 'count': 3, 'weight': 0.3},
        {'word': '数据增强', 'count': 2, 'weight': 0.2},
    ]
    ipc_codes = [
        {'code': 'G06K9/00', 'description': '图像识别', 'score': 0.8},
    ]
    return generator.generate(keywords, ipc_codes)


def calculate_query_metrics(queries, label):
    """Calculate query generation quality metrics."""
    strategies = set()
    priorities = []
    for q in queries:
        strat = q['strategy'].split(':')[0].strip()
        strategies.add(strat)
        priorities.append(q.get('priority', 99))

    # Count queries by priority
    priority_counts = {}
    for p in priorities:
        priority_counts[p] = priority_counts.get(p, 0) + 1

    # Query text length range
    lengths = [len(q['queryText']) for q in queries]

    # Check if high-weight keywords appear in priority-1 queries
    p1_queries = [q for q in queries if q.get('priority') == 1]
    p5_queries = [q for q in queries if q.get('priority') == 5]

    return {
        'label': label,
        'total_queries': len(queries),
        'unique_strategies': len(strategies),
        'priority_distribution': priority_counts,
        'min_query_len': min(lengths) if lengths else 0,
        'max_query_len': max(lengths) if lengths else 0,
        'avg_query_len': round(sum(lengths) / len(lengths), 1) if lengths else 0,
        'p1_count': len(p1_queries),
        'p5_count': len(p5_queries),
    }


def main():
    print('=' * 70)
    print('P0 准确率修复前后对比基准测试')
    print('=' * 70)

    # ---- Keyword Extraction ----
    print('\n--- 1. 关键词提取准确率对比 ---')
    old_kw = run_old_keyword_extraction()
    new_kw = run_new_keyword_extraction()
    old_kw_metrics = calculate_keyword_metrics(old_kw, '旧版 (单文档TF-IDF)')
    new_kw_metrics = calculate_keyword_metrics(new_kw, '新版 (TextRank+位置权重)')

    print(f'\n旧版 Top-10: {old_kw_metrics["top_keywords"]}')
    print(f'新版 Top-10: {new_kw_metrics["top_keywords"]}')
    print(f'\n旧版 权重分布: {old_kw_metrics["top_weights"]}')
    print(f'新版 权重分布: {new_kw_metrics["top_weights"]}')
    print(f'\n覆盖度 (命中期望关键词): 旧版={old_kw_metrics["coverage"]} -> 新版={new_kw_metrics["coverage"]}')
    print(f'权重区分度 (CV,越高越好):   旧版={old_kw_metrics["weight_cv"]} -> 新版={new_kw_metrics["weight_cv"]}')
    print(f'命中词: 旧版={old_kw_metrics["hits"]}')
    print(f'命中词: 新版={new_kw_metrics["hits"]}')

    # ---- IPC Prediction ----
    print('\n--- 2. IPC预测准确率对比 ---')
    old_ipc = run_old_ipc_prediction()
    new_ipc = run_new_ipc_prediction()
    old_ipc_metrics = calculate_ipc_metrics(old_ipc, '旧版 (子串匹配)')
    new_ipc_metrics = calculate_ipc_metrics(new_ipc, '新版 (Jaccard相似度)')

    print(f'\n旧版 Top-3 IPC: {old_ipc_metrics["top_codes"]}')
    print(f'新版 Top-3 IPC: {new_ipc_metrics["top_codes"]}')
    print(f'\n旧版 得分: {old_ipc_metrics["top_scores"]}')
    print(f'新版 得分: {new_ipc_metrics["top_scores"]}')
    print(f'\n旧版 描述: {old_ipc_metrics["top_descs"]}')
    print(f'新版 描述: {new_ipc_metrics["top_descs"]}')
    print(f'\n领域命中 ({EXPECTED_IPC_DOMAIN}部): 旧版={old_ipc_metrics["domain_hits"]}/3 -> 新版={new_ipc_metrics["domain_hits"]}/3')
    print(f'最高/最低得分比 (区分度):     旧版={old_ipc_metrics["score_decay"]} -> 新版={new_ipc_metrics["score_decay"]}')
    print(f'结果数量: 旧版={old_ipc_metrics["num_results"]} -> 新版={new_ipc_metrics["num_results"]}')

    # ---- Query Generation ----
    print('\n--- 3. 检索式生成质量对比 ---')
    old_queries = run_old_query_generation()
    new_queries = run_new_query_generation()
    old_q_metrics = calculate_query_metrics(old_queries, '旧版 (无权重区分)')
    new_q_metrics = calculate_query_metrics(new_queries, '新版 (权重驱动)')

    print(f'\n旧版 检索式总数: {old_q_metrics["total_queries"]}')
    print(f'新版 检索式总数: {new_q_metrics["total_queries"]}')
    print(f'\n旧版 策略种类: {old_q_metrics["unique_strategies"]}')
    print(f'新版 策略种类: {new_q_metrics["unique_strategies"]}')
    print(f'\n旧版 优先级分布: {old_q_metrics["priority_distribution"]}')
    print(f'新版 优先级分布: {new_q_metrics["priority_distribution"]}')
    print(f'\n旧版 查询长度 最小/最大/平均: {old_q_metrics["min_query_len"]}/{old_q_metrics["max_query_len"]}/{old_q_metrics["avg_query_len"]}')
    print(f'新版 查询长度 最小/最大/平均: {new_q_metrics["min_query_len"]}/{new_q_metrics["max_query_len"]}/{new_q_metrics["avg_query_len"]}')
    print(f'\n旧版 P1(最高精度)查询数: {old_q_metrics["p1_count"]}')
    print(f'新版 P1(最高精度)查询数: {new_q_metrics["p1_count"]}')
    print(f'旧版 P5(宽泛)查询数: {old_q_metrics["p5_count"]}')
    print(f'新版 P5(宽泛)查询数: {new_q_metrics["p5_count"]}')

    # ---- Summary ----
    print('\n' + '=' * 70)
    print('修复效果总结')
    print('=' * 70)

    improvements = []

    if new_kw_metrics['coverage'] > old_kw_metrics['coverage']:
        improvements.append(f'关键词覆盖度提升: {old_kw_metrics["coverage"]} -> {new_kw_metrics["coverage"]}')
    if new_kw_metrics['weight_cv'] > old_kw_metrics['weight_cv']:
        improvements.append(f'权重区分度提升: {old_kw_metrics["weight_cv"]} -> {new_kw_metrics["weight_cv"]}')

    if new_ipc_metrics['domain_hits'] >= old_ipc_metrics['domain_hits']:
        improvements.append(f'IPC领域命中: 旧={old_ipc_metrics["domain_hits"]}/3, 新={new_ipc_metrics["domain_hits"]}/3')
    if new_ipc_metrics['score_decay'] > old_ipc_metrics['score_decay']:
        improvements.append(f'IPC得分区分度提升: {old_ipc_metrics["score_decay"]} -> {new_ipc_metrics["score_decay"]}')

    if new_q_metrics['total_queries'] < old_q_metrics['total_queries']:
        improvements.append(f'冗余查询减少: {old_q_metrics["total_queries"]} -> {new_q_metrics["total_queries"]}')

    for imp in improvements:
        print(f'  [OK] {imp}')

    # Score
    total_checks = 5
    passed = len(improvements)
    print(f'\n总评: {passed}/{total_checks} 项指标改善')

    # Output JSON for programmatic comparison
    result = {
        'keyword': {
            'old': old_kw_metrics,
            'new': new_kw_metrics,
        },
        'ipc': {
            'old': old_ipc_metrics,
            'new': new_ipc_metrics,
        },
        'query': {
            'old': old_q_metrics,
            'new': new_q_metrics,
        },
        'improvements': improvements,
        'score': f'{passed}/{total_checks}',
    }

    with open(os.path.join(os.path.dirname(__file__), 'benchmark_result.json'), 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print('\n详细结果已保存到: tests/benchmark_result.json')


if __name__ == '__main__':
    main()
