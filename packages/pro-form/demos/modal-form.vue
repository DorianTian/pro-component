<script setup lang="ts">
import { ref } from 'vue'
import { ModalForm } from '@pro/form'
import { ElButton, ElMessage } from 'element-plus'

const isVisible = ref(false)

const fields = [
  {
    dataIndex: 'taskName',
    title: '任务名称',
    valueType: 'text' as const,
    searchConfig: {
      rules: [{ required: true, message: '请输入任务名称' }],
    },
  },
  {
    dataIndex: 'priority',
    title: '优先级',
    valueType: 'select' as const,
    valueEnum: {
      high: { text: '高', status: 'danger' },
      medium: { text: '中', status: 'warning' },
      low: { text: '低', status: 'info' },
    },
  },
  {
    dataIndex: 'deadline',
    title: '截止日期',
    valueType: 'date' as const,
  },
  {
    dataIndex: 'description',
    title: '描述',
    valueType: 'textarea' as const,
  },
]

interface ModalFormValues {
  taskName: string
  priority: string
  deadline: string
  description: string
}

async function handleSubmit(_values: ModalFormValues) {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  ElMessage.success('任务创建成功')
  return true
}
</script>

<template>
  <ElButton type="primary" @click="isVisible = true">新建任务</ElButton>

  <ModalForm
    v-model:visible="isVisible"
    title="新建任务"
    :fields="fields"
    :on-submit="handleSubmit"
  />
</template>
