<script setup lang="ts">
import { ref } from 'vue'
import { Steps, Step } from '@pro/steps'
import { ElButton } from 'element-plus'

const active = ref(1)

const prev = () => {
  if (active.value > 0) active.value--
}

const next = () => {
  if (active.value < 3) active.value++
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 24px; max-width: 640px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      水平步骤条
    </span>
    <Steps :active="active" finish-status="success">
      <Step title="提交申请" description="填写基本信息" />
      <Step title="部门审核" description="等待负责人审批" />
      <Step title="财务审核" description="财务确认打款" />
      <Step title="完成" description="流程结束" />
    </Steps>

    <div style="display: flex; gap: 8px">
      <ElButton :disabled="active <= 0" @click="prev">上一步</ElButton>
      <ElButton :disabled="active >= 3" type="primary" @click="next">下一步</ElButton>
    </div>

    <div style="font-size: 13px; color: #a3a3a3">当前步骤：{{ active }}</div>
  </div>
</template>
