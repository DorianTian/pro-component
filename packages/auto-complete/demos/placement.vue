<script setup lang="ts">
import { ref } from 'vue'
import { AutoComplete } from '@pro/auto-complete'

const top = ref('')
const bottom = ref('')

const suggestions = [{ value: '选项一' }, { value: '选项二' }, { value: '选项三' }]

const querySearch = (_query: string, cb: (results: Array<{ value: string }>) => void) => {
  cb(suggestions)
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 380px">
    <div>
      <label
        style="
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        "
        >下拉在下方（默认）</label
      >
      <AutoComplete
        v-model="bottom"
        :fetch-suggestions="querySearch"
        placement="bottom"
        placeholder="点击查看下方弹出"
      />
    </div>
    <div>
      <label
        style="
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        "
        >下拉在上方</label
      >
      <AutoComplete
        v-model="top"
        :fetch-suggestions="querySearch"
        placement="top"
        placeholder="点击查看上方弹出"
      />
    </div>
  </div>
</template>
