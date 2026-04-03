<script setup lang="ts">
import { Tooltip } from '@pro/tooltip'
import { ElButton } from 'element-plus'
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      展示 HTML 富文本内容
    </span>
    <div style="display: flex; gap: 12px">
      <Tooltip
        raw-content
        content="<strong>加粗文字</strong><br/><em>斜体文字</em><br/><span style='color:#67c23a'>绿色文字</span>"
      >
        <ElButton>HTML 内容</ElButton>
      </Tooltip>
      <Tooltip placement="top">
        <template #content>
          <div>任务名称：<strong>数据同步</strong></div>
          <div>状态：<span style="color: #67c23a">运行中</span></div>
          <div>进度：68%</div>
        </template>
        <ElButton>插槽内容</ElButton>
      </Tooltip>
    </div>
  </div>
</template>
