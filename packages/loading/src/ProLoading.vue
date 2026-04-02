<script setup lang="ts">
/**
 * ProLoading — Declarative state machine component.
 * Renders loading/empty/error/success states with customizable slots.
 */
import { computed } from 'vue'
import { ElSkeleton, ElEmpty, ElResult, ElButton } from 'element-plus'

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
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  empty: false,
  error: null,
  skeletonRows: 4,
  animated: true,
  emptyDescription: 'No data',
  errorTitle: 'Something went wrong',
})

const emit = defineEmits<{
  retry: []
}>()

const currentState = computed<LoadingState>(() => {
  if (props.loading) return 'loading'
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
  <div class="pro-loading">
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
            <p class="pro-loading__error-title">{{ errorTitle }}</p>
            <p class="pro-loading__error-message">{{ errorMessage }}</p>
            <ElButton type="primary" size="small" @click="handleRetry">Retry</ElButton>
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
            <p class="pro-loading__empty-text">{{ emptyDescription }}</p>
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
