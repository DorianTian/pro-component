<script setup lang="ts">
import { h } from 'vue'
import { ProForm, ProFormDependency } from '@pro/form'
import { ElMessage, ElAlert } from 'element-plus'
import type { ProFieldDef } from '@pro/utils'

const fields: ProFieldDef[] = [
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
    rules: [{ required: true, message: '请选择请假类型', trigger: 'change' }],
  },
  { dataIndex: 'startDate', title: '开始日期', valueType: 'date' },
  { dataIndex: 'endDate', title: '结束日期', valueType: 'date' },
  { dataIndex: 'reason', title: '请假原因', valueType: 'textarea' },
]

async function handleSubmit(values: Record<string, unknown>) {
  await new Promise((resolve) => setTimeout(resolve, 800))
  ElMessage.success(`申请已提交: ${JSON.stringify(values)}`)
  return true
}
</script>

<template>
  <ProForm :fields="fields" :on-submit="handleSubmit" submit-text="提交申请">
    <template #default>
      <ProFormDependency :name="['leaveType']">
        <template #default="{ values }">
          <ElAlert
            v-if="values.leaveType === 'sick'"
            title="病假需要上传医院证明，提交后请联系 HR 补充材料"
            type="warning"
            show-icon
            :closable="false"
            style="margin-bottom: 16px"
          />
          <ElAlert
            v-if="values.leaveType === 'maternity'"
            title="产假审批需经部门主管和 HR 双重审核，预计 3 个工作日"
            type="info"
            show-icon
            :closable="false"
            style="margin-bottom: 16px"
          />
        </template>
      </ProFormDependency>
    </template>
  </ProForm>
</template>
