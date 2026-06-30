import { useMemo, useState } from 'react'
import { Input, Tag, Space, Typography, Empty, Select, Button } from 'antd'
import {
  DatabaseOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  StarOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { useAppState } from '../store/AppContext'
import type { SearchQuery } from '../types'

const { Text, Paragraph } = Typography

const dbColors: Record<string, string> = { cnipa: 'red', espacenet: 'blue', google: 'green' }
const dbLabels: Record<string, string> = { cnipa: '中国专利', espacenet: '欧洲专利', google: 'Google Patents' }

const strategyLabels: Record<string, string> = {
  ipc_first: 'IPC 优先',
  synonym: '同义词扩展',
  core_and: '核心词 AND',
  or_combination: 'OR 组合',
  broad: '宽泛检索',
}

const priorityConfig: Record<number, { icon: React.ReactNode; label: string }> = {
  1: { icon: <ThunderboltOutlined style={{ color: '#22d3ee' }} />, label: '高优先' },
  2: { icon: <StarOutlined style={{ color: '#22d3ee' }} />, label: '扩展' },
}

interface SearchQueryEditorProps {
  onSearchQuery?: (query: SearchQuery) => void
}

export default function SearchQueryEditor({ onSearchQuery }: SearchQueryEditorProps) {
  const { state, dispatch } = useAppState()
  const { searchQueries, editedQueries, ipcPredictions } = state
  const [strategyFilter, setStrategyFilter] = useState<string>('all')

  if (searchQueries.length === 0 && ipcPredictions.length === 0) return null

  const sortedQueries = [...searchQueries].sort((a, b) => (a.priority || 99) - (b.priority || 99))

  const strategies = useMemo(
    () => [...new Set(searchQueries.map(q => q.strategy))],
    [searchQueries]
  )

  const filteredQueries = useMemo(() => {
    if (strategyFilter === 'all') return sortedQueries
    return sortedQueries.filter(q => q.strategy === strategyFilter)
  }, [sortedQueries, strategyFilter])

  const groupedQueries = useMemo(() => {
    const groups: Record<string, SearchQuery[]> = {}
    for (const q of filteredQueries) {
      const strategy = q.strategy
      if (!groups[strategy]) groups[strategy] = []
      groups[strategy].push(q)
    }
    return groups
  }, [filteredQueries])

  const handleEdit = (id: string, text: string) => {
    dispatch({ type: 'EDIT_QUERY', queryId: id, text })
  }

  const getQueryText = (q: SearchQuery) => editedQueries.get(q.id) ?? q.queryText

  return (
    <div>
      {/* IPC Predictions Cloud */}
      {ipcPredictions.length > 0 && (
        <div style={{
          marginBottom: 24,
          padding: '16px 20px',
          background: 'var(--accent-bg)',
          borderRadius: 12,
          border: '1px solid var(--border-accent)',
        }}>
          <Space align="center" style={{ marginBottom: 10 }}>
            <SafetyCertificateOutlined style={{ color: 'var(--accent-primary)' }} />
            <Text strong style={{ color: 'var(--text-accent)' }}>推测的 IPC 分类号</Text>
          </Space>
          <Space wrap size={[4, 8]}>
            {ipcPredictions.map((ipc) => (
              <Tag
                key={ipc.code}
                color="purple"
                style={{ borderRadius: 6, padding: '2px 10px' }}
              >
                {ipc.code}: {ipc.description} ({(ipc.score * 100).toFixed(0)}%)
              </Tag>
            ))}
          </Space>
        </div>
      )}

      {searchQueries.length === 0 ? (
        <Empty
          description={<span style={{ color: 'var(--text-tertiary)' }}>暂无检索式</span>}
        />
      ) : (
        <>
          {/* Filter - show when > 10 queries */}
          {searchQueries.length > 10 && (
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 13, color: 'var(--text-secondary)', flexShrink: 0 }}>
                筛选策略:
              </Text>
              <Select
                size="small"
                value={strategyFilter}
                onChange={setStrategyFilter}
                style={{ width: 160 }}
                options={[
                  { value: 'all', label: `全部 (${searchQueries.length})` },
                  ...strategies.map(s => ({
                    value: s,
                    label: `${strategyLabels[s] || s} (${searchQueries.filter(q => q.strategy === s).length})`,
                  })),
                ]}
              />
            </div>
          )}

          {/* Grouped Query Cards */}
          {Object.entries(groupedQueries).map(([strategy, queries]) => (
            <div key={strategy} style={{ marginBottom: 24 }}>
              <div style={{
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <div style={{
                  width: 4,
                  height: 18,
                  borderRadius: 2,
                  background: 'var(--accent-primary)',
                }} />
                <Text strong style={{ color: 'var(--text-primary)', fontSize: 15 }}>
                  {strategyLabels[strategy] || strategy}
                </Text>
                <Tag style={{
                  borderRadius: 20,
                  background: 'var(--accent-bg)',
                  color: 'var(--text-accent)',
                  border: 'none',
                  fontSize: 11,
                }}>
                  {queries.length} 条
                </Tag>
              </div>

              {queries.map((q) => {
                const prio = priorityConfig[q.priority || 3]

                return (
                  <div
                    key={q.id}
                    style={{
                      marginBottom: 12,
                      padding: '16px 20px',
                      background: 'var(--bg-card)',
                      borderRadius: 10,
                      border: q.priority === 1
                        ? '1px solid rgba(34,211,238,0.25)'
                        : '1px solid var(--border-default)',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      boxShadow: q.priority === 1 ? '0 0 12px rgba(6,182,212,0.08)' : 'none',
                    }}
                  >
                    {/* Header row */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 10,
                      flexWrap: 'wrap',
                    }}>
                      {prio && (
                        <Tag style={{
                          borderRadius: 6,
                          fontWeight: 600,
                          padding: '2px 12px',
                          background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                          border: 'none',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}>
                          {prio.icon}
                          [{prio.label}] {strategyLabels[q.strategy] || q.strategy}
                        </Tag>
                      )}
                      {!prio && (
                        <Tag style={{
                          borderRadius: 6,
                          fontWeight: 500,
                          padding: '2px 12px',
                          background: 'var(--bg-hover)',
                          border: '1px solid var(--border-default)',
                          color: 'var(--text-secondary)',
                        }}>
                          {strategyLabels[q.strategy] || q.strategy}
                        </Tag>
                      )}
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

                    {/* Query text */}
                    <Paragraph
                      copyable={{ text: getQueryText(q) }}
                      style={{
                        marginBottom: 8,
                        padding: '10px 14px',
                        background: 'var(--bg-input)',
                        borderRadius: 8,
                        border: '1px solid var(--border-default)',
                      }}
                    >
                      <code style={{
                        fontSize: 13,
                        color: 'var(--text-primary)',
                        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                      }}>
                        {getQueryText(q)}
                      </code>
                    </Paragraph>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {q.editable && (
                        <Input.TextArea
                          rows={2}
                          value={getQueryText(q)}
                          onChange={(e) => handleEdit(q.id, e.target.value)}
                          placeholder="编辑检索式..."
                          style={{ flex: 1, fontSize: 13, fontFamily: 'monospace', borderRadius: 8 }}
                        />
                      )}
                      {onSearchQuery && (
                        <Button
                          size="small"
                          type="primary"
                          icon={<SearchOutlined />}
                          ghost
                          onClick={() => onSearchQuery(q)}
                          style={{ flexShrink: 0 }}
                        >
                          单独搜索
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </>
      )}
    </div>
  )
}
