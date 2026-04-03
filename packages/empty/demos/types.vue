<script setup lang="ts">
import { ProEmpty } from '@pro/empty'
</script>

<template>
  <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px">
    <div style="border: 1px solid #f0f0f0; border-radius: 8px">
      <label
        style="
          display: block;
          padding: 12px 16px 0;
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        "
        >no-data</label
      >
      <ProEmpty type="no-data" />
    </div>
    <div style="border: 1px solid #f0f0f0; border-radius: 8px">
      <label
        style="
          display: block;
          padding: 12px 16px 0;
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        "
        >no-result</label
      >
      <ProEmpty type="no-result" />
    </div>
    <div style="border: 1px solid #f0f0f0; border-radius: 8px">
      <label
        style="
          display: block;
          padding: 12px 16px 0;
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        "
        >error</label
      >
      <ProEmpty type="error" @retry="() => {}" />
    </div>
    <div style="border: 1px solid #f0f0f0; border-radius: 8px">
      <label
        style="
          display: block;
          padding: 12px 16px 0;
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        "
        >no-permission</label
      >
      <ProEmpty type="no-permission" />
    </div>
  </div>
</template>
