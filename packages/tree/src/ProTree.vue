<script setup lang="ts">
import { ref, computed, watch, useSlots, useAttrs, onBeforeUnmount, type PropType } from 'vue'
import { Search } from '@element-plus/icons-vue'

import type { ProTreeNodeData, DragEvent as TreeDragEvent } from './types'
import { cloneTree, removeNode, insertNode, getNodeDepth, getSubtreeDepth } from './tree-utils'

defineOptions({ name: 'ProTree', inheritAttrs: false })

const props = defineProps({
  searchable: { type: Boolean, default: true },
  searchPlaceholder: { type: String, default: 'Search...' },
  defaultExpandAll: { type: Boolean, default: false },
  searchDebounceMs: { type: Number, default: 300 },
  filterMethod: {
    type: Function as PropType<(keyword: string, data: ProTreeNodeData) => boolean>,
    default: undefined,
  },
  data: { type: Array as PropType<ProTreeNodeData[]>, default: () => [] },
  nodeKey: { type: String, default: 'id' },
  /** Enable drag-and-drop with data layer management */
  draggable: { type: Boolean, default: false },
  /** Max allowed tree depth. 0 = unlimited. */
  maxDepth: { type: Number, default: 0 },
  /** Custom drag guard — return false to prevent dragging a node */
  allowDrag: {
    type: Function as PropType<(data: ProTreeNodeData) => boolean>,
    default: undefined,
  },
  /** Custom drop guard — return false to prevent dropping at a position */
  allowDrop: {
    type: Function as PropType<
      (
        dragging: ProTreeNodeData,
        drop: ProTreeNodeData,
        type: 'before' | 'after' | 'inner',
      ) => boolean
    >,
    default: undefined,
  },
  /** Async confirm callback. Return false or throw to rollback the drop. */
  onDragConfirm: {
    type: Function as PropType<(event: TreeDragEvent) => Promise<boolean | void>>,
    default: undefined,
  },
  /** Max undo history size */
  maxHistory: { type: Number, default: 50 },
})

const emit = defineEmits<{
  search: [keyword: string]
  'update:data': [data: ProTreeNodeData[]]
  'drag-end': [event: TreeDragEvent]
}>()

const slots = useSlots()
const attrs = useAttrs()

const treeRef = ref<InstanceType<(typeof import('element-plus'))['ElTree']> | null>(null)
const searchKeyword = ref('')
const debouncedKeyword = ref('')
const isAllExpanded = ref(props.defaultExpandAll)

// ─── Debounced search ───────────────────────────────────────────────
let debounceTimer: ReturnType<typeof setTimeout> | null = null

function clearDebounce(): void {
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
}

watch(searchKeyword, (value) => {
  clearDebounce()
  debounceTimer = setTimeout(() => {
    debouncedKeyword.value = value
    emit('search', value)
  }, props.searchDebounceMs)
})

onBeforeUnmount(clearDebounce)

// ─── Tree filtering ─────────────────────────────────────────────────
function defaultFilterMethod(keyword: string, data: ProTreeNodeData): boolean {
  if (!keyword) return true
  const label = String(data.label ?? '')
  return label.toLowerCase().includes(keyword.toLowerCase())
}

const activeFilter = computed(() => props.filterMethod ?? defaultFilterMethod)

watch(debouncedKeyword, () => {
  treeRef.value?.filter(debouncedKeyword.value)
})

function handleFilterNode(value: string, data: ProTreeNodeData): boolean {
  return activeFilter.value(value, data)
}

// ─── Expand / Collapse all ──────────────────────────────────────────
function getAllNodeKeys(nodes: ProTreeNodeData[]): (string | number)[] {
  const keys: (string | number)[] = []
  const stack = [...nodes]
  while (stack.length > 0) {
    const node = stack.pop()!
    keys.push(node[props.nodeKey] as string | number)
    if (node.children?.length) {
      stack.push(...node.children)
    }
  }
  return keys
}

function toggleExpandAll(): void {
  isAllExpanded.value = !isAllExpanded.value
  const tree = treeRef.value
  if (!tree) return

  if (isAllExpanded.value) {
    const allKeys = getAllNodeKeys(props.data)
    for (const key of allKeys) {
      const node = tree.getNode(key)
      if (node && !node.expanded) {
        node.expanded = true
      }
    }
  } else {
    const allKeys = getAllNodeKeys(props.data)
    for (const key of allKeys) {
      const node = tree.getNode(key)
      if (node && node.expanded) {
        node.expanded = false
      }
    }
  }
}

// ─── Child count helper ─────────────────────────────────────────────
function getChildCount(data: ProTreeNodeData): number {
  return data.children?.length ?? 0
}

