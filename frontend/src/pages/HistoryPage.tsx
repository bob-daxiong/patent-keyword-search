import { useState, useEffect } from 'react'
import { Typography, Button, List, Tag, Popconfirm, Empty, Space, Card, Modal, Collapse } from 'antd'
import { ArrowLeftOutlined, DeleteOutlined, HistoryOutlined, EyeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { SearchHistoryItem, Keyword, SearchQuery, IPCPrediction, SearchUrlResult } from '../types'

const { Title, Text, Paragraph } = Typography

const STORAGE_KEY = 'patent_search_history'

const dbColors: Record<string, string> = { cnipa: 'red', espacenet: 'blue', google: 'green' }

export default function HistoryPage() {
  const navigate = useNavigate()
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
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 16px' }}>
      <Space style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} style={{ borderRadius: 8 }}>返回首页</Button>
        <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
          <HistoryOutlined style={{ marginRight: 8 }} />
          <span className="tech-gradient-text">检索历史</span>
        </Title>
      </Space>

      {history.length === 0 ? (
        <Card className="glass-card">
          <Empty description="暂无检索历史，完成一次检索后将自动记录" />
        </Card>
      ) : (
        <Card className="glass-card">
          <List
            dataSource={history}
            renderItem={(item) => (
              <List.Item
                style={{ padding: '16px 0' }}
                actions={[
                  <Button
                    key="view"
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => setDetailItem(item)}
                  >
                    查看详情
                  </Button>,
                  <Popconfirm
                    key="delete"
                    title="确定要删除这条历史记录吗?"
                    onConfirm={() => handleDelete(item.id)}
                  >
                    <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
                  </Popconfirm>
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong style={{ fontSize: 15 }}>{item.fileName}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>{formatTime(item.timestamp)}</Text>
                    </Space>
                  }
                  description={
                    <Space wrap size={[4, 6]}>
                      {(item.keywords || []).slice(0, 6).map((kw: Keyword) => (
                        <Tag key={kw.id} color="blue" style={{ borderRadius: 4 }}>{kw.word}</Tag>
                      ))}
                      {(item.keywords || []).length > 6 && <Tag style={{ borderRadius: 4 }}>+{item.keywords.length - 6}</Tag>}
                      {item.searchUrlResults && item.searchUrlResults.length > 0 && (
                        <Tag color="purple" style={{ borderRadius: 4 }}>
                          {item.searchUrlResults.flatMap((r: SearchUrlResult) => r.searchUrls || []).length} 个检索链接
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

      <Modal
        title="检索历史详情"
        open={!!detailItem}
        onCancel={() => setDetailItem(null)}
        footer={null}
        width={800}
      >
        {detailItem && (
          <div>
            <Paragraph>
              <Text strong>文件: </Text>{detailItem.fileName}
              <Text type="secondary" style={{ marginLeft: 16 }}>{formatTime(detailItem.timestamp)}</Text>
            </Paragraph>

            {detailItem.ipcPredictions && detailItem.ipcPredictions.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>IPC 分类号推测:</Text>
                <Space wrap>
                  {detailItem.ipcPredictions.map((ipc: IPCPrediction) => (
                    <Tag key={ipc.code} color="purple">{ipc.code}: {ipc.description} ({(ipc.score * 100).toFixed(0)}%)</Tag>
                  ))}
                </Space>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>关键词 ({(detailItem.keywords || []).length}):</Text>
              <Space wrap>
                {(detailItem.keywords || []).map((kw: Keyword) => (
                  <Tag key={kw.id} color="blue">{kw.word} ({(kw.weight * 100).toFixed(0)}%)</Tag>
                ))}
              </Space>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>检索式 ({(detailItem.searchQueries || []).length}):</Text>
              {(detailItem.searchQueries && detailItem.searchQueries.length > 0) ? (
                <Collapse
                  size="small"
                  items={detailItem.searchQueries.map((q: SearchQuery) => ({
                    key: q.id,
                    label: (
                      <Space>
                        <Tag color="orange">{q.strategy}</Tag>
                        <Text style={{ fontSize: 12 }}>{q.queryText.substring(0, 40)}...</Text>
                      </Space>
                    ),
                    children: (
                      <Paragraph copyable>
                        <code style={{ fontSize: 12 }}>{q.queryText}</code>
                      </Paragraph>
                    ),
                  }))}
                />
              ) : (
                <Text type="secondary" style={{ fontSize: 12 }}>暂无检索式数据</Text>
              )}
            </div>

            {detailItem.searchUrlResults && detailItem.searchUrlResults.length > 0 && (
              <>
                {detailItem.searchUrlResults.some((r: SearchUrlResult) => (r.patentResults || []).length > 0) && (
                  <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>
                      专利结果 ({detailItem.searchUrlResults.reduce((sum: number, r: SearchUrlResult) => sum + (r.patentResults || []).length, 0)} 条):
                    </Text>
                    <List
                      size="small"
                      dataSource={detailItem.searchUrlResults.flatMap((r: SearchUrlResult) =>
                        (r.patentResults || []).map((pr, i) => ({ key: `${r.queryId}-${i}`, ...pr }))
                      )}
                      renderItem={(item: { key: string; title: string; patentNumber: string; url: string }) => (
                        <List.Item>
                          <Space>
                            {item.patentNumber && <Tag color="green">{item.patentNumber}</Tag>}
                            <Text ellipsis style={{ maxWidth: 400 }}>{item.title}</Text>
                            {item.url && <Button type="link" size="small" href={item.url} target="_blank">查看</Button>}
                          </Space>
                        </List.Item>
                      )}
                    />
                  </div>
                )}

                <div>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>检索链接:</Text>
                <List
                  size="small"
                  dataSource={detailItem.searchUrlResults.flatMap((r: SearchUrlResult) =>
                    (r.searchUrls || []).map(su => ({ key: su.database, query: r.queryText || '', ...su }))
                  )}
                  renderItem={(item: { key: string; query: string; database: string; label: string; url: string }) => (
                    <List.Item>
                      <Space>
                        <Tag color={dbColors[item.database]}>{item.label}</Tag>
                        <Text code style={{ fontSize: 11 }} ellipsis>{item.query}</Text>
                        <Button type="link" size="small" href={item.url} target="_blank">打开</Button>
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
    </div>
  )
}
