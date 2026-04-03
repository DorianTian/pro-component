<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Drawer } from '@pro/drawer'
import { ElButton, ElForm, ElFormItem, ElInput, ElSelect, ElOption } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const visible = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  title: '',
  priority: '',
  description: '',
})

const rules: FormRules = {
  title: [{ required: true, message: '请输入任务标题', trigger: 'blur' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  visible.value = false
}

const handleOpen = () => {
  form.title = ''
  form.priority = ''
  form.description = ''
  visible.value = true
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      表单抽屉 — 在抽屉中填写表单并验证
    </span>
    <ElButton @click="handleOpen">新建任务</ElButton>
    <Drawer v-model="visible" title="新建任务" size="420px">
      <ElForm ref="formRef" :model="form" :rules="rules" label-position="top">
        <ElFormItem label="任务标题" prop="title">
          <ElInput v-model="form.title" placeholder="请输入任务标题" />
        </ElFormItem>
        <ElFormItem label="优先级" prop="priority">
          <ElSelect v-model="form.priority" placeholder="请选择" style="width: 100%">
            <ElOption label="紧急" value="urgent" />
            <ElOption label="高" value="high" />
            <ElOption label="中" value="medium" />
            <ElOption label="低" value="low" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="描述">
          <ElInput
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入任务描述"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div style="display: flex; gap: 8px">
          <ElButton @click="visible = false">取消</ElButton>
          <ElButton type="primary" @click="handleSubmit">创建</ElButton>
        </div>
      </template>
    </Drawer>
  </div>
</template>
