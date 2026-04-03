<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useCodeEditor } from '../composables/use-code-editor'

import type { EditorLanguage, EditorTheme } from '../types'

defineOptions({ name: 'CodeEditor' })

interface Props {
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
  options?: Record<string, unknown>
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  language: 'plaintext',
  theme: 'vs-dark',
  readOnly: false,
  minHeight: 200,
  maxHeight: 0,
  lineNumbers: true,
  minimap: false,
  wordWrap: false,
  fontSize: 14,
  tabSize: 2,
  placeholder: '',
  showToolbar: true,
  showStatusBar: true,
  autoFocus: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
  save: [value: string]
  focus: []
  blur: []
}>()

const containerRef = ref<HTMLElement | null>(null)

/** Prevent circular update when we set value from prop */
let isUpdatingFromProp = false

const editor = useCodeEditor({
  container: containerRef,
  defaultValue: props.modelValue,
  language: props.language,
  theme: props.theme,
  readOnly: props.readOnly,
  fontSize: props.fontSize,
  tabSize: props.tabSize,
  lineNumbers: props.lineNumbers,
  minimap: props.minimap,
  wordWrap: props.wordWrap,
  autoFocus: props.autoFocus,
  options: props.options as Record<string, unknown>,
  onChange(value: string) {
    if (isUpdatingFromProp) return
    emit('update:modelValue', value)
    emit('change', value)
  },
})

// Sync prop → editor (external v-model updates)
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== editor.getValue()) {
      isUpdatingFromProp = true
      editor.setValue(newVal)
      isUpdatingFromProp = false
    }
  },
)

// Sync language prop
watch(
  () => props.language,
  (lang) => editor.setLanguage(lang),
)

// Sync theme prop
watch(
  () => props.theme,
  (theme) => editor.setTheme(theme),
)

// Sync readOnly
watch(
  () => props.readOnly,
  (readOnly) => {
    editor.editorInstance?.updateOptions({ readOnly })
  },
)

// Sync fontSize
watch(
  () => props.fontSize,
  (fontSize) => {
    editor.editorInstance?.updateOptions({ fontSize })
  },
)

// Sync wordWrap
watch(
  () => props.wordWrap,
  (wordWrap) => {
    editor.editorInstance?.updateOptions({ wordWrap: wordWrap ? 'on' : 'off' })
  },
)

// Sync minimap
watch(
  () => props.minimap,
  (minimap) => {
    editor.editorInstance?.updateOptions({ minimap: { enabled: minimap } })
  },
)

// Sync lineNumbers
watch(
  () => props.lineNumbers,
  (lineNumbers) => {
    editor.editorInstance?.updateOptions({ lineNumbers: lineNumbers ? 'on' : 'off' })
  },
)

const containerStyle = computed(() => {
  const style: Record<string, string> = {
    minHeight: `${props.minHeight}px`,
  }
  if (props.maxHeight > 0) {
    style.maxHeight = `${props.maxHeight}px`
  }
  return style
})

/** Language display name */
const LANGUAGE_LABELS: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  sql: 'SQL',
  python: 'Python',
  go: 'Go',
  shell: 'Bash',
  json: 'JSON',
  html: 'HTML',
  css: 'CSS',
  markdown: 'Markdown',
  yaml: 'YAML',
  xml: 'XML',
  plaintext: 'Plain Text',
}

const languageLabel = computed(() => LANGUAGE_LABELS[props.language] ?? props.language)

const diagnosticSummary = computed(() => {
  const diags = editor.diagnostics as unknown as { severity: string }[]
  if (!Array.isArray(diags)) return { errors: 0, warnings: 0 }
  const errors = diags.filter((d) => d.severity === 'error').length
  const warnings = diags.filter((d) => d.severity === 'warning').length
  return { errors, warnings }
})

defineExpose({
  /** The useCodeEditor return object — full editor control */
  editor,
  /** Format the document */
  formatDocument: editor.formatDocument,
  /** Open search widget */
  openSearch: editor.openSearch,
  /** Open command palette */
  openCommandPalette: editor.openCommandPalette,
  /** Focus the editor */
  focus: editor.focus,
  /** Get current value */
  getValue: editor.getValue,
  /** Set value */
  setValue: editor.setValue,
})
</script>

