<script setup lang="ts">
import { ref } from 'vue'
import { ProLoading } from '@pro/loading'

const error = ref<string | null>('接口返回 502 Bad Gateway')
const retryCount = ref(0)

function handleRetry() {
  retryCount.value++
  error.value = null
  setTimeout(() => {
    error.value = '接口返回 502 Bad Gateway'
  }, 1500)
}
</script>

<template>
  <div>
    <p style="margin: 0 0 12px; font-size: 13px; color: #737373">已重试 {{ retryCount }} 次</p>
    <ProLoading
      :loading="!error && retryCount > 0"
      :error="error"
      error-title="加载失败"
      @retry="handleRetry"
    >
      <div style="padding: 24px; text-align: center; color: #525252">加载成功的内容。</div>
    </ProLoading>
  </div>
</template>