// ─── Drag-and-drop data layer ──────────────────────────────────────
const undoStack = ref<ProTreeNodeData[][]>([])
const redoStack = ref<ProTreeNodeData[][]>([])
/** Snapshot taken at drag-start, before ElTree mutates data */
let preDragSnapshot: ProTreeNodeData[] | null = null

const canUndo = computed(() => undoStack.value.length > 0)
const canRedo = computed(() => redoStack.value.length > 0)

/** Capture snapshot BEFORE ElTree starts mutating */
function handleDragStart(): void {
  preDragSnapshot = cloneTree(props.data)
}

function pushSnapshot(snapshot: ProTreeNodeData[]): void {
  undoStack.value.push(snapshot)
  if (undoStack.value.length > props.maxHistory) {
    undoStack.value.shift()
  }
  redoStack.value = []
}

function undo(): void {
  if (undoStack.value.length === 0) return
  redoStack.value.push(cloneTree(props.data))
  const prev = undoStack.value.pop()!
  emit('update:data', prev)
}

function redo(): void {
  if (redoStack.value.length === 0) return
  undoStack.value.push(cloneTree(props.data))
  const next = redoStack.value.pop()!
  emit('update:data', next)
}

/** ElTree allow-drag callback — wraps user's allowDrag */
function handleAllowDrag(elNode: { data: ProTreeNodeData }): boolean {
  if (props.allowDrag) return props.allowDrag(elNode.data)
  return true
}

/** ElTree allow-drop callback — wraps user's allowDrop + maxDepth check */
function handleAllowDrop(
  dragging: { data: ProTreeNodeData },
  drop: { data: ProTreeNodeData },
  type: 'prev' | 'next' | 'inner',
): boolean {
  const position = type === 'prev' ? 'before' : type === 'next' ? 'after' : 'inner'

  if (props.maxDepth > 0 && position === 'inner') {
    const dropDepth = getNodeDepth(props.data, String(drop.data[props.nodeKey]), props.nodeKey)
    const subtreeDepth = getSubtreeDepth(dragging.data)
    if (dropDepth + subtreeDepth > props.maxDepth) return false
  }

  if (props.maxDepth > 0 && position !== 'inner') {
    const dropDepth = getNodeDepth(props.data, String(drop.data[props.nodeKey]), props.nodeKey)
    const subtreeDepth = getSubtreeDepth(dragging.data)
    if (dropDepth - 1 + subtreeDepth > props.maxDepth) return false
  }

  if (props.allowDrop) return props.allowDrop(dragging.data, drop.data, position)
  return true
}

/**
 * ElTree node-drop handler.
 * By this point ElTree has ALREADY mutated the data array in place.
 * We save the pre-drag snapshot for undo and emit the mutated data
 * so the parent stays in sync.
 */
async function handleNodeDrop(
  dragging: { data: ProTreeNodeData },
  drop: { data: ProTreeNodeData },
  type: 'before' | 'after' | 'inner',
): Promise<void> {
  const dragKey = String(dragging.data[props.nodeKey])
  const dropKey = String(drop.data[props.nodeKey])

  const dragEvent: TreeDragEvent = {
    dragKey,
    dropKey,
    position: type,
    dragData: dragging.data,
    dropData: drop.data,
  }

  // Save pre-drag snapshot for undo (captured at drag-start, before mutation)
  if (preDragSnapshot) {
    pushSnapshot(preDragSnapshot)
    preDragSnapshot = null
  }

  // ElTree already mutated props.data in place — emit a clone
  // so the parent v-model gets a new reference and stays reactive
  emit('update:data', cloneTree(props.data))
  emit('drag-end', dragEvent)

  // Server confirm — rollback on failure
  if (props.onDragConfirm) {
    try {
      const result = await props.onDragConfirm(dragEvent)
      if (result === false) {
        undo()
      }
    } catch {
      undo()
    }
  }
}

// ─── Forwarded slots (exclude our custom ones) ──────────────────────
const passthroughSlotNames = computed(() =>
  Object.keys(slots).filter((name) => name !== 'toolbar-extra'),
)

// ─── Expose tree instance methods ───────────────────────────────────
defineExpose({
  /** Access the underlying ElTree ref */
  getTreeRef: () => treeRef.value,
  /** Expand all nodes */
  expandAll: () => {
    if (!isAllExpanded.value) toggleExpandAll()
  },
  /** Collapse all nodes */
  collapseAll: () => {
    if (isAllExpanded.value) toggleExpandAll()
  },
  /** Programmatically set search keyword */
  setSearchKeyword: (keyword: string) => {
    searchKeyword.value = keyword
  },
  /** Undo last drag operation */
  undo,
  /** Redo last undone drag operation */
  redo,
  /** Whether undo is available */
  canUndo,
  /** Whether redo is available */
  canRedo,
})
</script>

