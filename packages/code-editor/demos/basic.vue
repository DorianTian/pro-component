<script setup lang="ts">
import { ref } from 'vue'
import { CodeEditor } from '@pro/code-editor'

const code = ref(`function greet(name: string): string {
  return \`Hello, \${name}!\`
}

const users = ['Alice', 'Bob', 'Charlie']
users.forEach(user => {
  console.log(greet(user))
})`)
</script>

<template>
  <CodeEditor v-model="code" language="typescript" :min-height="300" />
</template>
