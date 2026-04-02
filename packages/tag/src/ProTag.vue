<script setup lang="ts">
/**
 * ProTag — Enhanced tag with preset status colors and optional close confirm.
 */
import { computed } from 'vue'
import { ElTag } from 'element-plus'

defineOptions({ name: 'ProTag', inheritAttrs: false })

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'processing' | 'default'

interface Props {
  status?: StatusType
  color?: string
  bordered?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  status: undefined,
  color: undefined,
  bordered: true,
})

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

const tagType = computed(() => statusConfig.value?.type || undefined)

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
const isProcessing = computed(() => props.status === 'processing')
</script>

<template>
  <ElTag
    v-bind="$attrs"
    :type="tagType"
    :style="customStyle"
    :class="[
      'pro-tag',
      {
        'pro-tag--bordered': bordered,
        'pro-tag--status': status,
      },
    ]"
  >
    <span
      v-if="showDot"
      class="pro-tag__dot"
      :class="{ 'pro-tag__dot--pulse': isProcessing }"
      :style="{ backgroundColor: dotColor }"
    />
    <slot />
  </ElTag>
</template>

<style>
.pro-tag.el-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  border-radius: 9999px;
  padding: 0 10px;
  height: 24px;
  line-height: 1;
  font-size: 12px;
}

.pro-tag__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.pro-tag__dot--pulse {
  animation: pro-tag-pulse 1.5s ease-in-out infinite;
}

@keyframes pro-tag-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(0.85);
  }
}
</style>
