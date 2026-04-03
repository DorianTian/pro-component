<script setup lang="ts">
import { ref } from 'vue'
import { ProDescriptions } from '@pro/descriptions'
import { ProForm } from '@pro/form'
import { ElButton, ElMessage } from 'element-plus'
import type { ProColumnDef } from '@pro/utils'
import type { ProFieldDef } from '@pro/utils'

const isEditing = ref(false)

const columns: ProColumnDef[] = [
  { dataIndex: 'name', title: '姓名', valueType: 'text' },
  { dataIndex: 'phone', title: '电话', valueType: 'text' },
  { dataIndex: 'email', title: '邮箱', valueType: 'text' },
  {
    dataIndex: 'department',
    title: '部门',
    valueType: 'select',
    valueEnum: {
      engineering: { text: '工程部' },
      product: { text: '产品部' },
      design: { text: '设计部' },
    },
  },
  { dataIndex: 'city', title: '城市', valueType: 'text' },
]

const formFields: ProFieldDef[] = [
  {
    dataIndex: 'name',
    title: '姓名',
    valueType: 'text',
    rules: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  },
  { dataIndex: 'phone', title: '电话', valueType: 'text' },
  { dataIndex: 'email', title: '邮箱', valueType: 'text' },
  {
    dataIndex: 'department',
    title: '部门',
    valueType: 'select',
    valueEnum: {
      engineering: { text: '工程部' },
      product: { text: '产品部' },
      design: { text: '设计部' },
    },
  },
  { dataIndex: 'city', title: '城市', valueType: 'text' },
]

const data = ref({
  name: '陈明远',
  phone: '13800138001',
  email: 'chen.my@example.com',
  department: 'engineering',
  city: '深圳',
})

async function handleSubmit(values: Record<string, unknown>) {
  await new Promise((resolve) => setTimeout(resolve, 800))
  data.value = { ...data.value, ...values }
  isEditing.value = false
  ElMessage.success('保存成功')
  return true
}
</script>

<template>
  <div style="margin-bottom: 16px">
    <ElButton v-if="!isEditing" type="primary" @click="isEditing = true">编辑</ElButton>
    <ElButton v-if="isEditing" @click="isEditing = false">取消</ElButton>
  </div>

  <ProForm
    v-if="isEditing"
    :fields="formFields"
    :initial-values="data"
    :on-submit="handleSubmit"
    :columns="2"
    layout="vertical"
    submit-text="保存"
  />

  <ProDescriptions v-else title="员工信息" :columns="columns" :data="data" :column="2" border />
</template>
