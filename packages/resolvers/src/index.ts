/** Resolved component information for unplugin-vue-components */
interface ComponentInfo {
  name: string
  from: string
  sideEffects?: string
}

/** Function signature for unplugin-vue-components resolver */
type ComponentResolverFunction = (componentName: string) => ComponentInfo | undefined

/** Component registry entry mapping name to package + style path */
interface ComponentEntry {
  pkg: string
  style?: string
}

/**
 * Resolver for unplugin-vue-components.
 * Auto-imports ProTable, ProForm, ProDescriptions when used in templates.
 *
 * @example
 * ```ts
 * import Components from 'unplugin-vue-components/vite'
 * import { ProComponentsResolver } from '@pro/resolvers'
 *
 * export default defineConfig({
 *   plugins: [
 *     Components({
 *       resolvers: [ProComponentsResolver()],
 *     }),
 *   ],
 * })
 * ```
 */
export function ProComponentsResolver(): ComponentResolverFunction {
  const componentMap = new Map<string, ComponentEntry>([
    ['ProTable', { pkg: '@pro/table', style: '@pro/table/style' }],
    ['ProForm', { pkg: '@pro/form', style: '@pro/form/style' }],
    ['ProDescriptions', { pkg: '@pro/descriptions', style: '@pro/descriptions/style' }],
    ['ModalForm', { pkg: '@pro/form', style: '@pro/form/style' }],
    ['DrawerForm', { pkg: '@pro/form', style: '@pro/form/style' }],
    ['StepsForm', { pkg: '@pro/form', style: '@pro/form/style' }],
    ['QueryFilter', { pkg: '@pro/form', style: '@pro/form/style' }],
  ])

  return (componentName: string): ComponentInfo | undefined => {
    const entry = componentMap.get(componentName)
    if (!entry) return undefined

    return {
      name: componentName,
      from: entry.pkg,
      sideEffects: entry.style,
    }
  }
}
