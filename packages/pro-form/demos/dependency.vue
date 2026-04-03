<script setup lang="ts">
import { ProForm } from '@pro/form'
import { ElMessage } from 'element-plus'

import type { ProFormItem } from '@pro/utils'

const fields: ProFormItem[] = [
  {
    dataIndex: 'notifyType',
    title: '通知类型',
    valueType: 'select',
    valueEnum: {
      email: { text: '邮件' },
      sms: { text: '短信' },
      webhook: { text: 'Webhook' },
    },
    rules: [{ required: true, message: '请选择通知类型' }],
  },
  {
    dataIndex: 'emailAddress',
    title: '邮箱地址',
    valueType: 'text',
    placeholder: 'user@example.com',
    dependencies: ['notifyType'],
    visible: (v) => v.notifyType === 'email',
    rules: [
      { required: true, message: '请输入邮箱' },
      { type: 'email', message: '请输入有效邮箱' },
    ],
  },
  {
    dataIndex: 'phoneNumber',
    title: '手机号',
    valueType: 'text',
    placeholder: '13800138000',
    dependencies: ['notifyType'],
    visible: (v) => v.notifyType === 'sms',
    rules: [{ required: true, message: '请输入手机号' }],
  },
  {
    dataIndex: 'webhookUrl',
    title: 'Webhook URL',
    valueType: 'text',
    placeholder: 'https://api.example.com/hook',
    dependencies: ['notifyType'],
    visible: (v) => v.notifyType === 'webhook',
    rules: [{ required: true, message: '请输入 Webhook 地址' }],
  },
  {
    dataIndex: 'webhookSecret',
    title: 'Secret',
    valueType: 'text',
    dependencies: ['notifyType'],
    visible: (v) => v.notifyType === 'webhook',
    fieldProps: { type: 'password', showPassword: true },
  },
  {
    dataIndex: 'message',
    title: '通知内容',
    valueType: 'textarea',
    colSpan: 'full',
  },
]

async function handleSubmit(values: Record<string, unknown>) {
  await new Promise((r) => setTimeout(r, 500))
  ElMessage.success(`通知配置已保存: ${values.notifyType}`)
  return true
}
</script>

<template>
  <ProForm
    :fields="fields"
    :columns="2"
    :on-submit="handleSubmit"
    :initial-values="{ notifyType: 'email' }"
  />
</template>
