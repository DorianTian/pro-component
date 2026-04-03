<script setup lang="ts">
import { ProResult } from '@pro/result'
import { ElButton } from 'element-plus'
</script>

<template>
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px">
    <div style="border: 1px solid #f0f0f0; border-radius: 8px; overflow: hidden">
      <ProResult type="403">
        <template #extra>
          <ElButton type="primary" size="small">申请权限</ElButton>
        </template>
      </ProResult>
    </div>
    <div style="border: 1px solid #f0f0f0; border-radius: 8px; overflow: hidden">
      <ProResult type="404">
        <template #extra>
          <ElButton type="primary" size="small">返回首页</ElButton>
        </template>
      </ProResult>
    </div>
    <div style="border: 1px solid #f0f0f0; border-radius: 8px; overflow: hidden">
      <ProResult type="500">
        <template #extra>
          <ElButton type="primary" size="small">刷新页面</ElButton>
        </template>
      </ProResult>
    </div>
  </div>
</template>
