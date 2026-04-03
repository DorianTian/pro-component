<script setup lang="ts">
import { ref } from 'vue'
import { Steps, Step } from '@pro/steps'

const active = ref(0)

const stepTitles = ['选择套餐', '填写信息', '确认支付', '开通完成']

function handleChange(index: number) {
  active.value = index
}
</script>

<template>
  <div style="max-width: 640px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      点击步骤可跳转，适合非线性流程
    </span>
    <Steps :active="active" finish-status="success" @change="handleChange">
      <Step v-for="(title, i) in stepTitles" :key="i" :title="title" />
    </Steps>

    <div
      style="
        margin-top: 16px;
        padding: 16px;
        background: #fafafa;
        border-radius: 6px;
        font-size: 13px;
        color: #525252;
      "
    >
      当前：{{ stepTitles[active] }}
    </div>
  </div>
</template>
