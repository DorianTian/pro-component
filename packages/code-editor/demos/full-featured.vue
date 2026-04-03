<script setup lang="ts">
import { ref, computed } from 'vue'
import { CodeEditor } from '@pro/code-editor'

import type { EditorLanguage, EditorTheme } from '@pro/code-editor'

const editorRef = ref<InstanceType<typeof CodeEditor> | null>(null)
const theme = ref<EditorTheme>('vs-dark')
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

const paginatedUsers = computed(() => {
  const start = (state.value.currentPage - 1) * state.value.pageSize
  return filteredUsers.value.slice(start, start + state.value.pageSize)
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
</script>

<template>
  <div>
    <!-- Controls -->
    <div
      style="display: flex; gap: 16px; margin-bottom: 12px; flex-wrap: wrap; align-items: center"
    >
      <div style="display: flex; align-items: center; gap: 6px">
        <span style="font-size: 12px; color: #6b7280">Language:</span>
        <select
          v-model="language"
          style="
            padding: 3px 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 12px;
            background: #fff;
          "
        >
          <option v-for="l in languages" :key="l.value" :value="l.value">{{ l.label }}</option>
        </select>
      </div>
      <div style="display: flex; align-items: center; gap: 6px">
        <span style="font-size: 12px; color: #6b7280">Theme:</span>
        <select
          v-model="theme"
          style="
            padding: 3px 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 12px;
            background: #fff;
          "
        >
          <option value="vs">Light</option>
          <option value="vs-dark">Dark</option>
          <option value="hc-black">HC Dark</option>
        </select>
      </div>
      <div style="display: flex; align-items: center; gap: 6px">
        <span style="font-size: 12px; color: #6b7280">Font:</span>
        <input v-model.number="fontSize" type="range" min="10" max="24" style="width: 80px" />
        <span style="font-size: 12px; color: #999">{{ fontSize }}px</span>
      </div>
      <label style="font-size: 12px; cursor: pointer; user-select: none; color: #6b7280">
        <input v-model="minimap" type="checkbox" style="margin-right: 4px" />Minimap
      </label>
      <label style="font-size: 12px; cursor: pointer; user-select: none; color: #6b7280">
        <input v-model="wordWrap" type="checkbox" style="margin-right: 4px" />Wrap
      </label>
      <label style="font-size: 12px; cursor: pointer; user-select: none; color: #6b7280">
        <input v-model="readOnly" type="checkbox" style="margin-right: 4px" />Read only
      </label>
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
