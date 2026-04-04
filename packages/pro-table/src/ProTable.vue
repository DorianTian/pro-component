<script setup lang="ts">
import { inject, toRef, computed, ref, type PropType, type VNode } from 'vue'
import { Setting, Plus } from '@element-plus/icons-vue'
import { ElAutoResizer, ElTableV2 } from 'element-plus'
import { useProLocale } from '@pro/hooks'
import { ProSpin } from '@pro/loading'

import type { RequestParams, RequestResult } from '@pro/utils'
import type {
  ProColumnDef,
  SearchConfig,
  ToolbarConfig,
  PaginationConfig,
  RowSelectionConfig,
  EditableConfig,
  UseProTableReturn,
} from './types'
import { PRO_TABLE_INJECTION_KEY } from './constants'
import { useProTableInternal } from './composables/use-pro-table-internal'
import { useVirtualColumns } from './composables/use-virtual-columns'
import QueryFilter from './components/QueryFilter.vue'
import ToolBar from './components/ToolBar.vue'
import ColumnSetting from './components/ColumnSetting.vue'
import EditableCell from './components/EditableCell.vue'

defineOptions({ name: 'ProTable' })

/** Default virtual table height */
const DEFAULT_VIRTUAL_HEIGHT = 500

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
  editable: { type: Object as PropType<EditableConfig>, default: undefined },
  tableProps: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
  beforeRequest: {
    type: Function as PropType<(params: RequestParams) => RequestParams>,
    default: undefined,
  },
  afterResponse: {
    type: Function as PropType<(raw: unknown) => RequestResult>,
    default: undefined,
  },
  /** Enable virtual scrolling via ElTableV2 for large datasets */
  virtual: { type: Boolean, default: false },
  /** Virtual table viewport height in px (default 500, or auto via ElAutoResizer) */
  virtualHeight: { type: Number, default: DEFAULT_VIRTUAL_HEIGHT },
})

const emit = defineEmits<{
  'selection-change': [selectedRowKeys: string[], selectedRows: unknown[]]
  'sort-change': [sortState: { prop: string; order: string } | null]
  'page-change': [pagination: { current: number; pageSize: number }]
  reload: []
  reset: []
}>()

const { t } = useProLocale()

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
    editable: toRef(props, 'editable'),
    virtual: toRef(props, 'virtual'),
    virtualHeight: toRef(props, 'virtualHeight'),
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

const { tableContainerRef } = state

// ─── Virtual table (ElTableV2) selection support ───────────────────
const virtualSelectedKeys = ref<Set<string>>(new Set())

function getRowKey(row: Record<string, unknown>): string {
  const rk = props.rowKey
  if (typeof rk === 'function') return rk(row)
  return String(row[rk])
}

const allRowKeys = computed(() =>
  (state.activeData.value as Record<string, unknown>[]).map(getRowKey),
)

function handleVirtualSelectRow(key: string, checked: boolean): void {
  const next = new Set(virtualSelectedKeys.value)
  if (checked) {
    next.add(key)
  } else {
    next.delete(key)
  }
  virtualSelectedKeys.value = next
  const rows = (state.activeData.value as Record<string, unknown>[]).filter((r) =>
    next.has(getRowKey(r)),
  )
  emit('selection-change', [...next], rows)
}

function handleVirtualSelectAll(checked: boolean): void {
  if (checked) {
    virtualSelectedKeys.value = new Set(allRowKeys.value)
    emit('selection-change', allRowKeys.value, [...state.activeData.value])
  } else {
    virtualSelectedKeys.value = new Set()
    emit('selection-change', [], [])
  }
}

const hasRowSelection = computed(() => !!props.rowSelection)

/** ElTableV2 requires a string key, not a function */
const v2RowKey = computed(() => {
  const rk = props.rowKey
  return typeof rk === 'string' ? rk : 'id'
})

const { v2Columns } = useVirtualColumns({
  columns: toRef(props, 'columns'),
  visibleColumns: state.visibleColumns,
  formatCellValue: state.formatCellValue,
  rowKeyField: v2RowKey,
  hasRowSelection,
  selectedRowKeys: virtualSelectedKeys,
  allRowKeys,
  onSelectRow: handleVirtualSelectRow,
  onSelectAll: handleVirtualSelectAll,
})

/** Resolve editable text with user override → i18n fallback */
function editText(key: 'edit' | 'save' | 'cancel' | 'delete' | 'addRow' | 'actions'): string {
  const override = props.editable?.[`${key}Text` as keyof EditableConfig] as string | undefined
  if (override) return override
  return t(`pro.table.editable.${key}`)
}
</script>

