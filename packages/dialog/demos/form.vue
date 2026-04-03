<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Dialog } from '@pro/dialog'
import { ElButton, ElForm, ElFormItem, ElInput, ElSelect, ElOption } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const visible = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  name: '',
  department: '',
  email: '',
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  visible.value = false
}

const handleOpen = () => {
  form.name = ''
  form.department = ''
  form.email = ''
  visible.value = true
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      表单对话框 — 带表单验证的对话框
    </span>
    <ElButton @click="handleOpen">新建员工</ElButton>
    <Dialog v-model="visible" title="新建员工" width="460px">
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="80px">
        <ElFormItem label="姓名" prop="name">
          <ElInput v-model="form.name" placeholder="请输入姓名" />
        </ElFormItem>
        <ElFormItem label="部门" prop="department">
          <ElSelect v-model="form.department" placeholder="请选择部门" style="width: 100%">
            <ElOption label="技术部" value="tech" />
            <ElOption label="产品部" value="product" />
            <ElOption label="运营部" value="operation" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="邮箱" prop="email">
          <ElInput v-model="form.email" placeholder="请输入邮箱" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="visible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">提交</ElButton>
      </template>
    </Dialog>
  </div>
</template>
