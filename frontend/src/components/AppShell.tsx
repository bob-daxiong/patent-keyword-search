import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { LayoutProvider, useLayout } from './LayoutContext'
import { useTheme } from './ThemeProvider'

const { Content } = Layout

function AppShellInner() {
  const { theme } = useTheme()
  const { sidebarCollapsed } = useLayout()
  const isDark = theme === 'dark'

  return (
    <Layout style={{ minHeight: '100vh' }} hasSider>
      <Sidebar />
      <Layout style={{
        marginLeft: sidebarCollapsed ? 64 : 220,
        transition: 'margin-left 0.25s ease',
        background: isDark ? '#09090f' : '#f8fafc',
      }}>
        <Content>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default function AppShell() {
  return (
    <LayoutProvider>
      <AppShellInner />
    </LayoutProvider>
  )
}
