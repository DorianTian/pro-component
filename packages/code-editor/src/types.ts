import type { editor } from 'monaco-editor'

/** Supported programming languages */
export type EditorLanguage =
  | 'javascript'
  | 'typescript'
  | 'sql'
  | 'python'
  | 'go'
  | 'shell'
  | 'json'
  | 'html'
  | 'css'
  | 'markdown'
  | 'yaml'
  | 'xml'
  | 'plaintext'

/** Editor theme presets */
export type EditorTheme =
  | 'vs'
  | 'vs-dark'
  | 'hc-black'
  | 'hc-light'
  | 'github-light'
  | 'github-dark'

/** Diagnostic marker from Monaco */
export interface EditorDiagnostic {
  severity: 'error' | 'warning' | 'info' | 'hint'
  message: string
  startLineNumber: number
  startColumn: number
  endLineNumber: number
  endColumn: number
}

/** Cursor position */
export interface CursorPosition {
  lineNumber: number
  column: number
}

/** Editor selection range */
export interface EditorSelection {
  startLineNumber: number
  startColumn: number
  endLineNumber: number
  endColumn: number
}

/** File tab definition for multi-tab mode */
export interface EditorTab {
  /** Unique identifier */
  key: string
  /** Display title */
  title: string
  /** Programming language */
  language: EditorLanguage
  /** File content */
  value: string
  /** Read-only tab */
  readOnly?: boolean
}

/** Props for the CodeEditor component */
export interface CodeEditorProps {
  /** Editor content (v-model) */
  modelValue?: string
  /** Programming language */
  language?: EditorLanguage
  /** Editor theme */
  theme?: EditorTheme
  /** Read-only mode */
  readOnly?: boolean
  /** Minimum height in px */
  minHeight?: number
  /** Maximum height in px (0 = no limit) */
  maxHeight?: number
  /** Show line numbers */
  lineNumbers?: boolean
  /** Show minimap */
  minimap?: boolean
  /** Enable word wrap */
  wordWrap?: boolean
  /** Font size in px */
  fontSize?: number
  /** Tab size */
  tabSize?: number
  /** Placeholder text when editor is empty */
  placeholder?: string
  /** Show toolbar */
  showToolbar?: boolean
  /** Show status bar */
  showStatusBar?: boolean
  /** Auto-focus editor on mount */
  autoFocus?: boolean
  /** Additional Monaco editor options */
  options?: editor.IStandaloneEditorConstructionOptions
}

/** Props for the DiffEditor component */
export interface DiffEditorProps {
  /** Original (left-side) content */
  original: string
  /** Modified (right-side) content */
  modified: string
  /** Programming language */
  language?: EditorLanguage
  /** Editor theme */
  theme?: EditorTheme
  /** Render side by side (true) or inline (false) */
  sideBySide?: boolean
  /** Minimum height in px */
  minHeight?: number
  /** Additional Monaco diff editor options */
  options?: editor.IDiffEditorConstructionOptions
}

/** Return type for useCodeEditor composable */
export interface UseCodeEditorReturn {
  /** The Monaco editor instance (null before mount) */
  editorInstance: editor.IStandaloneCodeEditor | null
  /** Current cursor position */
  cursorPosition: CursorPosition
  /** Current selection */
  selection: EditorSelection | null
  /** Current diagnostics/markers */
  diagnostics: EditorDiagnostic[]
  /** Total line count */
  lineCount: number
  /** Format document */
  formatDocument: () => Promise<void>
  /** Trigger find/replace widget */
  openSearch: () => void
  /** Trigger command palette */
  openCommandPalette: () => void
  /** Focus the editor */
  focus: () => void
  /** Get current value */
  getValue: () => string
  /** Set value */
  setValue: (value: string) => void
  /** Set language */
  setLanguage: (language: EditorLanguage) => void
  /** Set theme */
  setTheme: (theme: EditorTheme) => void
  /** Insert text at cursor */
  insertAtCursor: (text: string) => void
  /** Undo */
  undo: () => void
  /** Redo */
  redo: () => void
  /** Dispose the editor (called automatically on unmount) */
  dispose: () => void
}
