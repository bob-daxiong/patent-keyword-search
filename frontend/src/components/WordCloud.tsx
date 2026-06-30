import { useEffect, useState } from 'react'
import { Spin, Empty } from 'antd'
import { useAppState } from '../store/AppContext'
import { generateWordCloud } from '../api'
import { SkeletonCard } from './Skeleton'

export default function WordCloud() {
  const { state } = useAppState()
  const { keywords } = state
  const [image, setImage] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (keywords.length === 0) {
      setImage('')
      return
    }
    setLoading(true)
    generateWordCloud(keywords)
      .then(setImage)
      .catch(() => setImage(''))
      .finally(() => setLoading(false))
  }, [keywords])

  if (keywords.length === 0) return null

  if (loading) return <SkeletonCard />

  if (!image) return (
    <Empty
      description={<span style={{ color: 'var(--text-tertiary)' }}>词云生成失败</span>}
      style={{ padding: 40 }}
    />
  )

  return (
    <div style={{
      textAlign: 'center',
      padding: 16,
      background: 'var(--bg-input)',
      borderRadius: 10,
      border: '1px solid var(--border-default)',
    }}>
      <img
        src={`data:image/png;base64,${image}`}
        alt="关键词词云"
        style={{ maxWidth: '100%', borderRadius: 8 }}
      />
    </div>
  )
}
