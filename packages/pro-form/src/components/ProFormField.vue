<script setup lang="ts">
import { computed, h, defineComponent } from 'vue'
import { ElFormItem, ElOption, ElRadio, ElCheckbox, ElTooltip, ElIcon } from 'element-plus'
import { HelpCircle } from 'lucide-vue-next'
import { CONTROL_REGISTRY } from '@pro/hooks'

import type { VNode } from 'vue'
import type { ProFieldDef } from '@pro/utils'

defineOptions({ name: 'ProFormField' })

const props = defineProps<{
  field: ProFieldDef
  modelValue: unknown
  formValues?: Record<string, unknown>
  /** Override the el-form-item :prop path (used by ProFormList for nested paths like "members.0.name") */
  prop?: string
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

      // Virtual select: pass options array instead of slot children
      if (field.valueType === 'select' && field.valueEnum && computedFieldProps.value.virtual) {
        resolvedProps.virtual = true
        resolvedProps.options = Object.entries(field.valueEnum).map(([value, config]) => ({
          label: typeof config === 'string' ? config : config.text,
          value,
        }))
        return h(entry.component, resolvedProps)
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
  <ElFormItem
    :label="field.title"
    :prop="prop ?? field.dataIndex"
    :rules="field.rules"
    v-bind="field.formItemProps"
  >
    <template v-if="field.tooltip" #label>
      {{ field.title }}
      <ElTooltip :content="field.tooltip" placement="top">
        <HelpCircle
          style="
            margin-left: var(--pro-space-1);
            cursor: help;
            width: 14px;
            height: 14px;
            color: var(--pro-text-tertiary);
          "
        />
      </ElTooltip>
    </template>
    <FieldControl />
  </ElFormItem>
</template>
