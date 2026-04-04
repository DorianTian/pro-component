<script setup lang="ts">
import { ref } from 'vue'
import { RichEditor } from '@pro/editor'

const content = ref('<p>This editor has a 200 character limit. Try typing more...</p>')
</script>

<template>
  <RichEditor
    v-model="content"
    :max-length="200"
    :min-height="200"
    placeholder="Max 200 characters..."
  />
</template>
