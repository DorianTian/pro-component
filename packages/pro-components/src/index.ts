import type { App, Plugin } from 'vue'
import { ProTable } from '@pro/table'
import { ProForm } from '@pro/form'
import { ProDescriptions } from '@pro/descriptions'
import { checkDependencies } from '@pro/utils'

export { ProTable } from '@pro/table'
export { ProForm } from '@pro/form'
export { ProDescriptions } from '@pro/descriptions'

export { checkDependencies } from '@pro/utils'

export type { RequestParams, RequestResult, StatusType, ValueType } from '@pro/utils'

/** Component name to component mapping for global registration */
const COMPONENT_MAP = {
  ProTable,
  ProForm,
  ProDescriptions,
} as const

/** Vue plugin to install all Pro Components globally via app.use() */
export const proComponentsPlugin: Plugin = {
  install(app: App) {
    checkDependencies()
    for (const [name, component] of Object.entries(COMPONENT_MAP)) {
      app.component(name, component)
    }
  },
}
