import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from './ThemeProvider'
import { LayoutProvider, useLayout } from './LayoutContext'
import Sidebar from './Sidebar'

describe('Sidebar', () => {
  function renderSidebar(initialRoute = '/') {
    render(
      <ThemeProvider>
        <LayoutProvider>
          <MemoryRouter initialEntries={[initialRoute]}>
            <Sidebar />
          </MemoryRouter>
        </LayoutProvider>
      </ThemeProvider>
    )
  }

  it('渲染 4 个导航项', () => {
    renderSidebar()
    expect(screen.getByText('上传分析')).toBeInTheDocument()
    expect(screen.getByText('检索式')).toBeInTheDocument()
    expect(screen.getByText('检索结果')).toBeInTheDocument()
    expect(screen.getByText('历史记录')).toBeInTheDocument()
  })

  it('包含主题切换按钮', () => {
    renderSidebar()
    const toggle = screen.getByRole('button', { name: /切换/ })
    expect(toggle).toBeInTheDocument()
  })
})

describe('LayoutContext', () => {
  it('sidebarCollapsed 默认为 false（桌面端）', () => {
    const { result } = renderHook(() => useLayout(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <LayoutProvider>{children}</LayoutProvider>
      ),
    })

    expect(result.current.sidebarCollapsed).toBe(false)
  })
})
