<script setup lang="ts">
import { ref } from 'vue'
import { Popconfirm } from '@pro/popconfirm'
import { ElButton, ElMessage } from 'element-plus'

const count = ref(5)

const handleDelete = () => {
  count.value--
  ElMessage.warning(`已删除，剩余 ${count.value} 条`)
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      自定义按钮 — 修改确认/取消按钮的文案和类型
    </span>
    <div style="display: flex; gap: 12px; flex-wrap: wrap">
      <Popconfirm
        title="确定要删除这条记录吗？"
        confirm-button-text="确认删除"
        cancel-button-text="再想想"
        confirm-button-type="danger"
        @confirm="handleDelete"
      >
        <template #reference>
          <ElButton type="danger">删除记录 ({{ count }})</ElButton>
        </template>
      </Popconfirm>

      <Popconfirm
        title="是否启用该功能？"
        confirm-button-text="立即启用"
        cancel-button-text="暂不"
        confirm-button-type="success"
        @confirm="() => ElMessage.success('功能已启用')"
      >
        <template #reference>
          <ElButton type="success">启用功能</ElButton>
        </template>
      </Popconfirm>
    </div>
  </div>
</template>
