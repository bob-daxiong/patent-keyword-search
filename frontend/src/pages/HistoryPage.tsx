import { useState, useEffect } from 'react'
import { Typography, Button, List, Tag, Popconfirm, Empty, Space, Card, Modal, Collapse } from 'antd'
import { DeleteOutlined, EyeOutlined, HistoryOutlined } from '@ant-design/icons'
import PageContainer from '../components/PageContainer'
import type { SearchHistoryItem, Keyword, SearchQuery, IPCPrediction, SearchUrlResult } from '../types'
import { DB_COLORS } from '../constants/databases'

const { Text, Paragraph } = Typography

const STORAGE_KEY = 'patent_search_history'

export default function HistoryPage() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([])
  const [detailItem, setDetailItem] = useState<SearchHistoryItem | null>(null)

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      setHistory(data)
    } catch {
      setHistory([])
    }
  }, [])

  const handleDelete = (id: string) => {
    const next = history.filter(h => h.id !== id)
    setHistory(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const formatTime = (ts: number) => new Date(ts).toLocaleString('zh-CN')

  return (
    <PageContainer title="检索历史" backTo="/" backLabel="返回首页">
      {history.length === 0 ? (
        <Card style={{
          background: 'var(--bg-card)',
          borderColor: 'var(--border-default)',
          boxShadow: 'var(--shadow-card)',
        }}>
          <Empty
            image={<HistoryOutlined style={{ fontSize: 48, color: 'var(--text-tertiary)' }} />}
            description={
              <span style={{ color: 'var(--text-secondary)' }}>
                暂无检索历史，完成一次检索后将自动记录
              </span>
            }
          />
        </Card>
      ) : (
        <Card style={{
          background: 'var(--bg-card)',
          borderColor: 'var(--border-default)',
          boxShadow: 'var(--shadow-card)',
        }}>
          <List
            dataSource={history}
            renderItem={(item, index) => (
              <List.Item
                style={{
                  padding: '16px 20px',
                  borderRadius: 10,
                  marginBottom: index < history.length - 1 ? 8 : 0,
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-card)',
                }}
                actions={[
                  <Button
                    key="view"
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => setDetailItem(item)}
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    查看详情
                  </Button>,
                  <Popconfirm
                    key="delete"
                    title="确定要删除这条历史记录吗?"
                    onConfirm={() => handleDelete(item.id)}
                    okButtonProps={{ danger: true }}
                  >
                    <Button type="text" danger icon={<DeleteOutlined />}>删除</Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong style={{ color: 'var(--text-primary)', fontSize: 15 }}>
                        {item.fileName}
                      </Text>
                      <Text style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>
                        {formatTime(item.timestamp)}
                      </Text>
                    </Space>
                  }
                  description={
                    <Space wrap size={[4, 6]} style={{ marginTop: 4 }}>
                      {(item.keywords || []).slice(0, 6).map((kw: Keyword) => (
                        <Tag key={kw.id} color="cyan" style={{ borderRadius: 4 }}>
                          {kw.word}
                        </Tag>
                      ))}
                      {(item.keywords || []).length > 6 && (
                        <Tag style={{ borderRadius: 4, background: 'var(--bg-hover)', border: '1px solid var(--border-default)' }}>
                          +{item.keywords.length - 6}
                        </Tag>
                      )}
                      {item.searchUrlResults && item.searchUrlResults.length > 0 && (
                        <Tag color="purple" style={{ borderRadius: 4 }}>
                          {item.searchUrlResults.flatMap((r: SearchUrlResult) => r.searchUrls || []).length} 个检索链接
                        </Tag>
                      )}
                      {item.searchQueries && (
                        <Tag color="blue" style={{ borderRadius: 4 }}>
                          {item.searchQueries.length} 条检索式
                        </Tag>
                      )}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* Detail Modal */}
      <Modal
        title={
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            检索历史详情
          </span>
        }
        open={!!detailItem}
        onCancel={() => setDetailItem(null)}
        footer={null}
        width={800}
      >
        {detailItem && (
          <div>
            <Paragraph>
              <Text strong style={{ color: 'var(--text-primary)' }}>文件: </Text>
              <span style={{ color: 'var(--text-secondary)' }}>{detailItem.fileName}</span>
              <Text style={{ marginLeft: 16, color: 'var(--text-tertiary)', fontSize: 12 }}>
                {formatTime(detailItem.timestamp)}
              </Text>
            </Paragraph>

            {/* IPC Predictions */}
            {detailItem.ipcPredictions && detailItem.ipcPredictions.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ display: 'block', marginBottom: 8, color: 'var(--text-primary)' }}>
                  IPC 分类号推测:
                </Text>
                <Space wrap>
                  {detailItem.ipcPredictions.map((ipc: IPCPrediction) => (
                    <Tag key={ipc.code} color="purple">
                      {ipc.code}: {ipc.description} ({(ipc.score * 100).toFixed(0)}%)
                    </Tag>
                  ))}
                </Space>
              </div>
            )}

            {/* Keywords */}
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: 'block', marginBottom: 8, color: 'var(--text-primary)' }}>
                关键词 ({(detailItem.keywords || []).length}):
              </Text>
              <Space wrap>
                {(detailItem.keywords || []).map((kw: Keyword) => (
                  <Tag key={kw.id} color="cyan">{kw.word} ({(kw.weight * 100).toFixed(0)}%)</Tag>
                ))}
              </Space>
            </div>

            {/* Search Queries */}
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: 'block', marginBottom: 8, color: 'var(--text-primary)' }}>
                检索式 ({(detailItem.searchQueries || []).length}):
              </Text>
              {(detailItem.searchQueries && detailItem.searchQueries.length > 0) ? (
                <Collapse
                  size="small"
                  items={detailItem.searchQueries.map((q: SearchQuery) => ({
                    key: q.id,
                    label: (
                      <Space>
                        <Tag color="orange">{q.strategy}</Tag>
                        <Text style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          {q.queryText.substring(0, 40)}...
                        </Text>
                      </Space>
                    ),
                    children: (
                      <Paragraph copyable={{ text: q.queryText }}>
                        <code style={{
                          fontSize: 14,
                          color: 'var(--text-primary)',
                          background: 'var(--bg-input)',
                          padding: '4px 8px',
                          borderRadius: 4,
                        }}>
                          {q.queryText}
                        </code>
                      </Paragraph>
                    ),
                  }))}
                />
              ) : (
                <Text style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>暂无检索式数据</Text>
              )}
            </div>

            {/* Search URL Results */}
            {detailItem.searchUrlResults && detailItem.searchUrlResults.length > 0 && (
              <>
                {/* Patent Results */}
                {detailItem.searchUrlResults.some((r: SearchUrlResult) => (r.patentResults || []).length > 0) && (
                  <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ display: 'block', marginBottom: 8, color: 'var(--text-primary)' }}>
                      专利结果 ({detailItem.searchUrlResults.reduce(
                        (sum: number, r: SearchUrlResult) => sum + (r.patentResults || []).length, 0
                      )} 条):
                    </Text>
                    <List
                      size="small"
                      dataSource={detailItem.searchUrlResults.flatMap((r: SearchUrlResult) =>
                        (r.patentResults || []).map((pr, i) => ({ key: `${r.queryId}-${i}`, ...pr }))
                      )}
                      renderItem={(prItem) => (
                        <List.Item>
                          <Space>
                            {prItem.patentNumber && <Tag color="cyan">{prItem.patentNumber}</Tag>}
                            <Text ellipsis style={{ maxWidth: 400, color: 'var(--text-secondary)', fontSize: 13 }}>
                              {prItem.title}
                            </Text>
                            {prItem.url && (
                              <Button type="link" size="small" href={prItem.url} target="_blank">
                                查看
                              </Button>
                            )}
                          </Space>
                        </List.Item>
                      )}
                    />
                  </div>
                )}

                {/* Search Links */}
                <div>
                  <Text strong style={{ display: 'block', marginBottom: 8, color: 'var(--text-primary)' }}>
                    检索链接:
                  </Text>
                  <List
                    size="small"
                    dataSource={detailItem.searchUrlResults.flatMap((r: SearchUrlResult) =>
                      (r.searchUrls || []).map(su => ({
                        key: su.database,
                        query: r.queryText || '',
                        ...su,
                      }))
                    )}
                    renderItem={(linkItem) => (
                      <List.Item>
                        <Space>
                          <Tag color={DB_COLORS[linkItem.database]}>{linkItem.label}</Tag>
                          <Text
                            code
                            ellipsis
                            style={{ fontSize: 11, maxWidth: 300, color: 'var(--text-secondary)' }}
                          >
                            {linkItem.query}
                          </Text>
                          <Button type="link" size="small" href={linkItem.url} target="_blank">
                            打开
                          </Button>
                        </Space>
                      </List.Item>
                    )}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </PageContainer>
  )
}
