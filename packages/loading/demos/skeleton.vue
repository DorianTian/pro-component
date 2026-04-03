<script setup lang="ts">
import { ref } from 'vue'
import { ProLoading } from '@pro/loading'
import { ElSlider } from 'element-plus'

const rows = ref(6)
</script>

<template>
  <div>
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px">
      <label style="font-size: 13px; color: #737373; font-weight: 500; white-space: nowrap">
        骨架屏行数：{{ rows }}
      </label>
      <ElSlider v-model="rows" :min="1" :max="12" :step="1" style="flex: 1; max-width: 200px" />
    </div>

    <ProLoading :loading="true" :skeleton-rows="rows" />
  </div>
</template>
