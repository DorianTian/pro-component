<script setup lang="ts">
import { ref } from 'vue'
import { Upload } from '@pro/upload'
import { ElButton, ElMessage } from 'element-plus'

import type { UploadInstance, UploadRequestOptions } from 'element-plus'

const uploadRef = ref<UploadInstance | null>(null)

function mockUpload(options: UploadRequestOptions) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      options.onSuccess?.({})
      ElMessage.success(`${options.file.name} 上传成功`)
      resolve()
    }, 1000)
  })
}

function submitUpload() {
  uploadRef.value?.submit()
}
</script>

<template>
  <Upload ref="uploadRef" action="#" :http-request="mockUpload" :auto-upload="false" multiple>
    <template #trigger>
      <ElButton>选择文件</ElButton>
    </template>
    <template #tip>
      <div style="font-size: 12px; color: #a3a3a3; margin-top: 6px">
        选择文件后手动点击上传按钮提交
      </div>
    </template>
  </Upload>
  <ElButton type="primary" style="margin-top: 12px" @click="submitUpload"> 开始上传 </ElButton>
</template>
