<script setup lang="ts">
import { Divider } from '@pro/divider'
</script>

<template>
  <div style="max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      不同边框样式
    </span>
    <p style="margin: 0; font-size: 13px; color: #737373">实线（默认）</p>
    <Divider border-style="solid" />
    <p style="margin: 0; font-size: 13px; color: #737373">虚线</p>
    <Divider border-style="dashed" />
    <p style="margin: 0; font-size: 13px; color: #737373">点线</p>
    <Divider border-style="dotted" />
    <p style="margin: 0; font-size: 13px; color: #737373">双线</p>
    <Divider border-style="double" />
  </div>
</template>
