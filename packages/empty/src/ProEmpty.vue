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
import { ElEmpty, ElButton } from 'element-plus'

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
  /** Show retry button for error type */
  showRetry?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'no-data',
  description: undefined,
  image: undefined,
  imageSize: 120,
  showRetry: true,
})

const emit = defineEmits<{
  retry: []
}>()

/** Preset config per empty type */
const PRESET_MAP: Record<EmptyType, { description: string; icon: string }> = {
  'no-data': {
    description: 'No data yet',
    icon: 'inbox',
  },
  'no-result': {
    description: 'No results found',
    icon: 'search',
  },
  error: {
    description: 'Failed to load data',
    icon: 'error',
  },
  'no-permission': {
    description: 'You do not have permission to view this',
    icon: 'lock',
  },
  custom: {
    description: '',
    icon: '',
  },
}

const preset = computed(() => PRESET_MAP[props.type] ?? PRESET_MAP['no-data'])
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
          alt=""
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
              x="20"
              y="35"
              width="80"
              height="55"
              rx="6"
              fill="var(--pro-bg-sunken)"
              stroke="var(--pro-border-default)"
              stroke-width="1.5"
            />
            <path
              d="M20 60h25l5 10h20l5-10h25"
              stroke="var(--pro-border-default)"
              stroke-width="1.5"
              fill="none"
            />
            <path
              d="M45 50h30"
              stroke="var(--pro-text-disabled)"
              stroke-width="2"
              stroke-linecap="round"
            />
            <path
              d="M50 58h20"
              stroke="var(--pro-text-disabled)"
              stroke-width="2"
              stroke-linecap="round"
            />
          </template>
          <!-- No Result (search) -->
          <template v-else-if="iconType === 'search'">
            <circle
              cx="52"
              cy="52"
              r="24"
              fill="var(--pro-bg-sunken)"
              stroke="var(--pro-border-default)"
              stroke-width="1.5"
            />
            <line
              x1="70"
              y1="70"
              x2="92"
              y2="92"
              stroke="var(--pro-text-disabled)"
              stroke-width="3"
              stroke-linecap="round"
            />
            <path
              d="M44 52h16"
              stroke="var(--pro-text-disabled)"
              stroke-width="2"
              stroke-linecap="round"
            />
          </template>
          <!-- Error -->
          <template v-else-if="iconType === 'error'">
            <circle
              cx="60"
              cy="55"
              r="30"
              fill="var(--pro-color-danger-light)"
              stroke="var(--pro-color-danger)"
              stroke-width="1.5"
              opacity="0.8"
            />
            <path
              d="M60 40v20"
              stroke="var(--pro-color-danger)"
              stroke-width="3"
              stroke-linecap="round"
            />
            <circle cx="60" cy="68" r="2" fill="var(--pro-color-danger)" />
          </template>
          <!-- No Permission (lock) -->
          <template v-else-if="iconType === 'lock'">
            <rect
              x="35"
              y="52"
              width="50"
              height="36"
              rx="6"
              fill="var(--pro-bg-sunken)"
              stroke="var(--pro-border-default)"
              stroke-width="1.5"
            />
            <path
              d="M45 52V42a15 15 0 0130 0v10"
              fill="none"
              stroke="var(--pro-border-default)"
              stroke-width="1.5"
            />
            <circle cx="60" cy="68" r="4" fill="var(--pro-text-disabled)" />
            <line
              x1="60"
              y1="72"
              x2="60"
              y2="78"
              stroke="var(--pro-text-disabled)"
              stroke-width="2"
              stroke-linecap="round"
            />
          </template>
        </svg>
      </slot>
    </div>

    <p class="pro-empty__description">{{ displayDescription }}</p>

    <div v-if="type === 'error' && showRetry" class="pro-empty__actions">
      <slot name="extra">
        <ElButton type="primary" size="small" @click="emit('retry')">Retry</ElButton>
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
  padding: var(--pro-space-9) var(--pro-space-5);
  text-align: center;
}

.pro-empty__image {
  margin-bottom: var(--pro-space-5);
}

.pro-empty__svg {
  opacity: 0.85;
}

.pro-empty__description {
  margin: 0 0 var(--pro-space-5);
  color: var(--pro-text-secondary);
  font-size: var(--pro-text-sm);
  line-height: var(--pro-line-height-base);
  max-width: 320px;
}

.pro-empty__actions {
  display: flex;
  gap: var(--pro-space-3);
}
</style>
