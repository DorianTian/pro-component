import { ref, reactive, computed, watch, type Ref } from 'vue'
import type { FormItemRule } from 'element-plus'

import type { ProColumnDef } from '../types'

export interface UseEditableOptions<T = Record<string, unknown>> {
  /** 'single' = one row at a time, 'multiple' = concurrent editing */
  type?: 'single' | 'multiple'
  /** Row key extractor */
  rowKey: string | ((row: T) => string)
  /** Controlled editable keys from parent */
  controlledKeys?: Ref<string[] | undefined>
  /** Data source ref — needed for new row insertion and onValuesChange */
  dataSource?: Ref<T[]>
  /** Called when editableKeys change */
  onChange?: (keys: string[], editableRows: T[]) => void
  /** Called on every cell value change */
  onValuesChange?: (record: T, dataSource: T[]) => void
  onSave?: (key: string, row: T, originRow: T, isNewRow: boolean) => Promise<boolean | void>
  onCancel?: (key: string, row: T, originRow: T, isNewRow: boolean) => void
  onDelete?: (key: string, row: T) => Promise<boolean | void>
}

export interface UseEditableReturn<T = Record<string, unknown>> {
  editableKeys: Ref<string[]>
  isEditing: (key: string) => boolean
  isNewRow: (key: string) => boolean
  startEdit: (key: string, row: T) => boolean
  cancelEdit: (key: string) => void
  saveEdit: (key: string) => Promise<boolean>
  deleteRow: (key: string) => Promise<boolean>
  addEditRecord: (row: T, options?: { position?: 'top' | 'bottom' }) => void
  setEditableKeys: (keys: string[]) => void
  getRowData: (key: string) => T | undefined
  getRowsData: () => T[]
  setRowData: (key: string, partial: Partial<T>) => void
  getEditingValue: (key: string, dataIndex: string) => unknown
  setEditingValue: (key: string, dataIndex: string, value: unknown) => void
  newRowKeys: Ref<Set<string>>
  validationErrors: Ref<Map<string, Record<string, string>>>
  validateRow: (key: string, columns: ProColumnDef[]) => Promise<boolean>
  clearValidationErrors: (key: string) => void
}

/** Resolve the string key for a row */
function resolveKey<T>(rowKey: string | ((row: T) => string), row: T): string {
  if (typeof rowKey === 'function') return rowKey(row)
  return String((row as Record<string, unknown>)[rowKey])
}

/** Resolve rules from a column's formItemProps */
function resolveRules<T>(col: ProColumnDef<T>, row: T, rowIndex: number): FormItemRule[] {
  if (!col.formItemProps) return []
  const props =
    typeof col.formItemProps === 'function'
      ? col.formItemProps(row, { rowIndex })
      : col.formItemProps
  return props.rules ?? []
}

/** Run validation against a single value (supports sync rules + async validator) */
async function validateField(value: unknown, rules: FormItemRule[]): Promise<string | null> {
  for (const rule of rules) {
    if (rule.required && (value === undefined || value === null || value === '')) {
      return (rule.message as string) ?? 'Required'
    }
    if (rule.min !== undefined && typeof value === 'string' && value.length < rule.min) {
      return (rule.message as string) ?? `Minimum ${rule.min} characters`
    }
    if (rule.max !== undefined && typeof value === 'string' && value.length > rule.max) {
      return (rule.message as string) ?? `Maximum ${rule.max} characters`
    }
    if (rule.pattern instanceof RegExp && typeof value === 'string' && !rule.pattern.test(value)) {
      return (rule.message as string) ?? 'Invalid format'
    }
    if (typeof rule.validator === 'function') {
      try {
        await new Promise<void>((resolve, reject) => {
          rule.validator!(rule, value, (err?: Error) => {
            if (err) reject(err)
            else resolve()
          })
        })
      } catch (err: unknown) {
        if (err instanceof Error) return err.message
        return (rule.message as string) ?? 'Validation failed'
      }
    }
  }
  return null
}

