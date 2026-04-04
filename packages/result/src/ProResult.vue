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
import { useProLocale } from '@pro/hooks'

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

const { t } = useProLocale()

const presetMap = computed<
  Record<ResultType, { icon: ElResultIcon; title: string; subTitle: string }>
>(() => ({
  success: {
    icon: 'success',
    title: t('pro.result.success.title'),
    subTitle: t('pro.result.success.subtitle'),
  },
  error: {
    icon: 'error',
    title: t('pro.result.error.title'),
    subTitle: t('pro.result.error.subtitle'),
  },
  warning: {
    icon: 'warning',
    title: t('pro.result.warning.title'),
    subTitle: t('pro.result.warning.subtitle'),
  },
  info: {
    icon: 'info',
    title: t('pro.result.info.title'),
    subTitle: t('pro.result.info.subtitle'),
  },
  '403': {
    icon: 'error',
    title: t('pro.result.http403.title'),
    subTitle: t('pro.result.http403.subtitle'),
  },
  '404': {
    icon: 'info',
    title: t('pro.result.http404.title'),
    subTitle: t('pro.result.http404.subtitle'),
  },
  '500': {
    icon: 'error',
    title: t('pro.result.http500.title'),
    subTitle: t('pro.result.http500.subtitle'),
  },
}))

const preset = computed(() => presetMap.value[props.type] ?? presetMap.value.success)
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
