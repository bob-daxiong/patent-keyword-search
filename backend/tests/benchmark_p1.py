"""P1 accuracy benchmark: stopwords fix and IPC coverage expansion.

Tests keyword extraction quality after stopwords fix and
IPC prediction coverage across multiple technology domains.
"""

import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))


AI_PATENT_TEXT = """
本发明涉及一种基于深度学习的图像识别方法及系统。通过引入深度可分离卷积和通道注意力机制，
在保持较高识别精度的同时大幅降低计算复杂度，提高推理速度，减少模型参数量。
所述方法使用梯度下降算法对网络参数进行优化训练，损失函数采用交叉熵损失结合正则化项。
本发明的技术效果在于：改善了模型的泛化能力，增强了特征表达能力，提高了识别准确率，
降低了推理延迟，适合在移动终端和嵌入式设备上部署。
"""

PHARMA_PATENT_TEXT = """
本发明涉及一种抗肿瘤药物组合物及其制备方法。该组合物包含治疗有效量的式(I)化合物或其
药学上可接受的盐，以及药学上可接受的载体。所述化合物对多种肿瘤细胞系显示出优异的
抑制活性。制备方法包括将活性成分与药用辅料混合，经湿法制粒后压片或灌装胶囊。
所述组合物可用于治疗肺癌、乳腺癌和结肠癌等恶性肿瘤。与现有化疗药物相比，
本发明的化合物具有更高的选择性，降低了毒副作用，提高了患者的耐受性。
"""

CHEMISTRY_PATENT_TEXT = """
本发明涉及一种高分子复合材料及其制备方法。所述复合材料包含聚丙烯基体和表面改性的
纳米二氧化硅填料，通过熔融共混法制备。所述纳米填料的表面改性采用硅烷偶联剂处理，
提高了填料在基体中的分散性。所制备的复合材料具有优异的力学性能，拉伸强度提高30%，
冲击强度提高50%。该材料可应用于汽车零部件和电子电器外壳等领域。
"""


def test_stopwords_fix():
    """Test that technical action words are no longer filtered as stopwords."""
    from services.keyword_extractor import KeywordExtractor

    extractor = KeywordExtractor()
    old_extractor_class = __import__('services.keyword_extractor_old', fromlist=['KeywordExtractor']).KeywordExtractor
    old_extractor = old_extractor_class()

    # Old: these words would be filtered
    # New: they should appear in results

    old_results = old_extractor.extract(AI_PATENT_TEXT, top_n=30)
    new_results = extractor.extract(AI_PATENT_TEXT, top_n=30)

    old_words = set(k['word'] for k in old_results)
    new_words = set(k['word'] for k in new_results)

    # Technical action words that were previously filtered
    tech_action_words = ['提高', '降低', '改善', '增强', '优化', '减少']

    old_found = [w for w in tech_action_words if w in old_words]
    new_found = [w for w in tech_action_words if w in new_words]

    # Patent boilerplate words that should ALWAYS be filtered
    patent_boilerplate = ['权利要求', '说明书', '附图', '实施例']

    old_has_boilerplate = [w for w in patent_boilerplate if w in old_words]
    new_has_boilerplate = [w for w in patent_boilerplate if w in new_words]

    result = {
        'test': '停用词修复：技术动作词不再被过滤',
        'before': {
            'tech_words_found': old_found,
            'count': len(old_found),
        },
        'after': {
            'tech_words_found': new_found,
            'count': len(new_found),
        },
        'improvement': f'{len(old_found)} -> {len(new_found)} (+{len(new_found) - len(old_found)})',
        'boilerplate_filtered_old': old_has_boilerplate,
        'boilerplate_filtered_new': new_has_boilerplate,
    }

    print(f'\n停用词修复:')
    print(f'  旧版技术动作词命中: {old_found} ({len(old_found)}个)')
    print(f'  新版技术动作词命中: {new_found} ({len(new_found)}个)')
    print(f'  改善: +{len(new_found) - len(old_found)}个技术效果关键词现在可被提取')
    print(f'  专利模板词(应始终过滤): 旧版={old_has_boilerplate}, 新版={new_has_boilerplate}')

    return result


