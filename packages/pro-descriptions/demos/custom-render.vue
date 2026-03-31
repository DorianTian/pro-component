<script setup lang="ts">
import { h } from 'vue'
import { ProDescriptions } from '@pro/descriptions'
import { ElProgress, ElLink } from 'element-plus'
import type { ProColumnDef } from '@pro/utils'

const columns: ProColumnDef[] = [
  { dataIndex: 'name', title: '课程名称', valueType: 'text' },
  {
    dataIndex: 'progress',
    title: '完成进度',
    valueType: 'progress',
    descriptionsRender: (value) => h(ElProgress, { percentage: Number(value), strokeWidth: 12 }),
  },
  {
    dataIndex: 'url',
    title: '链接',
    valueType: 'text',
    descriptionsRender: (value) =>
      h(ElLink, { href: String(value), type: 'primary' }, () => '查看课程'),
  },
  { dataIndex: 'score', title: '评分', valueType: 'rate' },
]

const data = { name: 'Vue 3 实战进阶', progress: 68, url: 'https://example.com', score: 4.5 }
</script>

<template>
  <ProDescriptions title="自定义渲染" :columns="columns" :data="data" :column="2" />
</template>
