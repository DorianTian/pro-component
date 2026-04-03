# ProTable Editable — Complete Design Spec

> Date: 2026-04-03
> Status: Approved
> Scope: Full rewrite of ProTable editable functionality

## Overview

Complete rewrite of ProTable's editable system to match Ant Design ProTable's EditableProTable capabilities, adapted for Vue 3 + Element Plus. Supports two modes: **row editing** (click to edit individual rows) and **editable table** (all rows always editable, spreadsheet-like).

## Modes

### Row Editing

- `type: 'single'` — only one row editable at a time; starting a new edit auto-cancels the previous
- `type: 'multiple'` — multiple rows can be edited simultaneously

### Editable Table

Achieved by setting `type: 'multiple'` and pre-populating `editableKeys` with all row keys. Combined with `onValuesChange` for real-time data sync and `recordCreatorProps` for adding new rows.

## API Design

### EditableConfig

```ts
interface EditableConfig<T = Record<string, unknown>> {
  type?: 'single' | 'multiple'
  editableKeys?: string[]
  onChange?: (editableKeys: string[], editableRows: T[]) => void
  onValuesChange?: (record: T, dataSource: T[]) => void
  onSave?: (key: string, row: T, originRow: T, isNewRow: boolean) => Promise<boolean | void>
  onCancel?: (key: string, row: T, originRow: T, isNewRow: boolean) => void
  onDelete?: (key: string, row: T) => Promise<boolean | void>
  actionRender?: (row: T, config: EditableActionConfig<T>) => VNode[]
  recordCreatorProps?: RecordCreatorProps<T> | false
  maxLength?: number
  deleteConfirmText?: string
  saveText?: string
  cancelText?: string
  editText?: string
  deleteText?: string
  addText?: string
}
```

### RecordCreatorProps

```ts
interface RecordCreatorProps<T> {
  record: T | ((index: number, dataSource: T[]) => T)
  position?: 'top' | 'bottom'
  creatorButtonText?: string
  newRecordType?: 'cache' | 'dataSource'
}
```

### EditableActionConfig

```ts
interface EditableActionConfig<T> {
  editableKeys: string[]
  recordKey: string
  index: number
  isNewRow: boolean
  save: VNode
  cancel: VNode
  delete: VNode
}
```

### ProColumnDef Extensions

```ts
// Added to existing ProColumnDef interface:
editable?: boolean | ((row: T, index: number) => boolean)
fieldProps?: Record<string, unknown> | ((row: T, index: number) => Record<string, unknown>)
formItemProps?: {
  rules?: FormItemRule[]
} | ((row: T, config: { rowIndex: number }) => { rules?: FormItemRule[] })
```

### UseEditableReturn

```ts
interface UseEditableReturn<T = Record<string, unknown>> {
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
  validateRow: (key: string, columns: ProColumnDef[]) => boolean
  clearValidationErrors: (key: string) => void
}
```

### UseProTableReturn Extension

```ts
// Added to existing UseProTableReturn:
editable: UseEditableReturn<T> | null
```

## Data Flow

### Save Flow

1. User clicks save → `saveEdit(key)`
2. Synchronous validation runs against column `formItemProps.rules`
3. If validation fails → errors stored in `validationErrors` Map → save aborted
4. If validation passes → `onSave(key, editedRow, originalRow, isNewRow)` called
5. `onSave` returns `false` → save aborted, stay in edit mode
6. `onSave` returns `true`/`void` → key removed from editableKeys, Maps cleaned up

### Cancel Flow

1. User clicks cancel → `cancelEdit(key)`
2. If new row (tracked in `newRowKeys`) → row removed from data source
3. If existing row → no data source changes (original still in table)
4. `onCancel` callback fired
5. Maps cleaned up, key removed

### New Row Flow

1. `addEditRecord(row, { position })` called
2. Row inserted into data source at position
3. Key added to `editableKeys` and `newRowKeys`
4. Row enters edit mode immediately

## Reactivity Fix

Replace plain `Map` with `reactive(new Map())` for `editingRows` and `originalRows`. This ensures Vue tracks mutations and re-renders when editing values change.

## i18n

Add keys under `pro.table.editable`:

- `edit`, `save`, `cancel`, `delete`, `addRow`, `deleteConfirm`

Editable config text props (`saveText`, etc.) override i18n defaults when provided.

## EditableCell Enhancements

- Accept `valueEnum` → convert to options for Select/Radio/Checkbox
- Accept `fieldProps` → pass through to control component
- Accept `rules` + `validationError` → show inline error state via `el-form-item`
- Support column-level `editable: false` → render read-only even in edit mode

## Files to Modify

1. `packages/pro-table/src/composables/use-editable.ts` — full rewrite
2. `packages/pro-table/src/components/EditableCell.vue` — full rewrite
3. `packages/pro-table/src/types/index.ts` — extend types
4. `packages/pro-table/src/composables/use-pro-table-internal.ts` — integration rewrite
5. `packages/pro-table/src/composables/use-pro-table.ts` — expose editable API
6. `packages/pro-table/src/ProTable.vue` — template rewrite for editable section
7. `packages/locale/src/lang/en-US.ts` — add editable keys
8. `packages/locale/src/lang/zh-CN.ts` — add editable keys
9. `packages/pro-table/src/index.ts` — export new types
10. `packages/pro-table/demos/editable.vue` — rewrite demo
