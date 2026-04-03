<script setup lang="ts">
import { ref } from 'vue'
import { Steps, Step } from '@pro/steps'

const active = ref(2)
</script>

<template>
  <div style="max-width: 640px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      标题和描述居中对齐
    </span>
    <Steps :active="active" align-center finish-status="success">
      <Step title="草稿" description="编辑中" />
      <Step title="审核中" description="等待审批" />
      <Step title="已通过" description="审核完成" />
      <Step title="已归档" description="流程结束" />
    </Steps>
  </div>
</template>
