<script setup lang="ts">
import { ref } from 'vue'
import { ProDescriptions } from '@pro/descriptions'
import type { ProColumnDef } from '@pro/utils'
import { ElButton } from 'element-plus'

const columns: ProColumnDef[] = [
  { dataIndex: 'name', title: '姓名', valueType: 'text' },
  { dataIndex: 'email', title: '邮箱', valueType: 'text' },
  {
    dataIndex: 'status',
    title: '状态',
    valueType: 'select',
    valueEnum: {
      active: { text: '在职', status: 'success' },
    },
  },
  { dataIndex: 'salary', title: '薪资', valueType: 'money' },
]

const loading = ref(true)
const data = { name: '张三', email: 'zhangsan@example.com', status: 'active', salary: 25000 }

function toggleLoading() {
  loading.value = !loading.value
}
</script>

<template>
  <ElButton style="margin-bottom: 16px" @click="toggleLoading">切换加载状态</ElButton>
  <ProDescriptions title="加载状态" :columns="columns" :data="data" :loading="loading" />
</template>
