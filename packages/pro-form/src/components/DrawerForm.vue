<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElDrawer, ElButton } from 'element-plus'
import { useProLocale } from '@pro/hooks'
import ProForm from '../ProForm.vue'

import type { ProFormItem, FormLayout } from '@pro/utils'

defineOptions({ name: 'DrawerForm' })

const { t } = useProLocale()

const props = withDefaults(
  defineProps<{
    /** Drawer visibility (v-model or v-model:visible) */
    modelValue?: boolean
    visible?: boolean
    title?: string
    width?: string | number
    fields: ProFormItem[]
    initialValues?: Record<string, unknown>
    onSubmit?: (values: Record<string, unknown>) => Promise<boolean>
    formProps?: Record<string, unknown>
    labelWidth?: string | number
    layout?: FormLayout
    columns?: number
    drawerProps?: Record<string, unknown>
    submitText?: string
    cancelText?: string
  }>(),
  {
    modelValue: undefined,
    visible: undefined,
    title: '',
    width: '480px',
    layout: 'vertical',
    columns: 1,
    submitText: undefined,
    cancelText: undefined,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:visible': [value: boolean]
  submit: [values: Record<string, unknown>]
}>()

const internalVisible = ref(false)

const drawerVisible = computed({
  get: () => props.modelValue ?? props.visible ?? internalVisible.value,
  set: (val: boolean) => {
    internalVisible.value = val
    emit('update:modelValue', val)
    emit('update:visible', val)
  },
})

const formRef = ref<InstanceType<typeof ProForm> | null>(null)
const submitting = ref(false)

function handleOpen(): void {
  drawerVisible.value = true
}

function handleClose(): void {
  drawerVisible.value = false
}

async function handleSubmit(): Promise<void> {
  if (!formRef.value) return
  submitting.value = true
  try {
    const success = await formRef.value.submit()
    if (success) {
      emit('submit', { ...formRef.value.formValues })
      handleClose()
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <!-- Trigger slot: click to open drawer -->
  <span v-if="$slots.trigger" @click="handleOpen">
    <slot name="trigger" />
  </span>

  <ElDrawer
    v-model="drawerVisible"
    :title="title"
    :size="width"
    destroy-on-close
    class="pro-drawer-form"
    v-bind="drawerProps"
  >
    <ProForm
      ref="formRef"
      :fields="fields"
      :initial-values="initialValues"
      :on-submit="onSubmit"
      :form-props="formProps"
      :label-width="labelWidth"
      :layout="layout"
      :columns="columns"
      :show-actions="false"
    />

    <template #footer>
      <div class="pro-drawer-form__footer">
        <ElButton @click="handleClose">
          {{ cancelText ?? t('pro.form.cancel') }}
        </ElButton>
        <ElButton type="primary" :loading="submitting" @click="handleSubmit">
          {{ submitText ?? t('pro.form.submit') }}
        </ElButton>
      </div>
    </template>
  </ElDrawer>
</template>

<style>
.pro-drawer-form__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--pro-space-3);
}
</style>
