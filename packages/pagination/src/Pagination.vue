<script setup lang="ts">
import { computed } from 'vue'
import { ElPagination } from 'element-plus'

defineOptions({ name: 'Pagination' })

interface Props {
  /** Total number of items */
  total?: number
  /** Current page number (v-model:current-page) */
  currentPage?: number
  /** Items per page (v-model:page-size) */
  pageSize?: number
  /** Available page size options */
  pageSizes?: number[]
  /** Hide pagination when total fits in one page */
  autoHide?: boolean
  /** Compact mode — only shows prev/pager/next */
  compact?: boolean
  /** Show the quick jumper input */
  showQuickJumper?: boolean
  /** Show the page size selector */
  showSizeChanger?: boolean
  /** Show total count */
  showTotal?: boolean
  /** Custom total display formatter. Receives total and current range [start, end] */
  totalFormatter?: (total: number, range: [number, number]) => string
  /** Disable all pagination interactions */
  disabled?: boolean
  /** Show background on pager buttons */
  background?: boolean
  /** Raw layout string override — bypasses semantic props when set */
  layout?: string
}

const props = withDefaults(defineProps<Props>(), {
  total: 0,
  pageSizes: () => [10, 20, 50, 100],
  autoHide: false,
  compact: false,
  showQuickJumper: true,
  showSizeChanger: true,
  showTotal: true,
  disabled: false,
  background: false,
})

const emit = defineEmits<{
  'update:current-page': [page: number]
  'update:page-size': [size: number]
  change: [pagination: { current: number; pageSize: number }]
}>()

const effectivePageSize = computed(() => props.pageSize ?? props.pageSizes[0] ?? 20)

/** Hide when total fits in one page */
const shouldShow = computed(() => {
  if (!props.autoHide) return true
  return props.total > effectivePageSize.value
})

/** Build layout string from semantic props, or use raw override */
const resolvedLayout = computed(() => {
  if (props.layout) return props.layout
  if (props.compact) return 'prev, pager, next'

  const parts: string[] = []

  if (props.showTotal) {
    parts.push(props.totalFormatter ? 'slot' : 'total')
  }
  if (props.showSizeChanger) parts.push('sizes')
  parts.push('prev', 'pager', 'next')
  if (props.showQuickJumper) parts.push('jumper')

  return parts.join(', ')
})

/** Current display range [start, end] for totalFormatter */
const displayRange = computed<[number, number]>(() => {
  const page = props.currentPage ?? 1
  const size = effectivePageSize.value
  const start = Math.min((page - 1) * size + 1, props.total)
  const end = Math.min(page * size, props.total)
  return [start, end]
})

function handleCurrentChange(page: number): void {
  emit('update:current-page', page)
  emit('change', { current: page, pageSize: effectivePageSize.value })
}

function handleSizeChange(size: number): void {
  emit('update:page-size', size)
  emit('change', { current: 1, pageSize: size })
}
</script>

<template>
  <ElPagination
    v-if="shouldShow"
    :current-page="currentPage"
    :page-size="pageSize"
    :total="total"
    :page-sizes="pageSizes"
    :layout="resolvedLayout"
    :disabled="disabled"
    :background="background"
    class="pro-pagination"
    @update:current-page="handleCurrentChange"
    @update:page-size="handleSizeChange"
  >
    <span v-if="totalFormatter" class="pro-pagination__total">
      {{ totalFormatter(total, displayRange) }}
    </span>
  </ElPagination>
</template>
