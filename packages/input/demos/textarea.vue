<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@pro/input'

const content = ref('')
const autosize = ref('')
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <div>
      <label
        style="
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        "
        >固定行数</label
      >
      <Input v-model="content" type="textarea" :rows="3" placeholder="请输入详细描述..." />
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
        >自适应高度</label
      >
      <Input
        v-model="autosize"
        type="textarea"
        :autosize="{ minRows: 2, maxRows: 6 }"
        placeholder="自动调整高度，最小 2 行，最大 6 行"
      />
    </div>
  </div>
</template>
