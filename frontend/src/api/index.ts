import type { Keyword, SearchQuery, IPCPrediction, SearchUrlResult } from '../types'

const BASE = '/api'

function toFormData(file: File): FormData {
  const formData = new FormData()
  formData.append('file', file)
  return formData
}

export async function uploadFile(file: File): Promise<{ filename: string; text: string }> {
  const res = await fetch(`${BASE}/upload`, {
    method: 'POST',
    body: toFormData(file),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || '上传失败')
  }
  return res.json()
}

export async function extractKeywords(text: string, topN = 30): Promise<Keyword[]> {
  const res = await fetch(`${BASE}/keywords`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, top_n: topN }),
  })
  const data = await res.json()
  return (data.keywords || []).map((kw: Omit<Keyword, 'id'>, i: number) => ({
    ...kw,
    id: `kw-${i}`,
  }))
}

export async function generateWordCloud(keywords: Keyword[]): Promise<string> {
  const res = await fetch(`${BASE}/wordcloud`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      keywords: keywords.map(k => ({ word: k.word, weight: k.weight }))
    }),
  })
  const data = await res.json()
  return data.image || ''
}

export async function generateSearchQueries(
  text: string,
  keywords: string[],
  keywordWeights?: Map<string, number>
): Promise<{ ipc_predictions: IPCPrediction[]; queries: SearchQuery[] }> {
  const keywordItems = keywords.map(kw => ({
    word: kw,
    weight: keywordWeights?.get(kw) ?? 1.0,
  }))
  const res = await fetch(`${BASE}/search-queries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, keywords: keywordItems }),
  })
  return res.json()
}

export async function openPatentSearch(
  queryId: string,
  queryText: string,
  databases: string[]
): Promise<SearchUrlResult> {
  const res = await fetch(`${BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query_id: queryId, query_text: queryText, databases }),
  })
  return res.json()
}
