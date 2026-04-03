<script setup lang="ts">
import { ref } from 'vue'
import { Rate } from '@pro/rate'

const value = ref(4)
</script>

<template>
  <div style="max-width: 380px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >自定义颜色</label
    >
    <Rate v-model="value" :colors="['#99A9BF', '#F7BA2A', '#FF9900']" />
    <p style="margin-top: 8px; font-size: 13px; color: #737373">低分灰蓝、中分金黄、高分橙色</p>
  </div>
</template>
