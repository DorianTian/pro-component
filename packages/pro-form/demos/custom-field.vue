<script setup lang="ts">
import { h } from 'vue'
import { ProForm } from '@pro/form'
import { ElMessage, ElColorPicker, ElSlider } from 'element-plus'
import type { ProFieldDef } from '@pro/utils'

const DEFAULT_COLOR = '#409eff'
const DEFAULT_FONT_SIZE = 16
const MAX_FONT_SIZE = 48
const MIN_FONT_SIZE = 12

const fields: ProFieldDef[] = [
  {
    dataIndex: 'title',
    title: '标题文字',
    valueType: 'text',
    rules: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  },
  {
    dataIndex: 'color',
    title: '主题颜色',
    renderFormItem: (modelValue, onChange) =>
      h(ElColorPicker, {
        modelValue: (modelValue as string) ?? DEFAULT_COLOR,
        'onUpdate:modelValue': onChange,
        showAlpha: false,
      }),
  },
  {
    dataIndex: 'fontSize',
    title: '字号大小',
    renderFormItem: (modelValue, onChange) =>
      h(ElSlider, {
        modelValue: (modelValue as number) ?? DEFAULT_FONT_SIZE,
        'onUpdate:modelValue': onChange,
        min: MIN_FONT_SIZE,
        max: MAX_FONT_SIZE,
        showInput: true,
        style: 'padding-right: 16px',
      }),
  },
  {
    dataIndex: 'align',
    title: '对齐方式',
    valueType: 'radio',
    valueEnum: {
      left: { text: '左对齐' },
      center: { text: '居中' },
      right: { text: '右对齐' },
    },
  },
]

const initialValues = {
  title: 'Pro Components',
  color: DEFAULT_COLOR,
  fontSize: DEFAULT_FONT_SIZE,
  align: 'center',
}

async function handleSubmit(values: Record<string, unknown>) {
  await new Promise((resolve) => setTimeout(resolve, 500))
  ElMessage.success(`配置已保存: ${JSON.stringify(values)}`)
  return true
}
</script>

<template>
  <ProForm
    :fields="fields"
    :initial-values="initialValues"
    :on-submit="handleSubmit"
    submit-text="保存配置"
  />
</template>
