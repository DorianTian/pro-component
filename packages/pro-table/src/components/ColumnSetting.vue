<script setup lang="ts">
import { ref, computed, inject, watch, onMounted, type PropType } from 'vue'
import { Rank, Back, Right } from '@element-plus/icons-vue'
import { useProLocale } from '@pro/hooks'

import { COLUMN_SETTING_INJECTION_KEY } from '../constants'

defineOptions({ name: 'ProColumnSetting' })

const props = defineProps({
  /** When provided, column visibility/order persists to localStorage under this key */
  persistKey: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
})

const { t } = useProLocale()
const columnSettingCtx = inject(COLUMN_SETTING_INJECTION_KEY, null)

const localColumns = computed(() => {
  if (!columnSettingCtx) return []
  return [...columnSettingCtx.columns.value].sort((a, b) => a.order - b.order)
})

const isAllChecked = computed(() => localColumns.value.every((col) => col.visible))

const isIndeterminate = computed(() => {
  const visibleCount = localColumns.value.filter((col) => col.visible).length
  return visibleCount > 0 && visibleCount < localColumns.value.length
})

function handleCheckAllChange(checked: boolean): void {
  if (!columnSettingCtx) return
  localColumns.value.forEach((col) => {
    columnSettingCtx.updateColumn(col.key, { visible: checked })
  })
}

function handleColumnVisibilityChange(key: string, visible: boolean): void {
  if (!columnSettingCtx) return
  columnSettingCtx.updateColumn(key, { visible })
}

function handleFixedChange(key: string, fixed: 'left' | 'right' | false): void {
  if (!columnSettingCtx) return
  columnSettingCtx.updateColumn(key, { fixed })
}

function handleReset(): void {
  if (!columnSettingCtx) return
  columnSettingCtx.resetColumns()
  clearPersistedState()
}

// --- Drag-to-reorder ---
const draggedIndex = ref<number | null>(null)

function handleDragStart(index: number): void {
  draggedIndex.value = index
}

function handleDragOver(event: DragEvent): void {
  event.preventDefault()
}

function handleDrop(targetIndex: number): void {
  if (draggedIndex.value === null || !columnSettingCtx) return
  if (draggedIndex.value === targetIndex) return

  const cols = [...localColumns.value]
  const [dragged] = cols.splice(draggedIndex.value, 1)
  cols.splice(targetIndex, 0, dragged)

  cols.forEach((col, idx) => {
    columnSettingCtx.updateColumn(col.key, { order: idx })
  })

  draggedIndex.value = null
}

function handleDragEnd(): void {
  draggedIndex.value = null
}

// --- Persistence ---

interface PersistedColumnState {
  visible: string[]
  order: string[]
  fixed: Record<string, 'left' | 'right'>
}

function persistState(): void {
  if (!props.persistKey || !columnSettingCtx) return
  const state: PersistedColumnState = {
    visible: localColumns.value.filter((c) => c.visible).map((c) => c.key),
    order: localColumns.value.map((c) => c.key),
    fixed: {},
  }
  localColumns.value.forEach((c) => {
    if (c.fixed) {
      state.fixed[c.key] = c.fixed
    }
  })
  try {
    localStorage.setItem(props.persistKey, JSON.stringify(state))
  } catch {
    // localStorage may be unavailable in some environments
  }
}

function restoreState(): void {
  if (!props.persistKey || !columnSettingCtx) return
  try {
    const raw = localStorage.getItem(props.persistKey)
    if (!raw) return
    const state = JSON.parse(raw) as PersistedColumnState
    if (!Array.isArray(state.visible) || !Array.isArray(state.order)) return
    const visibleSet = new Set(state.visible)

    state.order.forEach((key, idx) => {
      columnSettingCtx.updateColumn(key, {
        visible: visibleSet.has(key),
        order: idx,
        fixed: state.fixed[key] ?? false,
      })
    })
  } catch {
    // Corrupted data or unavailable localStorage
  }
}

