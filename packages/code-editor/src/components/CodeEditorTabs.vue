<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, shallowRef, nextTick } from 'vue'
import * as monaco from 'monaco-editor'

import type { EditorTab, EditorTheme, CursorPosition, EditorDiagnostic } from '../types'

defineOptions({ name: 'CodeEditorTabs' })

interface Props {
  /** Tab definitions */
  tabs: EditorTab[]
  /** Active tab key (v-model:activeKey) */
  activeKey?: string
  /** Editor theme */
  theme?: EditorTheme
  /** Minimum height */
  minHeight?: number
  /** Font size */
  fontSize?: number
  /** Show minimap */
  minimap?: boolean
  /** Closable tabs */
  closable?: boolean
  /** Show add tab button */
  addable?: boolean
  /** Additional Monaco options */
  options?: Record<string, unknown>
}

const props = withDefaults(defineProps<Props>(), {
  activeKey: undefined,
  theme: 'vs-dark',
  minHeight: 400,
  fontSize: 14,
  minimap: false,
  closable: false,
  addable: false,
})

const emit = defineEmits<{
  'update:activeKey': [key: string]
  'update:tabs': [tabs: EditorTab[]]
  change: [key: string, value: string]
  close: [key: string]
  add: []
}>()

const containerRef = ref<HTMLElement | null>(null)
const editorRef = shallowRef<monaco.editor.IStandaloneCodeEditor | null>(null)
const models = new Map<string, monaco.editor.ITextModel>()
const viewStates = new Map<string, monaco.editor.ICodeEditorViewState | null>()
const disposables: monaco.IDisposable[] = []

const internalActiveKey = ref(props.activeKey ?? props.tabs[0]?.key ?? '')
const cursorPosition = ref<CursorPosition>({ lineNumber: 1, column: 1 })
const diagnostics = ref<EditorDiagnostic[]>([])

const SEVERITY_MAP: Record<number, EditorDiagnostic['severity']> = {
  1: 'hint',
  2: 'info',
  4: 'warning',
  8: 'error',
}

const activeTab = computed(() => props.tabs.find((t) => t.key === internalActiveKey.value))

function getOrCreateModel(tab: EditorTab): monaco.editor.ITextModel {
  const existing = models.get(tab.key)
  if (existing && !existing.isDisposed()) return existing

  const uri = monaco.Uri.parse(`file:///${tab.key}`)
  const model = monaco.editor.createModel(tab.value, tab.language, uri)
  models.set(tab.key, model)

  model.onDidChangeContent(() => {
    const value = model.getValue()
    emit('change', tab.key, value)
  })

  return model
}

function switchToTab(key: string): void {
  const ed = editorRef.value
  if (!ed) return

  // Save view state of current tab
  viewStates.set(internalActiveKey.value, ed.saveViewState())

  const tab = props.tabs.find((t) => t.key === key)
  if (!tab) return

  const model = getOrCreateModel(tab)
  ed.setModel(model)
  ed.updateOptions({ readOnly: tab.readOnly ?? false })

  // Restore view state
  const state = viewStates.get(key)
  if (state) ed.restoreViewState(state)

  internalActiveKey.value = key
  emit('update:activeKey', key)
  ed.focus()
}

function handleClose(key: string): void {
  emit('close', key)

  const model = models.get(key)
  if (model) {
    model.dispose()
    models.delete(key)
  }
  viewStates.delete(key)

  // If closing active tab, switch to adjacent
  if (internalActiveKey.value === key && props.tabs.length > 0) {
    const idx = props.tabs.findIndex((t) => t.key === key)
    const next = props.tabs[Math.min(idx, props.tabs.length - 1)]
    if (next) switchToTab(next.key)
  }
}

