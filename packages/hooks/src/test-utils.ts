import { nextTick, type Component } from 'vue'
import { mount } from '@vue/test-utils'

/**
 * Wait for Vue's reactive system to fully settle.
 * Wraps multiple nextTick() cycles to ensure all watch chains,
 * computed re-evaluations, and async component updates complete.
 *
 * @param cycles - Number of nextTick cycles to wait (default: 3)
 */
export async function waitForReactiveSettle(cycles = 3): Promise<void> {
  for (let i = 0; i < cycles; i++) {
    await nextTick()
  }
}

/**
 * Create a wrapper component that provides values via provide/inject.
 * Useful for testing composables that depend on injected context.
 *
 * @param providers - Map of injection key to value
 * @returns MountingOptions.global.provide compatible object
 */
export function createProvideObject(
  providers: Record<string | symbol, unknown>,
): Record<string | symbol, unknown> {
  return { ...providers }
}

/**
 * Helper to mount a composable in isolation with optional provide context.
 * Wraps the composable in a minimal host component.
 *
 * @param composable - Function to call inside setup()
 * @param options - Optional provide values and mount options
 * @returns The composable return value and the wrapper for cleanup
 */
export function mountComposable<T>(
  composable: () => T,
  options?: {
    provide?: Record<string | symbol, unknown>
    props?: Record<string, unknown>
  },
): { result: T; unmount: () => void } {
  let result!: T

  const TestHost: Component = {
    setup() {
      result = composable()
      return () => null
    },
  }

  const wrapper = mount(TestHost, {
    global: options?.provide ? { provide: options.provide } : undefined,
  } as Record<string, unknown>)

  return {
    result,
    unmount: () => {
      wrapper.unmount()
    },
  }
}
