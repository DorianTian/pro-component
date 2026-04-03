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
 * Editable cell styling strategy:
 *
 * The parent `.el-table .cell` has `overflow: hidden` (from Element Plus)
 * which clips any outward-facing borders or shadows. We work WITHIN this
 * constraint by using `box-shadow: inset` for all border effects — inset
 * shadows render inside the element boundary and are never clipped.
 *
 * No need to fight overflow:hidden. Just stay inside the box.
 */

.editable-cell {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* All input-like controls: full width */
.editable-cell :deep(.el-input),
.editable-cell :deep(.el-select),
.editable-cell :deep(.el-input-number) {
  width: 100%;
}

/*
 * Input wrapper: subtle inset border, compact height.
 * Using inset box-shadow so overflow:hidden doesn't clip it.
 */
.editable-cell :deep(.el-input__wrapper) {
  padding: 2px 8px;
  border-radius: var(--pro-radius-xs, 3px);
  background: var(--pro-bg-base, #fff);
  box-shadow: inset 0 0 0 1px var(--pro-border-default, #e5e5e5);
  transition: box-shadow var(--pro-transition-fast, 150ms);
}

.editable-cell :deep(.el-input__wrapper:hover) {
  box-shadow: inset 0 0 0 1px var(--el-border-color-hover, #c0c4cc);
}

.editable-cell :deep(.el-input__wrapper.is-focus),
.editable-cell :deep(.el-input__wrapper:focus-within) {
  box-shadow: inset 0 0 0 1.5px var(--pro-border-focus, #2563eb);
}

/* Select wrapper: same treatment */
.editable-cell :deep(.el-select__wrapper) {
  min-height: 28px;
  padding: 2px 8px;
  border-radius: var(--pro-radius-xs, 3px);
  background: var(--pro-bg-base, #fff);
  box-shadow: inset 0 0 0 1px var(--pro-border-default, #e5e5e5);
  transition: box-shadow var(--pro-transition-fast, 150ms);
}

.editable-cell :deep(.el-select__wrapper:hover) {
  box-shadow: inset 0 0 0 1px var(--el-border-color-hover, #c0c4cc);
}

.editable-cell :deep(.el-select__wrapper.is-focused),
.editable-cell :deep(.el-select__wrapper:focus-within) {
  box-shadow: inset 0 0 0 1.5px var(--pro-border-focus, #2563eb);
}

/* InputNumber: consistent full-width */
.editable-cell :deep(.el-input-number .el-input__wrapper) {
  padding: 2px 8px;
}

/* ── Error state ── */
.editable-cell--error :deep(.el-input__wrapper),
.editable-cell--error :deep(.el-input__wrapper:hover),
.editable-cell--error :deep(.el-input__wrapper.is-focus),
.editable-cell--error :deep(.el-select__wrapper),
.editable-cell--error :deep(.el-select__wrapper:hover),
.editable-cell--error :deep(.el-select__wrapper.is-focused) {
  box-shadow: inset 0 0 0 1.5px var(--el-color-danger, #dc2626);
}

.editable-cell__error {
  font-size: 12px;
  line-height: 1.3;
  color: var(--el-color-danger, #dc2626);
  margin-top: 2px;
}
</style>
