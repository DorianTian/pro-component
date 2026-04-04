<script setup lang="ts">
import { ref, computed } from 'vue'
import { CodeEditor } from '@pro/code-editor'
import { ElRadioGroup, ElRadioButton } from 'element-plus'

import type { EditorLanguage } from '@pro/code-editor'

const language = ref<EditorLanguage>('sql')

const samples: Record<string, string> = {
  sql: `SELECT
  u.id,
  u.name,
  COUNT(o.id) AS order_count,
  SUM(o.amount) AS total_spent
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.created_at >= '2024-01-01'
GROUP BY u.id, u.name
HAVING total_spent > 1000
ORDER BY total_spent DESC
LIMIT 20;`,

  javascript: `const fetchUsers = async (page = 1) => {
  const response = await fetch(\`/api/users?page=\${page}\`)
  if (!response.ok) {
    throw new Error(\`HTTP \${response.status}\`)
  }
  const { data, total } = await response.json()
  return { data, total, hasMore: data.length === 20 }
}`,

  typescript: `interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  createdAt: Date
}

async function getUser(id: string): Promise<User> {
  const res = await fetch(\`/api/users/\${id}\`)
  return res.json()
}`,

  python: `import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

def train_model(data_path: str) -> float:
    df = pd.read_csv(data_path)
    X = df.drop('target', axis=1)
    y = df['target']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestClassifier(n_estimators=100)
    model.fit(X_train, y_train)
    return model.score(X_test, y_test)`,

  go: `package main

import (
\t"fmt"
\t"net/http"
\t"encoding/json"
)

type User struct {
\tID    string \`json:"id"\`
\tName  string \`json:"name"\`
\tEmail string \`json:"email"\`
}

func handleGetUsers(w http.ResponseWriter, r *http.Request) {
\tusers := []User{
\t\t{ID: "1", Name: "Alice", Email: "alice@example.com"},
\t\t{ID: "2", Name: "Bob", Email: "bob@example.com"},
\t}
\tw.Header().Set("Content-Type", "application/json")
\tjson.NewEncoder(w).Encode(users)
}

func main() {
\thttp.HandleFunc("/api/users", handleGetUsers)
\tfmt.Println("Server running on :8080")
\thttp.ListenAndServe(":8080", nil)
}`,

  shell: `#!/bin/bash
set -euo pipefail

ENV=\${1:-staging}
BRANCH=\$(git rev-parse --abbrev-ref HEAD)

echo "Deploying $BRANCH to $ENV..."

docker build -t app:latest .
docker tag app:latest registry.example.com/app:$BRANCH

if [ "$ENV" = "production" ]; then
  echo "Production deploy — running tests first"
  docker run --rm app:latest npm test
fi

docker push registry.example.com/app:$BRANCH
echo "Deployed successfully"`,

  json: `{
  "name": "@pro/code-editor",
  "version": "0.0.1",
  "dependencies": {
    "monaco-editor": "^0.45.0"
  },
  "scripts": {
    "build": "rollup -c",
    "test": "vitest run"
  }
}`,
}

const code = computed({
  get: () => samples[language.value] ?? '',
  set: () => {},
})
</script>

<template>
  <div>
    <div style="margin-bottom: 12px">
      <ElRadioGroup v-model="language" size="small">
        <ElRadioButton value="sql">SQL</ElRadioButton>
        <ElRadioButton value="javascript">JavaScript</ElRadioButton>
        <ElRadioButton value="typescript">TypeScript</ElRadioButton>
        <ElRadioButton value="python">Python</ElRadioButton>
        <ElRadioButton value="go">Go</ElRadioButton>
        <ElRadioButton value="shell">Bash</ElRadioButton>
        <ElRadioButton value="json">JSON</ElRadioButton>
      </ElRadioGroup>
    </div>

    <CodeEditor v-model="code" :language="language" :min-height="360" />
  </div>
</template>
