<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { ProTag } from '@pro/tag'
import { ElButton, ElInput } from 'element-plus'

const tags = ref(['标签一', '标签二', '标签三'])
const inputVisible = ref(false)
const inputValue = ref('')
const inputRef = ref<InstanceType<typeof ElInput>>()

function showInput() {
  inputVisible.value = true
  nextTick(() => {
    inputRef.value?.input?.focus()
  })
}

function handleInputConfirm() {
  const val = inputValue.value.trim()
  if (val && !tags.value.includes(val)) {
    tags.value.push(val)
  }
  inputVisible.value = false
  inputValue.value = ''
}

function handleClose(tag: string) {
  tags.value = tags.value.filter((t) => t !== tag)
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      动态添加和移除标签
    </span>
    <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center">
      <ProTag v-for="tag in tags" :key="tag" closable status="info" @close="handleClose(tag)">
        {{ tag }}
      </ProTag>
      <ElInput
        v-if="inputVisible"
        ref="inputRef"
        v-model="inputValue"
        size="small"
        style="width: 100px"
        @keyup.enter="handleInputConfirm"
        @blur="handleInputConfirm"
      />
      <ElButton v-else size="small" @click="showInput">+ 新标签</ElButton>
    </div>
  </div>
</template>
