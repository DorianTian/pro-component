<script setup lang="ts">
import { ref } from 'vue'
import { ProLoading } from '@pro/loading'
import { ElButton, ElButtonGroup } from 'element-plus'

const isLoading = ref(true)
const isEmpty = ref(false)
const error = ref<string | null>(null)

function setState(state: 'loading' | 'empty' | 'error' | 'success') {
  isLoading.value = state === 'loading'
  isEmpty.value = state === 'empty'
  error.value = state === 'error' ? '连接超时' : null
}
</script>

<template>
  <div>
    <div style="margin-bottom: 16px">
      <ElButtonGroup>
        <ElButton size="small" @click="setState('loading')">加载中</ElButton>
        <ElButton size="small" @click="setState('empty')">空数据</ElButton>
        <ElButton size="small" @click="setState('error')">错误</ElButton>
        <ElButton size="small" @click="setState('success')">成功</ElButton>
      </ElButtonGroup>
    </div>

    <ProLoading :loading="isLoading" :empty="isEmpty" :error="error">
      <template #loading>
        <div style="padding: 40px; text-align: center">
          <div style="font-size: 32px; margin-bottom: 8px; animation: spin 1s linear infinite">
            ⏳
          </div>
          <p style="margin: 0; color: #737373; font-size: 13px">正在拼命加载中…</p>
        </div>
      </template>

      <template #empty>
        <div style="padding: 40px; text-align: center">
          <div style="font-size: 48px; margin-bottom: 8px">📭</div>
          <p style="margin: 0; color: #737373; font-size: 13px">这里空空如也</p>
        </div>
      </template>

      <template #error="{ error: msg, retry }">
        <div style="padding: 40px; text-align: center">
          <div style="font-size: 48px; margin-bottom: 8px">💥</div>
          <p style="margin: 0 0 12px; color: #ef4444; font-size: 13px">{{ msg }}</p>
          <ElButton type="danger" size="small" @click="retry">重新加载</ElButton>
        </div>
      </template>

      <div style="padding: 24px; background: #fafafa; border-radius: 8px; text-align: center">
        <p style="margin: 0; color: #525252">自定义插槽的成功状态内容</p>
      </div>
    </ProLoading>
  </div>
</template>
