<script setup lang="ts">
defineOptions({ name: 'ProTable' })
</script>

<template>
  <div class="pro-table">
    <slot />
  </div>
</template>

<style scoped>
.pro-table {
  width: 100%;
}
</style>
