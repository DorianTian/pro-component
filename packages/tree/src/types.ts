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

/** Drag event payload emitted after a drop operation */
export interface DragEvent {
  /** Key of the dragged node */
  dragKey: string
  /** Key of the drop target node */
  dropKey: string
  /** Drop position relative to target */
  position: 'before' | 'after' | 'inner'
  /** The dragged node data */
  dragData: ProTreeNodeData
  /** The drop target node data */
  dropData: ProTreeNodeData
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
  /** Enable drag-and-drop with data layer management */
  draggable?: boolean
  /** Max allowed tree depth (0 = unlimited) */
  maxDepth?: number
  /** Custom drag guard — return false to prevent dragging a node */
  allowDrag?: (data: ProTreeNodeData) => boolean
  /** Custom drop guard — return false to prevent dropping at a position */
  allowDrop?: (
    dragging: ProTreeNodeData,
    drop: ProTreeNodeData,
    type: 'before' | 'after' | 'inner',
  ) => boolean
  /** Async confirm callback. Return false or throw to rollback the drop. */
  onDragConfirm?: (event: DragEvent) => Promise<boolean | void>
  /** Max undo history size (default: 50) */
  maxHistory?: number
}

/** Events emitted by ProTree */
export interface ProTreeEmits {
  /** Fired when search keyword changes (debounced) */
  (event: 'search', keyword: string): void
  /** Fired when tree data changes due to drag */
  (event: 'update:data', data: ProTreeNodeData[]): void
  /** Fired after a drag-and-drop completes */
  (event: 'drag-end', dragEvent: DragEvent): void
}
