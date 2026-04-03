<script setup lang="ts">
import { Upload } from '@pro/upload'
import { ElButton, ElMessage } from 'element-plus'

import type { UploadProps, UploadRequestOptions } from 'element-plus'

function mockUpload(options: UploadRequestOptions) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      options.onSuccess?.({})
      resolve()
    }, 800)
  })
}

const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ]
  if (!allowedTypes.includes(rawFile.type)) {
    ElMessage.error('仅支持 PDF 和 Excel 文件')
    return false
  }
  if (rawFile.size > 5 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过 5MB')
    return false
  }
  return true
}
</script>

<template>
  <Upload
    action="#"
    :http-request="mockUpload"
    :before-upload="beforeUpload"
    accept=".pdf,.xlsx,.xls"
    multiple
  >
    <template #trigger>
      <ElButton type="primary">上传文档</ElButton>
    </template>
    <template #tip>
      <div style="font-size: 12px; color: #a3a3a3; margin-top: 6px">
        仅支持 PDF、Excel 格式，单个文件不超过 5MB
      </div>
    </template>
  </Upload>
</template>
