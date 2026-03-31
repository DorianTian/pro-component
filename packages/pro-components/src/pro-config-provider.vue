<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, provide, watch } from 'vue'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { enUS, zhCN } from '@pro/locale'
import { PRO_LOCALE_KEY, resolveMessage } from '@pro/hooks'
import type { I18nLike, ProLocaleContext } from '@pro/hooks'

defineOptions({ name: 'ProConfigProvider' })

interface Props {
  locale?: string
  density?: 'compact' | 'default' | 'relaxed'
  theme?: 'light' | 'dark'
}

const props = withDefaults(defineProps<Props>(), {
  locale: 'en-US',
  density: 'default',
  theme: 'light',
})

const currentLocale = computed(() => props.locale)

const messages = computed<Record<string, unknown>>(() =>
  currentLocale.value === 'zh-CN'
    ? (zhCN as unknown as Record<string, unknown>)
    : (enUS as unknown as Record<string, unknown>),
)

// --- Element Plus locale map ---
const EL_LOCALE_MAP = { 'zh-CN': zhCn, 'en-US': en } as const

const elLocale = computed(() => {
  const mapped = (EL_LOCALE_MAP as Partial<Record<string, typeof en>>)[currentLocale.value]
  return mapped ?? en
})

// --- vue-i18n detection (optional peer dependency) ---
let i18n: I18nLike | null = null
try {
  const instance = getCurrentInstance()
  const maybeI18n = instance?.appContext.config.globalProperties.$i18n as I18nLike | undefined
  i18n = maybeI18n ?? null
} catch {
  // vue-i18n not installed or globalProperties access failed -- fall back to built-in resolver
  i18n = null
}

// --- Mount: merge all locale messages once (idempotent) ---
if (i18n) {
  onMounted(() => {
    i18n.global.mergeLocaleMessage('en-US', enUS as unknown as Record<string, unknown>)
    i18n.global.mergeLocaleMessage('zh-CN', zhCN as unknown as Record<string, unknown>)
  })
}

// --- Watch locale changes: sync vue-i18n, dayjs ---
watch(
  currentLocale,
  (loc) => {
    if (i18n) {
      i18n.global.locale.value = loc
    }
    dayjs.locale(loc === 'zh-CN' ? 'zh-cn' : 'en')
  },
  { immediate: true },
)

// --- Provide locale context ---
const t: ProLocaleContext['t'] = i18n
  ? (key, params) => i18n.global.t(key, (params ?? {}) as Record<string, unknown>)
  : (key, params) => resolveMessage(messages.value, key, params)

provide(PRO_LOCALE_KEY, { t, locale: currentLocale })
</script>

<template>
  <ElConfigProvider :locale="elLocale">
    <slot />
  </ElConfigProvider>
</template>
