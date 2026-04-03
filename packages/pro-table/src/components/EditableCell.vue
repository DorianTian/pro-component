<script setup lang="ts">
import { computed } from 'vue'
import { CONTROL_REGISTRY } from '@pro/hooks'

import type { ValueType, StatusType } from '@pro/utils'

defineOptions({ name: 'EditableCell' })

const props = defineProps<{
  valueType: ValueType
  modelValue: unknown
  isEditing: boolean
  valueEnum?: Record<string, { text: string; status?: StatusType }>
  fieldProps?: Record<string, unknown>
  validationError?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
}>()

const controlEntry = computed(() => CONTROL_REGISTRY[props.valueType] ?? CONTROL_REGISTRY.text)

/** Convert valueEnum to options array for select/radio/checkbox controls */
const enumOptions = computed(() => {
  if (!props.valueEnum) return undefined
  return Object.entries(props.valueEnum).map(([value, config]) => ({
    label: config.text,
    value,
  }))
})

/** Merged props: controlEntry defaults + enum options + user fieldProps */
const mergedProps = computed(() => {
  const base = { ...controlEntry.value.defaultProps }

  // Inject options for select/radio/checkbox types
  if (enumOptions.value) {
    const optionTypes: ValueType[] = ['select', 'radio', 'checkbox']
    if (optionTypes.includes(props.valueType)) {
      base.options = enumOptions.value
    }
  }

  // User fieldProps override everything
  if (props.fieldProps) {
    Object.assign(base, props.fieldProps)
  }

  return base
})
</script>

<template>
  <template v-if="isEditing">
    <div class="editable-cell">
      <component
        :is="controlEntry.component"
        :model-value="modelValue"
        v-bind="mergedProps"
        size="small"
        :class="{ 'editable-cell--error': validationError }"
        @update:model-value="emit('update:modelValue', $event)"
      />
      <div v-if="validationError" class="editable-cell__error">
        {{ validationError }}
      </div>
    </div>
  </template>
  <template v-else>
    <slot />
  </template>
</template>

<style scoped>
.editable-cell {
  width: 100%;
}

/* Strip default border from inputs inside table cells for a clean inline look */
.editable-cell :deep(.el-input__wrapper),
.editable-cell :deep(.el-select__wrapper),
.editable-cell :deep(.el-input-number),
.editable-cell :deep(.el-textarea__inner) {
  box-shadow: none;
  background: transparent;
}

.editable-cell :deep(.el-input__wrapper:hover),
.editable-cell :deep(.el-select__wrapper:hover),
.editable-cell :deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px var(--el-border-color) inset;
}

.editable-cell :deep(.el-input__wrapper:focus-within),
.editable-cell :deep(.el-select__wrapper:focus-within),
.editable-cell :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px var(--el-color-primary) inset;
}

/* Error state overrides hover/focus */
.editable-cell--error :deep(.el-input__wrapper),
.editable-cell--error :deep(.el-select__wrapper) {
  box-shadow: 0 0 0 1px var(--el-color-danger) inset;
}

.editable-cell__error {
  font-size: 12px;
  line-height: 1.2;
  color: var(--el-color-danger);
  margin-top: 2px;
}
</style>
