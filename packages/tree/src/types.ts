import type { Component } from 'vue'

/** Data node used by ProTree */
export interface ProTreeNodeData {
  /** Unique identifier for the node */
  id: string | number
  /** Display label */
  label: string
  /** Child nodes */
  children?: ProTreeNodeData[]
  /** Whether the node is disabled */
  disabled?: boolean
  /** Whether the node is a leaf (no lazy-load children) */
  isLeaf?: boolean
  /** Custom icon component for this node */
  icon?: Component
  /** Arbitrary extra data */
  [key: string]: unknown
}

/** Props specific to ProTree (beyond ElTree pass-through) */
export interface ProTreeProps {
  /** Show the built-in search input above the tree */
  searchable?: boolean
  /** Placeholder text for the search input */
  searchPlaceholder?: string
  /** Expand all nodes on mount */
  defaultExpandAll?: boolean
  /** Debounce interval for search input (ms) */
  searchDebounceMs?: number
  /** Custom filter function. Receives search keyword and node data, returns match boolean. */
  filterMethod?: (keyword: string, data: ProTreeNodeData) => boolean
}

/** Events emitted by ProTree */
export interface ProTreeEmits {
  /** Fired when search keyword changes (debounced) */
  (event: 'search', keyword: string): void
}
