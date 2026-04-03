<script setup lang="ts">
import { ref } from 'vue'
import { RadioGroup, RadioButton } from '@pro/radio'

const small = ref('A')
const defaultSize = ref('A')
const large = ref('A')
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
      <RadioGroup v-model="small" size="small">
        <RadioButton value="A">选项 A</RadioButton>
        <RadioButton value="B">选项 B</RadioButton>
        <RadioButton value="C">选项 C</RadioButton>
      </RadioGroup>
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
      <RadioGroup v-model="defaultSize">
        <RadioButton value="A">选项 A</RadioButton>
        <RadioButton value="B">选项 B</RadioButton>
        <RadioButton value="C">选项 C</RadioButton>
      </RadioGroup>
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
      <RadioGroup v-model="large" size="large">
        <RadioButton value="A">选项 A</RadioButton>
        <RadioButton value="B">选项 B</RadioButton>
        <RadioButton value="C">选项 C</RadioButton>
      </RadioGroup>
    </div>
  </div>
</template>
