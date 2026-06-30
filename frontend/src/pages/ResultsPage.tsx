import { useMemo, useState } from 'react'
import { Typography, Button, Space, List, Tag, Card, Empty } from 'antd'
import { ExportOutlined, FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../store/AppContext'
import PageContainer from '../components/PageContainer'
import type { PatentResult } from '../types'

const { Text } = Typography

const dbColors: Record<string, string> = { cnipa: 'red', espacenet: 'blue', google: 'green' }
const dbLabels: Record<string, string> = {
  cnipa: '中国专利公布公告',
  espacenet: 'Espacenet',
  google: 'Google Patents',
}
const dbOrder: Record<string, number> = { cnipa: 0, espacenet: 1, google: 2 }

export default function ResultsPage() {
  const navigate = useNavigate()
  const { state } = useAppState()
  const { searchUrlResults, searchQueries } = state
  const [openedUrls, setOpenedUrls] = useState<Set<string>>(new Set())

  const priorityMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const q of searchQueries) map.set(q.id, q.priority || 99)
    return map
  }, [searchQueries])

  const groupedByDb = useMemo(() => {
    const items = searchUrlResults
      .flatMap(r =>
        r.searchUrls.map(su => ({
          key: `${r.queryId}-${su.database}`,
          query: r.queryText,
          priority: priorityMap.get(r.queryId) || 99,
          dbSort: dbOrder[su.database] ?? 99,
          ...su,
        }))
      )
      .sort((a, b) => a.dbSort - b.dbSort || a.priority - b.priority)

    const groups: Record<string, typeof items> = {}
    for (const item of items) {
      if (!groups[item.database]) groups[item.database] = []
      groups[item.database].push(item)
    }
    return groups
  }, [searchUrlResults, priorityMap])

  const allPatentResults: (PatentResult & { queryText: string; source: string })[] = searchUrlResults.flatMap(r =>
    (r.patentResults || []).map(pr => ({ ...pr, queryText: r.queryText, source: 'google' }))
  )

  const handleOpen = (key: string, url: string) => {
    setOpenedUrls(prev => new Set(prev).add(key))
    window.open(url, '_blank')
  }

  return (
    <PageContainer
      title="检索结果"
      subtitle={`${searchUrlResults.length} 个检索式，${Object.values(groupedByDb).flat().length} 个检索链接`}
      backTo="/search-query"
      backLabel="返回检索式"
    >
      {/* Search Links by Database */}
      {Object.entries(groupedByDb).length > 0 ? (
        Object.entries(groupedByDb).sort(([a], [b]) => (dbOrder[a] ?? 99) - (dbOrder[b] ?? 99)).map(([db, items]) => (
          <Card
            key={db}
            title={
              <Space>
                <Tag color={dbColors[db]} style={{ fontWeight: 600 }}>
                  {dbLabels[db] || db}
                </Tag>
                <Text style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                  ({items.length} 条)
                </Text>
              </Space>
            }
            style={{
              marginBottom: 24,
              background: 'var(--bg-card)',
              borderColor: 'var(--border-default)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <List
              size="small"
              dataSource={items}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    openedUrls.has(item.key) ? (
                      <Button
                        key="opened"
                        icon={<CheckCircleOutlined />}
                        size="small"
                        style={{ color: '#10b981', borderColor: '#10b981' }}
                      >
                        已打开
                      </Button>
                    ) : (
                      <Button
                        key="open"
                        type="primary"
                        ghost
                        size="small"
                        icon={<ExportOutlined />}
                        onClick={() => handleOpen(item.key, item.url)}
                      >
                        打开检索
                      </Button>
                    ),
                  ]}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: item.priority === 1
                        ? '#22d3ee'
                        : item.priority === 2
                          ? '#67e8f9'
                          : 'var(--text-tertiary)',
                      flexShrink: 0,
                    }} />
                    <Text
                      code
                      ellipsis
                      style={{
                        fontSize: 12,
                        fontFamily: 'monospace',
                        flex: 1,
                        background: 'var(--bg-input)',
                        padding: '4px 8px',
                        borderRadius: 4,
                      }}
                    >
                      {item.query}
                    </Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        ))
      ) : (
        <Card style={{
          background: 'var(--bg-card)',
          borderColor: 'var(--border-default)',
          boxShadow: 'var(--shadow-card)',
        }}>
          <Empty
            description={
              <span style={{ color: 'var(--text-secondary)' }}>
                暂无检索链接，请先
                <Button type="link" onClick={() => navigate('/search-query')} style={{ padding: '0 4px' }}>
                  生成检索式
                </Button>
                并执行检索
              </span>
            }
          />
        </Card>
      )}

      {/* Patent Results */}
      {allPatentResults.length > 0 && (
        <Card
          title={
            <Space>
              <FileTextOutlined style={{ color: 'var(--accent-primary)' }} />
              <span style={{ color: 'var(--text-primary)' }}>
                Google Patents 检索结果 ({allPatentResults.length} 条)
              </span>
            </Space>
          }
          style={{
            marginBottom: 24,
            background: 'var(--bg-card)',
            borderColor: 'var(--border-default)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <List
            dataSource={allPatentResults}
            renderItem={(item) => (
              <List.Item
                style={{ padding: '16px 0' }}
                actions={[
                  item.url ? (
                    <Button
                      key="open"
                      type="primary"
                      ghost
                      size="small"
                      icon={<ExportOutlined />}
                      onClick={() => window.open(item.url, '_blank')}
                    >
                      查看详情
                    </Button>
                  ) : null,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      {item.patentNumber && (
                        <Tag color="cyan" style={{ fontFamily: 'monospace', fontSize: 12 }}>
                          {item.patentNumber}
                        </Tag>
                      )}
                      <Text strong style={{ color: 'var(--text-primary)', fontSize: 14 }}>
                        {item.title}
                      </Text>
                    </Space>
                  }
                  description={
                    <Space size={[12, 4]} wrap>
                      {item.assignee && (
                        <Text style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                          申请人: {item.assignee}
                        </Text>
                      )}
                      {item.filingDate && (
                        <Text style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>
                          申请日: {item.filingDate}
                        </Text>
                      )}
                      <Text style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>
                        来源: {item.source}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}
    </PageContainer>
  )
}
