<script setup lang="ts">
import { ref } from 'vue'
import { Popconfirm } from '@pro/popconfirm'
import { ElButton, ElMessage } from 'element-plus'

const count = ref(3)

const handleConfirm = () => {
  ElMessage.success('操作已确认')
}

const handleCancel = () => {
  ElMessage.info('操作已取消')
}

const handleDelete = () => {
  count.value--
  ElMessage.warning(`已删除，剩余 ${count.value} 条`)
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      基础确认
    </span>
    <Popconfirm title="确定执行此操作？" @confirm="handleConfirm" @cancel="handleCancel">
      <template #reference>
        <ElButton>点击确认</ElButton>
      </template>
    </Popconfirm>

    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      自定义按钮文案
    </span>
    <Popconfirm
      title="确定要删除吗？此操作不可撤销。"
      confirm-button-text="确认删除"
      cancel-button-text="再想想"
      confirm-button-type="danger"
      @confirm="handleDelete"
    >
      <template #reference>
        <ElButton type="danger">删除 ({{ count }})</ElButton>
      </template>
    </Popconfirm>
  </div>
</template>
