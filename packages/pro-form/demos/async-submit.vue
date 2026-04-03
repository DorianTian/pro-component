<script setup lang="ts">
import { ref } from 'vue'
import { ProForm } from '@pro/form'
import { ElMessage, ElAlert } from 'element-plus'
import type { ProFieldDef } from '@pro/utils'

const SUBMIT_DELAY_MS = 2000
const submittedCount = ref(0)

const fields: ProFieldDef[] = [
  {
    dataIndex: 'title',
    title: '工单标题',
    valueType: 'text',
    rules: [{ required: true, message: '请输入工单标题', trigger: 'blur' }],
  },
  {
    dataIndex: 'category',
    title: '工单分类',
    valueType: 'select',
    valueEnum: {
      bug: { text: '缺陷修复' },
      feature: { text: '功能需求' },
      optimization: { text: '性能优化' },
      docs: { text: '文档完善' },
    },
    rules: [{ required: true, message: '请选择分类', trigger: 'change' }],
  },
  {
    dataIndex: 'severity',
    title: '严重程度',
    valueType: 'radio',
    valueEnum: {
      critical: { text: '紧急' },
      major: { text: '严重' },
      minor: { text: '一般' },
      trivial: { text: '轻微' },
    },
  },
  {
    dataIndex: 'description',
    title: '详细描述',
    valueType: 'textarea',
    rules: [{ required: true, message: '请输入描述', trigger: 'blur' }],
  },
]

/**
 * 模拟异步提交，包含 2 秒延时。
 * 提交期间按钮自动显示 loading 状态，防止重复提交。
 */
async function handleSubmit(values: Record<string, unknown>) {
  await new Promise((resolve) => setTimeout(resolve, SUBMIT_DELAY_MS))

  submittedCount.value += 1
  ElMessage.success(`工单提交成功 (#${submittedCount.value})`)
  return true
}

function handleError(error: Error) {
  ElMessage.error(`提交失败: ${error.message}`)
}
</script>

<template>
  <ElAlert
    v-if="submittedCount > 0"
    :title="`已成功提交 ${submittedCount} 个工单`"
    type="success"
    show-icon
    :closable="false"
    style="margin-bottom: 16px"
  />
  <ProForm
    :fields="fields"
    :on-submit="handleSubmit"
    :on-error="handleError"
    submit-text="提交工单"
    :initial-values="{ severity: 'minor' }"
  />
</template>
