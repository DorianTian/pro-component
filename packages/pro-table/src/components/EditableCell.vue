<script setup lang="ts">
import { computed } from 'vue'
import { CONTROL_REGISTRY } from '@pro/hooks'

import type { ValueType } from '@pro/utils'

defineOptions({ name: 'EditableCell' })

const props = defineProps<{
  valueType: ValueType
  modelValue: unknown
  isEditing: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
}>()

const controlEntry = computed(() => CONTROL_REGISTRY[props.valueType] ?? CONTROL_REGISTRY.text)
</script>

<template>
  <template v-if="isEditing">
    <component
      :is="controlEntry.component"
      :model-value="modelValue"
      v-bind="controlEntry.defaultProps"
      size="small"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </template>
  <template v-else>
    <slot />
  </template>
</template>
