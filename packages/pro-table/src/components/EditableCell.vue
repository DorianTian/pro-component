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

  // InputNumber in table cells: hide step controls, strip unsupported prefix/suffix
  const numericTypes: ValueType[] = ['number', 'digit', 'money', 'percent', 'progress']
  if (numericTypes.includes(props.valueType)) {
    base.controls = false
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
    <div class="editable-cell" :class="{ 'editable-cell--error': validationError }">
      <component
        :is="controlEntry.component"
        :model-value="modelValue"
        v-bind="mergedProps"
        size="small"
        @update:model-value="emit('update:modelValue', $event)"
      >
        <!-- Render ElOption children for select with valueEnum -->
        <template v-if="enumSlotChildren" #default>
          <component :is="() => enumSlotChildren" />
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
/*
 * EditableCell layout styles only.
 * Focus/hover/error border overrides live in themes/overrides/table.css
 * to match the same specificity + !important level as components.css.
 */

.editable-cell {
  /*
   * 2px padding creates breathing room between the input border and the
   * cell's overflow:hidden boundary, preventing inset shadow clipping.
   */
  width: 100%;
  padding: 2px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* All input-like controls: full width, compact sizing */
.editable-cell :deep(.el-input),
.editable-cell :deep(.el-select),
.editable-cell :deep(.el-input-number) {
  width: 100%;
}

.editable-cell :deep(.el-input__wrapper) {
  padding: 2px 8px;
}

.editable-cell :deep(.el-select__wrapper) {
  min-height: 28px;
  padding: 2px 8px;
}

.editable-cell :deep(.el-input-number .el-input__wrapper) {
  padding: 2px 8px;
}

.editable-cell__error {
  font-size: 12px;
  line-height: 1.3;
  color: var(--el-color-danger, #dc2626);
  margin-top: 2px;
}
</style>
