import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { Keyword, SearchQuery, IPCPrediction, SearchUrlResult, SearchStatus } from '../types'

interface AppState {
  fileName: string
  textContent: string
  keywords: Keyword[]
  selectedKeywordIds: Set<string>
  ipcPredictions: IPCPrediction[]
  searchQueries: SearchQuery[]
  editedQueries: Map<string, string>
  searchUrlResults: SearchUrlResult[]
  searchStatus: SearchStatus
  error: string | null
}

type Action =
  | { type: 'SET_FILE'; fileName: string; textContent: string }
  | { type: 'SET_KEYWORDS'; keywords: Keyword[] }
  | { type: 'TOGGLE_KEYWORD'; keywordId: string }
  | { type: 'SET_IPC_PREDICTIONS'; predictions: IPCPrediction[] }
  | { type: 'SET_SEARCH_QUERIES'; queries: SearchQuery[] }
  | { type: 'EDIT_QUERY'; queryId: string; text: string }
  | { type: 'ADD_SEARCH_URL_RESULT'; result: SearchUrlResult }
  | { type: 'CLEAR_SEARCH_URL_RESULTS' }
  | { type: 'SET_SEARCH_STATUS'; status: SearchStatus }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'RESET' }

const initialState: AppState = {
  fileName: '',
  textContent: '',
  keywords: [],
  selectedKeywordIds: new Set(),
  ipcPredictions: [],
  searchQueries: [],
  editedQueries: new Map(),
  searchUrlResults: [],
  searchStatus: 'idle',
  error: null,
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_FILE':
      return { ...state, fileName: action.fileName, textContent: action.textContent, error: null }
    case 'SET_KEYWORDS':
      return {
        ...state,
        keywords: action.keywords,
        selectedKeywordIds: new Set(action.keywords.map(k => k.id)),
      }
    case 'TOGGLE_KEYWORD': {
      const next = new Set(state.selectedKeywordIds)
      if (next.has(action.keywordId)) next.delete(action.keywordId)
      else next.add(action.keywordId)
      return { ...state, selectedKeywordIds: next }
    }
    case 'SET_IPC_PREDICTIONS':
      return { ...state, ipcPredictions: action.predictions }
    case 'SET_SEARCH_QUERIES':
      return { ...state, searchQueries: action.queries, editedQueries: new Map() }
    case 'EDIT_QUERY': {
      const next = new Map(state.editedQueries)
      next.set(action.queryId, action.text)
      return { ...state, editedQueries: next }
    }
    case 'ADD_SEARCH_URL_RESULT':
      return { ...state, searchUrlResults: [...state.searchUrlResults, action.result] }
    case 'CLEAR_SEARCH_URL_RESULTS':
      return { ...state, searchUrlResults: [] }
    case 'SET_SEARCH_STATUS':
      return { ...state, searchStatus: action.status }
    case 'SET_ERROR':
      return { ...state, error: action.error }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<Action>
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppState() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppState must be used within AppProvider')
  return ctx
}
