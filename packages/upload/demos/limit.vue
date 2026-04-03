<script setup lang="ts">
import { Upload } from '@pro/upload'
import { ElButton, ElMessage } from 'element-plus'

import type { UploadRequestOptions } from 'element-plus'

function mockUpload(options: UploadRequestOptions) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      options.onSuccess?.({})
      resolve()
    }, 600)
  })
}

function handleExceed() {
  ElMessage.warning('最多只能上传 3 个文件')
}
</script>

<template>
  <Upload action="#" :http-request="mockUpload" :limit="3" :on-exceed="handleExceed" multiple>
    <template #trigger>
      <ElButton type="primary">选择文件（最多 3 个）</ElButton>
    </template>
    <template #tip>
      <div style="font-size: 12px; color: #a3a3a3; margin-top: 6px">
        超过数量限制后将无法继续上传
      </div>
    </template>
  </Upload>
</template>
