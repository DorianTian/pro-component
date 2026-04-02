<script setup lang="ts">
import { ref } from 'vue'
import { Cascader } from '@pro/cascader'

const value = ref<string[]>([])

const options = [
  {
    label: 'Asia',
    value: 'asia',
    children: [
      {
        label: 'China',
        value: 'china',
        children: [
          { label: 'Beijing', value: 'beijing' },
          { label: 'Shanghai', value: 'shanghai' },
          { label: 'Shenzhen', value: 'shenzhen' },
        ],
      },
      {
        label: 'Japan',
        value: 'japan',
        children: [
          { label: 'Tokyo', value: 'tokyo' },
          { label: 'Osaka', value: 'osaka' },
        ],
      },
    ],
  },
  {
    label: 'Europe',
    value: 'europe',
    children: [
      {
        label: 'United Kingdom',
        value: 'uk',
        children: [{ label: 'London', value: 'london' }],
      },
      {
        label: 'France',
        value: 'france',
        children: [{ label: 'Paris', value: 'paris' }],
      },
    ],
  },
]
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
        >Basic cascader</label
      >
      <Cascader v-model="value" :options="options" placeholder="Select a city" />
    </div>
  </div>
</template>
