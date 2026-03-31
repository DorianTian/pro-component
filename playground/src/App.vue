<script setup lang="ts">
import { ref } from 'vue'

const columns = [
  { title: 'Name', dataIndex: 'name', key: 'name', valueType: 'text' as const },
  { title: 'Age', dataIndex: 'age', key: 'age', valueType: 'digit' as const },
  { title: 'Status', dataIndex: 'status', key: 'status', valueType: 'text' as const,
    valueEnum: {
      active: { text: 'Active', status: 'success' },
      inactive: { text: 'Inactive', status: 'default' },
    },
  },
  { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', valueType: 'dateTime' as const },
]

const tableData = ref([
  { id: '1', name: 'Alice', age: 28, status: 'active', createdAt: '2026-03-15T10:30:00Z' },
  { id: '2', name: 'Bob', age: 34, status: 'inactive', createdAt: '2026-03-20T14:00:00Z' },
  { id: '3', name: 'Charlie', age: 22, status: 'active', createdAt: '2026-03-25T09:15:00Z' },
])

const formFields = [
  { title: 'Username', dataIndex: 'username', valueType: 'text' as const },
  { title: 'Email', dataIndex: 'email', valueType: 'text' as const },
]

const descColumns = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Role', dataIndex: 'role', key: 'role' },
  { title: 'Department', dataIndex: 'department', key: 'department' },
]

const descData = ref({ name: 'Alice', role: 'Engineer', department: 'Platform' })
</script>

<template>
  <div style="padding: 24px; max-width: 1200px; margin: 0 auto">
    <h1>Pro Components Playground</h1>

    <h2>ProTable</h2>
    <ProTable :columns="columns" :data="tableData" row-key="id" :search="false" />

    <h2 style="margin-top: 32px">ProForm</h2>
    <ProForm :fields="formFields" />

    <h2 style="margin-top: 32px">ProDescriptions</h2>
    <ProDescriptions :columns="descColumns" :data="descData" />
  </div>
</template>
