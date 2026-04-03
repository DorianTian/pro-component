<script setup lang="ts">
import { ref } from 'vue'
import { Select } from '@pro/select'
import { ElOption } from 'element-plus'

const value = ref('')

const cities = [
  { label: '北京', value: 'beijing', code: '010', population: '2189万' },
  { label: '上海', value: 'shanghai', code: '021', population: '2487万' },
  { label: '深圳', value: 'shenzhen', code: '0755', population: '1756万' },
  { label: '广州', value: 'guangzhou', code: '020', population: '1881万' },
  { label: '杭州', value: 'hangzhou', code: '0571', population: '1237万' },
]
</script>

<template>
  <div style="max-width: 380px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >自定义选项内容</label
    >
    <Select v-model="value" placeholder="请选择城市">
      <ElOption v-for="city in cities" :key="city.value" :label="city.label" :value="city.value">
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>{{ city.label }}</span>
          <span style="font-size: 12px; color: #a3a3a3">
            {{ city.code }} · {{ city.population }}
          </span>
        </div>
      </ElOption>
    </Select>
  </div>
</template>
