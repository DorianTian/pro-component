<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElPopover, ElButton, ElTag, ElIcon } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { useProLocale } from '@pro/hooks'
import { useProForm } from '../composables/use-pro-form'
import ProFormField from './ProFormField.vue'

import type { ProFieldDef } from '@pro/utils'

defineOptions({ name: 'LightFilter' })

const props = withDefaults(
  defineProps<{
    fields: ProFieldDef[]
    initialValues?: Record<string, unknown>
  }>(),
  {},
)

const emit = defineEmits<{
  change: [values: Record<string, unknown>]
  reset: []
}>()

const { t } = useProLocale()

const { formValues, visibleFields, setFieldValue, resetFields } = useProForm({
  fields: props.fields,
  initialValues: props.initialValues,
})

const activePopover = ref<string | null>(null)

const activeFilters = computed(() => {
  return visibleFields.value.filter((field) => {
    const val = formValues.value[field.dataIndex]
    return val !== undefined && val !== null && val !== ''
  })
})

function getDisplayValue(field: ProFieldDef): string {
  const val = formValues.value[field.dataIndex]
  if (field.valueEnum && val !== undefined && val !== null) {
    const entry = field.valueEnum[String(val)]
    if (entry) return typeof entry === 'string' ? entry : entry.text
  }
  return String(val ?? '')
}

function handleFieldChange(dataIndex: string, value: unknown): void {
  setFieldValue(dataIndex, value)
  activePopover.value = null
  emit('change', { ...formValues.value })
}

function handleClearField(dataIndex: string): void {
  setFieldValue(dataIndex, undefined)
  emit('change', { ...formValues.value })
}

function handleReset(): void {
  resetFields()
  emit('reset')
  emit('change', { ...formValues.value })
}

defineExpose({ formValues, resetFields })
</script>

<template>
  <div class="pro-light-filter">
    <ElTag
      v-for="field in activeFilters"
      :key="field.dataIndex"
      closable
      class="pro-light-filter__chip"
      @close="handleClearField(field.dataIndex)"
    >
      {{ field.title }}: {{ getDisplayValue(field) }}
    </ElTag>

    <ElPopover
      v-for="field in visibleFields"
      :key="`popover-${field.dataIndex}`"
      :visible="activePopover === field.dataIndex"
      placement="bottom-start"
      :width="220"
      trigger="click"
      @update:visible="(v: boolean) => (activePopover = v ? field.dataIndex : null)"
    >
      <template #reference>
        <ElButton
          v-if="!formValues[field.dataIndex]"
          link
          type="primary"
          class="pro-light-filter__trigger"
        >
          {{ field.title }}
          <ElIcon class="pro-light-filter__arrow"><ArrowDown /></ElIcon>
        </ElButton>
      </template>
      <div class="pro-light-filter__popover-content">
        <ProFormField
          :field="field"
          :model-value="formValues[field.dataIndex]"
          :form-values="formValues"
          @update:model-value="handleFieldChange(field.dataIndex, $event)"
        />
      </div>
    </ElPopover>

    <ElButton
      v-if="activeFilters.length > 0"
      link
      class="pro-light-filter__reset"
      @click="handleReset"
    >
      {{ t('pro.table.queryFilter.reset') }}
    </ElButton>
  </div>
</template>

<style scoped>
.pro-light-filter {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--pro-space-2);
  padding: var(--pro-space-3) 0;
}

.pro-light-filter__chip {
  border-radius: var(--pro-radius-pill);
}

.pro-light-filter__trigger {
  font-size: var(--pro-text-sm);
}

.pro-light-filter__arrow {
  margin-left: var(--pro-space-1);
  font-size: 12px;
}

.pro-light-filter__popover-content {
  padding: var(--pro-space-2) 0;
}

.pro-light-filter__reset {
  font-size: var(--pro-text-sm);
  color: var(--pro-text-tertiary);
}
</style>
