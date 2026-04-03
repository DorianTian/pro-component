<script setup lang="ts">
import { ref } from 'vue'
import { Upload } from '@pro/upload'
import { Plus } from '@element-plus/icons-vue'
import { ElIcon, ElDialog } from 'element-plus'

import type { UploadFile, UploadRequestOptions } from 'element-plus'

const dialogVisible = ref(false)
const dialogImageUrl = ref('')

function mockUpload(options: UploadRequestOptions) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      const reader = new FileReader()
      reader.onload = () => {
        options.onSuccess?.({ url: reader.result })
        resolve()
      }
      reader.readAsDataURL(options.file)
    }, 600)
  })
}

function handlePreview(file: UploadFile) {
  dialogImageUrl.value = file.url ?? ''
  dialogVisible.value = true
}
</script>

<template>
  <div>
    <Upload
      action="#"
      :http-request="mockUpload"
      list-type="picture-card"
      :limit="6"
      accept="image/*"
      :on-preview="handlePreview"
    >
      <ElIcon style="font-size: 24px; color: #a3a3a3"><Plus /></ElIcon>
    </Upload>
    <p style="margin: 8px 0 0; font-size: 12px; color: #a3a3a3">最多上传 6 张图片</p>

    <ElDialog v-model="dialogVisible" title="图片预览" width="600px">
      <img :src="dialogImageUrl" style="width: 100%; display: block" alt="preview" />
    </ElDialog>
  </div>
</template>
