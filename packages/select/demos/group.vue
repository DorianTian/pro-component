<script setup lang="ts">
import { ref } from 'vue'
import { Select } from '@pro/select'
import { ElOption, ElOptionGroup } from 'element-plus'

const value = ref('')

const groups = [
  {
    label: '热门城市',
    options: [
      { label: '北京', value: 'beijing' },
      { label: '上海', value: 'shanghai' },
      { label: '深圳', value: 'shenzhen' },
    ],
  },
  {
    label: '其他城市',
    options: [
      { label: '成都', value: 'chengdu' },
      { label: '杭州', value: 'hangzhou' },
      { label: '武汉', value: 'wuhan' },
      { label: '西安', value: 'xian' },
    ],
  },
]
</script>

<template>
  <div style="max-width: 380px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >分组选择</label
    >
    <Select v-model="value" placeholder="请选择城市">
      <ElOptionGroup v-for="g in groups" :key="g.label" :label="g.label">
        <ElOption v-for="opt in g.options" :key="opt.value" :label="opt.label" :value="opt.value" />
      </ElOptionGroup>
    </Select>
  </div>
</template>
