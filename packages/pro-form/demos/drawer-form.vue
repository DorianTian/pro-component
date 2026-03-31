<script setup lang="ts">
import { ref } from 'vue'
import { DrawerForm } from '@pro/form'
import { ElButton, ElMessage } from 'element-plus'

const isVisible = ref(false)

const fields = [
  {
    dataIndex: 'name',
    title: '配置名称',
    valueType: 'text' as const,
    searchConfig: { rules: [{ required: true, message: '请输入名称' }] },
  },
  {
    dataIndex: 'type',
    title: '类型',
    valueType: 'select' as const,
    valueEnum: {
      api: { text: 'API' },
      webhook: { text: 'Webhook' },
      cron: { text: '定时任务' },
    },
  },
  { dataIndex: 'description', title: '描述', valueType: 'textarea' as const },
]

async function handleSubmit() {
  await new Promise((r) => setTimeout(r, 800))
  ElMessage.success('配置创建成功')
  return true
}
</script>

<template>
  <ElButton type="primary" @click="isVisible = true">新建配置</ElButton>
  <DrawerForm v-model:visible="isVisible" title="新建配置" :fields="fields" :on-submit="handleSubmit" />
</template>
