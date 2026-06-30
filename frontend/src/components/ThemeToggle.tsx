import { Button } from 'antd'
import { SunOutlined, MoonOutlined } from '@ant-design/icons'
import { useTheme } from './ThemeProvider'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <Button
      type="text"
      icon={isDark ? <SunOutlined /> : <MoonOutlined />}
      onClick={toggleTheme}
      aria-label={isDark ? '切换到浅色模式' : '切换到深色模式'}
      title={isDark ? '切换到浅色模式' : '切换到深色模式'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        borderRadius: 8,
        color: isDark ? '#f59e0b' : '#6366f1',
        fontSize: 18,
        transition: 'transform 0.3s ease, color 0.3s ease',
        background: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(99,102,241,0.08)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'rotate(30deg) scale(1.1)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = 'rotate(0deg) scale(1)'
      }}
    />
  )
}
