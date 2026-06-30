import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import fs from 'fs'
import path from 'path'

describe('Animation micro-interactions', () => {
  it('design-tokens.css 包含 page-enter 关键帧', () => {
    const cssPath = path.resolve(__dirname, '../styles/design-tokens.css')
    const css = fs.readFileSync(cssPath, 'utf-8')
    expect(css).toContain('@keyframes page-enter')
    expect(css).toContain('transform: translateY(12px)')
  })

  it('design-tokens.css 包含 skeleton-pulse 关键帧', () => {
    const cssPath = path.resolve(__dirname, '../styles/design-tokens.css')
    const css = fs.readFileSync(cssPath, 'utf-8')
    expect(css).toContain('@keyframes skeleton-pulse')
  })

  it('design-tokens.css 包含 button hover/active 样式', () => {
    const cssPath = path.resolve(__dirname, '../styles/design-tokens.css')
    const css = fs.readFileSync(cssPath, 'utf-8')
    expect(css).toContain('scale(1.02)')
    expect(css).toContain('scale(0.97)')
  })

  it('design-tokens.css 包含 card hover 样式', () => {
    const cssPath = path.resolve(__dirname, '../styles/design-tokens.css')
    const css = fs.readFileSync(cssPath, 'utf-8')
    expect(css).toContain('translateY(-2px)')
    expect(css).toContain('shadow-glow')
  })

  it('design-tokens.css 包含 reduced-motion 媒体查询', () => {
    const cssPath = path.resolve(__dirname, '../styles/design-tokens.css')
    const css = fs.readFileSync(cssPath, 'utf-8')
    expect(css).toContain('prefers-reduced-motion')
    expect(css).toContain('animation-duration: 0.01ms')
  })

  it('stagger-enter 类可应用于 DOM 元素', () => {
    const { container } = render(
      <div className="stagger-enter">
        <div>1</div>
        <div>2</div>
      </div>
    )
    const el = container.querySelector('.stagger-enter')
    expect(el).toBeTruthy()
    expect(el?.children.length).toBe(2)
  })

  it('page-enter 类可应用于 DOM 元素', () => {
    const { container } = render(<div className="page-enter">content</div>)
    const el = container.querySelector('.page-enter')
    expect(el).toBeTruthy()
  })
})
