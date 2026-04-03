<script setup lang="ts">
import { ref } from 'vue'
import { AutoComplete } from '@pro/auto-complete'

const value = ref('')

const tags = [
  { value: 'JavaScript' },
  { value: 'TypeScript' },
  { value: 'Vue.js' },
  { value: 'React' },
  { value: 'Node.js' },
  { value: 'Go' },
  { value: 'Python' },
  { value: 'Rust' },
]

const querySearch = (query: string, cb: (results: Array<{ value: string }>) => void) => {
  const results = query
    ? tags.filter((t) => t.value.toLowerCase().includes(query.toLowerCase()))
    : tags
  cb(results)
}
</script>

<template>
  <div style="max-width: 380px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >技术标签（高亮首项）</label
    >
    <AutoComplete
      v-model="value"
      :fetch-suggestions="querySearch"
      highlight-first-item
      placeholder="输入技术名称"
    />
  </div>
</template>
