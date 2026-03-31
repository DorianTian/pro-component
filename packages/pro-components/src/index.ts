import type { App, Plugin } from 'vue'
import { ProTable } from '@pro/table'
import { ProForm } from '@pro/form'
import { ProDescriptions } from '@pro/descriptions'
import { checkDependencies } from '@pro/utils'

export { ProTable } from '@pro/table'
export { ProForm } from '@pro/form'
export { ProDescriptions } from '@pro/descriptions'

export { checkDependencies } from '@pro/utils'

export type {
  RequestParams,
  RequestResult,
  StatusType,
  ValueType,
} from '@pro/utils'

const components = [ProTable, ProForm, ProDescriptions]

/** Vue plugin to install all Pro Components globally via app.use() */
export const proComponentsPlugin: Plugin = {
  install(app: App) {
    checkDependencies()
    for (const component of components) {
      app.component(component.name!, component)
    }
  },
}
