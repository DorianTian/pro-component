<script setup lang="ts">
import { ref, computed, type PropType } from 'vue'
import { useValueType, useProLocale } from '@pro/hooks'

import type { ProColumnDef, SearchConfig } from '../types'
import { DEFAULT_LABEL_WIDTH, DEFAULT_SEARCH_SPAN, DEFAULT_SEARCH_ORDER } from '../constants'

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

const labelWidth = computed(() => {
  if (typeof props.searchConfig === 'object' && props.searchConfig.labelWidth) {
    return typeof props.searchConfig.labelWidth === 'number'
      ? `${props.searchConfig.labelWidth}px`
      : props.searchConfig.labelWidth
  }
  return `${DEFAULT_LABEL_WIDTH}px`
})

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

const visibleColumns = computed(() => {
  if (!isCollapsed.value) return searchableColumns.value
  const itemsPerRow = Math.floor(GRID_COLUMNS / span.value)
  return searchableColumns.value.slice(0, Math.max(itemsPerRow - 1, 1))
})

const hasCollapsibleOverflow = computed(() => {
  const itemsPerRow = Math.floor(GRID_COLUMNS / span.value)
  return searchableColumns.value.length >= itemsPerRow
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
    const key = String(col.dataIndex)
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
  <el-form class="pro-query-filter" :label-width="labelWidth" inline @submit.prevent="handleSearch">
    <el-row :gutter="16">
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
          <template
            v-else-if="col.valueEnum && (col.valueType === 'select' || col.valueType === 'radio')"
          >
            <el-select
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
          </template>

          <!-- valueType-driven component -->
          <template v-else>
            <component
              :is="getColumnSearchConfig(col)?.component ?? 'ElInput'"
              v-bind="getColumnSearchConfig(col)?.props ?? {}"
              :model-value="modelValue[String(col.dataIndex)]"
              clearable
              :placeholder="`Please enter ${col.title}`"
              @update:model-value="updateField(String(col.dataIndex), $event)"
            />
          </template>
        </el-form-item>
      </el-col>

      <!-- Action buttons -->
      <el-col :span="span" class="pro-query-filter__actions">
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSearch">
            {{ t('pro.table.queryFilter.search') }}
          </el-button>
          <el-button @click="handleReset"> {{ t('pro.table.queryFilter.reset') }} </el-button>
          <el-button v-if="hasCollapsibleOverflow" link type="primary" @click="toggleCollapse">
            {{
              isCollapsed ? t('pro.table.queryFilter.expand') : t('pro.table.queryFilter.collapse')
            }}
            <el-icon>
              <component :is="isCollapsed ? 'ArrowDown' : 'ArrowUp'" />
            </el-icon>
          </el-button>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<style scoped>
.pro-query-filter {
  margin-bottom: var(--pro-spacing-md, 16px);
  padding: var(--pro-spacing-md, 16px);
  padding-bottom: 0;
  background: var(--el-bg-color);
  border-radius: var(--pro-radius-md, 6px);
}

.pro-query-filter__actions {
  display: flex;
  justify-content: flex-end;
}
</style>
