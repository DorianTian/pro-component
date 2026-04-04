<script setup lang="ts">
import { ref } from 'vue'
import { CodeEditor } from '@pro/code-editor'
import { ElRadioGroup, ElRadioButton } from 'element-plus'

import type { EditorTheme } from '@pro/code-editor'

const theme = ref<EditorTheme>('github-dark')

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
    <div style="margin-bottom: 12px">
      <ElRadioGroup v-model="theme" size="small">
        <ElRadioButton value="github-light">GitHub Light</ElRadioButton>
        <ElRadioButton value="github-dark">GitHub Dark</ElRadioButton>
        <ElRadioButton value="vs">VS Light</ElRadioButton>
        <ElRadioButton value="vs-dark">VS Dark</ElRadioButton>
        <ElRadioButton value="hc-black">HC Dark</ElRadioButton>
      </ElRadioGroup>
    </div>
    <CodeEditor v-model="code" language="typescript" :theme="theme" :min-height="340" minimap />
  </div>
</template>
