<script setup lang="ts">
import { Upload } from '@pro/upload'
import { ElButton } from 'element-plus'

import type { UploadUserFile, UploadRequestOptions } from 'element-plus'

const defaultFiles: UploadUserFile[] = [
  { name: '2024年度报告.pdf', url: '#' },
  { name: '数据分析模板.xlsx', url: '#' },
  { name: '系统架构图.png', url: '#' },
]

function mockUpload(options: UploadRequestOptions) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      options.onSuccess?.({})
      resolve()
    }, 800)
  })
}
</script>

<template>
  <Upload action="#" :http-request="mockUpload" :file-list="defaultFiles" list-type="text" multiple>
    <template #trigger>
      <ElButton size="small">上传附件</ElButton>
    </template>
    <template #tip>
      <div style="font-size: 12px; color: #a3a3a3; margin-top: 6px">
        支持 PDF、Excel、图片等常见格式
      </div>
    </template>
  </Upload>
</template>