function clearPersistedState(): void {
  if (!props.persistKey) return
  try {
    localStorage.removeItem(props.persistKey)
  } catch {
    // Ignore
  }
}

// Restore persisted state on mount
onMounted(() => {
  restoreState()
})

// Persist whenever columns change
watch(
  () => columnSettingCtx?.columns.value,
  () => {
    persistState()
  },
  { deep: true },
)
</script>

<template>
  <el-popover
    placement="bottom-end"
    :width="280"
    trigger="click"
    popper-class="pro-column-setting-popover"
  >
    <template #reference>
      <slot />
    </template>

    <div class="pro-column-setting">
      <div class="pro-column-setting__header">
        <el-checkbox
          :model-value="isAllChecked"
          :indeterminate="isIndeterminate"
          @change="handleCheckAllChange"
        >
          {{ t('pro.table.columnSetting.title') }}
        </el-checkbox>
        <el-button link type="primary" @click="handleReset">
          {{ t('pro.table.queryFilter.reset') }}
        </el-button>
      </div>

      <div class="pro-column-setting__list">
        <div
          v-for="(col, index) in localColumns"
          :key="col.key"
          class="pro-column-setting__item"
          draggable="true"
          @dragstart="handleDragStart(index)"
          @dragover="handleDragOver"
          @drop="handleDrop(index)"
          @dragend="handleDragEnd"
        >
          <el-icon class="pro-column-setting__drag-handle">
            <Rank />
          </el-icon>

          <el-checkbox
            :model-value="col.visible"
            @change="handleColumnVisibilityChange(col.key, $event as boolean)"
          >
            {{ col.title }}
          </el-checkbox>

          <div class="pro-column-setting__fixed">
            <el-tooltip :content="t('pro.table.columnSetting.pinLeft')" placement="top">
              <el-icon
                :class="{ 'is-active': col.fixed === 'left' }"
                @click="handleFixedChange(col.key, col.fixed === 'left' ? false : 'left')"
              >
                <Back />
              </el-icon>
            </el-tooltip>
            <el-tooltip :content="t('pro.table.columnSetting.pinRight')" placement="top">
              <el-icon
                :class="{ 'is-active': col.fixed === 'right' }"
                @click="handleFixedChange(col.key, col.fixed === 'right' ? false : 'right')"
              >
                <Right />
              </el-icon>
            </el-tooltip>
          </div>
        </div>
      </div>
    </div>
  </el-popover>
</template>

<style scoped>
.pro-column-setting__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--pro-space-3);
  border-bottom: 1px solid var(--pro-border-light);
  margin-bottom: var(--pro-space-3);
}

.pro-column-setting__item {
  display: flex;
  align-items: center;
  padding: var(--pro-space-1) 0;
  border-radius: var(--pro-radius-sm);
  cursor: move;
}

.pro-column-setting__item:hover {
  background-color: var(--pro-bg-sunken);
}

.pro-column-setting__drag-handle {
  margin-right: var(--pro-space-3);
  cursor: grab;
  color: var(--pro-text-tertiary);
}

.pro-column-setting__fixed {
  margin-left: auto;
  display: flex;
  gap: var(--pro-space-1);
}

.pro-column-setting__fixed .el-icon {
  cursor: pointer;
  color: var(--pro-text-tertiary);
  font-size: var(--pro-text-base);
  transition: color var(--pro-transition-fast);
}

.pro-column-setting__fixed .el-icon:hover {
  color: var(--pro-color-primary);
}

.pro-column-setting__fixed .el-icon.is-active {
  color: var(--pro-color-primary);
}

.pro-column-setting__item[draggable='true']:active {
  box-shadow: var(--pro-shadow-md);
  background: var(--pro-color-primary-ultra-light);
  transform: scale(1.02);
  transition: all var(--pro-transition-bounce);
}

.pro-column-setting__list {
  max-height: 400px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--pro-scrollbar-thumb) var(--pro-scrollbar-track);
}
</style>

<!-- Popover styles extracted to @pro/themes/overrides/dialog.css -->
