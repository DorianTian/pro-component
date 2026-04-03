<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@pro/input'
import { Lock } from '@element-plus/icons-vue'

const password = ref('')
</script>

<template>
  <div style="max-width: 380px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >密码输入</label
    >
    <Input
      v-model="password"
      type="password"
      show-password
      :prefix-icon="Lock"
      placeholder="请输入密码"
    />
  </div>
</template>
