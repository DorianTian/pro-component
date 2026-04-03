<script setup lang="ts">
import { ref, computed, type PropType } from 'vue'
import { ArrowDown, ArrowUp, Search, RefreshLeft } from '@element-plus/icons-vue'
import { useValueType, useProLocale } from '@pro/hooks'

import type { ProColumnDef, SearchConfig } from '../types'
import { DEFAULT_SEARCH_SPAN, DEFAULT_SEARCH_ORDER } from '../constants'

defineOptions({ name: 'QueryFilter' })

const props = defineProps({
  columns: {
    type: Array as PropType<ProColumnDef[]>,
    required: true,
  },
  searchConfig: {
    type: [Boolean, Object] as PropType<boolean | SearchConfig>,
    default: true,
  },
  modelValue: {
    type: Object as PropType<Record<string, unknown>>,
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits<{
  'update:modelValue': [values: Record<string, unknown>]
  search: [values: Record<string, unknown>]
  reset: []
}>()

const { getSearchConfig } = useValueType()
const { t } = useProLocale()

const isCollapsed = ref(
  typeof props.searchConfig === 'object' ? (props.searchConfig.defaultCollapsed ?? false) : false,
)

const searchableColumns = computed(() => {
  return props.columns
    .filter((col) => !col.hideInSearch)
    .sort((a, b) => {
      const orderA = a.searchConfig?.order ?? DEFAULT_SEARCH_ORDER
      const orderB = b.searchConfig?.order ?? DEFAULT_SEARCH_ORDER
      return orderA - orderB
    })
})

const span = computed(() => {
  if (typeof props.searchConfig === 'object' && props.searchConfig.span) {
    return props.searchConfig.span
  }
  return DEFAULT_SEARCH_SPAN
})

const GRID_COLUMNS = 24

/** Calculate how many columns fit in one row based on actual per-column spans */
const itemsInFirstRow = computed(() => {
  let usedSpan = 0
  let count = 0
  for (const col of searchableColumns.value) {
    const colSpan = col.searchConfig?.span ?? span.value
    if (usedSpan + colSpan > GRID_COLUMNS) break
    usedSpan += colSpan
    count++
  }
  return Math.max(count, 1)
})

const visibleColumns = computed(() => {
  if (!isCollapsed.value) return searchableColumns.value
  return searchableColumns.value.slice(0, itemsInFirstRow.value)
})

const hasCollapsibleOverflow = computed(() => {
  return searchableColumns.value.length > itemsInFirstRow.value
})

function getColumnSearchConfig(col: ProColumnDef) {
  const valueType = col.valueType ?? 'text'
  return getSearchConfig(valueType)
}

function updateField(dataIndex: string, value: unknown): void {
  const newValues = { ...props.modelValue, [dataIndex]: value }
  emit('update:modelValue', newValues)
}

function handleSearch(): void {
  emit('search', { ...props.modelValue })
}

function handleReset(): void {
  const resetValues: Record<string, unknown> = {}
  searchableColumns.value.forEach((col) => {
    const key = col.dataIndex
    resetValues[key] = col.searchConfig?.defaultValue ?? undefined
  })
  emit('update:modelValue', resetValues)
  emit('reset')
}

function toggleCollapse(): void {
  isCollapsed.value = !isCollapsed.value
}
</script>

<template>
  <div class="pro-query-filter">
    <el-form label-position="top" @submit.prevent="handleSearch">
      <el-row :gutter="16">
        <!-- Search fields -->
        <el-col
          v-for="col in visibleColumns"
          :key="col.key ?? String(col.dataIndex)"
          :span="col.searchConfig?.span ?? span"
        >
          <el-form-item :label="col.title">
            <!-- Custom search render -->
            <template v-if="col.searchConfig?.render">
              <component :is="col.searchConfig.render()" />
            </template>

            <!-- valueEnum-driven select -->
            <el-select
              v-else-if="col.valueEnum"
              :model-value="modelValue[String(col.dataIndex)]"
              clearable
              :placeholder="t('pro.form.select.placeholder')"
              @update:model-value="updateField(String(col.dataIndex), $event)"
            >
              <el-option
                v-for="(item, enumKey) in col.valueEnum"
                :key="enumKey"
                :label="item.text"
                :value="enumKey"
              />
            </el-select>

            <!-- valueType-driven component -->
            <component
              :is="getColumnSearchConfig(col)?.component ?? 'ElInput'"
              v-else
              v-bind="getColumnSearchConfig(col)?.props ?? {}"
              :model-value="modelValue[String(col.dataIndex)]"
              clearable
              :placeholder="t('pro.form.input.placeholder')"
              @update:model-value="updateField(String(col.dataIndex), $event)"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- Action buttons — outside grid, always right-aligned -->
      <div class="pro-query-filter__actions">
        <el-button
          type="primary"
          size="default"
          :icon="Search"
          :loading="loading"
          @click="handleSearch"
        >
          {{ t('pro.table.queryFilter.search') }}
        </el-button>
        <el-button size="default" :icon="RefreshLeft" @click="handleReset">
          {{ t('pro.table.queryFilter.reset') }}
        </el-button>
        <el-button
          v-if="hasCollapsibleOverflow"
          link
          type="primary"
          size="default"
          @click="toggleCollapse"
        >
          {{
            isCollapsed ? t('pro.table.queryFilter.expand') : t('pro.table.queryFilter.collapse')
          }}
          <el-icon class="pro-query-filter__collapse-icon">
            <ArrowDown v-if="isCollapsed" />
            <ArrowUp v-else />
          </el-icon>
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<style scoped>
.pro-query-filter {
  padding: var(--pro-space-6) var(--pro-space-7) var(--pro-space-1);
  border-bottom: 1px solid var(--pro-border-light);
}

.pro-query-filter :deep(.el-form-item) {
  margin-bottom: var(--pro-space-5);
}

.pro-query-filter__actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: var(--pro-space-3);
  padding-bottom: var(--pro-space-5);
}

.pro-query-filter__collapse-icon {
  margin-left: 2px;
}
</style>
