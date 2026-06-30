import { Link, useLocation } from 'react-router-dom'
import {
  CloudUploadOutlined,
  SearchOutlined,
  FileTextOutlined,
  HistoryOutlined,
  ExperimentOutlined,
} from '@ant-design/icons'
import { useTheme } from './ThemeProvider'
import { useLayout } from './LayoutContext'
import ThemeToggle from './ThemeToggle'

const menuItems = [
  { key: '/', icon: <CloudUploadOutlined />, label: '上传分析' },
  { key: '/search-query', icon: <SearchOutlined />, label: '检索式' },
  { key: '/results', icon: <FileTextOutlined />, label: '检索结果' },
  { key: '/history', icon: <HistoryOutlined />, label: '历史记录' },
]

export default function Sidebar() {
  const location = useLocation()
  const { theme } = useTheme()
  const { sidebarCollapsed: collapsed } = useLayout()
  const isDark = theme === 'dark'
  const width = collapsed ? 64 : 220

  return (
    <nav
      style={{
        width,
        minHeight: '100vh',
        background: isDark
          ? 'linear-gradient(180deg, #0c0c18 0%, #111125 100%)'
          : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: collapsed ? '20px 16px' : '20px 20px',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: isDark
            ? 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(34,211,238,0.1))'
            : 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(8,145,178,0.08))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <ExperimentOutlined style={{
            fontSize: 20,
            color: '#22d3ee',
          }} />
        </div>
        {!collapsed && (
          <div>
            <div style={{
              fontSize: 15,
              fontWeight: 700,
              color: isDark ? '#f1f5f9' : '#0f172a',
              letterSpacing: 0.5,
              lineHeight: '20px',
            }}>
              专利分析
            </div>
            <div style={{
              fontSize: 10,
              color: isDark ? '#64748b' : '#94a3b8',
              lineHeight: '14px',
            }}>
              Patent Analyzer
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 8px',
        gap: 2,
      }}>
        {menuItems.map(item => {
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
                gap: 12,
                padding: collapsed ? '10px 0' : '10px 16px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                color: active
                  ? '#22d3ee'
                  : isDark ? '#94a3b8' : '#475569',
                background: active
                  ? isDark ? 'rgba(6,182,212,0.12)' : 'rgba(6,182,212,0.08)'
                  : 'transparent',
                borderLeft: active && !collapsed
                  ? '3px solid #06b6d4'
                  : '3px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = isDark
                    ? 'rgba(255,255,255,0.04)'
                    : 'rgba(0,0,0,0.03)'
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
                }
              }}
              title={collapsed ? item.label : undefined}
            >
              <span style={{
                fontSize: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 22,
              }}>
                {item.icon}
              </span>
              {!collapsed && item.label}
            </Link>
          )
        })}
      </div>

      {/* Theme toggle */}
      <div style={{
        padding: collapsed ? '12px 0' : '12px 16px',
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
        display: 'flex',
        justifyContent: collapsed ? 'center' : 'flex-start',
        alignItems: 'center',
      }}>
        {!collapsed && (
          <span style={{
            fontSize: 11,
            color: isDark ? '#64748b' : '#94a3b8',
            marginRight: 'auto',
          }}>
            {isDark ? '深色模式' : '浅色模式'}
          </span>
        )}
        <ThemeToggle />
      </div>
    </nav>
  )
}
