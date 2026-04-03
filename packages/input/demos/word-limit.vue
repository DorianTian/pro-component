<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@pro/input'

const title = ref('')
const bio = ref('')
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <div>
      <label
        style="
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        "
        >文章标题（最多 50 字）</label
      >
      <Input v-model="title" :maxlength="50" show-word-limit placeholder="请输入文章标题" />
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
        >个人简介（最多 200 字）</label
      >
      <Input
        v-model="bio"
        type="textarea"
        :maxlength="200"
        :rows="3"
        show-word-limit
        placeholder="请输入个人简介"
      />
    </div>
  </div>
</template>
