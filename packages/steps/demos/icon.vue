<script setup lang="ts">
import { ref } from 'vue'
import { Steps, Step } from '@pro/steps'
import { Edit, Upload, Picture, CircleCheck } from '@element-plus/icons-vue'

const active = ref(1)
</script>

<template>
  <div style="max-width: 640px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      为每个步骤设置自定义图标
    </span>
    <Steps :active="active">
      <Step title="编辑内容" :icon="Edit" />
      <Step title="上传素材" :icon="Upload" />
      <Step title="预览效果" :icon="Picture" />
      <Step title="发布成功" :icon="CircleCheck" />
    </Steps>
  </div>
</template>
