import { ref, reactive, computed, watch, type Ref, type ComputedRef } from 'vue'
import type { FormItemRule } from 'element-plus'

import type { ProColumnDef } from '../types'

export interface UseEditableOptions {
  /** 'single' = one row at a time, 'multiple' = concurrent editing */
  type?: 'single' | 'multiple'
  /** Row key extractor */
  rowKey: string | ((row: Record<string, unknown>) => string)
  /** Controlled editable keys from parent */
  controlledKeys?: ComputedRef<string[] | undefined>
  /** Called when editableKeys change */
  onChange?: (keys: string[], editableRows: Record<string, unknown>[]) => void
  /** Called on every cell value change */
  onValuesChange?: (record: Record<string, unknown>, dataSource: Record<string, unknown>[]) => void
  onSave?: (
    key: string,
    row: Record<string, unknown>,
    originRow: Record<string, unknown>,
    isNewRow: boolean,
  ) => Promise<boolean | undefined>
  onCancel?: (
    key: string,
    row: Record<string, unknown>,
    originRow: Record<string, unknown>,
    isNewRow: boolean,
  ) => void
  onDelete?: (key: string, row: Record<string, unknown>) => Promise<boolean | undefined>
}

export interface UseEditableReturn {
  editableKeys: Ref<string[]>
  isEditing: (key: string) => boolean
  isNewRow: (key: string) => boolean
  startEdit: (key: string, row: Record<string, unknown>) => boolean
  cancelEdit: (key: string) => void
  saveEdit: (key: string) => Promise<boolean>
  deleteRow: (key: string) => Promise<boolean>
  addEditRecord: (row: Record<string, unknown>, options?: { position?: 'top' | 'bottom' }) => void
  setEditableKeys: (keys: string[]) => void
  getRowData: (key: string) => Record<string, unknown> | undefined
  getRowsData: () => Record<string, unknown>[]
  setRowData: (key: string, partial: Record<string, unknown>) => void
  getEditingValue: (key: string, dataIndex: string) => unknown
  setEditingValue: (key: string, dataIndex: string, value: unknown) => void
  newRowKeys: Ref<Set<string>>
  validationErrors: Ref<Map<string, Record<string, string>>>
  validateRow: (key: string, columns: ProColumnDef[]) => boolean
  clearValidationErrors: (key: string) => void
}

/** Resolve rules from a column's formItemProps */
function resolveRules(
  col: ProColumnDef,
  row: Record<string, unknown>,
  rowIndex: number,
): FormItemRule[] {
  if (!col.formItemProps) return []
  const props =
    typeof col.formItemProps === 'function'
      ? col.formItemProps(row, { rowIndex })
      : col.formItemProps
  return props.rules ?? []
}

function checkRequired(value: unknown, rule: FormItemRule): string | null {
  if (rule.required && (value === undefined || value === null || value === '')) {
    return String(rule.message ?? 'Required')
  }
  return null
}

function checkMinMax(value: unknown, rule: FormItemRule): string | null {
  if (typeof value !== 'string') return null
  if (rule.min !== undefined && value.length < rule.min) {
    return String(rule.message ?? `Minimum ${String(rule.min)} characters`)
  }
  if (rule.max !== undefined && value.length > rule.max) {
    return String(rule.message ?? `Maximum ${String(rule.max)} characters`)
  }
  return null
}

function checkPattern(value: unknown, rule: FormItemRule): string | null {
  if (rule.pattern instanceof RegExp && typeof value === 'string' && !rule.pattern.test(value)) {
    return String(rule.message ?? 'Invalid format')
  }
  return null
}

/** Run synchronous validation against a single value */
function validateField(value: unknown, rules: FormItemRule[]): string | null {
  for (const rule of rules) {
    const error =
      checkRequired(value, rule) ?? checkMinMax(value, rule) ?? checkPattern(value, rule)
    if (error) return error
  }
  return null
}

function removeKey(set: Set<string>, key: string): Set<string> {
  return new Set([...set].filter((k) => k !== key))
}

