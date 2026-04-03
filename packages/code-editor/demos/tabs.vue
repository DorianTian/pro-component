<script setup lang="ts">
import { ref } from 'vue'
import { CodeEditorTabs } from '@pro/code-editor'

import type { EditorTab } from '@pro/code-editor'

const tabs = ref<EditorTab[]>([
  {
    key: 'index.ts',
    title: 'index.ts',
    language: 'typescript',
    value: `import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

const app = createApp(App)
app.use(router)
app.use(store)
app.mount('#app')`,
  },
  {
    key: 'api.ts',
    title: 'api.ts',
    language: 'typescript',
    value: `export interface User {
  id: string
  name: string
  email: string
}

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch('/api/users')
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
  return res.json()
}`,
  },
  {
    key: 'query.sql',
    title: 'query.sql',
    language: 'sql',
    value: `SELECT u.id, u.name, u.email, COUNT(o.id) AS orders
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name, u.email
ORDER BY orders DESC;`,
  },
  {
    key: 'deploy.sh',
    title: 'deploy.sh',
    language: 'shell',
    value: `#!/bin/bash
set -euo pipefail

echo "Building..."
pnpm build

echo "Deploying to staging..."
rsync -avz dist/ server:/var/www/app/

echo "Done!"`,
  },
  {
    key: 'config.json',
    title: 'config.json',
    language: 'json',
    readOnly: true,
    value: `{
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "myapp"
  },
  "redis": {
    "host": "localhost",
    "port": 6379
  }
}`,
  },
])

const activeKey = ref('index.ts')

function handleChange(key: string, value: string) {
  const tab = tabs.value.find((t) => t.key === key)
  if (tab) tab.value = value
}

function handleClose(key: string) {
  tabs.value = tabs.value.filter((t) => t.key !== key)
}
</script>

<template>
  <CodeEditorTabs
    v-model:active-key="activeKey"
    :tabs="tabs"
    closable
    :min-height="400"
    @change="handleChange"
    @close="handleClose"
  />
</template>
