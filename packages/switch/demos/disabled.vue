<script setup lang="ts">
import { ref } from 'vue'
import { Switch } from '@pro/switch'

const a = ref(true)
const b = ref(false)
</script>

<template>
  <div style="display: flex; gap: 24px; max-width: 380px">
    <div>
      <label
        style="
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        "
        >开启且禁用</label
      >
      <Switch v-model="a" disabled />
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
        >关闭且禁用</label
      >
      <Switch v-model="b" disabled />
    </div>
  </div>
</template>
