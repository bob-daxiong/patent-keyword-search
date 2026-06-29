import { useState } from 'react'
import { Upload, message, type UploadProps } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { useAppState } from '../store/AppContext'
import { uploadFile } from '../api'

const { Dragger } = Upload

export default function UploadPanel() {
  const { dispatch } = useAppState()
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
        background: 'linear-gradient(135deg, rgba(99,102,241,0.03), rgba(124,58,237,0.03))',
        border: '2px dashed rgba(99,102,241,0.25)',
        borderRadius: 16,
        padding: '40px 24px',
        transition: 'all 0.3s',
      }}
    >
      <div style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(124,58,237,0.1))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px',
      }}>
        <InboxOutlined style={{ fontSize: 32, color: '#6366f1' }} />
      </div>
      <p style={{ fontSize: 16, fontWeight: 600, color: '#334155', marginBottom: 8 }}>
        点击或拖拽交底书文件到此区域上传
      </p>
      <p style={{ fontSize: 13, color: '#94a3b8' }}>
        支持 .docx 格式，文件大小不超过 20MB
      </p>
    </Dragger>
  )
}
