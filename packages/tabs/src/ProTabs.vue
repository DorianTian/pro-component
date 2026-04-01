<script setup lang="ts">
/**
 * ProTabs — Enhanced tabs with closable confirm and card variant.
 *
 * Usage:
 *   <ProTabs v-model="activeTab" closable>
 *     <ProTabPane label="Tab 1" name="tab1">Content</ProTabPane>
 *     <ProTabPane label="Tab 2" name="tab2" closable>Closable</ProTabPane>
 *   </ProTabs>
 *
 *   <ProTabs v-model="activeTab" variant="card">...</ProTabs>
 */
import { ref, computed, watch } from 'vue'
import { ElTabs, ElMessageBox } from 'element-plus'

defineOptions({ name: 'ProTabs', inheritAttrs: false })

interface Props {
  /** Active tab name (v-model) */
  modelValue?: string
  /** Tab variant — 'line' (default) | 'card' | 'border-card' */
  variant?: 'line' | 'card' | 'border-card'
  /** Whether tabs are closable by default */
  closable?: boolean
  /** Show confirm dialog before closing a tab */
  confirmClose?: boolean
  /** Confirm dialog message */
  confirmMessage?: string
  /** Confirm dialog title */
  confirmTitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  variant: 'line',
  closable: false,
  confirmClose: false,
  confirmMessage: 'Are you sure you want to close this tab?',
  confirmTitle: 'Confirm',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'tab-remove': [name: string]
  'tab-click': [pane: unknown, ev: Event]
}>()

const innerValue = ref(props.modelValue ?? '')

watch(
  () => props.modelValue,
  (val) => {
    if (val !== undefined) innerValue.value = val
  },
)

function handleInput(val: unknown) {
  const name = val as string
  innerValue.value = name
  emit('update:modelValue', name)
}

const tabType = computed(() => {
  if (props.variant === 'line') return ''
  return props.variant
})

async function handleRemove(name: unknown) {
  const tabName = name as string

  if (props.confirmClose) {
    try {
      await ElMessageBox.confirm(props.confirmMessage, props.confirmTitle, {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning',
      })
    } catch {
      return
    }
  }

  emit('tab-remove', tabName)
}

function handleClick(pane: unknown, ev: Event) {
  emit('tab-click', pane, ev)
}
</script>

<template>
  <ElTabs
    v-bind="$attrs"
    :model-value="innerValue"
    :type="tabType"
    :closable="closable"
    class="pro-tabs"
    @update:model-value="handleInput"
    @tab-remove="handleRemove"
    @tab-click="handleClick"
  >
    <slot />
  </ElTabs>
</template>

<style>
.pro-tabs .el-tabs__header {
  margin-bottom: var(--pro-space-5);
}

.pro-tabs .el-tabs__item {
  font-size: var(--pro-text-sm);
  padding: 0 var(--pro-space-5);
  height: 40px;
  line-height: 40px;
}

.pro-tabs .el-tabs__item .el-icon.is-icon-close {
  width: 14px;
  height: 14px;
  margin-left: var(--pro-space-2);
  border-radius: var(--pro-radius-full);
  transition: all var(--pro-transition-fast);
}

.pro-tabs .el-tabs__item .el-icon.is-icon-close:hover {
  background-color: var(--pro-color-danger-light);
  color: var(--pro-color-danger);
}
</style>
