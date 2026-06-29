export interface Keyword {
  id: string
  word: string
  count: number
  weight: number
}

export interface IPCPrediction {
  code: string
  description: string
  score: number
}

export interface SearchQuery {
  id: string
  strategy: string
  queryText: string
  targetDbs: string[]
  ipcCodes: string[]
  editable: boolean
}

export interface PatentResult {
  title: string
  patentNumber: string
  abstract: string
  applicant: string
  filingDate: string
  url: string
}

export interface SearchUrlItem {
  database: string
  label: string
  url: string
}

export interface SearchUrlResult {
  queryId: string
  queryText: string
  searchUrls: SearchUrlItem[]
  patentResults: PatentResult[]
}

export interface SearchHistoryItem {
  id: string
  timestamp: number
  fileName: string
  keywords: Keyword[]
  searchQueries: SearchQuery[]
  ipcPredictions: IPCPrediction[]
  searchUrlResults: SearchUrlResult[]
}

export type SearchStatus = 'idle' | 'searching' | 'done' | 'error'
