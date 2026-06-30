import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ThemeProvider, useTheme, type ThemeMode } from '../components/ThemeProvider'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: () => { store = {} },
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

function renderUseTheme(initialMode?: ThemeMode) {
  if (initialMode) {
    localStorageMock.setItem('patent_theme_mode', initialMode)
  }
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>{children}</ThemeProvider>
  )
  return renderHook(() => useTheme(), { wrapper })
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  it('默认使用深色模式（无 localStorage 且无系统偏好时）', () => {
    // Mock prefers-color-scheme to dark
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const { result } = renderUseTheme()
    expect(result.current.theme).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('从 localStorage 读取已保存的主题', () => {
    const { result } = renderUseTheme('light')
    expect(result.current.theme).toBe('light')
  })

  it('toggleTheme 切换深/浅模式', () => {
    const { result } = renderUseTheme('dark')

    act(() => { result.current.toggleTheme() })
    expect(result.current.theme).toBe('light')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('patent_theme_mode', 'light')

    act(() => { result.current.toggleTheme() })
    expect(result.current.theme).toBe('dark')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('patent_theme_mode', 'dark')
  })

  it('切换时同步设置 document.documentElement.dataset.theme', () => {
    const { result } = renderUseTheme('dark')

    act(() => { result.current.toggleTheme() })
    expect(document.documentElement.dataset.theme).toBe('light')

    act(() => { result.current.toggleTheme() })
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})
