<script setup lang="ts">
import { ref } from 'vue'
import { Rate } from '@pro/rate'

const basic = ref(3)
const half = ref(3.5)
const colored = ref(4)
const withText = ref(3)

const texts = ['Terrible', 'Bad', 'Normal', 'Good', 'Excellent']
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 600px">
    <div>
      <label
        style="
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        "
        >Basic</label
      >
      <Rate v-model="basic" />
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
        >Half star</label
      >
      <Rate v-model="half" allow-half />
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
        >Custom colors</label
      >
      <Rate v-model="colored" :colors="['#99A9BF', '#F7BA2A', '#FF9900']" />
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
        >With text</label
      >
      <Rate v-model="withText" show-text :texts="texts" />
    </div>
  </div>
</template>
