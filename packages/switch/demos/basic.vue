<script setup lang="ts">
import { ref } from 'vue'
import { Switch } from '@pro/switch'

const basic = ref(false)
const withText = ref(true)
const disabled = ref(true)
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
      <Switch v-model="basic" />
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
      <Switch v-model="withText" active-text="On" inactive-text="Off" />
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
        >Disabled</label
      >
      <Switch v-model="disabled" disabled />
    </div>
  </div>
</template>
