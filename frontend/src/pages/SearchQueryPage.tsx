import { useEffect, useState, useMemo } from 'react'
import { Typography, Button, Spin, message, Card, List, Tag, Progress } from 'antd'
import { ArrowLeftOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppState } from '../store/AppContext'
import { generateSearchQueries, openPatentSearch } from '../api'
import PageContainer from '../components/PageContainer'
import SearchQueryEditor from '../components/SearchQueryEditor'

const { Text } = Typography

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
  const [searchProgress, setSearchProgress] = useState(0)

  useEffect(() => {
    const selectedKeywords: string[] = (location.state as { selectedKeywords?: string[] })?.selectedKeywords
      || keywords.filter(k => state.selectedKeywordIds.has(k.id)).map(k => k.word)
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
    setSearchProgress(0)

    const allUrls = []
    const total = searchQueries.length

    for (let i = 0; i < total; i++) {
      const q = searchQueries[i]
      const queryText = editedQueries.get(q.id) ?? q.queryText
      try {
        const result = await openPatentSearch(q.id, queryText, q.targetDbs)
        allUrls.push(result)
        dispatch({ type: 'ADD_SEARCH_URL_RESULT', result })
      } catch (e: unknown) {
        message.error(e instanceof Error ? e.message : '检索请求失败')
      }
      setSearchProgress(Math.round(((i + 1) / total) * 100))
    }

    dispatch({ type: 'SET_SEARCH_STATUS', status: 'done' })
    setSearching(false)

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
    } catch { /* ignore */ }

    navigate('/results')
  }

  return (
    <PageContainer
      title="检索式生成"
      subtitle={`基于 ${keywords.filter(k => state.selectedKeywordIds.has(k.id)).length} 个已选关键词生成`}
      backTo="/"
      backLabel="返回上传"
    >
      {loading ? (
        <Card style={{
          background: 'var(--bg-card)',
          borderColor: 'var(--border-default)',
          boxShadow: 'var(--shadow-card)',
        }}>
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16, color: 'var(--text-secondary)', fontSize: 14 }}>
              AI 正在生成检索式...
            </div>
          </div>
        </Card>
      ) : (
        <>
          <Card style={{
            marginBottom: 24,
            background: 'var(--bg-card)',
            borderColor: 'var(--border-default)',
            boxShadow: 'var(--shadow-card)',
          }}>
            <SearchQueryEditor onSearchQuery={handleSearch} />
          </Card>

          {/* Search results */}
          {searchUrlResults.length > 0 && (
            <Card
              title={
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  检索链接 ({sortedLinks.length})
                </span>
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
                dataSource={sortedLinks}
                renderItem={(item) => (
                  <List.Item>
                    <Tag color={dbColors[item.database]}>{dbLabels[item.database] || item.label}</Tag>
                    <Text
                      code
                      style={{ fontSize: 14, maxWidth: 420, fontFamily: 'monospace' }}
                      ellipsis
                    >
                      {item.query}
                    </Text>
                    <Button
                      type="primary"
                      ghost
                      size="small"
                      href={item.url}
                      target="_blank"
                    >
                      打开检索
                    </Button>
                  </List.Item>
                )}
              />
            </Card>
          )}

          {/* Search button with progress */}
          {searching ? (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <Progress
                percent={searchProgress}
                status="active"
                strokeColor={{ from: '#06b6d4', to: '#22d3ee' }}
                style={{ maxWidth: 400, margin: '0 auto' }}
              />
              <Text style={{ color: 'var(--text-secondary)', fontSize: 13, display: 'block', marginTop: 8 }}>
                正在生成检索链接... ({Math.round(searchProgress / 100 * searchQueries.length)}/{searchQueries.length})
              </Text>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                size="large"
                onClick={handleSearch}
                disabled={searchQueries.length === 0}
                style={{
                  height: 48,
                  fontSize: 16,
                  fontWeight: 600,
                  padding: '0 40px',
                  borderRadius: 12,
                  boxShadow: '0 4px 20px rgba(6,182,212,0.3)',
                }}
              >
                执行专利检索
              </Button>
            </div>
          )}
        </>
      )}
    </PageContainer>
  )
}
