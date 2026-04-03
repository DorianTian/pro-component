<script setup lang="ts">
import { Popconfirm } from '@pro/popconfirm'
import { ElButton, ElMessage } from 'element-plus'

const handleConfirm = () => {
  ElMessage.success('已确认')
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      自定义图标 — 修改图标和图标颜色
    </span>
    <div style="display: flex; gap: 12px; flex-wrap: wrap">
      <Popconfirm title="确定要提交吗？" icon-color="#67C23A" @confirm="handleConfirm">
        <template #reference>
          <ElButton type="success">绿色图标</ElButton>
        </template>
      </Popconfirm>

      <Popconfirm title="此操作不可撤销！" icon-color="#F56C6C" @confirm="handleConfirm">
        <template #reference>
          <ElButton type="danger">红色图标</ElButton>
        </template>
      </Popconfirm>

      <Popconfirm title="确定要修改配置？" icon-color="#E6A23C" @confirm="handleConfirm">
        <template #reference>
          <ElButton type="warning">橙色图标</ElButton>
        </template>
      </Popconfirm>
    </div>
  </div>
</template>