<template>
  <div class="pro-tree">
    <!-- Toolbar: search + expand toggle -->
    <div v-if="searchable" class="pro-tree__toolbar">
      <div class="pro-tree__search">
        <el-input
          v-model="searchKeyword"
          :placeholder="searchPlaceholder"
          clearable
          size="default"
          class="pro-tree__search-input"
        >
          <template #prefix>
            <el-icon class="pro-tree__search-icon"><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <button
        class="pro-tree__expand-btn"
        type="button"
        :title="isAllExpanded ? 'Collapse all' : 'Expand all'"
        @click="toggleExpandAll"
      >
        <svg
          class="pro-tree__expand-icon"
          :class="{ 'pro-tree__expand-icon--collapsed': !isAllExpanded }"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <!-- Extra toolbar slot for custom actions -->
      <slot name="toolbar-extra" />
    </div>

    <!-- Tree -->
    <div class="pro-tree__body">
      <el-tree
        ref="treeRef"
        :data="data"
        :node-key="nodeKey"
        :default-expand-all="defaultExpandAll"
        :filter-node-method="handleFilterNode"
        :draggable="draggable"
        :allow-drag="draggable ? handleAllowDrag : undefined"
        :allow-drop="draggable ? handleAllowDrop : undefined"
        v-bind="attrs"
        @node-drag-start="draggable ? handleDragStart : undefined"
        @node-drop="draggable ? handleNodeDrop : undefined"
      >
        <!-- Default node content with drag handle + count badge -->
        <template #default="{ node, data: nodeData }">
          <span class="pro-tree__node" :class="{ 'pro-tree__node--selected': node.isCurrent }">
            <svg
              v-if="draggable"
              class="pro-tree__drag-handle"
              viewBox="0 0 16 16"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="5.5" cy="4" r="1.2" />
              <circle cx="10.5" cy="4" r="1.2" />
              <circle cx="5.5" cy="8" r="1.2" />
              <circle cx="10.5" cy="8" r="1.2" />
              <circle cx="5.5" cy="12" r="1.2" />
              <circle cx="10.5" cy="12" r="1.2" />
            </svg>
            <span class="pro-tree__node-label">{{ node.label }}</span>
            <span v-if="getChildCount(nodeData) > 0" class="pro-tree__node-badge">
              {{ getChildCount(nodeData) }}
            </span>
          </span>
        </template>
        <!-- Forward all other slots to ElTree -->
        <template v-for="slotName in passthroughSlotNames" :key="slotName" #[slotName]="slotProps">
          <slot :name="slotName" v-bind="slotProps ?? {}" />
        </template>
      </el-tree>
    </div>
  </div>
</template>

<style>
/* ═══════════════════════════════════════════════════════════════════════
   ProTree — manually scoped via .pro-tree prefix (no <style scoped>)
   so that descendant selectors can reach ElTree internals without :deep()
   ═══════════════════════════════════════════════════════════════════════ */

.pro-tree {
  display: flex;
  flex-direction: column;
  background: var(--pro-bg-elevated);
  border: 1px solid var(--pro-border-default);
  border-radius: var(--pro-radius-md);
  overflow: hidden;
  font-family: var(--pro-font-family);
  font-size: var(--pro-text-sm);
  color: var(--pro-text-primary);
}

/* ─── Toolbar ──────────────────────────────────────────────────────── */
.pro-tree .pro-tree__toolbar {
  display: flex;
  align-items: center;
  gap: var(--pro-space-2);
  padding: var(--pro-space-3) var(--pro-space-4);
  border-bottom: 1px solid var(--pro-border-light);
  background: var(--pro-bg-elevated);
}

.pro-tree .pro-tree__search {
  flex: 1;
  min-width: 0;
}

.pro-tree .pro-tree__search-input .el-input__wrapper {
  border-radius: var(--pro-radius-sm);
  box-shadow: 0 0 0 1px var(--pro-border-default) inset;
  transition: box-shadow var(--pro-transition-fast);
}

.pro-tree .pro-tree__search-input .el-input__wrapper:hover {
  box-shadow: 0 0 0 1px var(--pro-border-focus) inset;
}

.pro-tree .pro-tree__search-input .el-input__wrapper.is-focus {
  box-shadow: 0 0 0 1px var(--pro-color-primary) inset;
}

.pro-tree .pro-tree__search-icon {
  color: var(--pro-text-tertiary);
  font-size: 14px;
}

