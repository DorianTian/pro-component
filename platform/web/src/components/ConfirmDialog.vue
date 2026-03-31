<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="confirm-content">
      <el-icon v-if="type === 'warning'" :size="48" color="#e6a23c"><WarningFilled /></el-icon>
      <el-icon v-else-if="type === 'danger'" :size="48" color="#f56c6c"
        ><CircleCloseFilled
      /></el-icon>
      <el-icon v-else :size="48" color="#409eff"><InfoFilled /></el-icon>
      <p class="confirm-message">{{ message }}</p>
      <slot />
    </div>
    <template #footer>
      <el-button @click="handleClose">Cancel</el-button>
      <el-button
        :type="type === 'danger' ? 'danger' : 'primary'"
        :loading="loading"
        @click="handleConfirm"
      >
        {{ confirmText }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    message?: string
    confirmText?: string
    type?: 'info' | 'warning' | 'danger'
    width?: string
    loading?: boolean
  }>(),
  {
    title: 'Confirm',
    message: 'Are you sure?',
    confirmText: 'Confirm',
    type: 'warning',
    width: '420px',
    loading: false,
  },
)

const visible = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  confirm: []
  close: []
}>()

function handleConfirm() {
  emit('confirm')
}

function handleClose() {
  visible.value = false
  emit('close')
}
</script>

<style scoped>
.confirm-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
  text-align: center;
}

.confirm-message {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}
</style>
