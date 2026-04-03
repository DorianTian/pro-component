<script setup lang="ts">
import { Steps, Step } from '@pro/steps'
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 32px; max-width: 640px">
    <div>
      <span
        style="
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        "
      >
        finish-status="success"（默认完成状态）
      </span>
      <Steps :active="2" finish-status="success">
        <Step title="步骤一" />
        <Step title="步骤二" />
        <Step title="步骤三" />
      </Steps>
    </div>

    <div>
      <span
        style="
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        "
      >
        process-status="error"（当前步骤异常）
      </span>
      <Steps :active="1" process-status="error" finish-status="success">
        <Step title="数据导入" />
        <Step title="格式校验" />
        <Step title="入库完成" />
      </Steps>
    </div>
  </div>
</template>
