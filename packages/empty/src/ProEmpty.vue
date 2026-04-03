<script setup lang="ts">
/**
 * ProEmpty — Enhanced empty state with preset types and illustrations.
 *
 * Usage:
 *   <ProEmpty type="no-data" />
 *   <ProEmpty type="no-result" description="No matching records">
 *     <template #extra><ElButton>Clear Filters</ElButton></template>
 *   </ProEmpty>
 *   <ProEmpty type="error" @retry="refetch" />
 */
import { computed } from 'vue'
import { ElButton } from 'element-plus'
import { useProLocale } from '@pro/hooks'

defineOptions({ name: 'ProEmpty', inheritAttrs: false })

type EmptyType = 'no-data' | 'no-result' | 'error' | 'no-permission' | 'custom'

interface Props {
  /** Preset empty type */
  type?: EmptyType
  /** Custom description (overrides preset) */
  description?: string
  /** Custom image URL (overrides preset SVG) */
  image?: string
  /** Image size in pixels */
  imageSize?: number
  /** Alt text for custom image (accessibility) */
  imageAlt?: string
  /** Show retry button for error type */
  showRetry?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'no-data',
  description: undefined,
  image: undefined,
  imageSize: 120,
  imageAlt: undefined,
  showRetry: true,
})

const emit = defineEmits<{
  retry: []
}>()

const { t } = useProLocale()

/** Icon mapping per empty type */
const ICON_MAP: Record<EmptyType, string> = {
  'no-data': 'inbox',
  'no-result': 'search',
  error: 'error',
  'no-permission': 'lock',
  custom: '',
}

/** i18n description mapping per empty type */
const DESCRIPTION_KEY_MAP: Record<EmptyType, string> = {
  'no-data': 'pro.empty.noData.description',
  'no-result': 'pro.empty.noResult.description',
  error: 'pro.empty.error.description',
  'no-permission': 'pro.empty.noPermission.description',
  custom: '',
}

const preset = computed(() => ({
  description: DESCRIPTION_KEY_MAP[props.type] ? t(DESCRIPTION_KEY_MAP[props.type]) : '',
  icon: ICON_MAP[props.type] ?? ICON_MAP['no-data'],
}))
const displayDescription = computed(() => props.description ?? preset.value.description)
const iconType = computed(() => preset.value.icon)
</script>

<template>
  <div v-bind="$attrs" class="pro-empty">
    <div class="pro-empty__image">
      <slot name="image">
        <img
          v-if="image"
          :src="image"
          :style="{ width: `${imageSize}px`, height: `${imageSize}px` }"
          :alt="imageAlt ?? displayDescription"
        />
        <svg
          v-else
          :width="imageSize"
          :height="imageSize"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="pro-empty__svg"
        >
          <!-- No Data (inbox) -->
          <template v-if="iconType === 'inbox'">
            <rect
              x="22"
              y="30"
              width="76"
              height="56"
              rx="5"
              :style="{
                fill: 'var(--pro-bg-sunken, #f5f5f5)',
                stroke: 'var(--pro-border-default, #d4d4d4)',
              }"
              stroke-width="1.2"
            />
            <path
              d="M22 58h22l6 12h20l6-12h22"
              :style="{ stroke: 'var(--pro-border-default, #d4d4d4)' }"
              stroke-width="1.2"
              fill="none"
            />
            <path
              d="M46 44h28"
              :style="{ stroke: 'var(--pro-text-tertiary, #a3a3a3)' }"
              stroke-width="1.2"
              stroke-linecap="round"
            />
            <path
              d="M50 52h20"
              :style="{ stroke: 'var(--pro-text-tertiary, #a3a3a3)' }"
              stroke-width="1.2"
              stroke-linecap="round"
            />
          </template>
          <!-- No Result (search) -->
          <template v-else-if="iconType === 'search'">
            <circle
              cx="52"
              cy="50"
              r="22"
              :style="{
                fill: 'var(--pro-bg-sunken, #f5f5f5)',
                stroke: 'var(--pro-border-default, #d4d4d4)',
              }"
              stroke-width="1.2"
            />
            <line
              x1="68"
              y1="66"
              x2="88"
              y2="86"
              :style="{ stroke: 'var(--pro-text-tertiary, #a3a3a3)' }"
              stroke-width="2.5"
              stroke-linecap="round"
            />
            <path
              d="M44 50h16"
              :style="{ stroke: 'var(--pro-text-tertiary, #a3a3a3)' }"
              stroke-width="1.2"
              stroke-linecap="round"
            />
          </template>
          <!-- Error -->
          <template v-else-if="iconType === 'error'">
            <circle
              cx="60"
              cy="56"
              r="28"
              fill="var(--pro-color-danger-light, #fef2f2)"
              stroke="var(--pro-color-danger, #dc2626)"
              stroke-width="1.2"
            />
            <path
              d="M60 42v18"
              stroke="var(--pro-color-danger, #dc2626)"
              stroke-width="2"
              stroke-linecap="round"
            />
            <circle cx="60" cy="68" r="2" fill="var(--pro-color-danger, #dc2626)" />
          </template>
          <!-- No Permission (lock) -->
          <template v-else-if="iconType === 'lock'">
            <rect
              x="36"
              y="52"
              width="48"
              height="34"
              rx="5"
              :style="{
                fill: 'var(--pro-bg-sunken, #f5f5f5)',
                stroke: 'var(--pro-border-default, #d4d4d4)',
              }"
              stroke-width="1.2"
            />
            <path
              d="M46 52V42a14 14 0 0128 0v10"
              fill="none"
              :style="{ stroke: 'var(--pro-border-default, #d4d4d4)' }"
              stroke-width="1.2"
              stroke-linecap="round"
            />
            <circle
              cx="60"
              cy="66"
              r="3.5"
              :style="{ fill: 'var(--pro-text-tertiary, #a3a3a3)' }"
            />
            <line
              x1="60"
              y1="69.5"
              x2="60"
              y2="76"
              :style="{ stroke: 'var(--pro-text-tertiary, #a3a3a3)' }"
              stroke-width="1.2"
              stroke-linecap="round"
            />
          </template>
        </svg>
      </slot>
    </div>

    <p class="pro-empty__description">{{ displayDescription }}</p>

    <div v-if="type === 'error' && showRetry" class="pro-empty__actions">
      <slot name="extra">
        <ElButton type="primary" size="small" @click="emit('retry')">{{
          t('pro.empty.retry')
        }}</ElButton>
      </slot>
    </div>
    <div v-else-if="$slots.extra" class="pro-empty__actions">
      <slot name="extra" />
    </div>
  </div>
</template>

<style>
.pro-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 240px;
  padding: 40px 20px;
}

.pro-empty__image {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.pro-empty__svg {
  opacity: 0.85;
}

.pro-empty__description {
  margin: 0 0 16px;
  color: var(--pro-text-secondary, #737373);
  font-size: var(--pro-text-sm, 14px);
  line-height: var(--pro-line-height-base, 1.5);
  max-width: 320px;
}

.pro-empty__actions {
  display: flex;
  gap: 8px;
}
</style>
