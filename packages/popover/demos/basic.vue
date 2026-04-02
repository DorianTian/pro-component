<script setup lang="ts">
import { Popover } from '@pro/popover'
import { ElButton } from 'element-plus'
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      悬停触发
    </span>
    <Popover trigger="hover" content="鼠标悬停时显示的内容" width="200">
      <template #reference>
        <ElButton>Hover 触发</ElButton>
      </template>
    </Popover>

    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      点击触发
    </span>
    <Popover trigger="click" title="标题" content="点击按钮后显示的内容" width="240">
      <template #reference>
        <ElButton>Click 触发</ElButton>
      </template>
    </Popover>

    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      自定义内容
    </span>
    <Popover trigger="click" title="用户信息" width="280">
      <template #reference>
        <ElButton>查看详情</ElButton>
      </template>
      <div style="display: flex; flex-direction: column; gap: 4px; font-size: 13px">
        <p style="margin: 0"><strong>姓名：</strong>张三</p>
        <p style="margin: 0"><strong>部门：</strong>技术部</p>
        <p style="margin: 0"><strong>邮箱：</strong>zhangsan@example.com</p>
      </div>
    </Popover>
  </div>
</template>
