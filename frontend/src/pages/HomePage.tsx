import { useState } from 'react'
import { Typography, Button, message, Steps, Card } from 'antd'
import {
  ThunderboltOutlined,
  SearchOutlined,
  FileTextOutlined,
  TagsOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../store/AppContext'
import { extractKeywords } from '../api'
import PageContainer from '../components/PageContainer'
import UploadPanel from '../components/UploadPanel'
import TextPreview from '../components/TextPreview'
import KeywordTable from '../components/KeywordTable'
import WordCloud from '../components/WordCloud'
import { SkeletonTable } from '../components/Skeleton'

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
    <PageContainer>
      {/* Hero */}
      <div style={{
        textAlign: 'center',
        marginBottom: 40,
        padding: '48px 24px 36px',
        background: 'linear-gradient(180deg, var(--bg-elevated) 0%, transparent 100%)',
        borderRadius: 16,
        border: '1px solid var(--border-default)',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '6px 16px',
          background: 'var(--accent-bg)',
          borderRadius: 20,
          marginBottom: 20,
          border: '1px solid var(--border-accent)',
        }}>
          <ThunderboltOutlined style={{ color: 'var(--accent-primary)', fontSize: 14 }} />
          <Text style={{
            color: 'var(--text-accent)',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 0.5,
          }}>
            AI 驱动专利分析
          </Text>
        </div>
        <Title level={2} style={{
          fontWeight: 800,
          letterSpacing: 1,
          marginBottom: 10,
          fontSize: 28,
          color: 'var(--text-primary)',
        }}>
          <span className="accent-gradient-text">专利交底书智能分析</span>
        </Title>
        <Text style={{
          fontSize: 15,
          color: 'var(--text-secondary)',
          display: 'block',
          maxWidth: 500,
          margin: '0 auto',
        }}>
          上传交底书，自动提取关键词并生成专业专利检索式
        </Text>
      </div>

      {/* Steps */}
      <Card style={{
        marginBottom: 24,
        background: 'var(--bg-card)',
        borderColor: 'var(--border-default)',
        boxShadow: 'var(--shadow-card)',
      }}>
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

      {/* Upload */}
      <Card
        style={{
          marginBottom: 24,
          background: 'var(--bg-card)',
          borderColor: 'var(--border-default)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <UploadPanel />
      </Card>

      {textContent && (
        <>
          {/* Text Preview */}
          <Card
            title={
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileTextOutlined style={{ color: 'var(--accent-primary)' }} />
                交底书原文
              </span>
            }
            style={{
              marginBottom: 24,
              background: 'var(--bg-card)',
              borderColor: 'var(--border-default)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <TextPreview />
          </Card>

          {/* Keywords */}
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TagsOutlined style={{ color: 'var(--accent-primary)' }} />
                  关键词分析
                </span>
                {keywords.length === 0 && !extracting && (
                  <Button
                    type="primary"
                    icon={<ThunderboltOutlined />}
                    onClick={handleExtract}
                    style={{ fontWeight: 600 }}
                  >
                    开始提取关键词
                  </Button>
                )}
              </div>
            }
            style={{
              marginBottom: 24,
              background: 'var(--bg-card)',
              borderColor: 'var(--border-default)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            {extracting ? (
              <SkeletonTable rows={6} />
            ) : keywords.length > 0 ? (
              <KeywordTable />
            ) : (
              <div style={{
                textAlign: 'center',
                padding: 40,
                color: 'var(--text-tertiary)',
              }}>
                点击上方按钮开始关键词提取
              </div>
            )}
          </Card>

          {keywords.length > 0 && (
            <>
              {/* Word Cloud */}
              <Card
                title={
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    词云图
                  </span>
                }
                style={{
                  marginBottom: 24,
                  background: 'var(--bg-card)',
                  borderColor: 'var(--border-default)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <WordCloud />
              </Card>

              {/* CTA */}
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  size="large"
                  onClick={handleGenerateQueries}
                  style={{
                    height: 48,
                    fontSize: 16,
                    fontWeight: 600,
                    padding: '0 40px',
                    borderRadius: 12,
                    boxShadow: '0 4px 20px rgba(6,182,212,0.3)',
                  }}
                >
                  生成专利检索式
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </PageContainer>
  )
}
