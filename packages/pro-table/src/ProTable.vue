<script setup lang="ts">
import { inject, toRef, type PropType, type VNode } from 'vue'
import { Setting } from '@element-plus/icons-vue'

import type { RequestParams, RequestResult } from '@pro/utils'
import type {
  ProColumnDef,
  SearchConfig,
  ToolbarConfig,
  PaginationConfig,
  RowSelectionConfig,
  UseProTableReturn,
} from './types'
import { PRO_TABLE_INJECTION_KEY } from './constants'
import { useProTableInternal } from './composables/use-pro-table-internal'
import QueryFilter from './components/QueryFilter.vue'
import ToolBar from './components/ToolBar.vue'
import ColumnSetting from './components/ColumnSetting.vue'

defineOptions({ name: 'ProTable' })

const props = defineProps({
  request: {
    type: Function as PropType<(params: RequestParams) => Promise<RequestResult>>,
    default: undefined,
  },
  data: { type: Array as PropType<Record<string, unknown>[]>, default: undefined },
  loading: { type: Boolean, default: undefined },
  columns: { type: Array as PropType<ProColumnDef[]>, required: true },
  rowKey: {
    type: [String, Function] as PropType<string | ((row: unknown) => string)>,
    default: 'id',
  },
  search: { type: [Boolean, Object] as PropType<boolean | SearchConfig>, default: true },
  initialValues: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
  toolbar: { type: Object as PropType<ToolbarConfig>, default: () => ({}) },
  headerTitle: { type: [String, Object] as PropType<string | VNode>, default: '' },
  toolbarActions: { type: Array as PropType<VNode[]>, default: () => [] },
  pagination: {
    type: [Boolean, Object] as PropType<false | PaginationConfig>,
    default: () => ({}),
  },
  rowSelection: { type: Object as PropType<RowSelectionConfig>, default: undefined },
  tableProps: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
  beforeRequest: {
    type: Function as PropType<(params: RequestParams) => RequestParams>,
    default: undefined,
  },
  afterResponse: {
    type: Function as PropType<(raw: unknown) => RequestResult>,
    default: undefined,
  },
})

const emit = defineEmits<{
  'selection-change': [selectedRowKeys: string[], selectedRows: unknown[]]
  'sort-change': [sortState: { prop: string; order: string } | null]
  'page-change': [pagination: { current: number; pageSize: number }]
  reload: []
  reset: []
}>()

const externalInstance = inject<UseProTableReturn | null>(PRO_TABLE_INJECTION_KEY, null)

const state = useProTableInternal(
  {
    columns: toRef(props, 'columns'),
    request: props.request,
    data: toRef(props, 'data'),
    externalLoading: toRef(props, 'loading'),
    rowKey: toRef(props, 'rowKey'),
    search: toRef(props, 'search'),
    initialValues: toRef(props, 'initialValues'),
    pagination: toRef(props, 'pagination'),
    rowSelection: toRef(props, 'rowSelection'),
    beforeRequest: props.beforeRequest,
    afterResponse: props.afterResponse,
    onSelectionChange: (keys, rows) => {
      emit('selection-change', keys, rows)
    },
    onSortChange: (s) => {
      emit('sort-change', s)
    },
    onPageChange: (p) => {
      emit('page-change', p)
    },
    onReload: () => {
      emit('reload')
    },
    onReset: () => {
      emit('reset')
    },
  },
  externalInstance,
)
</script>