/* ─── Expand / Collapse button ─────────────────────────────────────── */
.pro-tree .pro-tree__expand-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid var(--pro-border-default);
  border-radius: var(--pro-radius-sm);
  background: var(--pro-bg-elevated);
  color: var(--pro-text-secondary);
  cursor: pointer;
  flex-shrink: 0;
  transition:
    background var(--pro-transition-fast),
    color var(--pro-transition-fast),
    border-color var(--pro-transition-fast);
}

.pro-tree .pro-tree__expand-btn:hover {
  background: var(--pro-bg-sunken);
  color: var(--pro-text-primary);
  border-color: var(--pro-border-focus);
}

.pro-tree .pro-tree__expand-btn:active {
  background: var(--pro-border-default);
}

.pro-tree .pro-tree__expand-icon {
  display: block;
  width: 14px;
  height: 14px;
  transition: transform var(--pro-transition-fast);
}

.pro-tree .pro-tree__expand-icon--collapsed {
  transform: rotate(-90deg);
}

/* ─── Tree body ────────────────────────────────────────────────────── */
.pro-tree .pro-tree__body {
  flex: 1;
  overflow: auto;
  padding: var(--pro-space-2) 0;
}

.pro-tree .pro-tree__body .el-tree {
  --el-tree-node-hover-bg-color: var(--pro-bg-sunken);
  background: transparent;
}

.pro-tree .pro-tree__body .el-tree-node__content {
  height: 32px;
  padding-right: var(--pro-space-4);
  border-radius: 0;
  transition:
    background var(--pro-transition-fast),
    border-color var(--pro-transition-fast);
  border-left: 2px solid transparent;
}

.pro-tree .pro-tree__body .el-tree-node__content:hover {
  background: var(--pro-bg-sunken);
}

/* Selected node: light blue background + left blue border */
.pro-tree .pro-tree__body .el-tree-node.is-current > .el-tree-node__content {
  background: #e8f3ff;
  border-left: 2px solid var(--pro-color-primary);
}

.pro-tree .pro-tree__body .el-tree-node.is-current > .el-tree-node__content:hover {
  background: #ddeeff;
}

/* Expand arrow refinement */
.pro-tree .pro-tree__body .el-tree-node__expand-icon {
  color: var(--pro-text-tertiary);
  font-size: 12px;
  padding: 4px;
  transition: transform var(--pro-transition-fast);
}

.pro-tree .pro-tree__body .el-tree-node__expand-icon.is-leaf {
  color: transparent;
}

/* ─── Node content ─────────────────────────────────────────────────── */
.pro-tree .pro-tree__node {
  display: inline-flex;
  align-items: center;
  gap: var(--pro-space-2);
  flex: 1;
  min-width: 0;
  line-height: var(--pro-line-height-base);
}

.pro-tree .pro-tree__node-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
  color: var(--pro-text-primary);
}

/* ─── Drag handle ─────────────────────────────────────────────────── */
.pro-tree .pro-tree__drag-handle {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: var(--pro-text-quaternary, #d4d4d4);
  cursor: grab;
  opacity: 0;
  transition:
    opacity var(--pro-transition-fast),
    color var(--pro-transition-fast);
}

.pro-tree .el-tree-node__content:hover .pro-tree__drag-handle {
  opacity: 1;
}

.pro-tree .pro-tree__drag-handle:hover {
  color: var(--pro-text-tertiary);
}

.pro-tree .pro-tree__drag-handle:active {
  cursor: grabbing;
}

/* ─── Child count badge ────────────────────────────────────────────── */
.pro-tree .pro-tree__node-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9999px;
  background: var(--pro-bg-sunken);
  color: var(--pro-text-secondary);
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
  flex-shrink: 0;
  transition:
    background var(--pro-transition-fast),
    color var(--pro-transition-fast);
}

/* Badge color shift on selected node */
.pro-tree .pro-tree__node--selected .pro-tree__node-badge {
  background: var(--pro-color-primary-light);
  color: var(--pro-color-primary);
}

/* ─── Scrollbar ────────────────────────────────────────────────────── */
.pro-tree .pro-tree__body::-webkit-scrollbar {
  width: var(--pro-scrollbar-size);
}

.pro-tree .pro-tree__body::-webkit-scrollbar-track {
  background: var(--pro-scrollbar-track);
}

.pro-tree .pro-tree__body::-webkit-scrollbar-thumb {
  background: var(--pro-scrollbar-thumb);
  border-radius: var(--pro-radius-full);
}

.pro-tree .pro-tree__body::-webkit-scrollbar-thumb:hover {
  background: var(--pro-scrollbar-thumb-hover);
}
</style>
