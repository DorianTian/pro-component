export { default as CodeEditor } from './components/CodeEditor.vue'
export { default as DiffEditor } from './components/DiffEditor.vue'
export { default as CodeEditorTabs } from './components/CodeEditorTabs.vue'

export { useCodeEditor } from './composables/use-code-editor'
export { registerGitHubThemes, GITHUB_LIGHT, GITHUB_DARK } from './themes'
export type { UseCodeEditorOptions } from './composables/use-code-editor'

export type {
  EditorLanguage,
  EditorTheme,
  EditorDiagnostic,
  CursorPosition,
  EditorSelection,
  EditorTab,
  CodeEditorProps,
  DiffEditorProps,
  UseCodeEditorReturn,
} from './types'
