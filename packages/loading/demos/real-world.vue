<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ProLoading } from '@pro/loading'
import { ElButton } from 'element-plus'

interface UserItem {
  name: string
  department: string
  role: string
}

const isLoading = ref(true)
const isEmpty = ref(false)
const error = ref<string | null>(null)
const users = ref<UserItem[]>([])

function fetchData() {
  isLoading.value = true
  isEmpty.value = false
  error.value = null
  users.value = []

  setTimeout(() => {
    const random = Math.random()
    isLoading.value = false

    if (random < 0.33) {
      error.value = '请求超时，请检查网络连接'
    } else if (random < 0.5) {
      isEmpty.value = true
    } else {
      users.value = [
        { name: '张三', department: '数据平台组', role: '前端工程师' },
        { name: '李四', department: '风控中心', role: '算法工程师' },
        { name: '王五', department: '基础架构组', role: '后端工程师' },
      ]
    }
  }, 1500)
}

onMounted(fetchData)
</script>

<template>
  <div>
    <div style="margin-bottom: 12px">
      <ElButton size="small" @click="fetchData">重新请求（随机结果）</ElButton>
    </div>

    <ProLoading
      :loading="isLoading"
      :empty="isEmpty"
      :error="error"
      :skeleton-rows="3"
      empty-description="暂无成员数据"
      error-title="请求失败"
      @retry="fetchData"
    >
      <table style="width: 100%; border-collapse: collapse; font-size: 14px">
        <thead>
          <tr style="border-bottom: 1px solid #f0f0f0">
            <th style="padding: 10px 12px; text-align: left; color: #737373; font-weight: 500">
              姓名
            </th>
            <th style="padding: 10px 12px; text-align: left; color: #737373; font-weight: 500">
              部门
            </th>
            <th style="padding: 10px 12px; text-align: left; color: #737373; font-weight: 500">
              角色
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.name" style="border-bottom: 1px solid #fafafa">
            <td style="padding: 10px 12px; color: #262626">{{ user.name }}</td>
            <td style="padding: 10px 12px; color: #525252">{{ user.department }}</td>
            <td style="padding: 10px 12px; color: #525252">{{ user.role }}</td>
          </tr>
        </tbody>
      </table>
    </ProLoading>
  </div>
</template>
