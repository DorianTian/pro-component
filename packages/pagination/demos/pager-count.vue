<script setup lang="ts">
import { ref } from 'vue'
import { Pagination } from '@pro/pagination'

const currentPage = ref(5)
const pageSize = ref(10)
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 24px; max-width: 640px">
    <div>
      <span
        style="
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        "
      >
        pager-count=5（少量页码按钮）
      </span>
      <Pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="500"
        :pager-count="5"
        background
      />
    </div>

    <div>
      <span
        style="
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        "
      >
        pager-count=11（更多页码按钮）
      </span>
      <Pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="500"
        :pager-count="11"
        background
      />
    </div>
  </div>
</template>
