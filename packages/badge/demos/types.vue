<script setup lang="ts">
import { Badge } from '@pro/badge'
import { ElButton } from 'element-plus'
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 560px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      不同类型的徽章颜色
    </span>
    <div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap">
      <Badge :value="8" type="primary">
        <ElButton>主要</ElButton>
      </Badge>
      <Badge :value="8" type="success">
        <ElButton>成功</ElButton>
      </Badge>
      <Badge :value="8" type="warning">
        <ElButton>警告</ElButton>
      </Badge>
      <Badge :value="8" type="danger">
        <ElButton>危险</ElButton>
      </Badge>
      <Badge :value="8" type="info">
        <ElButton>信息</ElButton>
      </Badge>
    </div>
  </div>
</template>
