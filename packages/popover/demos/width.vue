<script setup lang="ts">
import { Popover } from '@pro/popover'
import { ElButton } from 'element-plus'
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      自定义宽度和丰富内容
    </span>
    <Popover trigger="click" title="用户信息" width="300">
      <template #reference>
        <ElButton>查看详情</ElButton>
      </template>
      <div style="display: flex; flex-direction: column; gap: 8px; font-size: 13px">
        <div style="display: flex; justify-content: space-between">
          <span style="color: #737373">姓名</span>
          <span style="color: #171717">张三</span>
        </div>
        <div style="display: flex; justify-content: space-between">
          <span style="color: #737373">部门</span>
          <span style="color: #171717">技术部</span>
        </div>
        <div style="display: flex; justify-content: space-between">
          <span style="color: #737373">职位</span>
          <span style="color: #171717">高级工程师</span>
        </div>
        <div style="display: flex; justify-content: space-between">
          <span style="color: #737373">邮箱</span>
          <span style="color: #171717">zhangsan@example.com</span>
        </div>
      </div>
    </Popover>
  </div>
</template>
