<script setup lang="ts">
import { ref } from 'vue'
import { Drawer } from '@pro/drawer'
import { ElButton, ElTag } from 'element-plus'

const visible = ref(false)
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      自定义头部和底部 — 通过 header / footer 插槽自定义
    </span>
    <ElButton @click="visible = true">自定义头尾</ElButton>
    <Drawer v-model="visible" size="400px">
      <template #header>
        <div style="display: flex; align-items: center; gap: 10px">
          <span style="font-size: 16px; font-weight: 600">工单 #1024</span>
          <ElTag type="warning" size="small">处理中</ElTag>
        </div>
      </template>
      <div style="line-height: 1.8; color: #666">
        <p>报告人：李四</p>
        <p>类型：系统异常</p>
        <p>描述：生产环境 API 响应时间异常升高，P99 超过 3s。</p>
        <p>创建时间：2026-04-03 09:15:00</p>
      </div>
      <template #footer>
        <div style="display: flex; gap: 8px">
          <ElButton @click="visible = false">关闭</ElButton>
          <ElButton type="warning">转交</ElButton>
          <ElButton type="primary">处理完成</ElButton>
        </div>
      </template>
    </Drawer>
  </div>
</template>
