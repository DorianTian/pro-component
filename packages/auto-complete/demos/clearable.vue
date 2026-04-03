<script setup lang="ts">
import { ref } from 'vue'
import { AutoComplete } from '@pro/auto-complete'

const value = ref('')

const cities = [
  { value: '北京' },
  { value: '上海' },
  { value: '广州' },
  { value: '深圳' },
  { value: '杭州' },
  { value: '成都' },
  { value: '南京' },
]

const querySearch = (query: string, cb: (results: Array<{ value: string }>) => void) => {
  const results = query ? cities.filter((c) => c.value.includes(query)) : cities
  cb(results)
}
</script>

<template>
  <div style="max-width: 380px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >选择城市（可清除）</label
    >
    <AutoComplete
      v-model="value"
      :fetch-suggestions="querySearch"
      clearable
      placeholder="输入城市名称"
    />
  </div>
</template>
