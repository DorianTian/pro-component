<script setup lang="ts">
import { ProForm, ProFormList } from '@pro/form'
import { ElMessage } from 'element-plus'

import type { ProFieldDef } from '@pro/utils'

const fields: ProFieldDef[] = [
  {
    dataIndex: 'projectName',
    title: '项目名称',
    valueType: 'text',
    rules: [{ required: true, message: '请输入项目名称' }],
  },
]

const memberFields: ProFieldDef[] = [
  {
    dataIndex: 'name',
    title: '成员姓名',
    valueType: 'text',
    rules: [{ required: true, message: '请输入姓名' }],
  },
  {
    dataIndex: 'role',
    title: '角色',
    valueType: 'select',
    valueEnum: {
      dev: { text: '开发' },
      pm: { text: '产品' },
      design: { text: '设计' },
      qa: { text: '测试' },
    },
    rules: [{ required: true, message: '请选择角色' }],
  },
  {
    dataIndex: 'email',
    title: '邮箱',
    valueType: 'text',
  },
]

async function handleSubmit(values: Record<string, unknown>) {
  await new Promise((r) => setTimeout(r, 500))
  ElMessage.success(`提交成功: ${(values.members as unknown[])?.length ?? 0} 名成员`)
  return true
}
</script>

<template>
  <ProForm :fields="fields" :on-submit="handleSubmit" :initial-values="{ members: [{}] }">
    <ProFormList name="members" :fields="memberFields" :min="1" :max="8" copyable />
  </ProForm>
</template>