function createEditor(): void {
  const container = containerRef.value
  if (!container) return

  const tab = activeTab.value ?? props.tabs[0]
  if (!tab) return

  const model = getOrCreateModel(tab)

  const ed = monaco.editor.create(container, {
    model,
    theme: props.theme,
    fontSize: props.fontSize,
    readOnly: tab.readOnly ?? false,
    minimap: { enabled: props.minimap },
    automaticLayout: true,
    scrollBeyondLastLine: false,
    padding: { top: 12, bottom: 12 },
    renderLineHighlight: 'line',
    smoothScrolling: true,
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    bracketPairColorization: { enabled: true },
    guides: { bracketPairs: true, indentation: true },
    folding: true,
    links: true,
    contextmenu: true,
    mouseWheelZoom: true,
    ...props.options,
  })

  editorRef.value = ed

  disposables.push(
    ed.onDidChangeCursorPosition((e) => {
      cursorPosition.value = { lineNumber: e.position.lineNumber, column: e.position.column }
    }),
  )

  disposables.push(
    monaco.editor.onDidChangeMarkers(([resource]) => {
      const m = ed.getModel()
      if (!m || resource.toString() !== m.uri.toString()) return
      const markers = monaco.editor.getModelMarkers({ resource })
      diagnostics.value = markers.map((mk) => ({
        severity: SEVERITY_MAP[mk.severity] ?? 'info',
        message: mk.message,
        startLineNumber: mk.startLineNumber,
        startColumn: mk.startColumn,
        endLineNumber: mk.endLineNumber,
        endColumn: mk.endColumn,
      }))
    }),
  )
}

onMounted(createEditor)

onBeforeUnmount(() => {
  for (const d of disposables) d.dispose()
  for (const m of models.values()) m.dispose()
  editorRef.value?.dispose()
})

watch(
  () => props.activeKey,
  (key) => {
    if (key && key !== internalActiveKey.value) switchToTab(key)
  },
)

watch(
  () => props.theme,
  (theme) => monaco.editor.setTheme(theme),
)

const containerStyle = computed(() => ({
  height: `${props.minHeight}px`,
}))

const diagnosticSummary = computed(() => {
  const errors = diagnostics.value.filter((d) => d.severity === 'error').length
  const warnings = diagnostics.value.filter((d) => d.severity === 'warning').length
  return { errors, warnings }
})

const LANG_LABELS: Record<string, string> = {
  javascript: 'JS',
  typescript: 'TS',
  sql: 'SQL',
  python: 'PY',
  go: 'Go',
  shell: 'SH',
  json: 'JSON',
  html: 'HTML',
  css: 'CSS',
  markdown: 'MD',
  yaml: 'YAML',
  xml: 'XML',
  plaintext: 'TXT',
}

defineExpose({
  getEditor: () => editorRef.value,
  switchToTab,
  formatDocument: async () => {
    await editorRef.value?.getAction('editor.action.formatDocument')?.run()
  },
})
</script>

<template>
  <div
    class="pro-code-tabs"
    :class="{ 'pro-code-tabs--dark': theme === 'vs-dark' || theme === 'hc-black' }"
    :style="containerStyle"
  >
    <!-- Tab bar -->
    <div class="pro-code-tabs__bar">
      <div class="pro-code-tabs__list">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="pro-code-tabs__tab"
          :class="{ 'pro-code-tabs__tab--active': tab.key === internalActiveKey }"
          @click="switchToTab(tab.key)"
        >
          <span class="pro-code-tabs__tab-lang">{{
            LANG_LABELS[tab.language] ?? tab.language
          }}</span>
          <span class="pro-code-tabs__tab-title">{{ tab.title }}</span>
          <span v-if="closable" class="pro-code-tabs__tab-close" @click.stop="handleClose(tab.key)">
            ×
          </span>
        </button>
      </div>
      <button v-if="addable" class="pro-code-tabs__add" @click="emit('add')">+</button>
      <div class="pro-code-tabs__bar-spacer" />
      <slot name="toolbar-actions" />
    </div>

    <!-- Editor -->
    <div ref="containerRef" class="pro-code-tabs__body" />

    <!-- Status bar -->
    <div class="pro-code-tabs__statusbar">
      <span class="pro-code-tabs__status-item">
        Ln {{ cursorPosition.lineNumber }}, Col {{ cursorPosition.column }}
      </span>
      <span
        v-if="diagnosticSummary.errors > 0"
        class="pro-code-tabs__status-item pro-code-tabs__status-item--error"
      >
        {{ diagnosticSummary.errors }} error{{ diagnosticSummary.errors > 1 ? 's' : '' }}
      </span>
      <span
        v-if="diagnosticSummary.warnings > 0"
        class="pro-code-tabs__status-item pro-code-tabs__status-item--warning"
      >
        {{ diagnosticSummary.warnings }} warning{{ diagnosticSummary.warnings > 1 ? 's' : '' }}
      </span>
      <div style="flex: 1" />
      <span v-if="activeTab" class="pro-code-tabs__status-item">{{ activeTab.language }}</span>
      <span class="pro-code-tabs__status-item">UTF-8</span>
    </div>
  </div>
