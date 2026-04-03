<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@pro/input'

const domain = ref('example')
const url = ref('')
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
        >网站域名</label
      >
      <Input v-model="domain" placeholder="请输入域名">
        <template #prepend>https://</template>
        <template #append>.com</template>
      </Input>
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
        >接口地址</label
      >
      <Input v-model="url" placeholder="请输入 API 路径">
        <template #prepend>GET</template>
        <template #append>/api/v1</template>
      </Input>
    </div>
  </div>
</template>
