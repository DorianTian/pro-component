<script setup lang="ts">
import { ref } from 'vue'
import { Pagination } from '@pro/pagination'

const currentPage = ref(1)
const pageSize = ref(20)
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 24px; max-width: 640px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      完整功能分页
    </span>
    <Pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="500" />

    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      少量数据
    </span>
    <Pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="50" />

    <div style="font-size: 13px; color: #a3a3a3">
      当前页：{{ currentPage }}，每页：{{ pageSize }} 条
    </div>
  </div>
</template>
