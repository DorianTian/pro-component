import '@pro/themes'

// Components
import { ProTable } from '@pro/table'
import {
  ProForm,
  ModalForm,
  DrawerForm,
  StepsForm,
  QueryFilter,
  LightFilter,
  ProFormDependency,
  ProFormList,
  SchemaForm,
} from '@pro/form'
import { ProDescriptions } from '@pro/descriptions'
import { checkDependencies } from '@pro/utils'
import ProConfigProvider from './pro-config-provider.vue'

import type { App } from 'vue'

export { ProTable } from '@pro/table'
export {
  ProForm,
  ModalForm,
  DrawerForm,
  StepsForm,
  QueryFilter,
  LightFilter,
  ProFormDependency,
  ProFormList,
  SchemaForm,
} from '@pro/form'
export { ProDescriptions } from '@pro/descriptions'
export { ProConfigProvider }

// Composables
export { useProTable } from '@pro/table'
export { useProForm, useModalForm, useDrawerForm, useStepsForm } from '@pro/form'
export { useProDescriptions } from '@pro/descriptions'

// i18n
export { useProLocale, resolveMessage, PRO_LOCALE_KEY } from '@pro/hooks'
export type { ProLocaleContext, I18nLike } from '@pro/hooks'

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
  LightFilter,
  ProFormDependency,
  ProFormList,
  SchemaForm,
  ProDescriptions,
  ProConfigProvider,
]

export const proComponentsPlugin = {
  install(app: App) {
    checkDependencies()
    components.forEach((component) => {
      const name = (component as { name?: string }).name
      if (name) {
        app.component(name, component)
      }
    })
  },
}

// Types (separate group, always last)
export type { RequestParams, RequestResult, StatusType, ValueType } from '@pro/utils'
export type { ProFieldDef, StepFormDef, ProFormConfig, FormLayout, ProFormRule } from '@pro/utils'
export type { ProColumnDef } from '@pro/utils'
export type { UseProTableReturn } from '@pro/table'
export type {
  UseProFormReturn,
  UseModalFormReturn,
  UseDrawerFormReturn,
  UseStepsFormReturn,
} from '@pro/form'
export type { DescriptionItem, UseProDescriptionsReturn } from '@pro/descriptions'
