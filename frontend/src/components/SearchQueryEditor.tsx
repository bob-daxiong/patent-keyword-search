import { Input, Tag, Space, Typography, Empty } from 'antd'
import { DatabaseOutlined, SafetyCertificateOutlined, ThunderboltOutlined, StarOutlined } from '@ant-design/icons'
import { useAppState } from '../store/AppContext'
import type { SearchQuery } from '../types'

const { Text, Paragraph } = Typography

const dbColors: Record<string, string> = { cnipa: 'red', espacenet: 'blue', google: 'green' }
const dbLabels: Record<string, string> = { cnipa: '中国专利', espacenet: '欧洲专利', google: 'Google Patents' }

const priorityConfig: Record<number, { borderColor: string; bg: string; icon: React.ReactNode; label: string; tagColor: string; tagBg: string }> = {
  1: {
    borderColor: '#34d399',
    bg: 'linear-gradient(135deg, rgba(16,185,129,0.04), rgba(5,150,105,0.04))',
    icon: <ThunderboltOutlined style={{ color: '#10b981' }} />,
    label: '高优先',
    tagColor: '#fff',
    tagBg: 'linear-gradient(135deg, #10b981, #059669)',
  },
  2: {
    borderColor: '#60a5fa',
    bg: 'linear-gradient(135deg, rgba(59,130,246,0.04), rgba(37,99,235,0.04))',
    icon: <StarOutlined style={{ color: '#3b82f6' }} />,
    label: '扩展',
    tagColor: '#fff',
    tagBg: 'linear-gradient(135deg, #3b82f6, #2563eb)',
  },
}

export default function SearchQueryEditor() {
  const { state, dispatch } = useAppState()
  const { searchQueries, editedQueries, ipcPredictions } = state

  if (searchQueries.length === 0 && ipcPredictions.length === 0) return null

  const sortedQueries = [...searchQueries].sort((a, b) => (a.priority || 99) - (b.priority || 99))

  const handleEdit = (id: string, text: string) => {
    dispatch({ type: 'EDIT_QUERY', queryId: id, text })
  }

  const getQueryText = (q: SearchQuery) => editedQueries.get(q.id) ?? q.queryText

  return (
    <div>
      {ipcPredictions.length > 0 && (
        <div style={{
          marginBottom: 20,
          padding: '16px 20px',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.04), rgba(99,102,241,0.04))',
          borderRadius: 12,
          border: '1px solid rgba(124,58,237,0.12)',
        }}>
          <Space align="center" style={{ marginBottom: 8 }}>
            <SafetyCertificateOutlined style={{ color: '#7c3aed' }} />
            <Text strong style={{ color: '#5b21b6' }}>推测的 IPC 分类号</Text>
          </Space>
          <Space wrap>
            {ipcPredictions.map((ipc) => (
              <Tag key={ipc.code} color="purple" style={{ borderRadius: 6, padding: '2px 10px' }}>
                {ipc.code}: {ipc.description} ({(ipc.score * 100).toFixed(0)}%)
              </Tag>
            ))}
          </Space>
        </div>
      )}

      {searchQueries.length === 0 ? (
        <Empty description="暂无检索式" />
      ) : (
        sortedQueries.map((q) => {
          const prio = priorityConfig[q.priority || 3] || {}
          return (
            <div
              key={q.id}
              style={{
                marginBottom: 16,
                padding: '20px 24px',
                background: prio.bg || '#fff',
                borderRadius: 12,
                border: `1px solid ${prio.borderColor || '#e2e8f0'}`,
                transition: 'border-color 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                {prio.icon && <span>{prio.icon}</span>}
                <Tag
                  style={{
                    borderRadius: 6,
                    fontWeight: 600,
                    padding: '2px 12px',
                    background: prio.tagBg || 'linear-gradient(135deg, #f97316, #ea580c)',
                    border: 'none',
                    color: prio.tagColor || '#fff',
                  }}
                >
                  {prio.label && <span style={{ marginRight: 4, fontSize: 10 }}>[{prio.label}]</span>}
                  {q.strategy}
                </Tag>
                {q.targetDbs.map((db) => (
                  <Tag
                    key={db}
                    icon={<DatabaseOutlined />}
                    color={dbColors[db]}
                    style={{ borderRadius: 6 }}
                  >
                    {dbLabels[db] || db}
                  </Tag>
                ))}
                {q.ipcCodes.length > 0 && (
                  <Text type="secondary" style={{ fontSize: 11 }}>IPC: {q.ipcCodes.join(', ')}</Text>
                )}
              </div>
            <Paragraph
              copyable={{ text: getQueryText(q) }}
              style={{
                marginBottom: 12,
                padding: '12px 16px',
                background: '#f8fafc',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
              }}
            >
              <code style={{ fontSize: 13, color: '#1e293b' }}>{getQueryText(q)}</code>
            </Paragraph>
            {q.editable && (
              <Input.TextArea
                rows={2}
                value={getQueryText(q)}
                onChange={(e) => handleEdit(q.id, e.target.value)}
                placeholder="编辑检索式..."
                style={{ fontSize: 13, fontFamily: 'monospace', borderRadius: 8 }}
              />
            )}
          </div>
          )}
        ))}
    </div>
  )
}
