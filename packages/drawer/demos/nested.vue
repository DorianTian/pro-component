<script setup lang="ts">
import { ref } from 'vue'
import { Drawer } from '@pro/drawer'
import { ElButton } from 'element-plus'

const outerVisible = ref(false)
const innerVisible = ref(false)
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      嵌套抽屉 — 在抽屉中打开子抽屉
    </span>
    <ElButton @click="outerVisible = true">打开外层抽屉</ElButton>
    <Drawer v-model="outerVisible" title="项目列表" size="480px">
      <div style="color: #666">
        <p>选择一个项目查看详情：</p>
        <div
          style="
            margin-top: 12px;
            padding: 12px;
            background: #f9f9f9;
            border-radius: 6px;
            cursor: pointer;
          "
          @click="innerVisible = true"
        >
          <p style="font-weight: 500; color: #333">Pro Components</p>
          <p style="font-size: 13px; color: #999; margin-top: 4px">Vue 3 企业级组件库</p>
        </div>
      </div>
      <Drawer v-model="innerVisible" title="项目详情" size="360px">
        <div style="line-height: 1.8; color: #666">
          <p>项目名称：Pro Components</p>
          <p>技术栈：Vue 3 + Element Plus</p>
          <p>状态：开发中</p>
          <p>最近更新：2026-04-03</p>
        </div>
      </Drawer>
    </Drawer>
  </div>
</template>
