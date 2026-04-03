<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@pro/input'

const small = ref('')
const medium = ref('')
const large = ref('')
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
        >小尺寸 small</label
      >
      <Input v-model="small" size="small" placeholder="小尺寸输入框" />
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
        >默认尺寸 default</label
      >
      <Input v-model="medium" placeholder="默认尺寸输入框" />
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
        >大尺寸 large</label
      >
      <Input v-model="large" size="large" placeholder="大尺寸输入框" />
    </div>
  </div>
</template>
