<script setup lang="ts">
import { ref } from 'vue'
import { Switch } from '@pro/switch'

const small = ref(true)
const defaultSize = ref(true)
const large = ref(true)
</script>

<template>
  <div style="display: flex; align-items: center; gap: 24px; max-width: 480px">
    <div>
      <label
        style="
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        "
        >小尺寸</label
      >
      <Switch v-model="small" size="small" />
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
        >默认尺寸</label
      >
      <Switch v-model="defaultSize" />
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
        >大尺寸</label
      >
      <Switch v-model="large" size="large" />
    </div>
  </div>
</template>
