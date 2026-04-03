<script setup lang="ts">
import { ref } from 'vue'
import { Drawer } from '@pro/drawer'
import { ElButton } from 'element-plus'

const rtlVisible = ref(false)
const ltrVisible = ref(false)
const ttbVisible = ref(false)
const bttVisible = ref(false)
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      不同方向 — 右侧、左侧、顶部、底部
    </span>
    <div style="display: flex; gap: 8px; flex-wrap: wrap">
      <ElButton size="small" @click="rtlVisible = true">右侧</ElButton>
      <ElButton size="small" @click="ltrVisible = true">左侧</ElButton>
      <ElButton size="small" @click="ttbVisible = true">顶部</ElButton>
      <ElButton size="small" @click="bttVisible = true">底部</ElButton>
    </div>

    <Drawer v-model="rtlVisible" title="右侧抽屉" direction="rtl" size="320px">
      <p style="color: #666">从右侧滑入（默认方向）。</p>
    </Drawer>

    <Drawer v-model="ltrVisible" title="左侧抽屉" direction="ltr" size="320px">
      <p style="color: #666">从左侧滑入，适合侧边导航。</p>
    </Drawer>

    <Drawer v-model="ttbVisible" title="顶部抽屉" direction="ttb" size="200px">
      <p style="color: #666">从顶部滑入，适合全局通知或搜索。</p>
    </Drawer>

    <Drawer v-model="bttVisible" title="底部抽屉" direction="btt" size="200px">
      <p style="color: #666">从底部滑入，适合移动端操作面板。</p>
    </Drawer>
  </div>
</template>
