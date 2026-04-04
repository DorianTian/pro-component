<script setup lang="ts">
import { h, toRef } from 'vue'
import {
  ElDescriptions,
  ElDescriptionsItem,
  ElTag,
  ElSkeleton,
  ElProgress,
  ElRate,
  ElImage,
} from 'element-plus'
import { useProLocale } from '@pro/hooks'
import { useProDescriptions } from './composables/use-pro-descriptions'

import type { ProColumnDef, StatusType, ValueType } from '@pro/utils'
import type { DescriptionItem } from './composables/use-pro-descriptions'

defineOptions({ name: 'ProDescriptions' })

const props = withDefaults(
  defineProps<{
    columns: ProColumnDef[]
    data: Record<string, unknown>
    title?: string
    column?: number
    border?: boolean
    loading?: boolean
    size?: 'large' | 'default' | 'small'
    descriptionsProps?: Record<string, unknown>
  }>(),
  {
    column: 3,
    border: false,
    loading: false,
    size: 'default',
  },
)

const { t } = useProLocale()

const { descriptionItems } = useProDescriptions({
  columns: toRef(props, 'columns'),
  data: toRef(props, 'data'),
})

const STATUS_TAG_TYPE_MAP: Record<
  StatusType,
  'success' | 'warning' | 'danger' | 'info' | undefined
> = {
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
  default: undefined,
}

/** Render visual value types as actual components instead of plain text */
function renderVisualValueType(valueType: ValueType, value: unknown) {
  if (value === null || value === undefined) return '-'

  switch (valueType) {
    case 'progress':
      return h(ElProgress, {
        percentage: Number(value),
        strokeWidth: 8,
        class: 'pro-descriptions__progress',
      })

    case 'rate':
      return h(ElRate, {
        modelValue: Number(value),
        disabled: true,
        allowHalf: true,
        class: 'pro-descriptions__rate',
      })

    case 'switch':
      return h('span', { class: `pro-descriptions__switch ${value ? 'is-active' : ''}` }, [
        h('span', { class: 'pro-descriptions__switch-dot' }),
        h(
          'span',
          { class: 'pro-descriptions__switch-text' },
          value ? t('pro.descriptions.switch.on') : t('pro.descriptions.switch.off'),
        ),
      ])

    case 'code':
      return h('code', { class: 'pro-descriptions__code' }, String(value))

    case 'image':
      return h(ElImage, {
        src: String(value),
        fit: 'cover',
        previewSrcList: [String(value)],
        class: 'pro-descriptions__image',
        style: { width: '80px', height: '80px', borderRadius: 'var(--pro-radius-md)' },
      })

    case 'percent':
      return h('span', { class: 'pro-descriptions__percent' }, [
        h('span', { class: 'pro-descriptions__percent-value' }, String(value)),
        h('span', { class: 'pro-descriptions__percent-symbol' }, '%'),
      ])

    default:
      return null
  }
}

/** Value types that get visual component rendering */
const VISUAL_VALUE_TYPES = new Set<string>([
  'progress',
  'rate',
  'switch',
  'code',
  'image',
  'percent',
])

function renderItemContent(item: DescriptionItem) {
  // Custom render takes priority
  if (item.hasCustomRender && item.descriptionsRender) {
    return item.descriptionsRender(item.value, props.data)
  }

  // valueEnum → render as tag
  if (item.displayText) {
    const tagType = item.statusType ? STATUS_TAG_TYPE_MAP[item.statusType] : undefined
    return h(ElTag, { type: tagType, size: 'small' }, { default: () => item.displayText })
  }

  // Visual value types → render as components
  const valueType = item.column.valueType ?? 'text'
  if (VISUAL_VALUE_TYPES.has(valueType)) {
    const visual = renderVisualValueType(valueType as ValueType, item.value)
    if (visual) return visual
  }

  // Default: formatted text
  return item.formattedValue
}

defineExpose({
  descriptionItems,
})
</script>

<template>
  <div class="pro-descriptions" :class="{ 'pro-descriptions--loading': loading }">
    <ElSkeleton v-if="loading" :rows="4" animated />
    <ElDescriptions
      v-else
      :title="title"
      :column="column"
      :border="border"
      :size="size"
      v-bind="descriptionsProps"
    >
      <ElDescriptionsItem
        v-for="item in descriptionItems"
        :key="item.dataIndex"
        :label="item.label"
        :span="item.span"
      >
        <component :is="() => renderItemContent(item)" />
      </ElDescriptionsItem>
    </ElDescriptions>
  </div>
</template>

<style scoped>
.pro-descriptions {
  width: 100%;
}

.pro-descriptions--loading {
  padding: var(--pro-space-5);
}
/* Visual value type styles are in themes/overrides/descriptions.css (global)
   because h() rendered elements don't get Vue scoped attributes. */
</style>
