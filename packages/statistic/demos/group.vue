<script setup lang="ts">
import { Statistic } from '@pro/statistic'
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 640px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      一组统计数值横向排列
    </span>
    <div
      style="display: flex; gap: 0; border: 1px solid #f0f0f0; border-radius: 8px; overflow: hidden"
    >
      <div
        v-for="(item, index) in [
          { title: '总浏览量', value: 432188 },
          { title: '总点赞数', value: 26891 },
          { title: '总评论数', value: 8123 },
          { title: '总分享数', value: 3450 },
        ]"
        :key="item.title"
        :style="{
          flex: 1,
          padding: '16px 20px',
          textAlign: 'center',
          borderRight: index < 3 ? '1px solid #f0f0f0' : 'none',
        }"
      >
        <Statistic :title="item.title" :value="item.value" />
      </div>
    </div>
  </div>
</template>
