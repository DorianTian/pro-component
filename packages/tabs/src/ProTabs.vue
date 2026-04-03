<script setup lang="ts">
/**
 * ProTabs — Enhanced tabs with closable confirm and card variant.
 */
import { ref, computed, watch } from 'vue'
import { ElTabs, ElMessageBox } from 'element-plus'
import { useProLocale } from '@pro/hooks'

defineOptions({ name: 'ProTabs', inheritAttrs: false })

interface Props {
  modelValue?: string
  variant?: 'line' | 'card' | 'border-card'
  closable?: boolean
  confirmClose?: boolean
  confirmMessage?: string
  confirmTitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  variant: 'line',
  closable: false,
  confirmClose: false,
  confirmMessage: undefined,
  confirmTitle: undefined,
})

const { t } = useProLocale()

const resolvedConfirmMessage = computed(
  () => props.confirmMessage || t('pro.tabs.closeConfirm.message'),
)
const resolvedConfirmTitle = computed(() => props.confirmTitle || t('pro.tabs.closeConfirm.title'))

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'tab-remove': [name: string]
  'tab-click': [pane: { paneName: string; props: Record<string, unknown> }, ev: Event]
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
      await ElMessageBox.confirm(resolvedConfirmMessage.value, resolvedConfirmTitle.value, {
        confirmButtonText: t('pro.tabs.closeConfirm.ok'),
        cancelButtonText: t('pro.tabs.closeConfirm.cancel'),
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
.pro-tabs.el-tabs .el-tabs__header {
  margin-bottom: var(--pro-space-4);
}

.pro-tabs.el-tabs .el-tabs__item {
  font-size: var(--pro-text-sm);
  font-weight: 500;
  padding: 0 var(--pro-space-4);
  height: 38px;
  line-height: 38px;
  color: var(--pro-text-secondary);
  transition: color var(--pro-transition-fast);
}

.pro-tabs.el-tabs .el-tabs__item:hover {
  color: var(--pro-text-primary);
}

.pro-tabs.el-tabs .el-tabs__item.is-active {
  color: var(--pro-color-primary);
  font-weight: 600;
}

.pro-tabs.el-tabs .el-tabs__active-bar {
  background-color: var(--pro-color-primary);
  height: 2px;
}

.pro-tabs.el-tabs .el-tabs__item .el-icon.is-icon-close {
  width: 14px;
  height: 14px;
  margin-left: var(--pro-space-1);
  border-radius: var(--pro-radius-full);
  transition: all var(--pro-transition-fast);
}

.pro-tabs.el-tabs .el-tabs__item .el-icon.is-icon-close:hover {
  background-color: var(--pro-color-danger-light);
  color: var(--pro-color-danger);
}

/* Card variant refinement */
.pro-tabs.el-tabs--card .el-tabs__header .el-tabs__nav {
  border-radius: 0.375rem 0.375rem 0 0;
}

.pro-tabs.el-tabs--card .el-tabs__item {
  border-radius: 0;
}

.pro-tabs.el-tabs--card .el-tabs__item:first-child {
  border-radius: 0.375rem 0 0 0;
}
</style>
