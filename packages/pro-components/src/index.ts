// Components
import { ProTable } from '@pro/table'
import { ProForm, ModalForm, DrawerForm, StepsForm, QueryFilter } from '@pro/form'
import { ProDescriptions } from '@pro/descriptions'
import { checkDependencies } from '@pro/utils'

import type { App } from 'vue'

export { ProTable } from '@pro/table'
export { ProForm, ModalForm, DrawerForm, StepsForm, QueryFilter } from '@pro/form'
export { ProDescriptions } from '@pro/descriptions'

// Composables
export { useProForm, useModalForm, useDrawerForm, useStepsForm } from '@pro/form'
export { useProDescriptions } from '@pro/descriptions'

// Utils
export { checkDependencies } from '@pro/utils'

// Install function for app.use()
const components = [
  ProTable,
  ProForm,
  ModalForm,
  DrawerForm,
  StepsForm,
  QueryFilter,
  ProDescriptions,
]

export const proComponentsPlugin = {
  install(app: App) {
    checkDependencies()
    components.forEach((component) => {
      if (component.name) {
        app.component(component.name, component)
      }
    })
  },
}

// Types (separate group, always last)
export type { RequestParams, RequestResult, StatusType, ValueType } from '@pro/utils'
export type { ProFieldDef, StepFormDef, ProFormConfig, FormLayout, ProFormRule } from '@pro/utils'
export type { ProColumnDef } from '@pro/utils'
export type {
  UseProFormReturn,
  UseModalFormReturn,
  UseDrawerFormReturn,
  UseStepsFormReturn,
} from '@pro/form'
export type { DescriptionItem, UseProDescriptionsReturn } from '@pro/descriptions'