export function useEditable<T = Record<string, unknown>>(
  options: UseEditableOptions<T>,
): UseEditableReturn<T> {
  const editableKeys = ref<string[]>(options.controlledKeys?.value ?? []) as Ref<string[]>
  const editingRows: Map<string, T> = reactive(new Map())
  const originalRows: Map<string, T> = reactive(new Map())
  const newRowKeys = ref(new Set<string>()) as Ref<Set<string>>
  const validationErrors = ref(new Map<string, Record<string, string>>()) as Ref<
    Map<string, Record<string, string>>
  >

  // Sync controlled keys from parent → internal state
  if (options.controlledKeys) {
    watch(options.controlledKeys, (keys) => {
      if (keys !== undefined) {
        editableKeys.value = [...keys]
      }
    })
  }

  const editableType = computed(() => options.type ?? 'multiple')

  function getEditableRows(): T[] {
    return editableKeys.value
      .map((key) => editingRows.get(key))
      .filter((row): row is T => row !== undefined)
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

  function startEdit(key: string, row: T): boolean {
    if (isEditing(key)) return false

    // Single mode: cancel previous edit first
    if (editableType.value === 'single' && editableKeys.value.length > 0) {
      const prevKey = editableKeys.value[0]
      cancelEdit(prevKey)
    }

    editableKeys.value = [...editableKeys.value, key]
    editingRows.set(key, { ...row } as T)
    originalRows.set(key, { ...row } as T)
    notifyChange()
    return true
  }

  function cancelEdit(key: string): void {
    const editedRow = editingRows.get(key)
    const originalRow = originalRows.get(key)
    const isNew = isNewRow(key)

    // Remove new rows from data source on cancel
    if (isNew && options.dataSource) {
      const ds = options.dataSource.value
      const idx = ds.findIndex((r) => resolveKey(options.rowKey, r) === key)
      if (idx !== -1) {
        options.dataSource.value = [...ds.slice(0, idx), ...ds.slice(idx + 1)]
      }
      newRowKeys.value = new Set([...newRowKeys.value].filter((k) => k !== key))
    }

    options.onCancel?.(key, (editedRow ?? {}) as T, (originalRow ?? {}) as T, isNew)

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

    // Successful save: clean up
    editableKeys.value = editableKeys.value.filter((k) => k !== key)
    editingRows.delete(key)
    originalRows.delete(key)
    validationErrors.value.delete(key)
    if (isNew) {
      newRowKeys.value = new Set([...newRowKeys.value].filter((k) => k !== key))
    }
    notifyChange()
    return true
  }

  async function deleteRow(key: string): Promise<boolean> {
    const row = editingRows.get(key)
    if (options.onDelete) {
      const result = await options.onDelete(key, (row ?? {}) as T)
      if (result === false) return false
    }

    // Clean up editing state
    editableKeys.value = editableKeys.value.filter((k) => k !== key)
    editingRows.delete(key)
    originalRows.delete(key)
    validationErrors.value.delete(key)
    if (isNewRow(key)) {
      newRowKeys.value = new Set([...newRowKeys.value].filter((k) => k !== key))
    }

    // Remove from data source
    if (options.dataSource) {
      const ds = options.dataSource.value
      const idx = ds.findIndex((r) => resolveKey(options.rowKey, r) === key)
      if (idx !== -1) {
        options.dataSource.value = [...ds.slice(0, idx), ...ds.slice(idx + 1)]
      }
    }

    notifyChange()
    return true
  }

  function addEditRecord(row: T, opts?: { position?: 'top' | 'bottom' }): void {
    const key = resolveKey(options.rowKey, row)
    const position = opts?.position ?? 'bottom'

    // Insert into data source
    if (options.dataSource) {
      const ds = [...options.dataSource.value]
      if (position === 'top') {
        ds.unshift(row)
      } else {
        ds.push(row)
      }
      options.dataSource.value = ds
    }

    // Mark as new and start editing
    newRowKeys.value = new Set([...newRowKeys.value, key])
    editableKeys.value = [...editableKeys.value, key]
    editingRows.set(key, { ...row } as T)
    originalRows.set(key, { ...row } as T)
    notifyChange()
  }

  function setEditableKeys(keys: string[]): void {
    editableKeys.value = keys
    notifyChange()
  }

  function getRowData(key: string): T | undefined {
    return editingRows.get(key)
  }

  function getRowsData(): T[] {
    return getEditableRows()
  }

  function setRowData(key: string, partial: Partial<T>): void {
    const row = editingRows.get(key)
    if (!row) return
    const updated = { ...row, ...partial } as T
    editingRows.set(key, updated)
    if (options.onValuesChange && options.dataSource) {
      options.onValuesChange(updated, options.dataSource.value)
    }
  }

  function getEditingValue(key: string, dataIndex: string): unknown {
    const row = editingRows.get(key)
    return row ? (row as Record<string, unknown>)[dataIndex] : undefined
  }

  function setEditingValue(key: string, dataIndex: string, value: unknown): void {
    const row = editingRows.get(key)
    if (!row) return
    const updated = { ...row, [dataIndex]: value } as T
    editingRows.set(key, updated)
    if (options.onValuesChange && options.dataSource) {
      options.onValuesChange(updated, options.dataSource.value)
    }
  }

  /** Run validation for all editable columns of a row (supports async validators) */
  async function validateRow(key: string, columns: ProColumnDef[]): Promise<boolean> {
    const row = editingRows.get(key)
    if (!row) return false

    const rowIndex = options.dataSource
      ? options.dataSource.value.findIndex((r) => resolveKey(options.rowKey, r) === key)
      : 0

    const errors: Record<string, string> = {}
    for (const col of columns) {
      // Skip non-editable columns
      if (col.editable === false) continue
      if (
        typeof col.editable === 'function' &&
        !col.editable(row as Record<string, unknown> as T & Record<string, unknown>, rowIndex)
      )
        continue

      const rules = resolveRules(
        col,
        row as Record<string, unknown> as T & Record<string, unknown>,
        rowIndex,
      )
      if (rules.length === 0) continue

      const dataIndex = String(col.dataIndex)
      const value = (row as Record<string, unknown>)[dataIndex]
      const error = await validateField(value, rules)
      if (error) {
        errors[dataIndex] = error
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
