import { Typography, Empty } from 'antd'
import { useAppState } from '../store/AppContext'

const { Text } = Typography

export default function PatentResultList() {
  const { state } = useAppState()
  const { searchUrlResults } = state

  if (searchUrlResults.length === 0) {
    return <Empty description="暂无检索结果" />
  }

  const totalUrls = searchUrlResults.reduce(
    (sum, r) => sum + r.searchUrls.length, 0
  )

  return (
    <div style={{ textAlign: 'center', padding: 24 }}>
      <Text>已生成 {totalUrls} 个检索链接，请返回检索结果页面查看</Text>
    </div>
  )
}
