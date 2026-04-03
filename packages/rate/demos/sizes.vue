<script setup lang="ts">
import { ref } from 'vue'
import { Rate } from '@pro/rate'

const small = ref(3)
const medium = ref(3)
const large = ref(3)
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
        >小尺寸</label
      >
      <Rate v-model="small" size="small" />
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
      <Rate v-model="medium" />
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
      <Rate v-model="large" size="large" />
    </div>
  </div>
</template>
