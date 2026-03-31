<template>
  <el-dialog
    v-model="visible"
    :title="isEditing ? 'Edit App' : 'Create App'"
    width="500px"
    :close-on-click-modal="false"
    @close="resetForm"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      label-position="right"
    >
      <el-form-item label="App ID" prop="app_id">
        <el-input v-model="formData.app_id" :disabled="isEditing" placeholder="e.g. user-center" />
      </el-form-item>
      <el-form-item label="Name" prop="name">
        <el-input v-model="formData.name" placeholder="Display name" />
      </el-form-item>
      <el-form-item label="Owner" prop="owner">
        <el-input v-model="formData.owner" placeholder="Owner username" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">Cancel</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ isEditing ? 'Save' : 'Create' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { createApp, updateApp } from '@/api/apps'

import type { FormInstance, FormRules } from 'element-plus'
import type { App } from '@/api/types'

const props = defineProps<{
  editingApp: App | null
}>()

const visible = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  saved: []
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)

const isEditing = computed(() => !!props.editingApp)

const formData = ref({
  app_id: '',
  name: '',
  owner: '',
})

const formRules: FormRules = {
  app_id: [
    { required: true, message: 'App ID is required', trigger: 'blur' },
    {
      pattern: /^[a-z0-9-]+$/,
      message: 'Only lowercase letters, numbers, and hyphens',
      trigger: 'blur',
    },
  ],
  name: [{ required: true, message: 'Name is required', trigger: 'blur' }],
  owner: [{ required: true, message: 'Owner is required', trigger: 'blur' }],
}

watch(
  () => props.editingApp,
  (app) => {
    if (app) {
      formData.value = {
        app_id: app.app_id,
        name: app.name,
        owner: app.owner,
      }
    }
  },
)

function resetForm() {
  formData.value = { app_id: '', name: '', owner: '' }
  formRef.value?.resetFields()
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (isEditing.value) {
      await updateApp(formData.value.app_id, {
        name: formData.value.name,
        owner: formData.value.owner,
      })
      ElMessage.success('App updated')
    } else {
      await createApp(formData.value)
      ElMessage.success('App created')
    }
    emit('saved')
  } finally {
    submitting.value = false
  }
}
</script>
