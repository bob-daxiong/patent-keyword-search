import { useState } from 'react'
import { Upload, message, type UploadProps } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { useTheme } from './ThemeProvider'
import { useAppState } from '../store/AppContext'
import { uploadFile } from '../api'

const { Dragger } = Upload

export default function UploadPanel() {
  const { dispatch } = useAppState()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [uploading, setUploading] = useState(false)

  const props: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.doc,.docx',
    showUploadList: false,
    beforeUpload: async (file) => {
      setUploading(true)
      try {
        const result = await uploadFile(file)
        dispatch({ type: 'SET_FILE', fileName: result.filename, textContent: result.text })
        message.success(`文件 "${result.filename}" 解析成功`)
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : '上传失败'
        message.error(msg)
        dispatch({ type: 'SET_ERROR', error: msg })
      } finally {
        setUploading(false)
      }
      return false
    },
  }

  return (
    <Dragger
      {...props}
      disabled={uploading}
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(6,182,212,0.03), rgba(34,211,238,0.02))'
          : 'linear-gradient(135deg, rgba(6,182,212,0.02), rgba(8,145,178,0.01))',
        border: `2px dashed ${isDark ? 'rgba(6,182,212,0.25)' : 'rgba(6,182,212,0.30)'}`,
        borderRadius: 16,
        padding: '40px 24px',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(6,182,212,0.5)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(6,182,212,0.08)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = isDark ? 'rgba(6,182,212,0.25)' : 'rgba(6,182,212,0.30)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
      }}
    >
      <div style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: isDark
          ? 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(34,211,238,0.08))'
          : 'linear-gradient(135deg, rgba(6,182,212,0.10), rgba(8,145,178,0.05))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px',
      }}>
        <InboxOutlined style={{ fontSize: 32, color: '#22d3ee' }} />
      </div>
      <p style={{
        fontSize: 16,
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: 8,
      }}>
        点击或拖拽交底书文件到此区域上传
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
        支持 .docx 格式，文件大小不超过 20MB
      </p>
    </Dragger>
  )
}
