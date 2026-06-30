# 需求实施计划

- [ ] 1. 建立主题系统和 CSS 设计变量
   - 创建 `frontend/src/styles/design-tokens.css`，定义深色/浅色两套 CSS 变量（背景层次、边框、文字、强调色、语义色、阴影）
   - 覆盖 REQ-1 全部 7 条验收标准
   - 在 `index.css` 中 import 该文件

- [ ] 2. 实现主题切换逻辑
  - [ ] 2.1 创建 `frontend/src/components/ThemeProvider.tsx`
    - 实现 ThemeContext，管理 `theme: 'dark' | 'light'` 状态
    - 初始化时读取 `localStorage('patent_theme_mode')`，fallback 到 `prefers-color-scheme`
    - 设置 `document.documentElement.dataset.theme`
    - 覆盖 REQ-2 验收标准 1、2、4

  - [ ] 2.2 创建 `frontend/src/components/ThemeToggle.tsx`
    - 渲染太阳/月亮图标按钮
    - 点击调用 `toggleTheme`
    - 图标旋转动画 300ms
    - 覆盖 REQ-2 验收标准 2、5

  - [ ] 2.3 集成 antd ConfigProvider
    - 在 `App.tsx` 中根据 `theme` 动态构建 `themeConfig`
    - 注入 card/table/modal/button/tag 等组件级 Token
    - 确保与 CSS 变量颜色一致（accent: #06b6d4）
    - 覆盖 REQ-1 验收标准 5

  - [ ] 2.4 为主题系统编写单元测试
    - 测试 ThemeContext 的初始化和切换
    - 测试 localStorage 读写

- [ ] 3. 检查点 - 主题系统可工作，切换无闪烁

- [ ] 4. 重构全局布局
  - [ ] 4.1 创建 `frontend/src/components/AppShell.tsx`
    - 使用 antd Layout 组件构建 Sidebar + Content 结构
    - Sidebar 固定左侧，Content 自适应剩余空间
    - 覆盖 REQ-3 验收标准 1、2、5

  - [ ] 4.2 创建 `frontend/src/components/Sidebar.tsx`
    - 顶部：Logo + 标题（电光蓝图标）
    - 中部：4 个 NavItem（上传分析 / 检索式 / 检索结果 / 历史记录），激活态强调色背景 + 左侧 3px 竖线
    - 底部：ThemeToggle 组件
    - 折叠态 64px / 展开态 220px
    - 移动端 (< 768px) 自动折叠
    - 覆盖 REQ-3 验收标准 3、4、7

  - [ ] 4.3 创建 `frontend/src/components/PageContainer.tsx`
    - 1200px 最大宽度 + 水平居中 + padding
    - 可选 title/subtitle/backButton props
    - 覆盖 REQ-3 验收标准 5

  - [ ] 4.4 为布局组件编写测试
    - 测试 Sidebar 折叠/展开
    - 测试移动端断点检测

- [ ] 5. 检查点 - 布局正确，导航可点击跳转，侧边栏折叠正常

- [ ] 6. 改造首页（上传分析）
  - [ ] 6.1 重写 `frontend/src/pages/HomePage.tsx` 的视觉结构
    - 添加 Hero 区域（标题 + 副标题 + 步骤指示器，替换当前紧凑标题）
    - 使用 PageContainer 包裹
    - 覆盖 REQ-4 验收标准 1

  - [ ] 6.2 改造 `frontend/src/components/UploadPanel.tsx`
    - 深色拖拽区：暗底 + 发光虚线边框 (accent-border) + hover 时边框亮度提升
    - 图标容器改为 accent-bg 圆形背景 + 霓虹色图标
    - 文字改为 text-primary / text-secondary
    - 覆盖 REQ-4 验收标准 2

  - [ ] 6.3 改造 `frontend/src/components/TextPreview.tsx`
    - 深色代码块风格：`bg-input` 背景 + 等宽字体 + 行号
    - antd Typography 使用 accent 色系
    - 覆盖 REQ-4 验收标准 3

  - [ ] 6.4 改造 `frontend/src/components/KeywordTable.tsx`
    - 表格使用 antd 自定义 Token（headerBg、headerColor、rowHoverBg）
    - 进度条颜色改为 `accent-primary → accent-hover` 渐变
    - 关键词 Tag 改为 accent 色系
    - 复选框使用 accent 色彩
    - 覆盖 REQ-4 验收标准 4

  - [ ] 6.5 改造 `frontend/src/components/WordCloud.tsx`
    - SVG 文字渲染颜色从当前紫色改为从 accent 色系采样的渐变
    - 深色背景适配
    - 覆盖 REQ-4 验收标准 5

  - [ ] 6.6 添加 loading 骨架屏
    - 创建 `frontend/src/components/Skeleton.tsx`，使用脉冲动画
    - 关键词提取中替换 Spin 为骨架屏
    - 覆盖 REQ-4 验收标准 6

