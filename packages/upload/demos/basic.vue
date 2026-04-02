<script setup lang="ts">
import { Upload } from '@pro/upload'
import { ElButton } from 'element-plus'
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
        >Basic upload</label
      >
      <Upload action="#" :auto-upload="false">
        <template #trigger>
          <ElButton type="primary">Select file</ElButton>
        </template>
        <template #tip>
          <div style="font-size: 12px; color: #a3a3a3; margin-top: 6px">
            JPG/PNG files, max 500KB
          </div>
        </template>
      </Upload>
    </div>
  </div>
</template>
