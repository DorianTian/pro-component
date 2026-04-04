<script setup lang="ts">
import { ref } from 'vue'
import { ProSpin } from '@pro/loading'

const loading = ref(true)

const data = [
  { id: 1, name: '陈明远', role: '前端工程师', status: '在职' },
  { id: 2, name: '林思雨', role: '后端工程师', status: '在职' },
  { id: 3, name: '王浩然', role: '产品经理', status: '离职' },
]
</script>

<template>
  <div style="max-width: 600px">
    <div style="margin-bottom: 12px">
      <el-switch v-model="loading" active-text="加载中" inactive-text="加载完成" />
    </div>
    <ProSpin :spinning="loading">
      <el-table :data="data" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="role" label="角色" />
        <el-table-column prop="status" label="状态" />
      </el-table>
    </ProSpin>
  </div>
</template>
