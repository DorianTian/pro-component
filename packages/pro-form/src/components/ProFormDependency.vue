<script setup lang="ts">
import { computed, inject } from 'vue'
import { PRO_FORM_INJECTION_KEY } from '../injection-keys'

defineOptions({ name: 'ProFormDependency' })

const props = defineProps<{
  name: string[]
}>()

const formCtx = inject(PRO_FORM_INJECTION_KEY, null)

const dependencyValues = computed(() => {
  if (!formCtx) return {}
  const values: Record<string, unknown> = {}
  for (const key of props.name) {
    values[key] = formCtx.formValues.value[key]
  }
  return values
})
</script>

<template>
  <slot :values="dependencyValues" :form-values="formCtx?.formValues.value ?? {}" />
</template>
