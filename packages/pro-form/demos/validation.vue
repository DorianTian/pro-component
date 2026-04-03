<script setup lang="ts">
import { ProForm } from '@pro/form'
import { ElMessage } from 'element-plus'
import type { ProFieldDef } from '@pro/utils'

const PHONE_PATTERN = /^1[3-9]\d{9}$/
const MIN_PASSWORD_LENGTH = 6
const MAX_PASSWORD_LENGTH = 20

const fields: ProFieldDef[] = [
  {
    dataIndex: 'username',
    title: '用户名',
    valueType: 'text',
    rules: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 2, max: 20, message: '用户名长度 2-20 个字符', trigger: 'blur' },
    ],
  },
  {
    dataIndex: 'email',
    title: '邮箱',
    valueType: 'text',
    rules: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
    ],
  },
  {
    dataIndex: 'phone',
    title: '手机号',
    valueType: 'text',
    rules: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: PHONE_PATTERN, message: '请输入有效的手机号码', trigger: 'blur' },
    ],
  },
  {
    dataIndex: 'password',
    title: '密码',
    valueType: 'text',
    fieldProps: { type: 'password', showPassword: true },
    rules: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      {
        min: MIN_PASSWORD_LENGTH,
        max: MAX_PASSWORD_LENGTH,
        message: `密码长度 ${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH} 个字符`,
        trigger: 'blur',
      },
    ],
  },
  {
    dataIndex: 'age',
    title: '年龄',
    valueType: 'number',
    rules: [
      {
        validator: (_rule: unknown, value: unknown, callback: (error?: Error) => void) => {
          const num = Number(value)
          if (value !== undefined && value !== null && value !== '' && (num < 18 || num > 120)) {
            callback(new Error('年龄必须在 18-120 之间'))
          } else {
            callback()
          }
        },
        trigger: 'blur',
      },
    ],
  },
]

async function handleSubmit(values: Record<string, unknown>) {
  await new Promise((resolve) => setTimeout(resolve, 800))
  ElMessage.success(`注册成功: ${JSON.stringify(values)}`)
  return true
}
</script>

<template>
  <ProForm :fields="fields" :columns="2" :on-submit="handleSubmit" submit-text="注册" />
</template>
