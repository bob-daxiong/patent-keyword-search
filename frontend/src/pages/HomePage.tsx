import { useState } from 'react'
import { Typography, Button, Spin, message, Steps, Card } from 'antd'
import { ThunderboltOutlined, SearchOutlined, FileTextOutlined, TagsOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../store/AppContext'
import { extractKeywords } from '../api'
import UploadPanel from '../components/UploadPanel'
import TextPreview from '../components/TextPreview'
import KeywordTable from '../components/KeywordTable'
import WordCloud from '../components/WordCloud'

const { Title, Text } = Typography

export default function HomePage() {
  const navigate = useNavigate()
  const { state, dispatch } = useAppState()
  const { textContent, keywords } = state
  const [extracting, setExtracting] = useState(false)

  const currentStep = !textContent ? 0 : keywords.length === 0 ? 1 : 2

  const handleExtract = async () => {
    setExtracting(true)
    try {
      const result = await extractKeywords(textContent)
      dispatch({ type: 'SET_KEYWORDS', keywords: result })
      message.success(`成功提取 ${result.length} 个关键词`)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '关键词提取失败'
      message.error(msg)
    } finally {
      setExtracting(false)
    }
  }

  const handleGenerateQueries = () => {
    const selected = state.keywords
      .filter(k => state.selectedKeywordIds.has(k.id))
      .map(k => k.word)
    navigate('/search-query', { state: { selectedKeywords: selected } })
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={2} style={{ fontWeight: 800, letterSpacing: 1, marginBottom: 8 }}>
          <span className="tech-gradient-text">专利交底书智能分析</span>
        </Title>
        <Text style={{ fontSize: 16, color: '#64748b' }}>
          上传交底书，AI 自动提取关键词并生成专业专利检索式
        </Text>
      </div>

      <Card className="glass-card" style={{ marginBottom: 24 }}>
        <Steps
          current={currentStep}
          size="small"
          items={[
            { title: '上传文件', icon: <FileTextOutlined /> },
            { title: '关键词提取', icon: <TagsOutlined /> },
            { title: '检索式生成', icon: <SearchOutlined /> },
          ]}
        />
      </Card>

      <Card className="glass-card" style={{ marginBottom: 24 }}>
        <UploadPanel />
      </Card>

      {textContent && (
        <>
          <Card
            className="glass-card"
            title={<span style={{ fontWeight: 600, color: '#1e293b' }}>交底书原文</span>}
            style={{ marginBottom: 24 }}
          >
            <TextPreview />
          </Card>

          <Card
            className="glass-card"
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>关键词分析</span>
                {keywords.length === 0 && (
                  <Button
                    type="primary"
                    icon={<ThunderboltOutlined />}
                    onClick={handleExtract}
                    loading={extracting}
                    style={{
                      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                      border: 'none',
                      fontWeight: 600,
                    }}
                  >
                    {extracting ? '正在提取...' : '开始提取关键词'}
                  </Button>
                )}
              </div>
            }
            style={{ marginBottom: 24 }}
          >
            {extracting ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Spin size="large" tip="AI 正在分析关键词..." />
              </div>
            ) : keywords.length > 0 ? (
              <KeywordTable />
            ) : (
              <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
                点击上方按钮开始关键词提取
              </div>
            )}
          </Card>

          {keywords.length > 0 && (
            <>
              <Card
                className="glass-card"
                title={<span style={{ fontWeight: 600, color: '#1e293b' }}>词云图</span>}
                style={{ marginBottom: 24 }}
              >
                <WordCloud />
              </Card>

              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  size="large"
                  onClick={handleGenerateQueries}
                  style={{
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    border: 'none',
                    height: 48,
                    fontSize: 16,
                    fontWeight: 600,
                    padding: '0 40px',
                    borderRadius: 12,
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
                  }}
                >
                  生成专利检索式
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
