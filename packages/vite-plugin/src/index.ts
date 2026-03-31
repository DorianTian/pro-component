import type { Plugin, UserConfig } from 'vite'
import type { ProVitePluginOptions } from './types'

export type { ProVitePluginOptions }

/**
 * Packages that must NOT be pre-bundled by Vite.
 *
 * Why: In CDN prod mode, Vue, Element Plus, and @pro/* are loaded as
 * separate ESM modules via Import Maps. If Vite pre-bundles them in dev,
 * the module boundaries differ between dev and prod, causing:
 * - `inject() can only be used inside setup()` -- Vue's provide/inject
 *   relies on a single Vue runtime instance. Pre-bundling creates a
 *   separate copy, breaking the dependency chain.
 * - Different component instances across module boundaries.
 *
 * By excluding them from optimizeDeps, dev mode preserves the same
 * module boundaries that CDN prod mode uses.
 */
const ALWAYS_EXCLUDE = [
  'vue',
  'element-plus',
  '@pro/table',
  '@pro/form',
  '@pro/descriptions',
  '@pro/hooks',
  '@pro/utils',
  '@pro/themes',
  '@pro/pro-components',
]

/**
 * Build the Vite config overrides for dev mode.
 * Extracted to keep the config hook concise.
 */
function buildDevDefines(): Record<string, string> {
  return {
    __VUE_OPTIONS_API__: JSON.stringify(true),
    __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
  }
}

/**
 * Check for missing excludes in resolved config and warn.
 */
function warnMissingExcludes(excludeList: string[], currentExclude: string[]): void {
  const missing = excludeList.filter((pkg) => !currentExclude.includes(pkg))

  if (missing.length > 0) {
    // eslint-disable-next-line no-console -- Vite plugin dev diagnostic
    console.warn(
      '[pro-vite-plugin] WARNING: The following packages were re-included in optimizeDeps ' +
        'by another plugin or config. This may cause module boundary mismatch in CDN mode:',
      missing.join(', '),
    )
  }
}

/**
 * @pro/vite-plugin -- ensures dev/prod module boundary alignment.
 *
 * Usage:
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from 'vite'
 * import vue from '@vitejs/plugin-vue'
 * import { proVitePlugin } from '@pro/vite-plugin'
 *
 * export default defineConfig({
 *   plugins: [vue(), proVitePlugin()],
 * })
 * ```
 */
export function proVitePlugin(options: ProVitePluginOptions = {}): Plugin {
  const { extraExclude = [], devWarnings = true } = options

  const excludeList = [...ALWAYS_EXCLUDE, ...extraExclude]

  return {
    name: 'pro-vite-plugin',
    enforce: 'pre',

    config(_userConfig: UserConfig, { command }) {
      const isDev = command === 'serve'

      if (isDev) {
        // eslint-disable-next-line no-console -- Vite plugin dev diagnostic
        console.info('[pro-vite-plugin] Excluding from optimizeDeps:', excludeList.join(', '))
      }

      return {
        optimizeDeps: {
          exclude: excludeList,
        },
        resolve: {
          // Dedupe Vue and Element Plus to prevent multiple instances
          dedupe: ['vue', 'element-plus'],
        },
        // Ensure Vue is resolved to the ESM browser build in dev
        // This matches what CDN serves in prod
        ...(isDev ? { define: buildDevDefines() } : {}),
      }
    },

    configResolved(resolvedConfig) {
      const isDev = resolvedConfig.command === 'serve'

      if (isDev && devWarnings) {
        const currentExclude = resolvedConfig.optimizeDeps?.exclude ?? []
        warnMissingExcludes(excludeList, currentExclude)
      }
    },

    transformIndexHtml(html, ctx) {
      if (ctx.server && devWarnings) {
        return {
          html,
          tags: [
            {
              tag: 'script',
              attrs: { type: 'module' },
              children: `
                // [pro-vite-plugin] Dev module boundary check
                import('vue').then(m => {
                  if (!m.version) {
                    console.warn('[pro-vite-plugin] Vue module loaded without version — possible module boundary issue')
                  }
                }).catch(() => {})
              `,
              injectTo: 'head',
            },
          ],
        }
      }
      return html
    },
  }
}
