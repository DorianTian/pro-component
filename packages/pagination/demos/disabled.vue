<script setup lang="ts">
import { ref } from 'vue'
import { Pagination } from '@pro/pagination'

const currentPage = ref(3)
const pageSize = ref(10)
</script>

<template>
  <div style="max-width: 640px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      禁用状态，所有交互不可点击
    </span>
    <Pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="200"
      disabled
    />
  </div>
</template>
