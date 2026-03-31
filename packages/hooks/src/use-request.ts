import { ref, type Ref } from 'vue'

import type { RequestParams, RequestResult } from '@pro/utils'

/** Options for the useRequest composable */
export interface UseRequestOptions<T = unknown> {
  /** Debounce interval in milliseconds. 0 = no debounce. */
  debounceMs?: number
  /** Called after a successful response */
  onSuccess?: (result: RequestResult<T>) => void
  /** Called when the request throws or rejects */
  onError?: (error: unknown) => void
}

/** Return type of the useRequest composable */
export interface UseRequestReturn<T = unknown> {
  data: Ref<T[]>
  loading: Ref<boolean>
  error: Ref<unknown | null>
  total: Ref<number>
  /** Execute the request with given params. Returns a promise that resolves when done. */
  run: (params: RequestParams) => Promise<void>
  /** Cancel the current in-flight request. Stale responses will be ignored. */
  cancel: () => void
}

/**
 * Generic async request composable with loading/error state management,
 * debounce support, and automatic cancellation of stale requests.
 */
export function useRequest<T = unknown>(
  fetcher: (params: RequestParams) => Promise<RequestResult<T>>,
  options: UseRequestOptions<T> = {},
): UseRequestReturn<T> {
  const { debounceMs = 0, onSuccess, onError } = options

  const data: Ref<T[]> = ref([]) as Ref<T[]>
  const loading = ref(false)
  const error: Ref<unknown | null> = ref(null)
  const total = ref(0)

  /** Monotonically increasing request ID for stale cancellation */
  let currentRequestId = 0
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  /** Cancel the current in-flight request and clear any pending debounce */
  function cancel(): void {
    currentRequestId++
    loading.value = false

    if (debounceTimer !== null) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
  }

  /** Execute the actual fetch, guarded by request ID for staleness check */
  async function executeRequest(params: RequestParams, requestId: number): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const result = await fetcher(params)

      if (requestId !== currentRequestId) {
        return
      }

      data.value = result.data
      total.value = result.total
      loading.value = false
      onSuccess?.(result)
    } catch (err: unknown) {
      if (requestId !== currentRequestId) {
        return
      }

      error.value = err
      loading.value = false
      onError?.(err)
    }
  }

  /** Run the request, with optional debounce. Automatically cancels stale in-flight requests. */
  function run(params: RequestParams): Promise<void> {
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }

    const requestId = ++currentRequestId

    if (debounceMs > 0) {
      return new Promise<void>((resolve) => {
        debounceTimer = setTimeout(() => {
          debounceTimer = null
          executeRequest(params, requestId).then(resolve)
        }, debounceMs)
      })
    }

    return executeRequest(params, requestId)
  }

  return {
    data,
    loading,
    error,
    total,
    run,
    cancel,
  }
}
