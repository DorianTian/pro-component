<script setup lang="ts">
import { ProResult } from '@pro/result'
import { ElButton } from 'element-plus'
</script>

<template>
  <ProResult title="付款成功" sub-title="订单号 2024031500123，共计 ¥1,280.00。">
    <template #icon>
      <div style="font-size: 64px; line-height: 1">🎉</div>
    </template>
    <template #extra>
      <ElButton type="primary">查看订单</ElButton>
    </template>
  </ProResult>
</template>
