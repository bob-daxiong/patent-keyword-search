import { useEffect, useState, useMemo } from 'react'
import { Typography, Button, Space, Spin, message, Card, List, Tag } from 'antd'
import { ArrowLeftOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppState } from '../store/AppContext'
import { generateSearchQueries, openPatentSearch } from '../api'
import SearchQueryEditor from '../components/SearchQueryEditor'

const { Title, Text } = Typography

const dbColors: Record<string, string> = { cnipa: 'red', espacenet: 'blue', google: 'green' }
const dbLabels: Record<string, string> = {
  cnipa: '中国专利公布公告',
  espacenet: 'Espacenet (欧洲)',
  google: 'Google Patents',
}
const dbOrder: Record<string, number> = { cnipa: 0, espacenet: 1, google: 2 }

export default function SearchQueryPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { state, dispatch } = useAppState()
  const { textContent, keywords, searchQueries, editedQueries, searchUrlResults } = state
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    const selectedKeywords: string[] = (location.state as { selectedKeywords?: string[] })?.selectedKeywords || keywords.filter(k => state.selectedKeywordIds.has(k.id)).map(k => k.word)
    if (selectedKeywords.length === 0 && keywords.length > 0) { navigate('/'); return }
    if (selectedKeywords.length > 0 && searchQueries.length === 0) {
      setLoading(true)
      generateSearchQueries(textContent, selectedKeywords)
        .then((result) => {
          dispatch({ type: 'SET_IPC_PREDICTIONS', predictions: result.ipc_predictions || [] })
          dispatch({ type: 'SET_SEARCH_QUERIES', queries: result.queries || [] })
        })
        .catch((e: unknown) => { message.error(e instanceof Error ? e.message : '检索式生成失败') })
        .finally(() => setLoading(false))
    }
  }, [])

  const sortedLinks = useMemo(() => {
    const priorityMap = new Map(searchQueries.map(q => [q.id, q.priority || 99]))
    return searchUrlResults
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
  }, [searchUrlResults, searchQueries])

  const handleSearch = async () => {
    setSearching(true)
    dispatch({ type: 'CLEAR_SEARCH_URL_RESULTS' })
    dispatch({ type: 'SET_SEARCH_STATUS', status: 'searching' })
    const allUrls = []
    for (const q of searchQueries) {
      const queryText = editedQueries.get(q.id) ?? q.queryText
      try {
        const result = await openPatentSearch(q.id, queryText, q.targetDbs)
        allUrls.push(result)
        dispatch({ type: 'ADD_SEARCH_URL_RESULT', result })
      } catch (e: unknown) { message.error(e instanceof Error ? e.message : '检索请求失败') }
    }
    dispatch({ type: 'SET_SEARCH_STATUS', status: 'done' })
    try {
      const existing = JSON.parse(localStorage.getItem('patent_search_history') || '[]')
      existing.unshift({
        id: Date.now().toString(),
        timestamp: Date.now(),
        fileName: state.fileName,
        keywords: state.keywords,
        searchQueries: state.searchQueries,
        ipcPredictions: state.ipcPredictions,
        searchUrlResults: allUrls,
      })
      localStorage.setItem('patent_search_history', JSON.stringify(existing.slice(0, 50)))
    } catch {}
    navigate('/results')
    setSearching(false)
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 16px' }}>
      <Space style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} style={{ borderRadius: 8 }}>返回</Button>
        <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
          <span className="tech-gradient-text">检索式生成</span>
        </Title>
      </Space>

      {loading ? (
        <Card className="glass-card">
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" tip="AI 正在生成检索式..." />
          </div>
        </Card>
      ) : (
        <>
          <Card className="glass-card" style={{ marginBottom: 24 }}>
            <SearchQueryEditor />
          </Card>

          {searchUrlResults.length > 0 && (
            <Card className="glass-card" style={{ marginBottom: 24 }} title="检索链接">
              <List
                size="small"
                dataSource={sortedLinks}
                renderItem={(item: { key: string; query: string; database: string; label: string; url: string }) => (
                  <List.Item>
                    <Space>
                      <Tag color={dbColors[item.database]}>{dbLabels[item.database] || item.label}</Tag>
                      <Text code style={{ fontSize: 12, maxWidth: 360 }} ellipsis>{item.query}</Text>
                      <Button type="primary" ghost size="small" href={item.url} target="_blank">打开检索</Button>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          )}

          <div style={{ textAlign: 'center' }}>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              size="large"
              onClick={handleSearch}
              loading={searching}
              disabled={searchQueries.length === 0}
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
              {searching ? '生成检索链接中...' : '执行专利检索'}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
