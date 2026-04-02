<script setup lang="ts">
import { ref, computed, watch, useSlots, useAttrs, onBeforeUnmount, type PropType } from 'vue'
import { Search } from '@element-plus/icons-vue'

import type { ProTreeNodeData } from './types'

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
})

const emit = defineEmits<{
  search: [keyword: string]
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
    if (!isAllExpanded.value) {
      toggleExpandAll()
    }
  },
  /** Collapse all nodes */
  collapseAll: () => {
    if (isAllExpanded.value) {
      toggleExpandAll()
    }
  },
  /** Programmatically set search keyword */
  setSearchKeyword: (keyword: string) => {
    searchKeyword.value = keyword
  },
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
        v-bind="attrs"
      >
        <!-- Default node content with count badge -->
        <template #default="{ node, data: nodeData }">
          <span class="pro-tree__node" :class="{ 'pro-tree__node--selected': node.isCurrent }">
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
