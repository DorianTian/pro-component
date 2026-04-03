<script setup lang="ts">
import { ref } from 'vue'
import { ProEmpty } from '@pro/empty'

const retryCount = ref(0)

function handleRetry() {
  retryCount.value++
}
</script>

<template>
  <div>
    <p style="margin: 0 0 12px; font-size: 13px; color: #737373">已重试 {{ retryCount }} 次</p>
    <ProEmpty type="error" description="数据加载失败，请检查网络连接后重试" @retry="handleRetry" />
  </div>
</template>
