import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConfigProvider, theme as antdTheme } from 'antd'
import { ThemeProvider, useTheme } from './components/ThemeProvider'
import { AppProvider } from './store/AppContext'
import AppShell from './components/AppShell'
import HomePage from './pages/HomePage'
import SearchQueryPage from './pages/SearchQueryPage'
import ResultsPage from './pages/ResultsPage'
import HistoryPage from './pages/HistoryPage'

function getAntdConfig(mode: 'dark' | 'light') {
  const isDark = mode === 'dark'

  return {
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: '#06b6d4',
      borderRadius: 8,
      fontFamily: '"Microsoft YaHei", "微软雅黑", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: 14,
      controlHeight: 36,
      colorBgContainer: isDark ? '#141425' : '#ffffff',
      colorBgElevated: isDark ? '#1a1a32' : '#ffffff',
      colorBorder: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      colorBorderSecondary: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      colorText: isDark ? '#f1f5f9' : '#0f172a',
      colorTextSecondary: isDark ? '#94a3b8' : '#475569',
      colorTextTertiary: isDark ? '#64748b' : '#94a3b8',
      colorBgSpotlight: isDark ? '#1a1a32' : '#ffffff',
      colorBgMask: 'rgba(0,0,0,0.45)',
      colorSuccess: '#10b981',
      colorWarning: '#f59e0b',
      colorError: '#ef4444',
      colorInfo: '#3b82f6',
      colorLink: '#06b6d4',
      colorLinkHover: '#22d3ee',
    },
    components: {
      Layout: {
        bodyBg: isDark ? '#09090f' : '#f8fafc',
        headerBg: isDark ? '#0c0c18' : '#ffffff',
        siderBg: isDark ? '#0c0c18' : '#ffffff',
      },
      Card: {
        borderRadiusLG: 12,
        paddingLG: 24,
        colorBgContainer: isDark ? '#141425' : '#ffffff',
        boxShadow: isDark
          ? '0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)'
          : '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
      },
      Button: {
        borderRadius: 8,
        controlHeight: 36,
        fontWeight: 500,
      },
      Table: {
        headerBg: isDark ? '#0c0c18' : '#f8fafc',
        headerColor: isDark ? '#94a3b8' : '#475569',
        rowHoverBg: isDark ? 'rgba(6,182,212,0.06)' : 'rgba(6,182,212,0.04)',
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        colorBgContainer: isDark ? '#141425' : '#ffffff',
      },
      Modal: {
        contentBg: isDark ? '#141425' : '#ffffff',
        headerBg: isDark ? '#141425' : '#ffffff',
      },
      Tag: {
        defaultBg: isDark ? 'rgba(6,182,212,0.10)' : 'rgba(6,182,212,0.08)',
        defaultColor: isDark ? '#22d3ee' : '#0891b2',
      },
      Input: {
        colorBgContainer: isDark ? '#141425' : '#ffffff',
        colorBorder: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        colorText: isDark ? '#f1f5f9' : '#0f172a',
      },
      Select: {
        colorBgContainer: isDark ? '#141425' : '#ffffff',
        colorBorder: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        optionSelectedBg: isDark ? 'rgba(6,182,212,0.15)' : 'rgba(6,182,212,0.10)',
      },
      Collapse: {
        contentBg: isDark ? '#141425' : '#ffffff',
        headerBg: isDark ? '#1a1a32' : '#f8fafc',
      },
      List: {
        colorBgContainer: isDark ? '#141425' : '#ffffff',
      },
    },
  }
}

function AppContent() {
  const { theme } = useTheme()

  return (
    <ConfigProvider theme={getAntdConfig(theme)}>
      <BrowserRouter>
        <AppProvider>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/search-query" element={<SearchQueryPage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/history" element={<HistoryPage />} />
            </Route>
          </Routes>
        </AppProvider>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}
