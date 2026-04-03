<script setup lang="ts">
import { ref } from 'vue'
import { Cascader } from '@pro/cascader'

const value = ref<string[]>([])

interface LazyNode {
  level: number
  value: string
}

interface ResolveCallback {
  (nodes: Array<{ label: string; value: string; leaf?: boolean }>): void
}

const provinces = [
  { label: '广东省', value: 'guangdong' },
  { label: '浙江省', value: 'zhejiang' },
  { label: '北京市', value: 'beijing' },
]

const cityMap: Record<string, Array<{ label: string; value: string }>> = {
  guangdong: [
    { label: '深圳市', value: 'shenzhen' },
    { label: '广州市', value: 'guangzhou' },
  ],
  zhejiang: [
    { label: '杭州市', value: 'hangzhou' },
    { label: '宁波市', value: 'ningbo' },
  ],
  beijing: [
    { label: '朝阳区', value: 'chaoyang' },
    { label: '海淀区', value: 'haidian' },
  ],
}

const handleLazyLoad = (node: LazyNode, resolve: ResolveCallback) => {
  setTimeout(() => {
    if (node.level === 0) {
      resolve(provinces)
    } else if (node.level === 1) {
      const cities = cityMap[node.value] ?? []
      resolve(cities.map((c) => ({ ...c, leaf: true })))
    }
  }, 500)
}
</script>

<template>
  <div style="max-width: 380px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >动态加载子级</label
    >
    <Cascader
      v-model="value"
      :props="{ lazy: true, lazyLoad: handleLazyLoad }"
      placeholder="点击后异步加载"
    />
  </div>
</template>
