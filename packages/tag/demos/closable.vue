<script setup lang="ts">
import { ref } from 'vue'
import { ProTag } from '@pro/tag'

const tags = ref(['前端开发', '后端开发', '产品设计', 'DevOps', '数据分析'])

function handleClose(tag: string) {
  tags.value = tags.value.filter((t) => t !== tag)
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      可关闭标签，点击关闭按钮移除
    </span>
    <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center">
      <ProTag v-for="tag in tags" :key="tag" closable status="info" @close="handleClose(tag)">
        {{ tag }}
      </ProTag>
      <span v-if="tags.length === 0" style="font-size: 13px; color: #a3a3a3"> 全部已移除 </span>
    </div>
  </div>
</template>
