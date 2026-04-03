<script setup lang="ts">
import { ref } from 'vue'
import { ProDescriptions } from '@pro/descriptions'
import { ElRadioGroup, ElRadioButton } from 'element-plus'
import type { ProColumnDef } from '@pro/utils'

const columnCount = ref(3)

const columns: ProColumnDef[] = [
  { dataIndex: 'name', title: '姓名', valueType: 'text' },
  { dataIndex: 'department', title: '部门', valueType: 'text' },
  { dataIndex: 'position', title: '职位', valueType: 'text' },
  { dataIndex: 'phone', title: '电话', valueType: 'text' },
  { dataIndex: 'email', title: '邮箱', valueType: 'text' },
  { dataIndex: 'joinDate', title: '入职日期', valueType: 'date' },
  { dataIndex: 'salary', title: '月薪', valueType: 'money' },
  { dataIndex: 'city', title: '城市', valueType: 'text' },
]

const data = {
  name: '陈明远',
  department: '工程部',
  position: '高级前端工程师',
  phone: '13800138001',
  email: 'chen.my@example.com',
  joinDate: '2022-03-15',
  salary: 35000,
  city: '深圳',
}
</script>

<template>
  <div style="margin-bottom: 16px">
    <span style="margin-right: 12px">列数：</span>
    <ElRadioGroup v-model="columnCount">
      <ElRadioButton :value="1">1 列</ElRadioButton>
      <ElRadioButton :value="2">2 列</ElRadioButton>
      <ElRadioButton :value="3">3 列</ElRadioButton>
      <ElRadioButton :value="4">4 列</ElRadioButton>
    </ElRadioGroup>
  </div>

  <ProDescriptions title="列数控制" :columns="columns" :data="data" :column="columnCount" border />
</template>
