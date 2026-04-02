<script setup lang="ts">
import { ref } from 'vue'
import { Drawer } from '@pro/drawer'
import { ElButton } from 'element-plus'

const rightVisible = ref(false)
const leftVisible = ref(false)
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      从右侧打开
    </span>
    <ElButton @click="rightVisible = true">右侧抽屉</ElButton>
    <Drawer v-model="rightVisible" title="右侧抽屉" direction="rtl" size="360px">
      <p>这是从右侧滑出的抽屉内容。</p>
    </Drawer>

    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      从左侧打开
    </span>
    <ElButton @click="leftVisible = true">左侧抽屉</ElButton>
    <Drawer v-model="leftVisible" title="左侧抽屉" direction="ltr" size="360px">
      <p>这是从左侧滑出的抽屉内容。</p>
    </Drawer>
  </div>
</template>
