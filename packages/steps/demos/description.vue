<script setup lang="ts">
import { ref } from 'vue'
import { Steps, Step } from '@pro/steps'

const active = ref(1)
</script>

<template>
  <div style="max-width: 640px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      每个步骤附带描述信息
    </span>
    <Steps :active="active" finish-status="success">
      <Step title="需求评审" description="产品经理主持，确认功能范围" />
      <Step title="技术设计" description="架构师出方案，团队评审通过" />
      <Step title="开发测试" description="前后端并行开发，QA 介入测试" />
      <Step title="上线发布" description="灰度验证后全量部署" />
    </Steps>
  </div>
</template>
