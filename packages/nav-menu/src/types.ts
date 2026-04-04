import type { Component } from 'vue'

/** A single menu item in the navigation tree */
export interface NavMenuItem {
  /** Unique key — also used as the route path when `path` is not specified */
  key: string
  /** Display label */
  label: string
  /** Menu icon (Vue component or render function) */
  icon?: Component
  /** Route path. Defaults to `key` if omitted. */
  path?: string
  /** Badge count. Displays a number badge on the item. */
  badge?: number
  /** Show a dot indicator instead of a count badge */
  dot?: boolean
  /** Whether this item is disabled */
  disabled?: boolean
  /** Whether this item is hidden from the menu */
  hidden?: boolean
  /** Child items — creates a submenu group */
  children?: NavMenuItem[]
  /** External link — opens in a new tab */
  isExternal?: boolean
  /** Custom CSS class for this item */
  className?: string
}

/** ProNavMenu component props */
export interface ProNavMenuProps {
  /** Menu items — schema-driven configuration */
  items: NavMenuItem[]
  /** Menu display mode */
  mode?: 'vertical' | 'horizontal'
  /** Whether the sidebar is collapsed (vertical mode only) */
  collapsed?: boolean
  /** Currently active menu item key */
  activeKey?: string
  /** Default active key (uncontrolled mode) */
  defaultActiveKey?: string
  /** Default opened submenu keys */
  defaultOpenKeys?: string[]
  /** Menu width in px (vertical mode, expanded) */
  width?: number
  /** Menu width in px (vertical mode, collapsed) */
  collapsedWidth?: number
  /** Show the collapse toggle button */
  showCollapseButton?: boolean
  /** Whether to use vue-router for navigation */
  router?: boolean
  /** Background color override */
  backgroundColor?: string
  /** Text color override */
  textColor?: string
  /** Active text color override */
  activeTextColor?: string
}

/** ProNavMenu emits */
export interface ProNavMenuEmits {
  /** Fired when a menu item is clicked */
  (event: 'select', key: string, item: NavMenuItem): void
  /** Fired when collapse state changes */
  (event: 'update:collapsed', collapsed: boolean): void
  /** Fired when active key changes */
  (event: 'update:activeKey', key: string): void
}