<template>
  <div
    ref="tableContainerRef"
    class="pro-table"
    :class="{ 'pro-table--fullscreen': state.isFullscreen.value }"
    :data-density="state.densitySize.value"
  >
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
      @toggle-fullscreen="state.handleToggleFullscreen"
    >
      <template #columnSetting>
        <ColumnSetting>
          <span class="pro-toolbar__icon" title="Column Settings">
            <el-icon :size="16"><Setting /></el-icon>
          </span>
        </ColumnSetting>
      </template>
      <template v-if="$slots.toolbarActions" #actions>
        <slot name="toolbarActions" />
      </template>
    </ToolBar>

    <!-- ═══════ Virtual Table (ElTableV2) ═══════ -->
    <el-auto-resizer v-if="virtual">
      <template #default="{ height: autoHeight, width: autoWidth }">
        <el-table-v2
          :columns="v2Columns as unknown as Record<string, unknown>[]"
          :data="state.activeData.value"
          :width="autoWidth"
          :height="virtualHeight || autoHeight"
          :row-key="v2RowKey"
          v-bind="tableProps"
        />
      </template>
    </el-auto-resizer>

    <!-- ═══════ Standard Table (ElTable) ═══════ -->
    <ProSpin v-if="!virtual" :spinning="state.activeLoading.value" size="large">
      <el-table
        :data="state.activeData.value"
        :row-key="rowKey"
        :size="state.tableSize.value"
        :row-class-name="
          (scope: { row: unknown }) =>
            state.isRowEditing(scope.row) ? 'pro-table__row--editing' : ''
        "
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
          :min-width="col.minWidth"
          :fixed="col.fixed"
          :sortable="col.sortable"
          :show-overflow-tooltip="col.ellipsis !== false"
        >
          <template #default="{ row, $index }">
            <!-- Custom render (skip when row is editing) -->
            <template v-if="col.render && !state.isRowEditing(row)">
              <component :is="() => col.render!(row, $index)" />
            </template>
            <!-- Editable cell -->
            <template
              v-else-if="
                state.isEditableEnabled.value &&
                state.isRowEditing(row) &&
                state.isCellEditable(col, row, $index)
              "
            >
              <EditableCell
                :value-type="col.valueType ?? 'text'"
                :model-value="state.getEditingCellValue(row, String(col.dataIndex))"
                :is-editing="true"
                :value-enum="col.valueEnum"
                :field-props="state.getCellFieldProps(col, row, $index)"
                :validation-error="state.getCellValidationError(row, String(col.dataIndex))"
                @update:model-value="state.setEditingCellValue(row, String(col.dataIndex), $event)"
              />
            </template>
            <!-- Read-only display -->
            <template v-else>
              <span>{{ state.formatCellValue(col, row) }}</span>
            </template>
          </template>
        </el-table-column>

        <!-- Action column slot (user-provided) -->
        <slot name="action" />

        <!-- Editable action column -->
        <el-table-column
          v-if="state.isEditableEnabled.value"
          :label="editText('actions')"
          min-width="120"
        >
          <template #default="{ row }">
            <template v-if="state.isRowEditing(row)">
              <el-button link type="primary" size="small" @click="state.handleEditSave(row)">
                {{ editText('save') }}
              </el-button>
              <el-button link size="small" @click="state.handleEditCancel(row)">
                {{ editText('cancel') }}
              </el-button>
            </template>
            <template v-else>
              <el-button link type="primary" size="small" @click="state.handleEditStart(row)">
                {{ editText('edit') }}
              </el-button>
              <el-popconfirm
                :title="editable?.deleteConfirmText ?? t('pro.table.editable.deleteConfirm')"
                @confirm="state.handleEditDelete(row)"
              >
                <template #reference>
                  <el-button link type="danger" size="small">
                    {{ editText('delete') }}
                  </el-button>
                </template>
              </el-popconfirm>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </ProSpin>

    <!-- Add Row Button (for editable table mode with recordCreatorProps) -->
    <div v-if="!virtual && state.canAddRow.value" class="pro-table__add-row">
      <el-button type="primary" :icon="Plus" link @click="state.handleAddEditRecord">
        {{
          editable?.recordCreatorProps && typeof editable.recordCreatorProps === 'object'
            ? (editable.recordCreatorProps.creatorButtonText ?? editText('addRow'))
            : editText('addRow')
        }}
      </el-button>
    </div>

    <!-- Pagination (not shown in virtual mode — virtual renders all rows) -->
    <div v-if="!virtual && state.isPaginationEnabled.value" class="pro-table__pagination">
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
  background: var(--pro-bg-elevated);
  overflow: hidden;
}

.pro-table :deep(*) {
  box-sizing: border-box;
}

.pro-table :deep(.el-auto-resizer) {
  min-height: 300px;
}

.pro-table__pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: var(--pro-space-4) var(--pro-space-7) var(--pro-space-4);
  font-size: var(--pro-text-xs);
  color: var(--pro-text-tertiary);
}

.pro-table__add-row {
  display: flex;
  justify-content: center;
  padding: var(--pro-space-3) 0;
  border-top: 1px dashed var(--el-border-color-lighter);
}

/* Editing row styles live in themes/overrides/table.css for proper specificity */

.pro-table--fullscreen {
  padding: var(--pro-space-6);
  overflow: auto;
}
</style>
