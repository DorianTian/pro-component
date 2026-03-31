<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item :to="{ path: '/' }"> Home </el-breadcrumb-item>
    <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
      {{ item.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

defineOptions({ name: 'AppBreadcrumb' })

interface BreadcrumbItem {
  path: string
  title: string
}

const route = useRoute()

const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const matched = route.matched.filter((r) => r.meta.title)
  return matched.map((r) => ({
    path: r.path,
    title: r.meta.title as string,
  }))
})
</script>
