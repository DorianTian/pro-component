<script setup lang="ts">
import { ref } from 'vue'
import { RichEditor } from '@pro/editor'
import { ElCheckbox } from 'element-plus'

const readOnly = ref(true)

const content = ref(`<h2>Release Notes v2.0.0</h2>
<p>We're excited to announce the release of <strong>Pro Components v2.0</strong> with significant improvements across all packages.</p>
<h3>Breaking Changes</h3>
<ul>
  <li>Minimum Vue version bumped to 3.4</li>
  <li>Element Plus minimum version bumped to 2.9</li>
</ul>
<h3>New Features</h3>
<ul>
  <li><code>@pro/code-editor</code> — Monaco-based IDE with multi-language support</li>
  <li><code>@pro/editor</code> — TipTap rich text editor with full toolbar</li>
  <li>ProForm field groups with collapsible sections</li>
  <li>ProTree drag-and-drop with undo/redo</li>
</ul>
<blockquote><p>See the <a href="#">migration guide</a> for upgrading from v1.</p></blockquote>`)
</script>

<template>
  <div>
    <div style="margin-bottom: 12px">
      <ElCheckbox v-model="readOnly" label="Read only" />
    </div>
    <RichEditor v-model="content" :read-only="readOnly" :min-height="280" />
  </div>
</template>
