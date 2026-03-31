import type { Component } from 'vue'
import {
  ElInput,
  ElInputNumber,
  ElSelect,
  ElDatePicker,
  ElRadioGroup,
  ElCheckboxGroup,
  ElSwitch,
} from 'element-plus'

import type { ValueType } from '@pro/utils'
import {
  formatDate as fmtDate,
  formatNumber as fmtNumber,
  formatMoney as fmtMoney,
  formatPercent as fmtPercent,
} from './formatters'

/** Configuration for rendering a valueType in table cells */
export interface TableRenderConfig {
  /** Element Plus component name or 'span' for plain text */
  component: string
  /** Format raw value to display string */
  format: (value: unknown) => string
  /** Additional props passed to the render component */
  props?: Record<string, unknown>
}

/** Configuration for rendering a valueType as a search form control */
export interface SearchComponentConfig {
  /** Element Plus component name */
  component: string
  /** Props to pass to the search form component */
  props: Record<string, unknown>
}

/** Return type of the useValueType composable */
export interface UseValueTypeReturn {
  /** Get table cell render configuration for a valueType */
  getTableRenderConfig: (valueType: ValueType) => TableRenderConfig
  /** Get search form component configuration for a valueType. Returns null for non-searchable types. */
  getSearchConfig: (valueType: ValueType) => SearchComponentConfig | null
}

/**
 * Configuration entry for a valueType -> component mapping.
 * Used by CONTROL_REGISTRY to define how each valueType renders.
 */
export interface ControlRegistryEntry {
  /** Element Plus component to render */
  component: Component
  /** Default props passed to the component */
  defaultProps: Record<string, unknown>
  /** Optional format function for display (table cells, descriptions) */
  format?: (value: unknown, options?: Record<string, unknown>) => string
}

/** Number of textarea rows for the textarea control */
const TEXTAREA_ROWS = 3

/** Number of textarea rows for the code control */
const CODE_TEXTAREA_ROWS = 5

/** Precision digits for money input */
const MONEY_PRECISION = 2

/** Max value for progress input */
const PROGRESS_MAX = 100

/**
 * Registry mapping valueType to component configuration.
 * Used by ProTable for column rendering and by ProForm for field control rendering.
 * Single source of truth -- ProForm imports this instead of duplicating the switch.
 */
export const CONTROL_REGISTRY: Record<ValueType, ControlRegistryEntry> = {
  text: { component: ElInput, defaultProps: { clearable: true } },
  textarea: { component: ElInput, defaultProps: { type: 'textarea', rows: TEXTAREA_ROWS } },
  number: { component: ElInputNumber, defaultProps: {} },
  select: { component: ElSelect, defaultProps: { clearable: true } },
  date: { component: ElDatePicker, defaultProps: { type: 'date', valueFormat: 'YYYY-MM-DD' } },
  dateTime: { component: ElDatePicker, defaultProps: { type: 'datetime' } },
  dateRange: { component: ElDatePicker, defaultProps: { type: 'daterange' } },
  radio: { component: ElRadioGroup, defaultProps: {} },
  checkbox: { component: ElCheckboxGroup, defaultProps: {} },
  switch: { component: ElSwitch, defaultProps: {} },
  money: {
    component: ElInputNumber,
    defaultProps: { prefix: '$', precision: MONEY_PRECISION },
  },
  percent: { component: ElInputNumber, defaultProps: { suffix: '%' } },
  progress: { component: ElInputNumber, defaultProps: { min: 0, max: PROGRESS_MAX } },
  image: { component: ElInput, defaultProps: { placeholder: 'Image URL' } },
  code: { component: ElInput, defaultProps: { type: 'textarea', rows: CODE_TEXTAREA_ROWS } },
}

// --- Format functions ---

/** Check if a value is null or undefined */
function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined
}

/** Wrap a format function to return '-' for nullish values */
function wrapFormat(fn: (value: unknown) => string): (value: unknown) => string {
  return (value: unknown) => {
    if (isNullish(value)) return '-'
    return fn(value)
  }
}

