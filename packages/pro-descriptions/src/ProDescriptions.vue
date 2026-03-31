<script setup lang="ts">
import { h, toRef } from 'vue'
import { ElDescriptions, ElDescriptionsItem, ElTag, ElSkeleton } from 'element-plus'
import { useProDescriptions } from './composables/use-pro-descriptions'

import type { ProColumnDef, StatusType } from '@pro/utils'
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

/* Label styling */
.pro-descriptions :deep(.el-descriptions__label) {
  font-size: var(--pro-text-xs);
  font-weight: var(--pro-font-weight-medium);
  color: var(--pro-text-tertiary);
  letter-spacing: 0.02em;
}

/* Value styling */
.pro-descriptions :deep(.el-descriptions__content) {
  font-size: var(--pro-text-base);
  font-weight: var(--pro-font-weight-medium);
  color: var(--pro-text-primary);
}

/* Cell spacing */
.pro-descriptions :deep(.el-descriptions__cell) {
  padding-bottom: var(--pro-space-4);
}

/* Border variant: refine borders */
.pro-descriptions :deep(.el-descriptions--border .el-descriptions__cell) {
  border-color: var(--pro-border-light);
}

/* Tags inside descriptions */
.pro-descriptions :deep(.el-tag) {
  border-radius: var(--pro-radius-pill);
}

/* Title styling */
.pro-descriptions :deep(.el-descriptions__title) {
  font-size: var(--pro-text-md);
  font-weight: var(--pro-font-weight-semibold);
  color: var(--pro-text-primary);
}

/* Loading state spacing */
.pro-descriptions--loading {
  padding: var(--pro-space-5);
}
</style>
