import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import type { Component } from 'vue'
import { useRoute } from 'vitepress'
import { onMounted, watch } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@pro/themes'
import { setupMonacoWorkers } from './monaco-setup'
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

const SCROLL_DELAY_MS = 200

/** Scroll to element matching current URL hash */
function scrollToHash(): void {
  const { hash } = window.location
  if (!hash) return
  setTimeout(() => {
    const el = document.querySelector(decodeURIComponent(hash))
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, SCROLL_DELAY_MS)
}

const theme: Theme = {
  extends: DefaultTheme,
  setup() {
    const route = useRoute()
    /* Watch route path changes → scroll to hash after SPA navigation */
    watch(() => route.path, scrollToHash)
    /* Handle same-page hash changes (e.g. search result on current page) */
    onMounted(() => {
      window.addEventListener('hashchange', scrollToHash)
      scrollToHash()
    })
  },
  enhanceApp({ app }) {
    // Register Element Plus globally for all demos
    app.use(ElementPlus)

    // Register Pro Components globally
    // Components are imported from workspace source via Vite aliases
    // so no build step required during docs dev
    try {
      // Dynamic import allows graceful degradation if packages not yet built
      const proComponents = import.meta.glob('../../packages/pro-*/src/index.ts', {
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
