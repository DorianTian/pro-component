<script setup lang="ts">
import { ref } from 'vue'
import type { ProColumnDef } from '@pro/utils'

const columns: ProColumnDef[] = [
  { title: 'Name', dataIndex: 'name', key: 'name', valueType: 'text' },
  { title: 'Age', dataIndex: 'age', key: 'age', valueType: 'digit' },
  { title: 'Status', dataIndex: 'status', key: 'status', valueType: 'text' },
]

const tableData = ref([
  { id: '1', name: 'Alice', age: 28, status: 'Active' },
  { id: '2', name: 'Bob', age: 34, status: 'Inactive' },
  { id: '3', name: 'Charlie', age: 22, status: 'Active' },
])
</script>

<template>
  <div style="padding: 24px; max-width: 1200px; margin: 0 auto">
    <h1>Pro Components Playground</h1>

    <h2>ProTable — Controlled Mode</h2>
    <ProTable :columns="columns" :data="tableData" row-key="id" :search="false" />

    <h2 style="margin-top: 32px">Raw el-table (sanity check)</h2>
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="name" label="Name" />
      <el-table-column prop="age" label="Age" />
      <el-table-column prop="status" label="Status" />
    </el-table>
  </div>
</template>
