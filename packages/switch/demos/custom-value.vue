<script setup lang="ts">
import { ref } from 'vue'
import { Switch } from '@pro/switch'

const stringVal = ref('开启')
const numberVal = ref(1)
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 20px; max-width: 380px">
    <div>
      <label
        style="
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        "
        >字符串值：{{ stringVal }}</label
      >
      <Switch v-model="stringVal" active-value="开启" inactive-value="关闭" />
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
        >数字值：{{ numberVal }}</label
      >
      <Switch v-model="numberVal" :active-value="1" :inactive-value="0" />
    </div>
  </div>
</template>
