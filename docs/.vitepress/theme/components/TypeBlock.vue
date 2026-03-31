<script setup lang="ts">
defineProps<{
  /** Type definition title */
  title: string
  /** TypeScript code to display */
  code: string
}>()
</script>

<template>
  <div class="type-block">
    <div class="type-block__header">
      <code class="type-block__title">{{ title }}</code>
    </div>
    <div class="type-block__body">
      <div class="language-typescript vp-adaptive-theme">
        <pre><code>{{ code }}</code></pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.type-block {
  margin: 16px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.25s;
}

.type-block:hover {
  border-color: var(--vp-c-brand-1);
}

.type-block__header {
  padding: 8px 16px;
  background-color: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}

.type-block__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.type-block__body {
  padding: 0;
}

.type-block__body pre {
  margin: 0;
  padding: 16px;
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
}
</style>
