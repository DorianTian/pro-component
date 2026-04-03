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
      简洁风格，无连接线，适合紧凑场景
    </span>
    <Steps :active="active" simple>
      <Step title="选择商品" />
      <Step title="确认订单" />
      <Step title="支付完成" />
    </Steps>
  </div>
</template>
