import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mountComposable, waitForReactiveSettle } from '../src/test-utils'
import { useRequest } from '../src/use-request'

describe('useRequest', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with idle state', () => {
    const fetcher = vi.fn().mockResolvedValue({ data: [], total: 0, success: true })
    const { result, unmount } = mountComposable(() => useRequest(fetcher))

    expect(result.loading.value).toBe(false)
    expect(result.data.value).toEqual([])
    expect(result.error.value).toBeNull()

    unmount()
  })

  it('should set loading to true during request', async () => {
    let resolveFn!: (value: unknown) => void
    const fetcher = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFn = resolve
        }),
    )

    const { result, unmount } = mountComposable(() => useRequest(fetcher))
    const promise = result.run({ current: 1, pageSize: 10 })

    expect(result.loading.value).toBe(true)

    resolveFn({ data: [{ id: 1 }], total: 1, success: true })
    await promise
    await waitForReactiveSettle()

    expect(result.loading.value).toBe(false)
    expect(result.data.value).toEqual([{ id: 1 }])

    unmount()
  })

  it('should handle request errors', async () => {
    const error = new Error('Network failure')
    const fetcher = vi.fn().mockRejectedValue(error)

    const { result, unmount } = mountComposable(() => useRequest(fetcher))

    await result.run({ current: 1, pageSize: 10 })
    await waitForReactiveSettle()

    expect(result.loading.value).toBe(false)
    expect(result.error.value).toBe(error)
    expect(result.data.value).toEqual([])

    unmount()
  })

  it('should debounce rapid calls', async () => {
    const fetcher = vi.fn().mockResolvedValue({ data: [], total: 0, success: true })
    const { result, unmount } = mountComposable(() => useRequest(fetcher, { debounceMs: 300 }))

    result.run({ current: 1, pageSize: 10 })
    result.run({ current: 2, pageSize: 10 })
    result.run({ current: 3, pageSize: 10 })

    expect(fetcher).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    await waitForReactiveSettle()

    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(fetcher).toHaveBeenCalledWith({ current: 3, pageSize: 10 })

    unmount()
  })

  it('should cancel in-flight request when cancel() is called', async () => {
    let resolveFn!: (value: unknown) => void
    const fetcher = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFn = resolve
        }),
    )

    const { result, unmount } = mountComposable(() => useRequest(fetcher))

    result.run({ current: 1, pageSize: 10 })
    expect(result.loading.value).toBe(true)

    result.cancel()

    resolveFn({ data: [{ id: 1 }], total: 1, success: true })
    await waitForReactiveSettle()

    // Data should NOT be updated because request was cancelled
    expect(result.data.value).toEqual([])
    expect(result.loading.value).toBe(false)

    unmount()
  })

  it('should cancel previous request when new request is made (race condition prevention)', async () => {
    const resolvers: Array<(value: unknown) => void> = []
    const fetcher = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvers.push(resolve)
        }),
    )

    const { result, unmount } = mountComposable(() => useRequest(fetcher))

    // Fire two requests
    result.run({ current: 1, pageSize: 10 })
    result.run({ current: 2, pageSize: 10 })

    // Resolve the FIRST request (stale) after the second was initiated
    resolvers[0]({ data: [{ id: 'stale' }], total: 1, success: true })
    await waitForReactiveSettle()

    // Stale data must NOT appear
    expect(result.data.value).toEqual([])

    // Resolve the SECOND request (current)
    resolvers[1]({ data: [{ id: 'fresh' }], total: 1, success: true })
    await waitForReactiveSettle()

    expect(result.data.value).toEqual([{ id: 'fresh' }])

    unmount()
  })

  it('should expose total from response', async () => {
    const fetcher = vi.fn().mockResolvedValue({ data: [{ id: 1 }], total: 42, success: true })
    const { result, unmount } = mountComposable(() => useRequest(fetcher))

    await result.run({ current: 1, pageSize: 10 })
    await waitForReactiveSettle()

    expect(result.total.value).toBe(42)

    unmount()
  })

  it('should call onSuccess callback on successful request', async () => {
    const onSuccess = vi.fn()
    const responseData = { data: [{ id: 1 }], total: 1, success: true }
    const fetcher = vi.fn().mockResolvedValue(responseData)

    const { result, unmount } = mountComposable(() => useRequest(fetcher, { onSuccess }))

    await result.run({ current: 1, pageSize: 10 })
    await waitForReactiveSettle()

    expect(onSuccess).toHaveBeenCalledWith(responseData)

    unmount()
  })

  it('should call onError callback on failed request', async () => {
    const onError = vi.fn()
    const error = new Error('fail')
    const fetcher = vi.fn().mockRejectedValue(error)

    const { result, unmount } = mountComposable(() => useRequest(fetcher, { onError }))

    await result.run({ current: 1, pageSize: 10 })
    await waitForReactiveSettle()

    expect(onError).toHaveBeenCalledWith(error)

    unmount()
  })
})
