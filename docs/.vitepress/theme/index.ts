import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import type { Component } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@pro/themes'
import ApiTable from './components/ApiTable.vue'
import TypeBlock from './components/TypeBlock.vue'
import './style.css'

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

/**
 * Custom VitePress theme that registers Element Plus and all Pro Components
 * globally so interactive demos render correctly within doc pages.
 */
const theme: Theme = {
  extends: DefaultTheme,
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
