<script setup lang="ts">
import { computed, h, defineComponent } from 'vue'
import { ElFormItem, ElOption, ElRadio, ElCheckbox, ElTooltip, ElIcon } from 'element-plus'
import { CONTROL_REGISTRY } from '@pro/hooks'

import type { VNode } from 'vue'
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
 * Build children VNodes for select/radio/checkbox from valueEnum.
 */
function buildEnumChildren(field: ProFieldDef): VNode[] | undefined {
  if (!field.valueEnum) return undefined

  if (field.valueType === 'select') {
    return Object.entries(field.valueEnum).map(([value, config]) =>
      h(ElOption, {
        key: value,
        label: typeof config === 'string' ? config : config.text,
        value,
      }),
    )
  }

  if (field.valueType === 'radio') {
    return Object.entries(field.valueEnum).map(([value, config]) =>
      h(
        ElRadio,
        { key: value, value },
        { default: () => (typeof config === 'string' ? config : config.text) },
      ),
    )
  }

  if (field.valueType === 'checkbox') {
    return Object.entries(field.valueEnum).map(([value, config]) =>
      h(
        ElCheckbox,
        { key: value, value },
        { default: () => (typeof config === 'string' ? config : config.text) },
      ),
    )
  }

  return undefined
}

/**
 * Render the control component for this field via render function.
 * This avoids the v-for + dynamic slot name issue in templates.
 */
const FieldControl = defineComponent({
  name: 'FieldControl',
  setup() {
    return () => {
      const field = props.field
      const modelValue = props.modelValue

      // Custom render takes highest priority
      if (field.renderFormItem) {
        return field.renderFormItem(modelValue, handleUpdate)
      }

      const entry = CONTROL_REGISTRY[field.valueType ?? 'text']

      const resolvedProps: Record<string, unknown> = {
        ...entry.defaultProps,
        ...computedFieldProps.value,
        disabled: field.disabled,
        readonly: field.readonly,
        modelValue,
        'onUpdate:modelValue': handleUpdate,
      }

      const children = buildEnumChildren(field)
      if (children) {
        return h(entry.component, resolvedProps, { default: () => children })
      }

      return h(entry.component, resolvedProps)
    }
  },
})
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
    <FieldControl />
  </ElFormItem>
</template>
