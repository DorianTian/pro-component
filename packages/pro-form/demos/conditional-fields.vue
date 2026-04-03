<script setup lang="ts">
import { ProForm } from '@pro/form'
import { ElMessage } from 'element-plus'

import type { ProFormItem } from '@pro/utils'

const fields: ProFormItem[] = [
  {
    type: 'group',
    title: '请假信息',
    columns: 2,
    children: [
      {
        dataIndex: 'leaveType',
        title: '请假类型',
        valueType: 'select',
        valueEnum: {
          annual: { text: '年假' },
          sick: { text: '病假' },
          personal: { text: '事假' },
          maternity: { text: '产假' },
        },
        rules: [{ required: true, message: '请选择请假类型' }],
      },
      {
        dataIndex: 'days',
        title: '请假天数',
        valueType: 'number',
        rules: [{ required: true, message: '请输入天数' }],
      },
      {
        dataIndex: 'startDate',
        title: '开始日期',
        valueType: 'date',
        rules: [{ required: true, message: '请选择开始日期' }],
      },
      {
        dataIndex: 'endDate',
        title: '结束日期',
        valueType: 'date',
        rules: [{ required: true, message: '请选择结束日期' }],
      },
    ],
  },
  {
    type: 'group',
    title: '补充材料',
    columns: 2,
    children: [
      {
        dataIndex: 'hospitalName',
        title: '医院名称',
        valueType: 'text',
        dependencies: ['leaveType'],
        visible: (v) => v.leaveType === 'sick',
        rules: [{ required: true, message: '病假需提供医院名称' }],
      },
      {
        dataIndex: 'diagnosis',
        title: '诊断证明',
        valueType: 'text',
        dependencies: ['leaveType'],
        visible: (v) => v.leaveType === 'sick',
      },
      {
        dataIndex: 'expectedDueDate',
        title: '预产期',
        valueType: 'date',
        dependencies: ['leaveType'],
        visible: (v) => v.leaveType === 'maternity',
        rules: [{ required: true, message: '请选择预产期' }],
      },
      {
        dataIndex: 'approverNote',
        title: '主管备注',
        valueType: 'text',
        dependencies: ['leaveType'],
        visible: (v) => v.leaveType === 'maternity',
      },
      {
        dataIndex: 'reason',
        title: '请假原因',
        valueType: 'textarea',
        colSpan: 'full',
      },
    ],
  },
]

async function handleSubmit(values: Record<string, unknown>) {
  await new Promise((resolve) => setTimeout(resolve, 800))
  ElMessage.success('请假申请已提交')
  return true
}
</script>

<template>
  <ProForm :fields="fields" :columns="2" :on-submit="handleSubmit" submit-text="提交申请" />
</template>
