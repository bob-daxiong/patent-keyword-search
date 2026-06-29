import { useEffect, useState } from 'react'
import { Spin, Empty } from 'antd'
import { useAppState } from '../store/AppContext'
import { generateWordCloud } from '../api'

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

  if (loading) return <Spin tip="正在生成词云..." style={{ display: 'block', textAlign: 'center', padding: 40 }} />

  if (!image) return <Empty description="词云生成失败" />

  return (
    <div style={{ textAlign: 'center' }}>
      <img
        src={`data:image/png;base64,${image}`}
        alt="关键词词云"
        style={{ maxWidth: '100%', borderRadius: 8 }}
      />
    </div>
  )
}
