import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Layout, ConfigProvider } from 'antd'
import {
  CloudUploadOutlined,
  SearchOutlined,
  FileTextOutlined,
  HistoryOutlined,
  ExperimentOutlined,
} from '@ant-design/icons'
import { AppProvider } from './store/AppContext'
import HomePage from './pages/HomePage'
import SearchQueryPage from './pages/SearchQueryPage'
import ResultsPage from './pages/ResultsPage'
import HistoryPage from './pages/HistoryPage'

const { Header, Content } = Layout

const appTheme = {
  token: {
    colorPrimary: '#4f46e5',
    borderRadius: 8,
    colorBgContainer: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  },
}

function AppLayout() {
  const location = useLocation()

  const menuItems = [
    { key: '/', icon: <CloudUploadOutlined />, label: <Link to="/">上传分析</Link> },
    { key: '/search-query', icon: <SearchOutlined />, label: <Link to="/search-query">检索式</Link> },
    { key: '/results', icon: <FileTextOutlined />, label: <Link to="/results">检索结果</Link> },
    { key: '/history', icon: <HistoryOutlined />, label: <Link to="/history">历史记录</Link> },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 32px',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        height: 64,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginRight: 32 }}>
          <ExperimentOutlined style={{ fontSize: 28, color: '#818cf8', marginRight: 12 }} />
          <div>
            <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, lineHeight: '24px', letterSpacing: 1 }}>
              专利交底书分析
            </div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, lineHeight: '16px' }}>
              Patent Disclosure Analyzer
            </div>
          </div>
        </div>
        <div style={{
          display: 'flex',
          gap: 4,
          flex: 1,
          justifyContent: 'flex-end',
        }}>
          {menuItems.map((item) => {
            const active = item.key === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.key)
            return (
              <Link
                key={item.key}
                to={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 20px',
                  borderRadius: 20,
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  color: active ? '#fff' : 'rgba(255,255,255,0.65)',
                  background: active ? 'rgba(99,102,241,0.35)' : 'transparent',
                  border: active ? '1px solid rgba(129,140,248,0.4)' : '1px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </div>
      </Header>
      <Content style={{
        background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 50%, #f8fafc 100%)',
        minHeight: 'calc(100vh - 64px)',
      }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search-query" element={<SearchQueryPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </Content>
    </Layout>
  )
}

export default function App() {
  return (
    <ConfigProvider theme={appTheme}>
      <BrowserRouter>
        <AppProvider>
          <AppLayout />
        </AppProvider>
      </BrowserRouter>
    </ConfigProvider>
  )
}
