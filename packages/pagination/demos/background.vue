<script setup lang="ts">
import { ref } from 'vue'
import { Pagination } from '@pro/pagination'

const currentPage = ref(1)
const pageSize = ref(20)
</script>

<template>
  <div style="max-width: 640px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      页码按钮带背景色，视觉更突出
    </span>
    <Pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="500"
      background
    />
  </div>
</template>
