<script setup lang="ts">
import { ref } from 'vue'
import { Pagination } from '@pro/pagination'

const currentPage = ref(1)
const pageSize = ref(20)
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
        只有一页时自动隐藏分页器
      </span>
      <Pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="10"
        hide-on-single-page
      />
      <div style="font-size: 13px; color: #a3a3a3; margin-top: 8px">
        总共 10 条（仅 1 页），分页器已隐藏
      </div>
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
        超过一页时正常显示
      </span>
      <Pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="100"
        hide-on-single-page
      />
    </div>
  </div>
</template>
