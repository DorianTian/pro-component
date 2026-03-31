import { describe, it, expect, vi } from 'vitest'
import { proVitePlugin } from '../src/index'
import type { Plugin, UserConfig, ResolvedConfig } from 'vite'

/**
 * Cast plugin to access hook functions for testing.
 * Vite Plugin type uses function union types that don't expose hooks directly.
 */
type PluginHooks = Record<string, (...args: unknown[]) => unknown>

function getHook<T>(plugin: Plugin, name: string): T {
  return (plugin as unknown as PluginHooks)[name] as T
}

describe('proVitePlugin', () => {
  it('returns a plugin with correct name', () => {
    const plugin = proVitePlugin()
    expect(plugin.name).toBe('pro-vite-plugin')
    expect(plugin.enforce).toBe('pre')
  })

  describe('config hook', () => {
    it('excludes Vue, Element Plus, and @pro/* from optimizeDeps', () => {
      const plugin = proVitePlugin()
      const configHook = getHook<
        (config: UserConfig, env: { command: string }) => Record<string, unknown>
      >(plugin, 'config')

      const result = configHook({}, { command: 'serve' })

      const exclude = (result.optimizeDeps as Record<string, unknown>).exclude as string[]
      expect(exclude).toContain('vue')
      expect(exclude).toContain('element-plus')
      expect(exclude).toContain('@pro/table')
      expect(exclude).toContain('@pro/form')
      expect(exclude).toContain('@pro/descriptions')
      expect(exclude).toContain('@pro/hooks')
      expect(exclude).toContain('@pro/utils')
      expect(exclude).toContain('@pro/themes')
      expect(exclude).toContain('@pro/pro-components')
    })

    it('includes extraExclude packages', () => {
      const plugin = proVitePlugin({ extraExclude: ['lodash-es', 'dayjs'] })
      const configHook = getHook<
        (config: UserConfig, env: { command: string }) => Record<string, unknown>
      >(plugin, 'config')

      const result = configHook({}, { command: 'serve' })

      const exclude = (result.optimizeDeps as Record<string, unknown>).exclude as string[]
      expect(exclude).toContain('lodash-es')
      expect(exclude).toContain('dayjs')
    })

    it('dedupes Vue and Element Plus in resolve config', () => {
      const plugin = proVitePlugin()
      const configHook = getHook<
        (config: UserConfig, env: { command: string }) => Record<string, unknown>
      >(plugin, 'config')

      const result = configHook({}, { command: 'serve' })

      const resolve = result.resolve as Record<string, unknown>
      const dedupe = resolve.dedupe as string[]
      expect(dedupe).toContain('vue')
      expect(dedupe).toContain('element-plus')
    })

    it('defines Vue feature flags in dev mode', () => {
      const plugin = proVitePlugin()
      const configHook = getHook<
        (config: UserConfig, env: { command: string }) => Record<string, unknown>
      >(plugin, 'config')

      const devResult = configHook({}, { command: 'serve' })
      const devDefine = devResult.define as Record<string, string>
      expect(devDefine.__VUE_OPTIONS_API__).toBe(JSON.stringify(true))

      const buildResult = configHook({}, { command: 'build' })
      expect(buildResult.define).toBeUndefined()
    })
  })

  describe('configResolved hook', () => {
    it('warns when exclude list is overridden', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const plugin = proVitePlugin({ devWarnings: true })
      const hook = getHook<(config: unknown) => void>(plugin, 'configResolved')

      // Simulate resolved config where vue was removed from exclude
      hook({
        command: 'serve',
        optimizeDeps: { exclude: ['element-plus', '@pro/table'] },
      } as unknown as ResolvedConfig)

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('re-included in optimizeDeps'),
        expect.stringContaining('vue'),
      )

      warnSpy.mockRestore()
    })

    it('does not warn when devWarnings is false', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const plugin = proVitePlugin({ devWarnings: false })
      const hook = getHook<(config: unknown) => void>(plugin, 'configResolved')

      hook({
        command: 'serve',
        optimizeDeps: { exclude: [] },
      } as unknown as ResolvedConfig)

      expect(warnSpy).not.toHaveBeenCalled()

      warnSpy.mockRestore()
    })
  })

  describe('transformIndexHtml hook', () => {
    it('injects dev diagnostic script in serve mode', () => {
      const plugin = proVitePlugin()
      const hook = getHook<(html: string, ctx: Record<string, unknown>) => unknown>(
        plugin,
        'transformIndexHtml',
      )

      const result = hook('<html></html>', { server: true }) as {
        tags: Array<{ tag: string; children: string }>
      }

      expect(result.tags).toHaveLength(1)
      expect(result.tags[0].tag).toBe('script')
      expect(result.tags[0].children).toContain('pro-vite-plugin')
    })

    it('returns raw html in build mode (no server)', () => {
      const plugin = proVitePlugin()
      const hook = getHook<(html: string, ctx: Record<string, unknown>) => unknown>(
        plugin,
        'transformIndexHtml',
      )

      const result = hook('<html></html>', {})
      expect(result).toBe('<html></html>')
    })
  })
})
