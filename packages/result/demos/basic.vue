<script setup lang="ts">
import { ProResult } from '@pro/result'
import { ElButton } from 'element-plus'
</script>

<template>
  <ProResult type="success">
    <template #extra>
      <ElButton type="primary">返回首页</ElButton>
    </template>
  </ProResult>
</template>