<template>
  <div
    class="pro-code-editor"
    :class="{ 'pro-code-editor--dark': theme === 'vs-dark' || theme === 'hc-black' }"
  >
    <!-- Toolbar -->
    <div v-if="showToolbar" class="pro-code-editor__toolbar">
      <slot name="toolbar-left">
        <span class="pro-code-editor__lang-badge">{{ languageLabel }}</span>
        <span v-if="readOnly" class="pro-code-editor__readonly-badge">READ ONLY</span>
      </slot>
      <div class="pro-code-editor__toolbar-spacer" />
      <slot name="toolbar-right">
        <button
          class="pro-code-editor__action"
          title="Format (Shift+Alt+F)"
          :disabled="readOnly"
          @click="editor.formatDocument()"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
            <path d="M2 3h12v1H2zm2 3h8v1H4zm-2 3h12v1H2zm2 3h8v1H4z" />
          </svg>
        </button>
        <button
          class="pro-code-editor__action"
          title="Search (Ctrl+F)"
          @click="editor.openSearch()"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
            <path
              d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"
            />
          </svg>
        </button>
        <button
          class="pro-code-editor__action"
          title="Command Palette (F1)"
          @click="editor.openCommandPalette()"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
            <path
              d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm4 1v2h8V3H4z"
            />
          </svg>
        </button>
        <slot name="toolbar-actions" />
      </slot>
    </div>

    <!-- Editor container -->
    <div ref="containerRef" class="pro-code-editor__body" :style="containerStyle" />

    <!-- Status bar -->
    <div v-if="showStatusBar" class="pro-code-editor__statusbar">
      <span class="pro-code-editor__statusbar-item">
        Ln
        {{
          (editor.cursorPosition as any)?.value?.lineNumber ??
          (editor.cursorPosition as any)?.lineNumber ??
          1
        }}, Col
        {{
          (editor.cursorPosition as any)?.value?.column ??
          (editor.cursorPosition as any)?.column ??
          1
        }}
      </span>
      <span
        v-if="diagnosticSummary.errors > 0"
        class="pro-code-editor__statusbar-item pro-code-editor__statusbar-item--error"
      >
        {{ diagnosticSummary.errors }} error{{ diagnosticSummary.errors > 1 ? 's' : '' }}
      </span>
      <span
        v-if="diagnosticSummary.warnings > 0"
        class="pro-code-editor__statusbar-item pro-code-editor__statusbar-item--warning"
      >
        {{ diagnosticSummary.warnings }} warning{{ diagnosticSummary.warnings > 1 ? 's' : '' }}
      </span>
      <div class="pro-code-editor__statusbar-spacer" />
      <span class="pro-code-editor__statusbar-item">{{ languageLabel }}</span>
      <span class="pro-code-editor__statusbar-item">UTF-8</span>
      <span class="pro-code-editor__statusbar-item">Spaces: {{ tabSize }}</span>
    </div>
  </div>
</template>

<style>
.pro-code-editor {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--pro-border-default, #e5e5e5);
  border-radius: var(--pro-radius-md, 8px);
  overflow: hidden;
  background: #ffffff;
}

.pro-code-editor--dark {
  background: #1e1e1e;
  border-color: #3e3e3e;
}

/* ─── Read-only badge ─────────────────────────────────────────────── */
.pro-code-editor__readonly-badge {
  font-size: 10px;
  font-weight: 600;
  color: #f59e0b;
  background: #fef3c7;
  padding: 1px 6px;
  border-radius: 3px;
  letter-spacing: 0.5px;
  user-select: none;
}

.pro-code-editor--dark .pro-code-editor__readonly-badge {
  color: #fbbf24;
  background: #422006;
}

/* ─── Toolbar ─────────────────────────────────────────────────────── */
.pro-code-editor__toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #f8f8f8;
  border-bottom: 1px solid var(--pro-border-light, #ebebeb);
  min-height: 36px;
}

.pro-code-editor--dark .pro-code-editor__toolbar {
  background: #252526;
  border-bottom-color: #3e3e3e;
}

.pro-code-editor__lang-badge {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
  user-select: none;
}

.pro-code-editor--dark .pro-code-editor__lang-badge {
  color: #a0a0a0;
  background: #333333;
}

.pro-code-editor__toolbar-spacer {
  flex: 1;
}

.pro-code-editor__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
}

.pro-code-editor__action:hover {
  background: #e5e5e5;
  color: #1f2937;
}

.pro-code-editor__action:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pro-code-editor--dark .pro-code-editor__action {
  color: #a0a0a0;
}

.pro-code-editor--dark .pro-code-editor__action:hover {
  background: #3e3e3e;
  color: #e0e0e0;
}

/* ─── Editor body ─────────────────────────────────────────────────── */
.pro-code-editor__body {
  flex: 1;
  overflow: hidden;
}

/* ─── Status bar ──────────────────────────────────────────────────── */
.pro-code-editor__statusbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 2px 12px;
  background: #f8f8f8;
  border-top: 1px solid var(--pro-border-light, #ebebeb);
  min-height: 24px;
}

.pro-code-editor--dark .pro-code-editor__statusbar {
  background: #252526;
  border-top-color: #3e3e3e;
}

.pro-code-editor__statusbar-item {
  font-size: 11px;
  color: #6b7280;
  white-space: nowrap;
  user-select: none;
}

.pro-code-editor--dark .pro-code-editor__statusbar-item {
  color: #808080;
}

.pro-code-editor__statusbar-item--error {
  color: #ef4444;
}

.pro-code-editor__statusbar-item--warning {
  color: #f59e0b;
}

.pro-code-editor__statusbar-spacer {
  flex: 1;
}
</style>
