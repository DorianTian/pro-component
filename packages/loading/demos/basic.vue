<script setup lang="ts">
import { ref } from 'vue'
import { ProLoading } from '@pro/loading'
import { ElButton, ElButtonGroup } from 'element-plus'

const isLoading = ref(false)
const isEmpty = ref(false)
const error = ref<string | null>(null)

function setLoading() {
  isLoading.value = true
  isEmpty.value = false
  error.value = null
}

function setEmpty() {
  isLoading.value = false
  isEmpty.value = true
  error.value = null
}

function setError() {
  isLoading.value = false
  isEmpty.value = false
  error.value = '网络请求失败，请检查连接'
}

function setSuccess() {
  isLoading.value = false
  isEmpty.value = false
  error.value = null
}
</script>

<template>
  <div>
    <div style="margin-bottom: 16px">
      <ElButtonGroup>
        <ElButton size="small" @click="setSuccess">成功</ElButton>
        <ElButton size="small" @click="setLoading">加载中</ElButton>
        <ElButton size="small" @click="setEmpty">空数据</ElButton>
        <ElButton size="small" @click="setError">错误</ElButton>
      </ElButtonGroup>
    </div>

    <ProLoading
      :loading="isLoading"
      :empty="isEmpty"
      :error="error"
      empty-description="暂无数据"
      error-title="请求失败"
      @retry="setLoading"
    >
      <div style="padding: 24px; text-align: center; color: var(--pro-text-secondary)">
        这里是实际内容区域，当状态为 success 时显示。
      </div>
    </ProLoading>
  </div>
</template>
