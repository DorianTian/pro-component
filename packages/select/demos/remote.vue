<script setup lang="ts">
import { ref } from 'vue'
import { Select } from '@pro/select'
import { ElOption } from 'element-plus'

interface CityOption {
  label: string
  value: string
}

const value = ref('')
const loading = ref(false)
const options = ref<CityOption[]>([])

const allCities: CityOption[] = [
  { label: '北京', value: 'beijing' },
  { label: '上海', value: 'shanghai' },
  { label: '广州', value: 'guangzhou' },
  { label: '深圳', value: 'shenzhen' },
  { label: '杭州', value: 'hangzhou' },
  { label: '成都', value: 'chengdu' },
  { label: '南京', value: 'nanjing' },
  { label: '武汉', value: 'wuhan' },
]

const handleSearch = (query: string) => {
  if (!query) {
    options.value = []
    return
  }
  loading.value = true
  setTimeout(() => {
    options.value = allCities.filter((c) => c.label.includes(query) || c.value.includes(query))
    loading.value = false
  }, 300)
}
</script>

<template>
  <div style="max-width: 380px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >远程搜索</label
    >
    <Select
      v-model="value"
      remote
      :remote-method="handleSearch"
      :loading="loading"
      placeholder="输入关键字搜索城市"
    >
      <ElOption v-for="opt in options" :key="opt.value" :label="opt.label" :value="opt.value" />
    </Select>
  </div>
</template>
