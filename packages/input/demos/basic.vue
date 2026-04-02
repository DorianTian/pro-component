<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@pro/input'
import { Search, Lock } from '@element-plus/icons-vue'

const basic = ref('')
const disabled = ref('Disabled content')
const textarea = ref('')
const password = ref('')
const prefixed = ref('')
const clearable = ref('Clear me')
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
      <Input v-model="basic" placeholder="Please input" />
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
      <Input v-model="disabled" disabled placeholder="Disabled" />
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
        >With prefix / suffix icon</label
      >
      <div style="display: flex; gap: 12px">
        <Input v-model="prefixed" placeholder="Search..." :prefix-icon="Search" />
        <Input
          v-model="password"
          type="password"
          show-password
          placeholder="Password"
          :prefix-icon="Lock"
        />
      </div>
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
        >Clearable (default)</label
      >
      <Input v-model="clearable" placeholder="Type and clear" />
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
        >Textarea</label
      >
      <Input v-model="textarea" type="textarea" :rows="3" placeholder="Enter multiline text..." />
    </div>
  </div>
</template>
