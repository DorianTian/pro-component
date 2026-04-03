<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@pro/input'
import { Search, Calendar, Edit } from '@element-plus/icons-vue'

const search = ref('')
const date = ref('')
const remark = ref('')
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 380px">
    <div>
      <label
        style="
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        "
        >前缀图标</label
      >
      <Input v-model="search" :prefix-icon="Search" placeholder="搜索内容" />
    </div>
    <div>
      <label
        style="
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        "
        >后缀图标</label
      >
      <Input v-model="date" :suffix-icon="Calendar" placeholder="选择日期" />
    </div>
    <div>
      <label
        style="
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        "
        >前后缀图标组合</label
      >
      <Input
        v-model="remark"
        :prefix-icon="Edit"
        :suffix-icon="Search"
        placeholder="输入备注信息"
      />
    </div>
  </div>
</template>
