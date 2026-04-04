import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import type { Component } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@pro/themes'
import { setupMonacoWorkers } from './monaco-setup'
import ProLayout from './components/ProLayout.vue'
import ApiTable from './components/ApiTable.vue'
import TypeBlock from './components/TypeBlock.vue'
import './style.css'

setupMonacoWorkers()

/**
 * Type guard: checks whether a value is a Vue component (SFC or object component).
 */
function isVueComponent(value: unknown): value is Component {
  return (
    typeof value === 'object' &&
    value !== null &&
    (typeof (value as Record<string, unknown>).setup === 'function' ||
      typeof (value as Record<string, unknown>).render === 'function' ||
      typeof (value as Record<string, unknown>).template === 'string')
  )
}

const SCROLL_OFFSET = 80
const SCROLL_DELAY = 200

const theme: Theme = {
  extends: DefaultTheme,
  Layout: ProLayout,
  enhanceApp({ app, router }) {
    /* Scroll to hash anchor after SPA navigation (search results, sidebar links) */
    if (typeof window !== 'undefined') {
      router.onAfterRouteChanged = () => {
        const { hash } = window.location
        if (!hash) return
        setTimeout(() => {
          const el = document.querySelector(decodeURIComponent(hash))
          if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET
            window.scrollTo({ top, behavior: 'smooth' })
          }
        }, SCROLL_DELAY)
      }
    }
    // Register Element Plus globally for all demos
    app.use(ElementPlus)

    // Register Pro Components globally
    // Components are imported from workspace source via Vite aliases
    // so no build step required during docs dev
    try {
      // Dynamic import allows graceful degradation if packages not yet built
      const proComponents = import.meta.glob('../../packages/*/src/index.ts', {
        eager: true,
      }) as unknown as Record<string, Record<string, unknown>>
      for (const [, mod] of Object.entries(proComponents)) {
        // Each package exports named components — register them all
        for (const [exportName, exportValue] of Object.entries(mod)) {
          if (isVueComponent(exportValue)) {
            app.component(exportName, exportValue)
          }
        }
      }
    } catch {
      // Pro Components packages may not exist yet during initial docs setup
      // eslint-disable-next-line no-console -- docs-only warning, not production code
      console.warn('[docs] Pro Components not found — demos will not render')
    }

    // Register doc helper components
    app.component('ApiTable', ApiTable)
    app.component('TypeBlock', TypeBlock)
  },
}

// VitePress requires a default export from the theme entry file.
// This is a framework constraint — theme/index.ts is exempt from the named-export rule.
export default theme
