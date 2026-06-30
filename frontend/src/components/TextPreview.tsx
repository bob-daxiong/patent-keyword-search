import { useMemo } from 'react'
import { Typography } from 'antd'
import { useAppState } from '../store/AppContext'

const { Paragraph } = Typography

export default function TextPreview() {
  const { state } = useAppState()
  const { textContent, keywords, selectedKeywordIds } = state

  const highlightedText = useMemo(() => {
    if (!textContent || keywords.length === 0) return textContent
    const selectedWords = keywords
      .filter(k => selectedKeywordIds.has(k.id))
      .map(k => k.word)
      .sort((a, b) => b.length - a.length)

    if (selectedWords.length === 0) return textContent

    const pattern = selectedWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
    const regex = new RegExp(`(${pattern})`, 'g')
    const parts = textContent.split(regex)

    return parts.map((part, i) => {
      if (selectedWords.includes(part)) {
        return (
          <mark key={i} style={{
            background: 'rgba(6,182,212,0.2)',
            padding: '1px 4px',
            borderRadius: 3,
            color: 'var(--text-accent)',
            fontWeight: 600,
          }}>
            {part}
          </mark>
        )
      }
      return part
    })
  }, [textContent, keywords, selectedKeywordIds])

  if (!textContent) return null

  return (
    <div style={{
      maxHeight: 360,
      overflow: 'auto',
      padding: '20px 24px',
      background: 'var(--bg-input)',
      borderRadius: 10,
      border: '1px solid var(--border-default)',
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    }}>
      <Paragraph style={{
        whiteSpace: 'pre-wrap',
        margin: 0,
        lineHeight: 2.2,
        fontSize: 13,
        color: 'var(--text-secondary)',
      }}>
        {highlightedText}
      </Paragraph>
    </div>
  )
}
