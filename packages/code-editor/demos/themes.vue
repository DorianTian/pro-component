<script setup lang="ts">
import { ref } from 'vue'
import { CodeEditor } from '@pro/code-editor'

import type { EditorTheme } from '@pro/code-editor'

const theme = ref<EditorTheme>('vs-dark')

const themes: { value: EditorTheme; label: string }[] = [
  { value: 'vs', label: 'Light' },
  { value: 'vs-dark', label: 'Dark' },
  { value: 'hc-black', label: 'High Contrast Dark' },
  { value: 'hc-light', label: 'High Contrast Light' },
]

const code = ref(`import { ref, computed, watch } from 'vue'

interface AppState {
  theme: 'light' | 'dark'
  fontSize: number
  language: string
}

const state = ref<AppState>({
  theme: 'dark',
  fontSize: 14,
  language: 'typescript',
})

const isDark = computed(() => state.value.theme === 'dark')

watch(isDark, (dark) => {
  document.documentElement.classList.toggle('dark', dark)
})`)
</script>

<template>
  <div>
    <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap">
      <button
        v-for="t in themes"
        :key="t.value"
        :style="{
          padding: '4px 12px',
          borderRadius: '4px',
          border: theme === t.value ? '1px solid #409eff' : '1px solid #ddd',
          background: theme === t.value ? '#ecf5ff' : '#fff',
          color: theme === t.value ? '#409eff' : '#333',
          cursor: 'pointer',
          fontSize: '13px',
        }"
        @click="theme = t.value"
      >
        {{ t.label }}
      </button>
    </div>
    <CodeEditor v-model="code" language="typescript" :theme="theme" :min-height="340" minimap />
  </div>
</template>