<template>
  <div class="pro-table">
    <!-- Search Form -->
    <QueryFilter
      v-if="search !== false"
      :columns="columns"
      :search-config="search"
      :model-value="
        state.isExternalMode.value
          ? state.externalInstance!.formValues.value
          : state.formValues.value
      "
      :loading="state.activeLoading.value"
      @update:model-value="
        state.isExternalMode.value
          ? state.externalInstance!.setFormValues($event)
          : (state.formValues.value = $event)
      "
      @search="state.handleSearch"
      @reset="state.handleReset"
    />

    <!-- Toolbar -->
    <ToolBar
      :header-title="headerTitle"
      :toolbar-actions="toolbarActions"
      :toolbar="toolbar"
      @reload="state.handleReload"
    >
      <template #columnSetting>
        <ColumnSetting>
          <el-tooltip content="Column Settings" placement="top">
            <span class="pro-toolbar__icon">
              <el-icon :size="18"><Setting /></el-icon>
            </span>
          </el-tooltip>
        </ColumnSetting>
      </template>
    </ToolBar>

    <!-- Table -->
    <el-table
      :data="state.activeData.value"
      :loading="state.activeLoading.value"
      :row-key="rowKey"
      :size="state.tableSize.value"
      v-bind="tableProps"
      @selection-change="state.handleSelectionChange"
      @sort-change="state.handleSortChange"
    >
      <!-- Selection column -->
      <el-table-column v-if="rowSelection" type="selection" width="55" fixed="left" />

      <!-- Data columns -->
      <el-table-column
        v-for="col in state.visibleColumns.value"
        :key="col.key ?? String(col.dataIndex)"
        :prop="String(col.dataIndex)"
        :label="col.title"
        :width="col.width"
        :min-width="col.minWidth ?? 120"
        :fixed="col.fixed"
        :sortable="col.sortable"
        :show-overflow-tooltip="col.ellipsis !== false"
      >
        <template #default="{ row, $index }">
          <template v-if="col.render">
            <component :is="() => col.render!(row, $index)" />
          </template>
          <template v-else>
            <span>{{ state.formatCellValue(col, row) }}</span>
          </template>
        </template>
      </el-table-column>

      <!-- Action column slot -->
      <slot name="action" />
    </el-table>

    <!-- Pagination -->
    <div v-if="state.isPaginationEnabled.value" class="pro-table__pagination">
      <el-pagination
        :current-page="state.activePagination.value.current.value"
        :page-size="state.activePagination.value.pageSize.value"
        :total="state.activePagination.value.total.value"
        :page-sizes="state.pageSizes.value"
        :layout="state.paginationLayout.value"
        @current-change="state.handlePageChange"
        @size-change="state.handleSizeChange"
      />
    </div>
  </div>
</template>

<style scoped>
.pro-table {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.pro-table :deep(*) {
  box-sizing: border-box;
}

.pro-table :deep(.el-table) {
  --el-table-border-color: var(--pro-table-border-color, var(--el-border-color-lighter, #ebeef5));
}

.pro-table :deep(.el-table th.el-table__cell) {
  background: var(--pro-table-header-bg, var(--el-fill-color-lighter, #fafafa));
  font-weight: var(--pro-table-header-font-weight, 600);
  color: var(--el-text-color-primary, #303133);
  font-size: var(--pro-font-size-base, 14px);
}

.pro-table :deep(.el-table tr:hover > td.el-table__cell) {
  background-color: var(--pro-table-row-hover-bg, var(--el-color-primary-light-9, #ecf5ff));
}

.pro-table :deep(.el-table--scrollable-x .el-table__body-wrapper) {
  scrollbar-width: thin;
  scrollbar-color: var(--pro-scrollbar-thumb, #dcdfe6) var(--pro-scrollbar-track, transparent);
}

.pro-table :deep(.el-table--scrollable-x .el-table__body-wrapper::-webkit-scrollbar) {
  height: var(--pro-scrollbar-size, 6px);
}

.pro-table :deep(.el-table--scrollable-x .el-table__body-wrapper::-webkit-scrollbar-thumb) {
  background: var(--pro-scrollbar-thumb, #dcdfe6);
  border-radius: 3px;
}

.pro-table :deep(.el-table--scrollable-x .el-table__body-wrapper::-webkit-scrollbar-track) {
  background: var(--pro-scrollbar-track, transparent);
}

.pro-table__pagination {
  display: flex;
  justify-content: flex-end;
  padding: var(--pro-spacing-md, 16px) 0 var(--pro-spacing-xs, 4px);
}
</style>
