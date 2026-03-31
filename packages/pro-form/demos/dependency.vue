<script setup lang="ts">
import { ProForm, ProFormDependency } from '@pro/form'
import { ElMessage, ElAlert } from 'element-plus'

const fields = [
  {
    dataIndex: 'type',
    title: '通知类型',
    valueType: 'select' as const,
    valueEnum: {
      email: { text: '邮件' },
      sms: { text: '短信' },
      webhook: { text: 'Webhook' },
    },
  },
  { dataIndex: 'target', title: '接收目标', valueType: 'text' as const },
]

async function handleSubmit(values: Record<string, unknown>) {
  await new Promise((r) => setTimeout(r, 500))
  ElMessage.success(JSON.stringify(values))
  return true
}
</script>

<template>
  <ProForm :fields="fields" :on-submit="handleSubmit">
    <template #default>
      <ProFormDependency :name="['type']">
        <template #default="{ values }">
          <ElAlert
            v-if="values.type === 'webhook'"
            title="Webhook 模式需要填写完整的 URL 地址"
            type="info"
            show-icon
            :closable="false"
            style="margin-bottom: 16px"
          />
        </template>
      </ProFormDependency>
    </template>
  </ProForm>
</template>
