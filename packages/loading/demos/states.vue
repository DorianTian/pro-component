<script setup lang="ts">
import { ref } from 'vue'
import { ProLoading } from '@pro/loading'
import { ElButton, ElButtonGroup } from 'element-plus'

const isLoading = ref(false)
const isEmpty = ref(false)
const error = ref<string | null>(null)

function setState(state: 'loading' | 'empty' | 'error' | 'success') {
  isLoading.value = state === 'loading'
  isEmpty.value = state === 'empty'
  error.value = state === 'error' ? '服务端返回 500，请稍后重试' : null
}
</script>

<template>
  <div>
    <div style="margin-bottom: 16px">
      <ElButtonGroup>
        <ElButton size="small" @click="setState('success')">成功</ElButton>
        <ElButton size="small" @click="setState('loading')">加载中</ElButton>
        <ElButton size="small" @click="setState('empty')">空数据</ElButton>
        <ElButton size="small" @click="setState('error')">错误</ElButton>
      </ElButtonGroup>
    </div>

    <ProLoading
      :loading="isLoading"
      :empty="isEmpty"
      :error="error"
      empty-description="暂无数据"
      error-title="请求失败"
      @retry="setState('loading')"
    >
      <div style="padding: 24px; text-align: center; color: #525252">
        这里是实际内容区域，当状态为 success 时显示。
      </div>
    </ProLoading>
  </div>
</template>