const DEFAULT_LOCALE = 'en-US'

function formatNumber(value: unknown): string {
  return fmtNumber(Number(value), DEFAULT_LOCALE)
}

function formatMoney(value: unknown): string {
  return fmtMoney(Number(value), DEFAULT_LOCALE)
}

function formatPercent(value: unknown): string {
  return fmtPercent(Number(value), DEFAULT_LOCALE)
}

function formatDate(value: unknown): string {
  return fmtDate(value as string | number | Date, 'date', DEFAULT_LOCALE)
}

function formatDateTime(value: unknown): string {
  return fmtDate(value as string | number | Date, 'dateTime', DEFAULT_LOCALE)
}

// --- Static config maps ---

const TABLE_RENDER_MAP: Record<string, TableRenderConfig> = {
  text: { component: 'span', format: wrapFormat((v) => String(v)) },
  number: { component: 'span', format: wrapFormat(formatNumber) },
  money: { component: 'span', format: wrapFormat(formatMoney) },
  percent: { component: 'span', format: wrapFormat(formatPercent) },
  date: { component: 'span', format: wrapFormat(formatDate) },
  dateTime: { component: 'span', format: wrapFormat(formatDateTime) },
  dateRange: { component: 'span', format: wrapFormat((v) => String(v)) },
  select: { component: 'ElTag', format: wrapFormat((v) => String(v)) },
  radio: { component: 'ElTag', format: wrapFormat((v) => String(v)) },
  checkbox: { component: 'ElTag', format: wrapFormat((v) => String(v)) },
  switch: { component: 'ElSwitch', format: wrapFormat((v) => (v ? 'Yes' : 'No')) },
  textarea: { component: 'span', format: wrapFormat((v) => String(v)) },
  progress: { component: 'ElProgress', format: wrapFormat((v) => `${String(v)}%`) },
  image: { component: 'ElImage', format: wrapFormat((v) => String(v)) },
  code: { component: 'pre', format: wrapFormat((v) => String(v)) },
}

const SEARCH_CONFIG_MAP: Record<string, SearchComponentConfig | null> = {
  text: { component: 'ElInput', props: {} },
  number: { component: 'ElInputNumber', props: {} },
  money: { component: 'ElInputNumber', props: { prefix: '$' } },
  percent: { component: 'ElInputNumber', props: { suffix: '%' } },
  select: { component: 'ElSelect', props: {} },
  date: { component: 'ElDatePicker', props: { type: 'date' } },
  dateRange: { component: 'ElDatePicker', props: { type: 'daterange' } },
  dateTime: { component: 'ElDatePicker', props: { type: 'datetime' } },
  switch: { component: 'ElSwitch', props: {} },
  radio: { component: 'ElRadioGroup', props: {} },
  checkbox: { component: 'ElCheckboxGroup', props: {} },
  textarea: { component: 'ElInput', props: { type: 'textarea' } },
  progress: null,
  image: null,
  code: null,
}

const DEFAULT_TABLE_CONFIG: TableRenderConfig = {
  component: 'span',
  format: wrapFormat((v) => String(v)),
}

/**
 * Maps valueType to Element Plus component configuration for both
 * table cell rendering and search form controls.
 *
 * Shared between ProTable, ProForm, and ProDescriptions.
 */
export function useValueType(): UseValueTypeReturn {
  /** Get table cell render configuration for a valueType */
  function getTableRenderConfig(valueType: ValueType): TableRenderConfig {
    return TABLE_RENDER_MAP[valueType] ?? DEFAULT_TABLE_CONFIG
  }

  /** Get search form component configuration. Returns null for non-searchable types. */
  function getSearchConfig(valueType: ValueType): SearchComponentConfig | null {
    if (valueType in SEARCH_CONFIG_MAP) {
      return SEARCH_CONFIG_MAP[valueType]
    }
    return { component: 'ElInput', props: {} }
  }

  return {
    getTableRenderConfig,
    getSearchConfig,
  }
}
