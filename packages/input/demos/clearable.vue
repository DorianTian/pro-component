<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@pro/input'

const enabled = ref('鼠标悬停可见清除按钮')
const disabled = ref('手动关闭 clearable')
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
        >默认可清除</label
      >
      <Input v-model="enabled" placeholder="默认启用 clearable" />
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
        >关闭可清除</label
      >
      <Input v-model="disabled" :clearable="false" placeholder="显式关闭 clearable" />
    </div>
  </div>
</template>
