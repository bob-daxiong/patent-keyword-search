import { useMemo } from 'react'
import { Typography, Button, Space, List, Tag, Card, Empty } from 'antd'
import { ArrowLeftOutlined, ExportOutlined, FileTextOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../store/AppContext'
import type { PatentResult } from '../types'

const { Title, Text, Paragraph } = Typography

const dbColors: Record<string, string> = { cnipa: 'red', espacenet: 'blue', google: 'green' }
const dbOrder: Record<string, number> = { cnipa: 0, espacenet: 1, google: 2 }

export default function ResultsPage() {
  const navigate = useNavigate()
  const { state } = useAppState()
  const { searchUrlResults, searchQueries } = state

  const priorityMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const q of searchQueries) {
      map.set(q.id, q.priority || 99)
    }
    return map
  }, [searchQueries])

  const flatUrls = useMemo(() =>
    searchUrlResults
      .flatMap(r =>
        r.searchUrls.map(su => ({
          key: `${r.queryId}-${su.database}`,
          query: r.queryText,
          priority: priorityMap.get(r.queryId) || 99,
          dbSort: dbOrder[su.database] ?? 99,
          ...su,
        }))
      )
      .sort((a, b) => a.dbSort - b.dbSort || a.priority - b.priority),
    [searchUrlResults, priorityMap]
  )

  const allPatentResults: (PatentResult & { queryText: string; source: string })[] = searchUrlResults.flatMap(r =>
    (r.patentResults || []).map(pr => ({
      ...pr,
      queryText: r.queryText,
      source: 'google',
    }))
  )

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 16px' }}>
      <Space style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/search-query')} style={{ borderRadius: 8 }}>
          返回检索式
        </Button>
        <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
          <span className="tech-gradient-text">检索结果</span>
        </Title>
      </Space>

      {allPatentResults.length > 0 && (
        <Card
          className="glass-card"
          title={
            <Space>
              <FileTextOutlined style={{ color: '#6366f1' }} />
              <span>Google Patents 检索结果 ({allPatentResults.length} 条)</span>
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <List
            dataSource={allPatentResults}
            renderItem={(item, idx) => (
              <List.Item
                style={{ padding: '16px 0' }}
                actions={[
                  item.url ? (
                    <Button
                      key="open"
                      type="primary"
                      icon={<ExportOutlined />}
                      href={item.url}
                      target="_blank"
                      size="small"
                      style={{
                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                        border: 'none',
                        borderRadius: 8,
                      }}
                    >
                      查看原文
                    </Button>
                  ) : null,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Tag color="blue" style={{ borderRadius: 6 }}>#{idx + 1}</Tag>
                      <Text strong style={{ fontSize: 15 }}>{item.title}</Text>
                    </Space>
                  }
                  description={
                    <div>
                      {item.patentNumber && (
                        <Tag color="green" style={{ borderRadius: 4, marginBottom: 6 }}>
                          {item.patentNumber}
                        </Tag>
                      )}
                      {item.applicant && (
                        <Tag style={{ borderRadius: 4, marginBottom: 6 }}>{item.applicant}</Tag>
                      )}
                      {item.filingDate && (
                        <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                          {item.filingDate}
                        </Text>
                      )}
                      {item.abstract && (
                        <Paragraph
                          ellipsis={{ rows: 2 }}
                          style={{ marginTop: 6, color: '#475569', fontSize: 13 }}
                        >
                          {item.abstract}
                        </Paragraph>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {flatUrls.length > 0 && (
        <Card className="glass-card" title="直接检索链接">
          <List
            size="small"
            dataSource={flatUrls}
            renderItem={(item: { key: string; query: string; database: string; label: string; url: string }) => (
              <List.Item
                actions={[
                  <Button
                    key="open"
                    type="primary"
                    ghost
                    size="small"
                    icon={<ExportOutlined />}
                    href={item.url}
                    target="_blank"
                  >
                    打开检索
                  </Button>,
                ]}
              >
                <Space>
                  <Tag color={dbColors[item.database]} style={{ borderRadius: 6, fontWeight: 600 }}>
                    {item.label}
                  </Tag>
                  <Text code style={{ fontSize: 12, color: '#475569' }}>{item.query}</Text>
                </Space>
              </List.Item>
            )}
          />
        </Card>
      )}

      {allPatentResults.length === 0 && flatUrls.length === 0 && (
        <Card className="glass-card">
          <Empty description="暂无检索结果，请返回检索式页面执行检索" />
        </Card>
      )}
    </div>
  )
}
