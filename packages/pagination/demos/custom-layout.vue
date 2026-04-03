<script setup lang="ts">
import { ref } from 'vue'
import { Pagination } from '@pro/pagination'

const currentPage = ref(1)
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
        仅翻页按钮
      </span>
      <Pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="200"
        layout="prev, pager, next"
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
        简洁模式：前后翻页 + 总条数
      </span>
      <Pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="200"
        layout="total, prev, next"
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
        带跳转器和条数切换
      </span>
      <Pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="200"
        layout="sizes, prev, pager, next, jumper"
      />
    </div>
  </div>
</template>
