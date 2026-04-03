<script setup lang="ts">
import { ref } from 'vue'
import { ProForm } from '@pro/form'
import { ElRadioGroup, ElRadioButton } from 'element-plus'

import type { ProFormItem } from '@pro/utils'

type LayoutType = 'horizontal' | 'vertical' | 'inline'
const layout = ref<LayoutType>('horizontal')
const columns = ref(3)

const fields: ProFormItem[] = [
  {
    type: 'group',
    title: '基本信息',
    collapsible: true,
    columns: 3,
    children: [
      { dataIndex: 'firstName', title: '名', valueType: 'text' },
      { dataIndex: 'lastName', title: '姓', valueType: 'text' },
      { dataIndex: 'phone', title: '手机号', valueType: 'text' },
      {
        dataIndex: 'gender',
        title: '性别',
        valueType: 'radio',
        valueEnum: { male: { text: '男' }, female: { text: '女' } },
      },
      { dataIndex: 'email', title: '邮箱', valueType: 'text', colSpan: 2 },
    ],
  },
  {
    type: 'group',
    title: '地址信息',
    collapsible: true,
    defaultCollapsed: true,
    columns: 2,
    children: [
      {
        dataIndex: 'province',
        title: '省份',
        valueType: 'select',
        valueEnum: {
          guangdong: { text: '广东' },
          zhejiang: { text: '浙江' },
          beijing: { text: '北京' },
        },
      },
      {
        dataIndex: 'city',
        title: '城市',
        valueType: 'select',
        dependencies: ['province'],
        resetOnDependencyChange: true,
        getFieldProps: (values) => {
          const cityMap: Record<string, Record<string, { text: string }>> = {
            guangdong: { shenzhen: { text: '深圳' }, guangzhou: { text: '广州' } },
            zhejiang: { hangzhou: { text: '杭州' }, ningbo: { text: '宁波' } },
            beijing: { haidian: { text: '海淀' }, chaoyang: { text: '朝阳' } },
          }
          return {
            disabled: !values.province,
          }
        },
        valueEnum: {
          shenzhen: { text: '深圳' },
          guangzhou: { text: '广州' },
          hangzhou: { text: '杭州' },
          ningbo: { text: '宁波' },
          haidian: { text: '海淀' },
          chaoyang: { text: '朝阳' },
        },
      },
      { dataIndex: 'address', title: '详细地址', valueType: 'textarea', colSpan: 'full' },
    ],
  },
]

async function handleSubmit(values: Record<string, unknown>) {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return true
}
</script>

<template>
  <div style="display: flex; gap: 16px; margin-bottom: 24px; align-items: center">
    <div>
      <span style="margin-right: 8px">布局：</span>
      <ElRadioGroup v-model="layout" size="small">
        <ElRadioButton value="horizontal">水平</ElRadioButton>
        <ElRadioButton value="vertical">垂直</ElRadioButton>
        <ElRadioButton value="inline">行内</ElRadioButton>
      </ElRadioGroup>
    </div>
  </div>

  <ProForm :layout="layout" :fields="fields" :columns="columns" :on-submit="handleSubmit" />
</template>
