<script setup lang="ts">
import { ref } from 'vue'
import { Upload } from '@pro/upload'
import { Plus } from '@element-plus/icons-vue'
import { ElIcon, ElMessage } from 'element-plus'

import type { UploadProps, UploadRequestOptions } from 'element-plus'

const imageUrl = ref('')

function mockUpload(options: UploadRequestOptions) {
  return new Promise<void>((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      imageUrl.value = reader.result as string
      options.onSuccess?.({})
      resolve()
    }
    reader.readAsDataURL(options.file)
  })
}

const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (!['image/jpeg', 'image/png'].includes(rawFile.type)) {
    ElMessage.error('只能上传 JPG / PNG 格式的图片')
    return false
  }
  if (rawFile.size > 2 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过 2MB')
    return false
  }
  return true
}
</script>

<template>
  <Upload
    action="#"
    :http-request="mockUpload"
    :show-file-list="false"
    :before-upload="beforeUpload"
    accept="image/jpeg,image/png"
  >
    <img
      v-if="imageUrl"
      :src="imageUrl"
      style="width: 120px; height: 120px; object-fit: cover; border-radius: 8px; display: block"
    />
    <div
      v-else
      style="
        width: 120px;
        height: 120px;
        border: 1px dashed #d4d4d4;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #a3a3a3;
        transition: border-color 0.2s;
      "
    >
      <ElIcon style="font-size: 24px; margin-bottom: 4px"><Plus /></ElIcon>
      <span style="font-size: 12px">上传头像</span>
    </div>
  </Upload>
</template>
