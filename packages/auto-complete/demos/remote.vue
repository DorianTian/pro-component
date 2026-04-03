<script setup lang="ts">
import { ref } from 'vue'
import { AutoComplete } from '@pro/auto-complete'

const value = ref('')
const loading = ref(false)

const allUsers = [
  { value: '张三 — 前端工程师' },
  { value: '李四 — 后端工程师' },
  { value: '王五 — 产品经理' },
  { value: '赵六 — UI 设计师' },
  { value: '张伟 — 数据分析师' },
  { value: '李明 — 测试工程师' },
  { value: '王芳 — 项目经理' },
]

const querySearch = (query: string, cb: (results: Array<{ value: string }>) => void) => {
  loading.value = true
  setTimeout(() => {
    const results = query ? allUsers.filter((u) => u.value.includes(query)) : allUsers
    cb(results)
    loading.value = false
  }, 600)
}
</script>

<template>
  <div style="max-width: 380px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >搜索团队成员（模拟远程）</label
    >
    <AutoComplete
      v-model="value"
      :fetch-suggestions="querySearch"
      :loading="loading"
      placeholder="输入姓名搜索"
    />
  </div>
</template>
