<script setup lang="ts">
/**
 * VitePress layout wrapper that syncs VitePress locale → ProConfigProvider.
 * All component demos inside docs automatically render in the correct language.
 */
import { computed } from 'vue'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import ProConfigProvider from '@pro/pro-components/pro-config-provider.vue'

const { Layout } = DefaultTheme
const { lang, isDark } = useData()

const proLocale = computed(() => (lang.value?.startsWith('zh') ? 'zh-CN' : 'en-US'))
const proTheme = computed(() => (isDark.value ? 'dark' : 'light'))
</script>

<template>
  <ProConfigProvider :locale="proLocale" :theme="proTheme">
    <Layout />
  </ProConfigProvider>
</template>
