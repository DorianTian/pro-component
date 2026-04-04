<script setup lang="ts">
import { ref } from 'vue'
import { RichEditor } from '@pro/editor'

const content = ref(`<h2>Welcome to Pro Editor</h2>
<p>A <strong>full-featured</strong> rich text editor built on <a href="https://tiptap.dev">TipTap</a> (ProseMirror).</p>
<h3>Features</h3>
<ul>
  <li>Rich text formatting (bold, italic, underline, strikethrough)</li>
  <li>Headings (H1, H2, H3)</li>
  <li>Bullet lists, ordered lists, and task lists</li>
  <li>Blockquotes and code blocks</li>
  <li>Links and images</li>
  <li>Tables with resizable columns</li>
  <li>Text color and highlighting</li>
  <li>Word and character count</li>
</ul>
<blockquote><p>This editor is designed for enterprise content editing scenarios.</p></blockquote>
<p>Try editing this content — the toolbar above provides all formatting options.</p>`)
</script>

<template>
  <RichEditor
    v-model="content"
    :min-height="300"
    placeholder="Start writing something amazing..."
  />
</template>
