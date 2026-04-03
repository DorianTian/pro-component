import { ref, shallowRef, onMounted, onBeforeUnmount, watch, type Ref } from 'vue'
import * as monaco from 'monaco-editor'

import type {
  EditorLanguage,
  EditorTheme,
  EditorDiagnostic,
  CursorPosition,
  EditorSelection,
  UseCodeEditorReturn,
} from '../types'

/** Severity number → string mapping (Monaco MarkerSeverity) */
const SEVERITY_MAP: Record<number, EditorDiagnostic['severity']> = {
  1: 'hint',
  2: 'info',
  4: 'warning',
  8: 'error',
}

export interface UseCodeEditorOptions {
  /** Container element ref — editor mounts here */
  container: Ref<HTMLElement | null>
  /** Initial value */
  defaultValue?: string
  /** Language */
  language?: EditorLanguage
  /** Theme */
  theme?: EditorTheme
  /** Read-only mode */
  readOnly?: boolean
  /** Font size */
  fontSize?: number
  /** Tab size */
  tabSize?: number
  /** Show line numbers */
  lineNumbers?: boolean
  /** Show minimap */
  minimap?: boolean
  /** Word wrap */
  wordWrap?: boolean
  /** Auto-focus on mount */
  autoFocus?: boolean
  /** Extra Monaco options */
  options?: monaco.editor.IStandaloneEditorConstructionOptions
  /** Called when value changes */
  onChange?: (value: string) => void
}

/**
 * Headless composable for Monaco Editor lifecycle.
 * Handles mount, dispose, reactive options sync, and exposes editor actions.
 */
export function useCodeEditor(opts: UseCodeEditorOptions): UseCodeEditorReturn {
  const editorRef = shallowRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const cursorPosition = ref<CursorPosition>({ lineNumber: 1, column: 1 })
  const selection = ref<EditorSelection | null>(null)
  const diagnostics = ref<EditorDiagnostic[]>([])
  const lineCount = ref(1)

  const disposables: monaco.IDisposable[] = []

  function createEditor(): void {
    const container = opts.container.value
    if (!container) return

    const editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
      value: opts.defaultValue ?? '',
      language: opts.language ?? 'plaintext',
      theme: opts.theme ?? 'vs-dark',
      readOnly: opts.readOnly ?? false,
      fontSize: opts.fontSize ?? 14,
      tabSize: opts.tabSize ?? 2,
      lineNumbers: opts.lineNumbers !== false ? 'on' : 'off',
      minimap: { enabled: opts.minimap ?? false },
      wordWrap: opts.wordWrap ? 'on' : 'off',
      automaticLayout: true,
      scrollBeyondLastLine: false,
      padding: { top: 12, bottom: 12 },
      renderLineHighlight: 'line',
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      bracketPairColorization: { enabled: true },
      guides: { bracketPairs: true, indentation: true },
      suggest: {
        showKeywords: true,
        showSnippets: true,
        showFunctions: true,
        showVariables: true,
      },
      quickSuggestions: { other: true, comments: false, strings: true },
      parameterHints: { enabled: true },
      folding: true,
      foldingStrategy: 'indentation',
      links: true,
      colorDecorators: true,
      contextmenu: true,
      mouseWheelZoom: true,
      formatOnPaste: true,
      ...opts.options,
    }

    const instance = monaco.editor.create(container, editorOptions)
    editorRef.value = instance

    // Track content changes
    disposables.push(
      instance.onDidChangeModelContent(() => {
        const value = instance.getValue()
        lineCount.value = instance.getModel()?.getLineCount() ?? 1
        opts.onChange?.(value)
      }),
    )

    // Track cursor position
    disposables.push(
      instance.onDidChangeCursorPosition((e) => {
        cursorPosition.value = {
          lineNumber: e.position.lineNumber,
          column: e.position.column,
        }
      }),
    )

    // Track selection
    disposables.push(
      instance.onDidChangeCursorSelection((e) => {
        const sel = e.selection
        if (sel.isEmpty()) {
          selection.value = null
        } else {
          selection.value = {
            startLineNumber: sel.startLineNumber,
            startColumn: sel.startColumn,
            endLineNumber: sel.endLineNumber,
            endColumn: sel.endColumn,
          }
        }
      }),
    )

    // Track diagnostics
    disposables.push(
      monaco.editor.onDidChangeMarkers(([resource]) => {
        const model = instance.getModel()
        if (!model || resource.toString() !== model.uri.toString()) return
        const markers = monaco.editor.getModelMarkers({ resource })
        diagnostics.value = markers.map((m) => ({
          severity: SEVERITY_MAP[m.severity] ?? 'info',
          message: m.message,
          startLineNumber: m.startLineNumber,
          startColumn: m.startColumn,
          endLineNumber: m.endLineNumber,
          endColumn: m.endColumn,
        }))
      }),
    )

    lineCount.value = instance.getModel()?.getLineCount() ?? 1

    if (opts.autoFocus) {
      instance.focus()
    }
  }

  function dispose(): void {
    for (const d of disposables) {
      d.dispose()
    }
    disposables.length = 0
    editorRef.value?.dispose()
    editorRef.value = null
  }

  onMounted(createEditor)
  onBeforeUnmount(dispose)

  // Reactive option syncing
  watch(
    () => opts.theme,
    (theme) => {
      if (theme) monaco.editor.setTheme(theme)
    },
  )

  // --- Exposed actions ---

  async function formatDocument(): Promise<void> {
    const ed = editorRef.value
    if (!ed) return
    await ed.getAction('editor.action.formatDocument')?.run()
  }

  function openSearch(): void {
    editorRef.value?.getAction('actions.find')?.run()
  }

  function openCommandPalette(): void {
    editorRef.value?.getAction('editor.action.quickCommand')?.run()
  }

  function focus(): void {
    editorRef.value?.focus()
  }

  function getValue(): string {
    return editorRef.value?.getValue() ?? ''
  }

  function setValue(value: string): void {
    const ed = editorRef.value
    if (!ed) return
    if (ed.getValue() !== value) {
      ed.setValue(value)
    }
  }

  function setLanguage(language: EditorLanguage): void {
    const model = editorRef.value?.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, language)
    }
  }

  function setTheme(theme: EditorTheme): void {
    monaco.editor.setTheme(theme)
  }

  function insertAtCursor(text: string): void {
    const ed = editorRef.value
    if (!ed) return
    const pos = ed.getPosition()
    if (!pos) return
    ed.executeEdits('insertAtCursor', [
      { range: new monaco.Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column), text },
    ])
  }

  function undo(): void {
    editorRef.value?.trigger('keyboard', 'undo', null)
  }

  function redo(): void {
    editorRef.value?.trigger('keyboard', 'redo', null)
  }

  return {
    get editorInstance() {
      return editorRef.value
    },
    cursorPosition: cursorPosition as unknown as CursorPosition,
    selection: selection as unknown as EditorSelection | null,
    diagnostics: diagnostics as unknown as EditorDiagnostic[],
    lineCount: lineCount as unknown as number,
    formatDocument,
    openSearch,
    openCommandPalette,
    focus,
    getValue,
    setValue,
    setLanguage,
    setTheme,
    insertAtCursor,
    undo,
    redo,
    dispose,
  }
}
