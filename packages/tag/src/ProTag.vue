<script setup lang="ts">
/**
 * ProTag — Enhanced tag with preset status colors and optional close confirm.
 *
 * Usage:
 *   <ProTag status="success">Active</ProTag>
 *   <ProTag status="error" closable @close="handleClose">Failed</ProTag>
 *   <ProTag color="#f50">Custom</ProTag>
 */
import { computed } from 'vue'
import { ElTag } from 'element-plus'

defineOptions({ name: 'ProTag', inheritAttrs: false })

/** Preset status types mapping to semantic colors */
type StatusType = 'success' | 'warning' | 'error' | 'info' | 'processing' | 'default'

interface Props {
  /** Preset status — maps to semantic color palette */
  status?: StatusType
  /** Custom color (overrides status) */
  color?: string
  /** Whether the tag is bordered */
  bordered?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  status: undefined,
  color: undefined,
  bordered: true,
})

/** Status → Element Plus type + custom styles mapping */
const STATUS_MAP: Record<StatusType, { type: string; dotColor: string }> = {
  success: { type: 'success', dotColor: 'var(--pro-color-success)' },
  warning: { type: 'warning', dotColor: 'var(--pro-color-warning)' },
  error: { type: 'danger', dotColor: 'var(--pro-color-danger)' },
  info: { type: 'info', dotColor: 'var(--pro-color-info)' },
  processing: { type: '', dotColor: 'var(--pro-color-primary)' },
  default: { type: '', dotColor: 'var(--pro-text-disabled)' },
}

const statusConfig = computed(() => {
  if (!props.status) return null
  return STATUS_MAP[props.status] ?? STATUS_MAP.default
})

const tagType = computed(() => {
  if (statusConfig.value?.type) return statusConfig.value.type
  return undefined
})

const customStyle = computed(() => {
  if (props.color) {
    return {
      '--el-tag-bg-color': `${props.color}14`,
      '--el-tag-border-color': `${props.color}40`,
      '--el-tag-text-color': props.color,
    }
  }
  return {}
})

const showDot = computed(() => !!props.status)
const dotColor = computed(() => statusConfig.value?.dotColor ?? 'var(--pro-text-disabled)')
</script>

<template>
  <ElTag
    v-bind="$attrs"
    :type="tagType"
    :style="customStyle"
    :class="['pro-tag', { 'pro-tag--bordered': bordered, 'pro-tag--status': status }]"
  >
    <span v-if="showDot" class="pro-tag__dot" :style="{ backgroundColor: dotColor }" />
    <slot />
  </ElTag>
</template>

<style>
.pro-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: var(--pro-font-weight-medium);
  border-radius: var(--pro-radius-pill);
}

.pro-tag__dot {
  width: 6px;
  height: 6px;
  border-radius: var(--pro-radius-full);
  flex-shrink: 0;
}

.pro-tag--status.pro-tag--status {
  border-radius: var(--pro-radius-pill);
}

/* Processing status gets a pulse animation */
.pro-tag--status .pro-tag__dot {
  animation: none;
}

.pro-tag:has([style*='--pro-color-primary']) .pro-tag__dot {
  animation: pro-tag-pulse 1.5s ease-in-out infinite;
}

@keyframes pro-tag-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
</style>
