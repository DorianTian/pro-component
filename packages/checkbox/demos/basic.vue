<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox, CheckboxGroup, CheckboxButton } from '@pro/checkbox'

const fruits = ref(['apple'])
const sizes = ref(['medium'])
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
        >Checkbox group</label
      >
      <CheckboxGroup v-model="fruits">
        <Checkbox value="apple">Apple</Checkbox>
        <Checkbox value="banana">Banana</Checkbox>
        <Checkbox value="cherry">Cherry</Checkbox>
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
        >Checkbox button group</label
      >
      <CheckboxGroup v-model="sizes">
        <CheckboxButton value="small">Small</CheckboxButton>
        <CheckboxButton value="medium">Medium</CheckboxButton>
        <CheckboxButton value="large">Large</CheckboxButton>
      </CheckboxGroup>
    </div>
  </div>
</template>
