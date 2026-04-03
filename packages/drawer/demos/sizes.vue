<script setup lang="ts">
import { ref } from 'vue'
import { Drawer } from '@pro/drawer'
import { ElButton } from 'element-plus'

const smallVisible = ref(false)
const mediumVisible = ref(false)
const largeVisible = ref(false)
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      不同尺寸 — 通过 size 属性控制抽屉宽度
    </span>
    <div style="display: flex; gap: 8px">
      <ElButton size="small" @click="smallVisible = true">小 (280px)</ElButton>
      <ElButton size="small" @click="mediumVisible = true">中 (480px)</ElButton>
      <ElButton size="small" @click="largeVisible = true">大 (680px)</ElButton>
    </div>

    <Drawer v-model="smallVisible" title="快捷预览" size="280px">
      <p style="color: #666">小尺寸抽屉，适合快速查看摘要信息。</p>
    </Drawer>

    <Drawer v-model="mediumVisible" title="详情面板" size="480px">
      <p style="color: #666">中等尺寸抽屉，适合表单编辑和详情展示。</p>
    </Drawer>

    <Drawer v-model="largeVisible" title="数据面板" size="680px">
      <p style="color: #666">大尺寸抽屉，适合复杂内容如表格、配置项。</p>
    </Drawer>
  </div>
</template>