def test_ipc_coverage():
    """Test IPC prediction across multiple technology domains."""
    from services.ipc_predictor import IPCPredictor as NewIPC
    old_ipc_class = __import__('services.ipc_predictor_old', fromlist=['IPCPredictor']).IPCPredictor
    old_predictor = old_ipc_class()
    new_predictor = NewIPC()

    domain_tests = {
        'AI/计算机视觉': ['深度学习', '卷积神经网络', '图像识别', '特征提取'],
        '制药/药物': ['抗肿瘤', '药物组合物', '药学上可接受', '制剂', '胶囊'],
        '化学/材料': ['高分子', '纳米填料', '聚丙烯', '复合材料', '偶联剂'],
        '半导体/电子': ['集成电路', '光刻', '晶体管', '晶圆', '半导体制造'],
        '电池/能源': ['锂离子电池', '正极材料', '电解液', '充放电', '比容量'],
        '机械/制造': ['轴承', '齿轮', '传动', '紧固件', '密封'],
        '环保/水处理': ['废水处理', '膜分离', '活性炭', '吸附', '反渗透'],
        '生物技术': ['基因编辑', 'CRISPR', '细胞培养', '单克隆抗体', 'PCR'],
        '建筑/土木': ['混凝土', '钢筋', '抗震', '预应力', '地基'],
        '汽车/交通': ['自动驾驶', '发动机控制', '充电桩', '电池管理', '燃油喷射'],
    }

    print('\nIPC 覆盖度测试 (10个技术领域):')
    print(f'{"领域":<16} {"旧版结果数":<12} {"新版结果数":<12} {"改善"}')
    print('-' * 56)

    total_old = 0
    total_new = 0

    for domain, keywords in domain_tests.items():
        old_results = old_predictor.predict(keywords, top_n=5)
        new_results = new_predictor.predict(keywords, top_n=5)
        old_count = len(old_results)
        new_count = len(new_results)
        total_old += old_count
        total_new += new_count
        diff = new_count - old_count
        symbol = '+' if diff >= 0 else ''
        print(f'  {domain:<14} {old_count:<12} {new_count:<12} {symbol}{diff}')

    print('-' * 56)
    print(f'  {"合计":<14} {total_old:<12} {total_new:<12} +{total_new - total_old}')

    old_coverage = sum(1 for d, k in domain_tests.items() if len(old_predictor.predict(k, top_n=1)) > 0)
    new_coverage = sum(1 for d, k in domain_tests.items() if len(new_predictor.predict(k, top_n=1)) > 0)

    result = {
        'test': 'IPC覆盖度：10个技术领域对比',
        'before': {'total_results': total_old, 'domain_coverage': f'{old_coverage}/{len(domain_tests)}'},
        'after': {'total_results': total_new, 'domain_coverage': f'{new_coverage}/{len(domain_tests)}'},
        'improvement': f'{total_old} -> {total_new} (+{total_new - total_old}条结果, +{new_coverage - old_coverage}个领域覆盖)',
    }

    print(f'\n领域覆盖数: 旧版={old_coverage}/10, 新版={new_coverage}/10')
    print(f'覆盖率提升: +{new_coverage - old_coverage}个领域')

    return result


def test_keyword_quality_after_stopwords():
    """Test keyword extraction quality on different document types."""
    from services.keyword_extractor import KeywordExtractor as NewExtractor
    old_extractor_class = __import__('services.keyword_extractor_old', fromlist=['KeywordExtractor']).KeywordExtractor
    old_extractor = old_extractor_class()
    new_extractor = NewExtractor()

    test_cases = [
        ('AI专利', AI_PATENT_TEXT, ['识别', '卷积', '网络', '学习']),
        ('制药专利', PHARMA_PATENT_TEXT, ['化合物', '肿瘤', '药物', '制剂']),
        ('材料专利', CHEMISTRY_PATENT_TEXT, ['材料', '纳米', '聚丙烯', '复合']),
    ]

    print('\n关键词质量对比 (3种类型专利):')
    for name, text, expected in test_cases:
        old_kw = old_extractor.extract(text, top_n=20)
        new_kw = new_extractor.extract(text, top_n=20)
        old_words = [k['word'] for k in old_kw]
        new_words = [k['word'] for k in new_kw]

        old_hits = [w for w in expected if w in old_words]
        new_hits = [w for w in expected if w in new_words]

        print(f'\n  [{name}]')
        print(f'    期望关键词: {expected}')
        print(f'    旧版命中: {old_hits} ({len(old_hits)}/{len(expected)})')
        print(f'    新版命中: {new_hits} ({len(new_hits)}/{len(expected)})')
        print(f'    旧版 Top-10: {old_words[:10]}')
        print(f'    新版 Top-10: {new_words[:10]}')

    result = {
        'test': '关键词质量：3种专利类型',
        'note': '新版TextRank+位置权重+停用词修复综合效果',
    }
    return result


def main():
    print('=' * 70)
    print('P1 准确率修复前后对比基准测试')
    print('  - 停用词: 移除技术动作词过滤, 补充专利模板词')
    print('  - IPC索引: 从96条扩展到260条, 覆盖10+技术领域')
    print('=' * 70)

    r1 = test_stopwords_fix()
    r2 = test_ipc_coverage()
    r3 = test_keyword_quality_after_stopwords()

    print('\n' + '=' * 70)
    print('P1 修复效果总结')
    print('=' * 70)

    improvements = []

    if r1['after']['count'] > r1['before']['count']:
        improvements.append(f'技术动作词命中: {r1["improvement"]}')
    else:
        print(f'  [!] 技术动作词未改善: {r1["improvement"]}')

    if r2['after']['total_results'] > r2['before']['total_results']:
        improvements.append(f'IPC覆盖度: {r2["improvement"]}')

    for imp in improvements:
        print(f'  [OK] {imp}')

    # Comprehensive result
    full_result = {
        'stopwords_fix': r1,
        'ipc_coverage': r2,
        'improvements': improvements,
    }

    with open(os.path.join(os.path.dirname(__file__), 'benchmark_p1_result.json'), 'w', encoding='utf-8') as f:
        json.dump(full_result, f, ensure_ascii=False, indent=2)

    print(f'\n详细结果已保存到: tests/benchmark_p1_result.json')


if __name__ == '__main__':
    main()
