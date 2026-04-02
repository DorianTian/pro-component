<script setup lang="ts">
/**
 * ProResult — Enhanced result page with preset types for common scenarios.
 *
 * Usage:
 *   <ProResult type="success" title="Operation Succeeded" />
 *   <ProResult type="403" title="Access Denied">
 *     <template #extra><ElButton type="primary" @click="goHome">Go Home</ElButton></template>
 *   </ProResult>
 */
import { computed } from 'vue'
import { ElResult } from 'element-plus'

defineOptions({ name: 'ProResult', inheritAttrs: false })

type ResultType = 'success' | 'error' | 'warning' | 'info' | '403' | '404' | '500'

interface Props {
  /** Result type — maps to icon and default title/subtitle */
  type?: ResultType
  /** Custom title (overrides preset) */
  title?: string
  /** Custom subtitle (overrides preset) */
  subTitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'success',
  title: undefined,
  subTitle: undefined,
})

type ElResultIcon = 'success' | 'error' | 'warning' | 'info'

const PRESET_MAP: Record<ResultType, { icon: ElResultIcon; title: string; subTitle: string }> = {
  success: {
    icon: 'success',
    title: 'Operation Succeeded',
    subTitle: 'Your request has been processed successfully.',
  },
  error: {
    icon: 'error',
    title: 'Operation Failed',
    subTitle: 'Something went wrong. Please try again.',
  },
  warning: {
    icon: 'warning',
    title: 'Warning',
    subTitle: 'Please review the following information.',
  },
  info: {
    icon: 'info',
    title: 'Information',
    subTitle: '',
  },
  '403': {
    icon: 'error',
    title: '403 — Access Denied',
    subTitle: 'You do not have permission to access this page.',
  },
  '404': {
    icon: 'warning',
    title: '404 — Page Not Found',
    subTitle: 'The page you are looking for does not exist.',
  },
  '500': {
    icon: 'error',
    title: '500 — Server Error',
    subTitle: 'An unexpected error occurred on the server.',
  },
}

const preset = computed(() => PRESET_MAP[props.type] ?? PRESET_MAP.success)
const displayIcon = computed(() => preset.value.icon)
const displayTitle = computed(() => props.title ?? preset.value.title)
const displaySubTitle = computed(() => props.subTitle ?? preset.value.subTitle)

const isHttpError = computed(() => ['403', '404', '500'].includes(props.type))
</script>

<template>
  <div v-bind="$attrs" :class="['pro-result', { 'pro-result--http': isHttpError }]">
    <!-- HTTP error code watermark — positioned behind content -->
    <span v-if="isHttpError" class="pro-result__code">{{ type }}</span>

    <ElResult :icon="displayIcon" :title="displayTitle" :sub-title="displaySubTitle">
      <template v-if="$slots.icon" #icon>
        <slot name="icon" />
      </template>

      <template v-if="$slots.title" #title>
        <slot name="title" />
      </template>

      <template v-if="$slots['sub-title']" #sub-title>
        <slot name="sub-title" />
      </template>

      <template #extra>
        <slot name="extra" />
      </template>
    </ElResult>
  </div>
</template>

<style>
.pro-result {
  position: relative;
  overflow: hidden;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--pro-space-9, 36px) var(--pro-space-5, 20px);
}

.pro-result__code {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 180px;
  font-weight: 800;
  color: var(--pro-border-light, #f0f0f0);
  opacity: 0.5;
  pointer-events: none;
  user-select: none;
  z-index: 0;
  line-height: 1;
}

.pro-result .el-result {
  position: relative;
  z-index: 1;
}
</style>
