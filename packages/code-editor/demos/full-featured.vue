<script setup lang="ts">
import { ref } from 'vue'
import { CodeEditor } from '@pro/code-editor'
import { ElSelect, ElOption, ElSlider, ElCheckbox } from 'element-plus'

import type { EditorLanguage, EditorTheme } from '@pro/code-editor'

const editorRef = ref<InstanceType<typeof CodeEditor> | null>(null)
const theme = ref<EditorTheme>('github-dark')
const language = ref<EditorLanguage>('typescript')
const readOnly = ref(false)
const minimap = ref(true)
const wordWrap = ref(false)
const fontSize = ref(14)

const code = ref(`import { ref, computed, onMounted } from 'vue'
import type { User, ApiResponse } from './types'

interface DashboardState {
  users: User[]
  loading: boolean
  error: string | null
  searchQuery: string
  currentPage: number
  pageSize: number
}

const state = ref<DashboardState>({
  users: [],
  loading: false,
  error: null,
  searchQuery: '',
  currentPage: 1,
  pageSize: 20,
})

const filteredUsers = computed(() => {
  const query = state.value.searchQuery.toLowerCase()
  if (!query) return state.value.users
  return state.value.users.filter(
    (user) =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query),
  )
})

async function fetchUsers(): Promise<void> {
  state.value.loading = true
  state.value.error = null
  try {
    const res = await fetch('/api/users')
    const data: ApiResponse<User[]> = await res.json()
    if (!data.success) throw new Error(data.message)
    state.value.users = data.data
  } catch (err) {
    state.value.error = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    state.value.loading = false
  }
}

onMounted(fetchUsers)
`)

const languages: { value: EditorLanguage; label: string }[] = [
  { value: 'typescript', label: 'TypeScript' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'sql', label: 'SQL' },
  { value: 'python', label: 'Python' },
  { value: 'go', label: 'Go' },
  { value: 'shell', label: 'Bash' },
  { value: 'json', label: 'JSON' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
]

const themeOptions: { value: EditorTheme; label: string }[] = [
  { value: 'github-dark', label: 'GitHub Dark' },
  { value: 'github-light', label: 'GitHub Light' },
  { value: 'vs', label: 'VS Light' },
  { value: 'vs-dark', label: 'VS Dark' },
]
</script>

<template>
  <div>
    <div
      style="display: flex; gap: 16px; margin-bottom: 12px; flex-wrap: wrap; align-items: center"
    >
      <ElSelect v-model="language" size="small" style="width: 140px">
        <ElOption v-for="l in languages" :key="l.value" :label="l.label" :value="l.value" />
      </ElSelect>
      <ElSelect v-model="theme" size="small" style="width: 140px">
        <ElOption v-for="t in themeOptions" :key="t.value" :label="t.label" :value="t.value" />
      </ElSelect>
      <div style="display: flex; align-items: center; gap: 6px">
        <span style="font-size: 12px; color: #6b7280; white-space: nowrap"
          >Font: {{ fontSize }}px</span
        >
        <ElSlider
          v-model="fontSize"
          :min="10"
          :max="24"
          :show-tooltip="false"
          style="width: 80px"
        />
      </div>
      <ElCheckbox v-model="minimap" label="Minimap" />
      <ElCheckbox v-model="wordWrap" label="Wrap" />
      <ElCheckbox v-model="readOnly" label="Read only" />
    </div>

    <CodeEditor
      ref="editorRef"
      v-model="code"
      :language="language"
      :theme="theme"
      :read-only="readOnly"
      :minimap="minimap"
      :word-wrap="wordWrap"
      :font-size="fontSize"
      :min-height="440"
    />
  </div>
</template>
