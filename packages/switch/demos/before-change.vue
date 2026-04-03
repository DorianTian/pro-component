<script setup lang="ts">
import { ref } from 'vue'
import { Switch } from '@pro/switch'

const value = ref(false)

function beforeChange(): Promise<boolean> {
  return new Promise((resolve) => {
    const confirmed = window.confirm('确定要切换开关状态吗？')
    resolve(confirmed)
  })
}
</script>

<template>
  <div style="max-width: 380px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >切换前确认</label
    >
    <Switch v-model="value" :before-change="beforeChange" />
    <p style="margin-top: 12px; font-size: 13px; color: #737373">切换前会弹出确认对话框</p>
  </div>
</template>
