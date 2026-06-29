import { Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useAppState } from '../store/AppContext'
import type { Keyword } from '../types'

export default function KeywordTable() {
  const { state, dispatch } = useAppState()
  const { keywords, selectedKeywordIds } = state

  if (keywords.length === 0) return null

  const columns: ColumnsType<Keyword> = [
    {
      title: '',
      dataIndex: 'id',
      width: 48,
      align: 'center',
      render: (id: string) => (
        <input
          type="checkbox"
          checked={selectedKeywordIds.has(id)}
          onChange={() => dispatch({ type: 'TOGGLE_KEYWORD', keywordId: id })}
          style={{
            width: 16, height: 16, cursor: 'pointer',
            accentColor: '#6366f1',
          }}
        />
      ),
    },
    {
      title: '关键词',
      dataIndex: 'word',
      render: (word: string, record: Keyword) => (
        <Tag style={{
          borderRadius: 6,
          border: 'none',
          background: `rgba(99,102,241,${0.08 + record.weight * 0.25})`,
          color: '#4338ca',
          fontWeight: 500,
          fontSize: `${13 + record.weight * 4}px`,
          padding: '2px 10px',
        }}>
          {word}
        </Tag>
      ),
    },
    {
      title: '频次',
      dataIndex: 'count',
      width: 80,
      align: 'center',
      sorter: (a, b) => a.count - b.count,
      render: (count: number) => (
        <span style={{ color: '#64748b', fontWeight: 500 }}>{count}</span>
      ),
    },
    {
      title: '权重',
      dataIndex: 'weight',
      width: 200,
      sorter: (a, b) => a.weight - b.weight,
      render: (w: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            flex: 1,
            height: 8,
            background: '#f1f5f9',
            borderRadius: 4,
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${(w * 100).toFixed(0)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #818cf8, #6366f1, #4f46e5)',
              borderRadius: 4,
              transition: 'width 0.4s ease',
            }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#6366f1', minWidth: 36 }}>
            {(w * 100).toFixed(0)}%
          </span>
        </div>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={keywords}
      rowKey="id"
      size="middle"
      pagination={{ pageSize: 15, showSizeChanger: false, hideOnSinglePage: true }}
      style={{ borderRadius: 8, overflow: 'hidden' }}
    />
  )
}
