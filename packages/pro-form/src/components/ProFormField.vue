<script setup lang="ts">
import { computed, h } from 'vue'
import {
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElSelect,
  ElOption,
  ElDatePicker,
  ElSwitch,
  ElRadioGroup,
  ElRadio,
  ElCheckboxGroup,
  ElCheckbox,
  ElTooltip,
  ElIcon,
} from 'element-plus'

import type { Component, VNode } from 'vue'
import type { ProFieldDef } from '@pro/utils'

defineOptions({ name: 'ProFormField' })

const props = defineProps<{
  field: ProFieldDef
  modelValue: unknown
  formValues?: Record<string, unknown>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
}>()

/**
 * Placeholder control registry — will be replaced by CONTROL_REGISTRY
 * import from @pro/hooks once Agent 2a completes.
 * Architecture is correct: single source of truth for valueType → component mapping.
 */
interface ControlEntry {
  component: Component
  defaultProps?: Record<string, unknown>
}

const FALLBACK_CONTROL_REGISTRY: Record<string, ControlEntry> = {
  text: { component: ElInput, defaultProps: { clearable: true } },
  textarea: { component: ElInput, defaultProps: { type: 'textarea', rows: 3 } },
  number: { component: ElInputNumber, defaultProps: { controlsPosition: 'right' } },
  money: { component: ElInputNumber, defaultProps: { controlsPosition: 'right', precision: 2 } },
  percent: {
    component: ElInputNumber,
    defaultProps: { controlsPosition: 'right', min: 0, max: 100 },
  },
  select: { component: ElSelect, defaultProps: { clearable: true } },
  date: { component: ElDatePicker, defaultProps: { type: 'date' } },
  dateRange: { component: ElDatePicker, defaultProps: { type: 'daterange' } },
  dateTime: { component: ElDatePicker, defaultProps: { type: 'datetime' } },
  switch: { component: ElSwitch },
  radio: { component: ElRadioGroup },
  checkbox: { component: ElCheckboxGroup },
}

const computedFieldProps = computed(() => {
  const base = props.field.fieldProps ?? {}
  if (props.field.getFieldProps && props.formValues) {
    const dynamic = props.field.getFieldProps(props.formValues)
    return { ...base, ...dynamic }
  }
  return base
})

function handleUpdate(val: unknown) {
  emit('update:modelValue', val)
}

/**
 * Resolve the control component and props for a given valueType.
 * Uses FALLBACK_CONTROL_REGISTRY until CONTROL_REGISTRY from @pro/hooks is available.
 */
function resolveControl(
  field: ProFieldDef,
  modelValue: unknown,
  onChange: (value: unknown) => void,
): { component: Component; props: Record<string, unknown>; slots?: Record<string, () => VNode[]> } {
  const entry = FALLBACK_CONTROL_REGISTRY[field.valueType ?? 'text']
  if (!entry) {
    return resolveControl({ ...field, valueType: 'text' }, modelValue, onChange)
  }

  const resolvedProps: Record<string, unknown> = {
    ...entry.defaultProps,
    ...computedFieldProps.value,
    disabled: field.disabled,
    readonly: field.readonly,
    modelValue,
    'onUpdate:modelValue': onChange,
  }

  let slots: Record<string, () => VNode[]> | undefined

  // valueEnum -> options for select/radio/checkbox
  if (field.valueEnum && field.valueType === 'select') {
    slots = {
      default: () =>
        Object.entries(field.valueEnum!).map(([value, config]) =>
          h(ElOption, {
            key: value,
            label: typeof config === 'string' ? config : config.text,
            value,
          }),
        ),
    }
  }

  if (field.valueEnum && field.valueType === 'radio') {
    slots = {
      default: () =>
        Object.entries(field.valueEnum!).map(([value, config]) =>
          h(ElRadio, { key: value, value }, { default: () => (typeof config === 'string' ? config : config.text) }),
        ),
    }
  }

  if (field.valueEnum && field.valueType === 'checkbox') {
    slots = {
      default: () =>
        Object.entries(field.valueEnum!).map(([value, config]) =>
          h(ElCheckbox, { key: value, value }, { default: () => (typeof config === 'string' ? config : config.text) }),
        ),
    }
  }

  return { component: entry.component, props: resolvedProps, slots }
}

const controlResult = computed(() => resolveControl(props.field, props.modelValue, handleUpdate))
</script>

<template>
  <ElFormItem :label="field.title" :prop="field.dataIndex" v-bind="field.formItemProps">
    <template v-if="field.tooltip" #label>
      {{ field.title }}
      <ElTooltip :content="field.tooltip" placement="top">
        <ElIcon style="margin-left: 4px; cursor: help">
          <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em">
            <path
              d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372zm-48-524h96v64h-96zm0 128h96v320h-96z"
              fill="currentColor"
            />
          </svg>
        </ElIcon>
      </ElTooltip>
    </template>
    <template v-if="field.renderFormItem">
      <component :is="() => field.renderFormItem!(modelValue, handleUpdate)" />
    </template>
    <component
      v-else
      :is="controlResult.component"
      v-bind="controlResult.props"
    >
      <template v-if="controlResult.slots" v-for="(slotFn, slotName) in controlResult.slots" #[slotName]>
        <component :is="() => slotFn()" />
      </template>
    </component>
  </ElFormItem>
</template>
