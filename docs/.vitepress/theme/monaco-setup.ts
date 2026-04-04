/**
 * Monaco Editor worker setup for VitePress docs.
 * Must run before any Monaco editor instance is created.
 * Uses Vite's ?worker import to bundle workers correctly.
 */
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

export function setupMonacoWorkers(): void {
  if (typeof window === 'undefined') return
  ;(self as unknown as Record<string, unknown>).MonacoEnvironment = {
    getWorker(_: unknown, label: string) {
      if (label === 'json') return new jsonWorker()
      if (label === 'typescript' || label === 'javascript') return new tsWorker()
      return new editorWorker()
    },
  }
}
