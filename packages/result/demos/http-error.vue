<script setup lang="ts">
import { ProResult } from '@pro/result'
import { ElButton } from 'element-plus'
</script>

<template>
  <ProResult type="404">
    <template #extra>
      <ElButton type="primary">返回首页</ElButton>
      <ElButton>联系管理员</ElButton>
    </template>
  </ProResult>
</template>
