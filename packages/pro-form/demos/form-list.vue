<script setup lang="ts">
import { ProForm, ProFormList } from '@pro/form'
import { ElMessage } from 'element-plus'

const fields = [
  {
    dataIndex: 'projectName',
    title: '项目名称',
    valueType: 'text' as const,
    searchConfig: { rules: [{ required: true, message: '请输入项目名称' }] },
  },
]

const memberFields = [
  { dataIndex: 'name', title: '成员姓名', valueType: 'text' as const },
  {
    dataIndex: 'role',
    title: '角色',
    valueType: 'select' as const,
    valueEnum: {
      dev: { text: '开发' },
      pm: { text: '产品' },
      qa: { text: '测试' },
    },
  },
]

async function handleSubmit(values: Record<string, unknown>) {
  await new Promise((r) => setTimeout(r, 500))
  ElMessage.success(JSON.stringify(values))
  return true
}
</script>

<template>
  <ProForm :fields="fields" :on-submit="handleSubmit" :initial-values="{ members: [{}] }">
    <template #default>
      <ProFormList name="members" :fields="memberFields" :min="1" :max="5" copyable />
    </template>
  </ProForm>
</template>
