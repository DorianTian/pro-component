<script setup lang="ts">
/**
 * ProLoading — Declarative state machine component.
 * Renders loading/empty/error/success states with customizable slots.
 *
 * Usage:
 *   <ProLoading :loading="isLoading" :empty="!data.length" :error="error">
 *     <template #loading><MySkeleton /></template>
 *     <template #empty>No data found</template>
 *     <template #error="{ error, retry }">{{ error }} <button @click="retry">Retry</button></template>
 *     <MyContent :data="data" />
 *   </ProLoading>
 */
import { computed } from 'vue'
import { ElSkeleton, ElEmpty, ElResult, ElButton } from 'element-plus'

defineOptions({ name: 'ProLoading' })

type LoadingState = 'loading' | 'empty' | 'error' | 'success'

interface Props {
  /** Whether data is currently loading */
  loading?: boolean
  /** Whether the data set is empty (checked after loading = false) */
  empty?: boolean
  /** Error object or message (checked after loading = false) */
  error?: string | Error | null
  /** Number of skeleton rows to show in default loading state */
  skeletonRows?: number
  /** Whether to show the skeleton animation */
  animated?: boolean
  /** Custom empty description */
  emptyDescription?: string
  /** Custom error title */
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
    <!-- Loading State -->
    <template v-if="currentState === 'loading'">
      <slot name="loading">
        <ElSkeleton :rows="skeletonRows" :animated="animated" />
      </slot>
    </template>

    <!-- Error State -->
    <template v-else-if="currentState === 'error'">
      <slot name="error" :error="errorMessage" :retry="handleRetry">
        <ElResult icon="error" :title="errorTitle" :sub-title="errorMessage">
          <template #extra>
            <ElButton type="primary" @click="handleRetry">Retry</ElButton>
          </template>
        </ElResult>
      </slot>
    </template>

    <!-- Empty State -->
    <template v-else-if="currentState === 'empty'">
      <slot name="empty">
        <ElEmpty :description="emptyDescription" />
      </slot>
    </template>

    <!-- Success State -->
    <template v-else>
      <slot />
    </template>
  </div>
</template>

<style>
.pro-loading {
  width: 100%;
  min-height: 120px;
}
</style>
