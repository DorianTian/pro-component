import { ref } from 'vue'

import type { Ref } from 'vue'

export interface UseEditableOptions {
  rowKey: string | ((row: Record<string, unknown>) => string)
  onSave?: (
    key: string,
    row: Record<string, unknown>,
    originalRow: Record<string, unknown>,
  ) => Promise<boolean>
  onCancel?: (key: string, row: Record<string, unknown>) => void
  onDelete?: (key: string, row: Record<string, unknown>) => Promise<boolean>
  onChange?: (keys: string[]) => void
}

export interface UseEditableReturn {
  editableKeys: Ref<string[]>
  isEditing: (key: string) => boolean
  startEdit: (key: string, row: Record<string, unknown>) => void
  cancelEdit: (key: string) => void
  saveEdit: (key: string) => Promise<boolean>
  deleteRow: (key: string, row: Record<string, unknown>) => Promise<boolean>
  setEditableKeys: (keys: string[]) => void
  getEditingValue: (key: string, dataIndex: string) => unknown
  setEditingValue: (key: string, dataIndex: string, value: unknown) => void
}

export function useEditable(options: UseEditableOptions): UseEditableReturn {
  const editableKeys = ref<string[]>([])
  const editingRows = new Map<string, Record<string, unknown>>()
  const originalRows = new Map<string, Record<string, unknown>>()

  function isEditing(key: string): boolean {
    return editableKeys.value.includes(key)
  }

  function startEdit(key: string, row: Record<string, unknown>): void {
    if (isEditing(key)) return
    editableKeys.value = [...editableKeys.value, key]
    editingRows.set(key, { ...row })
    originalRows.set(key, { ...row })
    options.onChange?.(editableKeys.value)
  }

  function cancelEdit(key: string): void {
    editableKeys.value = editableKeys.value.filter((k) => k !== key)
    const original = originalRows.get(key)
    if (original) {
      options.onCancel?.(key, original)
    }
    editingRows.delete(key)
    originalRows.delete(key)
    options.onChange?.(editableKeys.value)
  }

  async function saveEdit(key: string): Promise<boolean> {
    const editedRow = editingRows.get(key)
    const original = originalRows.get(key)
    if (!editedRow || !original) return false

    if (options.onSave) {
      const result = await options.onSave(key, editedRow, original)
      if (!result) return false
    }

    editableKeys.value = editableKeys.value.filter((k) => k !== key)
    editingRows.delete(key)
    originalRows.delete(key)
    options.onChange?.(editableKeys.value)
    return true
  }

  async function deleteRow(key: string, row: Record<string, unknown>): Promise<boolean> {
    if (options.onDelete) {
      return options.onDelete(key, row)
    }
    return true
  }

  function setEditableKeys(keys: string[]): void {
    editableKeys.value = keys
    options.onChange?.(keys)
  }

  function getEditingValue(key: string, dataIndex: string): unknown {
    const row = editingRows.get(key)
    return row ? row[dataIndex] : undefined
  }

  function setEditingValue(key: string, dataIndex: string, value: unknown): void {
    const row = editingRows.get(key)
    if (row) {
      row[dataIndex] = value
      editingRows.set(key, { ...row })
    }
  }

  return {
    editableKeys,
    isEditing,
    startEdit,
    cancelEdit,
    saveEdit,
    deleteRow,
    setEditableKeys,
    getEditingValue,
    setEditingValue,
  }
}
