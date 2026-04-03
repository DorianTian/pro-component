<script setup lang="ts">
import { ref } from 'vue'
import { Drawer } from '@pro/drawer'
import { ElButton } from 'element-plus'

const visible = ref(false)
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      无头部抽屉 — 设置 with-header 为 false 隐藏标题栏
    </span>
    <ElButton @click="visible = true">无标题抽屉</ElButton>
    <Drawer v-model="visible" :with-header="false" size="360px">
      <div style="padding: 20px 0; color: #666">
        <p style="font-size: 15px; font-weight: 500; color: #333; margin-bottom: 12px">系统公告</p>
        <p>本系统将于 2026 年 4 月 5 日 02:00-06:00 进行维护升级，届时服务将暂停。</p>
        <p style="margin-top: 8px; font-size: 13px; color: #999">如有紧急需求请联系技术支持。</p>
        <ElButton style="margin-top: 16px" @click="visible = false">知道了</ElButton>
      </div>
    </Drawer>
  </div>
</template>
