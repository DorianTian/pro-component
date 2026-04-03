<script setup lang="ts">
import { ref } from 'vue'
import { Cascader } from '@pro/cascader'

const disabledValue = ref(['guangdong', 'shenzhen', 'nanshan'])
const partialValue = ref<string[]>([])

const options = [
  {
    label: '广东省',
    value: 'guangdong',
    children: [
      {
        label: '深圳市',
        value: 'shenzhen',
        children: [
          { label: '南山区', value: 'nanshan' },
          { label: '福田区', value: 'futian' },
        ],
      },
      {
        label: '广州市',
        value: 'guangzhou',
        disabled: true,
        children: [
          { label: '天河区', value: 'tianhe' },
          { label: '越秀区', value: 'yuexiu' },
        ],
      },
    ],
  },
  {
    label: '浙江省',
    value: 'zhejiang',
    children: [
      {
        label: '杭州市',
        value: 'hangzhou',
        children: [{ label: '西湖区', value: 'xihu' }],
      },
    ],
  },
]
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
        >整体禁用</label
      >
      <Cascader v-model="disabledValue" :options="options" disabled placeholder="请选择" />
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
        >部分选项禁用（广州市）</label
      >
      <Cascader v-model="partialValue" :options="options" placeholder="请选择省/市/区" />
    </div>
  </div>
</template>
