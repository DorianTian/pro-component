<script setup lang="ts">
import { ref } from 'vue'
import { AutoComplete } from '@pro/auto-complete'

const value = ref('')

const allSuggestions = [
  { value: 'Vue.js' },
  { value: 'React' },
  { value: 'Angular' },
  { value: 'Svelte' },
  { value: 'Solid' },
  { value: 'Vite' },
  { value: 'Vitest' },
]

const fetchSuggestions = (query: string, cb: (results: Array<{ value: string }>) => void) => {
  const results = query
    ? allSuggestions.filter((item) => item.value.toLowerCase().includes(query.toLowerCase()))
    : allSuggestions
  cb(results)
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 600px">
    <div>
      <label
        style="
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        "
        >Basic autocomplete</label
      >
      <AutoComplete
        v-model="value"
        :fetch-suggestions="fetchSuggestions"
        placeholder="Type a framework name..."
      />
    </div>
  </div>
</template>
