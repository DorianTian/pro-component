<script setup lang="ts">
import { ref } from 'vue'
import { ProDescriptions } from '@pro/descriptions'
import { ElRadioGroup, ElRadioButton } from 'element-plus'
import type { ProColumnDef } from '@pro/utils'

type SizeType = 'large' | 'default' | 'small'
const currentSize = ref<SizeType>('default')

const columns: ProColumnDef[] = [
  { dataIndex: 'name', title: '项目名称', valueType: 'text' },
  { dataIndex: 'version', title: '版本号', valueType: 'text' },
  { dataIndex: 'downloads', title: '下载量', valueType: 'number' },
  { dataIndex: 'lastPublish', title: '最近发布', valueType: 'date' },
  {
    dataIndex: 'status',
    title: '状态',
    valueType: 'select',
    valueEnum: {
      stable: { text: '稳定', status: 'success' },
      beta: { text: '测试', status: 'warning' },
    },
  },
  { dataIndex: 'license', title: '许可证', valueType: 'text' },
]

const data = {
  name: '@pro/components',
  version: '1.2.0',
  downloads: 58432,
  lastPublish: '2026-03-28',
  status: 'stable',
  license: 'MIT',
}
</script>

<template>
  <div style="margin-bottom: 16px">
    <span style="margin-right: 12px">尺寸：</span>
    <ElRadioGroup v-model="currentSize">
      <ElRadioButton value="large">大</ElRadioButton>
      <ElRadioButton value="default">默认</ElRadioButton>
      <ElRadioButton value="small">小</ElRadioButton>
    </ElRadioGroup>
  </div>

  <ProDescriptions title="不同尺寸" :columns="columns" :data="data" :size="currentSize" border />
</template>
