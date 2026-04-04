<script setup lang="ts">
import { ProSpin } from '@pro/loading'
</script>

<template>
  <div style="display: flex; align-items: center; gap: 24px">
    <ProSpin size="small" />
    <ProSpin />
    <ProSpin size="large" />
    <ProSpin tip="加载中..." />
  </div>
</template>
