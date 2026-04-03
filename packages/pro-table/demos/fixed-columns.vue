<script setup lang="ts">
import { ProTable } from '@pro/table'
import type { ProColumnDef } from '@pro/utils'

interface EmployeeRecord {
  id: number
  name: string
  department: string
  position: string
  phone: string
  email: string
  city: string
  joinDate: string
  salary: number
  status: string
}

const columns: ProColumnDef<EmployeeRecord>[] = [
  { dataIndex: 'id', title: 'ID', width: 80, fixed: 'left' },
  { dataIndex: 'name', title: '姓名', width: 100, fixed: 'left' },
  { dataIndex: 'department', title: '部门', width: 120 },
  { dataIndex: 'position', title: '职位', width: 140 },
  { dataIndex: 'phone', title: '手机号', width: 140 },
  { dataIndex: 'email', title: '邮箱', width: 200, ellipsis: true },
  { dataIndex: 'city', title: '城市', width: 100 },
  { dataIndex: 'joinDate', title: '入职日期', valueType: 'date', width: 140 },
  { dataIndex: 'salary', title: '薪资', valueType: 'money', width: 120 },
  {
    dataIndex: 'status',
    title: '状态',
    width: 100,
    fixed: 'right',
    valueType: 'select',
    valueEnum: {
      active: { text: '在职', status: 'success' },
      resigned: { text: '离职', status: 'danger' },
    },
  },
]

const data: EmployeeRecord[] = [
  {
    id: 1,
    name: '陈明远',
    department: '工程部',
    position: '高级前端工程师',
    phone: '13800138001',
    email: 'chen.my@example.com',
    city: '深圳',
    joinDate: '2022-03-15',
    salary: 35000,
    status: 'active',
  },
  {
    id: 2,
    name: '林思雨',
    department: '产品部',
    position: '产品经理',
    phone: '13800138002',
    email: 'lin.sy@example.com',
    city: '北京',
    joinDate: '2021-08-01',
    salary: 30000,
    status: 'active',
  },
  {
    id: 3,
    name: '王浩然',
    department: '设计部',
    position: 'UI 设计师',
    phone: '13800138003',
    email: 'wang.hr@example.com',
    city: '上海',
    joinDate: '2023-01-10',
    salary: 25000,
    status: 'resigned',
  },
  {
    id: 4,
    name: '赵芷晴',
    department: '市场部',
    position: '市场总监',
    phone: '13800138004',
    email: 'zhao.zq@example.com',
    city: '广州',
    joinDate: '2020-06-20',
    salary: 40000,
    status: 'active',
  },
]
</script>

<template>
  <ProTable
    :columns="columns"
    :data="data"
    header-title="固定列"
    row-key="id"
    :search="false"
    :pagination="false"
  />
</template>