</template>

<style>
.pro-code-tabs {
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.pro-code-tabs--dark {
  background: #1e1e1e;
  border-color: #3e3e3e;
}

/* ─── Tab bar ─────────────────────────────────────────────────────── */
.pro-code-tabs__bar {
  display: flex;
  align-items: center;
  background: #f3f3f3;
  border-bottom: 1px solid #e5e5e5;
  min-height: 36px;
  overflow-x: auto;
}

.pro-code-tabs--dark .pro-code-tabs__bar {
  background: #252526;
  border-bottom-color: #3e3e3e;
}

.pro-code-tabs__list {
  display: flex;
  min-width: 0;
}

.pro-code-tabs__tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: none;
  border-right: 1px solid #e5e5e5;
  background: transparent;
  color: #6b7280;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background 0.15s,
    color 0.15s;
}

.pro-code-tabs--dark .pro-code-tabs__tab {
  border-right-color: #3e3e3e;
  color: #808080;
}

.pro-code-tabs__tab:hover {
  background: #e8e8e8;
}

.pro-code-tabs--dark .pro-code-tabs__tab:hover {
  background: #2a2d2e;
}

.pro-code-tabs__tab--active {
  background: #fff;
  color: #1f2937;
  border-bottom: 2px solid #409eff;
  margin-bottom: -1px;
}

.pro-code-tabs--dark .pro-code-tabs__tab--active {
  background: #1e1e1e;
  color: #e0e0e0;
  border-bottom-color: #409eff;
}

.pro-code-tabs__tab-lang {
  font-size: 10px;
  font-weight: 600;
  background: #e8e8e8;
  padding: 1px 4px;
  border-radius: 3px;
  color: #6b7280;
}

.pro-code-tabs--dark .pro-code-tabs__tab-lang {
  background: #3e3e3e;
  color: #a0a0a0;
}

.pro-code-tabs__tab-title {
  font-weight: 500;
}

.pro-code-tabs__tab-close {
  font-size: 14px;
  line-height: 1;
  opacity: 0;
  transition: opacity 0.15s;
  margin-left: 2px;
}

.pro-code-tabs__tab:hover .pro-code-tabs__tab-close {
  opacity: 0.6;
}

.pro-code-tabs__tab-close:hover {
  opacity: 1 !important;
}

.pro-code-tabs__add {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 16px;
  cursor: pointer;
  border-radius: 4px;
  margin: 0 4px;
}

.pro-code-tabs__add:hover {
  background: #e5e5e5;
}

.pro-code-tabs--dark .pro-code-tabs__add:hover {
  background: #3e3e3e;
}

.pro-code-tabs__bar-spacer {
  flex: 1;
}

/* ─── Editor body ─────────────────────────────────────────────────── */
.pro-code-tabs__body {
  flex: 1;
  overflow: hidden;
}

/* ─── Status bar ──────────────────────────────────────────────────── */
.pro-code-tabs__statusbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 2px 12px;
  background: #f8f8f8;
  border-top: 1px solid #e5e5e5;
  min-height: 24px;
}

.pro-code-tabs--dark .pro-code-tabs__statusbar {
  background: #252526;
  border-top-color: #3e3e3e;
}

.pro-code-tabs__status-item {
  font-size: 11px;
  color: #6b7280;
  white-space: nowrap;
  user-select: none;
}

.pro-code-tabs--dark .pro-code-tabs__status-item {
  color: #808080;
}

.pro-code-tabs__status-item--error {
  color: #ef4444;
}

.pro-code-tabs__status-item--warning {
  color: #f59e0b;
}
</style>
