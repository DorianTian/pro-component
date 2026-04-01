<script setup lang="ts">
import { ProEmpty } from '@pro/empty'
</script>

<template>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px">
    <ProEmpty type="no-data" />
    <ProEmpty type="no-result" />
    <ProEmpty type="error" @retry="() => {}" />
    <ProEmpty type="no-permission" />
  </div>
</template>
