<script setup lang="ts">
import { ref } from 'vue'
import { Steps, Step } from '@pro/steps'

const active = ref(1)
</script>

<template>
  <div style="max-width: 360px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      竖直方向步骤条，适合侧边栏导航
    </span>
    <Steps :active="active" direction="vertical" finish-status="success" style="height: 280px">
      <Step title="创建账户" description="注册并验证邮箱" />
      <Step title="完善资料" description="填写个人基本信息" />
      <Step title="身份认证" description="上传证件照片审核" />
      <Step title="开通成功" description="账户即刻可用" />
    </Steps>
  </div>
</template>
