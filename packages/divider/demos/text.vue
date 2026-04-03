<script setup lang="ts">
import { Divider } from '@pro/divider'
</script>

<template>
  <div style="max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      带文字的分割线，支持左 / 中 / 右对齐
    </span>
    <Divider content-position="left">左侧文字</Divider>
    <p style="margin: 0; font-size: 14px; color: #525252">这段内容在左侧文字分割线下方。</p>
    <Divider>居中文字</Divider>
    <p style="margin: 0; font-size: 14px; color: #525252">这段内容在居中文字分割线下方。</p>
    <Divider content-position="right">右侧文字</Divider>
    <p style="margin: 0; font-size: 14px; color: #525252">这段内容在右侧文字分割线下方。</p>
  </div>
</template>
