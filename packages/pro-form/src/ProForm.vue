<script setup lang="ts">
defineOptions({ name: 'ProForm' })
</script>

<template>
  <div class="pro-form">
    <slot />
  </div>
</template>

<style scoped>
.pro-form {
  width: 100%;
}
</style>
