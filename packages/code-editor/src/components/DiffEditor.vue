<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed, shallowRef } from 'vue'
import * as monaco from 'monaco-editor'
import { registerGitHubThemes } from '../themes'

import type { EditorLanguage, EditorTheme } from '../types'

defineOptions({ name: 'DiffEditor' })

interface Props {
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
  /** Read only */
  readOnly?: boolean
  /** Additional Monaco diff editor options */
  options?: Record<string, unknown>
}

const props = withDefaults(defineProps<Props>(), {
  language: 'plaintext',
  theme: 'github-dark',
  sideBySide: true,
  minHeight: 300,
  readOnly: true,
})

const emit = defineEmits<{
  'update:modified': [value: string]
}>()

const containerRef = ref<HTMLElement | null>(null)
const editorRef = shallowRef<monaco.editor.IStandaloneDiffEditor | null>(null)

function createEditor(): void {
  const container = containerRef.value
  if (!container) return

  registerGitHubThemes()

  const diffEditor = monaco.editor.createDiffEditor(container, {
    automaticLayout: true,
    readOnly: props.readOnly,
    renderSideBySide: props.sideBySide,
    scrollBeyondLastLine: false,
    fontSize: 14,
    padding: { top: 12, bottom: 12 },
    theme: props.theme,
    ...props.options,
  })

  const originalModel = monaco.editor.createModel(props.original, props.language)
  const modifiedModel = monaco.editor.createModel(props.modified, props.language)

  diffEditor.setModel({ original: originalModel, modified: modifiedModel })

  if (!props.readOnly) {
    modifiedModel.onDidChangeContent(() => {
      emit('update:modified', modifiedModel.getValue())
    })
  }

  editorRef.value = diffEditor
}

function dispose(): void {
  const ed = editorRef.value
  if (!ed) return
  const model = ed.getModel()
  model?.original?.dispose()
  model?.modified?.dispose()
  ed.dispose()
  editorRef.value = null
}

onMounted(createEditor)
onBeforeUnmount(dispose)

watch(
  () => props.original,
  (val) => {
    const model = editorRef.value?.getModel()
    if (model && model.original.getValue() !== val) {
      model.original.setValue(val)
    }
  },
)

watch(
  () => props.modified,
  (val) => {
    const model = editorRef.value?.getModel()
    if (model && model.modified.getValue() !== val) {
      model.modified.setValue(val)
    }
  },
)

watch(
  () => props.sideBySide,
  (val) => {
    editorRef.value?.updateOptions({ renderSideBySide: val })
  },
)

watch(
  () => props.theme,
  (theme) => monaco.editor.setTheme(theme),
)

const containerStyle = computed(() => ({
  height: `${props.minHeight}px`,
}))

defineExpose({
  getDiffEditor: () => editorRef.value,
})
</script>

<template>
  <div
    class="pro-diff-editor"
    :class="{
      'pro-diff-editor--dark':
        theme === 'vs-dark' || theme === 'hc-black' || theme === 'github-dark',
    }"
    :style="containerStyle"
  >
    <div ref="containerRef" class="pro-diff-editor__body" />
  </div>
</template>

<style>
.pro-diff-editor {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--pro-border-default, #e5e5e5);
  border-radius: var(--pro-radius-md, 8px);
  overflow: hidden;
  background: #ffffff;
}

.pro-diff-editor--dark {
  background: #1e1e1e;
  border-color: #3e3e3e;
}

.pro-diff-editor__body {
  flex: 1;
  overflow: hidden;
}
</style>
