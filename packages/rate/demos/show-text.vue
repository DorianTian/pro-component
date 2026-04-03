<script setup lang="ts">
import { ref } from 'vue'
import { Rate } from '@pro/rate'

const value = ref(3)
const texts = ['极差', '失望', '一般', '满意', '惊喜']
</script>

<template>
  <div style="max-width: 380px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >辅助文字</label
    >
    <Rate v-model="value" show-text :texts="texts" />
  </div>
</template>