// eslint-disable-next-line max-lines-per-function -- Composable orchestrator; state machine with many related methods
export function useEditable(options: UseEditableOptions): UseEditableReturn {
  const editableKeys: Ref<string[]> = ref(options.controlledKeys?.value ?? [])
  const editingRows: Map<string, Record<string, unknown>> = reactive(new Map())
  const originalRows: Map<string, Record<string, unknown>> = reactive(new Map())
  const newRowKeys: Ref<Set<string>> = ref(new Set())
  const validationErrors: Ref<Map<string, Record<string, string>>> = ref(new Map())

  // Sync controlled keys from parent → internal state
  if (options.controlledKeys) {
    watch(options.controlledKeys, (keys) => {
      if (keys !== undefined) {
        editableKeys.value = [...keys]
      }
    })
  }

  const editableType = computed(() => options.type ?? 'multiple')

  function getEditableRows(): Record<string, unknown>[] {
    return editableKeys.value
      .map((key) => editingRows.get(key))
      .filter((row): row is Record<string, unknown> => row !== undefined)
  }

  function notifyChange(): void {
    options.onChange?.(editableKeys.value, getEditableRows())
  }

  function isEditing(key: string): boolean {
    return editableKeys.value.includes(key)
  }

  function isNewRow(key: string): boolean {
    return newRowKeys.value.has(key)
  }

  function startEdit(key: string, row: Record<string, unknown>): boolean {
    if (isEditing(key)) return false

    // Single mode: cancel previous edit first
    if (editableType.value === 'single' && editableKeys.value.length > 0) {
      const prevKey = editableKeys.value[0]
      cancelEdit(prevKey)
    }

    editableKeys.value = [...editableKeys.value, key]
    editingRows.set(key, { ...row })
    originalRows.set(key, { ...row })
    notifyChange()
    return true
  }

  function cancelEdit(key: string): void {
    const editedRow = editingRows.get(key)
    const originalRow = originalRows.get(key)
    const isNew = isNewRow(key)

    if (isNew) {
      newRowKeys.value = removeKey(newRowKeys.value, key)
    }

    options.onCancel?.(key, editedRow ?? {}, originalRow ?? {}, isNew)

    editableKeys.value = editableKeys.value.filter((k) => k !== key)
    editingRows.delete(key)
    originalRows.delete(key)
    validationErrors.value.delete(key)
    notifyChange()
  }

  async function saveEdit(key: string): Promise<boolean> {
    const editedRow = editingRows.get(key)
    const originalRow = originalRows.get(key)
    if (!editedRow || !originalRow) return false

    const isNew = isNewRow(key)

    if (options.onSave) {
      const result = await options.onSave(key, editedRow, originalRow, isNew)
      if (result === false) return false
    }

    editableKeys.value = editableKeys.value.filter((k) => k !== key)
    editingRows.delete(key)
    originalRows.delete(key)
    validationErrors.value.delete(key)
    if (isNew) {
      newRowKeys.value = removeKey(newRowKeys.value, key)
    }
    notifyChange()
    return true
  }

  async function deleteRow(key: string): Promise<boolean> {
    const row = editingRows.get(key) ?? {}
    if (options.onDelete) {
      const result = await options.onDelete(key, row)
      if (result === false) return false
    }

    editableKeys.value = editableKeys.value.filter((k) => k !== key)
    editingRows.delete(key)
    originalRows.delete(key)
    validationErrors.value.delete(key)
    if (isNewRow(key)) {
      newRowKeys.value = removeKey(newRowKeys.value, key)
    }
    notifyChange()
    return true
  }

  function addEditRecord(row: Record<string, unknown>): void {
    const rk = options.rowKey
    const key = typeof rk === 'function' ? rk(row) : String(row[rk])

    // Mark as new and start editing
    newRowKeys.value = new Set([...newRowKeys.value, key])
    editableKeys.value = [...editableKeys.value, key]
    editingRows.set(key, { ...row })
    originalRows.set(key, { ...row })
    notifyChange()
  }

  function setEditableKeys(keys: string[]): void {
    editableKeys.value = keys
    notifyChange()
  }

  function getRowData(key: string): Record<string, unknown> | undefined {
    return editingRows.get(key)
  }

  function getRowsData(): Record<string, unknown>[] {
    return getEditableRows()
  }

  function setRowData(key: string, partial: Record<string, unknown>): void {
    const row = editingRows.get(key)
    if (!row) return
    editingRows.set(key, { ...row, ...partial })
  }

  function getEditingValue(key: string, dataIndex: string): unknown {
    const row = editingRows.get(key)
    return row ? row[dataIndex] : undefined
  }

  function setEditingValue(key: string, dataIndex: string, value: unknown): void {
    const row = editingRows.get(key)
    if (!row) return
    editingRows.set(key, { ...row, [dataIndex]: value })
  }

  /** Run synchronous validation for all editable columns of a row */
  function validateRow(key: string, columns: ProColumnDef[]): boolean {
    const row = editingRows.get(key)
    if (!row) return false

    const errors: Record<string, string> = {}
    for (const col of columns) {
      if (col.editable === false) continue
      if (typeof col.editable === 'function' && !col.editable(row, 0)) continue

      const rules = resolveRules(col, row, 0)
      if (rules.length === 0) continue

      const error = validateField(row[col.dataIndex], rules)
      if (error) {
        errors[col.dataIndex] = error
      }
    }

    if (Object.keys(errors).length > 0) {
      validationErrors.value.set(key, errors)
      return false
    }

    validationErrors.value.delete(key)
    return true
  }

  function clearValidationErrors(key: string): void {
    validationErrors.value.delete(key)
  }

  return {
    editableKeys,
    isEditing,
    isNewRow,
    startEdit,
    cancelEdit,
    saveEdit,
    deleteRow,
    addEditRecord,
    setEditableKeys,
    getRowData,
    getRowsData,
    setRowData,
    getEditingValue,
    setEditingValue,
    newRowKeys,
    validationErrors,
    validateRow,
    clearValidationErrors,
  }
}
