<script setup lang="ts">
import { ref } from 'vue'
import { Pagination } from '@pro/pagination'

const currentPage = ref(1)
const pageSize = ref(5)
</script>

<template>
  <div style="max-width: 640px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      自定义每页条数选项
    </span>
    <Pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="100"
      :page-sizes="[5, 15, 30, 60]"
    />
  </div>
</template>
