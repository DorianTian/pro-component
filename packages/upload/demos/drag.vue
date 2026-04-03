<script setup lang="ts">
import { Upload } from '@pro/upload'
import { UploadFilled } from '@element-plus/icons-vue'
import { ElIcon } from 'element-plus'

import type { UploadRequestOptions } from 'element-plus'

function mockUpload(options: UploadRequestOptions) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      options.onSuccess?.({})
      resolve()
    }, 1200)
  })
}
</script>

<template>
  <Upload action="#" :http-request="mockUpload" drag multiple>
    <ElIcon style="font-size: 48px; color: #a3a3a3; margin-bottom: 8px">
      <UploadFilled />
    </ElIcon>
    <div style="color: #525252; font-size: 14px">
      将文件拖到此处，或<em style="color: #409eff">点击上传</em>
    </div>
    <template #tip>
      <div style="font-size: 12px; color: #a3a3a3; margin-top: 8px">
        支持批量上传，单个文件不超过 20MB
      </div>
    </template>
  </Upload>
</template>
