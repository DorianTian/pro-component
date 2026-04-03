<script setup lang="ts">
import { ref } from 'vue'
import { CheckboxGroup, CheckboxButton } from '@pro/checkbox'

const small = ref(['A'])
const defaultSize = ref(['A'])
const large = ref(['A'])
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <div>
      <label
        style="
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        "
        >小尺寸 small</label
      >
      <CheckboxGroup v-model="small" size="small">
        <CheckboxButton value="A">选项 A</CheckboxButton>
        <CheckboxButton value="B">选项 B</CheckboxButton>
        <CheckboxButton value="C">选项 C</CheckboxButton>
      </CheckboxGroup>
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
        >默认尺寸 default</label
      >
      <CheckboxGroup v-model="defaultSize">
        <CheckboxButton value="A">选项 A</CheckboxButton>
        <CheckboxButton value="B">选项 B</CheckboxButton>
        <CheckboxButton value="C">选项 C</CheckboxButton>
      </CheckboxGroup>
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
        >大尺寸 large</label
      >
      <CheckboxGroup v-model="large" size="large">
        <CheckboxButton value="A">选项 A</CheckboxButton>
        <CheckboxButton value="B">选项 B</CheckboxButton>
        <CheckboxButton value="C">选项 C</CheckboxButton>
      </CheckboxGroup>
    </div>
  </div>
</template>
