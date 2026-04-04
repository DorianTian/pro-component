<script setup lang="ts">
/**
 * ProLoading — Declarative state machine component.
 * Renders loading/empty/error/success states with customizable slots.
 */
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import { ElSkeleton, ElButton } from 'element-plus'
import { useProLocale } from '@pro/hooks'

defineOptions({ name: 'ProLoading' })

type LoadingState = 'loading' | 'empty' | 'error' | 'success'

interface Props {
  loading?: boolean
  empty?: boolean
  error?: string | Error | null
  skeletonRows?: number
  animated?: boolean
  emptyDescription?: string
  errorTitle?: string
  /** Delay in ms before showing loading state — prevents flicker on fast loads */
  delay?: number
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  empty: false,
  error: null,
  skeletonRows: 4,
  animated: true,
  emptyDescription: undefined,
  errorTitle: undefined,
  delay: 0,
})

const { t } = useProLocale()

const resolvedEmptyDescription = computed(
  () => props.emptyDescription || t('pro.loading.empty.description'),
)
const resolvedErrorTitle = computed(() => props.errorTitle || t('pro.loading.error.title'))

const emit = defineEmits<{
  retry: []
}>()

/** Delay gate: suppresses loading display for `delay` ms to prevent flicker */
const isDelayElapsed = ref(props.delay === 0)
let delayTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.loading,
  (loading) => {
    if (delayTimer) {
      clearTimeout(delayTimer)
      delayTimer = null
    }
    if (loading && props.delay > 0) {
      isDelayElapsed.value = false
      delayTimer = setTimeout(() => {
        isDelayElapsed.value = true
      }, props.delay)
    } else {
      isDelayElapsed.value = true
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (delayTimer) clearTimeout(delayTimer)
})

const currentState = computed<LoadingState>(() => {
  if (props.loading && isDelayElapsed.value) return 'loading'
  if (props.error) return 'error'
  if (props.empty) return 'empty'
  return 'success'
})

const errorMessage = computed(() => {
  if (!props.error) return ''
  return props.error instanceof Error ? props.error.message : props.error
})

function handleRetry() {
  emit('retry')
}
</script>

<template>
  <div class="pro-loading" role="status" aria-live="polite">
    <Transition name="pro-loading-fade" mode="out-in">
      <!-- Loading State -->
      <div v-if="currentState === 'loading'" key="loading" class="pro-loading__state">
        <slot name="loading">
          <div class="pro-loading__skeleton">
            <ElSkeleton :rows="skeletonRows" :animated="animated" />
          </div>
        </slot>
      </div>

      <!-- Error State -->
      <div v-else-if="currentState === 'error'" key="error" class="pro-loading__state">
        <slot name="error" :error="errorMessage" :retry="handleRetry">
          <div class="pro-loading__error">
            <div class="pro-loading__error-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="20" fill="var(--pro-color-danger-light)" />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="var(--pro-color-danger)"
                  stroke-width="1.2"
                  opacity="0.3"
                />
                <path
                  d="M24 16v12"
                  stroke="var(--pro-color-danger)"
                  stroke-width="2.5"
                  stroke-linecap="round"
                />
                <circle cx="24" cy="33" r="1.5" fill="var(--pro-color-danger)" />
              </svg>
            </div>
            <p class="pro-loading__error-title">{{ resolvedErrorTitle }}</p>
            <p class="pro-loading__error-message">{{ errorMessage }}</p>
            <ElButton type="primary" size="small" @click="handleRetry">{{
              t('pro.loading.error.retry')
            }}</ElButton>
          </div>
        </slot>
      </div>

      <!-- Empty State -->
      <div v-else-if="currentState === 'empty'" key="empty" class="pro-loading__state">
        <slot name="empty">
          <div class="pro-loading__empty">
            <div class="pro-loading__empty-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect
                  x="8"
                  y="16"
                  width="32"
                  height="22"
                  rx="3"
                  fill="var(--pro-bg-sunken)"
                  stroke="var(--pro-border-default)"
                  stroke-width="1.2"
                />
                <path
                  d="M8 26h10l3 5h6l3-5h10"
                  stroke="var(--pro-border-default)"
                  stroke-width="1.2"
                  fill="none"
                />
              </svg>
            </div>
            <p class="pro-loading__empty-text">{{ resolvedEmptyDescription }}</p>
          </div>
        </slot>
      </div>

      <!-- Success State -->
      <div v-else key="success" class="pro-loading__state">
        <slot />
      </div>
    </Transition>
  </div>
</template>

<style>
.pro-loading {
  width: 100%;
  min-height: 120px;
  position: relative;
}

.pro-loading__state {
  width: 100%;
}

.pro-loading__skeleton {
  padding: 16px 0;
}

/* Error state */
.pro-loading__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  text-align: center;
}

.pro-loading__error-icon {
  margin-bottom: 12px;
}

.pro-loading__error-title {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
  color: var(--pro-text-primary);
}

.pro-loading__error-message {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--pro-text-secondary);
  max-width: 320px;
  line-height: 1.5;
}

/* Empty state */
.pro-loading__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  text-align: center;
}

.pro-loading__empty-icon {
  margin-bottom: 12px;
  opacity: 0.7;
}

.pro-loading__empty-text {
  margin: 0;
  font-size: 13px;
  color: var(--pro-text-tertiary);
}

/* Transition */
.pro-loading-fade-enter-active,
.pro-loading-fade-leave-active {
  transition: opacity 200ms ease;
}

.pro-loading-fade-enter-from,
.pro-loading-fade-leave-to {
  opacity: 0;
}
</style>
