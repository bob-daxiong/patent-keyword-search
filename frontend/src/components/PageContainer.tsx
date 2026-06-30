import type { ReactNode } from 'react'
import { Typography, Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography

interface PageContainerProps {
  children: ReactNode
  title?: string
  subtitle?: string
  backTo?: string
  backLabel?: string
  maxWidth?: number
}

export default function PageContainer({
  children,
  title,
  subtitle,
  backTo,
  backLabel,
  maxWidth = 1200,
}: PageContainerProps) {
  const navigate = useNavigate()

  return (
    <div style={{
      maxWidth,
      margin: '0 auto',
      padding: '32px 24px',
      minHeight: '100vh',
    }}>
      {(title || backTo) && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 16,
          marginBottom: 28,
          flexWrap: 'wrap',
        }}>
          {backTo && (
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(backTo)}
              size="middle"
            >
              {backLabel || '返回'}
            </Button>
          )}
          {title && (
            <div>
              <Title level={4} style={{
                margin: 0,
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}>
                <span className="accent-gradient-text">{title}</span>
              </Title>
              {subtitle && (
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {subtitle}
                </Text>
              )}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
