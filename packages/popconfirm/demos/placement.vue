<script setup lang="ts">
import { Popconfirm } from '@pro/popconfirm'
import { ElButton, ElMessage } from 'element-plus'

const handleConfirm = () => {
  ElMessage.success('已确认')
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 600px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      弹出位置 — 支持 12 种方向
    </span>
    <div style="display: flex; gap: 8px; justify-content: center">
      <Popconfirm title="确定？" placement="top-start" @confirm="handleConfirm">
        <template #reference>
          <ElButton size="small">上左</ElButton>
        </template>
      </Popconfirm>
      <Popconfirm title="确定？" placement="top" @confirm="handleConfirm">
        <template #reference>
          <ElButton size="small">上方</ElButton>
        </template>
      </Popconfirm>
      <Popconfirm title="确定？" placement="top-end" @confirm="handleConfirm">
        <template #reference>
          <ElButton size="small">上右</ElButton>
        </template>
      </Popconfirm>
    </div>
    <div style="display: flex; gap: 8px; justify-content: space-between">
      <Popconfirm title="确定？" placement="left" @confirm="handleConfirm">
        <template #reference>
          <ElButton size="small">左侧</ElButton>
        </template>
      </Popconfirm>
      <Popconfirm title="确定？" placement="right" @confirm="handleConfirm">
        <template #reference>
          <ElButton size="small">右侧</ElButton>
        </template>
      </Popconfirm>
    </div>
    <div style="display: flex; gap: 8px; justify-content: center">
      <Popconfirm title="确定？" placement="bottom-start" @confirm="handleConfirm">
        <template #reference>
          <ElButton size="small">下左</ElButton>
        </template>
      </Popconfirm>
      <Popconfirm title="确定？" placement="bottom" @confirm="handleConfirm">
        <template #reference>
          <ElButton size="small">下方</ElButton>
        </template>
      </Popconfirm>
      <Popconfirm title="确定？" placement="bottom-end" @confirm="handleConfirm">
        <template #reference>
          <ElButton size="small">下右</ElButton>
        </template>
      </Popconfirm>
    </div>
  </div>
</template>
