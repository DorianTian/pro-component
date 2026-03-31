<script setup lang="ts">
import { useProLocale } from '@pro/hooks'

defineOptions({ name: 'ProDescriptions' })

const { t } = useProLocale()
</script>

<template>
  <div class="pro-descriptions">
    <slot />
  </div>
</template>

<style scoped>
.pro-descriptions {
  width: 100%;
}
</style>
