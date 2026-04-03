<script setup lang="ts">
import { computed, h, type VNode } from 'vue'
import { ElOption } from 'element-plus'
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

/** Whether this valueType uses enum options rendered as slot children */
const isEnumType = computed(() => {
  const types: ValueType[] = ['select', 'radio', 'checkbox']
  return types.includes(props.valueType) && !!props.valueEnum
})

/** Build ElOption VNodes for select/radio/checkbox from valueEnum */
const enumSlotChildren = computed((): VNode[] | undefined => {
  if (!isEnumType.value || !props.valueEnum) return undefined
  return Object.entries(props.valueEnum).map(([value, config]) =>
    h(ElOption, { key: value, label: config.text, value }),
  )
})

/** Merged props with table-cell-friendly overrides */
const mergedProps = computed(() => {
  const base = { ...controlEntry.value.defaultProps }

  // InputNumber in table cells: hide controls, strip prefix (not supported)
  const numericTypes: ValueType[] = ['number', 'digit', 'money', 'percent', 'progress']
  if (numericTypes.includes(props.valueType)) {
    base.controls = false
    // el-input-number doesn't support prefix/suffix — remove them
    delete base.prefix
    delete base.suffix
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
      >
        <!-- Render ElOption children for select with valueEnum -->
        <template v-if="enumSlotChildren" #default>
          <component
            :is="() => enumSlotChildren"
          />
        </template>
      </component>
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
.editable-cell :deep(.el-textarea__inner) {
  box-shadow: none;
  background: transparent;
}

/* InputNumber: remove outer border and make compact */
.editable-cell :deep(.el-input-number) {
  width: 100%;
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
