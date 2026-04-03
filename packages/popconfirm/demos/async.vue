<script setup lang="ts">
import { ref } from 'vue'
import { Popconfirm } from '@pro/popconfirm'
import { ElButton, ElMessage } from 'element-plus'

const loading = ref(false)
const popconfirmRef = ref()

const handleConfirm = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('异步操作完成')
  }, 2000)
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      异步确认 — 确认后执行异步操作，配合 hide-after 控制关闭时机
    </span>
    <Popconfirm
      title="确定要发布到生产环境吗？"
      confirm-button-text="确认发布"
      cancel-button-text="取消"
      confirm-button-type="warning"
      :hide-after="0"
      @confirm="handleConfirm"
    >
      <template #reference>
        <ElButton type="warning" :loading="loading">
          {{ loading ? '发布中...' : '发布上线' }}
        </ElButton>
      </template>
    </Popconfirm>
  </div>
</template>
