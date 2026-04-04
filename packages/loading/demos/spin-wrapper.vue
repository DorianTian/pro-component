<script setup lang="ts">
import { ref } from 'vue'
import { ProSpin } from '@pro/loading'

const loading = ref(true)
</script>

<template>
  <div style="max-width: 600px">
    <div style="margin-bottom: 12px">
      <el-switch v-model="loading" active-text="加载中" inactive-text="加载完成" />
    </div>
    <ProSpin :spinning="loading" tip="数据加载中...">
      <div
        style="
          padding: 24px;
          border: 1px solid var(--pro-border-default, #e5e5e5);
          border-radius: 8px;
        "
      >
        <h4 style="margin: 0 0 8px; color: var(--pro-text-primary)">卡片内容</h4>
        <p style="margin: 0; color: var(--pro-text-secondary); font-size: 14px">
          这是一段需要异步加载的内容。ProSpin 会在内容上方显示旋转加载指示器，
          并将内容区域模糊化处理。
        </p>
      </div>
    </ProSpin>
  </div>
</template>
