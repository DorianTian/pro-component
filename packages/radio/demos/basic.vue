<script setup lang="ts">
import { ref } from 'vue'
import { Radio, RadioGroup, RadioButton } from '@pro/radio'

const radioVal = ref('apple')
const buttonVal = ref('medium')
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
        >Radio group</label
      >
      <RadioGroup v-model="radioVal">
        <Radio value="apple">Apple</Radio>
        <Radio value="banana">Banana</Radio>
        <Radio value="cherry">Cherry</Radio>
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
        >Radio button group</label
      >
      <RadioGroup v-model="buttonVal">
        <RadioButton value="small">Small</RadioButton>
        <RadioButton value="medium">Medium</RadioButton>
        <RadioButton value="large">Large</RadioButton>
      </RadioGroup>
    </div>
  </div>
</template>