- [ ] 7. 检查点 - 首页所有组件在深色/浅色模式下显示正常

- [ ] 8. 改造检索式页面
  - [ ] 8.1 重写 `frontend/src/pages/SearchQueryPage.tsx`
    - 使用 PageContainer 包裹
    - 顶部展示 IPC 分类号标签云（accent 色系 Tag）
    - 覆盖 REQ-5 验收标准 6

  - [ ] 8.2 改造 `frontend/src/components/SearchQueryEditor.tsx`
    - 检索式按策略分组（IPC 优先 / 同义词扩展 / 其他），每组带标题
    - 每个检索式卡片：优先级徽章 + 检索式 code + 数据库标签 + 搜索按钮
    - 超过 10 条时提供策略/数据库筛选下拉
    - 内联编辑模式保留，回车/失焦保存
    - 覆盖 REQ-5 验收标准 1、2、3、4

  - [ ] 8.3 添加批量搜索进度条
    - "全部执行检索"按钮点击后展示逐条进度条
    - 使用 antd Progress 组件，accent 色系
    - 覆盖 REQ-5 验收标准 5

- [ ] 9. 检查点 - 检索式页面分组、筛选、批量搜索进度正常

- [ ] 10. 改造检索结果页
  - [ ] 10.1 重写 `frontend/src/pages/ResultsPage.tsx`
    - 检索链接按数据库分组展示（CNIPA > Espacenet > Google 优先级排序）
    - 每个链接为信息卡片：数据库 Logo/标识色 + 检索式文本 + 打开按钮
    - 打开后按钮状态变更为"已打开"（checked 图标）
    - 覆盖 REQ-6 验收标准 1、2、3

  - [ ] 10.2 改造专利结果列表
    - 简洁列表展示（专利号、标题、申请人、申请日）
    - antd List 组件使用深色主题适配
    - 覆盖 REQ-6 验收标准 4

  - [ ] 10.3 空结果引导
    - 无检索结果时展示引导文案 + 返回按钮
    - 覆盖 REQ-6 验收标准 5

- [ ] 11. 检查点 - 检索结果页分组卡片和专利列表正常

- [ ] 12. 改造历史记录页
  - [ ] 12.1 重写 `frontend/src/pages/HistoryPage.tsx`
    - 时间线布局或卡片布局展示历史记录
    - 每条：文件名 + 时间 + 检索式数量 + 关键词标签预览
    - 空状态带图标引导
    - 覆盖 REQ-7 验收标准 1、2、4

  - [ ] 12.2 改造历史详情 Modal
    - Modal 使用深色主题（antd Modal Token 注入）
    - 分区展示：IPC 推测、关键词标签、检索式列表、检索链接列表
    - 覆盖 REQ-7 验收标准 3

- [ ] 13. 检查点 - 历史记录页面和 Modal 在双主题下正常

- [ ] 14. 添加交互动效和微交互
  - 按钮 hover 时 150ms scale(1.02) + shadow 提升
  - 按钮点击时 scale(0.97) 反馈
  - 卡片 hover: scale(1.01) + 边框亮度提升 + shadow-glow
  - 页面内容入场：fade-in + slide-up (10px)，staggered animation
  - 自定义滚动条样式：窄、半透明、深色模式浅色
  - global.css 中 `@media (prefers-reduced-motion: reduce)` 禁用动画
  - 覆盖 REQ-8 全部验收标准

- [ ] 15. 交互动效的视觉回归测试

- [ ] 16. 响应式适配
  - 在 `AppShell` 和 `Sidebar` 中实现 768px 断点逻辑
  - 移动端 Sidebar 自动折叠为 overlay 模式
  - `KeywordTable` 在移动端切换为卡片列表
  - 确保所有交互元素 >= 44x44px 触控目标
  - 覆盖 REQ-9 全部验收标准

- [ ] 17. 响应式断点测试

- [ ] 18. 全局样式打磨
  - 删除 `App.css` 中旧的 `.glass-card` 和 `.tech-gradient-text`
  - 将旧样式替换为设计变量引用
  - 清理所有硬编码颜色值，替换为 CSS 变量或 antd Token
  - 确保 4 个页面在深色和浅色模式下的整体视觉一致性

- [ ] 19. 检查点 - 全局样式统一，无遗留硬编码颜色
