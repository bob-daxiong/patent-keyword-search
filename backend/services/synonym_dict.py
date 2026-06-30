"""专利技术术语同义词词典，用于检索式扩展"""

SYNONYM_DICT: dict[str, list[str]] = {
    # 人工智能 / 深度学习
    '深度学习': ['深度神经网络', 'DNN', 'deep learning', '深度信念网络', '深度模型'],
    '卷积神经网络': ['CNN', '卷积网络', 'ConvNet', 'convolutional neural network', '卷积'],
    '神经网络': ['neural network', 'NN', '人工神经网络', 'ANN', '神经网路', '神经元网络'],
    '循环神经网络': ['RNN', 'recurrent neural network', 'LSTM', 'GRU', '递归神经网络'],
    '生成对抗网络': ['GAN', 'generative adversarial network', '对抗生成网络', '对抗网络'],
    'Transformer': ['transformer', '注意力机制', '自注意力', 'self-attention', 'Transformer模型'],
    '强化学习': ['reinforcement learning', 'RL', '增强学习', 'Q-learning', '深度强化学习'],
    '迁移学习': ['transfer learning', '迁移训练', '领域自适应', 'domain adaptation'],
    '联邦学习': ['federated learning', '联邦训练', '分布式学习'],
    '机器学习': ['machine learning', 'ML', '统计学习', '模式识别'],
    '模型训练': ['训练', '模型优化', '参数优化', 'model training'],
    '推理': ['inference', '推断', '预测', '前向传播', 'forward propagation'],
    '反向传播': ['backpropagation', 'back propagation', 'BP算法', '梯度回传'],
    '梯度下降': ['gradient descent', 'SGD', '随机梯度下降', '梯度优化'],
    '激活函数': ['activation function', 'ReLU', 'Sigmoid', 'Tanh', '激活'],
    '损失函数': ['loss function', '损失', '代价函数', '目标函数', 'cost function'],
    '过拟合': ['overfitting', '过学习', '正则化', 'regularization', 'dropout'],
    '归一化': ['normalization', '标准化', '批归一化', 'batch normalization', 'BN'],
    '编码器': ['encoder', '编码', '自编码器', 'autoencoder', 'AE'],
    '解码器': ['decoder', '解码', '解码网络'],

    # 计算机视觉
    '图像识别': ['image recognition', '图像分类', '图像辨识', '图片识别', '视觉识别', '图像理解'],
    '目标检测': ['object detection', '物体检测', '目标识别', '物体识别', '检测'],
    '图像分割': ['image segmentation', '语义分割', '实例分割', '分割', 'segmentation'],
    '人脸识别': ['face recognition', '人脸检测', '面部识别', '人脸辨识'],
    '特征提取': ['feature extraction', '特征抽取', '特征选择', '特征工程', '特征表示'],
    '边缘检测': ['edge detection', '边缘提取', '轮廓检测', '边界检测'],
    '图像增强': ['image enhancement', '图像增强处理', '图像改善', '增强'],
    '图像去噪': ['image denoising', '去噪', '降噪', '噪声去除', 'denoising'],
    '超分辨率': ['super resolution', '超分辨', '图像超分', 'SR'],
    '视频分析': ['video analysis', '视频理解', '视频处理', '行为识别', '动作识别'],
    '三维重建': ['3D reconstruction', '三维重构', '3D重建', '立体视觉'],
    'OCR': ['optical character recognition', '光学字符识别', '文字识别', '文本识别'],

    # 自然语言处理
    '自然语言处理': ['NLP', 'natural language processing', '自然语言理解', 'NLU', '文本处理'],
    '文本分类': ['text classification', '文本归类', '文档分类', '文本类别'],
    '情感分析': ['sentiment analysis', '情感分类', '观点挖掘', '意见挖掘'],
    '命名实体识别': ['NER', 'named entity recognition', '实体识别', '实体抽取'],
    '机器翻译': ['machine translation', 'MT', '自动翻译', '翻译'],
    '文本生成': ['text generation', '文本合成', '生成', 'generation'],
    '信息抽取': ['information extraction', '信息提取', '知识抽取', '关系抽取'],
    '问答系统': ['question answering', 'QA', '问答', '智能问答'],
    '摘要生成': ['summarization', '文本摘要', '自动摘要', 'abstractive summarization'],
    '词向量': ['word embedding', '词嵌入', 'Word2Vec', 'GloVe', '词表示'],
    '语义理解': ['semantic understanding', '语义分析', '语义表示', '语义'],
    '知识图谱': ['knowledge graph', '知识图', 'KG', '知识库', '知识表示'],

    # 数据处理
    '数据预处理': ['data preprocessing', '数据清洗', '数据准备', '数据清理', '预处理'],
    '数据增强': ['data augmentation', '数据扩充', '增强', 'augmentation'],
    '特征工程': ['feature engineering', '特征构造', '特征处理', '特征'],
    '降维': ['dimensionality reduction', '维度约简', 'PCA', '主成分分析', '特征降维'],
    '聚类': ['clustering', '聚类分析', 'K-means', '聚类算法', '群集'],
    '分类器': ['classifier', '分类模型', '分类算法', 'SVM', '支持向量机', '决策树'],
    '回归': ['regression', '回归分析', '回归模型', '预测'],

    # 硬件 / 系统
    'GPU': ['图形处理器', 'graphics processing unit', '显卡', 'GPU加速'],
    'FPGA': ['现场可编程门阵列', 'field programmable gate array', '可编程逻辑'],
    '边缘计算': ['edge computing', '边缘智能', '端侧推理', 'on-device'],
    '嵌入式': ['embedded', '嵌入式系统', '嵌入式设备', '单片机'],
    '传感器': ['sensor', '感测器', '探测器', '检测器'],
    '芯片': ['chip', '集成电路', 'IC', '处理器', 'processor', 'SoC'],

    # 应用领域
    '自动驾驶': ['autonomous driving', '无人驾驶', '智能驾驶', 'self-driving', '辅助驾驶'],
    '医学影像': ['medical imaging', '医疗影像', '医学图像', '医疗图像', '影像诊断'],
    '智能语音': ['speech recognition', '语音识别', '语音合成', 'TTS', 'ASR', '语音'],
    '推荐系统': ['recommendation system', '推荐算法', '个性化推荐', '协同过滤'],
    '异常检测': ['anomaly detection', '异常识别', '故障检测', '离群检测'],
    '机器人': ['robot', '机器人学', '机械臂', '智能机器人', 'robotics'],
    '安防': ['security', '监控', '视频监控', '安防监控', 'surveillance'],
    '金融': ['finance', '金融科技', 'fintech', '风控', '风险评估'],
    '教育': ['education', '智能教育', '在线教育', '自适应学习'],

    # 通用专利术语
    '方法': ['method', '方案', '技术', '手段', '途径'],
    '系统': ['system', '平台', '装置', '设备', 'apparatus'],
    '模块': ['module', '组件', '单元', '部件', 'component'],
    '算法': ['algorithm', '算法模型', '计算方法', '运算'],
    '模型': ['model', '建模', '框架', '架构', 'framework'],
    '数据集': ['dataset', '训练集', '测试集', '样本集', '数据'],
    '参数': ['parameter', '超参数', '权重', '配置', 'hyperparameter'],
    '优化': ['optimization', '优化算法', '调优', '最优化', '改进'],
    '识别': ['recognition', '辨识', '鉴别', '检测', 'detection'],
    '预测': ['prediction', '预估', '估计', '推理', 'estimation'],
    '生成': ['generation', '合成', '创建', '构建', 'construction'],
    '分类': ['classification', '归类', '划分', '分类法'],
    '匹配': ['matching', '比对', '对齐', '配准', 'registration'],
    '融合': ['fusion', '融合处理', '结合', '集成', 'integration'],
    '压缩': ['compression', '编码', '量化', '剪枝', 'pruning'],
    '加速': ['acceleration', '加速处理', '提速', '快速', '高效'],
    '精度': ['accuracy', '准确率', '精确度', '准确性', 'precision'],
    '效率': ['efficiency', '性能', '速度', '吞吐', 'performance'],
    '实时': ['real-time', '在线', '即时', '实时处理'],
    '自适应': ['adaptive', '自适应调整', '动态', '自适应机制'],
}


def expand_keywords(keywords: list[dict], max_synonyms: int = 3) -> list[dict]:
    """为每个关键词查找同义词/近义词，返回扩展后的关键词列表（去重）"""
    expanded = {}
    for kw in keywords:
        word = kw['word']
        expanded[word] = kw

        synonyms = SYNONYM_DICT.get(word, [])
        for syn in synonyms[:max_synonyms]:
            if syn not in expanded:
                expanded[syn] = {
                    'word': syn,
                    'count': 0,
                    'weight': round(kw['weight'] * 0.6, 4),
                    'source_word': word,
                }
    return list(expanded.values())


def get_synonyms(word: str, max_count: int = 3) -> list[str]:
    """获取单个词的同义词列表"""
    return SYNONYM_DICT.get(word, [])[:max_count]
