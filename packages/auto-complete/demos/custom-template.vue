<script setup lang="ts">
import { ref } from 'vue'
import { AutoComplete } from '@pro/auto-complete'

interface LinkItem {
  value: string
  link: string
}

const value = ref('')

const links: LinkItem[] = [
  { value: 'Vue.js 官网', link: 'https://vuejs.org' },
  { value: 'Element Plus 文档', link: 'https://element-plus.org' },
  { value: 'Vite 官网', link: 'https://vitejs.dev' },
  { value: 'VitePress 文档', link: 'https://vitepress.dev' },
  { value: 'Pinia 文档', link: 'https://pinia.vuejs.org' },
]

const querySearch = (query: string, cb: (results: LinkItem[]) => void) => {
  const results = query
    ? links.filter((l) => l.value.toLowerCase().includes(query.toLowerCase()))
    : links
  cb(results)
}
</script>

<template>
  <div style="max-width: 380px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >搜索文档链接</label
    >
    <AutoComplete v-model="value" :fetch-suggestions="querySearch" placeholder="输入关键词搜索">
      <template #default="{ item }">
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span style="font-weight: 500">{{ item.value }}</span>
          <span style="font-size: 12px; color: #a3a3a3">{{ item.link }}</span>
        </div>
      </template>
    </AutoComplete>
  </div>
</template>
